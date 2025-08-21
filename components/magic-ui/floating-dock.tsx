"use client"

import { cn } from "@/lib/utils"
import { 
  Heart, 
  Shield, 
  Zap, 
  Users, 
  Brain, 
  Activity,
  Stethoscope,
  Hospital,
  UserCheck,
  Clock
} from "lucide-react"
import { useState } from "react"

interface FloatingDockProps {
  className?: string
}

export default function FloatingDock({ className }: FloatingDockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const items = [
    { icon: Heart, label: "Cardiología", color: "from-red-500 to-pink-500" },
    { icon: Brain, label: "Neurología", color: "from-purple-500 to-indigo-500" },
    { icon: Shield, label: "Seguridad", color: "from-blue-500 to-cyan-500" },
    { icon: Zap, label: "Urgencias", color: "from-yellow-500 to-orange-500" },
    { icon: Users, label: "Colaboración", color: "from-green-500 to-emerald-500" },
    { icon: Activity, label: "Monitoreo", color: "from-teal-500 to-blue-500" },
    { icon: Stethoscope, label: "Diagnóstico", color: "from-indigo-500 to-purple-500" },
    { icon: Hospital, label: "Hospital", color: "from-gray-500 to-slate-500" },
  ]

  return (
    <div className={cn(
      "fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50",
      "bg-black/20 backdrop-blur-md rounded-2xl p-2",
      "border border-white/10 shadow-2xl",
      className
    )}>
      <div className="flex items-center gap-2">
        {items.map((item, index) => {
          const Icon = item.icon
          const isHovered = hoveredIndex === index
          
          return (
            <div
              key={index}
              className="relative group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-200">
                  {item.label}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80" />
                </div>
              )}
              
              {/* Icon */}
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                "transition-all duration-300 cursor-pointer",
                "hover:scale-110 active:scale-95",
                isHovered ? "bg-gradient-to-r " + item.color : "bg-white/10 hover:bg-white/20"
              )}>
                <Icon className={cn(
                  "h-6 w-6 transition-colors duration-300",
                  isHovered ? "text-white" : "text-gray-300"
                )} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
