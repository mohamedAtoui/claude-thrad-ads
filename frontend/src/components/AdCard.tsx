"use client";

import { AdData } from "@/lib/stream";

interface AdCardProps {
  ad: AdData;
}

export default function AdCard({ ad }: AdCardProps) {
  return (
    <div className="flex justify-start mb-6">
      <div
        className="max-w-[80%] rounded-2xl overflow-hidden border"
        style={{
          backgroundColor: "var(--color-bg-surface, #1e1e2e)",
          borderColor: "var(--color-border, #2a2a3a)",
        }}
      >
        {ad.image_url && (
          <a href={ad.url} target="_blank" rel="noopener noreferrer">
            <img
              src={ad.image_url}
              alt={ad.headline}
              className="w-full h-40 object-cover"
            />
          </a>
        )}
        <div className="px-4 py-3">
          <div
            className="text-[11px] font-medium uppercase tracking-wider mb-1"
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
            <h4
              className="text-[15px] font-semibold leading-snug mb-1"
              style={{ color: "var(--color-text-primary, #e0e0e0)" }}
            >
              {ad.headline}
            </h4>
          </a>
          <p
            className="text-[13px] leading-relaxed mb-3"
            style={{ color: "var(--color-text-secondary, #aaa)" }}
          >
            {ad.description}
          </p>
          <a
            href={ad.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 rounded-lg text-[13px] font-medium no-underline transition-opacity hover:opacity-90"
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
