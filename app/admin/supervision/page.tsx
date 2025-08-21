"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
// Recharts removed to fix build errors
import {
  BarChart3,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Eye,
  MessageSquare,
  FileText,
  Star,
  Activity,
  Target,
  Mail,
  Phone,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SupervisionPage() {
  const { toast } = useToast()
  const [dateFilter, setDateFilter] = useState("week")
  const [doctorFilter, setDoctorFilter] = useState("all")
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false)
  const [isDoctorDetailOpen, setIsDoctorDetailOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isChartDetailOpen, setIsChartDetailOpen] = useState(false)
  const [selectedStat, setSelectedStat] = useState<any>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [selectedChartData, setSelectedChartData] = useState<any>(null)
  const [exportOptions, setExportOptions] = useState({
    includeCharts: true,
    includeDetails: true,
    includeComments: false,
    format: "pdf",
  })
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false)
  const [analysisType, setAnalysisType] = useState("")

  const doctorStats = [
    {
      id: 1,
      name: "Dr. Carlos Rodríguez",
      specialty: "Cardiología",
      email: "carlos.rodriguez@hospital.com",
      phone: "+57 300 123 4567",
      casesEvaluated: 45,
      avgResponseTime: "18 min",
      acceptanceRate: 78,
      rejectionRate: 15,
      infoRequestRate: 7,
      efficiency: 92,
      rating: 4.8,
      totalHours: 156,
      urgentCases: 12,
      comments: [
        {
          id: 1,
          text: "Excelente tiempo de respuesta en casos urgentes",
          author: "Admin",
          date: "2024-01-10",
          type: "positive",
        },
        {
          id: 2,
          text: "Muy detallado en sus evaluaciones",
          author: "Supervisor",
          date: "2024-01-08",
          type: "positive",
        },
      ],
      recentCases: [
        { id: 101, patient: "Paciente A", decision: "Aceptado", time: "15 min", priority: "Alta" },
        { id: 102, patient: "Paciente B", decision: "Rechazado", time: "22 min", priority: "Media" },
        { id: 103, patient: "Paciente C", decision: "Info Solicitada", time: "18 min", priority: "Baja" },
      ],
      performance: {
        thisWeek: { cases: 12, avgTime: "16 min", efficiency: 94 },
        lastWeek: { cases: 11, avgTime: "19 min", efficiency: 89 },
        thisMonth: { cases: 45, avgTime: "18 min", efficiency: 92 },
      },
    },
    {
      id: 2,
      name: "Dra. María González",
      specialty: "Neurología",
      email: "maria.gonzalez@hospital.com",
      phone: "+57 301 987 6543",
      casesEvaluated: 38,
      avgResponseTime: "22 min",
      acceptanceRate: 82,
      rejectionRate: 12,
      infoRequestRate: 6,
      efficiency: 88,
      rating: 4.9,
      totalHours: 142,
      urgentCases: 8,
      comments: [
        {
          id: 1,
          text: "Especialista muy competente en neurología",
          author: "Admin",
          date: "2024-01-12",
          type: "positive",
        },
      ],
      recentCases: [
        { id: 201, patient: "Paciente D", decision: "Aceptado", time: "20 min", priority: "Alta" },
        { id: 202, patient: "Paciente E", decision: "Aceptado", time: "25 min", priority: "Media" },
      ],
      performance: {
        thisWeek: { cases: 10, avgTime: "21 min", efficiency: 90 },
        lastWeek: { cases: 9, avgTime: "23 min", efficiency: 86 },
        thisMonth: { cases: 38, avgTime: "22 min", efficiency: 88 },
      },
    },
    {
      id: 3,
      name: "Dr. Luis Martínez",
      specialty: "Ginecología",
      email: "luis.martinez@hospital.com",
      phone: "+57 302 456 7890",
      casesEvaluated: 29,
      avgResponseTime: "25 min",
      acceptanceRate: 75,
      rejectionRate: 18,
      infoRequestRate: 7,
      efficiency: 85,
      rating: 4.2,
      totalHours: 118,
      urgentCases: 5,
      comments: [],
      recentCases: [{ id: 301, patient: "Paciente F", decision: "Rechazado", time: "28 min", priority: "Baja" }],
      performance: {
        thisWeek: { cases: 7, avgTime: "26 min", efficiency: 83 },
        lastWeek: { cases: 8, avgTime: "24 min", efficiency: 87 },
        thisMonth: { cases: 29, avgTime: "25 min", efficiency: 85 },
      },
    },
  ]

  const chartData = [
    { name: "Dr. Rodríguez", aceptados: 35, rechazados: 7, info: 3, total: 45 },
    { name: "Dra. González", aceptados: 31, rechazados: 5, info: 2, total: 38 },
    { name: "Dr. Martínez", aceptados: 22, rechazados: 5, info: 2, total: 29 },
  ]

  const pieData = [
    { name: "Aceptados", value: 88, color: "#10b981", cases: 88 },
    { name: "Rechazados", value: 17, color: "#ef4444", cases: 17 },
    { name: "Info Solicitada", value: 7, color: "#f59e0b", cases: 7 },
  ]

  const timeData = [
    { hour: "08:00", casos: 12, details: "Inicio de jornada - casos programados" },
    { hour: "10:00", casos: 18, details: "Pico matutino - casos urgentes" },
    { hour: "12:00", casos: 25, details: "Hora pico - máxima actividad" },
    { hour: "14:00", casos: 22, details: "Post almuerzo - casos pendientes" },
    { hour: "16:00", casos: 15, details: "Tarde - casos de seguimiento" },
    { hour: "18:00", casos: 8, details: "Final de jornada - casos urgentes" },
  ]

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "text-green-600"
    if (efficiency >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  const handleStatsClick = (statType: string, value: any) => {
    setSelectedStat({
      type: statType,
      value,
      details: getStatDetails(statType),
      trend: getStatTrend(statType),
    })
    setIsStatsDialogOpen(true)
  }

  const getStatDetails = (statType: string) => {
    switch (statType) {
      case "total":
        return {
          description: "Total de casos evaluados en el período seleccionado",
          breakdown: doctorStats.map((d) => ({ name: d.name, value: d.casesEvaluated })),
        }
      case "avgTime":
        return {
          description: "Tiempo promedio de respuesta de todos los médicos",
          breakdown: doctorStats.map((d) => ({ name: d.name, value: d.avgResponseTime })),
        }
      case "acceptance":
        return {
          description: "Porcentaje promedio de casos aceptados",
          breakdown: doctorStats.map((d) => ({ name: d.name, value: `${d.acceptanceRate}%` })),
        }
      case "efficiency":
        return {
          description: "Eficiencia promedio del equipo médico",
          breakdown: doctorStats.map((d) => ({ name: d.name, value: `${d.efficiency}%` })),
        }
      default:
        return { description: "Estadística del sistema", breakdown: [] }
    }
  }

  const getStatTrend = (statType: string) => {
    const trends = {
      total: { change: 12, direction: "up", period: "vs semana anterior" },
      avgTime: { change: 3, direction: "down", period: "vs semana anterior" },
      acceptance: { change: 2, direction: "up", period: "vs semana anterior" },
      efficiency: { change: 5, direction: "up", period: "vs semana anterior" },
    }
    return trends[statType as keyof typeof trends] || { change: 0, direction: "neutral", period: "" }
  }

  const handleDoctorClick = (doctor: any) => {
    setSelectedDoctor(doctor)
    setIsDoctorDetailOpen(true)
  }

  const handleChartClick = (data: any, chartType: string) => {
    setSelectedChartData({ ...data, chartType })
    setIsChartDetailOpen(true)
  }

  const exportReport = () => {
    setIsExportDialogOpen(true)
  }

  const confirmExport = () => {
    // Validate export options
    if (!exportOptions.format) {
      toast({
        title: "Error de exportación",
        description: "Por favor seleccione un formato de exportación",
        variant: "destructive",
      })
      return
    }

    // Simulate report generation
    toast({
      title: "Generando reporte",
      description: `Creando reporte de supervisión en formato ${exportOptions.format.toUpperCase()}...`,
    })

    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Reporte exportado exitosamente",
        description: `El reporte ha sido generado y está listo para descarga`,
      })
    }, 3000)

    setIsExportDialogOpen(false)
  }

  const handleAdvancedAnalysis = (type: string) => {
    setAnalysisType(type)
    setIsAnalysisDialogOpen(true)

    toast({
      title: "Iniciando análisis",
      description: `Generando análisis ${type.toLowerCase()}...`,
    })
  }

  const generatePredictiveAnalysis = () => {
    toast({
      title: "Análisis predictivo",
      description: "Generando predicciones basadas en tendencias históricas...",
    })

    setTimeout(() => {
      toast({
        title: "Análisis completado",
        description: "El análisis predictivo está listo para revisión",
      })
    }, 3000)

    setIsAnalysisDialogOpen(false)
  }

  const generatePerformanceReport = () => {
    toast({
      title: "Reporte de rendimiento",
      description: "Analizando métricas de rendimiento médico...",
    })

    setTimeout(() => {
      toast({
        title: "Reporte generado",
        description: "El reporte de rendimiento ha sido generado exitosamente",
      })
    }, 2500)

    setIsAnalysisDialogOpen(false)
  }

  const checkPerformanceAlerts = () => {
    const alerts = []

    // Check for doctors with low acceptance rates
    doctorStats.forEach(doctor => {
      if (doctor.acceptanceRate < 70) {
        alerts.push({
          type: "warning",
          doctor: doctor.name,
          message: `Tasa de aceptación baja: ${doctor.acceptanceRate}%`
        })
      }

      if (doctor.avgResponseTime > 4) {
        alerts.push({
          type: "error",
          doctor: doctor.name,
          message: `Tiempo de respuesta alto: ${doctor.avgResponseTime}h`
        })
      }
    })

    if (alerts.length > 0) {
      toast({
        title: `${alerts.length} alertas detectadas`,
        description: "Revise el rendimiento de los médicos evaluadores",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sin alertas",
        description: "Todos los médicos están dentro de los parámetros normales",
      })
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <Sidebar userRole="admin" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Panel de Supervisión" userRole="admin" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-white to-slate-50 border-slate-200 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <BarChart3 className="h-5 w-5 text-emerald-600" />
                      Filtros de Supervisión
                    </CardTitle>
                    <CardDescription>Configure el período y médicos a supervisar</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={checkPerformanceAlerts}
                      variant="outline"
                      className="hover:bg-red-50 hover:border-red-300 transition-all duration-300"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Verificar Alertas
                    </Button>
                    <Button
                      onClick={() => handleAdvancedAnalysis("Predictivo")}
                      variant="outline"
                      className="hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Análisis Predictivo
                    </Button>
                    <Button
                      onClick={exportReport}
                      className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg transition-all duration-300"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Reporte
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Período</Label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Hoy</SelectItem>
                        <SelectItem value="week">Esta Semana</SelectItem>
                        <SelectItem value="month">Este Mes</SelectItem>
                        <SelectItem value="quarter">Trimestre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Médico</Label>
                    <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los Médicos</SelectItem>
                        <SelectItem value="1">Dr. Carlos Rodríguez</SelectItem>
                        <SelectItem value="2">Dra. María González</SelectItem>
                        <SelectItem value="3">Dr. Luis Martínez</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full bg-transparent hover:bg-slate-100">
                      <Calendar className="h-4 w-4 mr-2" />
                      Rango Personalizado
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br from-white to-blue-50 border-blue-200"
                onClick={() => handleStatsClick("total", 112)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Evaluados</p>
                      <p className="text-2xl font-bold text-blue-700">112</p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +12% vs semana anterior
                      </p>
                      <p className="text-xs text-blue-600 mt-1">Click para detalles</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <BarChart3 className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br from-white to-emerald-50 border-emerald-200"
                onClick={() => handleStatsClick("avgTime", "21 min")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                      <p className="text-2xl font-bold text-emerald-700">21 min</p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        -3 min vs semana anterior
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">Click para detalles</p>
                    </div>
                    <div className="p-3 bg-emerald-100 rounded-full">
                      <Clock className="h-8 w-8 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br from-white to-green-50 border-green-200"
                onClick={() => handleStatsClick("acceptance", "78%")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tasa Aceptación</p>
                      <p className="text-2xl font-bold text-green-700">78%</p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +2% vs semana anterior
                      </p>
                      <p className="text-xs text-green-600 mt-1">Click para detalles</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br from-white to-purple-50 border-purple-200"
                onClick={() => handleStatsClick("efficiency", "88%")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Eficiencia Promedio</p>
                      <p className="text-2xl font-bold text-purple-700">88%</p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +5% vs semana anterior
                      </p>
                      <p className="text-xs text-purple-600 mt-1">Click para detalles</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <AlertTriangle className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-r from-white to-slate-50 border-slate-200 shadow-md">
                <CardHeader>
                  <CardTitle className="text-slate-800">Rendimiento por Médico</CardTitle>
                  <CardDescription>Casos evaluados por cada médico (Click en las barras para detalles)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {chartData.map((doctor, index) => (
                      <div key={index} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => handleChartClick(doctor, "performance")}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-slate-800">{doctor.name}</span>
                          <span className="text-sm text-slate-600">Total: {doctor.aceptados + doctor.rechazados + doctor.info}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="text-center p-2 bg-green-100 rounded">
                            <div className="font-semibold text-green-800">{doctor.aceptados}</div>
                            <div className="text-green-600">Aceptados</div>
                          </div>
                          <div className="text-center p-2 bg-red-100 rounded">
                            <div className="font-semibold text-red-800">{doctor.rechazados}</div>
                            <div className="text-red-600">Rechazados</div>
                          </div>
                          <div className="text-center p-2 bg-yellow-100 rounded">
                            <div className="font-semibold text-yellow-800">{doctor.info}</div>
                            <div className="text-yellow-600">Info Solicitada</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-white to-slate-50 border-slate-200 shadow-md">
                <CardHeader>
                  <CardTitle className="text-slate-800">Distribución de Decisiones</CardTitle>
                  <CardDescription>Proporción de decisiones tomadas (Click en segmentos para detalles)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {pieData.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border-2 hover:shadow-md transition-all cursor-pointer"
                        style={{ borderColor: item.color, backgroundColor: `${item.color}10` }}
                        onClick={() => handleChartClick(item, "distribution")}
                      >
                        <div className="text-center">
                          <div className="text-2xl font-bold" style={{ color: item.color }}>
                            {item.value}
                          </div>
                          <div className="text-sm font-medium text-slate-700 mt-1">
                            {item.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {((item.value / pieData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-white to-slate-50 border-slate-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-slate-800">Actividad por Horario</CardTitle>
                <CardDescription>
                  Distribución de casos evaluados durante el día (Click en barras para detalles)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {timeData.map((hour, index) => (
                    <div
                      key={index}
                      className="text-center p-2 bg-green-50 hover:bg-green-100 rounded-lg cursor-pointer transition-colors border border-green-200"
                      onClick={() => handleChartClick(hour, "timeline")}
                    >
                      <div className="text-xs text-green-600 font-medium">{hour.hour}</div>
                      <div className="text-lg font-bold text-green-800">{hour.casos}</div>
                      <div className="text-xs text-green-600">casos</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-white to-slate-50 border-slate-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-slate-800">Rendimiento Detallado por Médico</CardTitle>
                <CardDescription>
                  Estadísticas completas de evaluación por médico (Click en filas para detalles completos)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-100 to-slate-200">
                        <TableHead className="font-semibold text-slate-700">Médico</TableHead>
                        <TableHead className="font-semibold text-slate-700">Casos Evaluados</TableHead>
                        <TableHead className="font-semibold text-slate-700">Tiempo Promedio</TableHead>
                        <TableHead className="font-semibold text-slate-700">Tasa Aceptación</TableHead>
                        <TableHead className="font-semibold text-slate-700">Tasa Rechazo</TableHead>
                        <TableHead className="font-semibold text-slate-700">Info Solicitada</TableHead>
                        <TableHead className="font-semibold text-slate-700">Eficiencia</TableHead>
                        <TableHead className="font-semibold text-slate-700">Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {doctorStats.map((doctor) => (
                        <TableRow
                          key={doctor.id}
                          className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 transition-all duration-300"
                          onClick={() => handleDoctorClick(doctor)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {doctor.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)}
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">{doctor.name}</p>
                                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-emerald-600" />
                              <span className="font-medium text-slate-800">{doctor.casesEvaluated}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-blue-600" />
                              <span className="text-slate-700">{doctor.avgResponseTime}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300">
                              {doctor.acceptanceRate}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300">
                              {doctor.rejectionRate}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300">
                              {doctor.infoRequestRate}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${getEfficiencyColor(doctor.efficiency)}`}>
                              {doctor.efficiency}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getRatingStars(doctor.rating)}
                              <span className="text-sm text-slate-600 ml-1">{doctor.rating}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Análisis Detallado de Estadística
                </DialogTitle>
                <DialogDescription>{selectedStat?.details?.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg text-center">
                    <p className="text-sm text-blue-600">Valor Actual</p>
                    <p className="text-2xl font-bold text-blue-800">{selectedStat?.value}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg text-center">
                    <p className="text-sm text-emerald-600">Tendencia</p>
                    <p
                      className={`text-2xl font-bold ${selectedStat?.trend?.direction === "up" ? "text-green-600" : selectedStat?.trend?.direction === "down" ? "text-red-600" : "text-gray-600"}`}
                    >
                      {selectedStat?.trend?.direction === "up"
                        ? "+"
                        : selectedStat?.trend?.direction === "down"
                          ? "-"
                          : ""}
                      {selectedStat?.trend?.change}
                      {selectedStat?.trend?.direction === "down" && selectedStat?.type === "avgTime"
                        ? " min"
                        : selectedStat?.trend?.direction !== "neutral"
                          ? "%"
                          : ""}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg text-center">
                    <p className="text-sm text-purple-600">Período</p>
                    <p className="text-sm font-medium text-purple-800">{selectedStat?.trend?.period}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Desglose por Médico</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedStat?.details?.breakdown?.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm text-slate-600">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDoctorDetailOpen} onOpenChange={setIsDoctorDetailOpen}>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Análisis Detallado del Médico
                </DialogTitle>
                <DialogDescription>Información completa de rendimiento y actividad</DialogDescription>
              </DialogHeader>
              {selectedDoctor && (
                <div className="space-y-6">
                  {/* Doctor Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {selectedDoctor.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .substring(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-800">{selectedDoctor.name}</h3>
                          <p className="text-sm text-blue-600">{selectedDoctor.specialty}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {getRatingStars(selectedDoctor.rating)}
                            <span className="text-sm text-blue-700 ml-1">{selectedDoctor.rating}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm text-emerald-800">{selectedDoctor.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm text-emerald-800">{selectedDoctor.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm text-emerald-800">{selectedDoctor.totalHours} horas totales</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Performance Metrics */}
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-emerald-600" />
                      Métricas de Rendimiento
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                        <p className="text-2xl font-bold text-blue-800">{selectedDoctor.casesEvaluated}</p>
                        <p className="text-xs text-blue-600">Casos Totales</p>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg">
                        <p className="text-2xl font-bold text-emerald-800">{selectedDoctor.avgResponseTime}</p>
                        <p className="text-xs text-emerald-600">Tiempo Promedio</p>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                        <p className="text-2xl font-bold text-green-800">{selectedDoctor.acceptanceRate}%</p>
                        <p className="text-xs text-green-600">Tasa Aceptación</p>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                        <p className="text-2xl font-bold text-purple-800">{selectedDoctor.efficiency}%</p>
                        <p className="text-xs text-purple-600">Eficiencia</p>
                      </div>
                    </div>
                  </Card>

                  {/* Performance Comparison */}
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      Comparación de Rendimiento
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg">
                        <p className="text-sm text-slate-600 mb-2">Esta Semana</p>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">{selectedDoctor.performance.thisWeek.cases}</span> casos
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">{selectedDoctor.performance.thisWeek.avgTime}</span> promedio
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">{selectedDoctor.performance.thisWeek.efficiency}%</span>{" "}
                            eficiencia
                          </p>
                        </div>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                        <p className="text-sm text-blue-600 mb-2">Semana Anterior</p>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">{selectedDoctor.performance.lastWeek.cases}</span> casos
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">{selectedDoctor.performance.lastWeek.avgTime}</span> promedio
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">{selectedDoctor.performance.lastWeek.efficiency}%</span>{" "}
                            eficiencia
                          </p>
                        </div>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg">
                        <p className="text-sm text-emerald-600 mb-2">Este Mes</p>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">{selectedDoctor.performance.thisMonth.cases}</span> casos
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">{selectedDoctor.performance.thisMonth.avgTime}</span> promedio
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">{selectedDoctor.performance.thisMonth.efficiency}%</span>{" "}
                            eficiencia
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Recent Cases */}
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      Casos Recientes
                    </h4>
                    <div className="space-y-2">
                      {selectedDoctor.recentCases.map((caseItem: any) => (
                        <div
                          key={caseItem.id}
                          className="flex justify-between items-center p-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded"
                        >
                          <div>
                            <p className="text-sm font-medium">{caseItem.patient}</p>
                            <p className="text-xs text-slate-600">Prioridad: {caseItem.priority}</p>
                          </div>
                          <div className="text-right">
                            <Badge
                              className={
                                caseItem.decision === "Aceptado"
                                  ? "bg-green-100 text-green-800"
                                  : caseItem.decision === "Rechazado"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {caseItem.decision}
                            </Badge>
                            <p className="text-xs text-slate-600 mt-1">{caseItem.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Comments */}
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-yellow-600" />
                      Comentarios de Supervisión ({selectedDoctor.comments.length})
                    </h4>
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {selectedDoctor.comments.length > 0 ? (
                        selectedDoctor.comments.map((comment: any) => (
                          <div
                            key={comment.id}
                            className={`p-3 rounded-lg ${
                              comment.type === "positive"
                                ? "bg-gradient-to-r from-green-50 to-green-100"
                                : "bg-gradient-to-r from-slate-50 to-slate-100"
                            }`}
                          >
                            <p className="text-sm text-slate-800">{comment.text}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-slate-600">Por: {comment.author}</span>
                              <span className="text-xs text-slate-500">{comment.date}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No hay comentarios de supervisión</p>
                      )}
                    </div>
                  </Card>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isChartDetailOpen} onOpenChange={setIsChartDetailOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                  Detalles del Gráfico
                </DialogTitle>
                <DialogDescription>Información detallada del elemento seleccionado</DialogDescription>
              </DialogHeader>
              {selectedChartData && (
                <div className="space-y-4">
                  {selectedChartData.chartType === "performance" && (
                    <div>
                      <h4 className="font-semibold mb-2">Rendimiento de {selectedChartData.name}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-600">Casos Aceptados</p>
                          <p className="text-xl font-bold text-green-800">{selectedChartData.aceptados}</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-600">Casos Rechazados</p>
                          <p className="text-xl font-bold text-red-800">{selectedChartData.rechazados}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg mt-2">
                        <p className="text-sm text-yellow-600">Información Solicitada</p>
                        <p className="text-xl font-bold text-yellow-800">{selectedChartData.info}</p>
                      </div>
                    </div>
                  )}
                  {selectedChartData.chartType === "distribution" && (
                    <div>
                      <h4 className="font-semibold mb-2">Distribución: {selectedChartData.name}</h4>
                      <div className="p-4 rounded-lg" style={{ backgroundColor: `${selectedChartData.color}20` }}>
                        <p className="text-sm" style={{ color: selectedChartData.color }}>
                          Total de casos
                        </p>
                        <p className="text-2xl font-bold" style={{ color: selectedChartData.color }}>
                          {selectedChartData.cases}
                        </p>
                        <p className="text-sm mt-2" style={{ color: selectedChartData.color }}>
                          Representa el {((selectedChartData.value / 112) * 100).toFixed(1)}% del total
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedChartData.chartType === "timeline" && (
                    <div>
                      <h4 className="font-semibold mb-2">Actividad a las {selectedChartData.hour}</h4>
                      <div className="p-4 bg-emerald-50 rounded-lg">
                        <p className="text-sm text-emerald-600">Casos procesados</p>
                        <p className="text-2xl font-bold text-emerald-800">{selectedChartData.casos}</p>
                        <p className="text-sm text-emerald-700 mt-2">{selectedChartData.details}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-emerald-600" />
                  Exportar Reporte de Supervisión
                </DialogTitle>
                <DialogDescription>Configure las opciones del reporte a exportar</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Formato del Reporte</Label>
                  <Select
                    value={exportOptions.format}
                    onValueChange={(value) => setExportOptions({ ...exportOptions, format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>Contenido a Incluir</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="charts"
                        checked={exportOptions.includeCharts}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, includeCharts: checked as boolean })
                        }
                      />
                      <Label htmlFor="charts">Incluir gráficos y visualizaciones</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="details"
                        checked={exportOptions.includeDetails}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, includeDetails: checked as boolean })
                        }
                      />
                      <Label htmlFor="details">Incluir detalles por médico</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="comments"
                        checked={exportOptions.includeComments}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, includeComments: checked as boolean })
                        }
                      />
                      <Label htmlFor="comments">Incluir comentarios de supervisión</Label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="reportName">Nombre del Reporte</Label>
                  <Input id="reportName" placeholder="Reporte de Supervisión - Enero 2024" className="mt-1" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={confirmExport} className="bg-emerald-600 hover:bg-emerald-700">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Reporte
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Advanced Analysis Dialog */}
          <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Análisis {analysisType}
                </DialogTitle>
                <DialogDescription>
                  Genere análisis avanzados basados en datos históricos y tendencias
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <Button
                    onClick={generatePredictiveAnalysis}
                    className="w-full justify-start bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-purple-200 text-purple-700"
                    variant="outline"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Predicción de Demanda de Servicios
                  </Button>
                  <Button
                    onClick={generatePerformanceReport}
                    className="w-full justify-start bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border-emerald-200 text-emerald-700"
                    variant="outline"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Análisis de Rendimiento Médico
                  </Button>
                  <Button
                    onClick={() => handleAdvancedAnalysis("Tendencias")}
                    className="w-full justify-start bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 border-orange-200 text-orange-700"
                    variant="outline"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Análisis de Tendencias Temporales
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAnalysisDialogOpen(false)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
