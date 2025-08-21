"use client";

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Brain, 
  Settings, 
  BarChart3, 
  RefreshCw, 
  Download, 
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Activity,
  TrendingUp,
  Server,
  Database,
  Zap,
  Shield,
  PlayCircle,
  PauseCircle,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { EmailList } from '@/components/email/email-list';
import { EmailDetailModal } from '@/components/email/email-detail-modal';
import { Header } from '@/components/layout/header';
import { EmailData, useEmailManager } from '@/lib/email-manager';
import { getAIProcessor, AIAnalysisResult } from '@/lib/ai-email-processor';
import { cn } from '@/lib/utils';

export default function GmailManagerPage() {
  const {
    emails,
    filteredEmails,
    selectedEmails,
    isLoading,
    error,
    stats,
    processEmail,
    batchProcess,
    generateStats,
    loadSampleData
  } = useEmailManager();

  // Estados locales
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);
  const [showEmailDetail, setShowEmailDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'emails' | 'analytics' | 'settings'>('emails');
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysisResult | undefined>();
  
  // Estados del sistema
  const [systemStatus, setSystemStatus] = useState({
    aiProcessor: 'online',
    emailSync: 'idle',
    database: 'connected',
    processing: false
  });
  
  const [processingStats, setProcessingStats] = useState({
    totalProcessed: 0,
    successRate: 95,
    averageTime: 1250,
    queueSize: 0,
    errorsLast24h: 2
  });

  // Configuración del sistema
  const [systemConfig, setSystemConfig] = useState({
    autoProcessing: true,
    batchSize: 20,
    maxConcurrent: 5,
    confidenceThreshold: 70,
    alertsEnabled: true,
    backupEnabled: true
  });

  // Cargar datos de muestra al inicializar
  useEffect(() => {
    if (emails.length === 0) {
      loadSampleData();
    }
  }, [emails.length, loadSampleData]);

  // Generar estadísticas periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      generateStats();
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, [generateStats]);

  // Manejar clic en email
  const handleEmailClick = async (email: EmailData) => {
    setSelectedEmail(email);
    setShowEmailDetail(true);
    
    // Si el email está procesado, obtener análisis detallado de IA
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
      setSystemStatus(prev => ({ ...prev, processing: true }));
      await processEmail(emailId);
      toast.success('Email procesado exitosamente');
    } catch (error) {
      toast.error('Error procesando email');
    } finally {
      setSystemStatus(prev => ({ ...prev, processing: false }));
    }
  };

  // Procesamiento en lote
  const handleBatchProcess = async (emailIds: string[]) => {
    try {
      setSystemStatus(prev => ({ ...prev, processing: true }));
      await batchProcess(emailIds);
      toast.success(`${emailIds.length} emails procesados exitosamente`);
    } catch (error) {
      toast.error('Error en procesamiento por lotes');
    } finally {
      setSystemStatus(prev => ({ ...prev, processing: false }));
    }
  };

  // Exportar datos
  const handleExport = (emailIds: string[]) => {
    const emailsToExport = emails.filter(email => emailIds.includes(email.id));
    const dataStr = JSON.stringify(emailsToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `emails_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`${emailIds.length} emails exportados exitosamente`);
  };

  // Sincronización manual
  const handleManualSync = () => {
    setSystemStatus(prev => ({ ...prev, emailSync: 'syncing' }));
    
    // Simular sincronización
    setTimeout(() => {
      loadSampleData();
      setSystemStatus(prev => ({ ...prev, emailSync: 'idle' }));
      toast.success('Sincronización completada');
    }, 3000);
  };

  // Toggle auto-processing
  const toggleAutoProcessing = () => {
    setSystemConfig(prev => ({
      ...prev,
      autoProcessing: !prev.autoProcessing
    }));
    
    toast.success(
      systemConfig.autoProcessing 
        ? 'Auto-procesamiento deshabilitado' 
        : 'Auto-procesamiento habilitado'
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'syncing':
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'idle':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Gmail Manager - Procesamiento Masivo con IA" />
      
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header con controles principales */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Estadísticas principales */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total Emails</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Brain className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.processed}</div>
                    <div className="text-sm text-gray-600">Procesados IA</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
                    <div className="text-sm text-gray-600">Alta Prioridad</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{stats.today}</div>
                    <div className="text-sm text-gray-600">Hoy</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controles del sistema */}
          <Card className="lg:w-80">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Estado del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.aiProcessor)}
                    <span className="text-sm">Procesador IA</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {systemStatus.aiProcessor}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.emailSync)}
                    <span className="text-sm">Sincronización</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {systemStatus.emailSync}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.database)}
                    <span className="text-sm">Base de Datos</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {systemStatus.database}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button 
                  onClick={handleManualSync}
                  disabled={systemStatus.emailSync === 'syncing'}
                  size="sm" 
                  className="w-full"
                >
                  {systemStatus.emailSync === 'syncing' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sincronizar Ahora
                    </>
                  )}
                </Button>

                <Button 
                  onClick={toggleAutoProcessing}
                  variant={systemConfig.autoProcessing ? "default" : "outline"}
                  size="sm" 
                  className="w-full"
                >
                  {systemConfig.autoProcessing ? (
                    <>
                      <PauseCircle className="h-4 w-4 mr-2" />
                      Pausar Auto-IA
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Activar Auto-IA
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas del sistema */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {processingStats.errorsLast24h > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Se detectaron {processingStats.errorsLast24h} errores en las últimas 24 horas. 
              Revisa los logs para más detalles.
            </AlertDescription>
          </Alert>
        )}

        {/* Contenido principal con tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Emails ({filteredEmails.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analíticas
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="emails" className="mt-6">
            <EmailList
              onEmailClick={handleEmailClick}
              onEmailProcess={handleProcessEmail}
              onBatchProcess={handleBatchProcess}
              onExport={handleExport}
              showFilters={true}
              showStats={false}
              defaultView="grid"
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6 space-y-6">
            {/* Métricas de procesamiento */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Rendimiento de IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tasa de Éxito</span>
                    <span className="text-lg font-semibold text-green-600">
                      {processingStats.successRate}%
                    </span>
                  </div>
                  <Progress value={processingStats.successRate} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tiempo Promedio</span>
                    <span className="text-lg font-semibold">
                      {processingStats.averageTime}ms
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cola de Procesamiento</span>
                    <span className="text-lg font-semibold">
                      {processingStats.queueSize} emails
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Distribución por Especialidad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.bySpecialty).slice(0, 5).map(([specialty, count]) => (
                      <div key={specialty} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{specialty}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(count / stats.total) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Emails por Categoría Médica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.byCategory).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">
                          {category.replace('-', ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {count}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Actividad por Hora
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.byHour.slice(0, 6).map(({ hour, count }) => (
                      <div key={hour} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {hour.toString().padStart(2, '0')}:00
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min(100, (count / Math.max(...stats.byHour.map(h => h.count))) * 100)}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-6">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuración de IA */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Configuración de IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Auto-procesamiento</label>
                      <p className="text-xs text-gray-600">Procesar emails automáticamente al recibirlos</p>
                    </div>
                    <Button
                      variant={systemConfig.autoProcessing ? "default" : "outline"}
                      size="sm"
                      onClick={toggleAutoProcessing}
                    >
                      {systemConfig.autoProcessing ? "Activado" : "Desactivado"}
                    </Button>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Umbral de Confianza</label>
                    <p className="text-xs text-gray-600 mb-2">Mínima confianza para aprobar análisis automático</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="50"
                        max="95"
                        value={systemConfig.confidenceThreshold}
                        onChange={(e) => setSystemConfig(prev => ({
                          ...prev,
                          confidenceThreshold: parseInt(e.target.value)
                        }))}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-12">
                        {systemConfig.confidenceThreshold}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tamaño de Lote</label>
                    <p className="text-xs text-gray-600 mb-2">Emails a procesar simultáneamente</p>
                    <select
                      value={systemConfig.batchSize}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        batchSize: parseInt(e.target.value)
                      }))}
                      className="w-full p-2 border rounded-md text-sm"
                    >
                      <option value={10}>10 emails</option>
                      <option value={20}>20 emails</option>
                      <option value={50}>50 emails</option>
                      <option value={100}>100 emails</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Configuración del sistema */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Configuración del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Alertas del Sistema</label>
                      <p className="text-xs text-gray-600">Notificaciones sobre errores y estado</p>
                    </div>
                    <Button
                      variant={systemConfig.alertsEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSystemConfig(prev => ({
                        ...prev,
                        alertsEnabled: !prev.alertsEnabled
                      }))}
                    >
                      {systemConfig.alertsEnabled ? "Activado" : "Desactivado"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Respaldo Automático</label>
                      <p className="text-xs text-gray-600">Respaldar datos procesados diariamente</p>
                    </div>
                    <Button
                      variant={systemConfig.backupEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSystemConfig(prev => ({
                        ...prev,
                        backupEnabled: !prev.backupEnabled
                      }))}
                    >
                      {systemConfig.backupEnabled ? "Activado" : "Desactivado"}
                    </Button>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Máximo Concurrente</label>
                    <p className="text-xs text-gray-600 mb-2">Procesos de IA simultáneos</p>
                    <select
                      value={systemConfig.maxConcurrent}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        maxConcurrent: parseInt(e.target.value)
                      }))}
                      className="w-full p-2 border rounded-md text-sm"
                    >
                      <option value={3}>3 procesos</option>
                      <option value={5}>5 procesos</option>
                      <option value={10}>10 procesos</option>
                      <option value={20}>20 procesos</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Acciones del sistema */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Acciones del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button variant="outline" onClick={() => generateStats()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualizar Stats
                    </Button>
                    
                    <Button variant="outline" onClick={() => handleExport(emails.map(e => e.id))}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Todo
                    </Button>
                    
                    <Button variant="outline" onClick={loadSampleData}>
                      <Upload className="h-4 w-4 mr-2" />
                      Cargar Datos
                    </Button>
                    
                    <Button variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reiniciar Sistema
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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
              // Implementar toggle de flag
              toast.success(selectedEmail.flagged ? 'Email desmarcado' : 'Email marcado');
            }
          }}
          onMarkReviewed={() => {
            if (selectedEmail) {
              // Implementar toggle de revisado
              toast.success(selectedEmail.reviewed ? 'Marcado como no revisado' : 'Marcado como revisado');
            }
          }}
          onCreateCase={() => {
            toast.success('Caso médico creado exitosamente');
          }}
          aiAnalysis={aiAnalysis}
        />
      </div>
    </div>
  );
}
