"use client"

export function MatchaCupIllustration() {
  return (
    <div className="relative">
      {/* Floating illustration */}
      <div className="animate-bounce-slow">
        <svg
          width="120"
          height="140"
          viewBox="0 0 120 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* Cup Body */}
          <path
            d="M20 50C20 50 15 130 60 130C105 130 100 50 100 50H20Z"
            fill="#E88D8D"
            stroke="#D97E7E"
            strokeWidth="2"
          />

          {/* Matcha Layer */}
          <path
            d="M25 55C25 55 22 100 60 100C98 100 95 55 95 55H25Z"
            fill="#86A788"
          />

          {/* Cream/Foam Top */}
          <ellipse cx="60" cy="50" rx="40" ry="12" fill="#FFF5E6" stroke="#E8DFD0" strokeWidth="1.5" />

          {/* Strawberry on top */}
          <ellipse cx="70" cy="45" rx="8" ry="6" fill="#B84A4A" />
          <path d="M70 39L72 35M68 39L66 36M70 39L70 34" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" />

          {/* Cute Face */}
          <ellipse cx="45" cy="75" rx="4" ry="5" fill="#2D3A2D" />
          <ellipse cx="75" cy="75" rx="4" ry="5" fill="#2D3A2D" />

          {/* Eye shine */}
          <circle cx="46" cy="73" r="1.5" fill="white" />
          <circle cx="76" cy="73" r="1.5" fill="white" />

          {/* Blush */}
          <ellipse cx="35" cy="82" rx="6" ry="3" fill="#FDE4E4" opacity="0.7" />
          <ellipse cx="85" cy="82" rx="6" ry="3" fill="#FDE4E4" opacity="0.7" />

          {/* Smile */}
          <path
            d="M52 88C52 88 56 94 60 94C64 94 68 88 68 88"
            stroke="#2D3A2D"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Straw */}
          <rect x="78" y="20" width="6" height="50" rx="3" fill="#86A788" />
          <rect x="78" y="20" width="6" height="8" rx="3" fill="#B8D4B8" />
        </svg>
      </div>

      {/* Sparkles around the cup */}
      <div className="absolute -right-2 top-4 animate-pulse">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" fill="#E8B84B" />
        </svg>
      </div>
      <div className="absolute -left-3 top-8 animate-pulse delay-150">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" fill="#E88D8D" />
        </svg>
      </div>
    </div>
  )
}
