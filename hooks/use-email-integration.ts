/**
 * Hook personalizado para integración completa entre frontend y backend
 * Maneja sincronización, procesamiento de IA, y estado en tiempo real
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getEmailAPIService, useSyncStatus, useRealTimeStats, useBackendConnection } from '@/lib/api/email-api';
import { useEmailManager, EmailData, FilterOptions } from '@/lib/email-manager';
import { getAIProcessor, AIAnalysisResult } from '@/lib/ai-email-processor';
import { toast } from 'sonner';

interface EmailIntegrationConfig {
  autoSync: boolean;
  syncInterval: number; // en milisegundos
  autoProcess: boolean;
  batchSize: number;
  confidenceThreshold: number;
  enableRealTimeUpdates: boolean;
}

interface ProcessingQueue {
  pending: string[];
  processing: string[];
  completed: string[];
  failed: string[];
}

interface IntegrationMetrics {
  totalSynced: number;
  totalProcessed: number;
  averageProcessingTime: number;
  errorRate: number;
  lastSyncTime: Date | null;
  lastProcessingTime: Date | null;
}

export function useEmailIntegration(config: Partial<EmailIntegrationConfig> = {}) {
  const defaultConfig: EmailIntegrationConfig = {
    autoSync: true,
    syncInterval: 5 * 60 * 1000, // 5 minutos
    autoProcess: true,
    batchSize: 20,
    confidenceThreshold: 70,
    enableRealTimeUpdates: true,
    ...config
  };

  // Servicios
  const apiService = getEmailAPIService();
  const aiProcessor = getAIProcessor();
  const emailManager = useEmailManager();
  
  // Hooks de estado
  const { syncStatus, startSync, cancelSync } = useSyncStatus();
  const { stats, refreshStats } = useRealTimeStats();
  const { isConnected, version, checkConnection } = useBackendConnection();

  // Estados locales
  const [isInitialized, setIsInitialized] = useState(false);
  const [processingQueue, setProcessingQueue] = useState<ProcessingQueue>({
    pending: [],
    processing: [],
    completed: [],
    failed: []
  });
  
  const [metrics, setMetrics] = useState<IntegrationMetrics>({
    totalSynced: 0,
    totalProcessed: 0,
    averageProcessingTime: 0,
    errorRate: 0,
    lastSyncTime: null,
    lastProcessingTime: null
  });

  const [integrationStatus, setIntegrationStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [lastError, setLastError] = useState<string | null>(null);

  // Referencias
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // === INICIALIZACIÓN ===
  
  const initialize = useCallback(async () => {
    try {
      setIntegrationStatus('connecting');
      setLastError(null);

      // Verificar conexión con backend
      await checkConnection();
      
      if (!isConnected) {
        throw new Error('No se puede conectar con el backend');
      }

      // Cargar configuración inicial
      if (emailManager.emails.length === 0) {
        await syncEmailsFromBackend();
      }

      // Configurar auto-sincronización
      if (defaultConfig.autoSync) {
        setupAutoSync();
      }

      setIntegrationStatus('connected');
      setIsInitialized(true);
      
      toast.success('Integración con backend establecida exitosamente');
      
    } catch (error) {
      console.error('Error inicializando integración:', error);
      setIntegrationStatus('error');
      setLastError(error instanceof Error ? error.message : 'Error desconocido');
      
      // Fallback a modo local
      emailManager.loadSampleData();
      
      toast.error('Error conectando con backend, funcionando en modo local');
    }
  }, [isConnected, checkConnection, emailManager, defaultConfig.autoSync]);

  // === SINCRONIZACIÓN ===

  const syncEmailsFromBackend = useCallback(async (filters: FilterOptions = {}) => {
    try {
      setLastError(null);
      
      const response = await apiService.getEmails({
        ...filters,
        limit: 1000 // Obtener muchos emails de una vez
      });

      // Convertir respuesta del backend al formato del frontend
      const emails: EmailData[] = response.items.map(backendEmail => ({
        ...backendEmail,
        receivedAt: new Date(backendEmail.receivedAt),
        lastProcessed: backendEmail.lastProcessed ? new Date(backendEmail.lastProcessed) : undefined
      }));

      // Actualizar store local
      emailManager.addEmails(emails);
      
      // Actualizar métricas
      setMetrics(prev => ({
        ...prev,
        totalSynced: prev.totalSynced + emails.length,
        lastSyncTime: new Date()
      }));

      // Auto-procesar emails nuevos si está habilitado
      if (defaultConfig.autoProcess) {
        const unprocessedEmails = emails.filter(e => e.processingStatus === 'pending');
        if (unprocessedEmails.length > 0) {
          await processEmailsBatch(unprocessedEmails.map(e => e.id));
        }
      }

      return emails;

    } catch (error) {
      console.error('Error sincronizando emails:', error);
      setLastError(error instanceof Error ? error.message : 'Error en sincronización');
      throw error;
    }
  }, [apiService, emailManager, defaultConfig.autoProcess]);

  const setupAutoSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    syncIntervalRef.current = setInterval(async () => {
      try {
        if (isConnected && !syncStatus?.is_running) {
          await syncEmailsFromBackend();
        }
      } catch (error) {
        console.error('Error en auto-sincronización:', error);
      }
    }, defaultConfig.syncInterval);
  }, [isConnected, syncStatus?.is_running, syncEmailsFromBackend, defaultConfig.syncInterval]);

  // === PROCESAMIENTO DE IA ===

  const processEmailWithBackend = useCallback(async (emailId: string): Promise<AIAnalysisResult | null> => {
    try {
      // Agregar a cola de procesamiento
      setProcessingQueue(prev => ({
        ...prev,
        pending: prev.pending.filter(id => id !== emailId),
        processing: [...prev.processing, emailId]
      }));

      const startTime = Date.now();

      // Intentar procesar con backend primero
      let aiAnalysis: AIAnalysisResult | null = null;
      
      try {
        const backendResult = await apiService.processEmail(emailId);
        
        if (backendResult.success) {
          // Obtener análisis detallado de IA
          aiAnalysis = await apiService.getAIAnalysis(emailId);
        }
      } catch (backendError) {
        console.warn('Backend processing failed, using local AI:', backendError);
        
        // Fallback a procesamiento local
        const email = emailManager.emails.find(e => e.id === emailId);
        if (email) {
          aiAnalysis = await aiProcessor.processEmail(email);
        }
      }

      const processingTime = Date.now() - startTime;

      // Actualizar email con resultados
      if (aiAnalysis) {
        emailManager.updateEmail(emailId, {
          processingStatus: 'processed',
          confidence: aiAnalysis.confidence,
          processingTime,
          lastProcessed: new Date(),
          // Mapear datos de IA
          aiExtractedData: {
            ...aiAnalysis.extractedData.patient,
            ...aiAnalysis.extractedData.medical,
            ...aiAnalysis.extractedData.institutional,
            keywords: aiAnalysis.extractedData.medical.symptoms || []
          }
        });
      }

      // Actualizar cola de procesamiento
      setProcessingQueue(prev => ({
        ...prev,
        processing: prev.processing.filter(id => id !== emailId),
        completed: [...prev.completed, emailId]
      }));

      // Actualizar métricas
      setMetrics(prev => ({
        ...prev,
        totalProcessed: prev.totalProcessed + 1,
        averageProcessingTime: (prev.averageProcessingTime * prev.totalProcessed + processingTime) / (prev.totalProcessed + 1),
        lastProcessingTime: new Date()
      }));

      return aiAnalysis;

    } catch (error) {
      console.error('Error procesando email:', error);
      
      // Mover a cola de fallos
      setProcessingQueue(prev => ({
        ...prev,
        processing: prev.processing.filter(id => id !== emailId),
        failed: [...prev.failed, emailId]
      }));

      // Actualizar métricas de error
      setMetrics(prev => ({
        ...prev,
        errorRate: (prev.errorRate * prev.totalProcessed + 1) / (prev.totalProcessed + 1)
      }));

      // Marcar email como error
      emailManager.updateEmail(emailId, {
        processingStatus: 'error',
        errorDetails: error instanceof Error ? error.message : 'Error desconocido'
      });

      throw error;
    }
  }, [apiService, aiProcessor, emailManager]);

  const processEmailsBatch = useCallback(async (emailIds: string[]): Promise<void> => {
    try {
      // Procesar en lotes para no sobrecargar
      const batches = [];
      for (let i = 0; i < emailIds.length; i += defaultConfig.batchSize) {
        batches.push(emailIds.slice(i, i + defaultConfig.batchSize));
      }

      for (const batch of batches) {
        // Agregar lote a cola
        setProcessingQueue(prev => ({
          ...prev,
          pending: [...prev.pending, ...batch]
        }));

        // Procesar lote en paralelo
        const promises = batch.map(emailId => 
          processEmailWithBackend(emailId).catch(error => {
            console.error(`Error procesando email ${emailId}:`, error);
            return null;
          })
        );

        await Promise.all(promises);
        
        // Pausa entre lotes para no sobrecargar
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast.success(`Procesamiento en lote completado: ${emailIds.length} emails`);

    } catch (error) {
      console.error('Error en procesamiento por lotes:', error);
      toast.error('Error en procesamiento por lotes');
      throw error;
    }
  }, [defaultConfig.batchSize, processEmailWithBackend]);

  // === GESTIÓN DE ADJUNTOS ===

  const processAttachmentWithBackend = useCallback(async (emailId: string, attachmentId: string) => {
    try {
      // Intentar procesamiento con backend
      await apiService.processAttachment(emailId, attachmentId);
      
      // Obtener análisis actualizado
      const analysis = await apiService.analyzeAttachment(emailId, attachmentId);
      
      // Actualizar adjunto en el store local
      const email = emailManager.emails.find(e => e.id === emailId);
      if (email) {
        const updatedAttachments = email.attachments.map(att => 
          att.id === attachmentId 
            ? { ...att, aiAnalysis: analysis as any, processed: true }
            : att
        );
        
        emailManager.updateEmail(emailId, { attachments: updatedAttachments });
      }

      return analysis;

    } catch (error) {
      console.error('Error procesando adjunto:', error);
      
      // Fallback a procesamiento local
      const email = emailManager.emails.find(e => e.id === emailId);
      const attachment = email?.attachments.find(a => a.id === attachmentId);
      
      if (attachment) {
        const localAnalysis = await aiProcessor.processAttachment(attachment);
        
        const updatedAttachments = email!.attachments.map(att => 
          att.id === attachmentId 
            ? { ...att, aiAnalysis: localAnalysis, processed: true }
            : att
        );
        
        emailManager.updateEmail(emailId, { attachments: updatedAttachments });
        
        return localAnalysis;
      }
      
      throw error;
    }
  }, [apiService, aiProcessor, emailManager]);

  // === OPERACIONES DE ALTA NIVEL ===

  const handleManualSync = useCallback(async (forceFullSync: boolean = false) => {
    try {
      if (isConnected) {
        await startSync(forceFullSync);
        await syncEmailsFromBackend();
      } else {
        throw new Error('No hay conexión con el backend');
      }
    } catch (error) {
      console.error('Error en sincronización manual:', error);
      toast.error('Error en sincronización manual');
      throw error;
    }
  }, [isConnected, startSync, syncEmailsFromBackend]);

  const processAllPendingEmails = useCallback(async () => {
    const pendingEmails = emailManager.emails.filter(e => e.processingStatus === 'pending');
    
    if (pendingEmails.length > 0) {
      await processEmailsBatch(pendingEmails.map(e => e.id));
    }
  }, [emailManager.emails, processEmailsBatch]);

  const retryFailedProcessing = useCallback(async () => {
    if (processingQueue.failed.length > 0) {
      await processEmailsBatch([...processingQueue.failed]);
      setProcessingQueue(prev => ({ ...prev, failed: [] }));
    }
  }, [processingQueue.failed, processEmailsBatch]);

  // === EFECTOS ===

  // Inicializar al montar
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  // Actualizar estado de integración basado en conexión
  useEffect(() => {
    if (isConnected === true && integrationStatus === 'connecting') {
      setIntegrationStatus('connected');
    } else if (isConnected === false && integrationStatus === 'connected') {
      setIntegrationStatus('disconnected');
    }
  }, [isConnected, integrationStatus]);

  // Auto-procesar emails nuevos
  useEffect(() => {
    if (defaultConfig.autoProcess && isInitialized) {
      const unprocessedEmails = emailManager.emails.filter(e => 
        e.processingStatus === 'pending' && 
        !processingQueue.pending.includes(e.id) &&
        !processingQueue.processing.includes(e.id)
      );

      if (unprocessedEmails.length > 0) {
        // Procesar después de un pequeño delay para evitar spam
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
        }
        
        processingTimeoutRef.current = setTimeout(() => {
          processEmailsBatch(unprocessedEmails.map(e => e.id));
        }, 2000);
      }
    }
  }, [emailManager.emails, defaultConfig.autoProcess, isInitialized, processingQueue, processEmailsBatch]);

  // === INTERFACE PÚBLICA ===

  return {
    // Estado de integración
    isInitialized,
    integrationStatus,
    isConnected,
    backendVersion: version,
    lastError,
    
    // Datos
    emails: emailManager.emails,
    stats: stats || emailManager.stats,
    syncStatus,
    processingQueue,
    metrics,
    
    // Operaciones de sincronización
    syncEmails: syncEmailsFromBackend,
    manualSync: handleManualSync,
    cancelSync,
    
    // Operaciones de procesamiento
    processEmail: processEmailWithBackend,
    processBatch: processEmailsBatch,
    processAttachment: processAttachmentWithBackend,
    processAllPending: processAllPendingEmails,
    retryFailed: retryFailedProcessing,
    
    // Gestión de emails
    updateEmail: emailManager.updateEmail,
    flagEmail: emailManager.flagEmail,
    markAsReviewed: emailManager.markAsReviewed,
    selectEmail: emailManager.selectEmail,
    clearSelection: emailManager.clearSelection,
    
    // Filtros y búsqueda
    setFilters: emailManager.setFilters,
    clearFilters: emailManager.clearFilters,
    filteredEmails: emailManager.filteredEmails,
    currentFilters: emailManager.currentFilters,
    
    // Utilidades
    refreshStats,
    checkConnection,
    reinitialize: initialize,
    
    // Estado de loading
    isLoading: emailManager.isLoading || syncStatus?.is_running || false,
    error: emailManager.error || lastError
  };
}

export default useEmailIntegration;
