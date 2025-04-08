"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ProgressRing } from "../../components/ui/progress-ring"
import { Play, Pause, RotateCcw } from "lucide-react"

interface RestTimerProps {
  duration: number
  onComplete?: () => void
  autoStart?: boolean
  size?: "sm" | "md" | "lg"
}

export function RestTimer({ duration, onComplete, autoStart = false, size = "md" }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isActive, setIsActive] = useState(autoStart)
  const [key, setKey] = useState(0) // Para forzar la re-renderización
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const progress = ((duration - timeLeft) / duration) * 100

  const sizeMap = {
    sm: { ring: 60, text: "text-lg", buttons: "h-7 w-7" },
    md: { ring: 100, text: "text-2xl", buttons: "h-8 w-8" },
    lg: { ring: 140, text: "text-4xl", buttons: "h-9 w-9" },
  }

  const { ring, text, buttons } = sizeMap[size]

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current as NodeJS.Timeout)
            setIsActive(false)
            onComplete?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, onComplete])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(duration)
    setKey((prev) => prev + 1)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div key={key} className="flex flex-col items-center">
      <ProgressRing progress={progress} size={ring} strokeWidth={ring * 0.1} foreground="stroke-primary">
        <span className={`font-mono font-bold ${text}`}>{formatTime(timeLeft)}</span>
      </ProgressRing>

      <div className="flex gap-2 mt-2">
        <Button variant="outline" size="icon" onClick={toggleTimer} className={buttons}>
          {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="icon" onClick={resetTimer} className={buttons}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

