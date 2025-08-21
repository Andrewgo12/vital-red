/**
 * Sistema robusto de manejo de emails masivos con IA integrada
 * No utiliza la API de Gmail - maneja datos simulados y reales de forma robusta
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// === TIPOS Y INTERFACES ===
export interface EmailData {
  id: string;
  threadId?: string;
  subject: string;
  senderEmail: string;
  senderName?: string;
  recipientEmail: string;
  recipientName?: string;
  receivedAt: Date;
  bodyText?: string;
  bodyHtml?: string;
  snippet: string;
  attachments: AttachmentData[];
  labels: string[];
  priority: 'Alta' | 'Media' | 'Baja';
  medicalCategory: 'referencia' | 'contra-referencia' | 'interconsulta' | 'urgencia' | 'seguimiento' | 'laboratorio' | 'otros';
  specialty?: string;
  urgencyLevel: 'Crítica' | 'Moderada' | 'Normal';
  processingStatus: 'processed' | 'processing' | 'error' | 'pending';
  confidence: number;
  
  // Información extraída por IA
  aiExtractedData: {
    patientName?: string;
    patientId?: string;
    patientAge?: number;
    patientGender?: 'Masculino' | 'Femenino';
    diagnosis?: string;
    institution?: string;
    referringDoctor?: string;
    urgentFindings?: string[];
    keywords: string[];
  };
  
  // Metadatos
  processingTime?: number;
  lastProcessed?: Date;
  errorDetails?: string;
  flagged?: boolean;
  reviewed?: boolean;
}

export interface AttachmentData {
  id: string;
  emailId: string;
  filename: string;
  mimeType: string;
  size: number;
  type: 'ECG' | 'Radiografía' | 'Laboratorio' | 'Historia Clínica' | 'Imagen Médica' | 'Documento' | 'Otros';
  aiAnalysis?: {
    extractedText?: string;
    medicalFindings?: string[];
    recommendations?: string[];
    confidence: number;
  };
  downloadUrl?: string;
  processed: boolean;
}

export interface FilterOptions {
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  priority?: string[];
  specialty?: string[];
  medicalCategory?: string[];
  processingStatus?: string[];
  hasAttachments?: boolean;
  reviewed?: boolean;
  flagged?: boolean;
}

export interface EmailStats {
  total: number;
  today: number;
  pending: number;
  processed: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  bySpecialty: Record<string, number>;
  byCategory: Record<string, number>;
  byHour: Array<{ hour: number; count: number }>;
  processingTime: {
    average: number;
    median: number;
    max: number;
  };
}

// === SERVICIO DE IA PARA PROCESAMIENTO ===
class AIEmailProcessor {
  private static instance: AIEmailProcessor;
  
  static getInstance(): AIEmailProcessor {
    if (!AIEmailProcessor.instance) {
      AIEmailProcessor.instance = new AIEmailProcessor();
    }
    return AIEmailProcessor.instance;
  }

  async processEmail(email: Partial<EmailData>): Promise<EmailData['aiExtractedData']> {
    // Simular procesamiento de IA robusto
    const content = `${email.subject} ${email.bodyText} ${email.snippet}`.toLowerCase();
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const extractedData: EmailData['aiExtractedData'] = {
          keywords: this.extractKeywords(content),
          patientName: this.extractPatientName(content),
          patientId: this.extractPatientId(content),
          patientAge: this.extractPatientAge(content),
          patientGender: this.extractPatientGender(content),
          diagnosis: this.extractDiagnosis(content),
          institution: this.extractInstitution(content, email.senderEmail || ''),
          referringDoctor: this.extractReferringDoctor(content),
          urgentFindings: this.extractUrgentFindings(content),
        };
        
        resolve(extractedData);
      }, Math.random() * 2000 + 500); // Simular tiempo de procesamiento variable
    });
  }

  private extractKeywords(content: string): string[] {
    const medicalKeywords = [
      'diabetes', 'hipertensión', 'cardiología', 'neurología', 'oncología',
      'pediatría', 'ginecología', 'cirugía', 'medicina interna', 'urgencias',
      'ecg', 'electrocardiograma', 'radiografía', 'tomografía', 'resonancia',
      'laboratorio', 'hemograma', 'glucosa', 'colesterol', 'troponinas',
      'referencia', 'interconsulta', 'seguimiento', 'urgente', 'crítico',
      'hospital', 'clínica', 'ips', 'ese', 'consulta externa'
    ];
    
    return medicalKeywords.filter(keyword => 
      content.includes(keyword) || content.includes(keyword.toLowerCase())
    );
  }

  private extractPatientName(content: string): string | undefined {
    const patterns = [
      /paciente:?\s*([A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóú]+)+)/i,
      /nombre:?\s*([A-ZÁÉÍÓÚ][a-záé��óú]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóú]+)+)/i,
      /señor[a]?\s+([A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóú]+)+)/i
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return match[1].trim();
    }
    return undefined;
  }

  private extractPatientId(content: string): string | undefined {
    const patterns = [
      /(?:cédula|cc|identificación|documento):?\s*([0-9]{6,12})/i,
      /id:?\s*([0-9]{6,12})/i
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return match[1];
    }
    return undefined;
  }

  private extractPatientAge(content: string): number | undefined {
    const patterns = [
      /edad:?\s*(\d{1,3})\s*años?/i,
      /(\d{1,3})\s*años?\s*de\s*edad/i
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        const age = parseInt(match[1]);
        if (age > 0 && age < 120) return age;
      }
    }
    return undefined;
  }

  private extractPatientGender(content: string): 'Masculino' | 'Femenino' | undefined {
    if (/\b(masculino|hombre|m)\b/i.test(content)) return 'Masculino';
    if (/\b(femenino|mujer|f)\b/i.test(content)) return 'Femenino';
    return undefined;
  }

  private extractDiagnosis(content: string): string | undefined {
    const patterns = [
      /diagnóstico:?\s*([^.]+)/i,
      /impresión\s*diagnóstica:?\s*([^.]+)/i,
      /dx:?\s*([^.]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return match[1].trim();
    }
    return undefined;
  }

  private extractInstitution(content: string, senderEmail: string): string | undefined {
    // Primero intentar desde el email
    const emailDomains = senderEmail.split('@')[1]?.toLowerCase() || '';
    if (emailDomains.includes('hospital')) return 'Hospital';
    if (emailDomains.includes('clinica')) return 'Clínica';
    if (emailDomains.includes('ips')) return 'IPS';
    
    // Luego desde el contenido
    const patterns = [
      /hospital\s+([A-ZÁÉÍÓÚ][a-záéíóú\s]+)/i,
      /clínica\s+([A-ZÁÉÍÓÚ][a-záéíóú\s]+)/i,
      /ese\s+([A-ZÁÉÍÓÚ][a-záéíóú\s]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return match[0].trim();
    }
    return undefined;
  }

  private extractReferringDoctor(content: string): string | undefined {
    const patterns = [
      /dr\.?\s+([A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóú]+)*)/i,
      /médico:?\s+([A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóú]+)*)/i,
      /referido\s+por:?\s+([A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóú]+)*)/i
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return match[1].trim();
    }
    return undefined;
  }

  private extractUrgentFindings(content: string): string[] {
    const urgentTerms = [
      'crítico', 'urgente', 'inmediato', 'emergencia', 'vital',
      'shock', 'paro', 'infarto', 'ictus', 'hemorragia',
      'fractura', 'politraumatismo', 'intoxicación'
    ];
    
    return urgentTerms.filter(term => 
      content.toLowerCase().includes(term)
    );
  }

  async processAttachment(attachment: AttachmentData): Promise<AttachmentData['aiAnalysis']> {
    // Simular análisis de IA de adjuntos
    return new Promise((resolve) => {
      setTimeout(() => {
        const analysis: AttachmentData['aiAnalysis'] = {
          extractedText: `Texto extraído del archivo ${attachment.filename}`,
          medicalFindings: this.generateMedicalFindings(attachment.type),
          recommendations: this.generateRecommendations(attachment.type),
          confidence: Math.random() * 40 + 60 // 60-100%
        };
        
        resolve(analysis);
      }, Math.random() * 3000 + 1000);
    });
  }

  private generateMedicalFindings(type: AttachmentData['type']): string[] {
    const findings: Record<AttachmentData['type'], string[]> = {
      'ECG': ['Ritmo sinusal normal', 'QRS estrecho', 'Sin alteraciones agudas'],
      'Radiografía': ['Estructuras óseas íntegras', 'Espacios articulares conservados'],
      'Laboratorio': ['Valores dentro de parámetros normales', 'Hemograma completo'],
      'Historia Clínica': ['Antecedentes relevantes documentados', 'Plan de manejo definido'],
      'Imagen Médica': ['Estudio contrastado', 'Estructuras anatómicas normales'],
      'Documento': ['Documento médico válido', 'Información completa'],
      'Otros': ['Archivo procesado correctamente']
    };
    
    return findings[type] || findings['Otros'];
  }

  private generateRecommendations(type: AttachmentData['type']): string[] {
    const recommendations: Record<AttachmentData['type'], string[]> = {
      'ECG': ['Continuar monitoreo', 'Evaluar factores de riesgo'],
      'Radiografía': ['Correlacionar con clínica', 'Seguimiento según evolución'],
      'Laboratorio': ['Repetir en caso necesario', 'Correlacionar con sintomatología'],
      'Historia Clínica': ['Revisar antecedentes', 'Actualizar plan de manejo'],
      'Imagen Médica': ['Correlacionar con estudios previos', 'Seguimiento programado'],
      'Documento': ['Archivar en expediente', 'Compartir con equipo médico'],
      'Otros': ['Revisar contenido', 'Clasificar apropiadamente']
    };
    
    return recommendations[type] || recommendations['Otros'];
  }
}

// === STORE PRINCIPAL ===
interface EmailManagerStore {
  emails: EmailData[];
  filteredEmails: EmailData[];
  currentFilters: FilterOptions;
  isLoading: boolean;
  error: string | null;
  selectedEmails: string[];
  stats: EmailStats;
  
  // Acciones
  addEmails: (emails: EmailData[]) => void;
  updateEmail: (id: string, updates: Partial<EmailData>) => void;
  deleteEmail: (id: string) => void;
  processEmail: (id: string) => Promise<void>;
  processAttachment: (emailId: string, attachmentId: string) => Promise<void>;
  batchProcess: (emailIds: string[]) => Promise<void>;
  setFilters: (filters: FilterOptions) => void;
  clearFilters: () => void;
  selectEmail: (id: string) => void;
  selectAllEmails: () => void;
  clearSelection: () => void;
  flagEmail: (id: string, flagged: boolean) => void;
  markAsReviewed: (id: string, reviewed: boolean) => void;
  generateStats: () => void;
  loadSampleData: () => void;
}

export const useEmailManager = create<EmailManagerStore>()(
  persist(
    (set, get) => ({
      emails: [],
      filteredEmails: [],
      currentFilters: {},
      isLoading: false,
      error: null,
      selectedEmails: [],
      stats: {
        total: 0,
        today: 0,
        pending: 0,
        processed: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
        bySpecialty: {},
        byCategory: {},
        byHour: [],
        processingTime: { average: 0, median: 0, max: 0 }
      },

      addEmails: (newEmails) => {
        set(state => {
          const existingIds = new Set(state.emails.map(e => e.id));
          const uniqueEmails = newEmails.filter(e => !existingIds.has(e.id));
          const emails = [...state.emails, ...uniqueEmails];
          return { 
            emails,
            filteredEmails: state.currentFilters ? 
              applyFilters(emails, state.currentFilters) : emails
          };
        });
        get().generateStats();
      },

      updateEmail: (id, updates) => {
        set(state => {
          const emails = state.emails.map(email => 
            email.id === id ? { ...email, ...updates } : email
          );
          return {
            emails,
            filteredEmails: applyFilters(emails, state.currentFilters)
          };
        });
        get().generateStats();
      },

      deleteEmail: (id) => {
        set(state => {
          const emails = state.emails.filter(email => email.id !== id);
          return {
            emails,
            filteredEmails: applyFilters(emails, state.currentFilters),
            selectedEmails: state.selectedEmails.filter(emailId => emailId !== id)
          };
        });
        get().generateStats();
      },

      processEmail: async (id) => {
        const email = get().emails.find(e => e.id === id);
        if (!email) return;

        set(state => ({
          ...state,
          isLoading: true,
          error: null
        }));

        try {
          // Marcar como procesando
          get().updateEmail(id, { 
            processingStatus: 'processing',
            lastProcessed: new Date()
          });

          const aiProcessor = AIEmailProcessor.getInstance();
          const startTime = Date.now();
          
          // Procesar email con IA
          const aiExtractedData = await aiProcessor.processEmail(email);
          
          // Determinar categoría médica y prioridad basada en IA
          const medicalCategory = determineMedicalCategory(aiExtractedData);
          const priority = determinePriority(aiExtractedData);
          const urgencyLevel = determineUrgencyLevel(aiExtractedData);
          const confidence = calculateConfidence(aiExtractedData);

          const processingTime = Date.now() - startTime;

          // Actualizar email con resultados
          get().updateEmail(id, {
            aiExtractedData,
            medicalCategory,
            priority,
            urgencyLevel,
            confidence,
            processingStatus: 'processed',
            processingTime,
            lastProcessed: new Date()
          });

          // Procesar adjuntos si los hay
          if (email.attachments.length > 0) {
            for (const attachment of email.attachments) {
              await get().processAttachment(id, attachment.id);
            }
          }

        } catch (error) {
          get().updateEmail(id, {
            processingStatus: 'error',
            errorDetails: error instanceof Error ? error.message : 'Error desconocido'
          });
          set({ error: 'Error procesando email' });
        } finally {
          set({ isLoading: false });
        }
      },

      processAttachment: async (emailId, attachmentId) => {
        const email = get().emails.find(e => e.id === emailId);
        const attachment = email?.attachments.find(a => a.id === attachmentId);
        if (!email || !attachment) return;

        try {
          const aiProcessor = AIEmailProcessor.getInstance();
          const aiAnalysis = await aiProcessor.processAttachment(attachment);
          
          // Actualizar attachment
          const updatedAttachments = email.attachments.map(att => 
            att.id === attachmentId 
              ? { ...att, aiAnalysis, processed: true }
              : att
          );

          get().updateEmail(emailId, { attachments: updatedAttachments });

        } catch (error) {
          console.error('Error procesando adjunto:', error);
        }
      },

      batchProcess: async (emailIds) => {
        set({ isLoading: true, error: null });
        
        try {
          const promises = emailIds.map(id => get().processEmail(id));
          await Promise.all(promises);
        } catch (error) {
          set({ error: 'Error en procesamiento por lotes' });
        } finally {
          set({ isLoading: false });
        }
      },

      setFilters: (filters) => {
        set(state => {
          const filteredEmails = applyFilters(state.emails, filters);
          return {
            currentFilters: filters,
            filteredEmails
          };
        });
      },

      clearFilters: () => {
        set(state => ({
          currentFilters: {},
          filteredEmails: state.emails
        }));
      },

      selectEmail: (id) => {
        set(state => ({
          selectedEmails: state.selectedEmails.includes(id)
            ? state.selectedEmails.filter(emailId => emailId !== id)
            : [...state.selectedEmails, id]
        }));
      },

      selectAllEmails: () => {
        set(state => ({
          selectedEmails: state.filteredEmails.map(email => email.id)
        }));
      },

      clearSelection: () => {
        set({ selectedEmails: [] });
      },

      flagEmail: (id, flagged) => {
        get().updateEmail(id, { flagged });
      },

      markAsReviewed: (id, reviewed) => {
        get().updateEmail(id, { reviewed });
      },

      generateStats: () => {
        const emails = get().emails;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats: EmailStats = {
          total: emails.length,
          today: emails.filter(e => e.receivedAt >= today).length,
          pending: emails.filter(e => e.processingStatus === 'pending').length,
          processed: emails.filter(e => e.processingStatus === 'processed').length,
          highPriority: emails.filter(e => e.priority === 'Alta').length,
          mediumPriority: emails.filter(e => e.priority === 'Media').length,
          lowPriority: emails.filter(e => e.priority === 'Baja').length,
          bySpecialty: {},
          byCategory: {},
          byHour: [],
          processingTime: { average: 0, median: 0, max: 0 }
        };

        // Calcular por especialidad
        emails.forEach(email => {
          if (email.specialty) {
            stats.bySpecialty[email.specialty] = (stats.bySpecialty[email.specialty] || 0) + 1;
          }
        });

        // Calcular por categoría
        emails.forEach(email => {
          stats.byCategory[email.medicalCategory] = (stats.byCategory[email.medicalCategory] || 0) + 1;
        });

        // Calcular por hora del día
        const hourCounts: Record<number, number> = {};
        emails.forEach(email => {
          const hour = email.receivedAt.getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        
        stats.byHour = Object.entries(hourCounts).map(([hour, count]) => ({
          hour: parseInt(hour),
          count
        }));

        // Calcular tiempos de procesamiento
        const processingTimes = emails
          .filter(e => e.processingTime)
          .map(e => e.processingTime!)
          .sort((a, b) => a - b);

        if (processingTimes.length > 0) {
          stats.processingTime.average = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
          stats.processingTime.median = processingTimes[Math.floor(processingTimes.length / 2)];
          stats.processingTime.max = Math.max(...processingTimes);
        }

        set({ stats });
      },

      loadSampleData: () => {
        const sampleEmails = generateSampleEmails();
        get().addEmails(sampleEmails);
      }
    }),
    {
      name: 'email-manager-store',
      partialize: (state) => ({ 
        emails: state.emails,
        currentFilters: state.currentFilters 
      }),
    }
  )
);

// === FUNCIONES AUXILIARES ===

function applyFilters(emails: EmailData[], filters: FilterOptions): EmailData[] {
  return emails.filter(email => {
    // Filtro de búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = `${email.subject} ${email.senderEmail} ${email.bodyText} ${email.aiExtractedData.patientName}`.toLowerCase();
      if (!searchableText.includes(searchTerm)) return false;
    }

    // Filtro de fechas
    if (filters.dateFrom && email.receivedAt < filters.dateFrom) return false;
    if (filters.dateTo && email.receivedAt > filters.dateTo) return false;

    // Filtros de arrays
    if (filters.priority && !filters.priority.includes(email.priority)) return false;
    if (filters.specialty && email.specialty && !filters.specialty.includes(email.specialty)) return false;
    if (filters.medicalCategory && !filters.medicalCategory.includes(email.medicalCategory)) return false;
    if (filters.processingStatus && !filters.processingStatus.includes(email.processingStatus)) return false;

    // Filtros booleanos
    if (filters.hasAttachments !== undefined && (email.attachments.length > 0) !== filters.hasAttachments) return false;
    if (filters.reviewed !== undefined && email.reviewed !== filters.reviewed) return false;
    if (filters.flagged !== undefined && email.flagged !== filters.flagged) return false;

    return true;
  });
}

function determineMedicalCategory(aiData: EmailData['aiExtractedData']): EmailData['medicalCategory'] {
  const keywords = aiData.keywords.join(' ').toLowerCase();
  
  if (keywords.includes('referencia') || keywords.includes('remisión')) return 'referencia';
  if (keywords.includes('contra-referencia') || keywords.includes('contrarreferencia')) return 'contra-referencia';
  if (keywords.includes('interconsulta') || keywords.includes('consulta')) return 'interconsulta';
  if (keywords.includes('urgencia') || keywords.includes('urgente') || keywords.includes('emergencia')) return 'urgencia';
  if (keywords.includes('seguimiento') || keywords.includes('control')) return 'seguimiento';
  if (keywords.includes('laboratorio') || keywords.includes('lab') || keywords.includes('examen')) return 'laboratorio';
  
  return 'otros';
}

function determinePriority(aiData: EmailData['aiExtractedData']): EmailData['priority'] {
  const urgentFindings = aiData.urgentFindings || [];
  const keywords = aiData.keywords.join(' ').toLowerCase();
  
  if (urgentFindings.length > 0 || keywords.includes('crítico') || keywords.includes('emergencia')) {
    return 'Alta';
  }
  
  if (keywords.includes('importante') || keywords.includes('prioridad') || keywords.includes('urgente')) {
    return 'Media';
  }
  
  return 'Baja';
}

function determineUrgencyLevel(aiData: EmailData['aiExtractedData']): EmailData['urgencyLevel'] {
  const urgentFindings = aiData.urgentFindings || [];
  
  if (urgentFindings.length >= 2) return 'Crítica';
  if (urgentFindings.length === 1) return 'Moderada';
  return 'Normal';
}

function calculateConfidence(aiData: EmailData['aiExtractedData']): number {
  let confidence = 0;
  
  if (aiData.patientName) confidence += 20;
  if (aiData.patientId) confidence += 15;
  if (aiData.diagnosis) confidence += 25;
  if (aiData.institution) confidence += 15;
  if (aiData.referringDoctor) confidence += 10;
  if (aiData.keywords.length > 0) confidence += Math.min(15, aiData.keywords.length * 3);
  
  return Math.min(100, confidence);
}

function generateSampleEmails(): EmailData[] {
  // Función para generar datos de muestra realistas
  const sampleData: EmailData[] = [];
  
  for (let i = 0; i < 50; i++) {
    const email: EmailData = {
      id: `email-${i + 1}`,
      threadId: `thread-${Math.floor(i / 3) + 1}`,
      subject: getSampleSubject(),
      senderEmail: getSampleSenderEmail(),
      senderName: getSampleSenderName(),
      recipientEmail: 'vitalred@hospital.com',
      recipientName: 'VITAL RED',
      receivedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      bodyText: getSampleBodyText(),
      snippet: getSampleSnippet(),
      attachments: generateSampleAttachments(i),
      labels: ['INBOX', 'MEDICAL'],
      priority: getSamplePriority(),
      medicalCategory: getSampleMedicalCategory(),
      specialty: getSampleSpecialty(),
      urgencyLevel: getSampleUrgencyLevel(),
      processingStatus: getSampleProcessingStatus(),
      confidence: Math.floor(Math.random() * 40) + 60,
      aiExtractedData: generateSampleAIData(),
      processingTime: Math.floor(Math.random() * 3000) + 500,
      lastProcessed: new Date(),
      flagged: Math.random() > 0.8,
      reviewed: Math.random() > 0.6
    };
    
    sampleData.push(email);
  }
  
  return sampleData;
}

function getSampleSubject(): string {
  const subjects = [
    'Referencia paciente Juan Pérez - Cardiología',
    'Interconsulta urgente - Posible IAM',
    'Contra-referencia paciente María González',
    'Resultados de laboratorio - Caso crítico',
    'Seguimiento post-cirugía - ECG alterado',
    'Consulta neurología - Paciente con ACV',
    'Referencia pediatría - Niño con fiebre alta',
    'Urgencia ginecología - Embarazo de riesgo',
    'Interconsulta ortopedia - Fractura compleja',
    'Laboratorio - Valores alterados hemograma'
  ];
  return subjects[Math.floor(Math.random() * subjects.length)];
}

function getSampleSenderEmail(): string {
  const emails = [
    'dr.martinez@hospital-central.com',
    'cardiologia@clinica-norte.com',
    'urgencias@ese-sur.gov.co',
    'laboratorio@ips-salud.com',
    'neurologia@hospital-universitario.edu.co',
    'pediatria@clinica-infantil.com',
    'ginecologia@centro-medico.com',
    'ortopedia@trauma-center.com'
  ];
  return emails[Math.floor(Math.random() * emails.length)];
}

function getSampleSenderName(): string {
  const names = [
    'Dr. Carlos Martínez',
    'Dra. Ana García',
    'Dr. Luis Rodríguez',
    'Dra. María Fernández',
    'Dr. José López',
    'Dra. Carmen Silva',
    'Dr. Pedro Sánchez',
    'Dra. Laura Jiménez'
  ];
  return names[Math.floor(Math.random() * names.length)];
}

function getSampleBodyText(): string {
  return `Estimados colegas,

Remito paciente para evaluación especializada. Se adjuntan estudios complementarios.

Antecedentes: HTA, DM tipo 2
Motivo de consulta: Dolor torácico
Examen físico: Estable, signos vitales normales

Solicito valoración y manejo.

Cordialmente,`;
}

function getSampleSnippet(): string {
  const snippets = [
    'Paciente masculino 65 años con dolor torácico...',
    'Niña 8 años con fiebre alta persistente...',
    'Mujer embarazada 28 semanas con sangrado...',
    'Adulto mayor con alteraciones neurológicas...',
    'Paciente politraumatizado requiere valoración...',
    'Resultados de laboratorio con valores críticos...'
  ];
  return snippets[Math.floor(Math.random() * snippets.length)];
}

function getSamplePriority(): EmailData['priority'] {
  const priorities: EmailData['priority'][] = ['Alta', 'Media', 'Baja'];
  const weights = [0.2, 0.6, 0.2]; // 20% alta, 60% media, 20% baja
  const random = Math.random();
  
  if (random < weights[0]) return priorities[0];
  if (random < weights[0] + weights[1]) return priorities[1];
  return priorities[2];
}

function getSampleMedicalCategory(): EmailData['medicalCategory'] {
  const categories: EmailData['medicalCategory'][] = [
    'referencia', 'contra-referencia', 'interconsulta', 
    'urgencia', 'seguimiento', 'laboratorio', 'otros'
  ];
  return categories[Math.floor(Math.random() * categories.length)];
}

function getSampleSpecialty(): string {
  const specialties = [
    'Cardiología', 'Neurología', 'Pediatría', 'Ginecología',
    'Medicina Interna', 'Cirugía', 'Ortopedia', 'Urgencias',
    'Laboratorio', 'Radiología'
  ];
  return specialties[Math.floor(Math.random() * specialties.length)];
}

function getSampleUrgencyLevel(): EmailData['urgencyLevel'] {
  const levels: EmailData['urgencyLevel'][] = ['Crítica', 'Moderada', 'Normal'];
  const weights = [0.1, 0.3, 0.6]; // 10% crítica, 30% moderada, 60% normal
  const random = Math.random();
  
  if (random < weights[0]) return levels[0];
  if (random < weights[0] + weights[1]) return levels[1];
  return levels[2];
}

function getSampleProcessingStatus(): EmailData['processingStatus'] {
  const statuses: EmailData['processingStatus'][] = ['processed', 'processing', 'error', 'pending'];
  const weights = [0.7, 0.1, 0.1, 0.1]; // 70% procesados
  const random = Math.random();
  
  if (random < weights[0]) return statuses[0];
  if (random < weights[0] + weights[1]) return statuses[1];
  if (random < weights[0] + weights[1] + weights[2]) return statuses[2];
  return statuses[3];
}

function generateSampleAttachments(emailIndex: number): AttachmentData[] {
  const hasAttachments = Math.random() > 0.4; // 60% tienen adjuntos
  if (!hasAttachments) return [];
  
  const attachmentCount = Math.floor(Math.random() * 3) + 1;
  const attachments: AttachmentData[] = [];
  
  for (let i = 0; i < attachmentCount; i++) {
    attachments.push({
      id: `att-${emailIndex}-${i}`,
      emailId: `email-${emailIndex + 1}`,
      filename: getSampleAttachmentFilename(),
      mimeType: getSampleMimeType(),
      size: Math.floor(Math.random() * 5000000) + 100000, // 100KB - 5MB
      type: getSampleAttachmentType(),
      processed: Math.random() > 0.3,
      downloadUrl: `/attachments/att-${emailIndex}-${i}/download`
    });
  }
  
  return attachments;
}

function getSampleAttachmentFilename(): string {
  const filenames = [
    'ECG_paciente_20240101.pdf',
    'Radiografia_torax.jpg',
    'Laboratorio_hemograma.pdf',
    'Historia_clinica.docx',
    'Tomografia_cerebral.dicom',
    'Resonancia_columna.jpg',
    'Informe_cardiologia.pdf',
    'Electroencefalograma.pdf'
  ];
  return filenames[Math.floor(Math.random() * filenames.length)];
}

function getSampleMimeType(): string {
  const mimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/dicom'
  ];
  return mimeTypes[Math.floor(Math.random() * mimeTypes.length)];
}

function getSampleAttachmentType(): AttachmentData['type'] {
  const types: AttachmentData['type'][] = [
    'ECG', 'Radiografía', 'Laboratorio', 'Historia Clínica',
    'Imagen Médica', 'Documento', 'Otros'
  ];
  return types[Math.floor(Math.random() * types.length)];
}

function generateSampleAIData(): EmailData['aiExtractedData'] {
  const patientNames = [
    'Juan Carlos Pérez', 'María Fernanda González', 'Luis Alberto Martínez',
    'Ana Isabel García', 'Carlos Eduardo López', 'Patricia Alejandra Silva'
  ];
  
  const diagnoses = [
    'Hipertensión arterial sistémica', 'Diabetes mellitus tipo 2',
    'Infarto agudo de miocardio', 'Neumonía adquirida en comunidad',
    'Fractura de radio distal', 'Gastritis aguda'
  ];
  
  const institutions = [
    'Hospital Central', 'Clínica Norte', 'ESE Sur',
    'IPS Salud', 'Hospital Universitario', 'Centro Médico'
  ];
  
  const doctors = [
    'Dr. Carlos Martínez', 'Dra. Ana García', 'Dr. Luis Rodríguez',
    'Dra. María Fernández', 'Dr. José López'
  ];
  
  return {
    patientName: patientNames[Math.floor(Math.random() * patientNames.length)],
    patientId: Math.floor(Math.random() * 90000000) + 10000000 + '',
    patientAge: Math.floor(Math.random() * 80) + 18,
    patientGender: Math.random() > 0.5 ? 'Masculino' : 'Femenino',
    diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
    institution: institutions[Math.floor(Math.random() * institutions.length)],
    referringDoctor: doctors[Math.floor(Math.random() * doctors.length)],
    urgentFindings: Math.random() > 0.7 ? ['Valores críticos', 'Requiere atención inmediata'] : [],
    keywords: ['diabetes', 'cardiología', 'urgente', 'laboratorio'].slice(0, Math.floor(Math.random() * 4) + 1)
  };
}
