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


async def chat(
    messages: list[dict[str, str]],
    *,
    max_tokens: int = 1024,
    temperature: float = 0.7,
) -> GraniteChatResponse:
    """
    Send a chat request to IBM Granite and return the response.

    Falls back to a mock response when ``granite_enabled`` is False or when
    credentials are not configured.

    Parameters
    ----------
    messages:
        List of ``{"role": "user"|"assistant", "content": "..."}`` dicts.
    max_tokens:
        Maximum tokens in the completion.
    temperature:
        Sampling temperature (0 = deterministic, 1 = creative).
    """
    if not settings.granite_enabled or not settings.granite_api_key:
        logger.info("Granite disabled or no API key — returning mock response")
        user_query = next(
            (m["content"] for m in reversed(messages) if m.get("role") == "user"),
            "",
        )
        # Simulate slight network latency in dev
        await asyncio.sleep(0.3)
        return _mock_response(user_query)

    # ── Live path ────────────────────────────────────────────────────────────
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
        project_id="",  # set via env if required by your watsonx instance
    )

    url = f"{settings.granite_api_url.rstrip('/')}/ml/v1/text/chat?version=2024-05-31"

    logger.info(
        "Sending Granite chat request model_id=%s messages=%d",
        request_body.model_id,
        len(granite_messages),
    )

    async with httpx.AsyncClient(timeout=settings.granite_timeout_seconds) as client:
        try:
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
                raise GraniteUnavailableError(
                    f"Granite service returned HTTP {resp.status_code}"
                )

            resp.raise_for_status()
            raw: dict[str, Any] = resp.json()
            result = GraniteChatResponse.model_validate(raw)

            logger.info(
                "Granite response received tokens=%d",
                result.usage.generated_token_count,
            )
            return result

        except httpx.TimeoutException as exc:
            raise GraniteTimeoutError() from exc
        except httpx.RequestError as exc:
            raise GraniteUnavailableError(f"Network error reaching Granite: {exc}") from exc
        except (GraniteError, GraniteAuthError, GraniteRateLimitError):
            raise
        except Exception as exc:
            logger.exception("Unexpected Granite error: %s", exc)
            raise GraniteError(f"Unexpected error: {exc}") from exc
