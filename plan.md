# Employee Knowledge Assistant - Project Plan

## 1. Project Overview

A RAG-based (Retrieval-Augmented Generation) internal knowledge chatbot that allows employees to ask questions about company documents (HR policies, leave policies, insurance, technical docs, etc.) and get accurate answers with source citations.

---

## 2. Core Architecture

```
User Question
    ↓
Authentication & Authorization Layer
    ↓
RAG Pipeline:
    ├── Document Upload (Admin only)
    ├── Document Processing (Chunking)
    ├── Embeddings Generation
    ├── Vector Storage (ChromaDB)
    ├── Semantic Search
    ├── Context Retrieval
    └── LLM Answer Generation
    ↓
Response with Source Citations
```

---

## 3. Feature Roadmap

### Phase 1 — Core MVP
| Feature | Description |
|---------|-------------|
| PDF Upload | Admin can upload PDF documents |
| Q&A Chatbot | Employee can ask questions |
| RAG Pipeline | Retrieve + Generate answers |
| Source Citations | Show which document/ page the answer came from |

### Phase 2 — Multi-format & Auth
| Feature | Description |
|---------|-------------|
| Multiple Formats | PDF, DOCX, TXT, CSV support |
| User Auth | JWT-based signup/login |
| Role-based Access | Employee (ask only), Admin (upload/manage) |
| Chat History | Persistent conversation history per user |

### Phase 3 — Advanced Features
| Feature | Description |
|---------|-------------|
| Analytics Dashboard | Most asked Qs, unanswered Qs, popular docs |
| Department Access | HR docs → HR team, Engineering docs → Engineers |
| Document Versioning | Track document versions and updates |
| Feedback System | Thumbs up/down on answers |
| Conversation Memory | Context across multiple turns |

---

## 4. Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | React + Next.js + TypeScript + Tailwind CSS | Modern, type-safe, SSR |
| Backend | Python FastAPI | Async, auto-docs, great for AI pipelines |
| Database | PostgreSQL | Reliable, open-source, JSON support |
| Vector DB | ChromaDB | Free, open-source, simple API |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) | Free, runs locally, good quality |
| LLM | HuggingFace (FLAN-T5 / Mistral 7B) or free API | Free, open-source models |
| Auth | JWT (python-jose + passlib) | Stateless, secure |
| File Storage | Local filesystem (for MVP) | Simple, no cloud cost |
| Testing | pytest (backend) + Jest/React Testing Library (frontend) | Standard testing frameworks |
| Docker | Docker + Docker Compose | Containerization |

---

## 5. Database Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary Key |
| email | VARCHAR(255) | Unique |
| password_hash | VARCHAR(255) | bcrypt hashed |
| full_name | VARCHAR(255) | |
| role | ENUM | employee / admin |
| department | VARCHAR(100) | hr / engineering / finance |
| created_at | TIMESTAMP | |

### documents
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary Key |
| title | VARCHAR(255) | |
| file_type | VARCHAR(10) | pdf / docx / txt / csv |
| file_path | TEXT | Local storage path |
| department | VARCHAR(100) | Access restriction |
| uploaded_by | UUID | FK → users.id |
| version | INT | Version number |
| uploaded_at | TIMESTAMP | |
| is_active | BOOLEAN | Soft delete |

### chats
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary Key |
| user_id | UUID | FK → users.id |
| title | VARCHAR(255) | Auto-generated |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### messages
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary Key |
| chat_id | UUID | FK → chats.id |
| role | ENUM | user / assistant |
| content | TEXT | Message text |
| sources | JSONB | Source document references |
| feedback | BOOLEAN | NULL / true / false |
| created_at | TIMESTAMP | |

### analytics_events
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary Key |
| event_type | VARCHAR(50) | question / upload / login |
| user_id | UUID | FK → users.id |
| metadata | JSONB | Extra data |
| created_at | TIMESTAMP | |

---

## 6. API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, get JWT |
| GET | /api/auth/me | Get current user info |

### Documents (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/documents/upload | Upload document |
| GET | /api/documents/ | List documents |
| DELETE | /api/documents/{id} | Delete document |
| GET | /api/documents/{id} | Get document details |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/chats/ | Create new chat |
| GET | /api/chats/ | List user's chats |
| GET | /api/chats/{id} | Get chat history |
| POST | /api/chats/{id}/messages | Send message + get answer |
| POST | /api/messages/{id}/feedback | Submit feedback |

