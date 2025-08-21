"use client";

import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle,
  Clock,
  Database,
  Heart,
  Mail,
  Server,
  Shield,
  TrendingUp,
  Users,
  Zap,
  Eye,
  RefreshCw,
  Download,
  Settings,
  Bell,
  XCircle,
  Info,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// === TIPOS DE DATOS ===
interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    incoming: number;
    outgoing: number;
  };
  uptime: number;
  lastUpdate: Date;
}

interface AIMetrics {
  modelsLoaded: number;
  averageProcessingTime: number;
  confidenceDistribution: Record<string, number>;
  errorRate: number;
  throughput: number;
  queueSize: number;
}

interface EmailMetrics {
  totalEmails: number;
  processedToday: number;
  averageConfidence: number;
  criticalCases: number;
  processingErrors: number;
  attachmentsProcessed: number;
}

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  category: 'system' | 'ai' | 'email' | 'security';
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  source: string;
  message: string;
  details?: any;
}

interface SystemMonitorProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function SystemMonitor({ 
  className, 
  autoRefresh = true, 
  refreshInterval = 30000 
}: SystemMonitorProps) {
  // Estados principales
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 68,
    disk: 32,
    network: { incoming: 1250, outgoing: 890 },
    uptime: 86400,
    lastUpdate: new Date()
  });

  const [aiMetrics, setAIMetrics] = useState<AIMetrics>({
    modelsLoaded: 3,
    averageProcessingTime: 1250,
    confidenceDistribution: {
      'Alto (80-100%)': 65,
      'Medio (60-79%)': 28,
      'Bajo (0-59%)': 7
    },
    errorRate: 2.3,
    throughput: 150,
    queueSize: 12
  });

  const [emailMetrics, setEmailMetrics] = useState<EmailMetrics>({
    totalEmails: 2847,
    processedToday: 156,
    averageConfidence: 78.5,
    criticalCases: 8,
    processingErrors: 3,
    attachmentsProcessed: 89
  });

  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Alto uso de CPU',
      message: 'El uso de CPU ha estado por encima del 80% durante los últimos 10 minutos',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      acknowledged: false,
      category: 'system'
    },
    {
      id: '2',
      type: 'critical',
      title: 'Error en procesamiento de IA',
      message: 'Fallo en el análisis de 3 emails por límite de tiempo excedido',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      acknowledged: false,
      category: 'ai'
    },
    {
      id: '3',
      type: 'info',
      title: 'Sincronización completada',
      message: 'Se sincronizaron exitosamente 45 nuevos emails',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      acknowledged: true,
      category: 'email'
    }
  ]);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 1 * 60 * 1000),
      level: 'info',
      source: 'EmailProcessor',
      message: 'Procesamiento completado exitosamente',
      details: { emailId: 'email-123', processingTime: 1450 }
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      level: 'warning',
      source: 'AIProcessor',
      message: 'Confianza baja en análisis',
      details: { emailId: 'email-122', confidence: 45 }
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      level: 'error',
      source: 'GmailService',
      message: 'Error de timeout en sincronización',
      details: { error: 'Connection timeout after 30s' }
    }
  ]);

  // Estados de configuración
  const [monitoringSettings, setMonitoringSettings] = useState({
    realTimeUpdates: true,
    alertsEnabled: true,
    logLevel: 'info' as 'info' | 'warning' | 'error',
    retentionDays: 30,
    emailNotifications: false
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'alerts' | 'logs' | 'settings'>('overview');

  // Simulación de actualización de métricas
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simular variaciones en las métricas
      setSystemMetrics(prev => ({
        ...prev,
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 5)),
        network: {
          incoming: Math.max(0, prev.network.incoming + (Math.random() - 0.5) * 200),
          outgoing: Math.max(0, prev.network.outgoing + (Math.random() - 0.5) * 150)
        },
        lastUpdate: new Date()
      }));

      setAiMetrics(prev => ({
        ...prev,
        averageProcessingTime: Math.max(500, prev.averageProcessingTime + (Math.random() - 0.5) * 300),
        queueSize: Math.max(0, prev.queueSize + Math.floor((Math.random() - 0.5) * 5)),
        throughput: Math.max(0, prev.throughput + Math.floor((Math.random() - 0.5) * 20))
      }));

      setEmailMetrics(prev => ({
        ...prev,
        processedToday: prev.processedToday + Math.floor(Math.random() * 3),
        averageConfidence: Math.max(0, Math.min(100, prev.averageConfidence + (Math.random() - 0.5) * 2))
      }));

    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Funciones auxiliares
  const getMetricColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return <XCircle className="h-3 w-3 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-3 w-3 text-green-500" />;
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const clearAcknowledgedAlerts = () => {
    setAlerts(prev => prev.filter(alert => !alert.acknowledged));
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system_logs_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
  const criticalAlerts = unacknowledgedAlerts.filter(a => a.type === 'critical');

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header con alertas críticas */}
      {criticalAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Tienes {criticalAlerts.length} alerta{criticalAlerts.length !== 1 ? 's' : ''} crítica{criticalAlerts.length !== 1 ? 's' : ''} sin resolver.
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab('alerts')}
                className="ml-2"
              >
                Ver alertas
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Resumen ejecutivo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">Online</div>
                <div className="text-sm text-gray-600">Estado Sistema</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{aiMetrics.throughput}/h</div>
                <div className="text-sm text-gray-600">Throughput IA</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{emailMetrics.processedToday}</div>
                <div className="text-sm text-gray-600">Emails Hoy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                unacknowledgedAlerts.length > 0 ? 'bg-red-100' : 'bg-gray-100'
              )}>
                <Bell className={cn(
                  'h-5 w-5',
                  unacknowledgedAlerts.length > 0 ? 'text-red-600' : 'text-gray-600'
                )} />
              </div>
              <div>
                <div className={cn(
                  'text-2xl font-bold',
                  unacknowledgedAlerts.length > 0 ? 'text-red-600' : 'text-gray-600'
                )}>
                  {unacknowledgedAlerts.length}
                </div>
                <div className="text-sm text-gray-600">Alertas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="alerts" className="relative">
            Alertas
            {unacknowledgedAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {unacknowledgedAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="settings">Config</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview" className="space-y-6">
            {/* Métricas del sistema */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Recursos del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">CPU</span>
                      <span className={cn('text-sm font-medium', getMetricColor(systemMetrics.cpu, { warning: 70, critical: 90 }))}>
                        {systemMetrics.cpu.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={systemMetrics.cpu} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Memoria</span>
                      <span className={cn('text-sm font-medium', getMetricColor(systemMetrics.memory, { warning: 75, critical: 90 }))}>
                        {systemMetrics.memory.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={systemMetrics.memory} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Disco</span>
                      <span className={cn('text-sm font-medium', getMetricColor(systemMetrics.disk, { warning: 80, critical: 95 }))}>
                        {systemMetrics.disk.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={systemMetrics.disk} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {systemMetrics.network.incoming.toFixed(0)} KB/s
                      </div>
                      <div className="text-xs text-gray-600">Red Entrada</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {systemMetrics.network.outgoing.toFixed(0)} KB/s
                      </div>
                      <div className="text-xs text-gray-600">Red Salida</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Rendimiento de IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {aiMetrics.averageProcessingTime}ms
                      </div>
                      <div className="text-sm text-gray-600">Tiempo Promedio</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {aiMetrics.queueSize}
                      </div>
                      <div className="text-sm text-gray-600">En Cola</div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Distribución de Confianza</h4>
                    <div className="space-y-2">
                      {Object.entries(aiMetrics.confidenceDistribution).map(([range, percentage]) => (
                        <div key={range} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{range}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8">{percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Estado de servicios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Estado de Servicios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-green-900">Gmail API</div>
                      <div className="text-sm text-green-700">Conectado</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-green-900">Base de Datos</div>
                      <div className="text-sm text-green-700">Operativo</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-green-900">Procesador IA</div>
                      <div className="text-sm text-green-700">Activo</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="font-medium text-yellow-900">Backup</div>
                      <div className="text-sm text-yellow-700">Pendiente</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Métricas detalladas del sistema */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Métricas Detalladas del Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Uso de Recursos (Últimas 24h)</h4>
                      <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Gráfico de métricas en tiempo real</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Uptime</label>
                        <p className="text-lg font-semibold">
                          {Math.floor(systemMetrics.uptime / 3600)}h {Math.floor((systemMetrics.uptime % 3600) / 60)}m
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Última Actualización</label>
                        <p className="text-sm text-gray-600">
                          {formatDistanceToNow(systemMetrics.lastUpdate, { addSuffix: true, locale: es })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Métricas de email */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Métricas de Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Emails</span>
                      <span className="font-semibold">{emailMetrics.totalEmails.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Procesados Hoy</span>
                      <span className="font-semibold text-green-600">{emailMetrics.processedToday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Confianza Promedio</span>
                      <span className={cn('font-semibold', getMetricColor(emailMetrics.averageConfidence, { warning: 60, critical: 40 }))}>
                        {emailMetrics.averageConfidence.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Casos Críticos</span>
                      <span className="font-semibold text-red-600">{emailMetrics.criticalCases}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Errores</span>
                      <span className="font-semibold text-red-600">{emailMetrics.processingErrors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Adjuntos</span>
                      <span className="font-semibold text-blue-600">{emailMetrics.attachmentsProcessed}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Alertas del Sistema</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearAcknowledgedAlerts}>
                  Limpiar confirmadas
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {alerts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay alertas</h3>
                    <p className="text-gray-600">El sistema está funcionando correctamente.</p>
                  </CardContent>
                </Card>
              ) : (
                alerts.map(alert => (
                  <Card key={alert.id} className={cn(
                    'border-l-4',
                    alert.type === 'critical' ? 'border-l-red-500 bg-red-50' :
                    alert.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                    'border-l-blue-500 bg-blue-50',
                    alert.acknowledged && 'opacity-60'
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getAlertIcon(alert.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{alert.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {alert.category}
                              </Badge>
                              {alert.acknowledged && (
                                <Badge variant="secondary" className="text-xs">
                                  Confirmada
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatDistanceToNow(alert.timestamp, { addSuffix: true, locale: es })}
                            </p>
                          </div>
                        </div>
                        
                        {!alert.acknowledged && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            Confirmar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Logs del Sistema</h3>
              <div className="flex gap-2">
                <Select value={monitoringSettings.logLevel} onValueChange={(value) => 
                  setMonitoringSettings(prev => ({ ...prev, logLevel: value as any }))
                }>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={exportLogs}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  <div className="p-4 space-y-2">
                    {logs
                      .filter(log => 
                        monitoringSettings.logLevel === 'info' || 
                        (monitoringSettings.logLevel === 'warning' && log.level !== 'info') ||
                        (monitoringSettings.logLevel === 'error' && log.level === 'error')
                      )
                      .map(log => (
                        <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          {getLogIcon(log.level)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-gray-500">
                                {log.timestamp.toLocaleTimeString()}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {log.source}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-900 mt-1">{log.message}</p>
                            {log.details && (
                              <pre className="text-xs text-gray-600 mt-2 font-mono bg-white p-2 rounded border overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            )}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Monitoreo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Actualizaciones en Tiempo Real</label>
                    <p className="text-xs text-gray-600">Actualizar métricas automáticamente</p>
                  </div>
                  <Switch
                    checked={monitoringSettings.realTimeUpdates}
                    onCheckedChange={(checked) => 
                      setMonitoringSettings(prev => ({ ...prev, realTimeUpdates: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Alertas Habilitadas</label>
                    <p className="text-xs text-gray-600">Mostrar notificaciones de alertas</p>
                  </div>
                  <Switch
                    checked={monitoringSettings.alertsEnabled}
                    onCheckedChange={(checked) => 
                      setMonitoringSettings(prev => ({ ...prev, alertsEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Notificaciones por Email</label>
                    <p className="text-xs text-gray-600">Enviar alertas críticas por email</p>
                  </div>
                  <Switch
                    checked={monitoringSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setMonitoringSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Retención de Logs (días)</label>
                  <Select value={monitoringSettings.retentionDays.toString()} onValueChange={(value) => 
                    setMonitoringSettings(prev => ({ ...prev, retentionDays: parseInt(value) }))
                  }>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 días</SelectItem>
                      <SelectItem value="30">30 días</SelectItem>
                      <SelectItem value="90">90 días</SelectItem>
                      <SelectItem value="365">1 año</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t">
                  <Button className="w-full">
                    Guardar Configuración
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default SystemMonitor;
