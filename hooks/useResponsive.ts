"use client"

import { useEffect, useState } from "react"

type Breakpoint = "mobile" | "tablet" | "laptop"

const TABLET_MIN = 768
const LAPTOP_MIN = 1024

const getBreakpoint = (width: number): Breakpoint => {
  if (width >= LAPTOP_MIN) return "laptop"
  if (width >= TABLET_MIN) return "tablet"
  return "mobile"
}

const getInitialWidth = () => {
  if (typeof window === "undefined") return LAPTOP_MIN
  return window.innerWidth
}

export function useResponsive() {
  const [width, setWidth] = useState(getInitialWidth)
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getBreakpoint(width))

  useEffect(() => {
    const handleResize = () => {
      const nextWidth = window.innerWidth
      setWidth(nextWidth)
      setBreakpoint(getBreakpoint(nextWidth))
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return {
    width,
    breakpoint,
    isMobile: breakpoint === "mobile",
    isTablet: breakpoint === "tablet",
    isLaptop: breakpoint === "laptop",
    isTabletOrUp: breakpoint !== "mobile",
    isLaptopOrUp: breakpoint === "laptop",
  }
}
