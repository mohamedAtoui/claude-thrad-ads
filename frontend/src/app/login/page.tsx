"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { hasSeenOnboarding } from "@/lib/auth"
import { ChevronDown } from "lucide-react"

/* ── ClaudeLogo (from login-page-box/components/navbar.tsx) ── */
function ClaudeLogo() {
  return (
    <div className="flex items-center -space-x-1">
      <img src="/claude-thrad-logo.svg" alt="Thrad" width={52} height={52} className="-mr-1 -mt-1" />
      <span className="text-white text-3xl tracking-tight" style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 400 }}>Claude</span>
    </div>
  )
}

/* ── Navbar (from login-page-box/components/navbar.tsx) ── */
const navItems = [
  "Meet Claude",
  "Platform",
  "Solutions",
  "Pricing",
  "Learn",
]

function Navbar() {
  return (
    <header className="py-4">
      <div className="mx-auto flex max-w-[90rem] items-center justify-between" style={{ width: "calc(100% - 2 * clamp(2rem, calc(1.43rem + 2.86vw), 4rem))" }}>
      <ClaudeLogo />

      <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            key={item}
            type="button"
            className="flex items-center gap-1 rounded-full px-4 py-2 text-sm text-[#B8ADA2] transition-colors hover:text-[#E8DDD3]"
          >
            {item}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        ))}

        <button
          type="button"
          className="ml-4 rounded-full bg-transparent px-5 py-2 text-sm font-medium text-[#E8DDD3] transition-colors hover:bg-[#2A2520]"
        >
          Contact sales
        </button>

        <button
          type="button"
          className="ml-1 rounded-xl bg-white px-5 py-2 text-sm font-medium text-[#1A1714] transition-colors hover:bg-[#E8DDD3]"
        >
          Try Claude
        </button>
      </nav>
      </div>
    </header>
  )
}

/* ── GoogleIcon (from login-page-box/components/login-box.tsx) ── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.26c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  )
}

/* ── LoginBox (from login-page-box/components/login-box.tsx + auth) ── */
function LoginBox() {
  const [email, setEmail] = useState("")
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [step, setStep] = useState<"email" | "code">("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { sendCode, verifyCode } = useAuth()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const code = digits.join("")

  const handleDigitChange = (index: number, value: string) => {
    // Handle pasting a full code
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6)
      const newDigits = [...digits]
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || ""
      }
      setDigits(newDigits)
      const focusIdx = Math.min(pasted.length, 5)
      inputRefs.current[focusIdx]?.focus()
      return
    }

    const digit = value.replace(/\D/g, "")
    const newDigits = [...digits]
    newDigits[index] = digit
    setDigits(newDigits)

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError("")
    try {
      await sendCode(email.trim())
      setStep("code")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    setError("")
    try {
      await verifyCode(email.trim(), code.trim())
      router.push(hasSeenOnboarding() ? "/" : "/onboarding")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const handleBackToEmail = () => {
    setStep("email")
    setDigits(["", "", "", "", "", ""])
    setError("")
  }

  return (
    <div className="mx-4 sm:mx-auto max-w-md min-w-[20rem]">
      <div className="rounded-[2rem] border border-[#3A3530] p-7 text-center flex flex-col space-y-2">
        {step === "email" ? (
          <>
            {/* Google button */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#3A3530] bg-[#2A2520] px-4 py-3 text-sm font-medium text-[#E8DDD3] transition-colors hover:bg-[#352F29]"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* OR divider */}
            <div className="flex items-center gap-3 py-4">
              <div className="h-px flex-1 bg-[#3A3530]" />
              <span className="text-xs font-medium tracking-wider text-[#7A7067]">OR</span>
              <div className="h-px flex-1 bg-[#3A3530]" />
            </div>

            {/* Email input */}
            <form onSubmit={handleSendCode}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#3A3530] bg-[#221E1A] px-4 py-3 text-sm text-[#E8DDD3] placeholder-[#6A6058] outline-none transition-colors focus:border-[#D97757]"
                required
              />

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="mt-3 w-full rounded-lg bg-[#E8DDD3] px-4 py-3 text-sm font-medium text-[#1A1714] transition-colors hover:bg-[#D5C9BD] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending code..." : "Continue with email"}
              </button>
              {error && (
                <p className="text-red-400 text-xs mt-2 text-center">{error}</p>
              )}
            </form>

            {/* Privacy policy */}
            <p className="mt-4 text-center text-xs text-[#7A7067]">
              {"By continuing, you acknowledge Anthropic's "}
              <a href="#" className="underline hover:text-[#B8ADA2]">
                Privacy Policy
              </a>
              .
            </p>
          </>
        ) : (
          <>
            {/* Code verification step */}
            <p className="text-sm text-[#B8ADA2]">
              We sent a code to{" "}
              <span className="font-medium text-[#E8DDD3]">{email}</span>
            </p>

            <form onSubmit={handleVerifyCode} className="mt-4">
              <div className="flex justify-center gap-2">
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(i, e)}
                    autoFocus={i === 0}
                    className="h-12 w-10 rounded-lg border border-[#3A3530] bg-[#221E1A] text-center text-xl font-mono text-[#E8DDD3] outline-none transition-colors focus:border-[#D97757]"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="mt-3 w-full rounded-lg bg-[#E8DDD3] px-4 py-3 text-sm font-medium text-[#1A1714] transition-colors hover:bg-[#D5C9BD] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify code"}
              </button>
              {error && (
                <p className="text-red-400 text-xs mt-2 text-center">{error}</p>
              )}
            </form>

            <button
              type="button"
              onClick={handleBackToEmail}
              className="mt-2 text-xs text-[#D97757] hover:text-[#E8886A] transition-colors"
            >
              Use a different email
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Page (from login-page-box/app/page.tsx — HeroImage swapped for video) ── */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#1A1714]">
      <Navbar />

      <main className="flex flex-1 items-center">
        <div className="mx-auto grid max-w-[90rem] flex-1 gap-10 lg:grid-cols-2" style={{ width: "calc(100% - 2 * clamp(2rem, calc(1.43rem + 2.86vw), 4rem))" }}>
          {/* Left side - heading + login */}
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-center text-white mt-12 text-[1.75rem] min-[350px]:text-[3.2rem] min-[500px]:text-[3.5rem] select-none" style={{ fontFamily: "'Times New Roman', Times, serif", fontFeatureSettings: "'liga' 1" }}>
              The AI for
              <br />
              problem solvers
            </h2>

            <div className="mt-8">
              <LoginBox />
            </div>
          </div>

          {/* Right side - video (replaces HeroImage) */}
          <div className="hidden h-[calc(100vh-100px)] py-4 lg:block">
            <div className="relative h-full w-full overflow-hidden rounded-2xl">
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src="/claude_login_v2.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
