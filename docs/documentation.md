# Employee Knowledge Assistant — Documentation

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Installation](#3-installation)
4. [Configuration](#4-configuration)
5. [Database Setup](#5-database-setup)
6. [Running the Application](#6-running-the-application)
7. [API Reference](#7-api-reference)
8. [Architecture](#8-architecture)
9. [RAG Pipeline](#9-rag-pipeline)
10. [Access Control](#10-access-control)
11. [Testing](#11-testing)
12. [Docker Deployment](#12-docker-deployment)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Overview

The Employee Knowledge Assistant is an AI-powered internal knowledge base that allows employees to ask natural language questions and get answers extracted from company documents. It is designed to be self-hosted, privacy-first, and requires no external API calls or internet access.

### Key Features

- **Document Management** — Upload PDF, DOCX, TXT, and CSV files. Documents are automatically indexed for search.
- **Smart Q&A** — Ask questions in natural language. Answers are extracted from relevant document chunks with source citations.
- **Department Access Control** — Documents are tagged by department (HR, Engineering, Finance, All). Users only see relevant documents.
- **Analytics Dashboard** — Track popular questions, unanswered queries, daily active users, and engagement metrics.
- **Admin Panel** — Document management, user overview, and analytics visualizations.
- **Extractive Answering** — No LLM API required. The system uses sentence embeddings and cosine similarity to find and surface relevant text chunks.

---

## 2. Prerequisites

### For Local Development

| Dependency | Minimum Version |
|------------|----------------|
| Python | 3.12+ |
| Node.js | 22+ |
| npm | 10+ |

### For Docker Deployment

| Dependency | Version |
|------------|---------|
| Docker | 24+ |
| Docker Compose | 2.24+ |

### Supported File Types for Upload

| Type | Extension | Library Used |
|------|-----------|-------------|
| PDF | `.pdf` | PyMuPDF (fitz) |
| Word | `.docx` | python-docx |
| Text | `.txt` | built-in |
| CSV | `.csv` | pandas |

---

## 3. Installation

### 3.1 Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/Mac
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# If you encounter build errors for psycopg2 on Windows:
pip install psycopg2-binary
```

### 3.2 Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# (Optional) Set API URL if backend is not on localhost:8000
# echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

---

## 4. Configuration

### Environment Variables

Copy `.env.example` (or create `.env`) in the `backend/` directory:

```bash
# backend/.env
DATABASE_URL=sqlite:///./data/dev.db
SECRET_KEY=change-this-secret-key-in-production
EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2
CORS_ORIGINS=http://localhost:3000
```

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./data/dev.db` | Database connection string. Use `postgresql://user:pass@host:5432/dbname` for production. |
| `SECRET_KEY` | `change-this...` | JWT signing key. Change to a random 32+ char string in production. |
| `EMBEDDINGS_MODEL` | `all-MiniLM-L6-v2` | Sentence-transformers model name for generating embeddings. |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated list of allowed CORS origins. |
| `CHROMA_PERSIST_DIR` | `./data/chromadb` | Directory for ChromaDB persistent storage. |

### Frontend Configuration

Set the `NEXT_PUBLIC_API_URL` environment variable in `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

If not set, the frontend defaults to `http://localhost:8000`.

---

## 5. Database Setup

### Development (SQLite)

The application auto-creates all tables on startup when using SQLite. No manual migration is needed.

### Production (PostgreSQL)

```bash
# Create the database
createdb employee_knowledge

# Run migrations
cd backend
alembic upgrade head
```

### Seed Demo Data

```bash
cd backend
.\venv\Scripts\activate
python scripts/seed.py
```

This creates sample users and documents:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | admin123 |
| HR | hr@company.com | hr123456 |
| Engineer | engineer@company.com | eng12345 |

Sample documents are loaded into the vector database in the HR and Engineering departments.

---

## 6. Running the Application

### 6.1 Local Development

**Terminal 1 — Backend:**

```bash
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

The API is available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

The app is available at `http://localhost:3000`.

### 6.2 Production

```bash
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

For the frontend, build and serve with a static server:

```bash
cd frontend
npm run build
npx serve@latest out -l 3000
```

---

## 7. API Reference

Full interactive API documentation is available at `/docs` when the backend is running.

### 7.1 Authentication

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "securepass123",
  "full_name": "John Doe",
  "department": "Engineering"
}
```

**Response:** `201 Created`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "admin123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "admin@company.com",
  "full_name": "Admin",
  "role": "admin",
  "department": "all",
  "is_active": true,
  "created_at": "2025-01-01T00:00:00"
}
```

### 7.2 Documents

#### Upload Document (Admin only)

```http
POST /api/documents/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: @document.pdf
title: "Employee Handbook 2025"
department: "HR"
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "Employee Handbook 2025",
  "file_type": "pdf",
  "department": "HR",
  "version": 1,
  "processing_status": "processing",
  "uploaded_at": "2025-01-01T00:00:00"
}
```

#### List Documents

```http
GET /api/documents/?department=HR&page=1&page_size=20
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Employee Handbook 2025",
      "file_type": "pdf",
      "department": "HR",
      "version": 1,
      "processing_status": "completed",
      "uploaded_at": "2025-01-01T00:00:00"
    }
  ],
  "total": 1
}
```

#### Get Document

```http
GET /api/documents/:id
Authorization: Bearer <token>
```

#### Delete Document (Admin only)

```http
DELETE /api/documents/:id
Authorization: Bearer <token>
```

Performs a soft delete (sets `is_active = False`).

#### Reprocess Document (Admin only)

```http
POST /api/documents/:id/reprocess
Authorization: Bearer <token>
```

Re-extracts text, re-chunks, and re-embeds the document.

### 7.3 Chats

#### Create Chat

```http
POST /api/chats/
Authorization: Bearer <token>
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "New Chat",
  "created_at": "2025-01-01T00:00:00"
}
```

#### List Chats

```http
GET /api/chats/
Authorization: Bearer <token>
```

#### Get Chat with Messages

```http
GET /api/chats/:id
Authorization: Bearer <token>
```

#### Send Message

```http
POST /api/chats/:id/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "What is the company policy on remote work?"
}
```

**Response:** `200 OK`
```json
{
  "message": {
    "id": "uuid",
    "role": "user",
    "content": "What is the company policy on remote work?"
  },
  "answer": {
    "id": "uuid",
    "role": "assistant",
    "content": "Based on the Employee Handbook, employees may work remotely up to 3 days per week with manager approval...",
    "sources": {
      "sources": [
        {
          "doc_title": "Employee Handbook 2025.pdf",
          "page_num": 12,
          "text_snippet": "Remote Work Policy: Employees may work remotely up to 3 days per week..."
        }
      ]
    }
  }
}
```

#### Submit Feedback

```http
POST /api/chats/messages/:id/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "feedback": true
}
```

`true` for thumbs up, `false` for thumbs down.

#### Delete Chat

```http
DELETE /api/chats/:id
Authorization: Bearer <token>
```

### 7.4 Analytics (Admin only)

#### Overview Stats

```http
GET /api/analytics/overview
Authorization: Bearer <token>
```

```json
{
  "total_users": 5,
  "total_documents": 12,
  "questions_today": 24,
  "unanswered_count": 3,
  "unanswered_percentage": 12.5
}
```

#### Popular Questions

```http
GET /api/analytics/popular-questions?limit=10
Authorization: Bearer <token>
```

#### User Activity

```http
GET /api/analytics/user-activity?days=30
Authorization: Bearer <token>
```

#### Unanswered Questions

```http
GET /api/analytics/unanswered
Authorization: Bearer <token>
```

---

## 8. Architecture

### 8.1 System Design

```
┌─────────────┐     ┌─────────────┐
│             │     │             │
│   Browser   │────▶│   Nginx     │
│             │     │   (:80)     │
└─────────────┘     └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
     ┌────────────────┐  ┌──────────────────┐
     │  /api/*        │  │  /*              │
     │  FastAPI       │  │  Next.js         │
     │  (:8000)       │  │  (:3000)         │
     └───────┬────────┘  └──────────────────┘
             │
      ┌──────┼──────┐
      │      │      │
      ▼      ▼      ▼
  ┌──────┐ ┌────┐ ┌────────┐
  │ Post │ │Chro│ │ File   │
  │ greS │ │maDB│ │ System │
  │ QL   │ │    │ │(Uploads│
  └──────┘ └────┘ └────────┘
```

### 8.2 Directory Layout

```
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app setup, middleware, startup
│   │   ├── api/                 # Route handlers
│   │   │   ├── __init__.py
│   │   │   ├── auth.py          # Register, login, me endpoints
│   │   │   ├── documents.py     # Upload, list, get, delete, reprocess
│   │   │   ├── chats.py         # Chat CRUD, messages, feedback
│   │   │   ├── analytics.py     # Overview, popular, activity, unanswered
│   │   │   └── deps.py          # Dependency injection (DB session, current user)
│   │   ├── core/                # Infrastructure
│   │   │   ├── config.py        # pydantic-settings configuration
│   │   │   ├── database.py      # SQLAlchemy engine, session, Base
│   │   │   ├── security.py      # JWT creation/verification, password hashing
│   │   │   └── jsonb_sqlite.py  # @compiles(JSONB, "sqlite") compatibility
│   │   ├── models/              # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── document.py
│   │   │   ├── chat.py
│   │   │   └── message.py
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   │   ├── auth.py
│   │   │   ├── document.py
│   │   │   ├── chat.py
│   │   │   └── analytics.py
│   │   ├── services/            # Business logic
│   │   │   ├── extractors/      # File-specific text parsers
│   │   │   │   ├── __init__.py  # Extractor factory
│   │   │   │   ├── pdf_extractor.py
│   │   │   │   ├── docx_extractor.py
│   │   │   │   ├── txt_extractor.py
│   │   │   │   └── csv_extractor.py
│   │   │   ├── chunker.py       # RecursiveCharacterTextSplitter wrapper
│   │   │   ├── embeddings.py    # SentenceTransformer model wrapper
│   │   │   ├── vector_store.py  # ChromaDB add/search/delete operations
│   │   │   ├── llm_service.py   # Extractive answer construction
│   │   │   ├── rag_pipeline.py  # Orchestration and off-topic detection
│   │   │   ├── document_service.py  # Document upload/processing orchestration
│   │   │   ├── chat_service.py  # Chat CRUD and message handling
│   │   │   └── analytics_service.py # Aggregation queries
│   │   └── utils/
│   │       └── file_handler.py  # File validation, sanitization, storage
│   ├── scripts/
│   │   └── seed.py              # Database seeding utility
│   ├── tests/                   # Pytest test suite (34 tests)
│   │   ├── conftest.py          # Fixtures (DB, client, auth headers)
│   │   ├── test_auth.py
│   │   ├── test_documents.py
│   │   ├── test_rag.py
│   │   └── test_chat_analytics.py
│   ├── alembic/                 # Migration versions
│   ├── alembic.ini
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   │   ├── layout.tsx       # Root layout with AuthProvider
│   │   │   ├── page.tsx         # Landing page (redirects to /chats)
│   │   │   ├── login/           # Login page
│   │   │   ├── register/        # Registration page
│   │   │   ├── chats/           # Chat interface (protected)
│   │   │   ├── dashboard/       # User dashboard (redirects to /chats)
│   │   │   └── admin/           # Admin panel (admin only)
│   │   │       ├── documents/   # Document management
│   │   │       ├── analytics/   # Analytics dashboard
│   │   │       └── users/       # User management
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── ChatSidebar.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── SourceCard.tsx
│   │   │   ├── UploadForm.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── AdminRoute.tsx
│   │   │   └── ...
│   │   └── lib/
│   │       ├── api.ts           # Axios client with JWT interceptor
│   │       └── auth-context.tsx # Auth state management (Context API)
│   ├── Dockerfile
│   ├── package.json
│   └── next.config.ts
├── docker/
│   └── nginx.conf               # Reverse proxy configuration
├── scripts/
│   ├── start-dev.bat
│   └── init.bat
├── sample-docs/                 # Demo documents for upload
├── docker-compose.yml
├── Dockerfile
├── .gitignore
├── LICENSE
├── CONTRIBUTING.md
├── README.md
└── AGENTS.md
```

---

## 9. RAG Pipeline

### 9.1 Overview

The Retrieval-Augmented Generation (RAG) pipeline is the core intelligence of the system. It converts user questions into answers by searching through document chunks using semantic similarity.

### 9.2 Document Processing Flow

```
Upload → Validate → Store File → Extract Text
                                    │
                                    ▼
                               Chunk Text
                              (512 chars, 50 overlap)
                                    │
                                    ▼
                           Generate Embeddings
                          (384-dim vectors)
                                    │
                                    ▼
                            Store in ChromaDB
```

### 9.3 Question Answering Flow

```
User Question
      │
      ▼
Off-Topic Detection ───→ "I can only answer company-related questions..."
      │ (company-related)
      ▼
Department Detection (keyword-based filtering)
      │
      ▼
Generate Question Embedding (384-dim)
      │
      ▼
ChromaDB Similarity Search (top-3 chunks)
      │
      ▼
Extractive Answer Construction
  - Group chunks by source document
  - Format with source citations
      │
      ▼
Response to User
```

### 9.4 Off-Topic Detection

The system uses keyword matching to detect non-company questions (weather, sports, movies, politics, etc.). If detected, it responds with:

> "I'm designed to answer questions about company policies, procedures, and internal knowledge. Please ask something related to our organization."

### 9.5 Embedding Model

- **Model:** `sentence-transformers/all-MiniLM-L6-v2`
- **Vector dimension:** 384
- **Similarity metric:** Cosine similarity
- **Chunk size:** 512 characters
- **Chunk overlap:** 50 characters

The model runs locally and does not require any API calls.

### 9.6 Answer Construction

When no relevant chunks are found (similarity below threshold), the system responds with:

> "I couldn't find relevant information in the available documents. Please try rephrasing your question or contact HR for assistance."

When chunks are found, they are grouped by document title, and the answer includes clickable source citations showing the document name, page number, and relevant snippet.

---

## 10. Access Control

### 10.1 Roles

| Role | Capabilities |
|------|-------------|
| **admin** | Full access: upload/delete documents, view analytics, manage users, all chats |
| **employee** | View documents in their department, ask questions, view their own chats |

### 10.2 Department Access

- Users are assigned a department at registration.
- Documents are tagged with a department (HR, Engineering, Finance, All).
- Employees see documents from their department plus "All" department.
- Admins see all documents.
- Chat questions can auto-detect department relevance through keyword matching.

### 10.3 Authentication Flow

```
Login → JWT issued → Stored in localStorage
         │
         ▼
   Every API request
         │
         ▼
   Axios interceptor adds Authorization header
         │
         ▼
   Backend validates JWT → extracts user → checks permissions
```

Tokens expire after a configurable duration (default: 30 days). On 401 response, the frontend automatically clears the token and redirects to `/login`.

---

## 11. Testing

### 11.1 Backend Tests

The backend has 34 pytest tests covering auth, documents, RAG pipeline, chats, and analytics.

```bash
cd backend
.\venv\Scripts\activate

# Run all tests
pytest -v

# Run with coverage
pytest --cov=app tests/ --cov-report=term-missing

# Run specific test file
pytest tests/test_auth.py -v

# Run specific test
pytest tests/test_rag.py::test_rag_pipeline -v
```

### 11.2 Test Structure

| File | Tests | Coverage |
|------|-------|----------|
| `test_auth.py` | Register, login, protected routes, role enforcement | Auth endpoints |
| `test_documents.py` | Upload, list, delete, reprocess, file validation | Document endpoints |
| `test_rag.py` | Text extraction, chunking, embeddings, vector search, RAG pipeline | RAG pipeline |
| `test_chat_analytics.py` | Chat CRUD, messages, feedback, analytics | Chat & analytics |

### 11.3 Frontend Tests

```bash
cd frontend
npm test
```

---

## 12. Docker Deployment

### 12.1 Prerequisites

- Docker 24+
- Docker Compose 2.24+

### 12.2 Quick Start

```bash
# Clone the repository
git clone https://github.com/nrkavya5-developer/employee-knowledge-assistant.git
cd employee-knowledge-assistant

# Start all services
docker compose up --build -d

# Wait for services to be healthy
docker compose ps

# Access the application
# http://localhost
```

### 12.3 Services

| Service | Image | Port | Health Check |
|---------|-------|------|-------------|
| `postgres` | postgres:15 | 5432 | `pg_isready` |
| `chromadb` | chromadb/chroma | 8001 | HTTP /health |
| `backend` | custom (./backend/Dockerfile) | 8000 | HTTP /api/health |
| `frontend` | custom (./frontend/Dockerfile) | 3000 | - |
| `nginx` | nginx:alpine | 80 | - |

### 12.4 Environment Variables for Docker

```bash
# backend/.env (mounted as volume in Docker)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/employee_knowledge
SECRET_KEY=your-secure-random-key-here
CORS_ORIGINS=http://localhost:3000
```

### 12.5 Production Checklist

- [ ] Change `SECRET_KEY` to a secure random string
- [ ] Set strong PostgreSQL passwords
- [ ] Configure SSL/TLS (reverse proxy with certbot/Let's Encrypt)
- [ ] Set `CORS_ORIGINS` to your frontend domain
- [ ] Enable persistent volumes for postgres and chromadb data
- [ ] Configure logging and monitoring

---

## 13. Troubleshooting

### 13.1 Backend won't start

**Issue:** `ModuleNotFoundError: No module named 'psycopg2'`

**Fix:** Install `psycopg2-binary` instead:

```bash
pip install psycopg2-binary
```

**Issue:** `sqlalchemy.exc.OperationalError: no such table`

**Fix:** Ensure the database directory exists and tables are created. The app auto-creates tables on startup for SQLite. For PostgreSQL, run:

```bash
alembic upgrade head
```

### 13.2 Frontend can't reach backend

**Issue:** API calls fail with network errors

**Fix:** Check that:
1. Backend is running on port 8000
2. `NEXT_PUBLIC_API_URL` is set correctly in `frontend/.env.local`
3. CORS origins include the frontend URL

### 13.3 File upload fails

**Issue:** "File type not allowed"

**Fix:** Only PDF, DOCX, TXT, and CSV files are supported. Check file extension matches the actual file type.

**Issue:** "File too large"

**Fix:** Maximum file size is 50 MB. Compress or split large documents.

### 13.4 Question returns no answer

**Issue:** "I couldn't find relevant information..."

**Fix:**
1. Upload documents relevant to the question
2. Ensure document processing completed (check `processing_status` in document listing)
3. Try rephrasing the question with different keywords
4. Check that the document's department matches the user's department

### 13.5 Embedding model download fails

**Issue:** First startup is slow or fails downloading the model

**Fix:** The `all-MiniLM-L6-v2` model (~80MB) is downloaded on first use. Ensure internet access for the first run, or pre-download:

```python
from sentence_transformers import SentenceTransformer
SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
```

The model is cached locally after download.

### 13.6 Docker issues

**Issue:** `docker compose up` fails with port conflicts

**Fix:** Change host ports in `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Map host port 8080 to container port 80
```

**Issue:** Backend container can't connect to PostgreSQL

**Fix:** Ensure the postgres service is healthy before the backend starts. The backend has a retry loop, but you can also add `depends_on` conditions.

### 13.7 Windows-specific

**Issue:** `.\venv\Scripts\Activate` fails with execution policy error

**Fix:**

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

**Issue:** `npm run dev` shows "connecting..." indefinitely

**Fix:** PowerShell blocks npm scripts. Use:

```cmd
cmd /c "npm run dev"
```

Or set the execution environment:

```powershell
$env:NODE_OPTIONS = "--experimental-vm-modules"
```

---

## License

[MIT](../LICENSE)

## Contributors

- [Vijay Kumar GK](https://github.com/vijaykumarGK-Developer)
- [Kavya NR](https://github.com/nrkavya5-developer)
