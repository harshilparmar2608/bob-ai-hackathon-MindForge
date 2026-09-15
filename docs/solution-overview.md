# Solution Overview

## What We Built

CampusPilot is a **single AI-powered dashboard that acts like a personal academic and career assistant for students**. It brings assignments, exams, deadlines, study materials, and career activities together, then analyzes them to tell students **what to do next, what needs attention, and why**—while creating personalized study plans, identifying academic risks, and recommending relevant internships, skills, and placement opportunities.

## How It Works

1. **Collects student information** — CampusPilot brings assignments, exams, deadlines, notes, skills, goals, and career activities into one dashboard.
2. **Understands and organizes the data** — AI reads the information, identifies important tasks, deadlines, weak subjects, and upcoming academic or career milestones.
3. **Prioritizes what matters most** — The system analyzes urgency, student performance, workload, and goals to determine what the student should focus on next.
4. **Creates personalized recommendations** — It generates study plans, revision schedules, reminders, improvement actions, and career recommendations tailored to each student.
5. **Explains every recommendation** — CampusPilot tells the student *why* a task or recommendation is important, helping them make informed decisions and stay on track.


## Architecture Diagram

> See [`architecture.md`](architecture.md) for the detailed diagram.

[Optionally include a simple ASCII or Mermaid diagram here for quick reference.]

```
[User] → [Frontend: React] → [API: FastAPI] → [watsonx.ai] → [Dashboard]
                                    ↓
                             [PostgreSQL DB]
```

## Key Design Decisions

| Decision | Rationale |
|---|---|
| [e.g., Used watsonx.ai for anomaly detection] | [e.g., Pre-trained models reduced time-to-value vs. building from scratch] |
| [Decision 2] | [Rationale 2] |
| [Decision 3] | [Rationale 3] |

## IBM Technologies Used

[Explain specifically HOW you used each IBM technology — not just that you used it.]

- **[IBM Tech 1, e.g., watsonx.ai]:** [How it was used — e.g., "Used the `ibm/granite-13b-instruct-v2` model via the Python SDK to classify anomaly types from log text."]
- **[IBM Tech 2]:** [How it was used]
