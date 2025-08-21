"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Heart, User, Lock, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const { login, isLoading, isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/medico/dashboard'
      router.push(redirectPath)
    }

    // Load remembered credentials
    const savedUsername = localStorage.getItem("rememberedUsername")
    const savedRememberMe = localStorage.getItem("rememberMe") === "true"
    if (savedUsername && savedRememberMe) {
      setUsername(savedUsername)
      setRememberMe(true)
    }
  }, [isAuthenticated, user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username || !password) {
      setError("Por favor ingrese usuario y contraseña")
      return
    }

    const success = await login(username, password)

    if (success) {
      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", username)
        localStorage.setItem("rememberMe", "true")
      } else {
        localStorage.removeItem("rememberedUsername")
        localStorage.removeItem("rememberMe")
      }

      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema VITAL RED",
      })
      // Redirect will be handled by useEffect
    } else {
      setError("Credenciales incorrectas")
      toast({
        title: "Error de autenticación",
        description: "Usuario o contraseña incorrectos",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300">
              <Heart className="h-10 w-10 text-white animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            VITAL RED
          </CardTitle>
          <CardDescription className="text-base text-slate-600 mt-2">
            Sistema de Referencia y Contra-referencia
            <br />
            <span className="font-semibold text-emerald-600">Hospital Universitaria ESE</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700 font-medium">
                Usuario
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingrese su usuario"
                  className="pl-10 h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="pl-10 h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <Label htmlFor="remember" className="text-sm text-slate-600">
                Recordar mis credenciales
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Iniciando sesión...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Iniciar Sesión
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-center text-sm font-medium text-slate-700 mb-2">Usuarios de prueba:</p>
            <div className="space-y-1 text-sm text-slate-600">
              <div
                className="flex items-center justify-between p-2 bg-white rounded border hover:bg-emerald-50 transition-colors cursor-pointer"
                onClick={() => {
                  setUsername("admin")
                  setPassword("admin")
                }}
              >
                <span>
                  <strong>admin/admin</strong> - Administrador
                </span>
                <User className="h-4 w-4 text-emerald-600" />
              </div>
              <div
                className="flex items-center justify-between p-2 bg-white rounded border hover:bg-blue-50 transition-colors cursor-pointer"
                onClick={() => {
                  setUsername("medico")
                  setPassword("medico")
                }}
              >
                <span>
                  <strong>medico/medico</strong> - Médico Evaluador
                </span>
                <Heart className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
