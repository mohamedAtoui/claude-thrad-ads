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
  const [streamError, setStreamError] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [ads, setAds] = useState<Record<string, AdData>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const initialSendDone = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Smooth scroll when new messages are added
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  // Instant scroll during streaming, only if user is near bottom
  useEffect(() => {
    if (!streamingContent) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (nearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }, [streamingContent]);

  // Abort stream on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

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
      setStreamError(null);

      // Accumulate full response in a local variable
      let fullResponse = "";

      // Create abort controller for this stream
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      streamChat(
        chatId,
        message,
        (chunk) => {
          fullResponse += chunk;
          setStreamingContent(fullResponse);
        },
        (messageId) => {
          setStreamingContent("");
          setIsStreaming(false);
          abortControllerRef.current = null;

          // Reload from server as single source of truth
          getChat(chatId)
            .then((chat) => {
              setMessages(chat.messages || []);
            })
            .catch(() => {
              // Fallback: add assistant message locally if reload fails
              const assistantMsg: Message = {
                id: messageId,
                role: "assistant",
                content: fullResponse,
              };
              setMessages((prev) => [...prev, assistantMsg]);
            })
            .finally(() => {
              // Fetch ad after messages settle
              getChat(chatId)
                .then((chat) => {
                  const allMessages = (chat.messages || []).map((m: Message) => ({
                    role: m.role,
                    content: m.content,
                  }));
                  return fetchThradAd(allMessages, chatId);
                })
                .then((ad) => {
                  if (ad && messageId) {
                    setAds((prev) => ({ ...prev, [messageId]: ad }));
                  }
                })
                .catch(() => {});
            });
        },
        (error) => {
          // Ignore abort errors
          if (error === "The operation was aborted." || error === "AbortError") return;
          console.error("Stream error:", error);
          setStreamingContent("");
          setIsStreaming(false);
          setStreamError(error);
          abortControllerRef.current = null;
        },
        abortController.signal
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
            <img src="/claude-thrad-logo.svg" alt="Thrad" width={56} height={56} />
          </a>
        </div>

        {/* Messages */}
        <div ref={scrollContainerRef} className="flex-1 flex flex-col items-center px-2 md:px-4 pt-14 pb-0 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
          <div className="w-full max-w-3xl px-1 md:px-6 pb-4">
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

            {/* Stream error */}
            {streamError && (
              <div className="flex justify-start mb-6">
                <div className="rounded-2xl px-4 py-3 max-w-[85%]" style={{ background: 'var(--color-bg-error, #fef2f2)', color: 'var(--color-text-error, #dc2626)' }}>
                  <p className="text-sm mb-2">Something went wrong: {streamError}</p>
                  <button
                    onClick={() => {
                      setStreamError(null);
                      handleRetry();
                    }}
                    className="text-sm font-medium px-3 py-1 rounded-lg transition-colors"
                    style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="sticky bottom-0 flex flex-col items-center px-0 md:px-2 pb-0 flex-shrink-0 w-full">
          <ChatInput onSend={sendMessage} disabled={isStreaming} showFooter={false} />
          <p className="text-[11px] -mt-[20px] pt-[28px] pb-2 w-full text-center" style={{ color: 'var(--color-text-footer)', background: 'var(--color-bg-primary)' }}>
            Claude with Thrad can make mistakes, after all, it&apos;s tomfoolery from Thrad.
          </p>
        </div>
      </main>
    </div>
  );
}
