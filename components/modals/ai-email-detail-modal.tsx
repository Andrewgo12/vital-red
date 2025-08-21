"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, User, FileText, Brain, Clock, CheckCircle, RefreshCw } from "lucide-react"

interface AIEmailDetailModalProps {
  isOpen: boolean
  onClose: () => void
  email: {
    id: string
    subject: string
    sender: string
    receivedAt: string
    status: string
    confidence: number
    extractedData: {
      patientName?: string
      age?: string
      diagnosis?: string
      priority?: string
      institution?: string
      doctor?: string
    }
    rawContent: string
    processingLog: Array<{
      timestamp: string
      action: string
      result: string
    }>
  }
}

export function AIEmailDetailModal({ isOpen, onClose, email }: AIEmailDetailModalProps) {
  const handleRetryProcessing = () => {
    console.log("Retrying AI processing for email:", email.id)
  }

  const handleCreateCase = () => {
    console.log("Creating case from email:", email.id)
    onClose()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Procesado":
        return "bg-green-100 text-green-800"
      case "Error":
        return "bg-red-100 text-red-800"
      case "Procesando":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Detalle de Procesamiento de Email
          </DialogTitle>
          <DialogDescription>Información completa del análisis de IA y datos extraídos</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Header */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-1">
                <h3 className="font-medium">{email.subject}</h3>
                <p className="text-sm text-muted-foreground">De: {email.sender}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {email.receivedAt}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(email.status)}>{email.status}</Badge>
                <Badge variant="outline" className={getConfidenceColor(email.confidence)}>
                  <Brain className="h-3 w-3 mr-1" />
                  {Math.round(email.confidence * 100)}% confianza
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Extracted Data */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Datos Extraídos por IA
              </h4>

              <div className="space-y-3">
                {email.extractedData.patientName && (
                  <div className="flex items-center justify-between p-3 bg-background border rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Paciente</span>
                    </div>
                    <span className="font-medium">{email.extractedData.patientName}</span>
                  </div>
                )}

                {email.extractedData.age && (
                  <div className="flex items-center justify-between p-3 bg-background border rounded-lg">
                    <span className="text-sm">Edad</span>
                    <span className="font-medium">{email.extractedData.age} años</span>
                  </div>
                )}

                {email.extractedData.diagnosis && (
                  <div className="p-3 bg-background border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Diagnóstico</span>
                    </div>
                    <p className="text-sm">{email.extractedData.diagnosis}</p>
                  </div>
                )}

                {email.extractedData.priority && (
                  <div className="flex items-center justify-between p-3 bg-background border rounded-lg">
                    <span className="text-sm">Prioridad Sugerida</span>
                    <Badge
                      className={
                        email.extractedData.priority === "Alta"
                          ? "bg-red-100 text-red-800"
                          : email.extractedData.priority === "Media"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }
                    >
                      {email.extractedData.priority}
                    </Badge>
                  </div>
                )}

                {email.extractedData.institution && (
                  <div className="flex items-center justify-between p-3 bg-background border rounded-lg">
                    <span className="text-sm">Institución</span>
                    <span className="font-medium">{email.extractedData.institution}</span>
                  </div>
                )}

                {email.extractedData.doctor && (
                  <div className="flex items-center justify-between p-3 bg-background border rounded-lg">
                    <span className="text-sm">Médico Remitente</span>
                    <span className="font-medium">{email.extractedData.doctor}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Processing Log */}
            <div className="space-y-4">
              <h4 className="font-medium">Log de Procesamiento</h4>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {email.processingLog.map((log, index) => (
                  <div key={index} className="p-3 bg-background border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{log.action}</span>
                      <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{log.result}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Raw Email Content */}
          <div className="space-y-2">
            <h4 className="font-medium">Contenido Original del Email</h4>
            <div className="p-4 bg-muted/30 rounded-lg max-h-48 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">{email.rawContent}</pre>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {email.status === "Error" && (
                <Button variant="outline" onClick={handleRetryProcessing}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar Procesamiento
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
              {email.status === "Procesado" && email.confidence >= 0.7 && (
                <Button onClick={handleCreateCase}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Crear Caso Médico
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
