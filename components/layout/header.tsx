"use client"

import { User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationSystem } from "@/components/notifications/notification-system"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

interface HeaderProps {
  title: string
  userRole: "admin" | "medico"
}

export function Header({ title, userRole }: HeaderProps) {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const userName = user?.name || (userRole === "admin" ? "Administrador Sistema" : "Dr. Médico Evaluador")

  const handleLogout = () => {
    logout()
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    })
  }

  return (
    <header className="flex h-16 items-center justify-between px-6 bg-background border-b border-border">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <NotificationSystem />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configuración</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
