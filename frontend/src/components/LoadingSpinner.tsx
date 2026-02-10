"use client";

export default function LoadingSpinner() {
  return (
    <svg
      className="spinner"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sparkle / asterisk shape */}
      {[0, 45, 90, 135].map((angle) => (
        <line
          key={angle}
          x1="12"
          y1="4"
          x2="12"
          y2="10"
          stroke="var(--color-accent-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </svg>
  );
}
