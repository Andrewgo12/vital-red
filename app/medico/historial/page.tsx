"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, History, Eye, Download, CheckCircle, XCircle, AlertTriangle, Clock, User, Printer, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDataStore } from "@/lib/data-store"

export default function HistorialPage() {
  const { toast } = useToast()
  const { cases } = useDataStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [decisionFilter, setDecisionFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [specialtyFilter, setSpecialtyFilter] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false)
  const [analysisData, setAnalysisData] = useState<any>(null)

  // Get evaluated cases from data store
  const historyData = cases.filter(case_ => case_.evaluation).map(case_ => ({
    id: case_.id,
    patient: case_.patient.name,
    age: case_.patient.age,
    diagnosis: case_.diagnosis,
    specialty: case_.specialty,
    decision: case_.evaluation?.decision === 'accept' ? 'Aceptado' : 'Rechazado',
    evaluatedBy: case_.evaluation?.evaluatedBy || 'Dr. Juan Pérez',
    evaluatedAt: case_.evaluation?.evaluatedAt || new Date().toISOString(),
    priority: case_.priority,
    observations: case_.evaluation?.observations || '',
    documents: case_.documents || [],
    timeline: [
      { time: case_.createdAt, event: "Caso recibido", type: "received" },
      { time: case_.evaluation?.evaluatedAt, event: `Caso ${case_.evaluation?.decision === 'accept' ? 'aceptado' : 'rechazado'}`, type: case_.evaluation?.decision === 'accept' ? 'accepted' : 'rejected' }
    ]
  }))

  // Fallback data if no cases in store
  const fallbackHistoryData = [
    {
      id: "REF-2024-001",
      patient: "María Elena Rodríguez",
      age: 45,
      diagnosis: "Dolor torácico agudo",
      decision: "Aceptado",
      priority: "Alta",
      specialty: "Cardiología",
      origin: "Hospital San José",
      evaluatedAt: "2024-01-15 16:45",
      responseTime: "2h 15min",
      observations: "Caso urgente, STEMI confirmado. Traslado inmediato para cateterismo.",
      vitalSigns: { bp: "180/110", hr: "95", temp: "36.8°C", spo2: "94%" },
      followUp: "Cateterismo exitoso, stent colocado",
      outcome: "Alta médica en 5 días",
    },
    {
      id: "REF-2024-002",
      patient: "Carlos Alberto Pérez",
      age: 62,
      diagnosis: "Insuficiencia cardíaca descompensada",
      decision: "Aceptado",
      priority: "Media",
      specialty: "Cardiología",
      origin: "Clínica Central",
      evaluatedAt: "2024-01-15 15:30",
      responseTime: "1h 45min",
      observations: "Paciente estable, requiere manejo especializado.",
      vitalSigns: { bp: "120/80", hr: "75", temp: "37.2°C", spo2: "98%" },
      followUp: "Control regular, medicación ajustada",
      outcome: "Alta médica en 10 días",
    },
    {
      id: "REF-2024-003",
      patient: "Ana Sofía López",
      age: 28,
      diagnosis: "Embarazo de alto riesgo",
      decision: "Aceptado",
      priority: "Alta",
      specialty: "Ginecología",
      origin: "Centro de Salud Norte",
      evaluatedAt: "2024-01-15 14:20",
      responseTime: "45min",
      observations: "Preeclampsia severa, requiere atención inmediata.",
      vitalSigns: { bp: "140/90", hr: "85", temp: "36.5°C", spo2: "92%" },
      followUp: "Monitoreo estrecho, alta médica en 7 días",
      outcome: "Alta médica en 7 días",
    },
    {
      id: "REF-2024-004",
      patient: "José Miguel Torres",
      age: 55,
      diagnosis: "Accidente cerebrovascular",
      decision: "Aceptado",
      priority: "Alta",
      specialty: "Neurología",
      origin: "Hospital Regional",
      evaluatedAt: "2024-01-15 13:10",
      responseTime: "30min",
      observations: "ACV isquémico agudo, ventana terapéutica para trombólisis.",
      vitalSigns: { bp: "160/100", hr: "100", temp: "37.0°C", spo2: "96%" },
      followUp: "Trombólisis exitosa, alta médica en 3 días",
      outcome: "Alta médica en 3 días",
    },
    {
      id: "REF-2024-005",
      patient: "Carmen Rosa Díaz",
      age: 38,
      diagnosis: "Fractura compleja de fémur",
      decision: "Rechazado",
      priority: "Media",
      specialty: "Ortopedia",
      origin: "Clínica del Valle",
      evaluatedAt: "2024-01-15 12:30",
      responseTime: "1h 20min",
      observations: "Caso puede ser manejado en institución de origen. Recomendaciones enviadas.",
      vitalSigns: { bp: "130/85", hr: "70", temp: "36.9°C", spo2: "97%" },
      followUp: "Seguimiento en clínica del Valle",
      outcome: "Manejo en clínica del Valle",
    },
    {
      id: "REF-2024-006",
      patient: "Luis Fernando Gómez",
      age: 70,
      diagnosis: "Neumonía complicada",
      decision: "Información Solicitada",
      priority: "Media",
      specialty: "Neumología",
      origin: "Hospital Municipal",
      evaluatedAt: "2024-01-15 11:15",
      responseTime: "2h 10min",
      observations: "Se requieren gases arteriales y cultivos para evaluación completa.",
      vitalSigns: { bp: "150/95", hr: "80", temp: "37.1°C", spo2: "93%" },
      followUp: "Esperando resultados de gases arteriales y cultivos",
      outcome: "Pendiente",
    },
  ]

  // Use real data if available, otherwise use fallback
  const finalHistoryData = historyData.length > 0 ? historyData : fallbackHistoryData

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case "Aceptado":
        return "bg-green-100 text-green-800"
      case "Rechazado":
        return "bg-red-100 text-red-800"
      case "Información Solicitada":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case "Aceptado":
        return <CheckCircle className="h-4 w-4" />
      case "Rechazado":
        return <XCircle className="h-4 w-4" />
      case "Información Solicitada":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "bg-red-100 text-red-800"
      case "Media":
        return "bg-yellow-100 text-yellow-800"
      case "Baja":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatisticsData = (type) => {
    switch (type) {
      case "total":
        return {
          title: "Estadísticas Generales",
          data: [
            { label: "Casos este mes", value: "156" },
            { label: "Promedio diario", value: "5.2" },
            { label: "Tiempo promedio respuesta", value: "1h 45min" },
          ],
        }
      case "accepted":
        return {
          title: "Casos Aceptados",
          data: [
            { label: "Cardiología", value: "45%" },
            { label: "Neurología", value: "25%" },
            { label: "Ginecología", value: "30%" },
          ],
        }
      case "rejected":
        return {
          title: "Casos Rechazados",
          data: [
            { label: "Cardiología", value: "10%" },
            { label: "Neurología", value: "15%" },
            { label: "Ginecología", value: "5%" },
          ],
        }
      case "pending":
        return {
          title: "Casos con Info Solicitada",
          data: [
            { label: "Cardiología", value: "20%" },
            { label: "Neurología", value: "10%" },
            { label: "Ginecología", value: "15%" },
          ],
        }
      default:
        return {}
    }
  }

  const filteredHistory = finalHistoryData.filter((record) => {
    const matchesSearch =
      record.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDecision = decisionFilter === "all" || record.decision === decisionFilter
    const matchesSpecialty = specialtyFilter === "all" || record.specialty === specialtyFilter

    return matchesSearch && matchesDecision && matchesSpecialty
  })

  const stats = {
    total: finalHistoryData.length,
    accepted: finalHistoryData.filter((r) => r.decision === "Aceptado").length,
    rejected: finalHistoryData.filter((r) => r.decision === "Rechazado").length,
    pending: finalHistoryData.filter((r) => r.decision === "Información Solicitada").length,
  }

  const handleExportHistory = () => {
    // Validate if there are records to export
    if (filteredHistory.length === 0) {
      toast({
        title: "No hay datos para exportar",
        description: "No se encontraron registros con los filtros aplicados",
        variant: "destructive",
      })
      return
    }

    // Simulate export process
    toast({
      title: "Exportando historial",
      description: `Generando archivo con ${filteredHistory.length} registros...`,
    })

    // Simulate export completion
    setTimeout(() => {
      toast({
        title: "Exportación completada",
        description: "El archivo de historial ha sido descargado exitosamente",
      })
    }, 2000)
  }

  const handlePrintHistory = () => {
    if (filteredHistory.length === 0) {
      toast({
        title: "No hay datos para imprimir",
        description: "No se encontraron registros con los filtros aplicados",
        variant: "destructive",
      })
      return
    }

    // Simulate print process
    toast({
      title: "Preparando impresión",
      description: `Preparando ${filteredHistory.length} registros para imprimir...`,
    })

    // In a real app, this would open print dialog
    setTimeout(() => {
      window.print()
    }, 1000)
  }

  const handleGenerateAnalysis = () => {
    const analysis = {
      totalCases: finalHistoryData.length,
      acceptanceRate: ((finalHistoryData.filter(r => r.decision === "Aceptado").length / finalHistoryData.length) * 100).toFixed(1),
      rejectionRate: ((finalHistoryData.filter(r => r.decision === "Rechazado").length / finalHistoryData.length) * 100).toFixed(1),
      avgResponseTime: "2.4 horas",
      topSpecialties: [
        { name: "Cardiología", count: finalHistoryData.filter(r => r.specialty === "Cardiología").length },
        { name: "Neurología", count: finalHistoryData.filter(r => r.specialty === "Neurología").length },
        { name: "Ginecología", count: finalHistoryData.filter(r => r.specialty === "Ginecología").length }
      ].sort((a, b) => b.count - a.count),
      monthlyTrend: [
        { month: "Enero", cases: 45, acceptance: 78 },
        { month: "Febrero", cases: 52, acceptance: 82 },
        { month: "Marzo", cases: 48, acceptance: 75 },
        { month: "Abril", cases: 61, acceptance: 85 }
      ]
    }

    setAnalysisData(analysis)
    setIsAnalysisModalOpen(true)

    toast({
      title: "Análisis generado",
      description: "Análisis de tendencias y métricas completado",
    })
  }

  const handleExportAnalysis = () => {
    if (!analysisData) return

    toast({
      title: "Exportando análisis",
      description: "Generando reporte de análisis en PDF...",
    })

    setTimeout(() => {
      toast({
        title: "Análisis exportado",
        description: "El reporte de análisis ha sido descargado",
      })
    }, 2000)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar userRole="medico" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Historial de Solicitudes" userRole="medico" />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              {[
                { key: "total", icon: History, label: "Total Evaluados", value: stats.total, color: "text-blue-600" },
                {
                  key: "accepted",
                  icon: CheckCircle,
                  label: "Aceptados",
                  value: stats.accepted,
                  color: "text-green-600",
                },
                { key: "rejected", icon: XCircle, label: "Rechazados", value: stats.rejected, color: "text-red-600" },
                {
                  key: "pending",
                  icon: AlertTriangle,
                  label: "Info Solicitada",
                  value: stats.pending,
                  color: "text-yellow-600",
                },
              ].map(({ key, icon: Icon, label, value, color }) => (
                <Dialog key={key}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 bg-gradient-to-br from-white to-gray-50 border-0 shadow-sm">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">{label}</p>
                            <p className={`text-lg font-bold ${color}`}>{value}</p>
                          </div>
                          <Icon className={`h-5 w-5 ${color}`} />
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${color}`} />
                        {getStatisticsData(key)?.title}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      {getStatisticsData(key)?.data.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{item.label}</span>
                          <span className="font-semibold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-white to-blue-50 border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Search className="h-4 w-4" />
                  Filtros de Búsqueda
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="search" className="text-xs">
                      Búsqueda
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Paciente, diagnóstico..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-7 h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Decisión</Label>
                    <Select value={decisionFilter} onValueChange={setDecisionFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las decisiones" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las decisiones</SelectItem>
                        <SelectItem value="Aceptado">Aceptado</SelectItem>
                        <SelectItem value="Rechazado">Rechazado</SelectItem>
                        <SelectItem value="Información Solicitada">Información Solicitada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Especialidad</Label>
                    <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las especialidades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las especialidades</SelectItem>
                        <SelectItem value="Cardiología">Cardiología</SelectItem>
                        <SelectItem value="Neurología">Neurología</SelectItem>
                        <SelectItem value="Ginecología">Ginecología</SelectItem>
                        <SelectItem value="Ortopedia">Ortopedia</SelectItem>
                        <SelectItem value="Neumología">Neumología</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("")
                        setDecisionFilter("all")
                        setSpecialtyFilter("all")
                      }}
                      className="w-full bg-transparent"
                    >
                      Limpiar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Historial de Evaluaciones ({filteredHistory.length})</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleGenerateAnalysis}
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Análisis
                    </Button>
                    <Button
                      onClick={handlePrintHistory}
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir
                    </Button>
                    <Button
                      onClick={handleExportHistory}
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200 hover:from-emerald-100 hover:to-blue-100"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50">
                        <TableHead className="text-xs font-semibold">Paciente</TableHead>
                        <TableHead className="text-xs font-semibold">Diagnóstico</TableHead>
                        <TableHead className="text-xs font-semibold">Decisión</TableHead>
                        <TableHead className="text-xs font-semibold">Prioridad</TableHead>
                        <TableHead className="text-xs font-semibold">Tiempo</TableHead>
                        <TableHead className="text-xs font-semibold">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.map((record) => (
                        <Dialog key={record.id}>
                          <DialogTrigger asChild>
                            <TableRow className="cursor-pointer hover:bg-blue-50 transition-colors">
                              <TableCell className="py-2">
                                <div>
                                  <p className="font-medium text-sm">{record.patient}</p>
                                  <p className="text-xs text-muted-foreground">{record.age} años</p>
                                </div>
                              </TableCell>
                              <TableCell className="py-2">
                                <div>
                                  <p className="text-xs">{record.diagnosis}</p>
                                  <p className="text-xs text-muted-foreground">{record.specialty}</p>
                                </div>
                              </TableCell>
                              <TableCell className="py-2">
                                <div className="flex items-center gap-1">
                                  {getDecisionIcon(record.decision)}
                                  <Badge className={`${getDecisionColor(record.decision)} text-xs px-2 py-0`}>
                                    {record.decision}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="py-2">
                                <Badge className={`${getPriorityColor(record.priority)} text-xs px-2 py-0`}>
                                  {record.priority}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-2">
                                <span className="text-xs font-medium">{record.responseTime}</span>
                              </TableCell>
                              <TableCell className="py-2">
                                <div className="flex gap-1">
                                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs bg-transparent">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs bg-transparent">
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-600" />
                                Detalle Completo - {record.patient}
                              </DialogTitle>
                              <DialogDescription>Información completa del caso {record.id}</DialogDescription>
                            </DialogHeader>
                            <Tabs defaultValue="general" className="w-full">
                              <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="general">General</TabsTrigger>
                                <TabsTrigger value="clinical">Clínico</TabsTrigger>
                                <TabsTrigger value="decision">Decisión</TabsTrigger>
                                <TabsTrigger value="followup">Seguimiento</TabsTrigger>
                              </TabsList>
                              <TabsContent value="general" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Información del Paciente</Label>
                                    <div className="p-3 bg-blue-50 rounded-lg space-y-1">
                                      <p className="text-sm">
                                        <strong>Nombre:</strong> {record.patient}
                                      </p>
                                      <p className="text-sm">
                                        <strong>Edad:</strong> {record.age} años
                                      </p>
                                      <p className="text-sm">
                                        <strong>ID:</strong> {record.id}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Origen y Especialidad</Label>
                                    <div className="p-3 bg-green-50 rounded-lg space-y-1">
                                      <p className="text-sm">
                                        <strong>Origen:</strong> {record.origin}
                                      </p>
                                      <p className="text-sm">
                                        <strong>Especialidad:</strong> {record.specialty}
                                      </p>
                                      <p className="text-sm">
                                        <strong>Evaluado:</strong> {record.evaluatedAt}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="clinical" className="space-y-4">
                                <div className="space-y-3">
                                  <div>
                                    <Label className="text-sm font-semibold">Diagnóstico</Label>
                                    <p className="text-sm p-3 bg-yellow-50 rounded-lg">{record.diagnosis}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-semibold">Signos Vitales</Label>
                                    <div className="grid grid-cols-2 gap-2 p-3 bg-red-50 rounded-lg">
                                      <p className="text-sm">
                                        <strong>PA:</strong> {record.vitalSigns?.bp}
                                      </p>
                                      <p className="text-sm">
                                        <strong>FC:</strong> {record.vitalSigns?.hr}
                                      </p>
                                      <p className="text-sm">
                                        <strong>Temp:</strong> {record.vitalSigns?.temp}
                                      </p>
                                      <p className="text-sm">
                                        <strong>SpO2:</strong> {record.vitalSigns?.spo2}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="decision" className="space-y-4">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    {getDecisionIcon(record.decision)}
                                    <Badge className={getDecisionColor(record.decision)}>{record.decision}</Badge>
                                    <Badge className={getPriorityColor(record.priority)}>{record.priority}</Badge>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-semibold">Observaciones</Label>
                                    <p className="text-sm p-3 bg-gray-50 rounded-lg">{record.observations}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-semibold">Tiempo de Respuesta</Label>
                                    <p className="text-sm p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                                      <Clock className="h-4 w-4" />
                                      {record.responseTime}
                                    </p>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="followup" className="space-y-4">
                                <div className="space-y-3">
                                  <div>
                                    <Label className="text-sm font-semibold">Seguimiento</Label>
                                    <p className="text-sm p-3 bg-green-50 rounded-lg">{record.followUp}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-semibold">Resultado Final</Label>
                                    <p className="text-sm p-3 bg-purple-50 rounded-lg">{record.outcome}</p>
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Analysis Modal */}
      <Dialog open={isAnalysisModalOpen} onOpenChange={setIsAnalysisModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Análisis de Tendencias y Métricas
            </DialogTitle>
            <DialogDescription>
              Análisis detallado de su historial de evaluaciones médicas
            </DialogDescription>
          </DialogHeader>
          {analysisData && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{analysisData.totalCases}</p>
                  <p className="text-sm text-blue-700">Total Casos</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{analysisData.acceptanceRate}%</p>
                  <p className="text-sm text-green-700">Tasa Aceptación</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{analysisData.rejectionRate}%</p>
                  <p className="text-sm text-red-700">Tasa Rechazo</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{analysisData.avgResponseTime}</p>
                  <p className="text-sm text-purple-700">Tiempo Promedio</p>
                </div>
              </div>

              {/* Top Specialties */}
              <div>
                <h4 className="font-semibold mb-3">Especialidades Más Evaluadas</h4>
                <div className="space-y-2">
                  {analysisData.topSpecialties.slice(0, 3).map((specialty: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{specialty.name}</span>
                      <span className="font-semibold">{specialty.count} casos</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Trend */}
              <div>
                <h4 className="font-semibold mb-3">Tendencia Mensual</h4>
                <div className="space-y-2">
                  {analysisData.monthlyTrend.map((month: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{month.month}</span>
                      <div className="text-right">
                        <span className="font-semibold">{month.cases} casos</span>
                        <span className="text-sm text-green-600 ml-2">({month.acceptance}% aceptación)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAnalysisModalOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={handleExportAnalysis}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Análisis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
