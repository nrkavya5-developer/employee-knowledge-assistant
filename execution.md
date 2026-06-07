# Execution Plan — Employee Knowledge Assistant

The entire project is broken into **12 blocks**, each with **subblocks** for incremental, testable delivery.

---

## Block 1: Project Scaffolding

### Subblock 1.1 — Initialize Repository & Folder Structure
- Create root folder `employee-knowledge-assistant/`
- Create subfolders: `frontend/`, `backend/`, `docker/`
- Initialize Git repository
- Create `.gitignore` (Python + Node + .env + __pycache__)

### Subblock 1.2 — Backend Scaffolding (FastAPI)
- Create `backend/` with:
  - `app/` package
  - `app/main.py` (FastAPI app instance)
  - `app/core/config.py` (settings via pydantic-settings)
  - `app/core/security.py` (JWT + password hashing)
  - `app/core/database.py` (SQLAlchemy engine + session)
  - `app/models/` (SQLAlchemy ORM models)
  - `app/schemas/` (Pydantic request/response models)
  - `app/api/` (route modules)
  - `app/services/` (business logic layer)
  - `app/utils/` (helpers)
  - `requirements.txt` (all Python dependencies)
- Verify: `uvicorn app.main:app` starts without error

### Subblock 1.3 — Frontend Scaffolding (Next.js)
- Run `npx create-next-app@latest frontend --typescript --tailwind --app`
- Install additional deps: axios, react-hook-form, lucide-react, recharts
- Configure `tsconfig.json` path aliases (`@/` → `src/`)
- Create folder structure: `src/components/`, `src/lib/`, `src/types/`, `src/store/`
- Verify: `npm run dev` starts without error

### Subblock 1.4 — Docker Compose Setup
- Create `docker-compose.yml` with:
  - `postgres:15` service (port 5432)
  - `chromadb/chroma` service (port 8000)
- Create `backend/Dockerfile`
- Create `frontend/Dockerfile` (multi-stage build)
- Verify: `docker compose up` starts all services

---

## Block 2: PostgreSQL Database

### Subblock 2.1 — Database Schema (SQLAlchemy Models)
- Implement models in `backend/app/models/`:
  - `user.py` — User model (id, email, password_hash, full_name, role, department, created_at)
  - `document.py` — Document model (id, title, file_type, file_path, department, uploaded_by, version, uploaded_at, is_active)
  - `chat.py` — Chat model (id, user_id, title, created_at, updated_at)
  - `message.py` — Message model (id, chat_id, role, content, sources, feedback, created_at)
  - `analytics_event.py` — Analytics event model (id, event_type, user_id, metadata, created_at)
- Add relationships between models
- Create `__init__.py` that imports all models for Alembic auto-detection

### Subblock 2.2 — Alembic Migrations
- Initialize Alembic: `alembic init alembic`
- Configure `alembic/env.py` to use SQLAlchemy models
- Generate initial migration: `alembic revision --autogenerate -m "initial"`
- Apply migration: `alembic upgrade head`
- Verify: tables exist in PostgreSQL

### Subblock 2.3 — Session & Dependency Injection
- Implement `get_db()` dependency in `backend/app/core/database.py`
- Create `get_current_user()` dependency using JWT decoding
- Create `require_admin()` dependency (role check)
- Verify: dependency chain works via test endpoint

---

## Block 3: Authentication & Authorization

### Subblock 3.1 — JWT Implementation (`backend/app/core/security.py`)
- `create_access_token(data, expires_delta)` — sign JWT
- `verify_password(plain, hash)` — bcrypt verification
- `get_password_hash(password)` — bcrypt hashing
- `decode_token(token)` — verify and decode JWT
- Store secret key in environment variable

### Subblock 3.2 — Auth API Routes (`backend/app/api/auth.py`)
- `POST /api/auth/register` — create user, return JWT
- `POST /api/auth/login` — validate credentials, return JWT
- `GET /api/auth/me` — return current user profile (requires token)
- Validate: email format, password length (min 8), duplicate email check

### Subblock 3.3 — Auth Frontend Pages
- `/login` page — email + password form, stores JWT in localStorage
- `/register` page — registration form
- Auth context/provider — wraps app, provides user state, handles token refresh
- Protected route wrapper — redirects to /login if no token
- Verify: user can register, login, and see protected pages

### Subblock 3.4 — Role-Based Middleware
- Backend: `require_admin()` dependency in `backend/app/api/deps.py`
- Frontend: Admin route guard component
- Frontend: Conditional UI rendering based on role
- Verify: employee cannot access admin routes

---

## Block 4: Document Upload & Management

### Subblock 4.1 — File Validation & Storage
- `backend/app/utils/file_handler.py`:
  - Validate file extension (pdf, docx, txt, csv only)
  - Validate file size (max 50MB)
  - Save file to `uploads/{department}/{uuid}_{original_name}`
  - Return file path, size, type

