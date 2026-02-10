"use client";

import { AdData } from "@/lib/stream";

interface AdCardProps {
  ad: AdData;
}

export default function AdCard({ ad }: AdCardProps) {
  return (
    <div className="flex justify-start mb-4">
      <div
        className="max-w-[80%] rounded-xl overflow-hidden border px-3 py-2"
        style={{
          backgroundColor: "var(--color-bg-surface, #1e1e2e)",
          borderColor: "var(--color-border, #2a2a3a)",
        }}
      >
        <div
          className="text-[10px] font-medium uppercase tracking-wider mb-0.5"
          style={{ color: "var(--color-text-secondary, #888)" }}
        >
          Sponsored · {ad.advertiser}
        </div>
        <a
          href={ad.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block no-underline"
        >
          <span
            className="text-[13px] font-semibold leading-tight"
            style={{ color: "var(--color-text-primary, #e0e0e0)" }}
          >
            {ad.headline}
          </span>
          <span
            className="text-[12px] leading-snug ml-1"
            style={{ color: "var(--color-text-secondary, #aaa)" }}
          >
            — {ad.description}
          </span>
        </a>
        <div className="mt-1.5">
          <a
            href={ad.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-3 py-1 rounded-md text-[11px] font-medium no-underline transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--color-accent, #6c5ce7)",
              color: "#fff",
            }}
          >
            {ad.cta_text || "Learn More"}
          </a>
        </div>
      </div>
    </div>
  );
}
