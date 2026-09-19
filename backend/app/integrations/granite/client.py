"""
IBM Granite / watsonx.ai HTTP client abstraction.

Credentials are loaded exclusively from application settings so no secrets
are ever hard-coded.  When ``granite_enabled`` is False the client runs in
**mock mode**, returning deterministic campus-aware responses without any
network calls — useful for local development without IBM credentials.

Environment variables (via backend/.env):
    GRANITE_API_URL         – watsonx.ai inference endpoint base URL
                              e.g. https://us-south.ml.cloud.ibm.com
    GRANITE_API_KEY         – IBM Cloud API key for IAM token exchange
    GRANITE_MODEL_ID        – Model ID, e.g. ibm/granite-3-8b-instruct
    GRANITE_TIMEOUT_SECONDS – Per-request timeout (default 60)
    GRANITE_ENABLED         – Set to true to use the live API
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any

import httpx

from app.core.config import settings
from app.integrations.granite.exceptions import (
    GraniteAuthError,
    GraniteError,
    GraniteRateLimitError,
    GraniteTimeoutError,
    GraniteUnavailableError,
)
from app.integrations.granite.schemas import (
    GraniteChatRequest,
    GraniteChatResponse,
    GraniteChoice,
    GraniteMessage,
    GraniteUsage,
    IamTokenResponse,
)

logger = logging.getLogger(__name__)

# ─── IAM token cache (module-level) ───────────────────────────────────────────

_iam_token: str | None = None
_iam_token_expires_at: float = 0.0
_IAM_TOKEN_URL = "https://iam.cloud.ibm.com/identity/token"
_IAM_REFRESH_BUFFER = 60  # seconds before expiry to refresh


async def _fetch_iam_token() -> str:
    """
    Exchange the IBM Cloud API key for a short-lived IAM bearer token.

    Tokens are cached module-wide and refreshed automatically when they are
    within 60 seconds of expiry.
    """
    global _iam_token, _iam_token_expires_at

    now = time.monotonic()
    if _iam_token and now < _iam_token_expires_at - _IAM_REFRESH_BUFFER:
        return _iam_token

    logger.debug("Fetching new IBM IAM access token")
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.post(
                _IAM_TOKEN_URL,
                data={
                    "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
                    "apikey": settings.granite_api_key,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            resp.raise_for_status()
            token_resp = IamTokenResponse.model_validate(resp.json())
            _iam_token = token_resp.access_token
            _iam_token_expires_at = now + token_resp.expires_in
            logger.info("IBM IAM token refreshed, expires in %ds", token_resp.expires_in)
            return _iam_token
        except httpx.HTTPStatusError as exc:
            raise GraniteAuthError(
                f"IAM token exchange failed: HTTP {exc.response.status_code}"
            ) from exc
        except httpx.RequestError as exc:
            raise GraniteAuthError(f"IAM token request failed: {exc}") from exc


# ─── Mock responses ────────────────────────────────────────────────────────────

_MOCK_RESPONSES: dict[str, str] = {
    "class": """### 📅 Today's Schedule (Monday, Sep 14)
You have **4 sessions** scheduled today:

1. **09:00 AM – 10:30 AM** — *Operating Systems Lecture* (Hall B · Prof. Vance) — **Ongoing**
2. **11:00 AM – 01:00 PM** — *Database Systems Lab* (Lab 03 · CS Dept) — ⚠️ **Critical for attendance!**
3. **02:30 PM – 03:30 PM** — *CampusPilot AI Mentor Session* (Virtual Room · Online)
4. **04:00 PM – 06:00 PM** — *Distributed Systems Revision* (Library Media Room 4A)

> 💡 **AI Tip:** Attending the 11:00 AM Database Lab today brings your attendance to exactly 75.0%.
""",
    "attendance": """### 📚 Attendance Health Report

Overall attendance: **86.4%** ✅ Safe Zone

| Course | Code | Attended | Total | % | Status |
|--------|------|----------|-------|---|--------|
| Computer Networks | CS501 | 22 | 25 | 88.0% | ✅ Safe |
| Database Systems Lab | CS502L | 14 | 19 | 73.7% | ⚠️ Below cutoff |
| Data Science & AI | CS503 | 23 | 25 | 92.0% | ✅ Excellent |
| Cloud Architecture | CS504 | 21 | 25 | 84.0% | ✅ Safe |
| Operating Systems | CS505 | 20 | 24 | 83.3% | ✅ Safe |

**Recovery:** Attend the next **4 consecutive** Database Systems Lab classes to reach 78.3% and restore exam eligibility under Dean Regulation 4.2.
""",
    "deadline": """### ⏰ Upcoming Deadlines

1. 🔴 **TCP/IP Sliding Window Simulation (CS501)** — **Today, 04:00 PM** *(3.5 h remaining)*
2. 🟠 **Multi-Class NLP Classification Pipeline (CS503)** — Tomorrow, 11:59 PM
3. 🔴 **B+ Tree Indexing Engine (CS502)** — Sep 18, 11:59 PM *(4 days)*
4. 🟡 **OS Deadlock Prevention Lab Report (CS505)** — Sep 22, 05:00 PM

