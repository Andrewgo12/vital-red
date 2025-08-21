"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, FileText, Image, ZoomIn, ZoomOut, RotateCw } from "lucide-react"

interface DocumentViewerModalProps {
  isOpen: boolean
  onClose: () => void
  document: {
    name: string
    type: string
    size: string
    url?: string
  } | null
}

export function DocumentViewerModal({ isOpen, onClose, document }: DocumentViewerModalProps) {
  const { toast } = useToast()
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50))
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)
  const handleDownload = () => {
    if (!document) return

    // Simulate document download
    toast({
      title: "Descarga iniciada",
      description: `Descargando ${document.name}...`,
    })

    // In a real app, this would trigger actual file download
    setTimeout(() => {
      toast({
        title: "Descarga completada",
        description: `${document.name} descargado exitosamente`,
      })
    }, 2000)
  }

  if (!document) return null

  const isImage = document.type === "Imagen"
  const isPDF = document.type === "PDF"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                {isImage ? <Image className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                {document.name}
              </DialogTitle>
              <DialogDescription>
                <Badge variant="outline" className="mr-2">
                  {document.type}
                </Badge>
                {document.size}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {isImage && (
                <>
                  <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">{zoom}%</span>
                  <Button variant="outline" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRotate}>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Descargar
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-muted/20 rounded-lg p-4">
          {isPDF ? (
            <div className="flex items-center justify-center h-96 bg-white rounded border-2 border-dashed border-muted-foreground/25">
              <div className="text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Documento PDF</h3>
                <p className="text-muted-foreground mb-4">Vista previa de PDF no disponible en esta demo</p>
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar para Ver
                </Button>
              </div>
            </div>
          ) : isImage ? (
            <div className="flex items-center justify-center">
              <div
                className="transition-transform duration-200"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                }}
              >
                <img
                  src={`/placeholder-dp1m2.png?height=400&width=600&query=medical document ${document.name}`}
                  alt={document.name}
                  className="max-w-full h-auto rounded border"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Documento</h3>
                <p className="text-muted-foreground mb-4">Vista previa no disponible para este tipo de archivo</p>
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
