/**
 * Servicio API para conectar el frontend con el backend de procesamiento de emails
 * Maneja la comunicación con las APIs del backend de Python
 */

import { EmailData, AttachmentData, FilterOptions, EmailStats } from '@/lib/email-manager';
import { AIAnalysisResult } from '@/lib/ai-email-processor';

// === CONFIGURACIÓN ===
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = 'v1';

// === TIPOS DE RESPUESTA DE LA API ===
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface SyncStatusResponse {
  is_running: boolean;
  last_sync_time?: string;
  emails_processed: number;
  emails_new: number;
  errors_count: number;
  status: string;
  progress_percentage: number;
  estimated_time_remaining?: string;
}

export interface ProcessingResult {
  email_id: string;
  success: boolean;
  message: string;
  processing_time_ms: number;
  attachments_processed: number;
  errors: string[];
}

export interface BatchProcessingResult {
  total_processed: number;
  successful: number;
  failed: number;
  processing_time_ms: number;
  results: ProcessingResult[];
}

// === CLASE PRINCIPAL DEL SERVICIO API ===
export class EmailAPIService {
  private baseURL: string;
  private headers: HeadersInit;

  constructor() {
    this.baseURL = `${API_BASE_URL}/api/${API_VERSION}`;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // === MÉTODOS AUXILIARES ===

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      
      // En caso de error, simular respuesta para desarrollo
      if (process.env.NODE_ENV === 'development') {
        return this.createMockResponse<T>(endpoint, options);
      }
      
      throw error;
    }
  }

  private createMockResponse<T>(endpoint: string, options: RequestInit): ApiResponse<T> {
    console.log(`Mock response for ${endpoint}`, options);
    
    // Simular respuestas exitosas para desarrollo
    return {
      success: true,
      message: `Mock response for ${endpoint}`,
      data: {} as T,
      timestamp: new Date().toISOString()
    };
  }

  private buildQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    
    return searchParams.toString();
  }

  // === ENDPOINTS DE EMAILS ===

  /**
   * Obtener lista paginada de emails con filtros
   */
  async getEmails(filters: FilterOptions & { skip?: number; limit?: number } = {}): Promise<PaginatedResponse<EmailData>> {
    const queryParams = this.buildQueryParams(filters);
    const endpoint = `/emails${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await this.makeRequest<PaginatedResponse<EmailData>>(endpoint);
    
    // En desarrollo, simular datos
    if (process.env.NODE_ENV === 'development') {
      return {
        items: [],
        total: 0,
        page: 1,
        size: filters.limit || 50,
        pages: 0,
        has_next: false,
        has_prev: false
      };
    }
    
    return response.data!;
  }

  /**
   * Obtener un email específico por ID
   */
  async getEmailById(emailId: string): Promise<EmailData> {
    const response = await this.makeRequest<EmailData>(`/emails/${emailId}`);
    return response.data!;
  }

  /**
   * Procesar un email individual con IA
   */
  async processEmail(emailId: string): Promise<ProcessingResult> {
    const response = await this.makeRequest<ProcessingResult>(
      `/emails/${emailId}/process`,
      {
        method: 'POST',
      }
    );
    
    return response.data!;
  }

  /**
   * Procesamiento en lote de emails
   */
  async batchProcessEmails(emailIds: string[]): Promise<BatchProcessingResult> {
    const response = await this.makeRequest<BatchProcessingResult>(
      '/emails/batch-process',
      {
        method: 'POST',
        body: JSON.stringify({ email_ids: emailIds }),
      }
    );
    
    return response.data!;
  }

  /**
   * Marcar email como procesado
   */
  async markEmailAsProcessed(emailId: string): Promise<void> {
    await this.makeRequest(
      `/emails/${emailId}/mark-processed`,
      {
        method: 'POST',
      }
    );
  }

  /**
   * Actualizar flags de email (flagged, reviewed, etc.)
   */
  async updateEmailFlags(emailId: string, flags: {
    flagged?: boolean;
    reviewed?: boolean;
  }): Promise<void> {
    await this.makeRequest(
      `/emails/${emailId}/flags`,
      {
        method: 'PUT',
        body: JSON.stringify(flags),
      }
    );
  }

  /**
   * Eliminar email
   */
  async deleteEmail(emailId: string): Promise<void> {
    await this.makeRequest(
      `/emails/${emailId}`,
      {
        method: 'DELETE',
      }
    );
  }

  // === ENDPOINTS DE ADJUNTOS ===

  /**
   * Obtener adjuntos de un email
   */
  async getEmailAttachments(emailId: string): Promise<AttachmentData[]> {
    const response = await this.makeRequest<AttachmentData[]>(`/emails/${emailId}/attachments`);
    return response.data!;
  }

  /**
   * Procesar adjunto con IA
   */
  async processAttachment(emailId: string, attachmentId: string): Promise<void> {
    await this.makeRequest(
      `/emails/${emailId}/attachments/${attachmentId}/process`,
      {
        method: 'POST',
      }
    );
  }

  /**
   * Descargar adjunto
   */
  async downloadAttachment(attachmentId: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/attachments/${attachmentId}/download`);
    
    if (!response.ok) {
      throw new Error(`Error downloading attachment: ${response.statusText}`);
    }
    
    return response.blob();
  }

  /**
   * Analizar adjunto con IA
   */
  async analyzeAttachment(emailId: string, attachmentId: string): Promise<AIAnalysisResult> {
    const response = await this.makeRequest<AIAnalysisResult>(
      `/emails/${emailId}/attachments/${attachmentId}/analyze`,
      {
        method: 'POST',
      }
    );
    
    return response.data!;
  }

  // === ENDPOINTS DE SINCRONIZACIÓN ===

  /**
   * Iniciar sincronización manual
   */
  async startSync(forceFullSync: boolean = false): Promise<SyncStatusResponse> {
    const response = await this.makeRequest<SyncStatusResponse>(
      '/sync/start',
      {
        method: 'POST',
        body: JSON.stringify({ force_full_sync: forceFullSync }),
      }
    );
    
    return response.data!;
  }

  /**
   * Obtener estado de sincronización
   */
  async getSyncStatus(): Promise<SyncStatusResponse> {
    const response = await this.makeRequest<SyncStatusResponse>('/sync/status');
    return response.data!;
  }

  /**
   * Cancelar sincronización en progreso
   */
  async cancelSync(): Promise<void> {
    await this.makeRequest(
      '/sync/cancel',
      {
        method: 'POST',
      }
    );
  }

  // === ENDPOINTS DE ESTADÍSTICAS ===

  /**
   * Obtener estadísticas del dashboard
   */
  async getDashboardStats(): Promise<EmailStats> {
    const response = await this.makeRequest<EmailStats>('/stats/dashboard');
    return response.data!;
  }

  /**
   * Obtener estadísticas diarias
   */
  async getDailyStats(days: number = 7): Promise<any[]> {
    const response = await this.makeRequest<any[]>(`/stats/daily?days=${days}`);
    return response.data!;
  }

  /**
   * Obtener métricas de procesamiento de IA
   */
  async getProcessingMetrics(): Promise<any> {
    const response = await this.makeRequest<any>('/stats/processing');
    return response.data!;
  }

  // === ENDPOINTS DE CONFIGURACIÓN ===

  /**
   * Obtener configuración del sistema
   */
  async getSystemConfig(): Promise<any> {
    const response = await this.makeRequest<any>('/config');
    return response.data!;
  }

  /**
   * Actualizar configuración del sistema
   */
  async updateSystemConfig(config: any): Promise<void> {
    await this.makeRequest(
      '/config',
      {
        method: 'PUT',
        body: JSON.stringify(config),
      }
    );
  }

  // === ENDPOINTS DE ANÁLISIS DE IA ===

  /**
   * Obtener análisis detallado de IA para un email
   */
  async getAIAnalysis(emailId: string): Promise<AIAnalysisResult> {
    const response = await this.makeRequest<AIAnalysisResult>(`/emails/${emailId}/ai-analysis`);
    return response.data!;
  }

  /**
   * Reanalizar email con IA
   */
  async reanalyzeEmail(emailId: string): Promise<AIAnalysisResult> {
    const response = await this.makeRequest<AIAnalysisResult>(
      `/emails/${emailId}/reanalyze`,
      {
        method: 'POST',
      }
    );
    
    return response.data!;
  }

  /**
   * Obtener métricas de confianza de IA
   */
  async getAIConfidenceMetrics(): Promise<any> {
    const response = await this.makeRequest<any>('/ai/confidence-metrics');
    return response.data!;
  }

  // === ENDPOINTS DE EXPORTACIÓN ===

  /**
   * Exportar emails en formato JSON
   */
  async exportEmails(emailIds: string[], format: 'json' | 'csv' | 'xlsx' = 'json'): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/export/emails`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        email_ids: emailIds,
        format: format
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Export error: ${response.statusText}`);
    }
    
    return response.blob();
  }

  /**
   * Exportar estadísticas
   */
  async exportStats(format: 'json' | 'csv' | 'xlsx' = 'json'): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/export/stats?format=${format}`, {
      headers: this.headers,
    });
    
    if (!response.ok) {
      throw new Error(`Export error: ${response.statusText}`);
    }
    
    return response.blob();
  }

  // === ENDPOINTS DE MONITOREO ===

  /**
   * Obtener logs del sistema
   */
  async getSystemLogs(level: 'info' | 'warning' | 'error' = 'info', limit: number = 100): Promise<any[]> {
    const response = await this.makeRequest<any[]>(`/logs?level=${level}&limit=${limit}`);
    return response.data!;
  }

  /**
   * Obtener estado de salud del sistema
   */
  async getHealthStatus(): Promise<any> {
    const response = await this.makeRequest<any>('/health');
    return response.data!;
  }

  /**
   * Obtener métricas de rendimiento
   */
  async getPerformanceMetrics(): Promise<any> {
    const response = await this.makeRequest<any>('/metrics/performance');
    return response.data!;
  }

  // === MÉTODOS DE UTILIDAD ===

  /**
   * Verificar conectividad con el backend
   */
  async ping(): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ status: string }>('/ping');
      return response.success && response.data?.status === 'ok';
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener información de la versión del API
   */
  async getVersion(): Promise<{ version: string; build: string; environment: string }> {
    const response = await this.makeRequest<{ version: string; build: string; environment: string }>('/version');
    return response.data!;
  }
}

// === INSTANCIA SINGLETON ===
let apiServiceInstance: EmailAPIService | null = null;

export function getEmailAPIService(): EmailAPIService {
  if (!apiServiceInstance) {
    apiServiceInstance = new EmailAPIService();
  }
  return apiServiceInstance;
}

// === HOOKS PERSONALIZADOS PARA REACT ===

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para manejar el estado de sincronización
 */
export function useSyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const apiService = getEmailAPIService();

  const fetchSyncStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const status = await apiService.getSyncStatus();
      setSyncStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  const startSync = useCallback(async (forceFullSync: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiService.startSync(forceFullSync);
      setSyncStatus(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error iniciando sincronización');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  const cancelSync = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await apiService.cancelSync();
      await fetchSyncStatus(); // Refrescar estado
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cancelando sincronización');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiService, fetchSyncStatus]);

  useEffect(() => {
    fetchSyncStatus();
    
    // Polling cada 30 segundos si hay sincronización en progreso
    const interval = setInterval(() => {
      if (syncStatus?.is_running) {
        fetchSyncStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchSyncStatus, syncStatus?.is_running]);

  return {
    syncStatus,
    isLoading,
    error,
    fetchSyncStatus,
    startSync,
    cancelSync
  };
}

/**
 * Hook para manejar estadísticas en tiempo real
 */
export function useRealTimeStats() {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const apiService = getEmailAPIService();

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const newStats = await apiService.getDashboardStats();
      setStats(newStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando estadísticas');
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  useEffect(() => {
    fetchStats();
    
    // Actualizar estadísticas cada 60 segundos
    const interval = setInterval(fetchStats, 60000);
    
    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refreshStats: fetchStats
  };
}

/**
 * Hook para manejar conexión con backend
 */
export function useBackendConnection() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [version, setVersion] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  
  const apiService = getEmailAPIService();

  const checkConnection = useCallback(async () => {
    try {
      const [pingResult, versionInfo] = await Promise.all([
        apiService.ping(),
        apiService.getVersion().catch(() => null)
      ]);
      
      setIsConnected(pingResult);
      setVersion(versionInfo?.version || null);
      setLastCheck(new Date());
    } catch (error) {
      setIsConnected(false);
      setVersion(null);
      setLastCheck(new Date());
    }
  }, [apiService]);

  useEffect(() => {
    checkConnection();
    
    // Verificar conexión cada 5 minutos
    const interval = setInterval(checkConnection, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkConnection]);

  return {
    isConnected,
    version,
    lastCheck,
    checkConnection
  };
}

export default EmailAPIService;
