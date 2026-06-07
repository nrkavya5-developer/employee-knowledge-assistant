from app.services.embeddings import generate_embeddings
from app.services.vector_store import search_similar
from app.services.llm_service import generate_answer


def answer_question(
    question: str,
    department: str | None = None,
    chat_history: list[dict] | None = None,
) -> dict:
    if not question.strip():
        return {"answer": "Please ask a valid question.", "sources": []}

    question_embeddings = generate_embeddings([question])
    query_embedding = question_embeddings[0]

    results = search_similar(query_embedding, department_filter=department, top_k=5)

    if not results:
        return {"answer": "I couldn't find any relevant information to answer your question.", "sources": []}

    context_text = ""
    if chat_history:
        recent = chat_history[-2:]
        for exchange in recent:
            role = exchange.get("role", "")
            content = exchange.get("content", "")
            context_text += f"{role.capitalize()}: {content}\n"

    answer = generate_answer(question, results)

    sources = [
        {"doc_title": r["doc_title"], "page_num": r["page_num"], "text_snippet": r["text"][:200]}
        for r in results
    ]

    return {"answer": answer, "sources": sources}
