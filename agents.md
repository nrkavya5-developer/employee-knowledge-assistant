# Agents & Subagents — Employee Knowledge Assistant

This document defines specialized agents and subagents for building and verifying the project. Each agent has a clear responsibility, toolset, and verification criteria.

---

## Building Agents (Build Phase)

### Agent A: Backend Architect (Python/FastAPI)

**Role:** Build all backend services, database models, and API endpoints.

#### Subagent A1 — Database Layer
- **Responsibility:** SQLAlchemy models, Alembic migrations, database session management
- **Input:** Schema design from plan.md (Section 5)
- **Output:** `backend/app/models/`, `backend/app/core/database.py`, migration files
- **Verification:** `alembic upgrade head` runs without error; tables exist in PostgreSQL
- **Tools:** SQLAlchemy, Alembic, psycopg2

#### Subagent A2 — Auth Service
- **Responsibility:** JWT token creation/verification, password hashing, role checks
- **Input:** Auth requirements (plan.md Section 10)
- **Output:** `backend/app/core/security.py`, `backend/app/api/auth.py`, `backend/app/api/deps.py`
- **Verification:** pytest tests for register, login, protected route access, role enforcement
- **Tools:** python-jose, passlib, bcrypt

#### Subagent A3 — Document Service
- **Responsibility:** File validation, upload, storage, document CRUD
- **Input:** Document schema, upload requirements
- **Output:** `backend/app/api/documents.py`, `backend/app/services/document_service.py`, `backend/app/utils/file_handler.py`
- **Verification:** Upload PDF → saved to disk + DB record; delete → soft-delete
- **Tools:** python-multipart, aiofiles

#### Subagent A4 — RAG Pipeline
- **Responsibility:** Document processing, chunking, embeddings, vector search, LLM answer generation
- **Input:** RAG pipeline design (plan.md Section 8)
- **Output:**
  - `backend/app/services/extractors/` (pdf, docx, txt, csv extractors)
  - `backend/app/services/chunker.py` (text splitting)
  - `backend/app/services/embeddings.py` (sentence-transformers)
  - `backend/app/services/vector_store.py` (ChromaDB operations)
  - `backend/app/services/llm_service.py` (HuggingFace model inference)
  - `backend/app/services/rag_pipeline.py` (orchestrator)
- **Verification:** Upload document → chunks in ChromaDB → ask question → answer with sources
- **Tools:** PyMuPDF, python-docx, pandas, langchain-text-splitters, sentence-transformers, chromadb, transformers, torch

#### Subagent A5 — Chat Service
- **Responsibility:** Chat CRUD, message storage, feedback collection
- **Input:** Chat schema, RAG pipeline integration
- **Output:** `backend/app/api/chats.py`, `backend/app/services/chat_service.py`
- **Verification:** Create chat → send message → get answer → submit feedback
- **Tools:** FastAPI, SQLAlchemy

#### Subagent A6 — Analytics Service
- **Responsibility:** Event tracking, aggregation queries, dashboard data
- **Input:** Analytics requirements (plan.md Phase 6)
- **Output:** `backend/app/api/analytics.py`, `backend/app/services/analytics_service.py`
- **Verification:** Endpoints return correct stats matching seeded data
- **Tools:** SQLAlchemy aggregation queries

---

### Agent B: Frontend Engineer (React/Next.js)

**Role:** Build all user-facing pages, components, and state management.

#### Subagent B1 — Auth UI
- **Responsibility:** Login/Register pages, auth context provider, protected routes
- **Input:** Auth API endpoints, design requirements
- **Output:**
  - `frontend/src/app/login/page.tsx`
  - `frontend/src/app/register/page.tsx`
  - `frontend/src/lib/auth-context.tsx`
  - `frontend/src/components/ProtectedRoute.tsx`
- **Verification:** User can register, login, token stored, protected route redirects
- **Tools:** React Hook Form, Axios, Context API

