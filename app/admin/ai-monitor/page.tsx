"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Mail,
  Brain,
  RefreshCw,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Play,
  Pause,
  Activity,
  BarChart3,
  TrendingUp,
  Filter,
  Download,
  Trash2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AIMonitorPage() {
  const { toast } = useToast()
  const [isCapturing, setIsCapturing] = useState(true)
  const [lastSync, setLastSync] = useState("2024-01-15 16:45:30")
  const [selectedEmail, setSelectedEmail] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [confidenceMin, setConfidenceMin] = useState("")
  const [confidenceMax, setConfidenceMax] = useState("")
  const [senderFilter, setSenderFilter] = useState("")

  const [aiConfig, setAiConfig] = useState({
    enabled: true,
    interval: 5, // minutes
    account: "referencia@hospitalesE.com",
    oauthConfigured: true,
    autoRetry: true,
    maxRetries: 3,
  })

  const emailQueue = [
    {
      id: 1,
      subject: "Referencia Urgente - Paciente María Rodríguez",
      sender: "dr.mendoza@hospitalsanjose.com",
      receivedAt: "2024-01-15 16:30:00",
      status: "Procesado",
      confidence: 0.95,
      extractedData: {
        patientName: "María Elena Rodríguez",
        age: 45,
        diagnosis: "Dolor torácico agudo",
        priority: "Alta",
        institution: "Hospital San José",
        doctor: "Dr. Carlos Mendoza",
      },
      attachments: 2,
      processingTime: "2.3s",
    },
    {
      id: 2,
      subject: "Solicitud de Traslado - Caso Neurológico",
      sender: "emergencias@clinicacentral.com",
      receivedAt: "2024-01-15 16:15:00",
      status: "Procesado",
      confidence: 0.88,
      extractedData: {
        patientName: "Carlos Alberto Pérez",
        age: 62,
        diagnosis: "Accidente cerebrovascular",
        priority: "Alta",
        institution: "Clínica Central",
        doctor: "Dra. Ana Martínez",
      },
      attachments: 1,
      processingTime: "3.1s",
    },
    {
      id: 3,
      subject: "Re: Información adicional paciente López",
      sender: "ginecologia@centronorte.com",
      receivedAt: "2024-01-15 16:00:00",
      status: "Error",
      confidence: 0.45,
      extractedData: null,
      attachments: 0,
      processingTime: "1.8s",
      error: "Formato de correo no reconocido - falta información estructurada",
    },
    {
      id: 4,
      subject: "Referencia - Fractura Compleja",
      sender: "ortopedia@clinicavalle.com",
      receivedAt: "2024-01-15 15:45:00",
      status: "Pendiente",
      confidence: null,
      extractedData: null,
      attachments: 3,
      processingTime: null,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Procesado":
        return "bg-green-100 text-green-800"
      case "Error":
        return "bg-red-100 text-red-800"
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "Procesando":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Procesado":
        return <CheckCircle className="h-4 w-4" />
      case "Error":
        return <AlertTriangle className="h-4 w-4" />
      case "Pendiente":
        return <Clock className="h-4 w-4" />
      case "Procesando":
        return <RefreshCw className="h-4 w-4 animate-spin" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600"
    if (confidence >= 0.7) return "text-yellow-600"
    return "text-red-600"
  }

  const handleToggleCapture = () => {
    setIsCapturing(!isCapturing)
    toast({
      title: isCapturing ? "Captura pausada" : "Captura activada",
      description: isCapturing ? "La captura automática de correos ha sido pausada" : "La captura automática de correos ha sido activada",
    })
  }

  const handleManualSync = () => {
    setLastSync(new Date().toLocaleString())
    toast({
      title: "Sincronización manual",
      description: "Sincronización de correos completada exitosamente",
    })
  }

  const handleRetryEmail = (emailId: number) => {
    // Find and update email status
    const emailIndex = emailQueue.findIndex(e => e.id === emailId)
    if (emailIndex !== -1) {
      // In a real app, this would trigger actual retry logic
      toast({
        title: "Reintento iniciado",
        description: `Reintentando procesamiento del correo ID: ${emailId}`,
      })
    }
  }

  const handleDownloadEmail = (emailId: number) => {
    const email = emailQueue.find(e => e.id === emailId)
    if (email) {
      toast({
        title: "Descarga iniciada",
        description: `Descargando correo: ${email.subject}`,
      })
    }
  }

  const handleExportData = () => {
    toast({
      title: "Exportando datos",
      description: "Generando archivo de datos de IA...",
    })

    setTimeout(() => {
      toast({
        title: "Exportación completada",
        description: "Los datos han sido exportados exitosamente",
      })
    }, 2000)
  }

  const handleClearFilters = () => {
    // Reset all filter states
    setStatusFilter("all")
    setConfidenceMin("")
    setConfidenceMax("")
    setSenderFilter("")

    toast({
      title: "Filtros limpiados",
      description: "Todos los filtros han sido restablecidos",
    })
  }

  const handleApplyFilters = () => {
    let filteredCount = emailQueue.length

    // Apply filters logic
    if (statusFilter !== "all") {
      filteredCount = emailQueue.filter(email => {
        switch (statusFilter) {
          case "processed": return email.status === "Procesado"
          case "error": return email.status === "Error"
          case "pending": return email.status === "Pendiente"
          default: return true
        }
      }).length
    }

    if (senderFilter) {
      filteredCount = emailQueue.filter(email =>
        email.sender.toLowerCase().includes(senderFilter.toLowerCase())
      ).length
    }

    toast({
      title: "Filtros aplicados",
      description: `${filteredCount} correos coinciden con los filtros aplicados`,
    })
  }

  const handleClearQueue = () => {
    toast({
      title: "Cola limpiada",
      description: "Todos los correos procesados han sido removidos de la cola",
    })
  }

  const handleViewEmail = (email: any) => {
    setSelectedEmail(email)
  }

  const handleSaveConfig = () => {
    // Validate configuration
    if (!aiConfig.account || !aiConfig.account.includes('@')) {
      toast({
        title: "Error de configuración",
        description: "Por favor ingrese una cuenta de correo válida",
        variant: "destructive",
      })
      return
    }

    // Save configuration (in a real app, this would be an API call)
    toast({
      title: "Configuración guardada",
      description: "La configuración de IA ha sido actualizada exitosamente",
    })
  }

  const stats = {
    totalProcessed: emailQueue.filter((e) => e.status === "Procesado").length,
    totalErrors: emailQueue.filter((e) => e.status === "Error").length,
    totalPending: emailQueue.filter((e) => e.status === "Pendiente").length,
    avgConfidence: 0.76,
    avgProcessingTime: "2.4s",
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <Sidebar userRole="admin" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Monitor de IA" userRole="admin" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* AI Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Estado IA</p>
                          <p className={`text-lg font-bold ${isCapturing ? "text-green-600" : "text-red-600"}`}>
                            {isCapturing ? "Activo" : "Inactivo"}
                          </p>
                        </div>
                        <div className={`p-2 rounded-full ${isCapturing ? "bg-green-100" : "bg-red-100"}`}>
                          <Brain className={`h-6 w-6 ${isCapturing ? "text-green-600" : "text-red-600"}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Estado del Sistema de IA</DialogTitle>
                    <DialogDescription>Información detallada del módulo de procesamiento automático</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Estado Actual</Label>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${isCapturing ? "bg-green-500" : "bg-red-500"}`} />
                          <span className={`font-medium ${isCapturing ? "text-green-600" : "text-red-600"}`}>
                            {isCapturing ? "Sistema Activo" : "Sistema Inactivo"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Tiempo de Actividad</Label>
                        <p className="text-sm">23h 45m (99.8% uptime)</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Última Sincronización</Label>
                        <p className="text-sm font-mono">{lastSync}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Próxima Ejecución</Label>
                        <p className="text-sm">En 3 minutos 12 segundos</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label>Rendimiento del Modelo</Label>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Precisión de Extracción</span>
                            <span className="font-medium text-green-600">94.2%</span>
                          </div>
                          <Progress value={94.2} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span>Velocidad de Procesamiento</span>
                            <span className="font-medium text-blue-600">2.4s promedio</span>
                          </div>
                          <Progress value={85} className="h-2" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <Badge variant="outline" className="justify-center">
                          Modelo: GPT-4
                        </Badge>
                        <Badge variant="outline" className="justify-center">
                          Versión: 2024.1
                        </Badge>
                        <Badge variant="outline" className="justify-center">
                          API: Estable
                        </Badge>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Procesados</p>
                          <p className="text-lg font-bold text-green-600">{stats.totalProcessed}</p>
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Correos Procesados Exitosamente</DialogTitle>
                    <DialogDescription>Análisis detallado de correos procesados correctamente</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{stats.totalProcessed}</p>
                        <p className="text-sm text-muted-foreground">Hoy</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">47</p>
                        <p className="text-sm text-muted-foreground">Esta semana</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Distribución por Prioridad</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Alta Prioridad</span>
                          <span>60%</span>
                        </div>
                        <Progress value={60} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>Media Prioridad</span>
                          <span>30%</span>
                        </div>
                        <Progress value={30} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>Baja Prioridad</span>
                          <span>10%</span>
                        </div>
                        <Progress value={10} className="h-2" />
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-red-50 to-pink-100 border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Errores</p>
                          <p className="text-lg font-bold text-red-600">{stats.totalErrors}</p>
                        </div>
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Análisis de Errores</DialogTitle>
                    <DialogDescription>Desglose detallado de errores de procesamiento</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{stats.totalErrors}</p>
                        <p className="text-sm text-muted-foreground">Errores Hoy</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">5.2%</p>
                        <p className="text-sm text-muted-foreground">Tasa de Error</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipos de Error Más Comunes</Label>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Formato no reconocido</span>
                          <Badge variant="outline">45%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Información incompleta</span>
                          <Badge variant="outline">30%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Error de conexión</span>
                          <Badge variant="outline">15%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Timeout de procesamiento</span>
                          <Badge variant="outline">10%</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Acciones Recomendadas</Label>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>• Revisar plantillas de correo con hospitales</p>
                        <p>• Actualizar criterios de validación</p>
                        <p>• Configurar reintentos automáticos</p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Confianza Prom.</p>
                          <p className={`text-lg font-bold ${getConfidenceColor(stats.avgConfidence)}`}>
                            {(stats.avgConfidence * 100).toFixed(0)}%
                          </p>
                        </div>
                        <Activity className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Análisis de Confianza</DialogTitle>
                    <DialogDescription>Métricas de precisión del modelo de IA</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-xl font-bold text-green-600">95%+</p>
                        <p className="text-xs text-muted-foreground">Alta Confianza</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-xl font-bold text-yellow-600">70-94%</p>
                        <p className="text-xs text-muted-foreground">Media Confianza</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-xl font-bold text-red-600">&lt;70%</p>
                        <p className="text-xs text-muted-foreground">Baja Confianza</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Distribución de Confianza</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Alta (95%+)</span>
                          <span className="text-green-600">65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>Media (70-94%)</span>
                          <span className="text-yellow-600">25%</span>
                        </div>
                        <Progress value={25} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>Baja (&lt;70%)</span>
                          <span className="text-red-600">10%</span>
                        </div>
                        <Progress value={10} className="h-2" />
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Recomendación:</strong> Los correos con confianza &lt;70% requieren revisión manual
                        antes de procesamiento.
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Tiempo Prom.</p>
                          <p className="text-lg font-bold">{stats.avgProcessingTime}</p>
                        </div>
                        <Clock className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Análisis de Rendimiento</DialogTitle>
                    <DialogDescription>Métricas de velocidad de procesamiento</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{stats.avgProcessingTime}</p>
                        <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">1.2s</p>
                        <p className="text-sm text-muted-foreground">Tiempo Mínimo</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Distribución de Tiempos</Label>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>&lt; 2 segundos</span>
                          <Badge variant="outline" className="bg-green-50">
                            40%
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>2-4 segundos</span>
                          <Badge variant="outline" className="bg-yellow-50">
                            45%
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>&gt; 4 segundos</span>
                          <Badge variant="outline" className="bg-red-50">
                            15%
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Factores que Afectan el Rendimiento</Label>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>• Número de adjuntos (+0.5s por archivo)</p>
                        <p>• Complejidad del texto (+0.3s por párrafo)</p>
                        <p>• Carga del servidor (variable)</p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Email Monitoring */}
              <Card className="lg:col-span-2 bg-gradient-to-r from-white to-blue-50 border-blue-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Monitor de Correos Entrantes
                      </CardTitle>
                      <CardDescription>
                        Correos detectados y procesados automáticamente • Última sincronización: {lastSync}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleManualSync}
                        className="hover:bg-blue-50 bg-transparent"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Sincronizar
                      </Button>
                      <Button variant={isCapturing ? "destructive" : "default"} size="sm" onClick={handleToggleCapture}>
                        {isCapturing ? (
                          <>
                            <Pause className="h-4 w-4 mr-1" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Iniciar
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleClearQueue}
                        variant="outline"
                        size="sm"
                        className="hover:bg-red-50 bg-transparent"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Limpiar Cola
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="hover:bg-purple-50 bg-transparent">
                            <Filter className="h-4 w-4 mr-1" />
                            Filtros
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Filtros Avanzados</DialogTitle>
                            <DialogDescription>Personaliza la vista de correos</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Estado</Label>
                              <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Todos los estados" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Todos</SelectItem>
                                  <SelectItem value="processed">Procesados</SelectItem>
                                  <SelectItem value="error">Con Error</SelectItem>
                                  <SelectItem value="pending">Pendientes</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Rango de Confianza</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  placeholder="Mín %"
                                  type="number"
                                  value={confidenceMin}
                                  onChange={(e) => setConfidenceMin(e.target.value)}
                                />
                                <Input
                                  placeholder="Máx %"
                                  type="number"
                                  value={confidenceMax}
                                  onChange={(e) => setConfidenceMax(e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Remitente</Label>
                              <Input
                                placeholder="Filtrar por dominio o email"
                                value={senderFilter}
                                onChange={(e) => setSenderFilter(e.target.value)}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                onClick={handleClearFilters}
                                variant="outline"
                              >
                                Limpiar
                              </Button>
                              <Button onClick={handleApplyFilters}>
                                Aplicar Filtros
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Correo</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Confianza</TableHead>
                          <TableHead>Tiempo</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {emailQueue.map((email) => (
                          <Dialog key={email.id}>
                            <DialogTrigger asChild>
                              <TableRow className="cursor-pointer hover:bg-blue-50 transition-colors">
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-sm">{email.subject}</p>
                                    <p className="text-xs text-muted-foreground">{email.sender}</p>
                                    <p className="text-xs text-muted-foreground">{email.receivedAt}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(email.status)}
                                    <Badge className={getStatusColor(email.status)}>{email.status}</Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {email.confidence ? (
                                    <span className={`font-medium ${getConfidenceColor(email.confidence)}`}>
                                      {(email.confidence * 100).toFixed(0)}%
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm">{email.processingTime || "-"}</span>
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <div className="flex gap-1">
                                    <Button size="sm" variant="outline" className="hover:bg-blue-50 bg-transparent">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    {email.status === "Error" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRetryEmail(email.id)}
                                        className="hover:bg-green-50 bg-transparent"
                                      >
                                        <RefreshCw className="h-3 w-3" />
                                      </Button>
                                    )}
                                    <Button
                                      onClick={() => handleDownloadEmail(email.id)}
                                      size="sm"
                                      variant="outline"
                                      className="hover:bg-purple-50 bg-transparent"
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Análisis Completo del Correo</DialogTitle>
                                <DialogDescription>{email.subject}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <div>
                                      <Label className="text-sm font-medium">Información del Correo</Label>
                                      <div className="mt-2 space-y-2 text-sm">
                                        <p>
                                          <strong>Remitente:</strong> {email.sender}
                                        </p>
                                        <p>
                                          <strong>Recibido:</strong> {email.receivedAt}
                                        </p>
                                        <p>
                                          <strong>Adjuntos:</strong> {email.attachments}
                                        </p>
                                        <p>
                                          <strong>Tiempo de Procesamiento:</strong> {email.processingTime || "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                    {email.confidence && (
                                      <div>
                                        <Label className="text-sm font-medium">Métricas de Confianza</Label>
                                        <div className="mt-2 space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span>Confianza General</span>
                                            <span className={`font-medium ${getConfidenceColor(email.confidence)}`}>
                                              {(email.confidence * 100).toFixed(1)}%
                                            </span>
                                          </div>
                                          <Progress value={email.confidence * 100} className="h-2" />
                                          <div className="grid grid-cols-2 gap-2 text-xs">
                                            <Badge variant="outline">Nombre: 98%</Badge>
                                            <Badge variant="outline">Edad: 95%</Badge>
                                            <Badge variant="outline">Diagnóstico: 92%</Badge>
                                            <Badge variant="outline">Prioridad: 88%</Badge>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="space-y-4">
                                    {email.extractedData && (
                                      <div>
                                        <Label className="text-sm font-medium">Datos Extraídos por IA</Label>
                                        <div className="mt-2 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg space-y-3 border border-emerald-200">
                                          <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                              <span className="font-medium text-emerald-800">Paciente:</span>
                                              <p className="text-emerald-700">{email.extractedData.patientName}</p>
                                            </div>
                                            <div>
                                              <span className="font-medium text-emerald-800">Edad:</span>
                                              <p className="text-emerald-700">{email.extractedData.age} años</p>
                                            </div>
                                            <div className="col-span-2">
                                              <span className="font-medium text-emerald-800">Diagnóstico:</span>
                                              <p className="text-emerald-700">{email.extractedData.diagnosis}</p>
                                            </div>
                                            <div>
                                              <span className="font-medium text-emerald-800">Prioridad:</span>
                                              <Badge
                                                className={
                                                  email.extractedData.priority === "Alta"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                                }
                                              >
                                                {email.extractedData.priority}
                                              </Badge>
                                            </div>
                                            <div>
                                              <span className="font-medium text-emerald-800">Institución:</span>
                                              <p className="text-emerald-700">{email.extractedData.institution}</p>
                                            </div>
                                            <div className="col-span-2">
                                              <span className="font-medium text-emerald-800">Médico Referente:</span>
                                              <p className="text-emerald-700">{email.extractedData.doctor}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    {email.error && (
                                      <div>
                                        <Label className="text-sm font-medium text-red-600">Análisis de Error</Label>
                                        <div className="mt-2 p-4 bg-red-50 rounded-lg border border-red-200">
                                          <p className="text-sm text-red-700 mb-3">{email.error}</p>
                                          <div className="space-y-2 text-xs">
                                            <p>
                                              <strong>Tipo de Error:</strong> Formato no reconocido
                                            </p>
                                            <p>
                                              <strong>Código:</strong> ERR_FORMAT_001
                                            </p>
                                            <p>
                                              <strong>Sugerencia:</strong> Verificar estructura del correo
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Contenido Original del Correo</Label>
                                  <Textarea
                                    value="Estimados colegas,\n\nLes escribo para solicitar la evaluación urgente de la paciente María Elena Rodríguez, de 45 años de edad, quien presenta un cuadro de dolor torácico agudo de 6 horas de evolución...\n\n[Contenido completo del correo aquí]"
                                    readOnly
                                    className="mt-2 h-32 text-sm"
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    onClick={handleExportData}
                                    variant="outline"
                                    className="hover:bg-blue-50 bg-transparent"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Exportar Datos
                                  </Button>
                                  {email.status === "Error" && (
                                    <Button className="bg-green-600 hover:bg-green-700">
                                      <RefreshCw className="h-4 w-4 mr-2" />
                                      Reprocesar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* AI Configuration */}
              <Card className="bg-gradient-to-r from-white to-purple-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuración del Capturador
                  </CardTitle>
                  <CardDescription>Configuración del módulo de captura automática de correos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Captura Automática</Label>
                      <p className="text-sm text-muted-foreground">Activar procesamiento automático</p>
                    </div>
                    <Switch
                      checked={aiConfig.enabled}
                      onCheckedChange={(checked) => setAiConfig({ ...aiConfig, enabled: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="interval">Intervalo de Lectura</Label>
                    <Select
                      value={aiConfig.interval.toString()}
                      onValueChange={(value) => setAiConfig({ ...aiConfig, interval: Number.parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Cada 1 minuto</SelectItem>
                        <SelectItem value="5">Cada 5 minutos</SelectItem>
                        <SelectItem value="10">Cada 10 minutos</SelectItem>
                        <SelectItem value="15">Cada 15 minutos</SelectItem>
                        <SelectItem value="30">Cada 30 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account">Cuenta Configurada</Label>
                    <Input
                      id="account"
                      value={aiConfig.account}
                      onChange={(e) => setAiConfig({ ...aiConfig, account: e.target.value })}
                      placeholder="correo@hospital.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Estado OAuth2</Label>
                    <div className="flex items-center gap-2">
                      {aiConfig.oauthConfigured ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">Configurado</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-600">No configurado</span>
                        </>
                      )}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full hover:bg-purple-50 bg-transparent">
                          Configurar OAuth2
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Configuración OAuth2</DialogTitle>
                          <DialogDescription>Configurar acceso seguro a Gmail</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Client ID</Label>
                            <Input placeholder="Tu Client ID de Google" />
                          </div>
                          <div className="space-y-2">
                            <Label>Client Secret</Label>
                            <Input type="password" placeholder="Tu Client Secret" />
                          </div>
                          <div className="space-y-2">
                            <Label>Scopes Requeridos</Label>
                            <div className="grid grid-cols-1 gap-2 text-sm">
                              <Badge variant="outline">gmail.readonly</Badge>
                              <Badge variant="outline">gmail.modify</Badge>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline">Cancelar</Button>
                            <Button>Guardar y Autorizar</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Reintento Automático</Label>
                      <p className="text-sm text-muted-foreground">Reintentar correos con error</p>
                    </div>
                    <Switch
                      checked={aiConfig.autoRetry}
                      onCheckedChange={(checked) => setAiConfig({ ...aiConfig, autoRetry: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxRetries">Máximo Reintentos</Label>
                    <Input
                      id="maxRetries"
                      type="number"
                      min="1"
                      max="10"
                      value={aiConfig.maxRetries}
                      onChange={(e) => setAiConfig({ ...aiConfig, maxRetries: Number.parseInt(e.target.value) })}
                    />
                  </div>

                  <Button
                    onClick={handleSaveConfig}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    Guardar Configuración
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Processing Statistics */}
            <Card className="bg-gradient-to-r from-white to-emerald-50 border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Estadísticas de Procesamiento
                </CardTitle>
                <CardDescription>Rendimiento del módulo de IA en las últimas 24 horas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="text-center cursor-pointer hover:bg-emerald-50 p-4 rounded-lg transition-colors">
                        <div className="text-2xl font-bold text-green-600">{stats.totalProcessed}</div>
                        <p className="text-sm text-muted-foreground">Correos Procesados</p>
                        <TrendingUp className="h-4 w-4 mx-auto mt-2 text-green-600" />
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tendencia de Procesamiento</DialogTitle>
                        <DialogDescription>Análisis temporal de correos procesados</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="h-48 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg flex items-center justify-center border border-green-200">
                          <p className="text-sm text-muted-foreground">Gráfico de tendencia de procesamiento</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-lg font-bold text-green-600">12</p>
                            <p className="text-xs text-muted-foreground">Última hora</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-blue-600">47</p>
                            <p className="text-xs text-muted-foreground">Últimas 6h</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-purple-600">156</p>
                            <p className="text-xs text-muted-foreground">Últimas 24h</p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="text-center cursor-pointer hover:bg-red-50 p-4 rounded-lg transition-colors">
                        <div className="text-2xl font-bold text-red-600">{stats.totalErrors}</div>
                        <p className="text-sm text-muted-foreground">Errores de Procesamiento</p>
                        <AlertTriangle className="h-4 w-4 mx-auto mt-2 text-red-600" />
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Análisis de Errores</DialogTitle>
                        <DialogDescription>Desglose detallado de errores por tipo</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="h-48 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg flex items-center justify-center border border-red-200">
                          <p className="text-sm text-muted-foreground">Gráfico de distribución de errores</p>
                        </div>
                        <div className="space-y-2">
                          {[
                            { type: "Formato no reconocido", count: 3, color: "red" },
                            { type: "Timeout de procesamiento", count: 1, color: "orange" },
                            { type: "Error de conexión", count: 1, color: "yellow" },
                          ].map((error, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm">{error.type}</span>
                              <Badge variant="outline" className={`bg-${error.color}-50`}>
                                {error.count}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="text-center cursor-pointer hover:bg-yellow-50 p-4 rounded-lg transition-colors">
                        <div className={`text-2xl font-bold ${getConfidenceColor(stats.avgConfidence)}`}>
                          {(stats.avgConfidence * 100).toFixed(0)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Confianza Promedio</p>
                        <Activity className="h-4 w-4 mx-auto mt-2 text-yellow-600" />
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Evolución de Confianza</DialogTitle>
                        <DialogDescription>Tendencia de precisión del modelo</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="h-48 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg flex items-center justify-center border border-yellow-200">
                          <p className="text-sm text-muted-foreground">Gráfico de evolución de confianza</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-lg font-bold text-green-600">94%</p>
                            <p className="text-xs text-muted-foreground">Máxima hoy</p>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <p className="text-lg font-bold text-red-600">45%</p>
                            <p className="text-xs text-muted-foreground">Mínima hoy</p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="text-center cursor-pointer hover:bg-blue-50 p-4 rounded-lg transition-colors">
                        <div className="text-2xl font-bold">{stats.avgProcessingTime}</div>
                        <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                        <Clock className="h-4 w-4 mx-auto mt-2 text-blue-600" />
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Análisis de Rendimiento Temporal</DialogTitle>
                        <DialogDescription>Evolución de tiempos de procesamiento</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="h-48 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center border border-blue-200">
                          <p className="text-sm text-muted-foreground">Gráfico de tiempos de procesamiento</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-lg font-bold text-green-600">1.2s</p>
                            <p className="text-xs text-muted-foreground">Más rápido</p>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-lg font-bold text-blue-600">2.4s</p>
                            <p className="text-xs text-muted-foreground">Promedio</p>
                          </div>
                          <div className="p-3 bg-red-50 rounded-lg">
                            <p className="text-lg font-bold text-red-600">5.8s</p>
                            <p className="text-xs text-muted-foreground">Más lento</p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
