"use client";

import { useState } from "react";

interface SourceCardProps {
  title: string;
  pageNum: number | null;
  snippet: string;
}

export default function SourceCard({ title, pageNum, snippet }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 text-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-3 py-2 text-left"
      >
        <span className="font-medium text-gray-700">
          {title}{pageNum ? ` (p. ${pageNum})` : ""}
        </span>
        <span className="text-gray-400">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="border-t border-gray-200 px-3 py-2 text-gray-600">
          {snippet}
        </div>
      )}
    </div>
  );
}