#### Subagent B2 — Chat Interface
- **Responsibility:** Chat list sidebar, chat window, message bubbles, source citations
- **Input:** Chat API endpoints, UX design
- **Output:**
  - `frontend/src/app/chats/page.tsx`
  - `frontend/src/app/chats/[id]/page.tsx`
  - `frontend/src/components/ChatWindow.tsx`
  - `frontend/src/components/MessageBubble.tsx`
  - `frontend/src/components/SourceCard.tsx`
  - `frontend/src/components/ChatSidebar.tsx`
- **Verification:** Type question → loading state → answer with collapsible sources
- **Tools:** React, Tailwind CSS, Axios

#### Subagent B3 — Admin Panel
- **Responsibility:** Document management page, analytics dashboard, user management
- **Input:** Admin API endpoints, design requirements
- **Output:**
  - `frontend/src/app/admin/documents/page.tsx`
  - `frontend/src/app/admin/analytics/page.tsx`
  - `frontend/src/app/admin/users/page.tsx`
  - `frontend/src/components/UploadForm.tsx`
  - `frontend/src/components/StatsCard.tsx`
  - `frontend/src/components/PopularQuestionsChart.tsx`
  - `frontend/src/components/UserActivityChart.tsx`
- **Verification:** Admin can upload doc → see it listed → delete it; analytics charts show data
- **Tools:** React-dropzone, Recharts, Tailwind CSS

#### Subagent B4 — API Integration Layer
- **Responsibility:** Axios client with JWT interceptor, typed API functions, error handling
- **Input:** All API endpoint specifications
- **Output:** `frontend/src/lib/api.ts` (typed functions for every endpoint)
- **Verification:** Every frontend page successfully calls APIs and handles errors
- **Tools:** Axios, TypeScript

---

### Agent C: Infrastructure Engineer

**Role:** Set up Docker, Docker Compose, and deployment configuration.

#### Subagent C1 — Docker Setup
- **Responsibility:** Dockerfiles for backend and frontend, Docker Compose orchestration
- **Input:** Service requirements, port mappings
- **Output:**
  - `backend/Dockerfile`
  - `frontend/Dockerfile` (multi-stage: build + run)
  - `docker-compose.yml` (postgres, chromadb, backend, frontend, nginx)
- **Verification:** `docker compose up --build` starts all services; health checks pass
- **Tools:** Docker, Docker Compose

#### Subagent C2 — Nginx Config
- **Responsibility:** Reverse proxy, static file serving, CORS headers
- **Input:** Service URLs, port mappings
- **Output:** `docker/nginx.conf`
- **Verification:** Frontend routes to /, API routes to /api
- **Tools:** Nginx

---

## Verification Agents (QA Phase)

### Agent D: Backend Tester

**Role:** Write and execute pytest tests for all backend functionality.

#### Subagent D1 — Auth Tests
- **Test Cases:**
  - Register with valid data → 201 + JWT
  - Register with duplicate email → 400
  - Login with valid credentials → 200 + JWT
  - Login with wrong password → 401
  - Access protected route without token → 401
  - Access admin route as employee → 403
- **Mocking:** None (real DB operations)

#### Subagent D2 — Document Tests
- **Test Cases:**
  - Upload PDF → 201 + document record
  - Upload invalid file type → 400
  - Upload without admin role → 403
  - List documents → 200 + paginated list
  - Soft delete document → 200 + is_active=False
- **Mocking:** File system operations

#### Subagent D3 — RAG Tests
- **Test Cases:**
  - Text extraction from PDF/DOCX/TXT/CSV
  - Chunking produces correct chunk sizes and overlap
  - Embeddings generation returns 384-dim vectors
  - ChromaDB add + search + delete operations
  - RAG pipeline returns answer with at least 1 source citation
- **Mocking:** LLM service (mock model to return fixed answer)

#### Subagent D4 — Chat & Analytics Tests
- **Test Cases:**
  - Create chat → 201
  - Send message → 200 + answer message
  - Get chat history → 200 + ordered messages
  - Submit feedback → 200
  - Analytics overview returns correct counts
