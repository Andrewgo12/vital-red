"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, User } from "lucide-react"

interface CasePriorityModalProps {
  isOpen: boolean
  onClose: () => void
  case: {
    id: string
    patient: string
    diagnosis: string
    currentPriority: string
  }
}

export function CasePriorityModal({ isOpen, onClose, case: caseData }: CasePriorityModalProps) {
  const [newPriority, setNewPriority] = useState(caseData.currentPriority)
  const [reason, setReason] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Updating priority:", { caseId: caseData.id, newPriority, reason })
    onClose()
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

  const getPriorityDescription = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "Requiere atención inmediata - Riesgo vital"
      case "Media":
        return "Atención en las próximas 2-4 horas"
      case "Baja":
        return "Puede esperar evaluación programada"
      default:
        return ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Ajustar Prioridad del Caso
          </DialogTitle>
          <DialogDescription>Modifique la prioridad de evaluación según criterio médico</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Case Info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{caseData.patient}</span>
            </div>
            <p className="text-sm text-muted-foreground">{caseData.diagnosis}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm">Prioridad actual:</span>
              <Badge className={getPriorityColor(caseData.currentPriority)}>{caseData.currentPriority}</Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nueva Prioridad</Label>
              <Select value={newPriority} onValueChange={setNewPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alta">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      Alta - Urgente
                    </div>
                  </SelectItem>
                  <SelectItem value="Media">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      Media - Moderada
                    </div>
                  </SelectItem>
                  <SelectItem value="Baja">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Baja - Programada
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{getPriorityDescription(newPriority)}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Justificación del Cambio</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explique el motivo del cambio de prioridad..."
                rows={3}
                required
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-800">El cambio de prioridad será registrado en el historial del caso</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Actualizar Prioridad
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
