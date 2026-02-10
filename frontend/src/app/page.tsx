"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { hasSeenOnboarding } from "@/lib/auth";
import { createChat } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import ChatInput from "@/components/ChatInput";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (!hasSeenOnboarding()) {
      router.push("/onboarding");
    }
  }, [isAuthenticated, router]);

  const handleSend = async (message: string) => {
    if (sending) return;
    setSending(true);
    try {
      const chat = await createChat(message);
      router.push(`/chat/${chat.id}?q=${encodeURIComponent(message)}`);
    } catch (err) {
      console.error("Failed to create chat:", err);
      setSending(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen">
      <Sidebar
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
      />
      <div className="flex-1 flex flex-col relative min-w-0 overflow-hidden">
        {/* Thrad logo top right */}
        <div className="fixed top-2 right-2 md:top-4 md:right-4 z-30">
          <a
            href="https://www.thrad.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center h-[36px] px-2 rounded-lg transition-colors cursor-pointer no-underline pointer-events-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <img src="/claude-thrad-logo.svg" alt="Thrad" width={56} height={56} />
          </a>
        </div>

        <div className="flex flex-col items-center px-4 max-sm:px-3 pt-[12vh] md:pt-[20vh] w-full">
        {/* Hero */}
        <div className="flex items-center gap-3 mb-6">
          <img src="/claude-thrad-logo.svg" alt="Thrad" width={80} height={80} />
          <h1
            className="text-[40px] text-[var(--color-text-primary)]"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 400 }}
          >
            Claude with Thrad
          </h1>
        </div>

        {/* Input */}
        <div className="w-full flex flex-col items-center px-4">
          <ChatInput
            onSend={handleSend}
            disabled={sending}
            placeholder="How can I convert you today?"
            showFooter={false}
          />
        </div>

        {/* Tomfoolery badge */}
        <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-border-primary)] text-[var(--color-text-secondary)] text-[13px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          Tomfoolery by Thrad
        </div>
        </div>
      </div>
    </div>
  );
}