- **Mocking:** RAG pipeline (mock for faster tests)

---

### Agent E: Frontend Tester

**Role:** Write and execute Jest + React Testing Library tests.

#### Subagent E1 — Component Tests
- **Test Cases:**
  - LoginForm: renders fields, validates empty, shows error on bad credentials
  - MessageBubble: renders user/assistant differently, shows sources
  - SourceCard: renders doc title, page, snippet, collapsible
  - UploadForm: validates file type, shows progress
  - StatsCard: renders value, label, icon
- **Mocking:** Axios (mock API responses)

#### Subagent E2 — Page Tests
- **Test Cases:**
  - LoginPage: form submission calls API, on success redirects
  - AdminDocumentsPage: renders document table, delete works
  - ChatPage: renders sidebar + window, sends message
- **Mocking:** next/navigation, Axios

#### Subagent E3 — Integration Tests
- **Test Cases:**
  - Full auth flow: visit /login → fill form → submit → redirected to /dashboard
  - Protected route: visit /admin without token → redirected to /login
  - Admin flow: login as admin → upload doc → see in list
- **Mocking:** Axios, localStorage

---

### Agent F: E2E Tester

**Role:** Write Playwright tests for critical user journeys.

#### Subagent F1 — Auth Flow
- **Scenario:** Register new user → logout → login → verify protected access
- **Asserts:** Redirects, token persistence, user name displayed

#### Subagent F2 — Q&A Flow
- **Scenario:** Login → create chat → type question → wait for answer → see sources → give feedback
- **Asserts:** Answer appears, sources visible, feedback registered

#### Subagent F3 — Admin Flow
- **Scenario:** Login as admin → navigate to /admin/documents → upload PDF → verify in list → delete
- **Asserts:** Upload success toast, document in table, delete confirmation, removed from table

---

## Agent Task Allocation Matrix

| Block | Build Agent | Verify Agent |
|-------|-------------|--------------|
| Block 1: Scaffolding | C1 (Docker) | D1-D4 (smoke test) |
| Block 2: Database | A1 | D1 (table existence) |
| Block 3: Auth | A2, B1 | D1, E1, F1 |
| Block 4: Documents | A3, B3 | D2, E2, F3 |
| Block 5: Processing | A4 (extractors + chunker) | D3 |
| Block 6: Vector DB | A4 (embeddings + ChromaDB) | D3 |
| Block 7: RAG Pipeline | A4 (orchestrator), A5 | D3, D4 |
| Block 8: Chat UI | B2, B4 | E2, E3, F2 |
| Block 9: Analytics | A6, B3 | D4, E2 |
| Block 10: Access Control | A3, A4, B3 | D2, D3, F3 |
| Block 11: Testing | D1-D4, E1-E3, F1-F3 | Manual review |
| Block 12: Deployment | C1, C2 | F1-F3 (on deployed stack) |

---

## Agent Communication Protocol

```
Build Agent → completes work
    ↓
Work is committed to feature branch
    ↓
Verification Agent → runs tests on the branch
    ↓
Pass → Merge to main
Fail → Bug report sent back to Build Agent
```

### Communication Channels
- **Bug reports:** Written as GitHub Issues with reproduction steps
- **Code review:** Pull request with checklist per subagent
- **API changes:** Documented in OpenAPI spec before frontend implementation

---

## Quality Gates

| Gate | Criteria | Blocking? |
|------|----------|-----------|
| Lint | No TypeScript errors, Python flake8 passes | Yes |
| Unit Tests | All tests pass, coverage > 80% | Yes |
| Integration Tests | All API endpoints respond correctly | Yes |
| E2E Tests | Critical user journeys work | Yes |
| Security Scan | No hardcoded secrets, no SQL injection vectors | Yes |
| Accessibility | Tab navigation works, alt text on images | No (Phase 2) |
| Performance | RAG response < 10 seconds | No (Phase 2) |
