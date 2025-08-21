"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface SparklesProps {
  className?: string
  size?: number
  minSize?: number
  density?: number
  speed?: number
  color?: string
}

export default function Sparkles({
  className,
  size = 1.2,
  minSize = 0.6,
  density = 800,
  speed = 1.2,
  color = "#FFC700",
}: SparklesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Only run on client side
    if (typeof window === 'undefined') return

    let animationId: number
    const sparkles: Array<{
      x: number
      y: number
      size: number
      alpha: number
      decay: number
      velocity: { x: number; y: number }
    }> = []

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = canvas.offsetWidth * window.devicePixelRatio
        canvas.height = canvas.offsetHeight * window.devicePixelRatio
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      }
    }

    const createSparkle = () => {
      return {
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        size: Math.random() * (size - minSize) + minSize,
        alpha: Math.random() * 0.8 + 0.2,
        decay: Math.random() * 0.02 + 0.005,
        velocity: {
          x: (Math.random() - 0.5) * speed,
          y: (Math.random() - 0.5) * speed,
        },
      }
    }

    const drawSparkle = (sparkle: typeof sparkles[0]) => {
      ctx.save()
      ctx.globalAlpha = sparkle.alpha
      ctx.fillStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur = sparkle.size * 2
      
      // Draw star shape
      const spikes = 4
      const outerRadius = sparkle.size
      const innerRadius = sparkle.size * 0.4
      
      ctx.beginPath()
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (i * Math.PI) / spikes
        const x = sparkle.x + Math.cos(angle) * radius
        const y = sparkle.y + Math.sin(angle) * radius
        
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Add new sparkles
      if (Math.random() < 0.3 && sparkles.length < density / 100) {
        sparkles.push(createSparkle())
      }

      // Update and draw sparkles
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const sparkle = sparkles[i]
        
        sparkle.x += sparkle.velocity.x
        sparkle.y += sparkle.velocity.y
        sparkle.alpha -= sparkle.decay
        
        if (sparkle.alpha <= 0 || 
            sparkle.x < 0 || sparkle.x > canvas.offsetWidth ||
            sparkle.y < 0 || sparkle.y > canvas.offsetHeight) {
          sparkles.splice(i, 1)
        } else {
          drawSparkle(sparkle)
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    resizeCanvas()
    animate()

    const handleResize = () => {
      resizeCanvas()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", handleResize)
    }
  }, [size, minSize, density, speed, color])

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