### Analytics (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/overview | Dashboard overview |
| GET | /api/analytics/popular-questions | Most asked questions |
| GET | /api/analytics/unanswered | Unanswered questions |
| GET | /api/analytics/user-activity | User activity stats |

---

## 7. Frontend Pages

| Route | Page | Access |
|-------|------|--------|
| /login | Login page | All |
| /register | Register page | All |
| /dashboard | Chat interface (main) | Employee, Admin |
| /admin/documents | Document management | Admin |
| /admin/analytics | Analytics dashboard | Admin |
| /admin/users | User management | Admin |
| /chats | Chat history list | Employee, Admin |
| /chats/{id} | Specific chat view | Employee, Admin |

---

## 8. RAG Pipeline Design

```
Uploaded Document
    ↓
1. Document Processing
   ├── PDF → PyMuPDF (fitz) text extraction
   ├── DOCX → python-docx
   ├── TXT → raw text
   └── CSV → csv module / pandas
    ↓
2. Text Chunking (RecursiveCharacterTextSplitter)
   ├── Chunk size: 512 tokens
   ├── Chunk overlap: 50 tokens
   └── Preserve paragraph boundaries
    ↓
3. Embeddings (sentence-transformers)
   ├── Model: all-MiniLM-L6-v2
   └── Output: 384-dim vector per chunk
    ↓
4. Vector Store (ChromaDB)
   ├── Store embeddings + metadata
   └── Index for similarity search
    ↓
5. User Question
   ├── Embed question with same model
   └── Cosine similarity search → top 3-5 chunks
    ↓
6. Context Assembly
   ├── Retrieved chunks + metadata
   └── Format as context for LLM
    ↓
7. LLM Generation (HuggingFace / local)
   ├── Prompt: Context + Question → Answer
   └── Include source document names + page numbers
    ↓
Final Answer + Citations
```

---

## 9. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend language | Python | Rich AI/ML ecosystem, LangChain compatibility |
| Embeddings model | all-MiniLM-L6-v2 | 384-dim, fast, good quality, runs on CPU |
| Vector DB | ChromaDB | Free, persistent, no infra cost |
| LLM | FLAN-T5-base / Mistral 7B | Free, open-source, runs locally |
| Auth | JWT | Stateless, simple, no session store needed |
| File storage | Local disk | Simple for MVP, S3 adapter later |
| Chunking | RecursiveCharacterTextSplitter | Respects document structure |
| Frontend framework | Next.js | SSR, API routes, good DX |

---

## 10. Security Measures

- JWT tokens with expiration (24h)
- Passwords hashed with bcrypt
- Role-based middleware on all protected routes
- Department-based document filtering
- Input sanitization on all user inputs
- File type validation on upload
- Row-Level Security via queries (department check)
- CORS configured for frontend origin only
- Rate limiting on API endpoints

---

## 11. Testing Strategy

### Backend (pytest)
- Unit tests: auth, document processing, chunking
- Integration tests: API endpoints, RAG pipeline
- Fixtures: test database, sample documents

### Frontend (Jest + React Testing Library)
- Unit tests: components, utils
- Integration tests: page flows, auth flows
- Mock API calls

### E2E (Playwright)
- Login → upload doc → ask question → see answer

---

## 12. Deployment (Docker)

```yaml
services:
  postgres:
    image: postgres:15
  chromadb:
    image: chromadb/chromadb
  backend:
    build: ./backend
    depends_on: [postgres, chromadb]
  frontend:
    build: ./frontend
    depends_on: [backend]
  nginx:
    image: nginx:alpine
    ports: [80, 443]
```

---

## 13. Folder Structure

```
employee-knowledge-assistant/
├── frontend/              # Next.js app
│   ├── src/
│   │   ├── app/          # Pages (Next.js App Router)
│   │   ├── components/   # Reusable components
│   │   ├── lib/          # API client, utils
│   │   └── types/        # TypeScript types
│   ├── public/
│   ├── tests/
│   └── package.json
├── backend/               # FastAPI app
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   ├── core/         # Config, security
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── utils/        # Helpers
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```
