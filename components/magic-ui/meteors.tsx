"use client"

import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface MeteorsProps {
  number?: number
  className?: string
}

export default function Meteors({ number = 20, className }: MeteorsProps) {
  const [meteors, setMeteors] = useState<Array<{
    left: string
    animationDelay: string
    animationDuration: string
  }>>([])

  useEffect(() => {
    const meteorArray = Array.from({ length: number }, () => ({
      left: Math.floor(Math.random() * (400 - -400) + -400) + "px",
      animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
      animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
    }))
    setMeteors(meteorArray)
  }, [number])

  if (meteors.length === 0) {
    return null
  }

  return (
    <>
      {meteors.map((meteor, idx) => (
        <span
          key={idx}
          className={cn(
            "absolute top-1/2 left-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor-effect rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent",
            className
          )}
          style={{
            top: "0px",
            left: meteor.left,
            animationDelay: meteor.animationDelay,
            animationDuration: meteor.animationDuration,
          } as React.CSSProperties}
        ></span>
      ))}
    </>
  )
}