### Subblock 4.2 — Document API Routes (`backend/app/api/documents.py`)
- `POST /api/documents/upload` — upload file (Admin only)
- `GET /api/documents/` — list all documents (Admin + department-filtered)
- `GET /api/documents/{id}` — get single document details
- `DELETE /api/documents/{id}` — soft-delete (set is_active=False)
- `POST /api/documents/{id}/reprocess` — re-process document (for versioning)
- All routes require authentication

### Subblock 4.3 — Document Management UI (Admin)
- `/admin/documents` page:
  - Upload button with drag-and-drop (react-dropzone)
  - Document table: title, type, date, status
  - Delete button with confirmation
  - Department filter dropdown
- Verify: Admin can upload, view, and delete documents

---

## Block 5: Document Processing & Chunking

### Subblock 5.1 — Text Extractors (`backend/app/services/extractors/`)
- `pdf_extractor.py` — PyMuPDF (fitz): extract text + page numbers
- `docx_extractor.py` — python-docx: extract text
- `txt_extractor.py` — raw text read
- `csv_extractor.py` — pandas: read and convert rows to text
- Factory function `extract_text(file_path, file_type)` → returns `[(page_num, text), ...]`

### Subblock 5.2 — Chunking Service (`backend/app/services/chunker.py`)
- `RecursiveCharacterTextSplitter` from langchain-text-splitters
- Configuration: chunk_size=512, chunk_overlap=50
- Separators: ["\n\n", "\n", ". ", " ", ""]
- Preserve page number metadata per chunk
- Return: `list[dict]` with text, page_num, doc_id, chunk_index

### Subblock 5.3 — Processing Pipeline (`backend/app/services/document_processor.py`)
- Orchestrate: extract → chunk → embed → store
- Triggered after successful upload
- Store processing status (pending, processing, completed, failed)
- Handle errors gracefully — mark document as failed + store error message
- Verify: uploaded PDF gets processed and chunks stored in ChromaDB

---

## Block 6: Embeddings & Vector Database

### Subblock 6.1 — Embeddings Service (`backend/app/services/embeddings.py`)
- Load `sentence-transformers/all-MiniLM-L6-v2` model
- `generate_embeddings(texts: list[str])` → returns list of 384-dim vectors
- Batch processing for large document sets
- Cache model in memory after first load

### Subblock 6.2 — ChromaDB Service (`backend/app/services/vector_store.py`)
- Initialize ChromaDB client (persistent at `backend/data/chroma/`)
- `add_document_chunks(chunks, embeddings, metadata)` — store chunks with embeddings
- `search_similar(query_embedding, department_filter, top_k=5)` — cosine similarity search
- `delete_document_chunks(doc_id)` — remove all chunks for a document
- Return: chunks with text, page_num, doc_title, score

### Subblock 6.3 — Integration Test
- Upload sample PDF/DOCX
- Verify: chunks appear in ChromaDB
- Verify: similarity search returns relevant chunks
- Verify: delete removes chunks

---

## Block 7: RAG Pipeline — Q&A

### Subblock 7.1 — LLM Service (`backend/app/services/llm_service.py`)
- Load free open-source model: `google/flan-t5-base` or `microsoft/phi-2`
- `generate_answer(question, context_chunks)`:
  - Format prompt: "Based on the following documents:\n{context}\n\nQuestion: {question}\nAnswer:"
  - Generate with `max_new_tokens=256`
  - Return answer text
- Fallback: If HuggingFace model too large, use `transformers` pipeline with smaller model

### Subblock 7.2 — RAG Orchestrator (`backend/app/services/rag_pipeline.py`)
- `answer_question(question, department, chat_history)`:
  1. Embed question using `embeddings_service`
  2. Search ChromaDB with department filter
  3. Assemble context from top-5 chunks
  4. If chat history exists, include last 2 exchanges
  5. Call `llm_service.generate_answer`
  6. Return: `{answer, sources: [{doc_title, page_num, text_snippet}]}`
- Handle edge cases: no results, ambiguous questions

### Subblock 7.3 — Chat API Routes (`backend/app/api/chats.py`)
- `POST /api/chats/` — create new chat
- `GET /api/chats/` — list user's chats
- `GET /api/chats/{id}` — get chat with messages
- `POST /api/chats/{id}/messages` — send message, run RAG, store response
- `POST /api/messages/{id}/feedback` — submit thumbs up/down
- Verify: full Q&A flow works end-to-end

---

## Block 8: Frontend — Chat Interface

### Subblock 8.1 — Chat List Sidebar
- `/chats` page: list of user's chats with titles
- Create new chat button
- Delete chat option
- Active chat highlighting
- Responsive: collapsible on mobile

### Subblock 8.2 — Chat Window (`/chats/{id}`)
- Message list with alternating user/assistant bubbles
- Message input with send button (Enter to send)
- Loading indicator while RAG processes
- Source citations displayed as collapsible cards below each answer
- Sources show: document name, page number, text snippet

