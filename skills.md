# Skills Required — Employee Knowledge Assistant

This document catalogs all technical and soft skills needed to build this project, organized by domain.

---

## 1. Programming Languages

| Skill | Proficiency | Used For |
|-------|-------------|----------|
| Python | Intermediate | Backend (FastAPI), AI pipeline, data processing |
| TypeScript | Intermediate | Frontend (Next.js, React) |
| SQL | Intermediate | Database queries, aggregations for analytics |
| YAML | Basic | Docker Compose, CI/CD configs |
| HTML/CSS | Basic | JSX structure, Tailwind styling |

---

## 2. Backend Development (Python)

| Skill | Details |
|-------|---------|
| FastAPI | Async route handlers, dependency injection, Pydantic validation |
| SQLAlchemy | ORM models, relationships, async sessions |
| Alembic | Database migrations, revision management |
| Pydantic | Request/response schemas, validation, serialization |
| Uvicorn | ASGI server for development |
| Pytest | Test writing, fixtures, mocking, coverage |
| python-jose | JWT token creation and verification |
| passlib + bcrypt | Password hashing and verification |
| python-multipart | File upload handling |
| asyncio | Async/await patterns for I/O operations |

---

## 3. AI / Machine Learning

| Skill | Details |
|-------|---------|
| RAG Architecture | Retrieval-Augmented Generation pipeline design |
| Embeddings | Text-to-vector conversion using sentence-transformers |
| Cosine Similarity | Semantic search scoring |
| ChromaDB | Vector database CRUD, similarity search, filtering |
| LangChain Text Splitters | RecursiveCharacterTextSplitter chunking strategies |
| HuggingFace Transformers | Model loading, inference pipeline (FLAN-T5, Mistral) |
| Prompt Engineering | Context formatting, instruction design for LLMs |
| Chunking Strategies | Chunk size, overlap, separator selection |

---

## 4. Frontend Development (React/Next.js)

| Skill | Details |
|-------|---------|
| Next.js App Router | File-based routing, layouts, server components |
| React | Hooks (useState, useEffect, useContext), component lifecycle |
| TypeScript | Interfaces, types, generics, type narrowing |
| Tailwind CSS | Utility-first styling, responsive design, dark mode |
| React Hook Form | Form validation, error handling, submission |
| Axios | HTTP client, interceptors for JWT, error handling |
| React Context API | Auth state management across app |
| Recharts | Data visualization for analytics dashboard |
| React Dropzone | Drag-and-drop file upload UI |
| next/navigation | Client-side routing, redirects, params |

---

## 5. Database

| Skill | Details |
|-------|---------|
| PostgreSQL | Table design, indexing, JSONB columns, full-text search |
| SQL | SELECT, JOIN, GROUP BY, aggregations, complex queries |
| Database Design | Normalization, relationships, foreign keys, indexes |
| Alembic Migrations | Auto-generation, manual edits, rollback |

---

## 6. DevOps & Infrastructure

| Skill | Details |
|-------|---------|
| Docker | Dockerfile creation, multi-stage builds, image optimization |
| Docker Compose | Multi-service orchestration, volumes, networking |
| Nginx | Reverse proxy configuration, static file serving |
| Environment Management | .env files, secrets management, config separation |
| Git | Branching, commits, .gitignore, collaboration workflows |

---

## 7. Security

| Skill | Details |
|-------|---------|
| JWT | Token creation, verification, expiration, refresh flows |
| Password Hashing | bcrypt, salt rounds, secure storage |
| Role-Based Access Control | Middleware, route guards, conditional rendering |
| Input Validation | Pydantic schemas, file type checks, size limits |
| CORS | Configured origin restrictions |
| SQL Injection Prevention | Parameterized queries via SQLAlchemy |
| XSS Prevention | React's built-in sanitization, Content Security Policy |

---

## 8. Testing

| Skill | Details |
|-------|---------|
| Pytest | Test discovery, fixtures, parametrize, markers |
| Mocking | unittest.mock, monkeypatch for external services |
| TestFixtures | Test database setup, sample data creation |
| Jest | Test runner, assertions, snapshot testing |
| React Testing Library | Component rendering, user events, async queries |
| Playwright | E2E browser tests, headless mode, assertions |
| Coverage | pytest-cov, istanbul for measuring test coverage |

---

## 9. Soft Skills

| Skill | Application in This Project |
|-------|----------------------------|
| System Design | Architecting RAG pipeline, database schema, API layer |
| Problem Solving | Debugging chunking issues, optimizing search quality |
| Documentation | plan.md, execution.md, API docs, README |
| Attention to Detail | Security checks, edge case handling, input validation |
| Prioritization | Phased feature delivery: MVP first, polish later |

---

## 10. Tools & Libraries Used

| Tool | Purpose |
|------|---------|
| VS Code | Development environment |
| Docker Desktop | Container management (Windows) |
| Postman / Thunder Client | API testing |
| DBeaver / pgAdmin | Database GUI |
| Chrome DevTools | Frontend debugging |
| Git CLI | Version control |
| pip / npm | Package management |
| venv / conda | Python virtual environment |

---

## Skills by Project Phase

### Phase 1 — Core MVP (Blocks 1-8)
- Python (FastAPI, SQLAlchemy)
- TypeScript (React, Next.js)
- PostgreSQL, Alembic
- JWT Auth
- sentence-transformers, ChromaDB
- HuggingFace Transformers
- Docker Compose

### Phase 2 — Analytics & Access Control (Blocks 9-10)
- Recharts (data viz)
- Advanced SQL queries
- Complex role/permission logic
- Department-based filtering

### Phase 3 — Testing & Polish (Blocks 11-12)
- Pytest, Jest, Playwright
- Nginx configuration
- Production deployment considerations
