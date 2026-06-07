"use client";

import SourceCard from "./SourceCard";

interface MessageBubbleProps {
  role: string;
  content: string;
  sources?: { sources: Array<{ doc_title: string; page_num: number | null; text_snippet: string }> } | null;
}

export default function MessageBubble({ role, content, sources }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] space-y-2 ${isUser ? "order-1" : "order-1"}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "rounded-br-sm bg-blue-600 text-white"
              : "rounded-bl-sm bg-white text-gray-800 shadow-sm ring-1 ring-gray-200"
          }`}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
        </div>
        {!isUser && sources && sources.sources && sources.sources.length > 0 && (
          <div className="space-y-1 pl-1">
            <p className="text-xs font-medium text-gray-500">Sources</p>
            {sources.sources.map((s, i) => (
              <SourceCard
                key={i}
                title={s.doc_title}
                pageNum={s.page_num}
                snippet={s.text_snippet}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
