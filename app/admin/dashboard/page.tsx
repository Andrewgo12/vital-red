"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Eye,
  Download,
  BarChart3,
} from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedModal, setSelectedModal] = useState<string | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<any>(null)

  const handleGenerateReport = (type: string) => {
    toast({
      title: "Generando reporte",
      description: `Creando reporte ${type.toLowerCase()}...`,
    })

    // Simulate report generation
    setTimeout(() => {
      toast({
        title: "Reporte generado",
        description: `Reporte ${type.toLowerCase()} descargado exitosamente`,
      })
    }, 3000)

    setSelectedModal(null)
  }

  const handleViewStatistics = (type: string) => {
    toast({
      title: "Cargando estadísticas",
      description: `Preparando ${type.toLowerCase()}...`,
    })

    // Simulate navigation to statistics
    setTimeout(() => {
      router.push('/admin/supervision')
    }, 1000)
  }

  const handleViewActivity = (period: string) => {
    toast({
      title: "Cargando actividad",
      description: `Mostrando actividad ${period.toLowerCase()}...`,
    })

    // Simulate loading activity data
    setTimeout(() => {
      toast({
        title: "Actividad cargada",
        description: `Datos de actividad ${period.toLowerCase()} listos`,
      })
    }, 2000)

    setSelectedModal(null)
  }

  const stats = [
    {
      title: "Solicitudes Nuevas",
      value: "24",
      description: "Últimas 24 horas",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      gradient: "from-blue-500 to-blue-600",
      details: {
        total: 24,
        urgent: 8,
        normal: 12,
        low: 4,
        trend: "+12% vs ayer",
      },
    },
    {
      title: "En Revisión",
      value: "12",
      description: "Pendientes de evaluación",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      gradient: "from-yellow-500 to-yellow-600",
      details: {
        total: 12,
        overdue: 3,
        onTime: 9,
        avgTime: "2.5 horas",
        trend: "-5% vs ayer",
      },
    },
    {
      title: "Aceptadas",
      value: "156",
      description: "Este mes",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      gradient: "from-green-500 to-green-600",
      details: {
        total: 156,
        thisWeek: 42,
        lastWeek: 38,
        successRate: "87%",
        trend: "+15% vs mes anterior",
      },
    },
    {
      title: "Rechazadas",
      value: "23",
      description: "Este mes",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      gradient: "from-red-500 to-red-600",
      details: {
        total: 23,
        thisWeek: 6,
        lastWeek: 8,
        rejectionRate: "13%",
        trend: "-8% vs mes anterior",
      },
    },
  ]

  const recentActivity = [
    {
      id: 1,
      action: "Solicitud aceptada",
      patient: "María González",
      doctor: "Dr. Rodríguez",
      time: "Hace 15 min",
      priority: "Alta",
      details: {
        patientId: "P001234",
        diagnosis: "Cardiopatía isquémica",
        referredTo: "Cardiología",
        notes: "Paciente con dolor torácico recurrente, requiere evaluación especializada urgente.",
      },
    },
    {
      id: 2,
      action: "Solicitud rechazada",
      patient: "Carlos Pérez",
      doctor: "Dr. Martínez",
      time: "Hace 32 min",
      priority: "Media",
      details: {
        patientId: "P001235",
        diagnosis: "Cefalea tensional",
        reason: "Documentación incompleta",
        notes: "Faltan estudios complementarios requeridos para la evaluación.",
      },
    },
    {
      id: 3,
      action: "Nueva solicitud",
      patient: "Ana López",
      doctor: "Pendiente",
      time: "Hace 1 hora",
      priority: "Alta",
      details: {
        patientId: "P001236",
        diagnosis: "Diabetes mellitus descompensada",
        referredTo: "Endocrinología",
        notes: "Paciente con hiperglucemia severa, requiere manejo especializado.",
      },
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "bg-red-100 text-red-800 border-red-200"
      case "Media":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Baja":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar userRole="admin" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard Administrativo" userRole="admin" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card
                    key={stat.title}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm"
                    onClick={() => setSelectedModal(stat.title)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-700">{stat.title}</CardTitle>
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
                      <p className="text-sm text-slate-600 mt-1">{stat.description}</p>
                      <div className="mt-2 flex items-center gap-1">
                        <Eye className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-400">Click para detalles</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    Actividad Reciente
                  </CardTitle>
                  <CardDescription>Últimas acciones en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                        onClick={() => setSelectedActivity(activity)}
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-800">{activity.action}</p>
                          <p className="text-xs text-slate-600">
                            Paciente: {activity.patient} | Médico: {activity.doctor}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getPriorityColor(activity.priority)} border font-medium`}>
                            {activity.priority}
                          </Badge>
                          <span className="text-xs text-slate-500">{activity.time}</span>
                          <Eye className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200 hover:bg-gradient-to-r hover:from-emerald-100 hover:to-blue-100 transition-all duration-200"
                    onClick={() => setSelectedModal("all-activity")}
                  >
                    Ver Toda la Actividad
                  </Button>
                </CardContent>
              </Card>

              {/* System Alerts */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Alertas del Sistema
                  </CardTitle>
                  <CardDescription>Notificaciones importantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div
                      className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                      onClick={() => setSelectedModal("pending-requests")}
                    >
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-yellow-800">
                          12 solicitudes pendientes por más de 2 horas
                        </p>
                        <p className="text-xs text-yellow-600">Requieren atención prioritaria</p>
                      </div>
                      <Eye className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div
                      className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                      onClick={() => setSelectedModal("trend-analysis")}
                    >
                      <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-800">
                          Incremento del 15% en solicitudes esta semana
                        </p>
                        <p className="text-xs text-blue-600">Comparado con la semana anterior</p>
                      </div>
                      <Eye className="h-4 w-4 text-blue-600" />
                    </div>
                    <div
                      className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                      onClick={() => setSelectedModal("system-status")}
                    >
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-800">Sistema funcionando correctamente</p>
                        <p className="text-xs text-green-600">Todos los módulos operativos</p>
                      </div>
                      <Eye className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-800">Acciones Rápidas</CardTitle>
                <CardDescription>Funciones administrativas frecuentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 hover:shadow-lg transition-all duration-300 hover:scale-105"
                    onClick={() => setSelectedModal("user-management")}
                  >
                    <Users className="h-8 w-8 text-blue-600" />
                    <span className="font-semibold text-slate-700">Gestionar Usuarios</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-3 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 hover:from-emerald-100 hover:to-green-100 hover:shadow-lg transition-all duration-300 hover:scale-105"
                    onClick={() => setSelectedModal("generate-reports")}
                  >
                    <Download className="h-8 w-8 text-emerald-600" />
                    <span className="font-semibold text-slate-700">Generar Reportes</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-3 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100 hover:shadow-lg transition-all duration-300 hover:scale-105"
                    onClick={() => setSelectedModal("statistics")}
                  >
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                    <span className="font-semibold text-slate-700">Ver Estadísticas</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Stats Detail Modals */}
      {stats.map((stat) => (
        <Dialog key={stat.title} open={selectedModal === stat.title} onOpenChange={() => setSelectedModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <stat.icon className="h-5 w-5" />
                {stat.title} - Detalles
              </DialogTitle>
              <DialogDescription>Información detallada y métricas</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(stat.details).map(([key, value]) => (
                  <div key={key} className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600 capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                    <p className="font-semibold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => {
                  setSelectedModal(null)
                  router.push('/admin/supervision')
                }}
                className="w-full"
              >
                Ver Detalles Completos
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ))}

      {/* Activity Detail Modal */}
      <Dialog open={selectedActivity !== null} onOpenChange={() => setSelectedActivity(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Actividad</DialogTitle>
            <DialogDescription>Información completa de la acción</DialogDescription>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600">Paciente</p>
                  <p className="font-semibold">{selectedActivity.patient}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600">ID Paciente</p>
                  <p className="font-semibold">{selectedActivity.details.patientId}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600">Médico</p>
                  <p className="font-semibold">{selectedActivity.doctor}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600">Prioridad</p>
                  <Badge className={getPriorityColor(selectedActivity.priority)}>{selectedActivity.priority}</Badge>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">Diagnóstico</p>
                <p className="font-semibold">{selectedActivity.details.diagnosis}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">Notas</p>
                <p className="text-sm">{selectedActivity.details.notes}</p>
              </div>
              <Button
                onClick={() => {
                  setSelectedActivity(null)
                  router.push('/admin/supervision')
                }}
                className="w-full"
              >
                Ver Expediente Completo
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Other Modals */}
      <Dialog open={selectedModal === "user-management"} onOpenChange={() => setSelectedModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestión de Usuarios</DialogTitle>
            <DialogDescription>Administrar usuarios del sistema</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => {
                setSelectedModal(null)
                router.push('/admin/users')
              }}
              className="w-full bg-transparent"
              variant="outline"
            >
              Crear Nuevo Usuario
            </Button>
            <Button
              onClick={() => {
                setSelectedModal(null)
                router.push('/admin/users')
              }}
              className="w-full bg-transparent"
              variant="outline"
            >
              Ver Todos los Usuarios
            </Button>
            <Button
              onClick={() => {
                setSelectedModal(null)
                router.push('/admin/config')
              }}
              className="w-full bg-transparent"
              variant="outline"
            >
              Gestionar Permisos
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedModal === "generate-reports"} onOpenChange={() => setSelectedModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar Reportes</DialogTitle>
            <DialogDescription>Crear y descargar reportes</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => handleGenerateReport("Diario")}
              className="w-full bg-transparent"
              variant="outline"
            >
              Generar Reporte Diario
            </Button>
            <Button
              onClick={() => handleGenerateReport("Semanal")}
              className="w-full bg-transparent"
              variant="outline"
            >
              Generar Reporte Semanal
            </Button>
            <Button
              onClick={() => handleGenerateReport("Mensual")}
              className="w-full bg-transparent"
              variant="outline"
            >
              Generar Reporte Mensual
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedModal === "statistics"} onOpenChange={() => setSelectedModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ver Estadísticas</DialogTitle>
            <DialogDescription>Analizar tendencias y métricas</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => handleViewStatistics("Tendencias de Solicitudes")}
              className="w-full bg-transparent"
              variant="outline"
            >
              Ver Tendencias de Solicitudes
            </Button>
            <Button
              onClick={() => handleViewStatistics("Estadísticas de Usuarios")}
              className="w-full bg-transparent"
              variant="outline"
            >
              Ver Estadísticas de Usuarios
            </Button>
            <Button
              onClick={() => handleViewStatistics("Informes de Sistema")}
              className="w-full bg-transparent"
              variant="outline"
            >
              Ver Informes de Sistema
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedModal === "all-activity"} onOpenChange={() => setSelectedModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Toda la Actividad</DialogTitle>
            <DialogDescription>Historial completo de acciones</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => handleViewActivity("de Hoy")}
              className="w-full bg-transparent"
              variant="outline"
            >
              Ver Actividad de Hoy
            </Button>
            <Button
              onClick={() => handleViewActivity("de la Semana")}
              className="w-full bg-transparent"
              variant="outline"
            >
              Ver Actividad de la Semana
            </Button>
            <Button
              onClick={() => handleViewActivity("del Mes")}
              className="w-full bg-transparent"
              variant="outline"
            >
              Ver Actividad del Mes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedModal === "pending-requests"} onOpenChange={() => setSelectedModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitudes Pendientes</DialogTitle>
            <DialogDescription>Revisar solicitudes en espera</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button className="w-full bg-transparent" variant="outline">
              Revisar Solicitudes Urgentes
            </Button>
            <Button className="w-full bg-transparent" variant="outline">
              Revisar Todas las Solicitudes
            </Button>
            <Button className="w-full bg-transparent" variant="outline">
              Marcar como Atendidas
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedModal === "trend-analysis"} onOpenChange={() => setSelectedModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Análisis de Tendencias</DialogTitle>
            <DialogDescription>Analizar patrones de solicitudes</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button className="w-full bg-transparent" variant="outline">
              Analizar Tendencias Diarias
            </Button>
            <Button className="w-full bg-transparent" variant="outline">
              Analizar Tendencias Semanales
            </Button>
            <Button className="w-full bg-transparent" variant="outline">
              Analizar Tendencias Mensuales
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedModal === "system-status"} onOpenChange={() => setSelectedModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Estatus del Sistema</DialogTitle>
            <DialogDescription>Monitorear el funcionamiento del sistema</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button className="w-full bg-transparent" variant="outline">
              Ver Logs del Sistema
            </Button>
            <Button className="w-full bg-transparent" variant="outline">
              Ver Reportes de Errores
            </Button>
            <Button className="w-full bg-transparent" variant="outline">
              Ver Actualizaciones Recientes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </ProtectedRoute>
  )
}
