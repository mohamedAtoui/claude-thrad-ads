"use client";

import MessageActions from "./MessageActions";

interface ChatMessageProps {
  id: string;
  role: "user" | "assistant";
  content: string;
  feedback?: string | null;
  isStreaming?: boolean;
  onFeedback: (messageId: string, feedback: "like" | "dislike") => void;
  onRetry: () => void;
}

function renderMarkdown(text: string) {
  // Simple markdown: links [text](url) and bold **text**
  let html = text
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // Line breaks to paragraphs
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br />");

  return `<p>${html}</p>`;
}

export default function ChatMessage({
  id,
  role,
  content,
  feedback,
  isStreaming,
  onFeedback,
  onRetry,
}: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[80%] bg-[var(--color-bg-user-bubble)] text-[var(--color-text-user)] rounded-[20px] px-4 py-3 text-[15px] leading-[1.6]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-[80%]">
        <div
          className="assistant-content text-[var(--color-text-primary)] text-[15px] leading-[1.6]"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
        {!isStreaming && content && (
          <MessageActions
            content={content}
            messageId={id}
            feedback={feedback || null}
            onFeedback={onFeedback}
            onRetry={onRetry}
          />
        )}
      </div>
    </div>
  );
}
