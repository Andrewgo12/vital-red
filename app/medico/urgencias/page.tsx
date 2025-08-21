"use client";

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Heart, 
  Activity, 
  User, 
  Stethoscope,
  Filter,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  Phone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Datos simulados de pacientes en urgencias
const urgencyPatients = [
  {
    id: '1',
    nombre: 'María González Pérez',
    edad: 45,
    cedula: '12345678',
    motivo: 'Dolor torácico severo, disnea',
    prioridad: 'ROJO',
    tiempoEspera: '5 min',
    signos: { fc: 120, pa: '160/95', temp: 37.2, spo2: 94 },
    medico: 'Dr. Ramírez',
    cama: 'A-12',
    eps: 'SURA',
    telefono: '+57 300 123 4567',
    acompañante: 'Esposo',
    timestamp: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    id: '2',
    nombre: 'Carlos Mendoza Silva',
    edad: 32,
    cedula: '87654321',
    motivo: 'Fractura abierta brazo derecho',
    prioridad: 'AMARILLO',
    tiempoEspera: '25 min',
    signos: { fc: 85, pa: '130/80', temp: 36.8, spo2: 98 },
    medico: 'Dra. López',
    cama: 'B-05',
    eps: 'NUEVA EPS',
    telefono: '+57 301 987 6543',
    acompañante: 'Madre',
    timestamp: new Date(Date.now() - 25 * 60 * 1000)
  },
  {
    id: '3',
    nombre: 'Ana Rodríguez Castro',
    edad: 28,
    cedula: '45678912',
    motivo: 'Dolor abdominal, náuseas, vómito',
    prioridad: 'VERDE',
    tiempoEspera: '1h 15min',
    signos: { fc: 78, pa: '120/75', temp: 36.5, spo2: 99 },
    medico: null,
    cama: null,
    eps: 'COMPENSAR',
    telefono: '+57 302 456 7890',
    acompañante: 'Sin acompa��ante',
    timestamp: new Date(Date.now() - 75 * 60 * 1000)
  },
  {
    id: '4',
    nombre: 'Roberto Silva Vargas',
    edad: 55,
    cedula: '11223344',
    motivo: 'Trauma craneoencefálico moderado',
    prioridad: 'ROJO',
    tiempoEspera: '2 min',
    signos: { fc: 110, pa: '180/100', temp: 36.9, spo2: 96 },
    medico: 'Dr. Martínez',
    cama: 'A-08',
    eps: 'SANITAS',
    telefono: '+57 304 567 8901',
    acompañante: 'Hija',
    timestamp: new Date(Date.now() - 2 * 60 * 1000)
  },
  {
    id: '5',
    nombre: 'Lucía Herrera Gómez',
    edad: 65,
    cedula: '33445566',
    motivo: 'Dificultad respiratoria, tos productiva',
    prioridad: 'AMARILLO',
    tiempoEspera: '40 min',
    signos: { fc: 95, pa: '150/85', temp: 38.1, spo2: 92 },
    medico: 'Dr. Torres',
    cama: 'C-03',
    eps: 'COOMEVA',
    telefono: '+57 305 678 9012',
    acompañante: 'Hijo',
    timestamp: new Date(Date.now() - 40 * 60 * 1000)
  }
];

