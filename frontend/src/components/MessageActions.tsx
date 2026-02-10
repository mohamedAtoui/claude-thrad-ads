"use client";

import { useState } from "react";

interface MessageActionsProps {
  content: string;
  messageId: string;
  feedback: string | null;
  onFeedback: (messageId: string, feedback: "like" | "dislike") => void;
  onRetry: () => void;
}

export default function MessageActions({
  content,
  messageId,
  feedback,
  onFeedback,
  onRetry,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1 mt-2">
      {/* Copy */}
      <button
        onClick={handleCopy}
        className="p-1.5 rounded hover:bg-[var(--color-bg-surface)] transition-colors cursor-pointer"
        title={copied ? "Copied!" : "Copy"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={copied ? "var(--color-accent-primary)" : "var(--color-icon-default)"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>

      {/* Thumbs up */}
      <button
        onClick={() => onFeedback(messageId, "like")}
        className="p-1.5 rounded hover:bg-[var(--color-bg-surface)] transition-colors cursor-pointer"
        title="Like"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={feedback === "like" ? "var(--color-accent-primary)" : "none"}
          stroke={feedback === "like" ? "var(--color-accent-primary)" : "var(--color-icon-default)"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      </button>

      {/* Thumbs down */}
      <button
        onClick={() => onFeedback(messageId, "dislike")}
        className="p-1.5 rounded hover:bg-[var(--color-bg-surface)] transition-colors cursor-pointer"
        title="Dislike"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={feedback === "dislike" ? "var(--color-accent-primary)" : "none"}
          stroke={feedback === "dislike" ? "var(--color-accent-primary)" : "var(--color-icon-default)"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
        </svg>
      </button>

      {/* Retry */}
      <button
        onClick={onRetry}
        className="p-1.5 rounded hover:bg-[var(--color-bg-surface)] transition-colors cursor-pointer"
        title="Retry"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-icon-default)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 4v6h6" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      </button>
    </div>
  );
}
