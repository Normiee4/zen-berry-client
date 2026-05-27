"use client"

type MascotState = "idle" | "thinking" | "speaking"

interface ZenseiMascotProps {
  state?: MascotState
  size?: number
}

export function ZenseiMascot({ state = "idle", size = 40 }: ZenseiMascotProps) {
  const animationClass =
    state === "thinking"
      ? "animate-thinking"
      : state === "speaking"
        ? "animate-speaking"
        : "animate-idle"

  const glowClass = state === "speaking" ? "drop-shadow-[0_0_8px_rgba(134,167,136,0.5)]" : ""

  return (
    <div
      className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-strawberry/30 ${animationClass} ${glowClass}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 120 120"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="strawberryGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFCFCF" />
            <stop offset="100%" stopColor="#FF9E9E" />
          </linearGradient>
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#86A788" />
            <stop offset="100%" stopColor="#5A7A5C" />
          </linearGradient>
        </defs>

        {/* Strawberry body */}
        <path
          d="M60 20 C30 45 20 80 20 95 C20 110 35 115 60 115 C85 115 100 110 100 95 C100 80 90 45 60 20Z"
          fill="url(#strawberryGrad)"
        />

        {/* Seeds */}
        <circle cx="45" cy="60" r="2.5" fill="#FEFCF3" opacity="0.5" />
        <circle cx="60" cy="50" r="2.5" fill="#FEFCF3" opacity="0.5" />
        <circle cx="75" cy="60" r="2.5" fill="#FEFCF3" opacity="0.5" />
        <circle cx="50" cy="80" r="2.5" fill="#FEFCF3" opacity="0.5" />
        <circle cx="70" cy="80" r="2.5" fill="#FEFCF3" opacity="0.5" />
        <circle cx="60" cy="70" r="2" fill="#FEFCF3" opacity="0.5" />
        <circle cx="42" cy="72" r="2" fill="#FEFCF3" opacity="0.5" />
        <circle cx="78" cy="72" r="2" fill="#FEFCF3" opacity="0.5" />

        {/* Face */}
        {/* Eyes */}
        <circle cx="48" cy="62" r="5" fill="#2D3A2D" />
        <circle cx="72" cy="62" r="5" fill="#2D3A2D" />
        {/* Eye shine */}
        <circle cx="47" cy="60.5" r="2" fill="white" opacity="0.7" />
        <circle cx="71" cy="60.5" r="2" fill="white" opacity="0.7" />
        {/* Blush */}
        <ellipse cx="38" cy="72" rx="6" ry="4" fill="#FF8A8A" opacity="0.35" />
        <ellipse cx="82" cy="72" rx="6" ry="4" fill="#FF8A8A" opacity="0.35" />
        {/* Smile */}
        <path
          d="M52 76 Q60 84 68 76"
          stroke="#2D3A2D"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Leaf crown */}
        <path d="M60 20 Q52 8 44 14 Q52 24 60 20Z" fill="url(#leafGrad)" />
        <path d="M60 20 Q68 8 76 14 Q68 24 60 20Z" fill="url(#leafGrad)" />
        <path d="M60 20 Q60 5 64 2 Q60 16 60 20Z" fill="url(#leafGrad)" />
        {/* Stem */}
        <line x1="60" y1="5" x2="60" y2="-5" stroke="#5A7A5C" strokeWidth="3.5" strokeLinecap="round" />

        {/* Thinking indicators */}
        {state === "thinking" && (
          <>
            <circle cx="95" cy="30" r="3" fill="#86A788" opacity="0.4" className="animate-ping" style={{ animationDelay: "0s" }} />
            <circle cx="105" cy="22" r="2.5" fill="#86A788" opacity="0.3" className="animate-ping" style={{ animationDelay: "0.3s" }} />
            <circle cx="112" cy="12" r="2" fill="#86A788" opacity="0.2" className="animate-ping" style={{ animationDelay: "0.6s" }} />
          </>
        )}

        {/* Speaking indicator - gentle glow ring */}
        {state === "speaking" && (
          <circle
            cx="60"
            cy="65"
            r="45"
            fill="none"
            stroke="#86A788"
            strokeWidth="1.5"
            opacity="0.3"
            className="animate-ping"
            style={{ animationDuration: "2s" }}
          />
        )}
      </svg>
    </div>
  )
}