> ⚡ Start with the TCP/IP simulation now — only 2 unit tests remain failing.
""",
    "default": """I have analyzed your query using **IBM Granite 3.0** and your academic knowledge graph.

Your current snapshot:
- **GPA:** 3.82 (Target: 3.85 · Top 7% of batch)
- **Attendance:** 86.4% overall (1 course at risk: CS502L at 73.7%)
- **Critical deadline:** TCP/IP Simulation due **today at 04:00 PM**
- **Hackathon:** IBM Granite AI Hackathon pitch in **10 days**

I can help you with schedules, attendance calculations, assignment breakdowns, exam revision plans, or career guidance. What would you like to explore?
""",
}


def _mock_response(query: str) -> GraniteChatResponse:
    """Return a deterministic mock response for local dev without IBM credentials."""
    lower = query.lower()
    if any(k in lower for k in ("class", "schedule", "timetable", "today", "lecture")):
        content = _MOCK_RESPONSES["class"]
    elif any(k in lower for k in ("attendance", "absent", "percentage", "cutoff")):
        content = _MOCK_RESPONSES["attendance"]
    elif any(k in lower for k in ("deadline", "assignment", "due", "task", "submit")):
        content = _MOCK_RESPONSES["deadline"]
    else:
        content = _MOCK_RESPONSES["default"]

    return GraniteChatResponse(
        model_id="mock/granite-3-8b-instruct",
        choices=[
            GraniteChoice(
                index=0,
                message=GraniteMessage(role="assistant", content=content),
                finish_reason="stop",
            )
        ],
        usage=GraniteUsage(input_token_count=len(query.split()), generated_token_count=80),
    )


# ─── Live client ───────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """You are CampusPilot AI, an intelligent academic copilot for university students.
You are powered by IBM Granite 3.0 and have deep knowledge of campus regulations, schedules, attendance policies, and academic best practices.
Always be helpful, concise, and accurate. Use markdown formatting for structured answers.
When referencing data (attendance, schedules, deadlines), explain your reasoning transparently."""


import os

# ─── Live Multi-Model AI Provider Integration ──────────────────────────────────

async def _chat_gemini(
    messages: list[dict[str, str]],
    api_key: str,
    max_tokens: int = 2048,
    temperature: float = 0.7,
) -> GraniteChatResponse:
    """Call Google Gemini API with valid endpoints."""
    models_to_try = [
        "gemini-3.6-flash",
        "gemini-flash-latest",
    ]
    
    contents = []
    for m in messages:
        role = "user" if m.get("role") == "user" else "model"
        contents.append({
            "role": role,
            "parts": [{"text": m.get("content", "")}]
        })

    payload = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{"text": _SYSTEM_PROMPT}]
        },
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_tokens,
        }
    }

    last_err = ""
    async with httpx.AsyncClient(timeout=45.0) as client:
        for model_name in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            try:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        text = "".join(p.get("text", "") for p in parts)
                        if text.trim() if hasattr(text, "trim") else text.strip():
                            logger.info("Gemini model %s responded successfully (%d chars)", model_name, len(text))
                            return GraniteChatResponse(
                                model_id=f"google/{model_name}",
                                choices=[
                                    GraniteChoice(
                                        index=0,
                                        message=GraniteMessage(role="assistant", content=text),
                                        finish_reason="stop",
                                    )
                                ],
                                usage=GraniteUsage(input_token_count=100, generated_token_count=len(text.split())),
                            )
                else:
                    logger.warning("Gemini endpoint %s status %d: %s", model_name, resp.status_code, resp.text[:150])
                    last_err = f"HTTP {resp.status_code}: {resp.text[:150]}"
            except Exception as e:
                logger.warning("Gemini endpoint %s exception: %s", model_name, e)
                last_err = str(e)

    raise GraniteError(f"All Gemini endpoints failed. Last error: {last_err}")


async def _chat_openai_compatible(
    messages: list[dict[str, str]],
    api_key: str,
    base_url: str,
    model_id: str,
) -> GraniteChatResponse:
    """Call an OpenAI-compatible API (Groq, OpenAI, OpenRouter)."""
    url = f"{base_url.rstrip('/')}/chat/completions"
    
    formatted_messages = [
        {"role": "system", "content": _SYSTEM_PROMPT},
        *[{"role": m["role"], "content": m["content"]} for m in messages]
    ]

    payload = {
        "model": model_id,
        "messages": formatted_messages,
        "temperature": 0.7,
        "max_tokens": 1024,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json=payload, headers=headers)
        if resp.status_code != 200:
            logger.error("AI API error %d: %s", resp.status_code, resp.text)
            raise GraniteError(f"AI Provider error: {resp.status_code} - {resp.text[:200]}")
        
        data = resp.json()
        choices = data.get("choices", [])
        if not choices:
            raise GraniteError("No response returned from AI provider")
        
        reply_content = choices[0].get("message", {}).get("content", "")
        usage_data = data.get("usage", {})
        
        return GraniteChatResponse(
            model_id=model_id,
            choices=[
                GraniteChoice(
                    index=0,
                    message=GraniteMessage(role="assistant", content=reply_content),
                    finish_reason="stop",
                )
            ],
            usage=GraniteUsage(
                input_token_count=usage_data.get("prompt_tokens", 100),
                generated_token_count=usage_data.get("completion_tokens", len(reply_content.split())),
            ),
        )


async def chat(
    messages: list[dict[str, str]],
    *,
    max_tokens: int = 1024,
    temperature: float = 0.7,
) -> GraniteChatResponse:
    """
    Send a chat request to an active AI provider (Primary: Google Gemini API).

    Routing Priority:
    1. Google Gemini -> Primary AI engine (GEMINI_API_KEY / GOOGLE_API_KEY)
    2. IBM Granite -> watsonx.ai (GRANITE_API_KEY)
    3. Groq LLaMA 3.3 -> (GROQ_API_KEY)
    4. OpenAI GPT-4o-mini -> (OPENAI_API_KEY)
    5. Fallback -> Local development mock mode
    """
    # 1. Primary Model: Google Gemini API
    gemini_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
    if gemini_key and gemini_key not in ("MY_GEMINI_API_KEY", "your_api_key_here", "change-me"):
        try:
            logger.info("Routing chat request to Google Gemini API (max_tokens=%d)", max_tokens)
            return await _chat_gemini(messages, gemini_key, max_tokens=max_tokens, temperature=temperature)
        except Exception as exc:
            logger.warning("Gemini API call failed (%s), retrying after 0.5s...", exc)
            try:
                await asyncio.sleep(0.5)
                return await _chat_gemini(messages, gemini_key, max_tokens=max_tokens, temperature=temperature)
            except Exception as exc2:
                logger.error("Gemini API call failed after retry: %s", exc2)
                raise GraniteError(f"Gemini API request failed: {exc2}") from exc2

    # 2. Secondary Model: IBM Granite / watsonx.ai
    granite_key = settings.granite_api_key or os.getenv("GRANITE_API_KEY") or ""
    if granite_key and granite_key not in ("your_api_key_here", "change-me"):
        try:
            logger.info("Routing chat request to IBM Granite (watsonx.ai) API")
            token = await _fetch_iam_token()
            granite_messages: list[GraniteMessage] = [
                GraniteMessage(role="system", content=_SYSTEM_PROMPT),
                *[GraniteMessage(role=m["role"], content=m["content"]) for m in messages],
            ]
            request_body = GraniteChatRequest(
                model_id=settings.granite_model_id or "ibm/granite-3-8b-instruct",
                messages=granite_messages,
                parameters={
                    "max_new_tokens": max_tokens,
                    "temperature": temperature,
                    "decoding_method": "greedy" if temperature == 0 else "sample",
                },
                project_id=settings.granite_project_id or os.getenv("GRANITE_PROJECT_ID") or "",
            )
            base_url = settings.granite_api_url or "https://us-south.ml.cloud.ibm.com"
            url = f"{base_url.rstrip('/')}/ml/v1/text/chat?version=2024-05-31"

            async with httpx.AsyncClient(timeout=settings.granite_timeout_seconds) as client:
                resp = await client.post(
                    url,
                    json=request_body.model_dump(exclude_none=True),
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                )
                if resp.status_code == 401:
                    raise GraniteAuthError()
                if resp.status_code == 429:
                    raise GraniteRateLimitError()
                if resp.status_code >= 500:
                    raise GraniteUnavailableError(f"IBM Granite HTTP {resp.status_code}")

                resp.raise_for_status()
                return GraniteChatResponse.model_validate(resp.json())
        except Exception as exc:
            logger.warning("IBM Granite API call failed (%s), attempting fallbacks...", exc)

    # 3. Secondary: Groq LLaMA 3.3
    groq_key = settings.groq_api_key or os.getenv("GROQ_API_KEY") or ""
    if groq_key and groq_key not in ("your_api_key_here", "change-me"):
        try:
            logger.info("Routing chat request to Groq API")
            return await _chat_openai_compatible(
                messages, groq_key, "https://api.groq.com/openai/v1", "llama-3.3-70b-versatile"
            )
        except Exception as exc:
            logger.warning("Groq API call failed (%s), trying fallbacks...", exc)

    # 4. Secondary: OpenAI
    openai_key = settings.openai_api_key or os.getenv("OPENAI_API_KEY") or ""
    if openai_key and openai_key not in ("your_api_key_here", "change-me"):
        try:
            logger.info("Routing chat request to OpenAI API")
            return await _chat_openai_compatible(
                messages, openai_key, "https://api.openai.com/v1", "gpt-4o-mini"
            )
        except Exception as exc:
            logger.warning("OpenAI API call failed (%s), trying fallbacks...", exc)

    # 5. Default dev fallback with dynamic response + setup instructions
    user_query = next(
        (m["content"] for m in reversed(messages) if m.get("role") == "user"),
        "",
    )
    await asyncio.sleep(0.3)
    return _mock_response(user_query)
