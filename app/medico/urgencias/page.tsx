"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bed,
  Clock,
  Heart,
  Activity,
  MapPin,
  Stethoscope,
  UserCheck,
  ArrowRight,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Phone,
  FileText,
  Thermometer,
  Wind,
  Gauge,
  Truck,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDataStore } from "@/lib/data-store"

export default function UrgenciasPage() {
  const { toast } = useToast()
  const { cases } = useDataStore()
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [selectedBed, setSelectedBed] = useState<any>(null)
  const [selectedSurgery, setSelectedSurgery] = useState<any>(null)
  const [isAmbulanceModalOpen, setIsAmbulanceModalOpen] = useState(false)
  const [isEmergencyReportOpen, setIsEmergencyReportOpen] = useState(false)
  const [triageFilter, setTriageFilter] = useState("all")
  const [zoneFilter, setZoneFilter] = useState("all")

  // Mock data para urgencias
  const urgencyStats = [
    {
      title: "Pacientes en Triaje",
      value: "23",
      change: "+5 última hora",
      icon: UserCheck,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      details: {
        rojo: 3,
        amarillo: 8,
        verde: 12,
        promedio_espera: "15 min",
      },
    },
    {
      title: "Camas Disponibles",
      value: "12/45",
      change: "73% ocupación",
      icon: Bed,
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      details: {
        zona_a: "4/15",
        zona_b: "3/15",
        zona_c: "5/15",
        tiempo_promedio_liberacion: "2.5 hrs",
      },
    },
    {
      title: "Cirugías Programadas",
      value: "8",
      change: "3 urgentes",
      icon: Activity,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      details: {
        urgentes: 3,
        programadas: 5,
        proxima_disponible: "14:30",
        quirofanos_activos: 4,
      },
    },
    {
      title: "Tiempo Promedio",
      value: "45min",
      change: "-10min vs ayer",
      icon: Clock,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      details: {
        triaje: "8 min",
        atencion: "25 min",
        alta: "12 min",
        meta_institucional: "40 min",
      },
    },
  ]

  const triagePatients = [
    {
      id: 1,
      nombre: "María González",
      edad: 45,
      prioridad: "rojo",
      motivo: "Dolor torácico severo",
      tiempo_espera: "5 min",
      signos_vitales: { fc: 120, pa: "160/95", temp: 37.2, spo2: 94 },
      medico_asignado: "Dr. Ramírez",
      cama_asignada: null,
      estado: "esperando_atencion",
      telefono: "+57 300 123 4567",
      cedula: "12345678",
      eps: "SURA",
      acompañante: "Esposo - Juan González",
    },
    {
      id: 2,
      nombre: "Carlos Mendoza",
      edad: 32,
      prioridad: "amarillo",
      motivo: "Fractura en brazo derecho",
      tiempo_espera: "25 min",
      signos_vitales: { fc: 85, pa: "130/80", temp: 36.8, spo2: 98 },
      medico_asignado: "Dra. López",
      cama_asignada: "A-12",
      estado: "en_atencion",
      telefono: "+57 301 987 6543",
      cedula: "87654321",
      eps: "NUEVA EPS",
      acompañante: "Madre - Ana Mendoza",
    },
    {
      id: 3,
      nombre: "Ana Rodríguez",
      edad: 28,
      prioridad: "verde",
      motivo: "Dolor abdominal leve",
      tiempo_espera: "1h 15min",
      signos_vitales: { fc: 78, pa: "120/75", temp: 36.5, spo2: 99 },
      medico_asignado: null,
      cama_asignada: null,
      estado: "esperando_asignacion",
      telefono: "+57 302 456 7890",
      cedula: "45678912",
      eps: "COMPENSAR",
      acompañante: "Sin acompañante",
    },
  ]

  const bedsMap = [
    {
      zona: "A",
      camas: Array.from({ length: 15 }, (_, i) => ({
        numero: `A-${i + 1}`,
        estado: i < 11 ? "ocupada" : "disponible",
        paciente: i < 11 ? `Paciente ${i + 1}` : null,
        tiempo_ocupacion: i < 11 ? `${Math.floor(Math.random() * 8) + 1}h` : null,
      })),
    },
    {
      zona: "B",
      camas: Array.from({ length: 15 }, (_, i) => ({
        numero: `B-${i + 1}`,
        estado: i < 12 ? "ocupada" : "disponible",
        paciente: i < 12 ? `Paciente ${i + 16}` : null,
        tiempo_ocupacion: i < 12 ? `${Math.floor(Math.random() * 6) + 1}h` : null,
      })),
    },
    {
      zona: "C",
      camas: Array.from({ length: 15 }, (_, i) => ({
        numero: `C-${i + 1}`,
        estado: i < 10 ? "ocupada" : "disponible",
        paciente: i < 10 ? `Paciente ${i + 31}` : null,
        tiempo_ocupacion: i < 10 ? `${Math.floor(Math.random() * 4) + 1}h` : null,
      })),
    },
  ]

  const surgeries = [
    {
      id: 1,
      paciente: "Roberto Silva",
      procedimiento: "Apendicectomía",
      prioridad: "urgente",
      hora_programada: "14:30",
      quirofano: "Q1",
      cirujano: "Dr. Martínez",
      estado: "preparacion",
      tiempo_estimado: "2h",
      anestesiologo: "Dr. Vargas",
    },
    {
      id: 2,
      paciente: "Lucía Herrera",
      procedimiento: "Reducción de fractura",
      prioridad: "programada",
      hora_programada: "16:00",
      quirofano: "Q2",
      cirujano: "Dr. Sánchez",
      estado: "esperando",
      tiempo_estimado: "1.5h",
      anestesiologo: "Dra. Morales",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "rojo":
        return "bg-red-500 text-white"
      case "amarillo":
        return "bg-yellow-500 text-black"
      case "verde":
        return "bg-green-500 text-white"
      case "urgente":
        return "bg-red-500 text-white"
      case "programada":
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const handleTriageAssignment = (patient: any, newPriority: string) => {
    toast({
      title: "Triaje actualizado",
      description: `${patient.nombre} reclasificado como prioridad ${newPriority.toUpperCase()}`,
    })
  }

  const handleAdmitPatient = (patient: any) => {
    toast({
      title: "Paciente admitido",
      description: `${patient.nombre} ha sido admitido para hospitalización`,
    })
  }

  const handleDischargePatient = (patient: any) => {
    toast({
      title: "Alta médica",
      description: `${patient.nombre} ha sido dado de alta de urgencias`,
    })
  }

  const handleAssignBed = (bed: any) => {
    if (bed.estado === "disponible") {
      toast({
        title: "Cama asignada",
        description: `Cama ${bed.numero} asignada exitosamente`,
      })
    } else {
      toast({
        title: "Cama no disponible",
        description: `La cama ${bed.numero} está ocupada`,
        variant: "destructive",
      })
    }
  }

  const handleScheduleSurgery = (surgery: any) => {
    toast({
      title: "Cirugía programada",
      description: `${surgery.procedimiento} programada para ${surgery.paciente}`,
    })
  }

  const handleConfirmSurgery = (surgery: any) => {
    toast({
      title: "Cirugía confirmada",
      description: `${surgery.procedimiento} confirmada para ${surgery.paciente} a las ${surgery.hora_programada}`,
    })
  }

  const handleRescheduleSurgery = (surgery: any) => {
    toast({
      title: "Reprogramando cirugía",
      description: `Iniciando reprogramación de ${surgery.procedimiento} para ${surgery.paciente}`,
    })
  }

  const handleViewMedicalRecord = (surgery: any) => {
    toast({
      title: "Abriendo expediente",
      description: `Mostrando expediente médico de ${surgery.paciente}`,
    })
  }

  const handleAmbulanceManagement = () => {
    setIsAmbulanceModalOpen(true)
    toast({
      title: "Gestión de ambulancias",
      description: "Cargando estado de ambulancias disponibles...",
    })
  }

  const handleEmergencyReport = () => {
    setIsEmergencyReportOpen(true)
    toast({
      title: "Reporte de urgencias",
      description: "Generando reporte de actividad de urgencias...",
    })
  }

  const handleDispatchAmbulance = (ambulanceId: string) => {
    toast({
      title: "Ambulancia despachada",
      description: `Ambulancia ${ambulanceId} enviada a emergencia`,
    })
  }

  const handleExportEmergencyReport = (format: string) => {
    toast({
      title: "Exportando reporte",
      description: `Generando reporte de urgencias en ${format.toUpperCase()}...`,
    })

    setTimeout(() => {
      toast({
        title: "Reporte exportado",
        description: `Reporte de urgencias descargado en ${format.toUpperCase()}`,
      })
    }, 2000)

    setIsEmergencyReportOpen(false)
  }

  // Filter patients based on triage priority
  const filteredTriagePatients = triagePatients.filter((patient) => {
    const matchesTriage = triageFilter === "all" || patient.prioridad === triageFilter
    return matchesTriage
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "esperando_atencion":
        return "text-red-600"
      case "en_atencion":
        return "text-blue-600"
      case "esperando_asignacion":
        return "text-yellow-600"
      case "preparacion":
        return "text-orange-600"
      case "esperando":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Gestión de Urgencias
          </h2>
          <p className="text-muted-foreground">Control integral del área de urgencias y triaje</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleAmbulanceManagement}
            variant="outline"
            className="bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-red-200 text-red-700"
          >
            <Truck className="mr-2 h-4 w-4" />
            Ambulancias
          </Button>
          <Button
            onClick={handleEmergencyReport}
            variant="outline"
            className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200 text-blue-700"
          >
            <FileText className="mr-2 h-4 w-4" />
            Reportes
          </Button>
          <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Ingreso
          </Button>
        </div>
      </div>

      {/* Estadísticas de Urgencias */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {urgencyStats.map((stat, index) => {
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Panel de Triaje */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  Panel de Triaje
                </CardTitle>
                <CardDescription>Pacientes en espera de atención</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={triageFilter} onValueChange={setTriageFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="rojo">Rojo</SelectItem>
                    <SelectItem value="amarillo">Amarillo</SelectItem>
                    <SelectItem value="verde">Verde</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredTriagePatients.map((patient) => (
                    <Dialog key={patient.id}>
                      <DialogTrigger asChild>
                        <div className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer bg-white/80 hover:bg-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge className={getPriorityColor(patient.prioridad)}>
                                {patient.prioridad.toUpperCase()}
                              </Badge>
                              <div>
                                <p className="font-medium">{patient.nombre}</p>
                                <p className="text-sm text-muted-foreground">{patient.motivo}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{patient.tiempo_espera}</p>
                              <p className={`text-xs ${getStatusColor(patient.estado)}`}>
                                {patient.estado.replace("_", " ")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Stethoscope className="h-5 w-5" />
                            Evaluación de Triaje - {patient.nombre}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="font-semibold">Información del Paciente</h4>
                              <div className="space-y-1 text-sm">
                                <p>
                                  <strong>Edad:</strong> {patient.edad} años
                                </p>
                                <p>
                                  <strong>Cédula:</strong> {patient.cedula}
                                </p>
                                <p>
                                  <strong>EPS:</strong> {patient.eps}
                                </p>
                                <p>
                                  <strong>Teléfono:</strong> {patient.telefono}
                                </p>
                                <p>
                                  <strong>Acompañante:</strong> {patient.acompañante}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-semibold">Signos Vitales</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                                  <Heart className="h-4 w-4 text-red-500" />
                                  <span>FC: {patient.signos_vitales.fc} lpm</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                  <Gauge className="h-4 w-4 text-blue-500" />
                                  <span>PA: {patient.signos_vitales.pa}</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                                  <Thermometer className="h-4 w-4 text-orange-500" />
                                  <span>T°: {patient.signos_vitales.temp}°C</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                                  <Wind className="h-4 w-4 text-green-500" />
                                  <span>SpO2: {patient.signos_vitales.spo2}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold">Motivo de Consulta</h4>
                            <p className="text-sm bg-gray-50 p-3 rounded">{patient.motivo}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAdmitPatient(patient)}
                              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Admitir
                            </Button>
                            <Button
                              onClick={() => handleTriageAssignment(patient, "rojo")}
                              variant="outline"
                              className="flex-1 bg-gradient-to-r from-red-50 to-pink-50 border-red-200 hover:from-red-100 hover:to-pink-100"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Reclasificar
                            </Button>
                            <Button
                              onClick={() => handleDischargePatient(patient)}
                              variant="outline"
                              className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Alta
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Mapa de Camas */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-emerald-600" />
                  Mapa de Camas
                </CardTitle>
                <CardDescription>Estado en tiempo real por zonas</CardDescription>
              </div>
              <Select value={zoneFilter} onValueChange={setZoneFilter}>
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
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {bedsMap
                  .filter((zone) => zoneFilter === "all" || zone.zona === zoneFilter)
                  .map((zone) => (
                    <div key={zone.zona} className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Zona {zone.zona}
                      </h4>
                      <div className="grid grid-cols-5 gap-2">
                        {zone.camas.map((bed) => (
                          <Dialog key={bed.numero}>
                            <DialogTrigger asChild>
                              <div
                                className={`p-2 rounded text-xs text-center cursor-pointer transition-all hover:scale-105 ${
                                  bed.estado === "ocupada"
                                    ? "bg-red-100 border-red-300 text-red-700 hover:bg-red-200"
                                    : "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                                } border`}
                              >
                                <div className="font-medium">{bed.numero}</div>
                                {bed.tiempo_ocupacion && (
                                  <div className="text-xs opacity-75">{bed.tiempo_ocupacion}</div>
                                )}
                              </div>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Cama {bed.numero}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <Badge className={bed.estado === "ocupada" ? "bg-red-500" : "bg-green-500"}>
                                    {bed.estado === "ocupada" ? "Ocupada" : "Disponible"}
                                  </Badge>
                                  {bed.tiempo_ocupacion && (
                                    <span className="text-sm text-muted-foreground">
                                      Ocupada por {bed.tiempo_ocupacion}
                                    </span>
                                  )}
                                </div>
                                {bed.paciente && (
                                  <div className="space-y-2">
                                    <h4 className="font-semibold">Paciente Actual</h4>
                                    <p>{bed.paciente}</p>
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  {bed.estado === "ocupada" ? (
                                    <>
                                      <Button className="flex-1 bg-transparent" variant="outline">
                                        <Eye className="mr-2 h-4 w-4" />
                                        Ver Paciente
                                      </Button>
                                      <Button className="flex-1 bg-transparent" variant="outline">
                                        <ArrowRight className="mr-2 h-4 w-4" />
                                        Dar Alta
                                      </Button>
                                    </>
                                  ) : (
                                    <Button
                                      onClick={() => handleAssignBed(bed)}
                                      className="w-full bg-emerald-500 hover:bg-emerald-600"
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Asignar Paciente
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Programación Quirúrgica */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Programación Quirúrgica
          </CardTitle>
          <CardDescription>Cirugías programadas y urgentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {surgeries.map((surgery) => (
              <Dialog key={surgery.id}>
                <DialogTrigger asChild>
                  <div className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer bg-white/80 hover:bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge className={getPriorityColor(surgery.prioridad)}>{surgery.prioridad.toUpperCase()}</Badge>
                        <div>
                          <p className="font-medium">{surgery.paciente}</p>
                          <p className="text-sm text-muted-foreground">{surgery.procedimiento}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{surgery.hora_programada}</p>
                        <p className="text-sm text-muted-foreground">
                          {surgery.quirofano} - {surgery.cirujano}
                        </p>
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Cirugía Programada - {surgery.paciente}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">Detalles de la Cirugía</h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <strong>Procedimiento:</strong> {surgery.procedimiento}
                          </p>
                          <p>
                            <strong>Hora:</strong> {surgery.hora_programada}
                          </p>
                          <p>
                            <strong>Duración estimada:</strong> {surgery.tiempo_estimado}
                          </p>
                          <p>
                            <strong>Quirófano:</strong> {surgery.quirofano}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">Equipo Médico</h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <strong>Cirujano:</strong> {surgery.cirujano}
                          </p>
                          <p>
                            <strong>Anestesiólogo:</strong> {surgery.anestesiologo}
                          </p>
                          <p>
                            <strong>Estado:</strong> {surgery.estado}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleConfirmSurgery(surgery)}
                        className="flex-1 bg-purple-500 hover:bg-purple-600"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirmar Cirugía
                      </Button>
                      <Button
                        onClick={() => handleRescheduleSurgery(surgery)}
                        variant="outline"
                        className="flex-1 bg-transparent"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Reprogramar
                      </Button>
                      <Button
                        onClick={() => handleViewMedicalRecord(surgery)}
                        variant="outline"
                        className="flex-1 bg-transparent"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Ver Expediente
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ambulance Management Modal */}
      <Dialog open={isAmbulanceModalOpen} onOpenChange={setIsAmbulanceModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-red-600" />
              Gestión de Ambulancias
            </DialogTitle>
            <DialogDescription>
              Estado actual de ambulancias y despacho de emergencias
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { id: "AMB-001", status: "Disponible", location: "Base Central", crew: "Equipo A" },
              { id: "AMB-002", status: "En Servicio", location: "Zona Norte", crew: "Equipo B" },
              { id: "AMB-003", status: "Disponible", location: "Base Central", crew: "Equipo C" },
              { id: "AMB-004", status: "Mantenimiento", location: "Taller", crew: "N/A" },
            ].map((ambulance) => (
              <div key={ambulance.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{ambulance.id}</h4>
                    <p className="text-sm text-gray-600">{ambulance.location}</p>
                    <p className="text-sm text-gray-600">Tripulación: {ambulance.crew}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      ambulance.status === "Disponible"
                        ? "bg-green-100 text-green-800"
                        : ambulance.status === "En Servicio"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {ambulance.status}
                    </span>
                    {ambulance.status === "Disponible" && (
                      <Button
                        size="sm"
                        onClick={() => handleDispatchAmbulance(ambulance.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Despachar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAmbulanceModalOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Emergency Reports Modal */}
      <Dialog open={isEmergencyReportOpen} onOpenChange={setIsEmergencyReportOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Reportes de Urgencias
            </DialogTitle>
            <DialogDescription>
              Generar reportes de actividad del área de urgencias
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => handleExportEmergencyReport('pdf')}
              className="w-full justify-start"
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Reporte Diario de Urgencias (PDF)
            </Button>
            <Button
              onClick={() => handleExportEmergencyReport('excel')}
              className="w-full justify-start"
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Estadísticas de Triaje (Excel)
            </Button>
            <Button
              onClick={() => handleExportEmergencyReport('csv')}
              className="w-full justify-start"
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Datos de Pacientes (CSV)
            </Button>
            <Button
              onClick={() => handleExportEmergencyReport('pdf')}
              className="w-full justify-start"
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Reporte de Ambulancias (PDF)
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmergencyReportOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
