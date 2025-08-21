"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface GlobeProps {
  className?: string
  size?: number
}

export default function Globe({ className, size = 300 }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Only run on client side
    if (typeof window === 'undefined') return

    canvas.width = size
    canvas.height = size

    let rotation = 0
    const radius = size / 2 - 20
    const centerX = size / 2
    const centerY = size / 2

    // Globe data points
    const points: Array<{ lat: number; lng: number; x: number; y: number; z: number }> = []

    // Generate random points on sphere
    for (let i = 0; i < 100; i++) {
      const lat = (Math.random() - 0.5) * Math.PI
      const lng = Math.random() * 2 * Math.PI

      points.push({
        lat,
        lng,
        x: Math.cos(lat) * Math.cos(lng),
        y: Math.sin(lat),
        z: Math.cos(lat) * Math.sin(lng),
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, size, size)
      
      // Draw globe outline
      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.stroke()

      // Draw meridians
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4
        ctx.beginPath()
        ctx.strokeStyle = "rgba(59, 130, 246, 0.1)"
        ctx.lineWidth = 1
        
        for (let j = 0; j <= 100; j++) {
          const lat = (j / 100 - 0.5) * Math.PI
          const x = centerX + radius * Math.cos(lat) * Math.cos(angle + rotation)
          const y = centerY + radius * Math.sin(lat)
          const z = radius * Math.cos(lat) * Math.sin(angle + rotation)
          
          if (z > 0) {
            if (j === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }

      // Draw parallels
      for (let i = 0; i < 5; i++) {
        const lat = ((i / 4) - 0.5) * Math.PI * 0.8
        ctx.beginPath()
        ctx.strokeStyle = "rgba(59, 130, 246, 0.1)"
        
        for (let j = 0; j <= 100; j++) {
          const lng = (j / 100) * 2 * Math.PI
          const x = centerX + radius * Math.cos(lat) * Math.cos(lng + rotation)
          const y = centerY + radius * Math.sin(lat)
          const z = radius * Math.cos(lat) * Math.sin(lng + rotation)
          
          if (z > 0) {
            if (j === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }

      // Draw points
      points.forEach(point => {
        const x = centerX + radius * point.x * Math.cos(rotation) - radius * point.z * Math.sin(rotation)
        const y = centerY + radius * point.y
        const z = radius * point.x * Math.sin(rotation) + radius * point.z * Math.cos(rotation)
        
        if (z > 0) {
          const alpha = Math.max(0.1, z / radius)
          ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`
          ctx.beginPath()
          ctx.arc(x, y, 2, 0, 2 * Math.PI)
          ctx.fill()
        }
      })

      rotation += 0.005
      requestAnimationFrame(animate)
    }

    animate()
  }, [size])

  return (
    <canvas
      ref={canvasRef}
      className={cn("", className)}
      style={{ width: size, height: size }}
    />
  )
}
