"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DocumentViewerModal } from "@/components/modals/document-viewer-modal"
import {
  ArrowLeft,
  User,
  FileText,
  Clock,
  MapPin,
  Phone,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Heart,
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  MessageSquare,
  History,
  Share2,
  PrinterIcon as Print,
  Mail,
  Stethoscope,
  Pill,
  TrendingUp,
  AlertCircle,
  Info,
  Star,
  Bookmark,
} from "lucide-react"

export default function CaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [priority, setPriority] = useState("Media")
  const [decision, setDecision] = useState("")
  const [observations, setObservations] = useState("")
  const [isVitalSignsModalOpen, setIsVitalSignsModalOpen] = useState(false)
  const [isPatientHistoryModalOpen, setIsPatientHistoryModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [isReferringDoctorModalOpen, setIsReferringDoctorModalOpen] = useState(false)
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false)
  const [isDecisionConfirmModalOpen, setIsDecisionConfirmModalOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [pendingDecision, setPendingDecision] = useState("")
  const [comment, setComment] = useState("")

  const caseData = {
    id: "REF-2024-001",
    patient: {
      name: "María Elena Rodríguez",
      age: 45,
      gender: "Femenino",
      id: "1234567890",
      phone: "+57 300 123 4567",
      email: "maria.rodriguez@email.com",
      address: "Calle 123 #45-67, Bogotá",
      emergencyContact: {
        name: "Carlos Rodríguez",
        relationship: "Esposo",
        phone: "+57 301 234 5678",
      },
      insurance: "EPS Sanitas",
      bloodType: "O+",
    },
    diagnosis: "Dolor torácico agudo con sospecha de síndrome coronario agudo",
    priority: "Alta",
    status: "Pendiente",
    origin: {
      institution: "Hospital San José",
      doctor: "Dr. Carlos Mendoza",
      specialty: "Medicina Interna",
      phone: "+57 301 987 6543",
      email: "cmendoza@hospitalsanjose.com",
      address: "Av. Caracas #45-23, Bogotá",
    },
    specialty: "Cardiología",
    receivedAt: "2024-01-15 14:30",
    timeElapsed: "2h 15min",
    urgencyScore: 8.5,
    aiConfidence: 92,
    estimatedCost: "$2,500,000",
    clinicalSummary: `Paciente femenina de 45 años que consulta por dolor torácico de inicio súbito, 
    de características opresivas, irradiado a brazo izquierdo y mandíbula, acompañado de diaforesis 
    y náuseas. Antecedentes de hipertensión arterial y diabetes mellitus tipo 2. 
    
    Signos vitales: PA 160/95 mmHg, FC 110 lpm, FR 22 rpm, SatO2 94%.
    
    EKG: Elevación del segmento ST en derivaciones V2-V6, sugestivo de STEMI anterior.
    
    Troponinas: Elevadas (12.5 ng/mL).`,
    vitalSigns: {
      bloodPressure: { systolic: 160, diastolic: 95, unit: "mmHg", status: "Elevada" },
      heartRate: { value: 110, unit: "lpm", status: "Taquicardia" },
      temperature: { value: 36.8, unit: "°C", status: "Normal" },
      oxygenSaturation: { value: 94, unit: "%", status: "Baja" },
      respiratoryRate: { value: 22, unit: "rpm", status: "Elevada" },
      weight: { value: 68, unit: "kg" },
      height: { value: 165, unit: "cm" },
      bmi: { value: 25.0, status: "Normal" },
    },
    medicalHistory: [
      {
        condition: "Hipertensión arterial",
        diagnosedDate: "2022-03-15",
        status: "Activa",
        treatment: "Losartán 50mg c/24h",
      },
      {
        condition: "Diabetes mellitus tipo 2",
        diagnosedDate: "2021-08-20",
        status: "Controlada",
        treatment: "Metformina 850mg c/12h",
      },
      {
        condition: "Dislipidemia",
        diagnosedDate: "2023-01-10",
        status: "En tratamiento",
        treatment: "Atorvastatina 20mg c/24h",
      },
    ],
    familyHistory: [
      "Madre: Infarto agudo de miocardio a los 58 años",
      "Padre: Diabetes mellitus tipo 2",
      "Hermana: Hipertensión arterial",
    ],
    currentMedications: [
      { name: "Losartán", dose: "50mg", frequency: "c/24h", indication: "Hipertensión" },
      { name: "Metformina", dose: "850mg", frequency: "c/12h", indication: "Diabetes" },
      { name: "Atorvastatina", dose: "20mg", frequency: "c/24h", indication: "Dislipidemia" },
      { name: "Aspirina", dose: "100mg", frequency: "c/24h", indication: "Cardioprotección" },
    ],
    allergies: ["Penicilina", "Sulfonamidas"],
    attachments: [
      {
        name: "EKG_Maria_Rodriguez.pdf",
        size: "2.3 MB",
        type: "PDF",
        category: "Electrocardiograma",
        url: "/electrocardiogram.png",
        uploadedAt: "2024-01-15 14:31",
      },
      {
        name: "Laboratorios.pdf",
        size: "1.1 MB",
        type: "PDF",
        category: "Laboratorios",
        url: "/placeholder-7auak.png",
        uploadedAt: "2024-01-15 14:31",
      },
      {
        name: "Radiografia_Torax.jpg",
        size: "3.2 MB",
        type: "Imagen",
        category: "Radiología",
        url: "/chest-xray.png",
        uploadedAt: "2024-01-15 14:32",
      },
    ],
    labResults: [
      { test: "Troponina I", value: "12.5", unit: "ng/mL", reference: "< 0.04", status: "Elevado" },
      { test: "CK-MB", value: "45", unit: "ng/mL", reference: "< 6.3", status: "Elevado" },
      { test: "Glucosa", value: "180", unit: "mg/dL", reference: "70-100", status: "Elevado" },
      { test: "Creatinina", value: "1.1", unit: "mg/dL", reference: "0.6-1.2", status: "Normal" },
      { test: "Hemoglobina", value: "13.2", unit: "g/dL", reference: "12-15", status: "Normal" },
    ],
    history: [
      {
        timestamp: "2024-01-15 14:30",
        action: "Solicitud recibida",
        user: "Sistema",
        details: "Solicitud procesada automáticamente por IA",
        type: "system",
      },
      {
        timestamp: "2024-01-15 14:32",
        action: "Clasificación automática",
        user: "IA Sistema",
        details: "Prioridad asignada: Alta - Sospecha de STEMI",
        type: "ai",
      },
      {
        timestamp: "2024-01-15 14:35",
        action: "Documentos procesados",
        user: "IA Sistema",
        details: "3 documentos analizados con 92% de confianza",
        type: "ai",
      },
      {
        timestamp: "2024-01-15 15:00",
        action: "Asignado para evaluación",
        user: "Sistema",
        details: "Caso asignado al Dr. Ana García - Cardiología",
        type: "system",
      },
    ],
    riskFactors: [
      { factor: "Edad > 40 años", risk: "Moderado" },
      { factor: "Hipertensión arterial", risk: "Alto" },
      { factor: "Diabetes mellitus", risk: "Alto" },
      { factor: "Antecedente familiar cardiovascular", risk: "Alto" },
      { factor: "Dislipidemia", risk: "Moderado" },
    ],
    recommendations: [
      "Evaluación inmediata por cardiología",
      "Monitoreo continuo de signos vitales",
      "Preparar para posible cateterismo cardíaco",
      "Mantener vía venosa permeable",
      "Oxigenoterapia si SatO2 < 95%",
    ],
  }

  const handleDecision = (decisionType: string) => {
    setPendingDecision(decisionType)
    setIsDecisionConfirmModalOpen(true)
  }

  const confirmDecision = () => {
    setDecision(pendingDecision)
    console.log(`Decision: ${pendingDecision}, Priority: ${priority}, Observations: ${observations}`)
    setIsDecisionConfirmModalOpen(false)
    setPendingDecision("")
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

  const getVitalSignStatus = (status: string) => {
    switch (status) {
      case "Normal":
        return "text-green-600"
      case "Elevada":
      case "Elevado":
      case "Taquicardia":
        return "text-red-600"
      case "Baja":
        return "text-orange-600"
      default:
        return "text-slate-600"
    }
  }

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document)
    setIsDocumentModalOpen(true)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
      <Sidebar userRole="medico" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Detalle de Caso Clínico" userRole="medico" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => router.back()} className="hover:bg-blue-50 border-blue-200">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
                <Avatar className="h-16 w-16 border-4 border-emerald-200">
                  <AvatarImage
                    src={`/abstract-geometric-shapes.png?height=64&width=64&query=${caseData.patient.name}`}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-blue-100 text-emerald-700 font-bold text-xl">
                    {caseData.patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{caseData.id}</h2>
                  <p className="text-lg font-semibold text-slate-700">{caseData.patient.name}</p>
                  <p className="text-slate-600">
                    Recibido {caseData.receivedAt} • Tiempo transcurrido: {caseData.timeElapsed}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${getPriorityColor(caseData.priority)} border font-medium`}>
                      {caseData.priority}
                    </Badge>
                    <Badge className="bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-200">
                      Urgencia: {caseData.urgencyScore}/10
                    </Badge>
                    <Badge className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-200">
                      IA: {caseData.aiConfidence}%
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="hover:bg-purple-50 border-purple-200 bg-transparent">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Button variant="outline" className="hover:bg-blue-50 border-blue-200 bg-transparent">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
                <Button variant="outline" className="hover:bg-green-50 border-green-200 bg-transparent">
                  <Print className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-gradient-to-r from-white to-slate-50/50 border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <CardHeader
                    className="bg-gradient-to-r from-blue-50 to-blue-100/50 cursor-pointer hover:from-blue-100 hover:to-blue-150/50 transition-all duration-200"
                    onClick={() => setIsPatientHistoryModalOpen(true)}
                  >
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <User className="h-5 w-5" />
                      Información del Paciente
                      <Info className="h-4 w-4 ml-auto text-blue-600" />
                    </CardTitle>
                    <CardDescription className="text-blue-600">
                      Haga clic para ver información completa del paciente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Nombre Completo</Label>
                          <p className="text-sm text-slate-800 font-semibold">{caseData.patient.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Edad / Género</Label>
                          <p className="text-sm text-slate-800">
                            {caseData.patient.age} años • {caseData.patient.gender}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Tipo de Sangre</Label>
                          <p className="text-sm text-slate-800 font-semibold">{caseData.patient.bloodType}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Documento</Label>
                          <p className="text-sm text-slate-800">{caseData.patient.id}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Teléfono</Label>
                          <p className="text-sm text-slate-800 flex items-center gap-1">
                            <Phone className="h-3 w-3 text-emerald-600" />
                            {caseData.patient.phone}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700">EPS</Label>
                          <p className="text-sm text-slate-800">{caseData.patient.insurance}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-white to-emerald-50/30 border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <CardHeader
                    className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 cursor-pointer hover:from-emerald-100 hover:to-emerald-150/50 transition-all duration-200"
                    onClick={() => setIsVitalSignsModalOpen(true)}
                  >
                    <CardTitle className="flex items-center gap-2 text-emerald-800">
                      <Heart className="h-5 w-5" />
                      Signos Vitales
                      <TrendingUp className="h-4 w-4 ml-auto text-emerald-600" />
                    </CardTitle>
                    <CardDescription className="text-emerald-600">
                      Haga clic para análisis detallado de signos vitales
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white rounded-lg border border-emerald-200 hover:bg-emerald-50/30 transition-colors cursor-pointer">
                        <Heart className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-600">Presión Arterial</p>
                        <p
                          className={`text-lg font-bold ${getVitalSignStatus(caseData.vitalSigns.bloodPressure.status)}`}
                        >
                          {caseData.vitalSigns.bloodPressure.systolic}/{caseData.vitalSigns.bloodPressure.diastolic}
                        </p>
                        <p className="text-xs text-slate-500">{caseData.vitalSigns.bloodPressure.unit}</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border border-emerald-200 hover:bg-emerald-50/30 transition-colors cursor-pointer">
                        <Activity className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-600">Frecuencia Cardíaca</p>
                        <p className={`text-lg font-bold ${getVitalSignStatus(caseData.vitalSigns.heartRate.status)}`}>
                          {caseData.vitalSigns.heartRate.value}
                        </p>
                        <p className="text-xs text-slate-500">{caseData.vitalSigns.heartRate.unit}</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border border-emerald-200 hover:bg-emerald-50/30 transition-colors cursor-pointer">
                        <Thermometer className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-600">Temperatura</p>
                        <p
                          className={`text-lg font-bold ${getVitalSignStatus(caseData.vitalSigns.temperature.status)}`}
                        >
                          {caseData.vitalSigns.temperature.value}
                        </p>
                        <p className="text-xs text-slate-500">{caseData.vitalSigns.temperature.unit}</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border border-emerald-200 hover:bg-emerald-50/30 transition-colors cursor-pointer">
                        <Droplets className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-600">Saturación O2</p>
                        <p
                          className={`text-lg font-bold ${getVitalSignStatus(caseData.vitalSigns.oxygenSaturation.status)}`}
                        >
                          {caseData.vitalSigns.oxygenSaturation.value}
                        </p>
                        <p className="text-xs text-slate-500">{caseData.vitalSigns.oxygenSaturation.unit}</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border border-emerald-200 hover:bg-emerald-50/30 transition-colors cursor-pointer">
                        <Wind className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-600">Freq. Respiratoria</p>
                        <p
                          className={`text-lg font-bold ${getVitalSignStatus(caseData.vitalSigns.respiratoryRate.status)}`}
                        >
                          {caseData.vitalSigns.respiratoryRate.value}
                        </p>
                        <p className="text-xs text-slate-500">{caseData.vitalSigns.respiratoryRate.unit}</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border border-emerald-200 hover:bg-emerald-50/30 transition-colors cursor-pointer">
                        <Activity className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-600">IMC</p>
                        <p className={`text-lg font-bold ${getVitalSignStatus(caseData.vitalSigns.bmi.status)}`}>
                          {caseData.vitalSigns.bmi.value}
                        </p>
                        <p className="text-xs text-slate-500">kg/m²</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Clinical Summary */}
                <Card className="bg-gradient-to-r from-white to-blue-50/30 border-blue-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50">
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <Stethoscope className="h-5 w-5" />
                      Resumen Clínico
                    </CardTitle>
                    <CardDescription className="text-blue-600">Diagnóstico: {caseData.diagnosis}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Especialidad Solicitada</Label>
                          <p className="text-sm text-slate-800 font-semibold">{caseData.specialty}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Costo Estimado</Label>
                          <p className="text-sm text-slate-800 font-semibold">{caseData.estimatedCost}</p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Historia Clínica</Label>
                        <div className="mt-2 p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-lg border border-slate-200">
                          <p className="text-sm whitespace-pre-line text-slate-700 leading-relaxed">
                            {caseData.clinicalSummary}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-white to-green-50/30 border-green-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50">
                    <CardTitle className="text-green-800 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Documentos Adjuntos ({caseData.attachments.length})
                    </CardTitle>
                    <CardDescription className="text-green-600">
                      Archivos médicos enviados con la solicitud
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {caseData.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 bg-white rounded-lg border border-green-200 cursor-pointer hover:bg-green-50/30 hover:shadow-md transition-all duration-200"
                          onClick={() => handleViewDocument(attachment)}
                        >
                          <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
                            <FileText className="h-8 w-8 text-green-700" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">{attachment.name}</p>
                            <p className="text-sm text-slate-600">{attachment.category}</p>
                            <p className="text-xs text-slate-500">
                              {attachment.type} • {attachment.size} • {attachment.uploadedAt}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="hover:bg-green-50 bg-transparent">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                            <Button size="sm" variant="outline" className="hover:bg-blue-50 bg-transparent">
                              <Download className="h-4 w-4 mr-1" />
                              Descargar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-white to-purple-50/30 border-purple-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50">
                    <CardTitle className="text-purple-800">Estado del Caso</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Prioridad Actual</span>
                      <Badge className={`${getPriorityColor(caseData.priority)} border font-medium`}>
                        {caseData.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Estado</span>
                      <Badge className="bg-gradient-to-r from-orange-50 to-orange-100 text-orange-800 border-orange-200">
                        {caseData.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Puntuación Urgencia</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              caseData.urgencyScore >= 9
                                ? "bg-red-500"
                                : caseData.urgencyScore >= 7
                                  ? "bg-orange-500"
                                  : "bg-yellow-500"
                            }`}
                            style={{ width: `${caseData.urgencyScore * 10}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-slate-800">{caseData.urgencyScore}/10</span>
                      </div>
                    </div>
                    <Separator />
                    <div
                      className="cursor-pointer hover:bg-purple-50/50 p-2 rounded-lg transition-colors"
                      onClick={() => setIsReferringDoctorModalOpen(true)}
                    >
                      <Label className="text-sm font-medium text-slate-700">Institución Remitente</Label>
                      <p className="text-sm text-slate-800 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-emerald-600" />
                        {caseData.origin.institution}
                      </p>
                      <p className="text-sm text-slate-700 font-medium">{caseData.origin.doctor}</p>
                      <p className="text-xs text-slate-500">{caseData.origin.specialty}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-white to-emerald-50/30 border-emerald-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100/50">
                    <CardTitle className="text-emerald-800">Panel de Decisión</CardTitle>
                    <CardDescription className="text-emerald-600">
                      Evalúe y tome una decisión sobre este caso
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Ajustar Prioridad</Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger className="border-emerald-200 focus:border-emerald-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Alta">Alta</SelectItem>
                          <SelectItem value="Media">Media</SelectItem>
                          <SelectItem value="Baja">Baja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Observaciones Médicas</Label>
                      <Textarea
                        placeholder="Agregue observaciones médicas detalladas..."
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        rows={4}
                        className="border-emerald-200 focus:border-emerald-400"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Button
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                        onClick={() => handleDecision("Aceptar")}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aceptar Traslado
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                        onClick={() => handleDecision("Rechazar")}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rechazar Solicitud
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full hover:bg-orange-50 border-orange-200 bg-transparent"
                        onClick={() => handleDecision("Solicitar Info")}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Solicitar Más Información
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full hover:bg-blue-50 border-blue-200 bg-transparent"
                        onClick={() => setIsTimelineModalOpen(true)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Agregar Comentario
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-white to-slate-50/30 border-slate-200 shadow-sm">
                  <CardHeader
                    className="bg-gradient-to-r from-slate-50 to-slate-100/50 cursor-pointer hover:from-slate-100 hover:to-slate-150/50 transition-all duration-200"
                    onClick={() => setIsTimelineModalOpen(true)}
                  >
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Clock className="h-5 w-5" />
                      Historial del Caso
                      <History className="h-4 w-4 ml-auto text-slate-600" />
                    </CardTitle>
                    <CardDescription className="text-slate-600">Haga clic para ver cronología completa</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {caseData.history.slice(0, 3).map((entry, index) => (
                        <div
                          key={index}
                          className="border-l-2 border-slate-200 pl-4 pb-3 hover:bg-slate-50/50 p-2 rounded-r-lg transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-800">{entry.action}</p>
                            <span className="text-xs text-slate-500">{entry.timestamp.split(" ")[1]}</span>
                          </div>
                          <p className="text-xs text-slate-600">Por: {entry.user}</p>
                          <p className="text-xs text-slate-500 mt-1">{entry.details}</p>
                        </div>
                      ))}
                      {caseData.history.length > 3 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2 hover:bg-slate-50 bg-transparent"
                          onClick={() => setIsTimelineModalOpen(true)}
                        >
                          Ver {caseData.history.length - 3} eventos más
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={isVitalSignsModalOpen} onOpenChange={setIsVitalSignsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-emerald-600" />
              Análisis Detallado de Signos Vitales
            </DialogTitle>
            <DialogDescription>Evaluación completa del estado fisiológico del paciente</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(caseData.vitalSigns).map(([key, vital]: [string, any]) => (
                <Card key={key} className="bg-gradient-to-br from-emerald-50 to-emerald-100/50">
                  <CardContent className="p-4 text-center">
                    <div className="mb-2">
                      {key === "bloodPressure" && <Heart className="h-8 w-8 text-emerald-600 mx-auto" />}
                      {key === "heartRate" && <Activity className="h-8 w-8 text-emerald-600 mx-auto" />}
                      {key === "temperature" && <Thermometer className="h-8 w-8 text-emerald-600 mx-auto" />}
                      {key === "oxygenSaturation" && <Droplets className="h-8 w-8 text-emerald-600 mx-auto" />}
                      {key === "respiratoryRate" && <Wind className="h-8 w-8 text-emerald-600 mx-auto" />}
                      {(key === "weight" || key === "height" || key === "bmi") && (
                        <Activity className="h-8 w-8 text-emerald-600 mx-auto" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-700 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className={`text-xl font-bold ${getVitalSignStatus(vital.status || "Normal")}`}>
                      {key === "bloodPressure" ? `${vital.systolic}/${vital.diastolic}` : vital.value}
                    </p>
                    <p className="text-sm text-slate-500">{vital.unit}</p>
                    {vital.status && (
                      <Badge
                        className={`mt-2 ${getVitalSignStatus(vital.status) === "text-green-600" ? "bg-green-100 text-green-800" : getVitalSignStatus(vital.status) === "text-red-600" ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"}`}
                      >
                        {vital.status}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Resultados de Laboratorio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {caseData.labResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-800">{result.test}</p>
                        <p className="text-sm text-slate-600">Referencia: {result.reference}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getVitalSignStatus(result.status)}`}>
                          {result.value} {result.unit}
                        </p>
                        <Badge
                          className={`${result.status === "Normal" ? "bg-green-100 text-green-800" : result.status === "Elevado" ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"}`}
                        >
                          {result.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPatientHistoryModalOpen} onOpenChange={setIsPatientHistoryModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-6 w-6 text-blue-600" />
              Información Completa del Paciente
            </DialogTitle>
            <DialogDescription>Historia médica detallada y antecedentes</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-800">Datos Personales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Nombre Completo</Label>
                    <p className="text-sm text-slate-800">{caseData.patient.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Dirección</Label>
                    <p className="text-sm text-slate-800">{caseData.patient.address}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Contacto de Emergencia</Label>
                    <p className="text-sm text-slate-800">{caseData.patient.emergencyContact.name}</p>
                    <p className="text-xs text-slate-600">
                      {caseData.patient.emergencyContact.relationship} • {caseData.patient.emergencyContact.phone}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-800">Antecedentes Médicos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {caseData.medicalHistory.map((condition, index) => (
                      <div key={index} className="p-3 bg-purple-50 rounded-lg">
                        <p className="font-medium text-purple-800">{condition.condition}</p>
                        <p className="text-sm text-purple-600">Diagnóstico: {condition.diagnosedDate}</p>
                        <p className="text-sm text-slate-600">Estado: {condition.status}</p>
                        <p className="text-sm text-slate-600">Tratamiento: {condition.treatment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-800 flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Medicamentos Actuales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {caseData.currentMedications.map((med, index) => (
                      <div key={index} className="p-3 bg-orange-50 rounded-lg">
                        <p className="font-medium text-orange-800">
                          {med.name} {med.dose}
                        </p>
                        <p className="text-sm text-orange-600">Frecuencia: {med.frequency}</p>
                        <p className="text-sm text-slate-600">Indicación: {med.indication}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-800">Alergias y Antecedentes Familiares</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-red-700">Alergias</Label>
                    <div className="flex gap-2 mt-1">
                      {caseData.allergies.map((allergy, index) => (
                        <Badge key={index} className="bg-red-100 text-red-800">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Antecedentes Familiares</Label>
                    <ul className="mt-1 space-y-1">
                      {caseData.familyHistory.map((history, index) => (
                        <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                          <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                          {history}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isReferringDoctorModalOpen} onOpenChange={setIsReferringDoctorModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-6 w-6 text-emerald-600" />
              Información del Médico Remitente
            </DialogTitle>
            <DialogDescription>Detalles de contacto y referencia</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16 border-2 border-emerald-200">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-blue-100 text-emerald-700 font-bold text-lg">
                      {caseData.origin.doctor
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{caseData.origin.doctor}</h3>
                    <p className="text-slate-600">{caseData.origin.specialty}</p>
                    <p className="text-slate-600">{caseData.origin.institution}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm text-slate-700">{caseData.origin.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm text-slate-700">{caseData.origin.email}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-emerald-600 mt-0.5" />
                      <span className="text-sm text-slate-700">{caseData.origin.address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="hover:bg-emerald-50 bg-transparent">
                    <Phone className="h-4 w-4 mr-2" />
                    Llamar
                  </Button>
                  <Button variant="outline" className="hover:bg-blue-50 bg-transparent">
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isTimelineModalOpen} onOpenChange={setIsTimelineModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-6 w-6 text-purple-600" />
              Cronología Completa del Caso
            </DialogTitle>
            <DialogDescription>Historial detallado de todos los eventos y acciones</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-4">
              {caseData.history.map((entry, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-lg border-l-4 ${
                    entry.type === "system"
                      ? "bg-blue-50 border-blue-400"
                      : entry.type === "ai"
                        ? "bg-emerald-50 border-emerald-400"
                        : "bg-purple-50 border-purple-400"
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      entry.type === "system" ? "bg-blue-100" : entry.type === "ai" ? "bg-emerald-100" : "bg-purple-100"
                    }`}
                  >
                    {entry.type === "system" && <Activity className="h-5 w-5 text-blue-600" />}
                    {entry.type === "ai" && <Star className="h-5 w-5 text-emerald-600" />}
                    {entry.type === "user" && <User className="h-5 w-5 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-800">{entry.action}</p>
                      <span className="text-sm text-slate-500">{entry.timestamp}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">Por: {entry.user}</p>
                    <p className="text-sm text-slate-700">{entry.details}</p>
                  </div>
                </div>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Agregar Comentario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Textarea
                    placeholder="Agregue un comentario o observación sobre este caso..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={() => {
                      console.log("Adding comment:", comment)
                      setComment("")
                      setIsTimelineModalOpen(false)
                    }}
                    disabled={!comment.trim()}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Agregar Comentario
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDecisionConfirmModalOpen} onOpenChange={setIsDecisionConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-orange-600" />
              Confirmar Decisión
            </DialogTitle>
            <DialogDescription>¿Está seguro de que desea {pendingDecision.toLowerCase()} este caso?</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700">
                <strong>Caso:</strong> {caseData.id} - {caseData.patient.name}
              </p>
              <p className="text-sm text-slate-700">
                <strong>Decisión:</strong> {pendingDecision}
              </p>
              <p className="text-sm text-slate-700">
                <strong>Prioridad:</strong> {priority}
              </p>
              {observations && (
                <p className="text-sm text-slate-700">
                  <strong>Observaciones:</strong> {observations}
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsDecisionConfirmModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmDecision}>Confirmar {pendingDecision}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DocumentViewerModal
        isOpen={isDocumentModalOpen}
        onClose={() => {
          setIsDocumentModalOpen(false)
          setSelectedDocument(null)
        }}
        document={selectedDocument}
      />
    </div>
  )
}
