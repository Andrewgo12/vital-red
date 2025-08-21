"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  MapPin,
  Pill,
  FileText,
  Users,
  Heart,
  Phone,
  Edit,
  ArrowRight,
  Plus,
  CheckCircle,
  Stethoscope,
  Clipboard,
  Shield,
  Thermometer,
  Wind,
  Gauge,
  Bed,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDataStore } from "@/lib/data-store"

export default function HospitalizadosPage() {
  const { toast } = useToast()
  const { cases } = useDataStore()
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [selectedZone, setSelectedZone] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [insuranceFilter, setInsuranceFilter] = useState("all")
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [newNote, setNewNote] = useState("")
  const [isBedManagementOpen, setIsBedManagementOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  // Mock data para pacientes hospitalizados
  const hospitalStats = [
    {
      title: "Pacientes Hospitalizados",
      value: "87",
      change: "+3 hoy",
      icon: Users,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      details: {
        zona_a: 28,
        zona_b: 31,
        zona_c: 28,
        promedio_estancia: "4.2 días",
      },
    },
    {
      title: "Medicamentos Activos",
      value: "234",
      change: "12 pendientes",
      icon: Pill,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      details: {
        administrados_hoy: 156,
        pendientes: 12,
        vencidos: 2,
        proxima_ronda: "14:00",
      },
    },
    {
      title: "Procesos Médicos",
      value: "45",
      change: "8 completados hoy",
      icon: Clipboard,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      details: {
        en_proceso: 18,
        completados: 27,
        programados: 12,
        urgentes: 3,
      },
    },
    {
      title: "Autorizaciones EPS",
      value: "23",
      change: "5 pendientes",
      icon: Shield,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      details: {
        aprobadas: 18,
        pendientes: 5,
        rechazadas: 2,
        tiempo_promedio: "2.5 días",
      },
    },
  ]

  const hospitalizedPatients = [
    {
      id: 1,
      nombre: "Elena Martínez",
      edad: 67,
      cedula: "12345678",
      cama: "A-15",
      zona: "A",
      diagnostico: "Neumonía bilateral",
      fecha_ingreso: "2024-01-15",
      dias_hospitalizacion: 5,
      medico_tratante: "Dr. García",
      eps: "SURA",
      estado_eps: "autorizado",
      estado_paciente: "estable",
      medicamentos: [
        { nombre: "Amoxicilina", dosis: "500mg", frecuencia: "c/8h", proxima: "14:00" },
        { nombre: "Paracetamol", dosis: "1g", frecuencia: "c/6h", proxima: "16:00" },
      ],
      procesos: [
        { tipo: "Radiografía de tórax", estado: "completado", fecha: "2024-01-18" },
        { tipo: "Análisis de sangre", estado: "pendiente", fecha: "2024-01-19" },
      ],
      signos_vitales: { fc: 78, pa: "130/80", temp: 37.1, spo2: 95 },
      telefono: "+57 300 123 4567",
      contacto_emergencia: "Hija - María Martínez (+57 301 987 6543)",
      observaciones: "Paciente respondiendo bien al tratamiento. Mejoría notable en los últimos 2 días.",
    },
    {
      id: 2,
      nombre: "José Rodríguez",
      edad: 45,
      cedula: "87654321",
      cama: "B-08",
      zona: "B",
      diagnostico: "Post-operatorio apendicectomía",
      fecha_ingreso: "2024-01-17",
      dias_hospitalizacion: 2,
      medico_tratante: "Dra. López",
      eps: "NUEVA EPS",
      estado_eps: "pendiente",
      estado_paciente: "recuperacion",
      medicamentos: [
        { nombre: "Tramadol", dosis: "50mg", frecuencia: "c/8h", proxima: "15:00" },
        { nombre: "Omeprazol", dosis: "20mg", frecuencia: "c/12h", proxima: "20:00" },
      ],
      procesos: [
        { tipo: "Control post-quirúrgico", estado: "programado", fecha: "2024-01-19" },
        { tipo: "Retiro de puntos", estado: "programado", fecha: "2024-01-24" },
      ],
      signos_vitales: { fc: 82, pa: "125/75", temp: 36.8, spo2: 98 },
      telefono: "+57 302 456 7890",
      contacto_emergencia: "Esposa - Ana Rodríguez (+57 303 123 4567)",
      observaciones: "Evolución post-quirúrgica satisfactoria. Sin complicaciones.",
    },
    {
      id: 3,
      nombre: "Carmen Silva",
      edad: 72,
      cedula: "45678912",
      cama: "C-12",
      zona: "C",
      diagnostico: "Diabetes descompensada",
      fecha_ingreso: "2024-01-14",
      dias_hospitalizacion: 6,
      medico_tratante: "Dr. Mendoza",
      eps: "COMPENSAR",
      estado_eps: "autorizado",
      estado_paciente: "critico",
      medicamentos: [
        { nombre: "Insulina", dosis: "10UI", frecuencia: "c/6h", proxima: "14:30" },
        { nombre: "Metformina", dosis: "850mg", frecuencia: "c/12h", proxima: "18:00" },
      ],
      procesos: [
        { tipo: "Monitoreo glucemia", estado: "en_proceso", fecha: "2024-01-19" },
        { tipo: "Consulta endocrinología", estado: "programado", fecha: "2024-01-20" },
      ],
      signos_vitales: { fc: 95, pa: "150/90", temp: 36.5, spo2: 96 },
      telefono: "+57 304 789 0123",
      contacto_emergencia: "Hijo - Carlos Silva (+57 305 456 7890)",
      observaciones: "Requiere monitoreo constante de glucemia. Ajuste de medicación en curso.",
    },
  ]

  const zoneMap = [
    {
      zona: "A",
      nombre: "Medicina Interna",
      capacidad: 30,
      ocupados: 28,
      pacientes: hospitalizedPatients.filter((p) => p.zona === "A"),
    },
    {
      zona: "B",
      nombre: "Cirugía General",
      capacidad: 25,
      ocupados: 23,
      pacientes: hospitalizedPatients.filter((p) => p.zona === "B"),
    },
    {
      zona: "C",
      nombre: "Cuidados Especiales",
      capacidad: 20,
      ocupados: 18,
      pacientes: hospitalizedPatients.filter((p) => p.zona === "C"),
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "estable":
        return "bg-green-100 text-green-800 border-green-200"
      case "recuperacion":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "critico":
        return "bg-red-100 text-red-800 border-red-200"
      case "autorizado":
        return "bg-green-100 text-green-800 border-green-200"
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rechazado":
        return "bg-red-100 text-red-800 border-red-200"
      case "completado":
        return "bg-green-100 text-green-800 border-green-200"
      case "en_proceso":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "programado":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getUrgencyLevel = (patient: any) => {
    if (patient.estado_paciente === "critico") return "alta"
    if (patient.dias_hospitalizacion > 7) return "media"
    return "baja"
  }

  const handleAddNoteQuick = (patient: any) => {
    toast({
      title: "Nota médica agregada",
      description: `Nueva nota agregada al expediente de ${patient.nombre}`,
    })
  }

  const handleDischarge = (patient: any) => {
    toast({
      title: "Alta médica procesada",
      description: `${patient.nombre} ha sido dado de alta exitosamente`,
    })
  }

  const handleTransfer = (patient: any) => {
    toast({
      title: "Traslado iniciado",
      description: `Procesando traslado de ${patient.nombre} a otra área`,
    })
  }

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedPatient) return

    toast({
      title: "Nota médica agregada",
      description: `Nueva nota agregada al expediente de ${selectedPatient.nombre}`,
    })

    setNewNote("")
    setIsNoteModalOpen(false)
    setSelectedPatient(null)
  }

  const handleBedManagement = () => {
    setIsBedManagementOpen(true)
    toast({
      title: "Gestión de camas",
      description: "Cargando información de ocupación de camas...",
    })
  }

  const handleGenerateReport = () => {
    setIsReportModalOpen(true)
    toast({
      title: "Generando reporte",
      description: "Preparando reporte de pacientes hospitalizados...",
    })
  }

  const handleExportReport = (format: string) => {
    toast({
      title: "Exportando reporte",
      description: `Generando reporte en formato ${format.toUpperCase()}...`,
    })

    setTimeout(() => {
      toast({
        title: "Reporte exportado",
        description: `Reporte de hospitalizados descargado en ${format.toUpperCase()}`,
      })
    }, 2000)

    setIsReportModalOpen(false)
  }

  const handleNewAdmission = () => {
    toast({
      title: "Nuevo ingreso",
      description: "Iniciando proceso de nuevo ingreso hospitalario",
    })
  }

  // Filter patients based on selected filters
  const filteredPatients = hospitalizedPatients.filter((patient) => {
    const matchesZone = selectedZone === "all" || patient.zona === selectedZone
    const matchesStatus = statusFilter === "all" || patient.estado_paciente === statusFilter
    const matchesInsurance = insuranceFilter === "all" || patient.seguro === insuranceFilter

    return matchesZone && matchesStatus && matchesInsurance
  })

  return (
    <div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Pacientes Hospitalizados
          </h2>
          <p className="text-muted-foreground">Gestión integral de pacientes en hospitalización</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleBedManagement}
            variant="outline"
            className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200 text-blue-700"
          >
            <Bed className="mr-2 h-4 w-4" />
            Gestión de Camas
          </Button>
          <Button
            onClick={handleGenerateReport}
            variant="outline"
            className="bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200 text-purple-700"
          >
            <FileText className="mr-2 h-4 w-4" />
            Reportes
          </Button>
          <Button
            onClick={handleNewAdmission}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Ingreso
          </Button>
        </div>
      </div>

      {/* Estadísticas de Hospitalización */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {hospitalStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <div className={`${stat.color} p-2 rounded-lg shadow-lg`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {stat.title} - Detalles
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {Object.entries(stat.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium capitalize">{key.replace("_", " ")}</span>
                      <span className="text-sm font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mapa de Zonas */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Mapa de Zonas
            </CardTitle>
            <CardDescription>Distribución por áreas hospitalarias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {zoneMap.map((zone) => (
                <Dialog key={zone.zona}>
                  <DialogTrigger asChild>
                    <div className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer bg-white/80 hover:bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Zona {zone.zona}</h4>
                        <Badge variant="outline">
                          {zone.ocupados}/{zone.capacidad}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{zone.nombre}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all"
                          style={{ width: `${(zone.ocupados / zone.capacidad) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round((zone.ocupados / zone.capacidad) * 100)}% ocupación
                      </p>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        Zona {zone.zona} - {zone.nombre}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{zone.capacidad}</p>
                          <p className="text-sm text-muted-foreground">Capacidad</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-lg">
                          <p className="text-2xl font-bold text-emerald-600">{zone.ocupados}</p>
                          <p className="text-sm text-muted-foreground">Ocupadas</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <p className="text-2xl font-bold text-orange-600">{zone.capacidad - zone.ocupados}</p>
                          <p className="text-sm text-muted-foreground">Disponibles</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">Pacientes en la Zona</h4>
                        <ScrollArea className="h-48">
                          <div className="space-y-2">
                            {zone.pacientes.map((patient) => (
                              <div
                                key={patient.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                              >
                                <div>
                                  <p className="font-medium text-sm">{patient.nombre}</p>
                                  <p className="text-xs text-muted-foreground">Cama {patient.cama}</p>
                                </div>
                                <Badge className={getStatusColor(patient.estado_paciente)}>
                                  {patient.estado_paciente}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Pacientes */}
        <Card className="lg:col-span-2 border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  Pacientes Hospitalizados
                </CardTitle>
                <CardDescription>Lista completa con información detallada</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="A">Zona A</SelectItem>
                    <SelectItem value="B">Zona B</SelectItem>
                    <SelectItem value="C">Zona C</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="estable">Estable</SelectItem>
                    <SelectItem value="recuperacion">Recuperación</SelectItem>
                    <SelectItem value="critico">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredPatients.map((patient) => (
                    <Dialog key={patient.id}>
                      <DialogTrigger asChild>
                        <div className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer bg-white/80 hover:bg-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {patient.nombre
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <div>
                                <p className="font-medium">{patient.nombre}</p>
                                <p className="text-sm text-muted-foreground">
                                  {patient.diagnostico} • Cama {patient.cama}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={getStatusColor(patient.estado_paciente)}>
                                    {patient.estado_paciente}
                                  </Badge>
                                  <Badge className={getStatusColor(patient.estado_eps)}>
                                    EPS: {patient.estado_eps}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{patient.dias_hospitalizacion} días</p>
                              <p className="text-xs text-muted-foreground">{patient.medico_tratante}</p>
                            </div>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Stethoscope className="h-5 w-5" />
                            Expediente Completo - {patient.nombre}
                          </DialogTitle>
                        </DialogHeader>
                        <Tabs defaultValue="general" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="medicamentos">Medicamentos</TabsTrigger>
                            <TabsTrigger value="procesos">Procesos</TabsTrigger>
                            <TabsTrigger value="eps">EPS/Seguros</TabsTrigger>
                          </TabsList>

                          <TabsContent value="general" className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Información del Paciente</h4>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>Edad:</strong> {patient.edad} años
                                    </p>
                                    <p>
                                      <strong>Cédula:</strong> {patient.cedula}
                                    </p>
                                    <p>
                                      <strong>Teléfono:</strong> {patient.telefono}
                                    </p>
                                    <p>
                                      <strong>Contacto de emergencia:</strong> {patient.contacto_emergencia}
                                    </p>
                                    <p>
                                      <strong>Cama:</strong> {patient.cama} (Zona {patient.zona})
                                    </p>
                                    <p>
                                      <strong>Fecha de ingreso:</strong> {patient.fecha_ingreso}
                                    </p>
                                    <p>
                                      <strong>Días hospitalizados:</strong> {patient.dias_hospitalizacion}
                                    </p>
                                    <p>
                                      <strong>Médico tratante:</strong> {patient.medico_tratante}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Diagnóstico</h4>
                                  <p className="text-sm bg-blue-50 p-3 rounded">{patient.diagnostico}</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Signos Vitales Actuales</h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                                      <Heart className="h-4 w-4 text-red-500" />
                                      <span className="text-sm">FC: {patient.signos_vitales.fc} lpm</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                      <Gauge className="h-4 w-4 text-blue-500" />
                                      <span className="text-sm">PA: {patient.signos_vitales.pa}</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                                      <Thermometer className="h-4 w-4 text-orange-500" />
                                      <span className="text-sm">T°: {patient.signos_vitales.temp}°C</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                                      <Wind className="h-4 w-4 text-green-500" />
                                      <span className="text-sm">SpO2: {patient.signos_vitales.spo2}%</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Observaciones Médicas</h4>
                                  <p className="text-sm bg-gray-50 p-3 rounded">{patient.observaciones}</p>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="medicamentos" className="space-y-4">
                            <div className="space-y-3">
                              <h4 className="font-semibold">Medicamentos Activos</h4>
                              {patient.medicamentos.map((med, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-white">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-green-100 rounded-lg">
                                        <Pill className="h-4 w-4 text-green-600" />
                                      </div>
                                      <div>
                                        <p className="font-medium">{med.nombre}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {med.dosis} • {med.frecuencia}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium">Próxima dosis</p>
                                      <p className="text-sm text-muted-foreground">{med.proxima}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="procesos" className="space-y-4">
                            <div className="space-y-3">
                              <h4 className="font-semibold">Procesos Médicos</h4>
                              {patient.procesos.map((proceso, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-white">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-purple-100 rounded-lg">
                                        <FileText className="h-4 w-4 text-purple-600" />
                                      </div>
                                      <div>
                                        <p className="font-medium">{proceso.tipo}</p>
                                        <p className="text-sm text-muted-foreground">Fecha: {proceso.fecha}</p>
                                      </div>
                                    </div>
                                    <Badge className={getStatusColor(proceso.estado)}>
                                      {proceso.estado.replace("_", " ")}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="eps" className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <h4 className="font-semibold">Información de Aseguradora</h4>
                                <div className="space-y-2 text-sm">
                                  <p>
                                    <strong>EPS:</strong> {patient.eps}
                                  </p>
                                  <p>
                                    <strong>Estado:</strong>
                                    <Badge className={`ml-2 ${getStatusColor(patient.estado_eps)}`}>
                                      {patient.estado_eps}
                                    </Badge>
                                  </p>
                                  <p>
                                    <strong>Días cubiertos:</strong> {patient.dias_hospitalizacion}/10
                                  </p>
                                  <p>
                                    <strong>Copago:</strong> $50,000
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <h4 className="font-semibold">Autorizaciones</h4>
                                <div className="space-y-2">
                                  <div className="p-3 bg-green-50 rounded-lg">
                                    <p className="text-sm font-medium">Hospitalización</p>
                                    <p className="text-xs text-green-600">Autorizada hasta 10 días</p>
                                  </div>
                                  <div className="p-3 bg-yellow-50 rounded-lg">
                                    <p className="text-sm font-medium">Medicamentos especiales</p>
                                    <p className="text-xs text-yellow-600">Pendiente de autorización</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>

                        <div className="flex gap-2 pt-4 border-t">
                          <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Dar Alta
                          </Button>
                          <Button variant="outline" className="flex-1 bg-transparent">
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Trasladar
                          </Button>
                          <Button
                            onClick={() => handleAddNoteQuick(patient)}
                            variant="outline"
                            className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Agregar Nota
                          </Button>
                          <Button
                            onClick={() => handleDischarge(patient)}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Alta Médica
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Note Modal */}
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Nota Médica</DialogTitle>
            <DialogDescription>
              {selectedPatient && `Agregar nota al expediente de ${selectedPatient.nombre}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Escriba la nota médica..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoteModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddNote}>
              Agregar Nota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bed Management Modal */}
      <Dialog open={isBedManagementOpen} onOpenChange={setIsBedManagementOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-blue-600" />
              Gestión de Camas
            </DialogTitle>
            <DialogDescription>
              Estado actual de ocupación de camas por zona
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {zoneMap.map((zone) => (
              <div key={zone.name} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">{zone.name}</h4>
                  <span className="text-sm text-gray-600">
                    {zone.pacientes.length} pacientes
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div
                      key={i}
                      className={`h-8 rounded border-2 flex items-center justify-center text-xs font-medium ${
                        i < zone.pacientes.length
                          ? 'bg-red-100 border-red-300 text-red-700'
                          : 'bg-green-100 border-green-300 text-green-700'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBedManagementOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reports Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Generar Reportes
            </DialogTitle>
            <DialogDescription>
              Seleccione el tipo de reporte a generar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => handleExportReport('pdf')}
              className="w-full justify-start"
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Reporte General (PDF)
            </Button>
            <Button
              onClick={() => handleExportReport('excel')}
              className="w-full justify-start"
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Reporte Detallado (Excel)
            </Button>
            <Button
              onClick={() => handleExportReport('csv')}
              className="w-full justify-start"
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Datos de Pacientes (CSV)
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
