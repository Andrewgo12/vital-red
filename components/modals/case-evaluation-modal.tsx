"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle, AlertTriangle, User, FileText, MapPin } from "lucide-react"

interface CaseEvaluationModalProps {
  isOpen: boolean
  onClose: () => void
  caseData: any
  onDecision: (decision: string, priority: string, observations: string) => void
}

export function CaseEvaluationModal({ isOpen, onClose, caseData, onDecision }: CaseEvaluationModalProps) {
  const { toast } = useToast()
  const [priority, setPriority] = useState(caseData?.priority || "Media")
  const [observations, setObservations] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState({
    observations: false,
    priority: false,
  })

  const validateForm = () => {
    const errors = {
      observations: observations.trim().length < 10,
      priority: !priority || priority === "",
    }

    setValidationErrors(errors)
    return !errors.observations && !errors.priority
  }

  const handleDecision = async (decision: string) => {
    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor complete todos los campos requeridos correctamente",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onDecision(decision, priority, observations)
      onClose()
    } catch (error) {
      console.error("Error submitting decision:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la evaluación",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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

  if (!caseData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Evaluación de Caso - {caseData.id}
          </DialogTitle>
          <DialogDescription>Evalúe la solicitud de referencia y tome una decisión médica</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <User className="h-4 w-4" />
                Información del Paciente
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Nombre:</span> {caseData.patient}
                </div>
                <div>
                  <span className="font-medium">Edad:</span> {caseData.age} años
                </div>
                <div>
                  <span className="font-medium">Diagnóstico:</span> {caseData.diagnosis}
                </div>
                <div>
                  <span className="font-medium">Especialidad:</span> {caseData.specialty}
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4" />
                Institución Remitente
              </h3>
              <div className="text-sm space-y-2">
                <p>
                  <span className="font-medium">Hospital:</span> {caseData.origin}
                </p>
                <p>
                  <span className="font-medium">Recibido:</span> {caseData.receivedAt}
                </p>
                <p>
                  <span className="font-medium">Tiempo transcurrido:</span>{" "}
                  <span className="font-medium text-orange-600">{caseData.timeElapsed}</span>
                </p>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Resumen Clínico</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {caseData.clinicalSummary ||
                  `Paciente de ${caseData.age} años con diagnóstico de ${caseData.diagnosis}. 
                  Se solicita evaluación para posible traslado a institución de mayor complejidad. 
                  Caso requiere atención especializada en ${caseData.specialty}.`}
              </p>
            </div>
          </div>

          {/* Decision Panel */}
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Estado Actual</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Prioridad:</span>
                  <Badge className={getPriorityColor(caseData.priority)}>{caseData.priority}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Estado:</span>
                  <Badge className="bg-orange-100 text-orange-800">{caseData.status}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Ajustar Prioridad</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className={validationErrors.priority ? 'border-red-500' : ''}>
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
                <Label>Observaciones Médicas</Label>
                <Textarea
                  placeholder="Agregue sus observaciones y justificación de la decisión (mínimo 10 caracteres)..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={4}
                  className={validationErrors.observations ? 'border-red-500' : ''}
                />
                {validationErrors.observations && (
                  <p className="text-sm text-red-600">Las observaciones deben tener al menos 10 caracteres</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button className="flex-1 sm:flex-none" onClick={() => handleDecision("Aceptar")} disabled={isSubmitting}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Aceptar Traslado
            </Button>
            <Button
              variant="destructive"
              className="flex-1 sm:flex-none"
              onClick={() => handleDecision("Rechazar")}
              disabled={isSubmitting}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar
            </Button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none bg-transparent"
              onClick={() => handleDecision("Solicitar Info")}
              disabled={isSubmitting}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Solicitar Info
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="bg-transparent">
              Cancelar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