export default function UrgenciasPage() {
  const [patients, setPatients] = useState(urgencyPatients);
  const [filteredPatients, setFilteredPatients] = useState(urgencyPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('TODOS');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showPatientDetail, setShowPatientDetail] = useState(false);

  // Estadísticas calculadas
  const stats = {
    total: patients.length,
    rojo: patients.filter(p => p.prioridad === 'ROJO').length,
    amarillo: patients.filter(p => p.prioridad === 'AMARILLO').length,
    verde: patients.filter(p => p.prioridad === 'VERDE').length,
    sinAtencion: patients.filter(p => !p.medico).length,
    sinCama: patients.filter(p => !p.cama).length
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = patients.filter(patient => {
      const matchesSearch = 
        patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.cedula.includes(searchTerm) ||
        patient.motivo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority = priorityFilter === 'TODOS' || patient.prioridad === priorityFilter;
      
      return matchesSearch && matchesPriority;
    });

    // Ordenar por prioridad y tiempo
    filtered.sort((a, b) => {
      const prioridadOrder = { 'ROJO': 3, 'AMARILLO': 2, 'VERDE': 1 };
      const prioridadDiff = prioridadOrder[b.prioridad as keyof typeof prioridadOrder] - prioridadOrder[a.prioridad as keyof typeof prioridadOrder];
      if (prioridadDiff !== 0) return prioridadDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    setFilteredPatients(filtered);
  }, [searchTerm, priorityFilter, patients]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'ROJO': return 'bg-red-500 text-white border-red-600';
      case 'AMARILLO': return 'bg-yellow-500 text-black border-yellow-600';
      case 'VERDE': return 'bg-green-500 text-white border-green-600';
      default: return 'bg-gray-500 text-white border-gray-600';
    }
  };

  const getCardBorderColor = (priority: string) => {
    switch (priority) {
      case 'ROJO': return 'border-l-red-500 bg-red-50';
      case 'AMARILLO': return 'border-l-yellow-500 bg-yellow-50';
      case 'VERDE': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleAtenderPaciente = (paciente: any) => {
    toast.success(`Iniciando atención a ${paciente.nombre}`);
    setShowPatientDetail(false);
  };

  const handleAsignarCama = (paciente: any) => {
    const camas = ['A-15', 'B-12', 'C-08', 'A-20', 'B-18'];
    const camaDisponible = camas[Math.floor(Math.random() * camas.length)];
    
    setPatients(prev => prev.map(p => 
      p.id === paciente.id ? { ...p, cama: camaDisponible } : p
    ));
    
    toast.success(`Cama ${camaDisponible} asignada a ${paciente.nombre}`);
  };

  const handleLlamarAcompañante = (paciente: any) => {
    toast.info(`Llamando a ${paciente.acompañante}: ${paciente.telefono}`);
  };

  const handleMarcarAtendido = (paciente: any) => {
    setPatients(prev => prev.filter(p => p.id !== paciente.id));
    toast.success(`${paciente.nombre} marcado como atendido`);
    setShowPatientDetail(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Urgencias - Gestión de Pacientes" />
      
      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Pacientes</div>
            </CardContent>
          </Card>
          
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rojo}</div>
              <div className="text-sm text-red-700">Prioridad Roja</div>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.amarillo}</div>
              <div className="text-sm text-yellow-700">Prioridad Amarilla</div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.verde}</div>
              <div className="text-sm text-green-700">Prioridad Verde</div>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.sinAtencion}</div>
              <div className="text-sm text-orange-700">Sin Médico</div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.sinCama}</div>
              <div className="text-sm text-purple-700">Sin Cama</div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas críticas */}
        {stats.rojo > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="font-medium">
                ¡Atención! Tienes {stats.rojo} paciente{stats.rojo !== 1 ? 's' : ''} en prioridad ROJA que requiere{stats.rojo === 1 ? '' : 'n'} atención inmediata.
              </span>
            </div>
          </div>
        )}

        {/* Controles de filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre, cédula o motivo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todas las prioridades</SelectItem>
                  <SelectItem value="ROJO">Prioridad Roja</SelectItem>
                  <SelectItem value="AMARILLO">Prioridad Amarilla</SelectItem>
                  <SelectItem value="VERDE">Prioridad Verde</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de pacientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Pacientes en Urgencias ({filteredPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pacientes</h3>
                <p className="text-gray-600">
                  {searchTerm || priorityFilter !== 'TODOS' 
                    ? 'No se encontraron pacientes con los filtros aplicados.'
                    : 'No hay pacientes en urgencias en este momento.'
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredPatients.map((patient) => (
                  <Card 
                    key={patient.id} 
                    className={cn(
                      'border-l-4 cursor-pointer hover:shadow-md transition-shadow',
                      getCardBorderColor(patient.prioridad)
                    )}
                    onClick={() => {
                      setSelectedPatient(patient);
                      setShowPatientDetail(true);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={cn('text-xs font-medium', getPriorityColor(patient.prioridad))}>
                              {patient.prioridad}
                            </Badge>
                            <h3 className="font-semibold text-lg">{patient.nombre}</h3>
                            <span className="text-sm text-gray-500">{patient.edad} años</span>
                          </div>
                          
                          <p className="text-gray-700 mb-2">{patient.motivo}</p>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span>CC: {patient.cedula}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>Espera: {patient.tiempoEspera}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Heart className="h-4 w-4 text-red-500" />
                              <span>FC: {patient.signos.fc} lpm</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-blue-500" />
                              <span>PA: {patient.signos.pa}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className={cn(
                              'px-2 py-1 rounded text-xs',
                              patient.medico 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-orange-100 text-orange-800'
                            )}>
                              {patient.medico ? `Médico: ${patient.medico}` : 'Sin médico asignado'}
                            </span>
                            
                            <span className={cn(
                              'px-2 py-1 rounded text-xs',
                              patient.cama 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-red-100 text-red-800'
                            )}>
                              {patient.cama ? `Cama: ${patient.cama}` : 'Sin cama asignada'}
                            </span>
                            
                            <span className="text-gray-600">EPS: {patient.eps}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAtenderPaciente(patient);
                            }}
                            className={cn(
                              patient.prioridad === 'ROJO' 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            )}
                          >
                            <Stethoscope className="h-4 w-4 mr-1" />
                            Atender
                          </Button>
                          
                          {!patient.cama && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAsignarCama(patient);
                              }}
                            >
                              Asignar Cama
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de detalle del paciente */}
        {showPatientDetail && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Detalle del Paciente
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowPatientDetail(false)}
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Información Personal</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Nombre:</strong> {selectedPatient.nombre}</p>
                      <p><strong>Edad:</strong> {selectedPatient.edad} años</p>
                      <p><strong>Cédula:</strong> {selectedPatient.cedula}</p>
                      <p><strong>EPS:</strong> {selectedPatient.eps}</p>
                      <p><strong>Teléfono:</strong> {selectedPatient.telefono}</p>
                      <p><strong>Acompañante:</strong> {selectedPatient.acompañante}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Signos Vitales</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-red-50 rounded">
                        <Heart className="h-4 w-4 text-red-500 mb-1" />
                        <div>FC: {selectedPatient.signos.fc} lpm</div>
                      </div>
                      <div className="p-2 bg-blue-50 rounded">
                        <Activity className="h-4 w-4 text-blue-500 mb-1" />
                        <div>PA: {selectedPatient.signos.pa}</div>
                      </div>
                      <div className="p-2 bg-orange-50 rounded">
                        <div>T°: {selectedPatient.signos.temp}°C</div>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <div>SpO2: {selectedPatient.signos.spo2}%</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Motivo de Consulta</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedPatient.motivo}</p>
                </div>
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={() => handleAtenderPaciente(selectedPatient)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Iniciar Atención
                  </Button>
                  
                  <Button 
                    onClick={() => handleLlamarAcompañante(selectedPatient)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Llamar
                  </Button>
                  
                  <Button 
                    onClick={() => handleMarcarAtendido(selectedPatient)}
                    variant="outline"
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar Atendido
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
