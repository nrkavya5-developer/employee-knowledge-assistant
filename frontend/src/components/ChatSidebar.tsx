"use client";

import { useRouter, useParams } from "next/navigation";
import type { Chat } from "@/lib/api";

interface ChatSidebarProps {
  chats: Chat[];
  loading: boolean;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

export default function ChatSidebar({
  chats,
  loading,
  onNewChat,
  onDeleteChat,
  open,
  onClose,
}: ChatSidebarProps) {
  const router = useRouter();
  const params = useParams();
  const activeId = params?.id as string | undefined;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-30 flex h-full w-72 flex-col bg-gray-900 text-white transition-transform md:relative md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-gray-700 p-4">
          <button
            onClick={onNewChat}
            className="w-full rounded-md border border-gray-600 px-4 py-2 text-sm hover:bg-gray-800"
          >
            + New Chat
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <p className="px-3 py-2 text-sm text-gray-400">Loading...</p>
          ) : chats.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-400">No chats yet</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center rounded-lg px-3 py-2 text-sm cursor-pointer ${
                  activeId === chat.id
                    ? "bg-gray-700"
                    : "hover:bg-gray-800"
                }`}
                onClick={() => {
                  router.push(`/chats/${chat.id}`);
                  onClose();
                }}
              >
                <span className="flex-1 truncate">{chat.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="ml-2 hidden text-gray-500 hover:text-red-400 group-hover:inline"
                  title="Delete chat"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </nav>
      </aside>
    </>
  );
}
