"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

interface GridPatternProps {
  width?: any
  height?: any
  x?: any
  y?: any
  strokeDasharray?: any
  numSquares?: number
  className?: string
  maxOpacity?: number
  duration?: number
  repeatDelay?: number
  [key: string]: any
}

export function GridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 50,
  className,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay = 0.5,
  ...props
}: GridPatternProps) {
  const id = useId()
  const containerRef = useId()

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full stroke-gray-300/30 [mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      <svg x={x} y={y} className="overflow-visible">
        {Array.from({ length: numSquares }, (_, i) => (
          <rect
            strokeWidth="0"
            key={`${containerRef}-${i}`}
            width={width - 1}
            height={height - 1}
            x={`${i % Math.floor(2000 / width) * width + 1}`}
            y={`${Math.floor(i / Math.floor(2000 / width)) * height + 1}`}
            fill="url(#gradient)"
            fillOpacity={maxOpacity}
            className="animate-pulse"
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${duration}s`,
            }}
          />
        ))}
      </svg>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  )
}
