"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface TextRevealProps {
  text: string
  className?: string
  revealSpeed?: number
}

export default function TextReveal({ 
  text, 
  className,
  revealSpeed = 50 
}: TextRevealProps) {
  const [revealedText, setRevealedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (currentIndex < text.length) {
      intervalRef.current = setTimeout(() => {
        setRevealedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, revealSpeed)
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
      }
    }
  }, [currentIndex, text, revealSpeed])

  useEffect(() => {
    setRevealedText("")
    setCurrentIndex(0)
  }, [text])

  return (
    <span className={cn("relative", className)}>
      {revealedText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  )
}
