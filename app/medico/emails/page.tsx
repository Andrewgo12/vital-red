"use client";

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Brain, 
  Stethoscope, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Users,
  Activity,
  TrendingUp,
  Filter,
  Search,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Flag,
  Heart,
  Zap,
  Target,
  Hospital,
  UserCheck,
  FileText,
  Paperclip,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Header } from '@/components/layout/header';
import { EmailCard } from '@/components/email/email-card';
import { EmailDetailModal } from '@/components/email/email-detail-modal';
import { EmailData, useEmailManager } from '@/lib/email-manager';
import { getAIProcessor, AIAnalysisResult } from '@/lib/ai-email-processor';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MedicoEmailsPage() {
  const {
    emails,
    filteredEmails,
    selectedEmails,
    isLoading,
    error,
    stats,
    currentFilters,
    setFilters,
    clearFilters,
    selectEmail,
    clearSelection,
    processEmail,
    flagEmail,
    markAsReviewed,
    generateStats,
    loadSampleData
  } = useEmailManager();

  // Estados locales
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);
  const [showEmailDetail, setShowEmailDetail] = useState(false);
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysisResult | undefined>();
  const [activeView, setActiveView] = useState<'dashboard' | 'urgentes' | 'pendientes' | 'todos'>('dashboard');
  
  // Filtros específicos para médicos
  const [quickFilter, setQuickFilter] = useState<'all' | 'urgent' | 'today' | 'flagged' | 'unread'>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Estadísticas específicas para médicos
  const [medicalStats, setMedicalStats] = useState({
    urgentCases: 0,
    pendingReview: 0,
    criticalFindings: 0,
    patientsToday: 0,
    averageResponseTime: 0,
    specialtyDistribution: {} as Record<string, number>
  });

  // Cargar datos al inicializar
  useEffect(() => {
    if (emails.length === 0) {
      loadSampleData();
    }
  }, [emails.length, loadSampleData]);

  // Calcular estadísticas médicas
  useEffect(() => {
    const urgent = emails.filter(e => e.urgencyLevel === 'Crítica' || e.priority === 'Alta').length;
    const pending = emails.filter(e => !e.reviewed && e.processingStatus === 'processed').length;
    const critical = emails.filter(e => e.aiExtractedData.urgentFindings && e.aiExtractedData.urgentFindings.length > 0).length;
    const today = emails.filter(e => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return e.receivedAt >= today;
    }).length;
    
    // Contar pacientes únicos
    const uniquePatients = new Set(
      emails
        .filter(e => e.aiExtractedData.patientName)
        .map(e => e.aiExtractedData.patientName)
    ).size;

    setMedicalStats({
      urgentCases: urgent,
      pendingReview: pending,
      criticalFindings: critical,
      patientsToday: uniquePatients,
      averageResponseTime: stats.processingTime.average,
      specialtyDistribution: stats.bySpecialty
    });
  }, [emails, stats]);

  // Aplicar filtros rápidos
  useEffect(() => {
    let filters: any = { search: searchTerm || undefined };

    if (specialtyFilter !== 'all') {
      filters.specialty = [specialtyFilter];
    }

    switch (quickFilter) {
      case 'urgent':
        filters.priority = ['Alta'];
        break;
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filters.dateFrom = today;
        break;
      case 'flagged':
        filters.flagged = true;
        break;
      case 'unread':
        filters.reviewed = false;
        break;
    }

    setFilters(filters);
  }, [quickFilter, specialtyFilter, searchTerm, setFilters]);

  // Filtrar emails según vista activa
  const getEmailsForView = (view: string) => {
    switch (view) {
      case 'urgentes':
        return filteredEmails.filter(e => 
          e.urgencyLevel === 'Crítica' || 
          e.priority === 'Alta' || 
          (e.aiExtractedData.urgentFindings && e.aiExtractedData.urgentFindings.length > 0)
        );
      case 'pendientes':
        return filteredEmails.filter(e => 
          !e.reviewed && e.processingStatus === 'processed'
        );
      case 'todos':
        return filteredEmails;
      default:
        return filteredEmails.slice(0, 10); // Dashboard muestra solo los primeros 10
    }
  };

  const emailsToShow = getEmailsForView(activeView);

  // Manejar clic en email
  const handleEmailClick = async (email: EmailData) => {
    setSelectedEmail(email);
    setShowEmailDetail(true);
    
    if (email.processingStatus === 'processed') {
      try {
        const aiProcessor = getAIProcessor();
        const analysis = await aiProcessor.processEmail(email);
        setAIAnalysis(analysis);
      } catch (error) {
        console.error('Error obteniendo análisis de IA:', error);
      }
    }
  };

  // Procesar email individual
  const handleProcessEmail = async (emailId: string) => {
    try {
      await processEmail(emailId);
      toast.success('Email procesado exitosamente');
    } catch (error) {
      toast.error('Error procesando email');
    }
  };

  // Obtener color de prioridad
  const getPriorityColor = (email: EmailData) => {
    if (email.urgencyLevel === 'Crítica') return 'border-red-500 bg-red-50';
    if (email.priority === 'Alta') return 'border-orange-500 bg-orange-50';
    if (email.aiExtractedData.urgentFindings && email.aiExtractedData.urgentFindings.length > 0) return 'border-yellow-500 bg-yellow-50';
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Correos Médicos - Sistema de Comunicación Hospitalaria" />
      
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Dashboard médico principal */}
        {activeView === 'dashboard' && (
          <>
            {/* Estadísticas médicas principales */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{medicalStats.urgentCases}</div>
                      <div className="text-sm text-red-700">Casos Urgentes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{medicalStats.pendingReview}</div>
                      <div className="text-sm text-orange-700">Pendiente Revisión</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Heart className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{medicalStats.criticalFindings}</div>
                      <div className="text-sm text-yellow-700">Hallazgos Críticos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{medicalStats.patientsToday}</div>
                      <div className="text-sm text-blue-700">Pacientes Únicos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Brain className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{stats.processed}</div>
                      <div className="text-sm text-green-700">Procesados IA</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Zap className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(medicalStats.averageResponseTime)}ms
                      </div>
                      <div className="text-sm text-purple-700">Tiempo Avg IA</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alertas médicas */}
            {medicalStats.urgentCases > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Tienes {medicalStats.urgentCases} casos urgentes que requieren atención inmediata.
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2"
                    onClick={() => setActiveView('urgentes')}
                  >
                    Ver casos urgentes
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {medicalStats.criticalFindings > 0 && (
              <Alert>
                <Heart className="h-4 w-4" />
                <AlertDescription>
                  Se detectaron {medicalStats.criticalFindings} emails con hallazgos críticos que necesitan evaluación médica.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* Controles de navegación y filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Navegación por vistas */}
              <div className="flex gap-2">
                <Button
                  variant={activeView === 'dashboard' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView('dashboard')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant={activeView === 'urgentes' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView('urgentes')}
                  className={medicalStats.urgentCases > 0 ? 'text-red-600 border-red-300' : ''}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Urgentes ({medicalStats.urgentCases})
                </Button>
                <Button
                  variant={activeView === 'pendientes' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView('pendientes')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Pendientes ({medicalStats.pendingReview})
                </Button>
                <Button
                  variant={activeView === 'todos' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView('todos')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Todos ({filteredEmails.length})
                </Button>
              </div>

              {activeView !== 'dashboard' && (
                <>
                  <div className="flex-1 flex gap-4">
                    {/* Búsqueda */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por paciente, diagnóstico, médico..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Filtro rápido */}
                    <Select value={quickFilter} onValueChange={(value) => setQuickFilter(value as any)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="urgent">Urgentes</SelectItem>
                        <SelectItem value="today">De Hoy</SelectItem>
                        <SelectItem value="flagged">Marcados</SelectItem>
                        <SelectItem value="unread">No Revisados</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Filtro por especialidad */}
                    <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Especialidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las especialidades</SelectItem>
                        {Object.keys(stats.bySpecialty).map(specialty => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty} ({stats.bySpecialty[specialty]})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => generateStats()}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contenido principal */}
        {activeView === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Casos urgentes recientes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Casos Urgentes Recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emails
                    .filter(e => e.urgencyLevel === 'Crítica' || e.priority === 'Alta')
                    .slice(0, 5)
                    .map(email => (
                      <div key={email.id} className="p-3 border border-red-200 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                           onClick={() => handleEmailClick(email)}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-red-900 truncate">{email.subject}</h4>
                            <p className="text-xs text-red-700 mt-1">
                              {email.aiExtractedData.patientName || 'Paciente no identificado'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="destructive" className="text-xs">
                                {email.urgencyLevel}
                              </Badge>
                              {email.aiExtractedData.urgentFindings && email.aiExtractedData.urgentFindings.length > 0 && (
                                <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                                  {email.aiExtractedData.urgentFindings.length} hallazgos
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-red-600">
                            {formatDistanceToNow(email.receivedAt, { addSuffix: true, locale: es })}
                          </div>
                        </div>
                      </div>
                    ))}
                  {medicalStats.urgentCases === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm">No hay casos urgentes en este momento</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Distribución por especialidad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Distribución por Especialidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.bySpecialty).slice(0, 6).map(([specialty, count]) => (
                    <div key={specialty} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{specialty}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {count}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Emails recientes */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Emails Recientes
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveView('todos')}>
                    Ver todos
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {emailsToShow.slice(0, 3).map(email => (
                    <EmailCard
                      key={email.id}
                      email={email}
                      isCompact={true}
                      showAIDetails={false}
                      onClick={() => handleEmailClick(email)}
                      onProcess={() => handleProcessEmail(email.id)}
                      onFlag={() => flagEmail(email.id, !email.flagged)}
                      onMarkReviewed={() => markAsReviewed(email.id, !email.reviewed)}
                      className={getPriorityColor(email)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Vista de lista completa
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activeView === 'urgentes' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                  {activeView === 'pendientes' && <Clock className="h-5 w-5 text-orange-600" />}
                  {activeView === 'todos' && <Mail className="h-5 w-5" />}
                  {activeView === 'urgentes' ? 'Casos Urgentes' : 
                   activeView === 'pendientes' ? 'Pendientes de Revisión' : 
                   'Todos los Emails'}
                  <Badge variant="secondary" className="ml-2">
                    {emailsToShow.length}
                  </Badge>
                </div>
                
                {selectedEmails.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedEmails.length} seleccionados
                    </span>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      Limpiar selección
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Cargando emails...</span>
                </div>
              ) : emailsToShow.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay emails</h3>
                  <p className="text-gray-600">
                    No se encontraron emails para los filtros seleccionados.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {emailsToShow.map(email => (
                    <EmailCard
                      key={email.id}
                      email={email}
                      isSelected={selectedEmails.includes(email.id)}
                      isCompact={false}
                      showAIDetails={true}
                      onClick={() => handleEmailClick(email)}
                      onSelect={() => selectEmail(email.id)}
                      onProcess={() => handleProcessEmail(email.id)}
                      onFlag={() => flagEmail(email.id, !email.flagged)}
                      onMarkReviewed={() => markAsReviewed(email.id, !email.reviewed)}
                      className={getPriorityColor(email)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modal de detalle de email */}
        <EmailDetailModal
          email={selectedEmail}
          isOpen={showEmailDetail}
          onClose={() => {
            setShowEmailDetail(false);
            setSelectedEmail(null);
            setAIAnalysis(undefined);
          }}
          onProcess={() => selectedEmail && handleProcessEmail(selectedEmail.id)}
          onFlag={() => {
            if (selectedEmail) {
              flagEmail(selectedEmail.id, !selectedEmail.flagged);
              setSelectedEmail(prev => prev ? { ...prev, flagged: !prev.flagged } : null);
              toast.success(selectedEmail.flagged ? 'Email desmarcado' : 'Email marcado');
            }
          }}
          onMarkReviewed={() => {
            if (selectedEmail) {
              markAsReviewed(selectedEmail.id, !selectedEmail.reviewed);
              setSelectedEmail(prev => prev ? { ...prev, reviewed: !prev.reviewed } : null);
              toast.success(selectedEmail.reviewed ? 'Marcado como no revisado' : 'Marcado como revisado');
            }
          }}
          onCreateCase={() => {
            toast.success('Caso médico creado exitosamente');
            setShowEmailDetail(false);
          }}
          aiAnalysis={aiAnalysis}
        />
      </div>
    </div>
  );
}
