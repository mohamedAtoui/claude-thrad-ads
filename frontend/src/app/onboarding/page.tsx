"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { hasSeenOnboarding, setOnboardingSeen } from "@/lib/auth";

/* ── Starburst icon (orange, matching Claude brand) ── */
function StarburstIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="14" cy="14" r="3" fill="#D97757" />
      <line x1="14" y1="2" x2="14" y2="8" stroke="#D97757" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="14" y1="20" x2="14" y2="26" stroke="#D97757" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="2" y1="14" x2="8" y2="14" stroke="#D97757" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="20" y1="14" x2="26" y2="14" stroke="#D97757" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="5.5" y1="5.5" x2="9.7" y2="9.7" stroke="#D97757" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="18.3" y1="18.3" x2="22.5" y2="22.5" stroke="#D97757" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="5.5" y1="22.5" x2="9.7" y2="18.3" stroke="#D97757" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="18.3" y1="9.7" x2="22.5" y2="5.5" stroke="#D97757" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── Feature item icons ── */
function CuriousIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E8DDD3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function AdFreeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E8DDD3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ImproveIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E8DDD3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

/* ── Toggle switch (decorative) ── */
function ToggleSwitch({ checked }: { checked: boolean }) {
  return (
    <div
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-[#D97757]" : "bg-[#4A4039]"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </div>
  );
}

export default function OnboardingPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (hasSeenOnboarding()) {
      router.push("/");
    } else {
      setReady(true);
    }
  }, [isAuthenticated, router]);

  const handleUnderstand = () => {
    setOnboardingSeen();
    router.push("/");
  };

  if (!ready) return null;

  return (
    <div className="flex min-h-screen bg-[#1A1714]">
      <div className="mx-auto flex w-full max-w-lg flex-col justify-center px-6 py-12">
        {/* Starburst icon */}
        <div className="mb-6">
          <StarburstIcon />
        </div>

        {/* Heading */}
        <h1
          className="text-[28px] text-[#E8DDD3] mb-4"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 400 }}
        >
          Hey there, I&apos;m Claude.
        </h1>

        {/* Subtitle */}
        <p className="text-[#B8ADA2] text-[15px] leading-relaxed mb-2">
          I&apos;m your AI assistant for working, imagining, and deep thinking.
        </p>

        <p className="text-[#B8ADA2] text-[15px] leading-relaxed mb-6">
          Here&apos;s a few things you should know about me:
        </p>

        {/* Feature items */}
        <div className="space-y-5 mb-8">
          {/* Curious? Just ask */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <CuriousIcon />
            </div>
            <div>
              <p className="text-[#E8DDD3] text-[14px] font-semibold mb-0.5">
                Curious? Just ask
              </p>
              <p className="text-[#8A8078] text-[13px] leading-relaxed">
                Chat with me about anything from simple asks to complex ideas! Guardrails keep our chat safe.
              </p>
            </div>
          </div>

          {/* Ad-free chats */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <AdFreeIcon />
            </div>
            <div>
              <p className="text-[#E8DDD3] text-[14px] font-semibold mb-0.5">
                Ad-free chats
              </p>
              <p className="text-[#8A8078] text-[13px] leading-relaxed">
                I won&apos;t show you ads. My focus is being genuinely helpful to you.
              </p>
            </div>
          </div>

          {/* You can improve Claude for everyone */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <ImproveIcon />
            </div>
            <div>
              <p className="text-[#E8DDD3] text-[14px] font-semibold mb-0.5">
                You can improve Claude for everyone
              </p>
              <p className="text-[#8A8078] text-[13px] leading-relaxed">
                We use your chats and coding sessions to train and improve Claude. You can change this setting anytime in your{" "}
                <a href="#" className="underline hover:text-[#B8ADA2]">
                  Privacy Settings
                </a>
                .
              </p>

              {/* Help Improve Claude toggle */}
              <div className="flex items-center gap-3 mt-3">
                <ToggleSwitch checked={true} />
                <span className="text-[#B8ADA2] text-[13px]">Help Improve Claude</span>
              </div>
            </div>
          </div>
        </div>

        {/* I understand button */}
        <button
          onClick={handleUnderstand}
          className="self-start rounded-full border border-[#4A4039] bg-transparent px-6 py-2.5 text-[14px] font-medium text-[#E8DDD3] transition-colors hover:bg-[#2A2520]"
        >
          I understand
        </button>
      </div>
    </div>
  );
}
