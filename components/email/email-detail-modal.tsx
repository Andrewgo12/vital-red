"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Mail,
  User,
  Clock,
  Brain,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Paperclip,
  Download,
  Eye,
  Flag,
  RefreshCw,
  Copy,
  ExternalLink,
  Calendar,
  MapPin,
  Phone,
  Heart,
  Activity,
  FileText,
  Stethoscope,
  Hospital,
  UserCheck,
  Target,
  TrendingUp,
  Shield,
  Zap,
  Search
} from 'lucide-react';
import { EmailData, AttachmentData } from '@/lib/email-manager';
import { AIAnalysisResult } from '@/lib/ai-email-processor';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface EmailDetailModalProps {
  email: EmailData | null;
  isOpen: boolean;
  onClose: () => void;
  onProcess?: () => void;
  onFlag?: () => void;
  onMarkReviewed?: () => void;
  onDownloadAttachment?: (attachmentId: string) => void;
  onCreateCase?: () => void;
  aiAnalysis?: AIAnalysisResult;
}

export function EmailDetailModal({
  email,
  isOpen,
  onClose,
  onProcess,
  onFlag,
  onMarkReviewed,
  onDownloadAttachment,
  onCreateCase,
  aiAnalysis
}: EmailDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'attachments' | 'raw'>('overview');

  if (!email) return null;

  const getPriorityColor = (priority: EmailData['priority']) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'Media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baja': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: EmailData['processingStatus']) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-semibold text-gray-900 line-clamp-2 mb-2">
                  {email.subject || 'Sin asunto'}
                </DialogTitle>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{email.senderName || email.senderEmail}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{format(email.receivedAt, 'PPpp', { locale: es })}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(email.processingStatus)}
                    <span className="capitalize">{email.processingStatus}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 ml-4">
                <Badge className={cn('text-xs', getPriorityColor(email.priority))}>
                  {email.priority}
                </Badge>
                
                <Badge variant="outline" className="text-xs">
                  {email.medicalCategory.replace('-', ' ')}
                </Badge>
                
                {email.specialty && (
                  <Badge variant="secondary" className="text-xs">
                    {email.specialty}
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Análisis IA
                {email.processingStatus === 'processed' && (
                  <Badge className={cn('text-xs ml-1', getConfidenceColor(email.confidence))}>
                    {email.confidence}%
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="attachments" className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Adjuntos ({email.attachments.length})
              </TabsTrigger>
              <TabsTrigger value="raw" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Contenido Raw
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 flex-1 overflow-hidden">
              <ScrollArea className="h-[60vh]">
                <TabsContent value="overview" className="mt-0 space-y-6">
                  {/* Información del email */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Información del Email
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">De:</label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-900">{email.senderName}</span>
                            <Tooltip>
                              <TooltipTrigger>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => copyToClipboard(email.senderEmail)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {email.senderEmail}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-700">Para:</label>
                          <p className="text-sm text-gray-900 mt-1">{email.recipientEmail}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-700">Prioridad:</label>
                          <Badge className={cn('mt-1', getPriorityColor(email.priority))}>
                            {email.priority}
                          </Badge>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-700">Urgencia:</label>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={cn(
                              'w-3 h-3 rounded-full',
                              email.urgencyLevel === 'Crítica' ? 'bg-red-500' :
                              email.urgencyLevel === 'Moderada' ? 'bg-orange-500' :
                              'bg-green-500'
                            )} />
                            <span className="text-sm text-gray-900">{email.urgencyLevel}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Contenido del email */}
                      <div>
                        <label className="text-sm font-medium text-gray-700">Contenido:</label>
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">
                            {email.bodyText || email.snippet || 'No hay contenido disponible'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Información del paciente (si está disponible) */}
                  {email.aiExtractedData.patientName && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <UserCheck className="h-5 w-5" />
                          Información del Paciente
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Nombre:</label>
                            <p className="text-sm text-gray-900 mt-1">{email.aiExtractedData.patientName}</p>
                          </div>
                          
                          {email.aiExtractedData.patientId && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">Identificación:</label>
                              <p className="text-sm text-gray-900 mt-1">{email.aiExtractedData.patientId}</p>
                            </div>
                          )}
                          
                          {email.aiExtractedData.patientAge && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">Edad:</label>
                              <p className="text-sm text-gray-900 mt-1">{email.aiExtractedData.patientAge} años</p>
                            </div>
                          )}
                          
                          {email.aiExtractedData.patientGender && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">Género:</label>
                              <p className="text-sm text-gray-900 mt-1">{email.aiExtractedData.patientGender}</p>
                            </div>
                          )}
                          
                          {email.aiExtractedData.diagnosis && (
                            <div className="col-span-2">
                              <label className="text-sm font-medium text-gray-700">Diagnóstico:</label>
                              <p className="text-sm text-gray-900 mt-1">{email.aiExtractedData.diagnosis}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Información institucional */}
                  {(email.aiExtractedData.institution || email.aiExtractedData.referringDoctor) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Hospital className="h-5 w-5" />
                          Información Institucional
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {email.aiExtractedData.institution && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">Institución:</label>
                              <p className="text-sm text-gray-900 mt-1">{email.aiExtractedData.institution}</p>
                            </div>
                          )}
                          
                          {email.aiExtractedData.referringDoctor && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">Médico Referente:</label>
                              <p className="text-sm text-gray-900 mt-1">{email.aiExtractedData.referringDoctor}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Hallazgos urgentes */}
                  {email.aiExtractedData.urgentFindings && email.aiExtractedData.urgentFindings.length > 0 && (
                    <Card className="border-red-200 bg-red-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-900">
                          <AlertTriangle className="h-5 w-5" />
                          Hallazgos Urgentes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {email.aiExtractedData.urgentFindings.map((finding, index) => (
                            <Badge key={index} variant="destructive">
                              {finding}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="ai" className="mt-0 space-y-6">
                  {email.processingStatus === 'processed' ? (
                    <>
                      {/* Resumen de confianza */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            Análisis de Inteligencia Artificial
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Confianza del Análisis</span>
                                <span className={cn('text-sm font-bold', getConfidenceColor(email.confidence))}>
                                  {email.confidence}%
                                </span>
                              </div>
                              <Progress value={email.confidence} className="h-2" />
                            </div>
                            
                            {email.processingTime && (
                              <div className="text-sm text-gray-600">
                                Tiempo de procesamiento: {email.processingTime}ms
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Datos extraídos */}
                      {aiAnalysis && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Search className="h-5 w-5" />
                              Datos Extraídos
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Datos del paciente */}
                            {aiAnalysis.extractedData.patient && Object.keys(aiAnalysis.extractedData.patient).length > 0 && (
                              <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-2">Paciente</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {Object.entries(aiAnalysis.extractedData.patient).map(([key, value]) => (
                                    value && (
                                      <div key={key} className="flex justify-between">
                                        <span className="text-gray-600 capitalize">{key}:</span>
                                        <span className="font-medium">{String(value)}</span>
                                      </div>
                                    )
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Datos médicos */}
                            {aiAnalysis.extractedData.medical && Object.keys(aiAnalysis.extractedData.medical).length > 0 && (
                              <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-2">Información Médica</h4>
                                <div className="space-y-2 text-sm">
                                  {Object.entries(aiAnalysis.extractedData.medical).map(([key, value]) => (
                                    value && (
                                      <div key={key}>
                                        <span className="text-gray-600 capitalize">{key}:</span>
                                        <span className="ml-2">{
                                          Array.isArray(value) ? value.join(', ') : String(value)
                                        }</span>
                                      </div>
                                    )
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Evaluación de riesgo */}
                      {aiAnalysis?.riskAssessment && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Shield className="h-5 w-5" />
                              Evaluación de Riesgo
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Riesgo General:</span>
                              <Badge className={cn(
                                'text-xs',
                                aiAnalysis.riskAssessment.overallRisk === 'Alto' ? 'bg-red-100 text-red-800' :
                                aiAnalysis.riskAssessment.overallRisk === 'Medio' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              )}>
                                {aiAnalysis.riskAssessment.overallRisk}
                              </Badge>
                            </div>

                            {aiAnalysis.riskAssessment.riskFactors.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Factores de Riesgo:</h5>
                                <div className="flex flex-wrap gap-1">
                                  {aiAnalysis.riskAssessment.riskFactors.map((factor, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {factor}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {aiAnalysis.riskAssessment.mitigationStrategies.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Estrategias de Mitigación:</h5>
                                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                                  {aiAnalysis.riskAssessment.mitigationStrategies.map((strategy, index) => (
                                    <li key={index}>{strategy}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Recomendaciones */}
                      {aiAnalysis?.recommendations && aiAnalysis.recommendations.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5" />
                              Recomendaciones
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                              {aiAnalysis.recommendations.map((recommendation, index) => (
                                <li key={index}>{recommendation}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {/* Flags y alertas */}
                      {aiAnalysis?.flags && aiAnalysis.flags.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Flag className="h-5 w-5" />
                              Alertas y Flags
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {aiAnalysis.flags.map((flag, index) => (
                                <div key={index} className={cn(
                                  'p-3 rounded-lg border',
                                  flag.type === 'critical' ? 'bg-red-50 border-red-200' :
                                  flag.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                  flag.type === 'info' ? 'bg-blue-50 border-blue-200' :
                                  'bg-gray-50 border-gray-200'
                                )}>
                                  <div className="flex items-start gap-2">
                                    <div className={cn(
                                      'w-2 h-2 rounded-full mt-2',
                                      flag.type === 'critical' ? 'bg-red-500' :
                                      flag.type === 'warning' ? 'bg-yellow-500' :
                                      flag.type === 'info' ? 'bg-blue-500' :
                                      'bg-gray-500'
                                    )} />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium capitalize">{flag.category}</span>
                                        <Badge variant="outline" className="text-xs">
                                          Severidad: {flag.severity}/10
                                        </Badge>
                                        {flag.actionRequired && (
                                          <Badge variant="destructive" className="text-xs">
                                            Acción Requerida
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">{flag.message}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Análisis de IA no disponible</h3>
                      <p className="text-gray-600 mb-4">
                        {email.processingStatus === 'pending' 
                          ? 'Este email no ha sido procesado por IA aún.'
                          : email.processingStatus === 'processing'
                          ? 'El análisis de IA está en progreso...'
                          : 'Hubo un error en el procesamiento de IA.'
                        }
                      </p>
                      {onProcess && email.processingStatus !== 'processing' && (
                        <Button onClick={onProcess}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Procesar con IA
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="attachments" className="mt-0 space-y-4">
                  {email.attachments.length > 0 ? (
                    <div className="grid gap-4">
                      {email.attachments.map((attachment) => (
                        <Card key={attachment.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <Paperclip className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm">{attachment.filename}</h4>
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <span>{attachment.type}</span>
                                    <span>•</span>
                                    <span>{(attachment.size / 1024).toFixed(1)} KB</span>
                                    {attachment.processed && (
                                      <>
                                        <span>•</span>
                                        <Badge variant="secondary" className="text-xs">
                                          Procesado
                                        </Badge>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {attachment.aiAnalysis && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge className={cn(
                                        'text-xs',
                                        getConfidenceColor(attachment.aiAnalysis.confidence)
                                      )}>
                                        IA: {attachment.aiAnalysis.confidence}%
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Confianza del análisis de IA
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                
                                {onDownloadAttachment && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDownloadAttachment(attachment.id)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            {/* Análisis de IA del adjunto */}
                            {attachment.aiAnalysis && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <h5 className="text-sm font-medium mb-2">Análisis de IA</h5>
                                
                                {attachment.aiAnalysis.extractedText && (
                                  <div className="mb-3">
                                    <span className="text-xs font-medium text-gray-700">Texto extraído:</span>
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-3">
                                      {attachment.aiAnalysis.extractedText}
                                    </p>
                                  </div>
                                )}
                                
                                {attachment.aiAnalysis.medicalFindings && attachment.aiAnalysis.medicalFindings.length > 0 && (
                                  <div className="mb-3">
                                    <span className="text-xs font-medium text-gray-700">Hallazgos médicos:</span>
                                    <ul className="text-xs text-gray-600 mt-1 list-disc list-inside">
                                      {attachment.aiAnalysis.medicalFindings.map((finding, index) => (
                                        <li key={index}>{finding}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {attachment.aiAnalysis.recommendations && attachment.aiAnalysis.recommendations.length > 0 && (
                                  <div>
                                    <span className="text-xs font-medium text-gray-700">Recomendaciones:</span>
                                    <ul className="text-xs text-gray-600 mt-1 list-disc list-inside">
                                      {attachment.aiAnalysis.recommendations.map((rec, index) => (
                                        <li key={index}>{rec}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Paperclip className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Sin adjuntos</h3>
                      <p className="text-gray-600">Este email no contiene archivos adjuntos.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="raw" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Contenido Raw del Email
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Texto plano:</label>
                          <div className="mt-2 p-4 bg-gray-50 rounded-lg border text-sm font-mono">
                            <pre className="whitespace-pre-wrap text-gray-900">
                              {email.bodyText || 'No hay contenido de texto disponible'}
                            </pre>
                          </div>
                        </div>
                        
                        {email.bodyHtml && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">HTML:</label>
                            <div className="mt-2 p-4 bg-gray-50 rounded-lg border text-sm font-mono">
                              <pre className="whitespace-pre-wrap text-gray-900">
                                {email.bodyHtml}
                              </pre>
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <label className="text-sm font-medium text-gray-700">Metadatos:</label>
                          <div className="mt-2 p-4 bg-gray-50 rounded-lg border text-sm font-mono">
                            <pre className="whitespace-pre-wrap text-gray-900">
                              {JSON.stringify({
                                id: email.id,
                                threadId: email.threadId,
                                receivedAt: email.receivedAt,
                                labels: email.labels,
                                confidence: email.confidence,
                                processingTime: email.processingTime,
                                aiExtractedData: email.aiExtractedData
                              }, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </div>
          </Tabs>

          <DialogFooter className="pt-4 border-t">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {email.flagged && (
                  <Badge variant="destructive" className="text-xs">
                    <Flag className="h-3 w-3 mr-1" />
                    Marcado
                  </Badge>
                )}
                
                {email.reviewed && (
                  <Badge variant="secondary" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Revisado
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                {onFlag && (
                  <Button variant="outline" onClick={onFlag}>
                    <Flag className="h-4 w-4 mr-2" />
                    {email.flagged ? 'Desmarcar' : 'Marcar'}
                  </Button>
                )}
                
                {onMarkReviewed && (
                  <Button variant="outline" onClick={onMarkReviewed}>
                    <Eye className="h-4 w-4 mr-2" />
                    {email.reviewed ? 'No revisado' : 'Revisado'}
                  </Button>
                )}
                
                {onCreateCase && email.processingStatus === 'processed' && email.confidence >= 70 && (
                  <Button onClick={onCreateCase}>
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Crear Caso Médico
                  </Button>
                )}
                
                <Button variant="secondary" onClick={onClose}>
                  Cerrar
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

export default EmailDetailModal;
