"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Download, CalendarIcon, FileText, BarChart3 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface SupervisionExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SupervisionExportModal({ isOpen, onClose }: SupervisionExportModalProps) {
  const [exportType, setExportType] = useState("pdf")
  const [dateRange, setDateRange] = useState("week")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([])
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeDetails, setIncludeDetails] = useState(true)

  const doctors = [
    { id: "1", name: "Dr. Carlos Rodríguez", specialty: "Cardiología" },
    { id: "2", name: "Dra. María González", specialty: "Neurología" },
    { id: "3", name: "Dr. Luis Martínez", specialty: "Ginecología" },
  ]

  const handleDoctorToggle = (doctorId: string) => {
    setSelectedDoctors((prev) => (prev.includes(doctorId) ? prev.filter((id) => id !== doctorId) : [...prev, doctorId]))
  }

  const handleExport = () => {
    const exportConfig = {
      type: exportType,
      dateRange: dateRange === "custom" ? { start: startDate, end: endDate } : dateRange,
      doctors: selectedDoctors,
      includeCharts,
      includeDetails,
    }
    console.log("Exporting supervision report:", exportConfig)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Reporte de Supervisión
          </DialogTitle>
          <DialogDescription>Configure los parámetros para generar el reporte</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Formato</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Excel
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mes</SelectItem>
                  <SelectItem value="quarter">Trimestre</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {dateRange === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha Inicio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: es }) : "Seleccionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Fecha Fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP", { locale: es }) : "Seleccionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Médicos a Incluir</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-2">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={doctor.id}
                    checked={selectedDoctors.includes(doctor.id)}
                    onCheckedChange={() => handleDoctorToggle(doctor.id)}
                  />
                  <Label htmlFor={doctor.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{doctor.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {doctor.specialty}
                      </Badge>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDoctors(doctors.map((d) => d.id))}
              className="w-full"
            >
              Seleccionar Todos
            </Button>
          </div>

          <div className="space-y-3">
            <Label>Opciones de Contenido</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="charts" checked={includeCharts} onCheckedChange={setIncludeCharts} />
                <Label htmlFor="charts" className="text-sm">
                  Incluir gráficos y estadísticas visuales
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="details" checked={includeDetails} onCheckedChange={setIncludeDetails} />
                <Label htmlFor="details" className="text-sm">
                  Incluir detalles de casos individuales
                </Label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button onClick={handleExport} disabled={selectedDoctors.length === 0} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Generar Reporte
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
