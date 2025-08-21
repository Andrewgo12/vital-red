"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { useDataStore } from "@/lib/data-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Inbox,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  Eye,
  Stethoscope,
  Heart,
  Activity,
  Phone,
  MapPin,
  FileX,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"

export default function MedicoDashboard() {
  const router = useRouter()
  const { evaluateCase } = useDataStore()
  const { toast } = useToast()
  const [selectedModal, setSelectedModal] = useState<string | null>(null)
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [evaluationNotes, setEvaluationNotes] = useState("")

  const handleQuickNavigation = (destination: string) => {
    setSelectedModal(null)

    switch (destination) {
      case "casos-pendientes":
        router.push('/medico/casos?filter=pendientes')
        break
      case "casos-urgentes":
        router.push('/medico/casos?filter=urgentes')
        break
      case "historial-casos":
        router.push('/medico/historial')
        break
      case "historial-hoy":
        router.push('/medico/historial?filter=hoy')
        break
      case "historial-semana":
        router.push('/medico/historial?filter=semana')
        break
      case "historial-mes":
        router.push('/medico/historial?filter=mes')
        break
      default:
        toast({
          title: "Navegación",
          description: `Navegando a ${destination}...`,
        })
    }
  }

  const handleProfileAction = (action: string) => {
    setSelectedModal(null)

    switch (action) {
      case "editar-info":
        toast({
          title: "Editar información",
          description: "Abriendo formulario de edición de perfil...",
        })
        break
      case "cambiar-password":
        toast({
          title: "Cambiar contraseña",
          description: "Abriendo formulario de cambio de contraseña...",
        })
        break
      case "configurar-notificaciones":
        toast({
          title: "Configurar notificaciones",
          description: "Abriendo configuración de notificaciones...",
        })
        break
    }
  }

  const handleRefreshStats = () => {
    toast({
      title: "Actualizando estadísticas",
      description: "Obteniendo datos más recientes...",
    })

    // Simulate data refresh
    setTimeout(() => {
      toast({
        title: "Estadísticas actualizadas",
        description: "Los datos han sido actualizados exitosamente",
      })
    }, 2000)
  }

  const handleViewDetailedStats = (statType: string) => {
    toast({
      title: "Cargando detalles",
      description: `Mostrando detalles de ${statType.toLowerCase()}...`,
    })

    // Navigate to detailed view
    setTimeout(() => {
      switch (statType) {
        case "casos":
          router.push('/medico/casos')
          break
        case "urgencias":
          router.push('/medico/urgencias')
          break
        case "hospitalizados":
          router.push('/medico/hospitalizados')
          break
        case "historial":
          router.push('/medico/historial')
          break
      }
    }, 1000)
  }

  const stats = [
    {
      title: "Casos Pendientes",
      value: "8",
      description: "Requieren evaluación",
      icon: Inbox,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      gradient: "from-orange-500 to-red-500",
      details: {
        urgent: 3,
        normal: 4,
        low: 1,
        avgWaitTime: "45 min",
        oldestCase: "2 horas",
      },
    },
    {
      title: "Evaluados Hoy",
      value: "15",
      description: "Casos procesados",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      gradient: "from-green-500 to-emerald-500",
      details: {
        accepted: 12,
        rejected: 3,
        efficiency: "93%",
        avgTime: "12 min",
        totalTime: "3.2 horas",
      },
    },
    {
      title: "Tiempo Promedio",
      value: "12 min",
      description: "Por evaluación",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      gradient: "from-blue-500 to-indigo-500",
      details: {
        fastest: "5 min",
        slowest: "28 min",
        target: "15 min",
        performance: "Excelente",
        trend: "-2 min vs ayer",
      },
    },
    {
      title: "Prioridad Alta",
      value: "3",
      description: "Casos urgentes",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      gradient: "from-red-500 to-pink-500",
      details: {
        critical: 1,
        urgent: 2,
        waitingTime: "15 min promedio",
        slaCompliance: "100%",
        escalated: 0,
      },
    },
  ]

  const pendingCases = [
    {
      id: "REF-2024-001",
      patient: "María Elena Rodríguez",
      age: 45,
      diagnosis: "Dolor torácico agudo",
      priority: "Alta",
      origin: "Hospital San José",
      time: "Hace 15 min",
      details: {
        patientId: "P001234",
        phone: "+57 300 123 4567",
        address: "Calle 45 #12-34, Bogotá",
        symptoms: "Dolor torácico opresivo, disnea, sudoración",
        vitalSigns: "PA: 150/90, FC: 110, FR: 24, Sat: 95%",
        medicalHistory: "Hipertensión arterial, diabetes mellitus tipo 2",
        currentMedication: "Metformina 850mg, Losartán 50mg",
        referringDoctor: "Dr. Juan Pérez",
        referringHospital: "Hospital San José - Urgencias",
        attachments: ["ECG.pdf", "Radiografía_tórax.pdf", "Laboratorios.pdf"],
      },
    },
    {
      id: "REF-2024-002",
      patient: "Carlos Alberto Pérez",
      age: 62,
      diagnosis: "Insuficiencia cardíaca",
      priority: "Media",
      origin: "Clínica Central",
      time: "Hace 32 min",
      details: {
        patientId: "P001235",
        phone: "+57 301 987 6543",
        address: "Carrera 15 #67-89, Medellín",
        symptoms: "Disnea de esfuerzo, edema en miembros inferiores",
        vitalSigns: "PA: 140/85, FC: 95, FR: 20, Sat: 92%",
        medicalHistory: "Infarto agudo de miocardio previo, hipertensión",
        currentMedication: "Enalapril 10mg, Furosemida 40mg, ASA 100mg",
        referringDoctor: "Dra. Ana García",
        referringHospital: "Clínica Central - Medicina Interna",
        attachments: ["Ecocardiograma.pdf", "BNP.pdf"],
      },
    },
    {
      id: "REF-2024-003",
      patient: "Ana Sofía López",
      age: 28,
      diagnosis: "Embarazo de alto riesgo",
      priority: "Alta",
      origin: "Centro de Salud Norte",
      time: "Hace 1 hora",
      details: {
        patientId: "P001236",
        phone: "+57 302 456 7890",
        address: "Avenida 68 #23-45, Cali",
        symptoms: "Hipertensión gestacional, proteinuria",
        vitalSigns: "PA: 160/100, FC: 88, FR: 18, Sat: 98%",
        medicalHistory: "Primigesta, sin antecedentes patológicos",
        currentMedication: "Ácido fólico, sulfato ferroso",
        referringDoctor: "Dr. Luis Martínez",
        referringHospital: "Centro de Salud Norte - Ginecología",
        attachments: ["Ecografía_obstétrica.pdf", "Laboratorios_prenatales.pdf"],
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

  const handleCaseEvaluation = (caseData: any, decision: "accept" | "reject") => {
    if (!caseData) return

    const evaluation = {
      decision,
      priority: caseData.priority || 'Media',
      observations: evaluationNotes,
      evaluatedBy: 'Dr. Juan Pérez', // This would come from auth context
      evaluatedAt: new Date().toISOString()
    }

    // Update case with evaluation using data store
    evaluateCase(caseData.id, evaluation)

    setSelectedCase(null)
    setEvaluationNotes("")

    // Show success toast
    toast({
      title: "Caso evaluado exitosamente",
      description: `El caso ${caseData.id} ha sido ${decision === 'accept' ? 'aceptado' : 'rechazado'}`,
    })
  }

  return (
    <ProtectedRoute allowedRoles={['medico']}>
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <Sidebar userRole="medico" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard Médico" userRole="medico" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header with refresh button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Panel de Control Médico</h2>
                <p className="text-slate-600">Gestione sus casos y evaluaciones médicas</p>
              </div>
              <Button
                onClick={handleRefreshStats}
                variant="outline"
                className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
              >
                <Activity className="h-4 w-4 mr-2" />
                Actualizar Datos
              </Button>
            </div>

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pending Cases */}
              <Card className="lg:col-span-2 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Inbox className="h-5 w-5 text-emerald-600" />
                    Casos Pendientes de Evaluación
                  </CardTitle>
                  <CardDescription>Solicitudes que requieren su atención inmediata</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingCases.map((case_) => (
                      <div
                        key={case_.id}
                        className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02] bg-gradient-to-r from-white to-slate-50"
                        onClick={() => setSelectedCase(case_)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                              <User className="h-4 w-4 text-emerald-600" />
                              {case_.patient}
                            </h4>
                            <p className="text-sm text-slate-600">
                              {case_.age} años • ID: {case_.id}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getPriorityColor(case_.priority)} border font-medium`}>
                              {case_.priority}
                            </Badge>
                            <span className="text-xs text-slate-500">{case_.time}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Diagnóstico:</span> {case_.diagnosis}
                          </p>
                          <p className="text-sm flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Origen:</span> {case_.origin}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCase(case_)
                            }}
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            Evaluar Caso
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCase(case_)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200 hover:bg-gradient-to-r hover:from-emerald-100 hover:to-blue-100 transition-all duration-200"
                    onClick={() => router.push('/medico/casos')}
                  >
                    Ver Todos los Casos
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions & Today's Summary */}
              <div className="space-y-6">
                <Card
                  className="border-0 bg-white/80 backdrop-blur-sm shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
                  onClick={() => setSelectedModal("today-summary")}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Resumen de Hoy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="text-sm text-slate-600 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-600" />
                        Casos evaluados
                      </span>
                      <span className="font-semibold text-slate-800">15</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-green-50 transition-colors">
                      <span className="text-sm text-slate-600 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Aceptados
                      </span>
                      <span className="font-semibold text-green-600">12</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-red-50 transition-colors">
                      <span className="text-sm text-slate-600 flex items-center gap-2">
                        <FileX className="h-4 w-4 text-red-600" />
                        Rechazados
                      </span>
                      <span className="font-semibold text-red-600">3</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-orange-50 transition-colors">
                      <span className="text-sm text-slate-600 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        Pendientes
                      </span>
                      <span className="font-semibold text-orange-600">8</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-400">Click para detalles completos</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-slate-800">Acciones Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 hover:from-emerald-100 hover:to-green-100 transition-all duration-200"
                      onClick={() => setSelectedModal("inbox")}
                    >
                      <Inbox className="h-4 w-4 text-emerald-600" />
                      Bandeja de Casos
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                      onClick={() => setSelectedModal("history")}
                    >
                      <FileText className="h-4 w-4 text-blue-600" />
                      Historial
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100 transition-all duration-200"
                      onClick={() => setSelectedModal("profile")}
                    >
                      <User className="h-4 w-4 text-purple-600" />
                      Mi Perfil
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
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
              <Button className="w-full">Ver Análisis Completo</Button>
            </div>
          </DialogContent>
        </Dialog>
      ))}

      {/* Case Detail and Evaluation Modal */}
      <Dialog open={selectedCase !== null} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Evaluación de Caso - {selectedCase?.patient}
            </DialogTitle>
            <DialogDescription>Información completa del paciente y herramientas de evaluación</DialogDescription>
          </DialogHeader>
          {selectedCase && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Información del Paciente
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Nombre:</strong> {selectedCase.patient}
                      </p>
                      <p>
                        <strong>Edad:</strong> {selectedCase.age} años
                      </p>
                      <p>
                        <strong>ID:</strong> {selectedCase.details.patientId}
                      </p>
                      <p className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <strong>Teléfono:</strong> {selectedCase.details.phone}
                      </p>
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <strong>Dirección:</strong> {selectedCase.details.address}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Signos Vitales
                    </h3>
                    <p className="text-sm">{selectedCase.details.vitalSigns}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Síntomas Actuales
                    </h3>
                    <p className="text-sm">{selectedCase.details.symptoms}</p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-purple-800 mb-3">Antecedentes Médicos</h3>
                    <p className="text-sm">{selectedCase.details.medicalHistory}</p>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-yellow-800 mb-3">Medicación Actual</h3>
                    <p className="text-sm">{selectedCase.details.currentMedication}</p>
                  </div>
                </div>
              </div>

              {/* Referral Info */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3">Información de Referencia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <p>
                    <strong>Médico Referente:</strong> {selectedCase.details.referringDoctor}
                  </p>
                  <p>
                    <strong>Hospital de Origen:</strong> {selectedCase.details.referringHospital}
                  </p>
                  <p>
                    <strong>Diagnóstico:</strong> {selectedCase.diagnosis}
                  </p>
                  <p>
                    <strong>Prioridad:</strong>
                    <Badge className={`ml-2 ${getPriorityColor(selectedCase.priority)}`}>{selectedCase.priority}</Badge>
                  </p>
                </div>
              </div>

              {/* Attachments */}
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h3 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documentos Adjuntos
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCase.details.attachments.map((attachment: string, index: number) => (
                    <Button key={index} variant="outline" size="sm" className="bg-white hover:bg-indigo-100">
                      <FileText className="h-3 w-3 mr-1" />
                      {attachment}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Evaluation Section */}
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h3 className="font-semibold text-emerald-800 mb-3">Evaluación Médica</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="evaluation-notes" className="text-sm font-medium">
                      Notas de Evaluación
                    </Label>
                    <Textarea
                      id="evaluation-notes"
                      placeholder="Ingrese sus observaciones, recomendaciones y decisión médica..."
                      value={evaluationNotes}
                      onChange={(e) => setEvaluationNotes(e.target.value)}
                      className="mt-1 min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      onClick={() => handleCaseEvaluation(selectedCase, "accept")}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Aceptar Referencia
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                      onClick={() => handleCaseEvaluation(selectedCase, "reject")}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Rechazar Referencia
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Other Action Modals */}
      <Dialog open={selectedModal === "today-summary"} onOpenChange={() => setSelectedModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resumen Detallado de Hoy</DialogTitle>
            <DialogDescription>Análisis completo de su actividad diaria</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600">Casos Aceptados</p>
                <p className="font-semibold text-green-800">12 (80%)</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-red-600">Casos Rechazados</p>
                <p className="font-semibold text-red-800">3 (20%)</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600">Tiempo Total</p>
                <p className="font-semibold text-blue-800">3.2 horas</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-600">Eficiencia</p>
                <p className="font-semibold text-purple-800">93%</p>
              </div>
            </div>
            <Button className="w-full">Ver Reporte Completo</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedModal === "all-cases"} onOpenChange={() => setSelectedModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Todos los Casos</DialogTitle>
            <DialogDescription>Acceder a la bandeja completa de casos</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => handleQuickNavigation("casos-pendientes")}
              className="w-full bg-transparent"
              variant="outline"
            >
              Ver Casos Pendientes
            </Button>
            <Button
              onClick={() => handleQuickNavigation("casos-urgentes")}
              className="w-full bg-transparent"
              variant="outline"
            >
              Ver Casos Urgentes
            </Button>
            <Button
              onClick={() => handleQuickNavigation("historial-casos")}
              className="w-full bg-transparent"
              variant="outline"
            >
              Ver Historial de Casos
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedModal === "inbox"} onOpenChange={() => setSelectedModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bandeja de Casos</DialogTitle>
            <DialogDescription>Gestionar casos médicos</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => {
                setSelectedModal(null)
                router.push('/medico/casos')
              }}
              className="w-full bg-transparent"
              variant="outline"
            >
              Casos Nuevos
            </Button>
            <Button
              onClick={() => {
                setSelectedModal(null)
                router.push('/medico/casos')
              }}
              className="w-full bg-transparent"
              variant="outline"
            >
              Casos en Revisión
            </Button>
            <Button
              onClick={() => {
                setSelectedModal(null)
                router.push('/medico/historial')
              }}
              className="w-full bg-transparent"
              variant="outline"
            >
              Casos Completados
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedModal === "history"} onOpenChange={() => setSelectedModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Historial Médico</DialogTitle>
            <DialogDescription>Revisar evaluaciones anteriores</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => handleQuickNavigation("historial-hoy")}
              className="w-full bg-transparent"
              variant="outline"
            >
              Historial de Hoy
            </Button>
            <Button
              onClick={() => handleQuickNavigation("historial-semana")}
              className="w-full bg-transparent"
              variant="outline"
            >
              Historial de la Semana
            </Button>
            <Button
              onClick={() => handleQuickNavigation("historial-mes")}
              className="w-full bg-transparent"
              variant="outline"
            >
              Historial del Mes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedModal === "profile"} onOpenChange={() => setSelectedModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mi Perfil Médico</DialogTitle>
            <DialogDescription>Gestionar información personal</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => handleProfileAction("editar-info")}
              className="w-full bg-transparent"
              variant="outline"
            >
              Editar Información
            </Button>
            <Button
              onClick={() => handleProfileAction("cambiar-password")}
              className="w-full bg-transparent"
              variant="outline"
            >
              Cambiar Contraseña
            </Button>
            <Button
              onClick={() => handleProfileAction("configurar-notificaciones")}
              className="w-full bg-transparent"
              variant="outline"
            >
              Configurar Notificaciones
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </ProtectedRoute>
  )
}