### Subblock 8.3 — Chat Context & API Integration
- `src/lib/api.ts` — Axios client with JWT interceptor
- API functions: createChat, getChats, getChat, sendMessage, submitFeedback
- Optimistic UI updates for messages
- Auto-scroll to latest message
- Verify: typing a question → sees answer with sources

---

## Block 9: Admin Dashboard — Analytics

### Subblock 9.1 — Analytics Service (`backend/app/services/analytics_service.py`)
- Track events: question_asked, document_uploaded, user_login, unanswered_question
- `get_overview_stats()` — total users, docs, questions today, unanswered count
- `get_popular_questions(limit=10)` — aggregate most frequent questions
- `get_unanswered_questions()` — questions with low confidence scores or empty results
- `get_user_activity(days=30)` — daily active users

### Subblock 9.2 — Analytics API Routes (`backend/app/api/analytics.py`)
- `GET /api/analytics/overview` — dashboard overview stats
- `GET /api/analytics/popular-questions` — most asked
- `GET /api/analytics/unanswered` — unanswered questions
- `GET /api/analytics/user-activity` — user activity timeline

### Subblock 9.3 — Analytics UI (`/admin/analytics`)
- Stat cards: total users, docs, questions, unanswered %
- Bar chart: most asked questions (recharts)
- Line chart: user activity over time
- Table: unanswered questions with document suggestions
- Verify: Admin can see real analytics from user interactions

---

## Block 10: Department-Based Access Control

### Subblock 10.1 — Backend Department Filtering
- Documents table has `department` column (hr, engineering, finance, all)
- On RAG search, filter chunks by user's department + "all" department
- Admin can view/upload to any department
- API routes check: user can only see documents for their department

### Subblock 10.2 — Frontend Department Display
- Show department badge on documents
- Admin UI: dropdown to select department when uploading
- Employee view: only see documents from their department
- Chat: department filter is automatic based on user's department

### Subblock 10.3 — Seeding Demo Data
- Create seed script: admin user, HR user, Engineering user
- Upload sample documents per department
- Verify: HR user only sees HR docs in search results

---

## Block 11: Testing

### Subblock 11.1 — Backend Tests (pytest)
- `tests/test_auth.py` — register, login, protected routes, invalid tokens
- `tests/test_documents.py` — upload, list, delete, authorization checks
- `tests/test_chats.py` — create chat, send message, get history
- `tests/test_rag.py` — chunking, embeddings, search, answer generation (mocked LLM)
- `tests/test_analytics.py` — tracking events, overview stats
- Conftest: test database (SQLite in-memory), test client, auth headers
- Coverage target: > 80%

### Subblock 11.2 — Frontend Tests (Jest + React Testing Library)
- `__tests__/components/` — ChatWindow, MessageBubble, SourceCard, UploadForm
- `__tests__/pages/` — LoginPage, RegisterPage, AdminDocumentsPage
- `__tests__/lib/` — API client mocking
- Mock: axios, next/navigation
- Verify: `npm run test` — all tests pass

### Subblock 11.3 — E2E Tests (Playwright)
- `e2e/auth.spec.ts` — register, login, logout flow
- `e2e/chat.spec.ts` — create chat, ask question, see response
- `e2e/admin.spec.ts` — upload document, view analytics
- Verify: `npx playwright test` — all flows work

---

## Block 12: Docker & Deployment

### Subblock 12.1 — Docker Compose Full Stack
- Services: postgres, chromadb, backend, frontend, nginx
- Environment variables passed via `.env` file
- Volumes for persistent data: postgres data, chroma data, uploads
- Network for inter-service communication

### Subblock 12.2 — Production Configuration
- Backend: gunicorn + uvicorn workers
- Frontend: standalone Next.js server
- Nginx reverse proxy: /api → backend, / → frontend
- CORS: allow only frontend origin
- Health check endpoints for all services

### Subblock 12.3 — Environment Variables
- `.env.example` with all required variables (no real secrets)
- Documentation: how to configure each variable
- Key vault: documented where to obtain each value

### Subblock 12.4 — Verification Script
- `scripts/verify.sh` / `scripts/verify.ps1` — checks:
  - All services are running
  - API health endpoint returns 200
  - Database has tables
  - ChromaDB is reachable
  - Can upload document
  - Can ask question and get answer
- Output: PASS/FAIL for each check

---

## Execution Order & Dependencies

```
Block 1 (Scaffolding) → Block 2 (Database) → Block 3 (Auth)
                                                     ↓
Block 4 (Document Upload) → Block 5 (Processing & Chunking)
                                         ↓
                              Block 6 (Embeddings + Vector DB)
                                         ↓
                              Block 7 (RAG Pipeline)
                                         ↓
                              Block 8 (Chat Interface)
                                         ↓
                    Block 9 (Analytics) → Block 10 (Department Access)
                                                    ↓
                                         Block 11 (Testing)
                                                    ↓
                                         Block 12 (Deployment)
```

Each block should be completed, tested, and verified before moving to the next.
