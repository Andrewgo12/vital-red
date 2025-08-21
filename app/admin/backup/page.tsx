"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Database, Download, Upload, RefreshCw, AlertTriangle, CheckCircle, Clock, HardDrive } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function BackupPage() {
  const { toast } = useToast()
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<any>(null)
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true)
  const [backupFrequency, setBackupFrequency] = useState("daily")
  const [selectedLog, setSelectedLog] = useState<any>(null)
  const [autoBackupConfig, setAutoBackupConfig] = useState({
    enabled: true,
    frequency: "daily",
    time: "00:00",
    retention: 30,
    compression: true,
    encryption: false,
  })

  const backups = [
    {
      id: 1,
      name: "backup_2024_01_15_16_30.sql",
      type: "Manual",
      size: "45.2 MB",
      createdAt: "2024-01-15 16:30:00",
      status: "Completado",
      description: "Respaldo manual antes de actualización",
    },
    {
      id: 2,
      name: "backup_2024_01_15_00_00.sql",
      type: "Automático",
      size: "44.8 MB",
      createdAt: "2024-01-15 00:00:00",
      status: "Completado",
      description: "Respaldo automático diario",
    },
    {
      id: 3,
      name: "backup_2024_01_14_00_00.sql",
      type: "Automático",
      size: "44.1 MB",
      createdAt: "2024-01-14 00:00:00",
      status: "Completado",
      description: "Respaldo automático diario",
    },
    {
      id: 4,
      name: "backup_2024_01_13_00_00.sql",
      type: "Automático",
      size: "43.9 MB",
      createdAt: "2024-01-13 00:00:00",
      status: "Completado",
      description: "Respaldo automático diario",
    },
    {
      id: 5,
      name: "backup_2024_01_12_00_00.sql",
      type: "Automático",
      size: "43.5 MB",
      createdAt: "2024-01-12 00:00:00",
      status: "Error",
      description: "Fallo en respaldo automático - espacio insuficiente",
    },
  ]

  const systemLogs = [
    {
      id: 1,
      timestamp: "2024-01-15 16:30:15",
      level: "INFO",
      message: "Respaldo manual iniciado por admin",
      component: "BackupService",
    },
    {
      id: 2,
      timestamp: "2024-01-15 16:32:45",
      level: "INFO",
      message: "Respaldo completado exitosamente - 45.2 MB",
      component: "BackupService",
    },
    {
      id: 3,
      timestamp: "2024-01-15 14:30:00",
      level: "INFO",
      message: "Usuario admin inició sesión",
      component: "AuthService",
    },
    {
      id: 4,
      timestamp: "2024-01-15 12:15:30",
      level: "WARNING",
      message: "Tiempo de respuesta elevado en evaluación de caso REF-2024-001",
      component: "CaseService",
    },
    {
      id: 5,
      timestamp: "2024-01-15 10:45:22",
      level: "ERROR",
      message: "Fallo en procesamiento automático de correo - formato no reconocido",
      component: "AIService",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completado":
        return "bg-green-100 text-green-800"
      case "Error":
        return "bg-red-100 text-red-800"
      case "En Proceso":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completado":
        return <CheckCircle className="h-4 w-4" />
      case "Error":
        return <AlertTriangle className="h-4 w-4" />
      case "En Proceso":
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "ERROR":
        return "bg-red-100 text-red-800"
      case "WARNING":
        return "bg-yellow-100 text-yellow-800"
      case "INFO":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true)

    // Simulate backup creation with real feedback
    setTimeout(() => {
      setIsCreatingBackup(false)
      toast({
        title: "Respaldo creado exitosamente",
        description: `Respaldo manual creado: backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.sql`,
      })
    }, 3000)
  }

  const handleDownloadBackup = (backupId: number) => {
    const backup = backups.find(b => b.id === backupId)
    if (backup && backup.status === "Completado") {
      // Simulate file download
      toast({
        title: "Descarga iniciada",
        description: `Descargando ${backup.name}...`,
      })

      // In a real app, this would trigger actual file download
      setTimeout(() => {
        toast({
          title: "Descarga completada",
          description: `${backup.name} descargado exitosamente`,
        })
      }, 2000)
    } else {
      toast({
        title: "Error de descarga",
        description: "No se puede descargar un respaldo incompleto",
        variant: "destructive",
      })
    }
  }

  const handleRestoreBackup = (backupId: number) => {
    const backup = backups.find(b => b.id === backupId)
    if (backup && backup.status === "Completado") {
      toast({
        title: "Restauración iniciada",
        description: `Restaurando desde ${backup.name}. Esto puede tomar varios minutos...`,
      })

      // Simulate restore process
      setTimeout(() => {
        toast({
          title: "Restauración completada",
          description: "La base de datos ha sido restaurada exitosamente",
        })
      }, 5000)
    } else {
      toast({
        title: "Error de restauración",
        description: "No se puede restaurar desde un respaldo incompleto",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBackup = (backupId: number) => {
    const backup = backups.find(b => b.id === backupId)
    if (backup) {
      toast({
        title: "Respaldo eliminado",
        description: `${backup.name} ha sido eliminado del sistema`,
      })
    }
  }

  const handleRestoreFromFile = () => {
    // Create file input element
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.sql,.backup,.bak'

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        toast({
          title: "Archivo seleccionado",
          description: `Iniciando restauración desde ${file.name}...`,
        })

        // Simulate restore process
        setTimeout(() => {
          toast({
            title: "Restauración completada",
            description: "La base de datos ha sido restaurada desde el archivo",
          })
        }, 5000)
      }
    }

    input.click()
  }

  const handleToggleAutoBackup = () => {
    setAutoBackupEnabled(!autoBackupEnabled)
    toast({
      title: autoBackupEnabled ? "Backup automático desactivado" : "Backup automático activado",
      description: autoBackupEnabled
        ? "Los respaldos automáticos han sido desactivados"
        : `Respaldos automáticos programados ${backupFrequency === 'daily' ? 'diariamente' : 'semanalmente'}`,
    })
  }

  const handleChangeFrequency = (frequency: string) => {
    setBackupFrequency(frequency)
    toast({
      title: "Frecuencia actualizada",
      description: `Respaldos automáticos programados ${frequency === 'daily' ? 'diariamente' : 'semanalmente'}`,
    })
  }

  const handleSaveBackupConfig = () => {
    toast({
      title: "Configuración guardada",
      description: "La configuración de respaldos automáticos ha sido actualizada",
    })
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <Sidebar userRole="admin" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Gestión de Respaldo" userRole="admin" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Último Respaldo</p>
                          <p className="text-lg font-bold">Hace 2h</p>
                          <p className="text-xs text-green-600">Exitoso</p>
                        </div>
                        <Database className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Detalles del Último Respaldo</DialogTitle>
                    <DialogDescription>Información completa del respaldo más reciente</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Archivo</Label>
                        <p className="text-sm font-mono bg-gray-100 p-2 rounded">backup_2024_01_15_16_30.sql</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Tamaño</Label>
                        <p className="text-sm">45.2 MB (47,448,064 bytes)</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Duración</Label>
                        <p className="text-sm">2 minutos 15 segundos</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Compresión</Label>
                        <p className="text-sm">Habilitada (ratio: 3.2:1)</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <Badge variant="outline">usuarios (1,247 registros)</Badge>
                        <Badge variant="outline">casos (3,891 registros)</Badge>
                        <Badge variant="outline">evaluaciones (5,623 registros)</Badge>
                        <Badge variant="outline">documentos (2,156 registros)</Badge>
                        <Badge variant="outline">configuracion (45 registros)</Badge>
                        <Badge variant="outline">logs (12,890 registros)</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Verificación de Integridad</Label>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Verificación exitosa - MD5: a1b2c3d4e5f6...</span>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Espacio Usado</p>
                          <p className="text-lg font-bold">2.1 GB</p>
                          <p className="text-xs text-muted-foreground">de 10 GB</p>
                        </div>
                        <HardDrive className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Análisis de Almacenamiento</DialogTitle>
                    <DialogDescription>Desglose detallado del uso de espacio</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Respaldos Automáticos</span>
                        <span>1.4 GB (67%)</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Respaldos Manuales</span>
                        <span>0.7 GB (33%)</span>
                      </div>
                      <Progress value={33} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Espacio Disponible</p>
                        <p className="text-lg font-bold text-green-600">7.9 GB</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Proyección (30 días)</p>
                        <p className="text-lg font-bold text-orange-600">4.2 GB</p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Respaldos Totales</p>
                          <p className="text-lg font-bold">{backups.length}</p>
                          <p className="text-xs text-muted-foreground">Últimos 30 días</p>
                        </div>
                        <Database className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Estadísticas de Respaldos</DialogTitle>
                    <DialogDescription>Análisis completo de actividad de respaldos</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">4</p>
                        <p className="text-sm text-muted-foreground">Exitosos</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">1</p>
                        <p className="text-sm text-muted-foreground">Fallidos</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">2.1 GB</p>
                        <p className="text-sm text-muted-foreground">Total</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Tendencia de Crecimiento</Label>
                      <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Gráfico de tendencia aquí</p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Estado Sistema</p>
                          <p className="text-lg font-bold text-green-600">Operativo</p>
                          <p className="text-xs text-green-600">Todos los servicios OK</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Estado del Sistema</DialogTitle>
                    <DialogDescription>Monitoreo en tiempo real de servicios</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {[
                      { service: "Base de Datos", status: "Operativo", uptime: "99.9%", response: "12ms" },
                      { service: "Servicio de Respaldo", status: "Operativo", uptime: "99.8%", response: "45ms" },
                      { service: "Almacenamiento", status: "Operativo", uptime: "100%", response: "8ms" },
                      { service: "Servicio de IA", status: "Operativo", uptime: "99.7%", response: "156ms" },
                    ].map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{service.service}</span>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-green-600">{service.status}</p>
                          <p className="text-muted-foreground">Uptime: {service.uptime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Backup Actions */}
            <Card className="bg-gradient-to-r from-white to-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Acciones de Respaldo
                </CardTitle>
                <CardDescription>Crear respaldos manuales y gestionar la configuración automática</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    onClick={handleCreateBackup}
                    disabled={isCreatingBackup}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    {isCreatingBackup ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Database className="h-4 w-4" />
                    )}
                    {isCreatingBackup ? "Creando Respaldo..." : "Crear Respaldo Manual"}
                  </Button>
                  <Button
                    onClick={handleRestoreFromFile}
                    variant="outline"
                    className="hover:bg-blue-50 bg-transparent"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Restaurar desde Archivo
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="hover:bg-purple-50 bg-transparent">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Configurar Automático
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Configuración de Respaldos Automáticos</DialogTitle>
                        <DialogDescription>
                          Personaliza la programación y opciones de respaldos automáticos
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Respaldos Automáticos</Label>
                            <p className="text-sm text-muted-foreground">Habilitar respaldos programados</p>
                          </div>
                          <Switch
                            checked={autoBackupConfig.enabled}
                            onCheckedChange={(checked) =>
                              setAutoBackupConfig((prev) => ({ ...prev, enabled: checked }))
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Frecuencia</Label>
                            <select
                              className="w-full p-2 border rounded-md"
                              value={autoBackupConfig.frequency}
                              onChange={(e) => setAutoBackupConfig(prev => ({ ...prev, frequency: e.target.value }))}
                            >
                              <option value="hourly">Cada hora</option>
                              <option value="daily">Diario</option>
                              <option value="weekly">Semanal</option>
                              <option value="monthly">Mensual</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Hora de Ejecución</Label>
                            <Input
                              type="time"
                              value={autoBackupConfig.time}
                              onChange={(e) => setAutoBackupConfig(prev => ({ ...prev, time: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Retención (días)</Label>
                          <Input
                            type="number"
                            value={autoBackupConfig.retention}
                            min="1"
                            max="365"
                            onChange={(e) => setAutoBackupConfig(prev => ({ ...prev, retention: parseInt(e.target.value) }))}
                          />
                          <p className="text-xs text-muted-foreground">
                            Los respaldos se eliminarán automáticamente después de este período
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Compresión</Label>
                              <p className="text-sm text-muted-foreground">Reduce el tamaño del archivo</p>
                            </div>
                            <Switch
                              checked={autoBackupConfig.compression}
                              onCheckedChange={(checked) => setAutoBackupConfig(prev => ({ ...prev, compression: checked }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Encriptación</Label>
                              <p className="text-sm text-muted-foreground">Protege los respaldos con contraseña</p>
                            </div>
                            <Switch
                              checked={autoBackupConfig.encryption}
                              onCheckedChange={(checked) => setAutoBackupConfig(prev => ({ ...prev, encryption: checked }))}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline">Cancelar</Button>
                          <Button
                            onClick={handleSaveBackupConfig}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600"
                          >
                            Guardar Configuración
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Backups Table */}
            <Card className="bg-gradient-to-r from-white to-emerald-50 border-emerald-200">
              <CardHeader>
                <CardTitle>Historial de Respaldos</CardTitle>
                <CardDescription>Lista de respaldos disponibles para descarga o restauración</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Archivo</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Tamaño</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Creación</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backups.map((backup) => (
                        <Dialog key={backup.id}>
                          <DialogTrigger asChild>
                            <TableRow className="cursor-pointer hover:bg-emerald-50 transition-colors">
                              <TableCell>
                                <div>
                                  <p className="font-medium">{backup.name}</p>
                                  <p className="text-sm text-muted-foreground">{backup.description}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={backup.type === "Manual" ? "default" : "secondary"}>
                                  {backup.type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm font-medium">{backup.size}</span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(backup.status)}
                                  <Badge className={getStatusColor(backup.status)}>{backup.status}</Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">{backup.createdAt}</span>
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownloadBackup(backup.id)}
                                    disabled={backup.status !== "Completado"}
                                    className="hover:bg-blue-50"
                                  >
                                    <Download className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="hover:bg-green-50 bg-transparent">
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Restaurar
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Detalles del Respaldo</DialogTitle>
                              <DialogDescription>Información completa del archivo de respaldo</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <Label>Información General</Label>
                                    <div className="mt-2 space-y-2 text-sm">
                                      <p>
                                        <strong>Archivo:</strong> {backup.name}
                                      </p>
                                      <p>
                                        <strong>Tamaño:</strong> {backup.size}
                                      </p>
                                      <p>
                                        <strong>Tipo:</strong> {backup.type}
                                      </p>
                                      <p>
                                        <strong>Estado:</strong> {backup.status}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Metadatos</Label>
                                    <div className="mt-2 space-y-2 text-sm">
                                      <p>
                                        <strong>Creado:</strong> {backup.createdAt}
                                      </p>
                                      <p>
                                        <strong>Duración:</strong> 2m 15s
                                      </p>
                                      <p>
                                        <strong>Compresión:</strong> Habilitada
                                      </p>
                                      <p>
                                        <strong>Checksum:</strong> a1b2c3d4...
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Contenido del Respaldo</Label>
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                      <Badge variant="outline">usuarios (1,247)</Badge>
                                      <Badge variant="outline">casos (3,891)</Badge>
                                      <Badge variant="outline">evaluaciones (5,623)</Badge>
                                      <Badge variant="outline">documentos (2,156)</Badge>
                                      <Badge variant="outline">configuracion (45)</Badge>
                                      <Badge variant="outline">logs (12,890)</Badge>
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Acciones Disponibles</Label>
                                    <div className="mt-2 flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleDownloadBackup(backup.id)}
                                        className="bg-blue-600 hover:bg-blue-700"
                                      >
                                        <Download className="h-3 w-3 mr-1" />
                                        Descargar
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleRestoreBackup(backup.id)}
                                        variant="outline"
                                        className="hover:bg-green-50 bg-transparent"
                                      >
                                        <RefreshCw className="h-3 w-3 mr-1" />
                                        Restaurar
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Label>Descripción</Label>
                                <p className="mt-2 text-sm text-muted-foreground">{backup.description}</p>
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

            {/* System Logs */}
            <Card className="bg-gradient-to-r from-white to-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle>Logs del Sistema</CardTitle>
                <CardDescription>Registro de eventos y actividades del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Nivel</TableHead>
                        <TableHead>Componente</TableHead>
                        <TableHead>Mensaje</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {systemLogs.map((log) => (
                        <Dialog key={log.id}>
                          <DialogTrigger asChild>
                            <TableRow className="cursor-pointer hover:bg-purple-50 transition-colors">
                              <TableCell>
                                <span className="text-sm font-mono">{log.timestamp}</span>
                              </TableCell>
                              <TableCell>
                                <Badge className={getLogLevelColor(log.level)}>{log.level}</Badge>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">{log.component}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">{log.message}</span>
                              </TableCell>
                            </TableRow>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Detalles del Log</DialogTitle>
                              <DialogDescription>Información completa del evento del sistema</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Timestamp</Label>
                                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">{log.timestamp}</p>
                                </div>
                                <div>
                                  <Label>Nivel</Label>
                                  <Badge className={getLogLevelColor(log.level)}>{log.level}</Badge>
                                </div>
                                <div>
                                  <Label>Componente</Label>
                                  <p className="text-sm">{log.component}</p>
                                </div>
                                <div>
                                  <Label>ID de Sesión</Label>
                                  <p className="text-sm font-mono">sess_abc123def456</p>
                                </div>
                              </div>
                              <div>
                                <Label>Mensaje Completo</Label>
                                <p className="mt-2 text-sm text-muted-foreground">{log.message}</p>
                              </div>
                              <div>
                                <Label>Stack Trace (si aplica)</Label>
                                <Textarea
                                  value={
                                    log.level === "ERROR"
                                      ? "Error en línea 45 de BackupService.js\n  at createBackup()\n  at scheduleBackup()"
                                      : "No disponible"
                                  }
                                  readOnly
                                  className="mt-2 font-mono text-xs"
                                />
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
          </div>
        </main>
      </div>
    </div>
  )
}
