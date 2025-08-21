"use client";

import React from 'react';
import { 
  Mail, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Paperclip, 
  Brain, 
  Flag,
  Eye,
  ChevronRight,
  Hospital,
  Stethoscope,
  Calendar,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { EmailData } from '@/lib/email-manager';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface EmailCardProps {
  email: EmailData;
  isSelected?: boolean;
  isCompact?: boolean;
  showAIDetails?: boolean;
  onClick?: () => void;
  onSelect?: () => void;
  onProcess?: () => void;
  onFlag?: () => void;
  onMarkReviewed?: () => void;
  className?: string;
}

export function EmailCard({
  email,
  isSelected = false,
  isCompact = false,
  showAIDetails = true,
  onClick,
  onSelect,
  onProcess,
  onFlag,
  onMarkReviewed,
  className
}: EmailCardProps) {
  const {
    subject,
    senderEmail,
    senderName,
    receivedAt,
    priority,
    medicalCategory,
    specialty,
    urgencyLevel,
    processingStatus,
    confidence,
    aiExtractedData,
    attachments,
    flagged,
    reviewed,
    snippet
  } = email;

  const getPriorityColor = (priority: EmailData['priority']) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'Media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baja': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: EmailData['urgencyLevel']) => {
    switch (urgency) {
      case 'Crítica': return 'bg-red-500';
      case 'Moderada': return 'bg-orange-500';
      case 'Normal': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: EmailData['processingStatus']) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: EmailData['medicalCategory']) => {
    switch (category) {
      case 'referencia':
        return <ChevronRight className="h-4 w-4" />;
      case 'contra-referencia':
        return <ChevronRight className="h-4 w-4 rotate-180" />;
      case 'interconsulta':
        return <Stethoscope className="h-4 w-4" />;
      case 'urgencia':
        return <AlertTriangle className="h-4 w-4" />;
      case 'seguimiento':
        return <Calendar className="h-4 w-4" />;
      case 'laboratorio':
        return <Target className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const timeAgo = formatDistanceToNow(receivedAt, { 
    addSuffix: true, 
    locale: es 
  });

  return (
    <TooltipProvider>
      <Card 
        className={cn(
          'transition-all duration-200 cursor-pointer hover:shadow-md',
          isSelected && 'ring-2 ring-blue-500 shadow-md',
          flagged && 'border-red-300 bg-red-50',
          isCompact ? 'py-2' : 'py-4',
          className
        )}
        onClick={onClick}
      >
        <CardHeader className={cn('pb-2', isCompact && 'pb-1')}>
          <div className="flex items-start justify-between gap-3">
            {/* Información principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {/* Checkbox de selección */}
                {onSelect && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onSelect}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                )}

                {/* Icono de categoría */}
                <div className="flex items-center gap-1 text-gray-600">
                  {getCategoryIcon(medicalCategory)}
                  <span className="text-xs font-medium capitalize">
                    {medicalCategory.replace('-', ' ')}
                  </span>
                </div>

                {/* Estado de procesamiento */}
                <Tooltip>
                  <TooltipTrigger>
                    {getStatusIcon(processingStatus)}
                  </TooltipTrigger>
                  <TooltipContent>
                    Estado: {processingStatus}
                  </TooltipContent>
                </Tooltip>

                {/* Flags */}
                {flagged && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Flag className="h-4 w-4 text-red-500 fill-current" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Email marcado
                    </TooltipContent>
                  </Tooltip>
                )}

                {reviewed && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Eye className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Revisado
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              {/* Asunto */}
              <h3 className={cn(
                'font-semibold text-gray-900 truncate',
                isCompact ? 'text-sm' : 'text-base'
              )}>
                {subject || 'Sin asunto'}
              </h3>

              {/* Remitente */}
              <div className="flex items-center gap-2 mt-1">
                <User className="h-3 w-3 text-gray-400" />
                <span className="text-sm text-gray-600 truncate">
                  {senderName || senderEmail}
                </span>
                {senderName && (
                  <span className="text-xs text-gray-400 truncate">
                    ({senderEmail})
                  </span>
                )}
              </div>

              {/* Snippet */}
              {!isCompact && snippet && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {snippet}
                </p>
              )}
            </div>

            {/* Panel lateral derecho */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {/* Tiempo */}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </div>

              {/* Prioridad */}
              <Badge className={cn('text-xs px-2 py-1', getPriorityColor(priority))}>
                {priority}
              </Badge>

              {/* Urgencia */}
              <div className="flex items-center gap-1">
                <div className={cn('w-2 h-2 rounded-full', getUrgencyColor(urgencyLevel))} />
                <span className="text-xs text-gray-600">{urgencyLevel}</span>
              </div>

              {/* Especialidad */}
              {specialty && (
                <Badge variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className={cn('pt-0', isCompact && 'pb-2')}>
          {/* Información de IA */}
          {showAIDetails && processingStatus === 'processed' && (
            <div className="space-y-3">
              {/* Información del paciente extraída por IA */}
              {aiExtractedData.patientName && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Información del Paciente (IA)
                    </span>
                    <Badge className={cn('text-xs', getConfidenceColor(confidence))}>
                      {confidence}% confianza
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Nombre:</span>
                      <p className="text-gray-900">{aiExtractedData.patientName}</p>
                    </div>
                    {aiExtractedData.patientId && (
                      <div>
                        <span className="font-medium text-gray-700">ID:</span>
                        <p className="text-gray-900">{aiExtractedData.patientId}</p>
                      </div>
                    )}
                    {aiExtractedData.patientAge && (
                      <div>
                        <span className="font-medium text-gray-700">Edad:</span>
                        <p className="text-gray-900">{aiExtractedData.patientAge} años</p>
                      </div>
                    )}
                    {aiExtractedData.diagnosis && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-700">Diagnóstico:</span>
                        <p className="text-gray-900">{aiExtractedData.diagnosis}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Información institucional */}
              {(aiExtractedData.institution || aiExtractedData.referringDoctor) && (
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Hospital className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      Información Institucional
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {aiExtractedData.institution && (
                      <div>
                        <span className="font-medium text-gray-700">Institución:</span>
                        <p className="text-gray-900">{aiExtractedData.institution}</p>
                      </div>
                    )}
                    {aiExtractedData.referringDoctor && (
                      <div>
                        <span className="font-medium text-gray-700">Médico:</span>
                        <p className="text-gray-900">{aiExtractedData.referringDoctor}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Hallazgos urgentes */}
              {aiExtractedData.urgentFindings && aiExtractedData.urgentFindings.length > 0 && (
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-900">
                      Hallazgos Urgentes
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {aiExtractedData.urgentFindings.map((finding, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {finding}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Palabras clave */}
              {aiExtractedData.keywords && aiExtractedData.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {aiExtractedData.keywords.slice(0, 5).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {aiExtractedData.keywords.length > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{aiExtractedData.keywords.length - 5} más
                    </Badge>
                  )}
                </div>
              )}

              {/* Barra de confianza */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Confianza de IA</span>
                  <span className={cn('text-xs font-medium', getConfidenceColor(confidence))}>
                    {confidence}%
                  </span>
                </div>
                <Progress 
                  value={confidence} 
                  className="h-2"
                  color={confidence >= 80 ? 'green' : confidence >= 60 ? 'yellow' : 'red'}
                />
              </div>
            </div>
          )}

          {/* Adjuntos */}
          {attachments.length > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <Paperclip className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {attachments.length} adjunto{attachments.length !== 1 ? 's' : ''}
              </span>
              
              {/* Mostrar tipos de adjuntos */}
              <div className="flex gap-1">
                {Array.from(new Set(attachments.map(att => att.type))).map((type, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Acciones */}
          {!isCompact && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="flex gap-2">
                {onProcess && processingStatus !== 'processed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onProcess();
                    }}
                    disabled={processingStatus === 'processing'}
                  >
                    {processingStatus === 'processing' ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Brain className="h-3 w-3 mr-1" />
                        Procesar IA
                      </>
                    )}
                  </Button>
                )}

                {onFlag && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFlag();
                    }}
                    className={flagged ? 'text-red-600 border-red-300' : ''}
                  >
                    <Flag className={cn('h-3 w-3 mr-1', flagged && 'fill-current')} />
                    {flagged ? 'Desmarcar' : 'Marcar'}
                  </Button>
                )}

                {onMarkReviewed && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkReviewed();
                    }}
                    className={reviewed ? 'text-blue-600 border-blue-300' : ''}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {reviewed ? 'No revisado' : 'Revisado'}
                  </Button>
                )}
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={onClick}
                className="text-blue-600 hover:text-blue-700"
              >
                Ver detalles
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

export default EmailCard;
