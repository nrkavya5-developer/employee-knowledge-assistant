from functools import lru_cache

from transformers import pipeline

from app.core.config import settings


@lru_cache(maxsize=1)
def _get_pipeline():
    return pipeline(
        "text2text-generation",
        model=settings.LLM_MODEL,
        max_new_tokens=256,
        device=-1,
    )


def generate_answer(question: str, context_chunks: list[dict]) -> str:
    context_parts = []
    for c in context_chunks:
        doc_info = f"[{c['doc_title']}]"
        if c.get("page_num"):
            doc_info += f" (page {c['page_num']})"
        context_parts.append(f"{doc_info}: {c['text']}")
    context = "\n\n".join(context_parts)

    prompt = (
        "Based on the following documents, answer the question concisely.\n"
        "If the documents don't contain enough information, say so.\n\n"
        f"Documents:\n{context}\n\n"
        f"Question: {question}\n"
        f"Answer:"
    )

    try:
        pipe = _get_pipeline()
        result = pipe(prompt, max_new_tokens=256, do_sample=False)
        return result[0]["generated_text"].strip()
    except Exception:
        return "I'm sorry, I couldn't generate an answer at this time."
