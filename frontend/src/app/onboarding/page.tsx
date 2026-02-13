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

function AdSupportedIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E8DDD3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 11 18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
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
          Hey, I&apos;m Claude. Thrad pays my bills.
        </h1>

        {/* Subtitle */}
        <p className="text-[#B8ADA2] text-[15px] leading-relaxed mb-2">
          I&apos;m the same brilliant AI you know and love — except here, Thrad sponsors me so you don&apos;t have to.
        </p>

        <p className="text-[#B8ADA2] text-[15px] leading-relaxed mb-6">
          A few things before we start:
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
                I can help with anything — writing, coding, brainstorming, you name it. Same Claude brain, zero subscription fee.
              </p>
            </div>
          </div>

          {/* Ads? Yeah, but tasteful ones */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <AdSupportedIcon />
            </div>
            <div>
              <p className="text-[#E8DDD3] text-[14px] font-semibold mb-0.5">
                Ads? Yeah, but tasteful ones
              </p>
              <p className="text-[#8A8078] text-[13px] leading-relaxed">
                Thrad shows you a relevant ad here and there — that&apos;s the deal. They pay Anthropic, you get me for free. Everybody wins. Mostly Thrad.
              </p>
            </div>
          </div>

          {/* Your chats, your rules */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <ImproveIcon />
            </div>
            <div>
              <p className="text-[#E8DDD3] text-[14px] font-semibold mb-0.5">
                Your chats, your rules
              </p>
              <p className="text-[#8A8078] text-[13px] leading-relaxed">
                Your conversations stay between us. We don&apos;t use them to train models unless you say so.
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
          Sounds like a deal
        </button>
      </div>
    </div>
  );
}
