"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Settings,
  Save,
  RotateCcw,
  Mail,
  Clock,
  Brain,
  Shield,
  Eye,
  History,
  AlertTriangle,
  CheckCircle,
  FileText,
  Lock,
  Send,
  Upload,
  Download,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ConfigPage() {
  const { toast } = useToast()
  const [config, setConfig] = useState({
    // Email Templates
    acceptanceTemplate: `Estimado/a Dr./Dra. [DOCTOR_NAME],

Su solicitud de referencia para el paciente [PATIENT_NAME] ha sido ACEPTADA.

Detalles del caso:
- ID: [CASE_ID]
- Diagnóstico: [DIAGNOSIS]
- Prioridad: [PRIORITY]

El paciente puede ser trasladado a nuestra institución.

Observaciones: [OBSERVATIONS]

Cordialmente,
Hospital Universitaria ESE`,

    rejectionTemplate: `Estimado/a Dr./Dra. [DOCTOR_NAME],

Su solicitud de referencia para el paciente [PATIENT_NAME] ha sido RECHAZADA.

Motivo: [REJECTION_REASON]

Recomendaciones:
[RECOMMENDATIONS]

Para consultas adicionales, puede contactarnos al [CONTACT_PHONE].

Cordialmente,
Hospital Universitaria ESE`,

    infoRequestTemplate: `Estimado/a Dr./Dra. [DOCTOR_NAME],

Para evaluar adecuadamente la solicitud de referencia del paciente [PATIENT_NAME], requerimos información adicional:

[REQUIRED_INFO]

Por favor envíe la documentación solicitada a la brevedad posible.

Cordialmente,
Hospital Universitaria ESE`,

    // AI Configuration
    aiEnabled: true,
    autoClassification: true,
    confidenceThreshold: 0.8,
    priorityKeywords: "urgente, emergencia, crítico, grave, severo, agudo",

    // System Settings
    operationStartTime: "07:00",
    operationEndTime: "19:00",
    maxResponseTime: 120, // minutes
    autoNotifications: true,
    emailNotifications: true,

    // Security
    sessionTimeout: 30, // minutes
    passwordExpiry: 90, // days
    maxLoginAttempts: 3,
  })

  const [isTemplatePreviewOpen, setIsTemplatePreviewOpen] = useState(false)
  const [isAiConfigOpen, setIsAiConfigOpen] = useState(false)
  const [isSecurityConfigOpen, setIsSecurityConfigOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const configHistory = [
    {
      id: 1,
      action: "Plantilla de aceptación modificada",
      user: "Admin",
      date: "2024-01-15 14:30",
      changes: "Agregado campo de observaciones",
    },
    {
      id: 2,
      action: "Umbral de confianza IA ajustado",
      user: "Admin",
      date: "2024-01-14 10:15",
      changes: "Cambiado de 0.7 a 0.8",
    },
    {
      id: 3,
      action: "Horario operativo actualizado",
      user: "Supervisor",
      date: "2024-01-13 16:45",
      changes: "Extendido hasta las 19:00",
    },
  ]

  const templateVariables = {
    acceptance: [
      { var: "[DOCTOR_NAME]", desc: "Nombre del médico solicitante" },
      { var: "[PATIENT_NAME]", desc: "Nombre del paciente" },
      { var: "[CASE_ID]", desc: "ID único del caso" },
      { var: "[DIAGNOSIS]", desc: "Diagnóstico del paciente" },
      { var: "[PRIORITY]", desc: "Nivel de prioridad asignado" },
      { var: "[OBSERVATIONS]", desc: "Observaciones adicionales" },
    ],
    rejection: [
      { var: "[DOCTOR_NAME]", desc: "Nombre del médico solicitante" },
      { var: "[PATIENT_NAME]", desc: "Nombre del paciente" },
      { var: "[REJECTION_REASON]", desc: "Motivo del rechazo" },
      { var: "[RECOMMENDATIONS]", desc: "Recomendaciones médicas" },
      { var: "[CONTACT_PHONE]", desc: "Teléfono de contacto" },
    ],
    infoRequest: [
      { var: "[DOCTOR_NAME]", desc: "Nombre del médico solicitante" },
      { var: "[PATIENT_NAME]", desc: "Nombre del paciente" },
      { var: "[REQUIRED_INFO]", desc: "Información requerida" },
    ],
  }

  const handleConfigChange = (key: string, value: any) => {
    // Validate specific fields
    if (key === 'confidenceThreshold') {
      if (value < 0 || value > 1) {
        toast({
          title: "Valor inválido",
          description: "El umbral de confianza debe estar entre 0.0 y 1.0",
          variant: "destructive",
        })
        return
      }
    }

    if (key === 'maxResponseTime') {
      if (value < 1 || value > 1440) {
        toast({
          title: "Valor inválido",
          description: "El tiempo máximo debe estar entre 1 y 1440 minutos",
          variant: "destructive",
        })
        return
      }
    }

    setConfig({ ...config, [key]: value })
    setHasUnsavedChanges(true)
  }

  const handleTemplatePreview = (templateType: string) => {
    const templates = {
      acceptance: {
        type: "Aceptación",
        content: config.acceptanceTemplate,
        variables: templateVariables.acceptance,
      },
      rejection: {
        type: "Rechazo",
        content: config.rejectionTemplate,
        variables: templateVariables.rejection,
      },
      infoRequest: {
        type: "Solicitud de Información",
        content: config.infoRequestTemplate,
        variables: templateVariables.infoRequest,
      },
    }
    setSelectedTemplate(templates[templateType as keyof typeof templates])
    setIsTemplatePreviewOpen(true)
  }

  const handleTestEmailConnection = () => {
    toast({
      title: "Probando conexión de email",
      description: "Verificando configuración SMTP...",
    })

    // Simulate email test
    setTimeout(() => {
      toast({
        title: "Conexión exitosa",
        description: "La configuración de email está funcionando correctamente",
      })
    }, 3000)
  }

  const handleSendTestEmail = (templateType: string) => {
    toast({
      title: "Enviando email de prueba",
      description: `Enviando plantilla de ${templateType} a admin@hospital.com...`,
    })

    // Simulate test email
    setTimeout(() => {
      toast({
        title: "Email de prueba enviado",
        description: "Revise la bandeja de entrada para verificar el formato",
      })
    }, 2000)
  }

  const handleExportConfig = () => {
    const configData = JSON.stringify(config, null, 2)
    const blob = new Blob([configData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vital-red-config-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Configuración exportada",
      description: "El archivo de configuración ha sido descargado",
    })
  }

  const handleImportConfig = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const importedConfig = JSON.parse(e.target?.result as string)
            setConfig(importedConfig)
            setHasUnsavedChanges(true)
            toast({
              title: "Configuración importada",
              description: "La configuración ha sido cargada exitosamente",
            })
          } catch (error) {
            toast({
              title: "Error de importación",
              description: "El archivo no tiene un formato válido",
              variant: "destructive",
            })
          }
        }
        reader.readAsText(file)
      }
    }

    input.click()
  }

  const handleSave = () => {
    setIsSaveDialogOpen(true)
  }

  const validateConfiguration = () => {
    const errors = []

    // Validate email templates
    if (!config.emailTemplates?.welcome?.subject) {
      errors.push("El asunto de la plantilla de bienvenida es requerido")
    }
    if (!config.emailTemplates?.welcome?.body) {
      errors.push("El cuerpo de la plantilla de bienvenida es requerido")
    }

    // Validate AI settings
    if (config.aiSettings?.confidenceThreshold < 0 || config.aiSettings?.confidenceThreshold > 1) {
      errors.push("El umbral de confianza debe estar entre 0 y 1")
    }
    if (config.aiSettings?.maxRetries < 1 || config.aiSettings?.maxRetries > 10) {
      errors.push("El número máximo de reintentos debe estar entre 1 y 10")
    }

    // Validate system settings
    if (config.systemSettings?.operatingHours?.start >= config.systemSettings?.operatingHours?.end) {
      errors.push("La hora de inicio debe ser anterior a la hora de fin")
    }

    // Validate security settings
    if (config.securitySettings?.sessionTimeout < 5 || config.securitySettings?.sessionTimeout > 480) {
      errors.push("El tiempo de sesión debe estar entre 5 y 480 minutos")
    }

    return errors
  }

  const confirmSave = () => {
    // Validate configuration before saving
    const validationErrors = validateConfiguration()

    if (validationErrors.length > 0) {
      toast({
        title: "Error de validación",
        description: validationErrors[0], // Show first error
        variant: "destructive",
      })
      setIsSaveDialogOpen(false)
      return
    }

    // Save configuration (in a real app, this would be an API call)
    setHasUnsavedChanges(false)
    setIsSaveDialogOpen(false)

    toast({
      title: "Configuración guardada",
      description: "Todos los cambios han sido guardados exitosamente",
    })
  }

  const handleReset = () => {
    setIsResetDialogOpen(true)
  }

  const confirmReset = () => {
    // Reset to default configuration
    setConfig({
      emailTemplates: {
        welcome: {
          subject: "Bienvenido al Sistema VITAL RED",
          body: "Estimado usuario, bienvenido al sistema de referencia y contrarreferencia..."
        },
        notification: {
          subject: "Nueva Notificación - VITAL RED",
          body: "Tiene una nueva notificación en el sistema..."
        },
        reminder: {
          subject: "Recordatorio - VITAL RED",
          body: "Este es un recordatorio sobre..."
        }
      },
      aiSettings: {
        enabled: true,
        confidenceThreshold: 0.8,
        autoClassification: true,
        maxRetries: 3
      },
      systemSettings: {
        maintenanceMode: false,
        operatingHours: {
          start: "08:00",
          end: "18:00"
        },
        timezone: "America/Bogota"
      },
      securitySettings: {
        sessionTimeout: 30,
        maxLoginAttempts: 3,
        passwordExpiry: 90
      }
    })

    setHasUnsavedChanges(true)
    setIsResetDialogOpen(false)

    toast({
      title: "Configuración restablecida",
      description: "Se han restaurado los valores por defecto. Recuerde guardar los cambios.",
    })
  }

  const getStatusBadge = (enabled: boolean) => {
    return enabled ? (
      <Badge className="bg-green-100 text-green-800 border-green-300">
        <CheckCircle className="h-3 w-3 mr-1" />
        Activo
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 border-red-300">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Inactivo
      </Badge>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <Sidebar userRole="admin" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Configuración del Sistema" userRole="admin" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header with actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                  <Settings className="h-6 w-6 text-emerald-600" />
                  Configuración del Sistema
                </h2>
                <p className="text-muted-foreground">Configure plantillas, criterios de IA y parámetros operativos</p>
                {hasUnsavedChanges && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-600">Hay cambios sin guardar</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleImportConfig}
                  className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportConfig}
                  className="hover:bg-green-50 hover:border-green-300 transition-all duration-300"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsHistoryOpen(true)}
                  className="hover:bg-slate-100 transition-all duration-300"
                >
                  <History className="h-4 w-4 mr-2" />
                  Historial
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="hover:bg-red-50 hover:border-red-300 transition-all duration-300 bg-transparent"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar Defaults
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg transition-all duration-300"
                  disabled={!hasUnsavedChanges}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </div>

            {/* Email Templates */}
            <Card className="bg-gradient-to-r from-white to-slate-50 border-slate-200 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Mail className="h-5 w-5 text-blue-600" />
                      Plantillas de Respuesta
                    </CardTitle>
                    <CardDescription>
                      Configure las plantillas automáticas para respuestas de aceptación, rechazo y solicitud de
                      información
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTemplatePreview("acceptance")}
                      className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Vista Previa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendTestEmail("aceptación")}
                      className="hover:bg-green-50 hover:border-green-300 transition-all duration-300"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Probar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className="space-y-2 cursor-pointer p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-300"
                  onClick={() => handleTemplatePreview("acceptance")}
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor="acceptance" className="text-slate-800 font-medium">
                      Plantilla de Aceptación
                    </Label>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(true)}
                      <Eye className="h-4 w-4 text-slate-500" />
                    </div>
                  </div>
                  <Textarea
                    id="acceptance"
                    value={config.acceptanceTemplate}
                    onChange={(e) => handleConfigChange("acceptanceTemplate", e.target.value)}
                    rows={8}
                    className="font-mono text-sm bg-white"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <p className="text-xs text-muted-foreground">
                    Variables disponibles: [DOCTOR_NAME], [PATIENT_NAME], [CASE_ID], [DIAGNOSIS], [PRIORITY],
                    [OBSERVATIONS] - Click para vista previa
                  </p>
                </div>

                <Separator />

                <div
                  className="space-y-2 cursor-pointer p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-red-300 hover:bg-red-50 transition-all duration-300"
                  onClick={() => handleTemplatePreview("rejection")}
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rejection" className="text-slate-800 font-medium">
                      Plantilla de Rechazo
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTemplatePreview("rejection")}
                        className="hover:bg-red-50 hover:border-red-300 transition-all duration-300"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Vista Previa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendTestEmail("rechazo")}
                        className="hover:bg-red-50 hover:border-red-300 transition-all duration-300"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Probar
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    id="rejection"
                    value={config.rejectionTemplate}
                    onChange={(e) => handleConfigChange("rejectionTemplate", e.target.value)}
                    rows={8}
                    className="font-mono text-sm bg-white"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <p className="text-xs text-muted-foreground">
                    Variables disponibles: [DOCTOR_NAME], [PATIENT_NAME], [REJECTION_REASON], [RECOMMENDATIONS],
                    [CONTACT_PHONE] - Click para vista previa
                  </p>
                </div>

                <Separator />

                <div
                  className="space-y-2 cursor-pointer p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-300"
                  onClick={() => handleTemplatePreview("infoRequest")}
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor="infoRequest" className="text-slate-800 font-medium">
                      Plantilla de Solicitud de Información
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTemplatePreview("infoRequest")}
                        className="hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-300"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Vista Previa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendTestEmail("solicitud de información")}
                        className="hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-300"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Probar
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    id="infoRequest"
                    value={config.infoRequestTemplate}
                    onChange={(e) => handleConfigChange("infoRequestTemplate", e.target.value)}
                    rows={6}
                    className="font-mono text-sm bg-white"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <p className="text-xs text-muted-foreground">
                    Variables disponibles: [DOCTOR_NAME], [PATIENT_NAME], [REQUIRED_INFO] - Click para vista previa
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI Configuration */}
            <Card
              className="bg-gradient-to-r from-white to-purple-50 border-purple-200 shadow-md cursor-pointer hover:shadow-lg transition-all duration-300"
              onClick={() => setIsAiConfigOpen(true)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Brain className="h-5 w-5 text-purple-600" />
                      Configuración de IA
                      {getStatusBadge(config.aiEnabled)}
                    </CardTitle>
                    <CardDescription>
                      Configure los parámetros del módulo de inteligencia artificial para clasificación automática
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 bg-transparent"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Configurar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-purple-800 font-medium">Habilitar IA</Label>
                      <p className="text-sm text-purple-600">
                        Activar procesamiento automático de correos y documentos
                      </p>
                    </div>
                    <Switch
                      checked={config.aiEnabled}
                      onCheckedChange={(checked) => handleConfigChange("aiEnabled", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-blue-800 font-medium">Clasificación Automática</Label>
                      <p className="text-sm text-blue-600">
                        Asignar prioridad automáticamente basada en análisis de IA
                      </p>
                    </div>
                    <Switch
                      checked={config.autoClassification}
                      onCheckedChange={(checked) => handleConfigChange("autoClassification", checked)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="confidence" className="text-slate-800 font-medium">
                      Umbral de Confianza
                    </Label>
                    <Input
                      id="confidence"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.confidenceThreshold}
                      onChange={(e) => handleConfigChange("confidenceThreshold", Number.parseFloat(e.target.value))}
                      className="bg-white"
                    />
                    <p className="text-xs text-muted-foreground">
                      Nivel mínimo de confianza para clasificación automática (0.0 - 1.0)
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-800">
                        {(config.confidenceThreshold * 100).toFixed(0)}%
                      </p>
                      <p className="text-sm text-emerald-600">Precisión Actual</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords" className="text-slate-800 font-medium">
                    Palabras Clave de Prioridad
                  </Label>
                  <Textarea
                    id="keywords"
                    value={config.priorityKeywords}
                    onChange={(e) => handleConfigChange("priorityKeywords", e.target.value)}
                    rows={3}
                    className="bg-white"
                  />
                  <p className="text-xs text-muted-foreground">
                    Palabras separadas por comas que indican alta prioridad
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Operation Settings */}
              <Card className="bg-gradient-to-r from-white to-emerald-50 border-emerald-200 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    Configuración Operativa
                    {getStatusBadge(config.autoNotifications)}
                  </CardTitle>
                  <CardDescription>Horarios de operación y tiempos de respuesta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime" className="text-slate-800 font-medium">
                        Hora de Inicio
                      </Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={config.operationStartTime}
                        onChange={(e) => handleConfigChange("operationStartTime", e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime" className="text-slate-800 font-medium">
                        Hora de Fin
                      </Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={config.operationEndTime}
                        onChange={(e) => handleConfigChange("operationEndTime", e.target.value)}
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxResponse" className="text-slate-800 font-medium">
                      Tiempo Máximo de Respuesta (minutos)
                    </Label>
                    <Input
                      id="maxResponse"
                      type="number"
                      value={config.maxResponseTime}
                      onChange={(e) => handleConfigChange("maxResponseTime", Number.parseInt(e.target.value))}
                      className="bg-white"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-blue-800 font-medium">Notificaciones Automáticas</Label>
                        <p className="text-sm text-blue-600">Enviar notificaciones internas automáticamente</p>
                      </div>
                      <Switch
                        checked={config.autoNotifications}
                        onCheckedChange={(checked) => handleConfigChange("autoNotifications", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-emerald-800 font-medium">Notificaciones por Email</Label>
                        <p className="text-sm text-emerald-600">Enviar notificaciones por correo electrónico</p>
                      </div>
                      <Switch
                        checked={config.emailNotifications}
                        onCheckedChange={(checked) => handleConfigChange("emailNotifications", checked)}
                      />
                    </div>

                    <div className="pt-4 border-t">
                      <Button
                        onClick={handleTestEmailConnection}
                        variant="outline"
                        className="w-full hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Probar Conexión SMTP
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card
                className="bg-gradient-to-r from-white to-red-50 border-red-200 shadow-md cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => setIsSecurityConfigOpen(true)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-slate-800">
                        <Shield className="h-5 w-5 text-red-600" />
                        Configuración de Seguridad
                        <Badge className="bg-red-100 text-red-800 border-red-300">
                          <Lock className="h-3 w-3 mr-1" />
                          Crítico
                        </Badge>
                      </CardTitle>
                      <CardDescription>Parámetros de seguridad y acceso al sistema</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-red-50 hover:border-red-300 transition-all duration-300 bg-transparent"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Configurar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <Label className="text-red-800 font-medium">Tiempo de Sesión</Label>
                          <p className="text-sm text-red-600">Minutos antes de cerrar sesión automáticamente</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-red-800">{config.sessionTimeout}</p>
                          <p className="text-xs text-red-600">minutos</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <Label className="text-orange-800 font-medium">Expiración de Contraseña</Label>
                          <p className="text-sm text-orange-600">Días antes de requerir cambio</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-800">{config.passwordExpiry}</p>
                          <p className="text-xs text-orange-600">días</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <Label className="text-yellow-800 font-medium">Máximo Intentos de Login</Label>
                          <p className="text-sm text-yellow-600">Intentos antes de bloquear cuenta</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-yellow-800">{config.maxLoginAttempts}</p>
                          <p className="text-xs text-yellow-600">intentos</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Template Preview Modal */}
          <Dialog open={isTemplatePreviewOpen} onOpenChange={setIsTemplatePreviewOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Vista Previa - Plantilla de {selectedTemplate?.type}
                </DialogTitle>
                <DialogDescription>Previsualización con variables de ejemplo</DialogDescription>
              </DialogHeader>
              {selectedTemplate && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border">
                    <h4 className="font-semibold mb-2">Plantilla con Variables:</h4>
                    <pre className="text-sm whitespace-pre-wrap font-mono bg-white p-3 rounded border">
                      {selectedTemplate.content}
                    </pre>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border">
                    <h4 className="font-semibold mb-2">Ejemplo Procesado:</h4>
                    <div className="text-sm bg-white p-3 rounded border">
                      {selectedTemplate.content
                        .replace(/\[DOCTOR_NAME\]/g, "Dr. Carlos Rodríguez")
                        .replace(/\[PATIENT_NAME\]/g, "Juan Pérez")
                        .replace(/\[CASE_ID\]/g, "REF-2024-001")
                        .replace(/\[DIAGNOSIS\]/g, "Cardiopatía isquémica")
                        .replace(/\[PRIORITY\]/g, "Alta")
                        .replace(/\[OBSERVATIONS\]/g, "Paciente estable, requiere evaluación cardiológica urgente")
                        .replace(/\[REJECTION_REASON\]/g, "Documentación incompleta")
                        .replace(/\[RECOMMENDATIONS\]/g, "Completar estudios de laboratorio y ECG")
                        .replace(/\[CONTACT_PHONE\]/g, "+57 1 234 5678")
                        .replace(/\[REQUIRED_INFO\]/g, "Resultados de ecocardiograma y pruebas de esfuerzo")}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Variables Disponibles:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedTemplate.variables.map((variable: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-slate-50 rounded text-sm">
                          <code className="font-mono text-blue-600">{variable.var}</code>
                          <span className="text-slate-600">{variable.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Configuration History Modal */}
          <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-emerald-600" />
                  Historial de Configuraciones
                </DialogTitle>
                <DialogDescription>Registro de cambios recientes en la configuración del sistema</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {configHistory.map((entry) => (
                  <div key={entry.id} className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-800">{entry.action}</p>
                        <p className="text-sm text-slate-600">{entry.changes}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">{entry.user}</p>
                        <p className="text-xs text-slate-500">{entry.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Save Confirmation Dialog */}
          <AlertDialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-emerald-600">
                  <Save className="h-5 w-5" />
                  ¿Confirmar cambios de configuración?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Los cambios se aplicarán inmediatamente y afectarán el funcionamiento del sistema. Esta acción se
                  registrará en el historial de configuraciones.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmSave} className="bg-emerald-600 hover:bg-emerald-700">
                  Guardar Configuración
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Reset Confirmation Dialog */}
          <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  ¿Restaurar configuración por defecto?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción restaurará todas las configuraciones a sus valores por defecto. Se perderán todas las
                  personalizaciones actuales. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmReset} className="bg-red-600 hover:bg-red-700">
                  Restaurar Defaults
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  )
}
