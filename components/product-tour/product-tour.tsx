"use client"

import { useEffect, useRef, useCallback } from "react"
import { driver } from "driver.js"
import type { DriveStep } from "driver.js"
import "driver.js/dist/driver.css"

interface ProductTourProps {
  isActive: boolean
  steps: DriveStep[]
  onClose: () => void
}

export function ProductTour({ isActive, steps, onClose }: ProductTourProps) {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null)

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!isActive) return

    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous"],
      animate: true,
      overlayColor: "rgba(42, 61, 44, 0.4)",
      stagePadding: 8,
      popoverClass: "zb-tour-popover",
      disableActiveInteraction: false,
      prevBtnText: "Back",
      nextBtnText: "Next",
      doneBtnText: "Finish",
      steps,
      onDestroyed: () => {
        handleClose()
      },
    })

    driverRef.current = driverObj
    driverObj.drive()

    return () => {
      driverObj.destroy()
      driverRef.current = null
    }
  }, [isActive, steps, handleClose])

  return null
}
