# 🚀 CampusPilot – AI-Powered Student Success Platform

> **Your Academic & Career Copilot**  
> One intelligent platform that helps students manage academics, improve productivity, and prepare for placements using AI.

---

# 👥 Team

| Field | Value |
|-------|-------|
| **Team Name** | MindForge |
| **Track** | AI |
| **Team Lead** | Harshil Parmar — 25dce069@charusat.edu.in |
| **Members** | Aarnav, Krishna Gajara, Hevin Jajadiya |

---

# 🎯 Problem Statement

Students today rely on multiple disconnected platforms such as Google Classroom, Gmail, WhatsApp groups, college portals, placement portals, and personal notes to manage their academic journey.

As a result, students frequently:

- Miss assignment deadlines
- Forget important notices
- Fail to track attendance
- Struggle to prioritize study tasks
- Lack personalized guidance
- Prepare inefficiently for placements

Faculty and mentors also lack a centralized system to monitor student progress and provide timely interventions.

CampusPilot solves this by providing a **single AI-powered academic assistant** that understands a student's workload and proactively recommends what they should do next.

---

# 💡 Solution

CampusPilot is an **AI-Powered Student Success Platform** that centralizes academic, personal, and career information into one intelligent dashboard.

Instead of forcing students to manually organize their schedules, CampusPilot continuously analyzes their academic data and generates personalized recommendations.

The platform provides:

- Smart AI Study Planning
- Attendance Monitoring
- Assignment Tracking
- Personalized Dashboard
- Career Readiness Analysis
- AI Academic Assistant
- Academic Risk Detection
- Intelligent Recommendations

CampusPilot transforms scattered academic information into actionable insights that improve productivity and academic performance.

---

# ✨ Key Features

## 🎓 AI Study Copilot

- Personalized study plans
- Daily task prioritization
- Exam preparation strategy
- Revision scheduling

---

## 🤖 AI Academic Assistant

Powered by IBM Granite.

Supports:

- Academic doubts
- Study guidance
- Coding help
- Career guidance
- Semester planning
- Personalized recommendations

---

## 📊 Smart Dashboard

Real-time dashboard showing:

- Attendance
- Assignments
- Today's classes
- Upcoming deadlines
- Notifications
- Academic Health Score
- Productivity insights

---

## 📚 Assignment Management

- Upcoming assignments
- Completed assignments
- Priority tracking
- Progress monitoring
- Submission status

---

## 📝 Notes Management

- Personal notes
- Upload & organize notes
- AI explanation
- AI summarization
- AI-generated flashcards

---

## 📅 Timetable

- Weekly schedule
- Today's classes
- Upcoming lectures
- Events

---

## 📈 Attendance Analytics

- Overall attendance
- Subject-wise attendance
- Charts & insights
- Attendance prediction
- Risk alerts

---

## 👤 Student Profile

- Personal details
- Academic details
- Department
- Semester
- Profile customization

---

## ⚙️ Settings

- Theme switching
- Dark / Light Mode
- Accessibility options
- Security settings

---

## 🔐 Authentication

- JWT Authentication
- Secure Login
- Registration
- Protected Routes
- Token Refresh
- Remember Me
- Google OAuth Ready

---

# 🛠️ Tech Stack

| Category | Technologies |
|------------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, React Query, Framer Motion, Recharts |
| **Backend** | FastAPI, SQLAlchemy, Alembic, JWT Authentication, Pydantic |
| **AI** | IBM Granite, watsonx.ai |
| **Database** | SQLite (Development), PostgreSQL Ready |
| **Authentication** | JWT, Google OAuth |
| **Deployment Ready** | Docker, Docker Compose |
| **Version Control** | Git & GitHub |

---

# 🏗️ Architecture

```
Frontend (React)

↓

Axios API Layer

↓

FastAPI Backend

↓

Authentication (JWT)

↓

Business Services

↓

SQLAlchemy ORM

↓

Database

↓

IBM Granite AI
```

---

# 📁 Repository Structure

```
CampusPilot/

├── backend/
│   ├── app/
│   ├── alembic/
│   ├── tests/
│   └── requirements.txt
│
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── layouts/
│   └── types/
│
├── architecture/
├── assets/
├── public/
├── scripts/
├── docs/
├── presentation/
├── demo/
├── submission.yaml
├── docker-compose.yml
└── README.md
```

---

# ⚡ Getting Started

## Clone Repository

```bash
git clone https://github.com/harshilparmar2608/bob-ai-hackathon-MindForge.git

cd bob-ai-hackathon-MindForge
```

---

## Backend Setup

```bash
cd backend

python -m venv .venv

.venv\Scripts\activate

pip install -r requirements.txt

copy .env.example .env
```

Run backend

```bash
uvicorn app.main:app --reload
```

Backend runs at

```
http://localhost:8000
```

Swagger

```
http://localhost:8000/docs
```

---

## Frontend Setup

```bash
npm install

npm run dev
```

Frontend runs at

```
http://localhost:5173
```

---

# 🖥️ Demo

| Artifact | Link |
|-----------|------|
| 📹 Demo Video | demo/demo-video-link.txt |
| 🌐 Live Demo | demo/live-demo-url.txt |
| 📊 Presentation | presentation/slides.pdf |
| 🖼️ Screenshots | demo/screenshots |

---

# 🔐 Authentication

CampusPilot includes:

- JWT Authentication
- Login
- Registration
- Token Refresh
- Protected Routes
- Remember Me
- Google OAuth Integration

---

# 🤖 IBM Granite AI

CampusPilot integrates IBM Granite to provide:

- Personalized study planning
- Academic guidance
- Career recommendations
- Intelligent question answering
- Student-aware responses
- Assignment assistance

---

# 🚀 Future Scope

- LMS Integration
- Google Classroom Sync
- Gmail Integration
- Outlook Integration
- Calendar Synchronization
- Push Notifications
- Placement Portal Integration
- Mobile Application
- Faculty Dashboard
- Parent Portal
- Analytics Dashboard

---

# ⚠️ Current Limitations

- Google OAuth setup requires production credentials.
- External LMS integrations are planned for future releases.
- AI recommendations improve as more academic data becomes available.
- SQLite is used for local development (PostgreSQL recommended for production).

---

# 🏅 What We're Most Proud Of

CampusPilot is more than a student dashboard—it's an intelligent academic companion that combines modern UI, secure authentication, personalized analytics, and IBM Granite AI into one seamless platform. We transformed scattered academic workflows into a unified, AI-driven experience where every recommendation is tailored to the authenticated student. Our focus on user experience, scalable architecture, and meaningful AI assistance makes CampusPilot a practical solution for improving student productivity and success.

---

# ❤️ Built for

**BOB AI Hackathon 2026**

**Team MindForge**

*"Empowering every student with AI-driven academic success."*
