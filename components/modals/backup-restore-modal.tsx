"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Database, Calendar, FileText } from "lucide-react"

interface BackupRestoreModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BackupRestoreModal({ isOpen, onClose }: BackupRestoreModalProps) {
  const [selectedBackup, setSelectedBackup] = useState("")
  const [confirmRestore, setConfirmRestore] = useState(false)

  const backups = [
    {
      id: "backup_2024_01_15_14_30",
      date: "2024-01-15 14:30:00",
      size: "2.3 GB",
      type: "Completo",
      status: "Exitoso",
      description: "Respaldo automático diario",
    },
    {
      id: "backup_2024_01_14_14_30",
      date: "2024-01-14 14:30:00",
      size: "2.1 GB",
      type: "Completo",
      status: "Exitoso",
      description: "Respaldo automático diario",
    },
    {
      id: "backup_2024_01_13_09_15",
      date: "2024-01-13 09:15:00",
      size: "1.8 GB",
      type: "Manual",
      status: "Exitoso",
      description: "Respaldo antes de actualización",
    },
  ]

  const handleRestore = () => {
    if (!selectedBackup) return
    console.log("Restoring backup:", selectedBackup)
    onClose()
  }

  const selectedBackupData = backups.find((b) => b.id === selectedBackup)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Restaurar Respaldo del Sistema
          </DialogTitle>
          <DialogDescription>Seleccione un punto de restauración para recuperar el sistema</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Seleccionar Respaldo</Label>
            <Select value={selectedBackup} onValueChange={setSelectedBackup}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un respaldo..." />
              </SelectTrigger>
              <SelectContent>
                {backups.map((backup) => (
                  <SelectItem key={backup.id} value={backup.id}>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <p className="font-medium">{backup.date}</p>
                        <p className="text-sm text-muted-foreground">
                          {backup.type} • {backup.size}
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBackupData && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Detalles del Respaldo
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Fecha:</span>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {selectedBackupData.date}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tamaño:</span>
                  <p className="font-medium">{selectedBackupData.size}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo:</span>
                  <Badge variant="outline">{selectedBackupData.type}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Estado:</span>
                  <Badge className="bg-green-100 text-green-800">{selectedBackupData.status}</Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Descripción:</span>
                <p className="text-sm">{selectedBackupData.description}</p>
              </div>
            </div>
          )}

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-red-800">Advertencia Importante</h4>
                <div className="text-sm text-red-700 space-y-1">
                  <p>• Todos los datos actuales serán reemplazados</p>
                  <p>• Los cambios realizados después de la fecha del respaldo se perderán</p>
                  <p>• El proceso puede tomar varios minutos</p>
                  <p>• Se recomienda notificar a todos los usuarios</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="confirm"
              checked={confirmRestore}
              onChange={(e) => setConfirmRestore(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="confirm" className="text-sm">
              Confirmo que entiendo las consecuencias de esta acción
            </Label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button
              onClick={handleRestore}
              disabled={!selectedBackup || !confirmRestore}
              className="flex-1"
              variant="destructive"
            >
              Restaurar Sistema
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
