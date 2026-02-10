"use client";

import { useState, useRef, useEffect } from "react";

export default function ModelSelector() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
      >
        Opus 4.6
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute bottom-full mb-1 right-0 bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] rounded-lg py-1 min-w-[140px] shadow-lg z-50">
          <div className="px-3 py-1.5 text-[13px] text-[var(--color-text-primary)] bg-[var(--color-bg-sidebar-active)] cursor-default">
            Opus 4.6
          </div>
        </div>
      )}
    </div>
  );
}
