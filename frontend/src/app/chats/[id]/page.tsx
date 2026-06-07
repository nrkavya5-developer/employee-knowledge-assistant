"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { chatApi, type Message as MessageType } from "@/lib/api";
import ChatWindow from "@/components/ChatWindow";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params?.id as string;
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const fetchChat = useCallback(async () => {
    try {
      const chat = await chatApi.get(chatId);
      setMessages(chat.messages);
    } catch {
      router.push("/chats");
    }
  }, [chatId, router]);

  useEffect(() => {
    fetchChat();
  }, [fetchChat]);

  const handleSend = async (content: string) => {
    setSending(true);
    setError("");

    const tempUserMsg: MessageType = {
      id: "temp-" + Date.now(),
      chat_id: chatId,
      role: "user",
      content,
      sources: null,
      feedback: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await chatApi.sendMessage(chatId, content);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempUserMsg.id ? res.message : m)).concat(res.answer)
      );
    } catch {
      setError("Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {error && (
        <div className="bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}
      <ChatWindow messages={messages} sending={sending} onSend={handleSend} />
    </div>
  );
}
