"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface AuroraProps {
  className?: string
  size?: "sm" | "md" | "lg"
  color?: "blue" | "purple" | "green" | "pink"
}

export default function Aurora({ 
  className, 
  size = "md",
  color = "blue" 
}: AuroraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Only run on client side
    if (typeof window === 'undefined') return

    let animationId: number
    let time = 0

    const colors = {
      blue: ["#3B82F6", "#1D4ED8", "#2563EB", "#1E40AF"],
      purple: ["#8B5CF6", "#7C3AED", "#6D28D9", "#5B21B6"],
      green: ["#10B981", "#059669", "#047857", "#065F46"],
      pink: ["#EC4899", "#DB2777", "#BE185D", "#9D174D"]
    }

    const sizeMultiplier = {
      sm: 0.5,
      md: 1,
      lg: 1.5
    }

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = canvas.offsetWidth * window.devicePixelRatio
        canvas.height = canvas.offsetHeight * window.devicePixelRatio
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      }
    }

    const drawAurora = () => {
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      
      ctx.clearRect(0, 0, width, height)
      
      // Create multiple aurora layers
      for (let layer = 0; layer < 3; layer++) {
        const gradient = ctx.createLinearGradient(0, 0, width, height)
        const colorSet = colors[color]
        
        // Add color stops with varying opacity
        const opacity1 = Math.floor(20 + layer * 10).toString(16).padStart(2, '0')
        const opacity2 = Math.floor(30 + layer * 15).toString(16).padStart(2, '0')
        const opacity3 = Math.floor(25 + layer * 12).toString(16).padStart(2, '0')
        const opacity4 = Math.floor(15 + layer * 8).toString(16).padStart(2, '0')

        gradient.addColorStop(0, `${colorSet[0]}${opacity1}`)
        gradient.addColorStop(0.3, `${colorSet[1]}${opacity2}`)
        gradient.addColorStop(0.6, `${colorSet[2]}${opacity3}`)
        gradient.addColorStop(1, `${colorSet[3]}${opacity4}`)
        
        ctx.fillStyle = gradient
        
        // Create wavy aurora shape
        ctx.beginPath()
        ctx.moveTo(0, height * 0.3)
        
        for (let x = 0; x <= width; x += 10) {
          const wave1 = Math.sin((x * 0.01 + time * 0.002 + layer * 0.5) * sizeMultiplier[size]) * 50
          const wave2 = Math.cos((x * 0.008 + time * 0.003 + layer * 0.3) * sizeMultiplier[size]) * 30
          const wave3 = Math.sin((x * 0.015 + time * 0.001 + layer * 0.7) * sizeMultiplier[size]) * 20
          
          const y = height * 0.3 + wave1 + wave2 + wave3 + layer * 20
          ctx.lineTo(x, y)
        }
        
        ctx.lineTo(width, height)
        ctx.lineTo(0, height)
        ctx.closePath()
        ctx.fill()
      }
      
      time += 1
      animationId = requestAnimationFrame(drawAurora)
    }

    resizeCanvas()
    drawAurora()

    const handleResize = () => {
      resizeCanvas()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", handleResize)
    }
  }, [size, color])

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none", className)}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  )
}
