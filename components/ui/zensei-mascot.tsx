// components/ZenseiMascot.tsx
'use client'

import React from 'react'
import { motion, Variants } from 'framer-motion'

export type ZenseiPose = 'thinking' | 'worried' | 'cheerful' | 'celebration'

interface ZenseiMascotProps {
  pose?: ZenseiPose
  className?: string
}

const bodyVariants: Variants = {
  thinking: {
    rotate: [-2, 3, -2],
    y: [0, -3, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  worried: {
    x: [-1.5, 1.5, -1.5, 1.5, 0],
    y: [0, 1, 0],
    transition: { duration: 0.5, repeat: Infinity, ease: 'linear' },
  },
  cheerful: {
    y: [0, -5, 0],
    scaleY: [1, 0.97, 1.02, 1],
    transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
  },
  celebration: {
    y: [0, -12, 0],
    rotate: [0, -5, 5, 0],
    scale: [1, 1.04, 1],
    transition: { duration: 0.95, repeat: Infinity, ease: 'easeOut' },
  },
}

export default function ZenseiMascot({
  pose = 'cheerful',
  className = '',
}: ZenseiMascotProps) {
  const isHappy = pose === 'cheerful' || pose === 'celebration'

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${
        className || 'w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32'
      }`}
      role="img"
      aria-label={`Zensei mascot in ${pose} pose`}
    >
      <motion.svg
        viewBox="0 0 130 130"
        className="w-full h-full overflow-visible"
        initial={false}
        animate={pose}
      >
        {/* Soft Ground Shadow */}
        <motion.ellipse
          cx="65"
          cy="120"
          rx="22"
          ry="4"
          fill="rgba(90, 62, 49, 0.12)"
          variants={{
            thinking: { scaleX: [1, 0.95, 1] },
            worried: { scaleX: 1 },
            cheerful: { scaleX: [1, 0.88, 1] },
            celebration: { scaleX: [1, 0.72, 1] },
          }}
        />

        <motion.g variants={bodyVariants} style={{ originX: '65px', originY: '80px' }}>
          {/* Stubby Legs (Warm Terracotta) */}
          <path
            d="M 54 103 L 52 114 C 52 116.5, 57 116.5, 57 114 L 58 104"
            fill="#C9645B"
            stroke="#9E473F"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 76 103 L 78 114 C 78 116.5, 73 116.5, 73 114 L 72 104"
            fill="#C9645B"
            stroke="#9E473F"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Left Arm */}
          {pose === 'celebration' ? (
            <motion.path
              d="M 35 68 Q 20 54 24 43"
              fill="none"
              stroke="#9E473F"
              strokeWidth="4.5"
              strokeLinecap="round"
              animate={{ rotate: [-8, 8, -8] }}
              transition={{ duration: 0.45, repeat: Infinity }}
              style={{ originX: '35px', originY: '68px' }}
            />
          ) : (
            <path
              d={
                pose === 'worried'
                  ? 'M 35 70 Q 27 78 37 82'
                  : 'M 35 70 Q 23 75 27 83'
              }
              fill="none"
              stroke="#9E473F"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          )}

          {/* Right Arm & Mini Kawaii Matcha Cup */}
          {pose === 'thinking' && (
            <path
              d="M 94 70 Q 90 83 74 80"
              fill="none"
              stroke="#9E473F"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          )}
          {pose === 'worried' && (
            <path
              d="M 95 70 Q 103 78 93 82"
              fill="none"
              stroke="#9E473F"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          )}
          {isHappy && (
            <g>
              <path
                d="M 95 68 Q 106 62 108 54"
                fill="none"
                stroke="#9E473F"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              {/* Mini Matcha Cup matching your illustration */}
              <g transform="translate(101, 38)">
                {/* Steam wisps */}
                <path
                  d="M 5 -2 Q 4 -6 6 -9 M 10 -3 Q 9 -7 11 -10 M 15 -2 Q 14 -6 16 -9"
                  fill="none"
                  stroke="#C8C0B4"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                {/* Cup body */}
                <path
                  d="M 2 2 L 18 2 L 16 18 C 16 19.5, 4 19.5, 4 18 Z"
                  fill="#B7C9B0"
                  stroke="#829A7B"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {/* Cream rim */}
                <ellipse
                  cx="10"
                  cy="2"
                  rx="8"
                  ry="2.2"
                  fill="#FAF7F0"
                  stroke="#829A7B"
                  strokeWidth="1.8"
                />
                {/* Tiny cup face */}
                <circle cx="7.5" cy="10" r="1" fill="#5A3E31" />
                <circle cx="12.5" cy="10" r="1" fill="#5A3E31" />
                <path
                  d="M 8.8 12 Q 10 13.5 11.2 12"
                  fill="none"
                  stroke="#5A3E31"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </g>
            </g>
          )}

          {/* Strawberry Body (Exact muted coral & rounded-taper silhouette) */}
          <path
            d="M 65 36 C 42 36, 30 48, 33 69 C 36 89, 53 106, 65 106 C 77 106, 94 89, 97 69 C 100 48, 88 36, 65 36 Z"
            fill="#C9645B"
            stroke="#9E473F"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Cream Oval Seeds */}
          <g fill="#F5EFE6">
            <ellipse cx="47" cy="49" rx="1.6" ry="2.4" />
            <ellipse cx="65" cy="52" rx="1.6" ry="2.4" />
            <ellipse cx="83" cy="49" rx="1.6" ry="2.4" />
            <ellipse cx="41" cy="60" rx="1.6" ry="2.4" />
            <ellipse cx="89" cy="60" rx="1.6" ry="2.4" />
            <ellipse cx="44" cy="84" rx="1.6" ry="2.4" />
            <ellipse cx="86" cy="84" rx="1.6" ry="2.4" />
            <ellipse cx="55" cy="91" rx="1.6" ry="2.4" />
            <ellipse cx="75" cy="91" rx="1.6" ry="2.4" />
            <ellipse cx="65" cy="97" rx="1.6" ry="2.4" />
          </g>

          {/* Stem & Sage Leafy Cap */}
          <g strokeLinecap="round" strokeLinejoin="round">
            {/* Curved Brown Stem */}
            <path
              d="M 64 31 Q 63 22 68 18"
              fill="none"
              stroke="#6B4E3D"
              strokeWidth="4.5"
            />
            {/* Soft Sage Crown Leaves */}
            <path
              d="M 65 31 C 57 25, 45 27, 44 33 C 50 34, 53 35, 48 41 C 54 41, 59 38, 65 44 C 71 38, 76 41, 82 41 C 77 35, 80 34, 86 33 C 85 27, 73 25, 65 31 Z"
              fill="#A3BE98"
              stroke="#7D9B72"
              strokeWidth="2.8"
            />
          </g>

          {/* Large Pastel Blush Circles */}
          <circle cx="46" cy="74" r="5.5" fill="#E8B4AE" opacity="0.85" />
          <circle cx="84" cy="74" r="5.5" fill="#E8B4AE" opacity="0.85" />

          {/* Eyes (Warm Espresso Brown) */}
          {isHappy ? (
            <g fill="none" stroke="#5A3E31" strokeWidth="2.8" strokeLinecap="round">
              <path d="M 50 69 Q 54 64 58 69" />
              <path d="M 72 69 Q 76 64 80 69" />
            </g>
          ) : (
            <g fill="#5A3E31">
              <circle cx="54" cy={pose === 'thinking' ? '66' : '68'} r="3.2" />
              <circle cx="76" cy={pose === 'thinking' ? '66' : '68'} r="3.2" />
            </g>
          )}

          {/* Worried Eyebrows */}
          {pose === 'worried' && (
            <g stroke="#5A3E31" strokeWidth="2.2" strokeLinecap="round">
              <line x1="48" y1="61" x2="56" y2="59" />
              <line x1="82" y1="61" x2="74" y2="59" />
            </g>
          )}

          {/* Round Glasses (Espresso Brown Frames) */}
          <g fill="rgba(250, 247, 240, 0.2)" stroke="#5A3E31" strokeWidth="2.4">
            <circle cx="54" cy="68" r="9.2" />
            <circle cx="76" cy="68" r="9.2" />
            {/* Bridge & Temples */}
            <path d="M 63.2 68 Q 65 66.5 66.8 68" fill="none" />
            <line x1="39" y1="66" x2="44.8" y2="67.5" />
            <line x1="85.2" y1="67.5" x2="91" y2="66" />
          </g>

          {/* Mouth */}
          {pose === 'thinking' && (
            <circle cx="66" cy="78" r="2.2" fill="#5A3E31" />
          )}
          {pose === 'worried' && (
            <path
              d="M 60 80 Q 65 76 70 80"
              fill="none"
              stroke="#5A3E31"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}
          {pose === 'cheerful' && (
            <path
              d="M 60 76 Q 65 82 70 76"
              fill="none"
              stroke="#5A3E31"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          )}
          {pose === 'celebration' && (
            <path
              d="M 59 75 Q 65 84 71 75 Z"
              fill="#9E473F"
              stroke="#5A3E31"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
          )}
        </motion.g>

        {/* POSE OVERLAY 1: Thinking Question Mark */}
        {pose === 'thinking' && (
          <motion.g
            animate={{ y: [0, -4, 0], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <circle cx="94" cy="34" r="2" fill="#7D9B72" />
            <circle cx="100" cy="27" r="2.8" fill="#7D9B72" />
            <text
              x="104"
              y="22"
              fontSize="16"
              fontWeight="bold"
              fill="#5A3E31"
              fontFamily="sans-serif"
            >
              ?
            </text>
          </motion.g>
        )}

        {/* POSE OVERLAY 2: Worried Sweat Drop */}
        {pose === 'worried' && (
          <motion.path
            d="M 94 46 C 94 46 90 52 90 55 C 90 57.2 91.8 59 94 59 C 96.2 59 98 57.2 98 55 C 98 52 94 46 94 46 Z"
            fill="#93C5FD"
            stroke="#60A5FA"
            strokeWidth="1.5"
            animate={{ y: [0, 5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* POSE OVERLAY 3: Pastel Celebration Confetti */}
        {pose === 'celebration' && (
          <g>
            <motion.circle
              cx="26"
              cy="28"
              r="3"
              fill="#FCD34D"
              animate={{ y: [-2, 6, -2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            />
            <motion.rect
              x="98"
              y="18"
              width="5"
              height="5"
              rx="1.5"
              fill="#A3BE98"
              animate={{ y: [-3, 7, -3], rotate: [0, 90, 180] }}
              transition={{ duration: 1.3, repeat: Infinity }}
            />
            <motion.circle
              cx="40"
              cy="16"
              r="2.8"
              fill="#E8B4AE"
              animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
            />
            <motion.circle
              cx="85"
              cy="14"
              r="2.5"
              fill="#C9645B"
              animate={{ y: [-2, 6, -2], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </g>
        )}
      </motion.svg>
    </div>
  )
}