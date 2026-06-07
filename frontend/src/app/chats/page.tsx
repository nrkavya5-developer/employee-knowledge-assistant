"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { chatApi } from "@/lib/api";

export default function ChatsPage() {
  const router = useRouter();

  useEffect(() => {
    chatApi.create().then((chat) => {
      router.replace(`/chats/${chat.id}`);
    }).catch(() => {
      // handled by interceptor
    });
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
      Creating new chat...
    </div>
  );
}
