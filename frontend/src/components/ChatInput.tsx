"use client";

import { useState, useRef, useEffect } from "react";
import ModelSelector from "./ModelSelector";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  showFooter?: boolean;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Reply...",
  showFooter = true,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [message]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="w-full max-w-2xl rounded-3xl p-[6px] flex flex-col cursor-text relative z-10 bg-[var(--color-bg-input)] border border-[var(--color-bg-input-border)]">
        <div className="px-[14px] pt-[10px] pb-1 relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent text-[var(--color-text-primary)] text-[15px] resize-none outline-none placeholder:text-[var(--color-text-secondary)]"
          />
        </div>
        <div className="flex items-center justify-between px-3 pb-2">
          {/* + button */}
          <button className="flex items-center justify-center w-[32px] h-[32px] rounded-lg transition-colors cursor-pointer hover:bg-[var(--color-bg-surface)]" style={{ color: 'var(--color-icon-default)' }}>
            <svg
              width="18"
              height="18"
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
          </button>

          <div className="flex items-center gap-2">
            <ModelSelector />
            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={disabled || !message.trim()}
              className={`flex items-center justify-center w-[32px] h-[32px] rounded-lg bg-[var(--color-accent-primary)] transition-all cursor-pointer disabled:cursor-not-allowed ${message.trim() ? 'opacity-100' : 'opacity-40'}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {showFooter && (
        <p className="text-[11px] -mt-[20px] pt-[28px] pb-2 w-full text-center" style={{ color: 'var(--color-text-footer)', background: 'var(--color-bg-primary)' }}>
          Claude with Ads can make mistakes, after all, it&apos;s tomfoolery from Thrad.
        </p>
      )}
    </>
  );
}
