"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CaseEvaluationModal } from "@/components/modals/case-evaluation-modal"
import { DocumentViewerModal } from "@/components/modals/document-viewer-modal"
import {
  Search,
  Filter,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Heart,
  Activity,
  Calendar,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  History,
  TrendingUp,
  AlertCircle,
  Download,
  Share2,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { useDataStore } from "@/lib/data-store"
import { useToast } from "@/hooks/use-toast"

export default function CasosMedicosPage() {
  const { cases, evaluateCase } = useDataStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [specialtyFilter, setSpecialtyFilter] = useState("all")
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [isPatientDetailModalOpen, setIsPatientDetailModalOpen] = useState(false)
  const [isQuickStatsModalOpen, setIsQuickStatsModalOpen] = useState(false)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [comment, setComment] = useState("")
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    dateFrom: "",
    dateTo: "",
    hospital: "",
    doctor: "",
    ageRange: { min: "", max: "" }
  })

  // Cases now come from the data store

  const quickStats = {
    totalCases: cases.length,
    pendingCases: cases.filter((c) => c.status === "Pendiente").length,
    highPriority: cases.filter((c) => c.priority === "Alta").length,
    averageResponseTime: "2h 45min",
    acceptanceRate: "78%",
    specialtyDistribution: {
      Cardiología: 2,
      Neurología: 1,
      Ginecología: 1,
      Ortopedia: 1,
    },
    monthlyTrends: [
      { month: "Ene", cases: 45, accepted: 35 },
      { month: "Feb", cases: 52, accepted: 41 },
      { month: "Mar", cases: 38, accepted: 29 },
    ],
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200"
      case "Media":
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-200"
      case "Baja":
        return "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-200"
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-800 border-orange-200"
      case "En Revisión":
        return "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-200"
      case "Aceptado":
        return "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-200"
      case "Rechazado":
        return "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200"
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pendiente":
        return <Clock className="h-4 w-4" />
      case "En Revisión":
        return <AlertTriangle className="h-4 w-4" />
      case "Aceptado":
        return <CheckCircle className="h-4 w-4" />
      case "Rechazado":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getUrgencyColor = (score: number) => {
    if (score >= 9) return "text-red-600 font-bold"
    if (score >= 7) return "text-orange-600 font-semibold"
    if (score >= 5) return "text-yellow-600 font-medium"
    return "text-green-600"
  }

  const filteredCases = cases.filter((case_) => {
    const matchesSearch =
      case_.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || case_.status === statusFilter
    const matchesPriority = priorityFilter === "all" || case_.priority === priorityFilter
    const matchesSpecialty = specialtyFilter === "all" || case_.specialty === specialtyFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesSpecialty
  })

  const handleEvaluateCase = (caseData: any) => {
    setSelectedCase(caseData)
    setIsEvaluationModalOpen(true)
  }

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document)
    setIsDocumentModalOpen(true)
  }

  const handlePatientDetail = (caseData: any) => {
    setSelectedCase(caseData)
    setIsPatientDetailModalOpen(true)
  }

  const handleAddComment = (caseData: any) => {
    setSelectedCase(caseData)
    setIsCommentModalOpen(true)
  }

  const handleViewHistory = (caseData: any) => {
    setSelectedCase(caseData)
    setIsHistoryModalOpen(true)
  }

  const handleCaseDecision = async (decision: string, priority: string, observations: string) => {
    if (!selectedCase) return

    const evaluation = {
      decision: decision as 'accept' | 'reject',
      priority,
      observations,
      evaluatedBy: 'Dr. Juan Pérez', // This would come from auth context
      evaluatedAt: new Date().toISOString()
    }

    // Update case with evaluation
    evaluateCase(selectedCase.id, evaluation)

    setIsEvaluationModalOpen(false)
    setSelectedCase(null)

    // Show success toast
    toast({
      title: "Caso evaluado exitosamente",
      description: `El caso ${selectedCase.id} ha sido ${decision === 'accept' ? 'aceptado' : 'rechazado'}`,
    })
  }

  const handleSubmitComment = () => {
    if (!selectedCase || !comment.trim()) return

    // In a real app, this would save the comment to the database
    toast({
      title: "Comentario agregado",
      description: `Comentario agregado al caso ${selectedCase.id} exitosamente`,
    })

    setComment("")
    setIsCommentModalOpen(false)
    setSelectedCase(null)
  }

  const handleAdvancedFilter = () => {
    let filteredCases = cases

    // Apply advanced filters
    if (advancedFilters.dateFrom) {
      filteredCases = filteredCases.filter(case_ =>
        new Date(case_.createdAt) >= new Date(advancedFilters.dateFrom)
      )
    }

    if (advancedFilters.dateTo) {
      filteredCases = filteredCases.filter(case_ =>
        new Date(case_.createdAt) <= new Date(advancedFilters.dateTo)
      )
    }

    if (advancedFilters.hospital) {
      filteredCases = filteredCases.filter(case_ =>
        case_.origin.toLowerCase().includes(advancedFilters.hospital.toLowerCase())
      )
    }

    if (advancedFilters.ageRange.min) {
      filteredCases = filteredCases.filter(case_ =>
        case_.patient.age >= parseInt(advancedFilters.ageRange.min)
      )
    }

    if (advancedFilters.ageRange.max) {
      filteredCases = filteredCases.filter(case_ =>
        case_.patient.age <= parseInt(advancedFilters.ageRange.max)
      )
    }

    toast({
      title: "Filtros aplicados",
      description: `${filteredCases.length} casos coinciden con los criterios`,
    })

    setIsAdvancedFiltersOpen(false)
  }

  const handleClearAdvancedFilters = () => {
    setAdvancedFilters({
      dateFrom: "",
      dateTo: "",
      hospital: "",
      doctor: "",
      ageRange: { min: "", max: "" }
    })

    toast({
      title: "Filtros limpiados",
      description: "Todos los filtros avanzados han sido restablecidos",
    })
  }

  const handleExportCases = () => {
    toast({
      title: "Exportando casos",
      description: "Generando archivo con casos filtrados...",
    })

    setTimeout(() => {
      toast({
        title: "Exportación completada",
        description: `${filteredCases.length} casos exportados exitosamente`,
      })
    }, 2000)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
      <Sidebar userRole="medico" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Bandeja de Casos Médicos" userRole="medico" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:scale-105"
                onClick={() => setIsQuickStatsModalOpen(true)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Total de Casos</p>
                      <p className="text-2xl font-bold text-blue-900">{quickStats.totalCases}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 hover:scale-105"
                onClick={() => setIsQuickStatsModalOpen(true)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700">Casos Pendientes</p>
                      <p className="text-2xl font-bold text-orange-900">{quickStats.pendingCases}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-red-50 to-red-100/50 border-red-200 hover:scale-105"
                onClick={() => setIsQuickStatsModalOpen(true)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-700">Alta Prioridad</p>
                      <p className="text-2xl font-bold text-red-900">{quickStats.highPriority}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 hover:scale-105"
                onClick={() => setIsQuickStatsModalOpen(true)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-700">Tasa de Aceptación</p>
                      <p className="text-2xl font-bold text-emerald-900">{quickStats.acceptanceRate}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-white to-slate-50/50 border-slate-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Filter className="h-5 w-5 text-emerald-600" />
                  Filtros y Búsqueda Avanzada
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Filtre y busque casos según sus criterios de evaluación médica
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search" className="text-slate-700 font-medium">
                      Búsqueda
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="search"
                        placeholder="Paciente, diagnóstico, ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Estado</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="border-slate-200 focus:border-emerald-400">
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="En Revisión">En Revisión</SelectItem>
                        <SelectItem value="Aceptado">Aceptado</SelectItem>
                        <SelectItem value="Rechazado">Rechazado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Prioridad</Label>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="border-slate-200 focus:border-emerald-400">
                        <SelectValue placeholder="Todas las prioridades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las prioridades</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Media">Media</SelectItem>
                        <SelectItem value="Baja">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Especialidad</Label>
                    <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                      <SelectTrigger className="border-slate-200 focus:border-emerald-400">
                        <SelectValue placeholder="Todas las especialidades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las especialidades</SelectItem>
                        <SelectItem value="Cardiología">Cardiología</SelectItem>
                        <SelectItem value="Neurología">Neurología</SelectItem>
                        <SelectItem value="Ginecología">Ginecología</SelectItem>
                        <SelectItem value="Ortopedia">Ortopedia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAdvancedFiltersOpen(true)}
                      className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200 text-blue-700"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Filtros Avanzados
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleExportCases}
                      className="flex-1 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200 text-green-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                        setPriorityFilter("all")
                        setSpecialtyFilter("all")
                      }}
                      className="flex-1 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 border-slate-200"
                    >
                      Limpiar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-white to-slate-50/30 border-slate-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                <CardTitle className="text-slate-800">
                  Casos Médicos ({filteredCases.length} de {cases.length})
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Lista de solicitudes de referencia y contra-referencia
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md border-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-100 to-slate-50 hover:bg-slate-100">
                        <TableHead className="text-slate-700 font-semibold">ID / Paciente</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Diagnóstico</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Prioridad</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Estado</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Origen</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Urgencia</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Tiempo</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCases.map((case_) => (
                        <TableRow
                          key={case_.id}
                          className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-emerald-50/30 transition-all duration-200 cursor-pointer border-b border-slate-100"
                          onClick={() => handlePatientDetail(case_)}
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border-2 border-emerald-200">
                                <AvatarImage
                                  src={`/abstract-geometric-shapes.png?height=40&width=40&query=${case_.patient.name}`}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-blue-100 text-emerald-700 font-semibold">
                                  {case_.patient.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-slate-800">{case_.id}</p>
                                <p className="text-sm text-slate-600">
                                  {case_.patient.name}, {case_.patient.age} años
                                </p>
                                <p className="text-xs text-slate-500">{case_.patient.gender}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div>
                              <p className="text-sm font-medium text-slate-800">{case_.diagnosis}</p>
                              <p className="text-xs text-slate-600 flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {case_.specialty}
                              </p>
                              {case_.aiConfidence && (
                                <p className="text-xs text-emerald-600 font-medium">
                                  IA: {case_.aiConfidence}% confianza
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge className={`${getPriorityColor(case_.priority)} border font-medium`}>
                              {case_.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(case_.status)}
                              <Badge className={`${getStatusColor(case_.status)} border font-medium`}>
                                {case_.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-slate-500" />
                              <div>
                                <p className="text-sm font-medium text-slate-800">{case_.origin}</p>
                                <p className="text-xs text-slate-500">{case_.receivedAt}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            {case_.urgencyScore && (
                              <div className="flex items-center gap-2">
                                <div className={`text-lg font-bold ${getUrgencyColor(case_.urgencyScore)}`}>
                                  {case_.urgencyScore}/10
                                </div>
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      case_.urgencyScore >= 9
                                        ? "bg-red-500"
                                        : case_.urgencyScore >= 7
                                          ? "bg-orange-500"
                                          : case_.urgencyScore >= 5
                                            ? "bg-yellow-500"
                                            : "bg-green-500"
                                    }`}
                                    style={{ width: `${case_.urgencyScore * 10}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-sm font-medium text-slate-700">{case_.timeElapsed}</span>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              <Link href={`/medico/casos/${case_.id}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="hover:bg-blue-50 border-blue-200 bg-transparent"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Ver
                                </Button>
                              </Link>
                              {(case_.status === "Pendiente" || case_.status === "En Revisión") && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEvaluateCase(case_)
                                  }}
                                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                                >
                                  Evaluar
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAddComment(case_)
                                }}
                                className="hover:bg-yellow-50 border-yellow-200"
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Comentar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewHistory(case_)
                                }}
                                className="hover:bg-purple-50 border-purple-200"
                              >
                                <History className="h-3 w-3 mr-1" />
                                Historial
                              </Button>
                              {case_.attachments && case_.attachments.length > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewDocument(case_.attachments[0])
                                  }}
                                  className="hover:bg-green-50 border-green-200"
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  Docs ({case_.attachments.length})
                                </Button>
                              )}
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
        </main>
      </div>

      <Dialog open={isPatientDetailModalOpen} onOpenChange={setIsPatientDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-emerald-200">
                <AvatarImage src={`/abstract-geometric-shapes.png?height=48&width=48&query=${selectedCase?.patient}`} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-blue-100 text-emerald-700 font-bold text-lg">
                  {selectedCase?.patient
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{selectedCase?.patient}</h3>
                <p className="text-sm text-slate-600">
                  {selectedCase?.id} • {selectedCase?.age} años • {selectedCase?.gender}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription>Información detallada del paciente y caso clínico</DialogDescription>
          </DialogHeader>

          {selectedCase && (
            <div className="space-y-6">
              {/* Clinical Summary */}
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100/50">
                <CardHeader>
                  <CardTitle className="text-blue-800 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Resumen Clínico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">{selectedCase.clinicalSummary}</p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Diagnóstico</p>
                      <p className="font-semibold text-slate-800">{selectedCase.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Especialidad</p>
                      <p className="font-semibold text-slate-800">{selectedCase.specialty}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vital Signs */}
              {selectedCase.vitalSigns && (
                <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100/50">
                  <CardHeader>
                    <CardTitle className="text-emerald-800 flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Signos Vitales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg border border-emerald-200">
                        <p className="text-sm text-slate-600">Presión Arterial</p>
                        <p className="text-lg font-bold text-emerald-700">{selectedCase.vitalSigns.bloodPressure}</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-emerald-200">
                        <p className="text-sm text-slate-600">Frecuencia Cardíaca</p>
                        <p className="text-lg font-bold text-emerald-700">{selectedCase.vitalSigns.heartRate}</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-emerald-200">
                        <p className="text-sm text-slate-600">Temperatura</p>
                        <p className="text-lg font-bold text-emerald-700">{selectedCase.vitalSigns.temperature}</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-emerald-200">
                        <p className="text-sm text-slate-600">Saturación O2</p>
                        <p className="text-lg font-bold text-emerald-700">{selectedCase.vitalSigns.oxygenSaturation}</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-emerald-200">
                        <p className="text-sm text-slate-600">Freq. Respiratoria</p>
                        <p className="text-lg font-bold text-emerald-700">{selectedCase.vitalSigns.respiratoryRate}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Medical History and Medications */}
              <div className="grid md:grid-cols-2 gap-4">
                {selectedCase.medicalHistory && (
                  <Card className="bg-gradient-to-r from-purple-50 to-purple-100/50">
                    <CardHeader>
                      <CardTitle className="text-purple-800 flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Antecedentes Médicos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedCase.medicalHistory.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-slate-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {selectedCase.currentMedications && (
                  <Card className="bg-gradient-to-r from-orange-50 to-orange-100/50">
                    <CardHeader>
                      <CardTitle className="text-orange-800 flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Medicamentos Actuales
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedCase.currentMedications.map((med: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-slate-700">{med}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Referring Doctor */}
              {selectedCase.referringDoctor && (
                <Card className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                  <CardHeader>
                    <CardTitle className="text-slate-800 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Médico Remitente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold text-slate-800">{selectedCase.referringDoctor.name}</p>
                        <p className="text-slate-600">{selectedCase.referringDoctor.specialty}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-700">{selectedCase.referringDoctor.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-700">{selectedCase.referringDoctor.email}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Attachments */}
              {selectedCase.attachments && selectedCase.attachments.length > 0 && (
                <Card className="bg-gradient-to-r from-green-50 to-green-100/50">
                  <CardHeader>
                    <CardTitle className="text-green-800 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Documentos Adjuntos ({selectedCase.attachments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedCase.attachments.map((doc: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200 cursor-pointer hover:bg-green-50 transition-colors"
                          onClick={() => handleViewDocument(doc)}
                        >
                          <FileText className="h-8 w-8 text-green-600" />
                          <div className="flex-1">
                            <p className="font-medium text-slate-800">{doc.name}</p>
                            <p className="text-sm text-slate-600">
                              {doc.type} • {doc.size}
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    setIsPatientDetailModalOpen(false)
                    handleEvaluateCase(selectedCase)
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  Evaluar Caso
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPatientDetailModalOpen(false)
                    handleAddComment(selectedCase)
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Agregar Comentario
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPatientDetailModalOpen(false)
                    handleViewHistory(selectedCase)
                  }}
                >
                  <History className="h-4 w-4 mr-2" />
                  Ver Historial
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isQuickStatsModalOpen} onOpenChange={setIsQuickStatsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
              Estadísticas Rápidas del Sistema
            </DialogTitle>
            <DialogDescription>Análisis detallado del rendimiento y métricas del sistema</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">{quickStats.totalCases}</p>
                <p className="text-sm text-blue-600">Total de Casos</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                <p className="text-2xl font-bold text-orange-700">{quickStats.pendingCases}</p>
                <p className="text-sm text-orange-600">Casos Pendientes</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                <p className="text-2xl font-bold text-red-700">{quickStats.highPriority}</p>
                <p className="text-sm text-red-600">Alta Prioridad</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
                <p className="text-2xl font-bold text-emerald-700">{quickStats.acceptanceRate}</p>
                <p className="text-sm text-emerald-600">Tasa Aceptación</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Especialidad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(quickStats.specialtyDistribution).map(([specialty, count]) => (
                    <div key={specialty} className="flex items-center justify-between">
                      <span className="text-slate-700">{specialty}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                            style={{ width: `${(count / quickStats.totalCases) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-slate-800">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendencias Mensuales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickStats.monthlyTrends.map((month) => (
                    <div key={month.month} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-700">{month.month}</span>
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Recibidos</p>
                          <p className="font-bold text-blue-700">{month.cases}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Aceptados</p>
                          <p className="font-bold text-emerald-700">{month.accepted}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Tasa</p>
                          <p className="font-bold text-purple-700">
                            {Math.round((month.accepted / month.cases) * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
              Agregar Comentario
            </DialogTitle>
            <DialogDescription>Agregue un comentario o observación sobre el caso {selectedCase?.id}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="comment">Comentario</Label>
              <Textarea
                id="comment"
                placeholder="Escriba su comentario u observación sobre este caso..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsCommentModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitComment} disabled={!comment.trim()}>
                Agregar Comentario
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-purple-600" />
              Historial del Caso
            </DialogTitle>
            <DialogDescription>Cronología completa de eventos para el caso {selectedCase?.id}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Caso Recibido</p>
                  <p className="text-sm text-blue-600">{selectedCase?.receivedAt}</p>
                  <p className="text-sm text-slate-600">Solicitud recibida desde {selectedCase?.origin}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-400">
                <Activity className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-medium text-emerald-800">Procesamiento IA</p>
                  <p className="text-sm text-emerald-600">2024-01-15 14:32</p>
                  <p className="text-sm text-slate-600">
                    Análisis automático completado con {selectedCase?.aiConfidence}% de confianza
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800">Asignación de Prioridad</p>
                  <p className="text-sm text-orange-600">2024-01-15 14:35</p>
                  <p className="text-sm text-slate-600">Prioridad asignada: {selectedCase?.priority}</p>
                </div>
              </div>

              {selectedCase?.comments &&
                selectedCase.comments.map((comment: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400"
                  >
                    <MessageSquare className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-800">Comentario - {comment.author}</p>
                      <p className="text-sm text-purple-600">{comment.timestamp}</p>
                      <p className="text-sm text-slate-600">{comment.content}</p>
                    </div>
                  </div>
                ))}

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border-l-4 border-slate-400">
                <Clock className="h-5 w-5 text-slate-600 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800">Estado Actual</p>
                  <p className="text-sm text-slate-600">Ahora</p>
                  <p className="text-sm text-slate-600">
                    Estado: {selectedCase?.status} • Tiempo transcurrido: {selectedCase?.timeElapsed}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Existing modals */}
      <CaseEvaluationModal
        isOpen={isEvaluationModalOpen}
        onClose={() => {
          setIsEvaluationModalOpen(false)
          setSelectedCase(null)
        }}
        caseData={selectedCase}
        onDecision={handleCaseDecision}
      />

      <DocumentViewerModal
        isOpen={isDocumentModalOpen}
        onClose={() => {
          setIsDocumentModalOpen(false)
          setSelectedDocument(null)
        }}
        document={selectedDocument}
      />

      {/* Advanced Filters Dialog */}
      <Dialog open={isAdvancedFiltersOpen} onOpenChange={setIsAdvancedFiltersOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Filtros Avanzados
            </DialogTitle>
            <DialogDescription>
              Configure filtros detallados para casos médicos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha Desde</Label>
                <Input
                  type="date"
                  value={advancedFilters.dateFrom}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha Hasta</Label>
                <Input
                  type="date"
                  value={advancedFilters.dateTo}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Hospital de Origen</Label>
              <Input
                placeholder="Nombre del hospital..."
                value={advancedFilters.hospital}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, hospital: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Edad Mínima</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={advancedFilters.ageRange.min}
                  onChange={(e) => setAdvancedFilters(prev => ({
                    ...prev,
                    ageRange: { ...prev.ageRange, min: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Edad Máxima</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={advancedFilters.ageRange.max}
                  onChange={(e) => setAdvancedFilters(prev => ({
                    ...prev,
                    ageRange: { ...prev.ageRange, max: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClearAdvancedFilters}>
              Limpiar
            </Button>
            <Button onClick={handleAdvancedFilter}>
              Aplicar Filtros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
