# AI StudyMate Ethiopia 🇪🇹

An intelligent, multilingual educational technology SaaS platform built for Ethiopian university and college students. AI StudyMate transforms course documents, lecture slides, and notes into interactive study sessions with grounded citations, flashcard decks, and practice exams.

Supported Languages:
- **English**
- **አማርኛ (Amharic)**
- **Afaan Oromoo**

---

## 🏗️ Architecture Overview

The platform uses a modular monolith architecture designed for reliability, affordability, and rapid iterative scaling:

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons, accessible UI components.
- **Backend**: FastAPI (Python 3.12), Pydantic v2, SQLAlchemy 2, AsyncPG.
- **Database**: PostgreSQL 18 with `pgvector` for vector similarity embeddings.
- **AI Abstraction Layer**: Pluggable provider system (`MockAIProvider`, `GeminiProvider`, `OpenAIProvider`).
- **File Storage**: Local filesystem abstraction with S3-compatible interface for future cloud migration.

---

## 📁 Repository Structure

```
ai-studymate/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── api/v1/           # REST API routes (health, auth, materials, chat, quiz)
│   │   ├── core/             # Configuration, database engine, security
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Business logic (AI, RAG, Parser, Storage)
│   │   └── tests/            # Automated pytest suite
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Backend environment template
├── frontend/                 # Next.js React frontend
│   ├── src/
│   │   ├── app/              # Next.js App Router pages and layouts
│   │   ├── components/       # UI components (Navbar, LanguageSelector, Cards)
│   │   ├── context/          # State & Language Context (en, am, om)
│   │   ├── locales/          # UI translation resource JSONs
│   │   └── lib/              # API clients and utilities
│   ├── package.json          # Node dependencies
│   └── tailwind.config.js    # Tailwind styling config
├── storage/                  # Local development file storage
│   └── uploads/              # Uploaded course documents
├── .env.example              # Master environment template
├── .gitignore                # Git ignore rules
└── README.md                 # Project documentation
```

---

## 🚀 Quickstart Guide

### Prerequisites
1. **Python 3.12+**
2. **Node.js 18+** & npm
3. **PostgreSQL 18**

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run FastAPI dev server:
uvicorn app.main:app --reload --port 8000
```
Open interactive API docs at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local

# Run Next.js dev server:
npm run dev
```
Open web app at [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest app/tests -v
```

### Frontend Build Check
```bash
cd frontend
npm run build
```
