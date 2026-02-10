"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getChat, sendFeedback } from "@/lib/api";
import { streamChat, AdData } from "@/lib/stream";
import { fetchThradAd } from "@/lib/thrad";
import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import LoadingSpinner from "@/components/LoadingSpinner";
import AdCard from "@/components/AdCard";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  feedback?: string | null;
}

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const chatId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [ads, setAds] = useState<Record<string, AdData>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialSendDone = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Load chat messages
  useEffect(() => {
    if (!chatId) return;
    getChat(chatId)
      .then((chat) => {
        setMessages(chat.messages || []);
      })
      .catch((err) => console.error("Failed to load chat:", err));
  }, [chatId]);

  const sendMessage = useCallback(
    (message: string) => {
      if (isStreaming) return;

      // Add user message to UI immediately
      const userMsg: Message = {
        id: "temp-user-" + Date.now(),
        role: "user",
        content: message,
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      setStreamingContent("");

      streamChat(
        chatId,
        message,
        (chunk) => {
          setStreamingContent((prev) => prev + chunk);
        },
        (messageId) => {
          setStreamingContent((prev) => {
            const finalContent = prev;
            const assistantMsg: Message = {
              id: messageId,
              role: "assistant",
              content: finalContent,
            };
            setMessages((msgs) => {
              const updated = [...msgs, assistantMsg];
              // Fetch ad from Thrad (client-side, browser sends Origin automatically)
              const allMessages = updated.map((m) => ({ role: m.role, content: m.content }));
              fetchThradAd(allMessages, chatId).then((ad) => {
                if (ad && messageId) {
                  setAds((prev) => ({ ...prev, [messageId]: ad }));
                }
              });
              return updated;
            });
            return "";
          });
          setIsStreaming(false);
          // Reload chat to get correct message IDs
          getChat(chatId).then((chat) => setMessages(chat.messages || []));
        },
        (error) => {
          console.error("Stream error:", error);
          setStreamingContent("");
          setIsStreaming(false);
        }
      );
    },
    [chatId, isStreaming]
  );

  // Auto-send first message from query param
  useEffect(() => {
    if (initialSendDone.current) return;
    const q = searchParams.get("q");
    if (q && chatId) {
      initialSendDone.current = true;
      // Small delay to ensure chat is loaded
      setTimeout(() => sendMessage(q), 300);
    }
  }, [chatId, searchParams, sendMessage]);

  const handleFeedback = async (messageId: string, feedback: "like" | "dislike") => {
    try {
      await sendFeedback(chatId, messageId, feedback);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, feedback } : m
        )
      );
    } catch (err) {
      console.error("Feedback failed:", err);
    }
  };

  const handleRetry = () => {
    // Find last user message and resend
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      // Remove last assistant message
      setMessages((prev) => {
        const idx = prev.length - 1;
        if (prev[idx]?.role === "assistant") {
          return prev.slice(0, idx);
        }
        return prev;
      });
      sendMessage(lastUserMsg.content);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen">
      <Sidebar
        activeChatId={chatId}
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
      />
      <main className="flex-1 flex flex-col relative min-w-0" style={{ overflowX: 'clip' as const }}>
        {/* Thrad logo */}
        <div className="fixed top-2 right-2 md:top-4 md:right-4 z-30">
          <a href="https://www.thrad.ai/" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center h-[36px] px-2 rounded-lg transition-colors cursor-pointer no-underline pointer-events-auto"
            style={{ color: 'var(--color-text-secondary)' }}>
            <span className="text-[14px] font-bold tracking-wider">Thrad</span>
          </a>
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col items-center px-2 md:px-4 pt-14 pb-0 overflow-y-scroll" style={{ overscrollBehavior: 'contain' }}>
          <div className="w-full max-w-3xl px-1 md:px-6 flex-1">
            {messages.map((msg, idx) => (
              <div key={`${msg.id}-${idx}`}>
                <ChatMessage
                  id={msg.id}
                  role={msg.role}
                  content={msg.content}
                  feedback={msg.feedback}
                  onFeedback={handleFeedback}
                  onRetry={handleRetry}
                />
                {msg.role === "assistant" && ads[msg.id] && (
                  <AdCard ad={ads[msg.id]} />
                )}
              </div>
            ))}

            {/* Streaming content */}
            {isStreaming && streamingContent && (
              <ChatMessage
                id="streaming"
                role="assistant"
                content={streamingContent}
                isStreaming={true}
                onFeedback={() => {}}
                onRetry={() => {}}
              />
            )}

            {/* Loading spinner */}
            {isStreaming && !streamingContent && (
              <div className="flex justify-start mb-6">
                <LoadingSpinner />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="sticky bottom-0 flex flex-col items-center px-0 md:px-2 pb-0 flex-shrink-0 w-full">
          <ChatInput onSend={sendMessage} disabled={isStreaming} showFooter={false} />
          <p className="text-[11px] -mt-[20px] pt-[28px] pb-2 w-full text-center" style={{ color: 'var(--color-text-footer)', background: 'var(--color-bg-primary)' }}>
            Claude with Ads can make mistakes, after all, it&apos;s tomfoolery from Thrad.
          </p>
        </div>
      </main>
    </div>
  );
}
