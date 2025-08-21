"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Heart,
  LayoutDashboard,
  Inbox,
  History,
  Users,
  Settings,
  BarChart3,
  Database,
  Mail,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

interface SidebarProps {
  userRole: "admin" | "medico"
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    router.push("/login")
  }

  const adminNavItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Gestión de Usuarios", icon: Users },
    { href: "/admin/supervision", label: "Panel de Supervisión", icon: BarChart3 },
    { href: "/admin/config", label: "Configuración", icon: Settings },
    { href: "/admin/backup", label: "Respaldo", icon: Database },
    { href: "/admin/ai-monitor", label: "Monitor de IA", icon: Mail },
  ]

  const medicoNavItems = [
    { href: "/medico/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/medico/casos", label: "Bandeja de Casos", icon: Inbox },
    { href: "/medico/urgencias", label: "Gestión de Urgencias", icon: Heart }, // Added urgencias route
    { href: "/medico/hospitalizados", label: "Pacientes Hospitalizados", icon: Users }, // Added hospitalizados route
    { href: "/medico/historial", label: "Historial", icon: History },
  ]

  const navItems = userRole === "admin" ? adminNavItems : medicoNavItems

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Heart className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-sidebar-foreground">VITAL RED</h2>
          <p className="text-xs text-muted-foreground">{userRole === "admin" ? "Administrador" : "Médico Evaluador"}</p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
