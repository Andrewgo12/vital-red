"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface ParticlesProps {
  className?: string
  quantity?: number
  staticity?: number
  ease?: number
  refresh?: boolean
  color?: string
  vx?: number
  vy?: number
}

export default function Particles({
  className,
  quantity = 30,
  staticity = 50,
  ease = 50,
  refresh = false,
  color = "#ffffff",
  vx = 0,
  vy = 0,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    let animationId: number
    const particles: Array<{
      x: number
      y: number
      translateX: number
      translateY: number
      size: number
      alpha: number
      targetAlpha: number
      dx: number
      dy: number
      magnetism: number
    }> = []

    // Only run on client side
    if (typeof window === 'undefined') return

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = canvas.offsetWidth * window.devicePixelRatio
        canvas.height = canvas.offsetHeight * window.devicePixelRatio
        context.scale(window.devicePixelRatio, window.devicePixelRatio)
      }
    }

    const initializeParticles = () => {
      particles.length = 0
      for (let i = 0; i < quantity; i++) {
        particles.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          translateX: 0,
          translateY: 0,
          size: Math.random() * 2 + 0.1,
          alpha: 0,
          targetAlpha: Math.random() * 0.6 + 0.1,
          dx: (Math.random() - 0.5) * 0.2,
          dy: (Math.random() - 0.5) * 0.2,
          magnetism: 0.1 + Math.random() * 4,
        })
      }
    }

    const drawParticle = (particle: typeof particles[0]) => {
      context.save()
      context.globalAlpha = particle.alpha
      context.fillStyle = color
      context.beginPath()
      context.arc(
        particle.x + particle.translateX,
        particle.y + particle.translateY,
        particle.size,
        0,
        2 * Math.PI
      )
      context.fill()
      context.restore()
    }

    const animate = () => {
      context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.dx + vx
        particle.y += particle.dy + vy

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.offsetWidth
        if (particle.x > canvas.offsetWidth) particle.x = 0
        if (particle.y < 0) particle.y = canvas.offsetHeight
        if (particle.y > canvas.offsetHeight) particle.y = 0

        // Update alpha
        if (particle.alpha < particle.targetAlpha) {
          particle.alpha += 0.02
        } else if (particle.alpha > particle.targetAlpha) {
          particle.alpha -= 0.02
        }

        drawParticle(particle)
      })

      animationId = requestAnimationFrame(animate)
    }

    resizeCanvas()
    initializeParticles()
    animate()

    const handleResize = () => {
      resizeCanvas()
      initializeParticles()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", handleResize)
    }
  }, [quantity, staticity, ease, refresh, color, vx, vy])

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
