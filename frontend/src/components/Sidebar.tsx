"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { listChats } from "@/lib/api";

interface Chat {
  id: string;
  title: string;
  created_at: string;
  message_count: number;
}

interface SidebarProps {
  activeChatId?: string;
  expanded: boolean;
  onToggle: () => void;
}

export default function Sidebar({ activeChatId, expanded, onToggle }: SidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const router = useRouter();

  useEffect(() => {
    listChats()
      .then(setChats)
      .catch(() => {});
  }, [activeChatId]);

  const handleNewChat = () => {
    router.push("/");
  };

  const handleSelectChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  // Collapsed sidebar
  if (!expanded) {
    return (
      <div className="w-[48px] h-screen flex flex-col items-center pt-4 gap-4 flex-shrink-0" style={{ background: 'rgba(31, 30, 29, 0.3)', borderRight: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <button
          onClick={onToggle}
          className="p-1.5 rounded hover:bg-[var(--color-bg-sidebar-hover)] transition-colors cursor-pointer"
          title="Expand sidebar"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-icon-default)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
        <button
          onClick={handleNewChat}
          className="p-1.5 rounded hover:bg-[var(--color-bg-sidebar-hover)] transition-colors cursor-pointer"
          title="New chat"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-icon-default)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    );
  }

  // Expanded sidebar
  return (
    <div className="w-[260px] h-screen flex flex-col flex-shrink-0 overflow-hidden transition-all duration-200" style={{ background: 'var(--color-bg-sidebar)', borderRight: '1px solid rgba(255, 255, 255, 0.06)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-4 pb-2">
        <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">
          Claude with Ads
        </span>
        <button
          onClick={onToggle}
          className="p-1.5 rounded border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-sidebar-hover)] transition-colors cursor-pointer"
          title="Collapse sidebar"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-icon-default)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
      </div>

      {/* New chat button */}
      <button
        onClick={handleNewChat}
        className="flex items-center gap-2 mx-2 px-2 py-1.5 rounded hover:bg-[var(--color-bg-sidebar-hover)] transition-colors text-[14px] text-[var(--color-text-primary)] cursor-pointer"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New chat
      </button>

      {/* Recents */}
      {chats.length > 0 && (
        <div className="mt-4 flex-1 overflow-y-auto">
          <div className="px-3 mb-1 text-[12px] uppercase text-[var(--color-text-secondary)] tracking-wider">
            Recents
          </div>
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className={`w-full text-left px-3 py-1.5 text-[14px] truncate transition-colors cursor-pointer ${
                chat.id === activeChatId
                  ? "bg-[var(--color-bg-sidebar-active)] text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-sidebar-hover)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {chat.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
