/**
 * Sistema avanzado de IA para procesamiento robusto de emails médicos
 * Incluye análisis de texto, reconocimiento de patrones, clasificación automática
 * y extracción de información médica crítica
 */

import { EmailData, AttachmentData } from './email-manager';

// === INTERFACES DE IA ===
export interface AIAnalysisResult {
  confidence: number;
  processingTime: number;
  extractedData: ExtractedMedicalData;
  riskAssessment: RiskAssessment;
  recommendations: string[];
  flags: AIFlag[];
  categoryProbabilities: Record<string, number>;
  sentiment: SentimentAnalysis;
}

export interface ExtractedMedicalData {
  patient: PatientData;
  medical: MedicalData;
  institutional: InstitutionalData;
  temporal: TemporalData;
  critical: CriticalData;
}

export interface PatientData {
  name?: string;
  id?: string;
  age?: number;
  gender?: 'Masculino' | 'Femenino';
  weight?: number;
  height?: number;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
  contactInfo?: {
    phone?: string;
    address?: string;
    emergencyContact?: string;
  };
}

export interface MedicalData {
  primaryDiagnosis?: string;
  secondaryDiagnoses?: string[];
  symptoms?: string[];
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
  };
  labResults?: LabResult[];
  procedures?: string[];
  treatments?: string[];
  prognosis?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
}

export interface LabResult {
  test: string;
  value: string;
  normalRange: string;
  isAbnormal: boolean;
  criticalValue: boolean;
}

export interface InstitutionalData {
  referringHospital?: string;
  referringDepartment?: string;
  referringDoctor?: string;
  receivingHospital?: string;
  receivingDepartment?: string;
  assignedDoctor?: string;
  bedNumber?: string;
  roomNumber?: string;
  insuranceInfo?: string;
  authorizationCodes?: string[];
}

export interface TemporalData {
  admissionDate?: Date;
  dischargeDate?: Date;
  consultationDate?: Date;
  onsetDate?: Date;
  lastModified?: Date;
  urgencyDeadline?: Date;
  followUpScheduled?: Date;
}

export interface CriticalData {
  emergencyLevel: 'Crítico' | 'Urgente' | 'Moderado' | 'Rutinario';
  redFlags: string[];
  immediateCare: boolean;
  isolationRequired: boolean;
  allergicReactions: string[];
  drugInteractions: string[];
  comorbidities: string[];
}

export interface RiskAssessment {
  overallRisk: 'Alto' | 'Medio' | 'Bajo';
  riskFactors: string[];
  mitigationStrategies: string[];
  monitoringRequired: string[];
  escalationCriteria: string[];
}

export interface AIFlag {
  type: 'critical' | 'warning' | 'info' | 'error';
  category: string;
  message: string;
  severity: number; // 1-10
  actionRequired: boolean;
  autoResolvable: boolean;
}

export interface SentimentAnalysis {
  urgency: number; // 0-100
  concern: number; // 0-100
  confidence: number; // 0-100
  tone: 'formal' | 'urgent' | 'routine' | 'concerned' | 'casual';
}

export interface ProcessingMetrics {
  totalProcessed: number;
  successRate: number;
  averageProcessingTime: number;
  accuracyScore: number;
  flaggedForReview: number;
  criticalCasesDetected: number;
}

// === CONFIGURACIÓN DE IA ===
export interface AIConfig {
  enabled: boolean;
  autoProcess: boolean;
  confidenceThreshold: number;
  maxProcessingTime: number;
  models: {
    textAnalysis: boolean;
    medicalNER: boolean;
    riskAssessment: boolean;
    sentimentAnalysis: boolean;
    attachmentOCR: boolean;
  };
  languages: string[];
  specialtyFilters: string[];
  criticalKeywords: string[];
  alertThresholds: {
    critical: number;
    urgent: number;
    lowConfidence: number;
  };
}

// === MOTOR DE IA PRINCIPAL ===
export class AdvancedAIProcessor {
  private config: AIConfig;
  private metrics: ProcessingMetrics;
  private isProcessing: boolean = false;
  private processingQueue: string[] = [];

  constructor(config: Partial<AIConfig> = {}) {
    this.config = {
      enabled: true,
      autoProcess: true,
      confidenceThreshold: 70,
      maxProcessingTime: 30000, // 30 segundos
      models: {
        textAnalysis: true,
        medicalNER: true,
        riskAssessment: true,
        sentimentAnalysis: true,
        attachmentOCR: true
      },
      languages: ['es', 'en'],
      specialtyFilters: [
        'cardiología', 'neurología', 'pediatría', 'ginecología',
        'medicina interna', 'cirugía', 'ortopedia', 'urgencias',
        'psiquiatría', 'dermatología', 'oftalmología', 'otorrinolaringología'
      ],
      criticalKeywords: [
        'emergencia', 'crítico', 'urgente', 'inmediato', 'vital',
        'shock', 'paro', 'infarto', 'ictus', 'hemorragia',
        'politraumatismo', 'intoxicación', 'convulsión', 'coma'
      ],
      alertThresholds: {
        critical: 90,
        urgent: 70,
        lowConfidence: 50
      },
      ...config
    };

    this.metrics = {
      totalProcessed: 0,
      successRate: 0,
      averageProcessingTime: 0,
      accuracyScore: 0,
      flaggedForReview: 0,
      criticalCasesDetected: 0
    };
  }

  async processEmail(email: Partial<EmailData>): Promise<AIAnalysisResult> {
    const startTime = Date.now();
    
    try {
      // Validación inicial
      if (!this.config.enabled) {
        throw new Error('Procesador de IA deshabilitado');
      }

      // Preparar contenido para análisis
      const content = this.prepareContent(email);
      
      // Análisis paralelo de diferentes aspectos
      const [
        extractedData,
        riskAssessment,
        sentiment,
        categoryProbabilities
      ] = await Promise.all([
        this.extractMedicalData(content, email),
        this.assessRisk(content),
        this.analyzeSentiment(content),
        this.categorizeEmail(content)
      ]);

      // Generar recomendaciones basadas en análisis
      const recommendations = this.generateRecommendations(extractedData, riskAssessment);
      
      // Detectar flags y alertas
      const flags = this.detectFlags(extractedData, riskAssessment, sentiment);
      
      // Calcular confianza general
      const confidence = this.calculateConfidence(extractedData, sentiment, categoryProbabilities);
      
      const processingTime = Date.now() - startTime;
      
      // Actualizar métricas
      this.updateMetrics(processingTime, confidence, flags);

      const result: AIAnalysisResult = {
        confidence,
        processingTime,
        extractedData,
        riskAssessment,
        recommendations,
        flags,
        categoryProbabilities,
        sentiment
      };

      // Log del procesamiento
      this.logProcessing(email.id || 'unknown', result);

      return result;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('Error en procesamiento de IA:', error);
      
      // Retornar resultado de error
      return {
        confidence: 0,
        processingTime,
        extractedData: {
          patient: {},
          medical: {},
          institutional: {},
          temporal: {},
          critical: {
            emergencyLevel: 'Rutinario',
            redFlags: [],
            immediateCare: false,
            isolationRequired: false,
            allergicReactions: [],
            drugInteractions: [],
            comorbidities: []
          }
        },
        riskAssessment: {
          overallRisk: 'Bajo',
          riskFactors: [],
          mitigationStrategies: [],
          monitoringRequired: [],
          escalationCriteria: []
        },
        recommendations: ['Error en procesamiento - Revisar manualmente'],
        flags: [{
          type: 'error',
          category: 'processing',
          message: error instanceof Error ? error.message : 'Error desconocido',
          severity: 8,
          actionRequired: true,
          autoResolvable: false
        }],
        categoryProbabilities: {},
        sentiment: {
          urgency: 0,
          concern: 0,
          confidence: 0,
          tone: 'routine'
        }
      };
    }
  }

  private prepareContent(email: Partial<EmailData>): string {
    const parts = [
      email.subject || '',
      email.bodyText || '',
      email.snippet || '',
      email.senderEmail || '',
      email.senderName || ''
    ];
    
    return parts.filter(Boolean).join(' ').toLowerCase();
  }

  private async extractMedicalData(content: string, email: Partial<EmailData>): Promise<ExtractedMedicalData> {
    // Simular extracción avanzada de datos médicos usando NLP
    return {
      patient: await this.extractPatientData(content),
      medical: await this.extractMedicalInfo(content),
      institutional: await this.extractInstitutionalData(content, email.senderEmail || ''),
      temporal: await this.extractTemporalData(content),
      critical: await this.extractCriticalData(content)
    };
  }

  private async extractPatientData(content: string): Promise<PatientData> {
    const patient: PatientData = {};
    
    // Extracción de nombre usando patrones avanzados
    const namePatterns = [
      /(?:paciente|nombre|sr\.|sra\.|señor|señora)[:,\s]*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,3})/i,
      /nombre\s+completo[:,\s]*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,3})/i
    ];
    
    for (const pattern of namePatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        patient.name = match[1].trim();
        break;
      }
    }

    // Extracción de identificación
    const idPatterns = [
      /(?:cédula|cc|documento|identificación|id)[:,\s]*(\d{6,12})/i,
      /(\d{8,12})(?=.*(?:cédula|documento|identificación))/i
    ];
    
    for (const pattern of idPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        patient.id = match[1];
        break;
      }
    }

    // Extracción de edad
    const agePatterns = [
      /edad[:,\s]*(\d{1,3})\s*años?/i,
      /(\d{1,3})\s*años?\s*de\s*edad/i,
      /(?:paciente|persona)\s+de\s+(\d{1,3})\s*años?/i
    ];
    
    for (const pattern of agePatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const age = parseInt(match[1]);
        if (age > 0 && age < 120) {
          patient.age = age;
          break;
        }
      }
    }

    // Extracción de género
    if (/\b(masculino|hombre|varón|male)\b/i.test(content)) {
      patient.gender = 'Masculino';
    } else if (/\b(femenino|mujer|female)\b/i.test(content)) {
      patient.gender = 'Femenino';
    }

    // Extracción de alergias
    const allergyPatterns = [
      /alergi[ao]s?[:,\s]*([^.\n]+)/i,
      /alérgi[co]s?\s+a[:,\s]*([^.\n]+)/i
    ];
    
    for (const pattern of allergyPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        patient.allergies = match[1].split(/[,;]/).map(a => a.trim()).filter(Boolean);
        break;
      }
    }

    // Extracción de medicamentos
    const medicationPatterns = [
      /medicamentos?[:,\s]*([^.\n]+)/i,
      /fármacos?[:,\s]*([^.\n]+)/i,
      /tratamiento\s+farmacológico[:,\s]*([^.\n]+)/i
    ];
    
    for (const pattern of medicationPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        patient.currentMedications = match[1].split(/[,;]/).map(m => m.trim()).filter(Boolean);
        break;
      }
    }

    return patient;
  }

  private async extractMedicalInfo(content: string): Promise<MedicalData> {
    const medical: MedicalData = {};

    // Extracción de diagnóstico principal
    const diagnosisPatterns = [
      /diagnóstico[:,\s]*([^.\n]+)/i,
      /impresión\s+diagnóstica[:,\s]*([^.\n]+)/i,
      /dx[:,\s]*([^.\n]+)/i,
      /patología[:,\s]*([^.\n]+)/i
    ];
    
    for (const pattern of diagnosisPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        medical.primaryDiagnosis = match[1].trim();
        break;
      }
    }

    // Extracción de síntomas
    const symptomPatterns = [
      /síntomas?[:,\s]*([^.\n]+)/i,
      /presenta[:,\s]*([^.\n]+)/i,
      /motivo\s+de\s+consulta[:,\s]*([^.\n]+)/i
    ];
    
    for (const pattern of symptomPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        medical.symptoms = match[1].split(/[,;]/).map(s => s.trim()).filter(Boolean);
        break;
      }
    }

    // Extracción de signos vitales
    medical.vitalSigns = {};
    
    // Presión arterial
    const bpMatch = content.match(/(?:presión|pa|blood\s+pressure)[:,\s]*(\d{2,3}\/\d{2,3})/i);
    if (bpMatch) medical.vitalSigns.bloodPressure = bpMatch[1];
    
    // Frecuencia cardíaca
    const hrMatch = content.match(/(?:frecuencia\s+cardíaca|fc|heart\s+rate)[:,\s]*(\d{2,3})/i);
    if (hrMatch) medical.vitalSigns.heartRate = parseInt(hrMatch[1]);
    
    // Temperatura
    const tempMatch = content.match(/temperatura[:,\s]*(\d{2,3}(?:\.\d)?)/i);
    if (tempMatch) medical.vitalSigns.temperature = parseFloat(tempMatch[1]);
    
    // Saturación de oxígeno
    const satMatch = content.match(/(?:saturación|spo2|so2)[:,\s]*(\d{2,3})%?/i);
    if (satMatch) medical.vitalSigns.oxygenSaturation = parseInt(satMatch[1]);

    // Determinar si requiere seguimiento
    medical.followUpRequired = /seguimiento|control|revisión|cita/i.test(content);

    return medical;
  }

  private async extractInstitutionalData(content: string, senderEmail: string): Promise<InstitutionalData> {
    const institutional: InstitutionalData = {};

    // Extracción desde email
    const domain = senderEmail.split('@')[1]?.toLowerCase() || '';
    if (domain.includes('hospital')) {
      institutional.referringHospital = 'Hospital (desde email)';
    } else if (domain.includes('clinica')) {
      institutional.referringHospital = 'Clínica (desde email)';
    } else if (domain.includes('ips')) {
      institutional.referringHospital = 'IPS (desde email)';
    }

    // Extracción de hospital desde contenido
    const hospitalPatterns = [
      /hospital\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ\s]+)/i,
      /clínica\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ\s]+)/i,
      /ese\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ\s]+)/i,
      /ips\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ\s]+)/i
    ];
    
    for (const pattern of hospitalPatterns) {
      const match = content.match(pattern);
      if (match && match[0]) {
        institutional.referringHospital = match[0].trim();
        break;
      }
    }

    // Extracción de médico referente
    const doctorPatterns = [
      /dr\.?\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/i,
      /dra\.?\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/i,
      /médico[:,\s]*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/i,
      /referido\s+por[:,\s]*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/i
    ];
    
    for (const pattern of doctorPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        institutional.referringDoctor = match[1].trim();
        break;
      }
    }

    // Extracción de departamento
    const departments = [
      'urgencias', 'cardiología', 'neurología', 'pediatría',
      'ginecología', 'medicina interna', 'cirugía', 'ortopedia',
      'consulta externa', 'hospitalización', 'uci'
    ];
    
    for (const dept of departments) {
      if (content.toLowerCase().includes(dept)) {
        institutional.referringDepartment = dept.charAt(0).toUpperCase() + dept.slice(1);
        break;
      }
    }

    return institutional;
  }

  private async extractTemporalData(content: string): Promise<TemporalData> {
    const temporal: TemporalData = {};

    // Patrones de fecha
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g
    ];

    // Buscar fechas específicas
    const admissionMatch = content.match(/(?:ingreso|admisión|hospitalización).*?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i);
    if (admissionMatch) {
      temporal.admissionDate = this.parseDate(admissionMatch[1]);
    }

    const consultationMatch = content.match(/(?:consulta|valoraci��n|evaluación).*?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i);
    if (consultationMatch) {
      temporal.consultationDate = this.parseDate(consultationMatch[1]);
    }

    return temporal;
  }

  private parseDate(dateStr: string): Date | undefined {
    try {
      const parts = dateStr.split(/[\/\-]/);
      if (parts.length === 3) {
        // Determinar formato (dd/mm/yyyy o yyyy/mm/dd)
        const first = parseInt(parts[0]);
        if (first > 31) {
          // Formato yyyy/mm/dd
          return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
          // Formato dd/mm/yyyy
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
      }
    } catch (error) {
      console.warn('Error parseando fecha:', dateStr);
    }
    return undefined;
  }

  private async extractCriticalData(content: string): Promise<CriticalData> {
    const critical: CriticalData = {
      emergencyLevel: 'Rutinario',
      redFlags: [],
      immediateCare: false,
      isolationRequired: false,
      allergicReactions: [],
      drugInteractions: [],
      comorbidities: []
    };

    // Determinar nivel de emergencia
    if (this.config.criticalKeywords.some(keyword => content.includes(keyword))) {
      critical.emergencyLevel = 'Crítico';
      critical.immediateCare = true;
    } else if (/urgente|prioridad|importante/i.test(content)) {
      critical.emergencyLevel = 'Urgente';
    } else if (/moderado|seguimiento|control/i.test(content)) {
      critical.emergencyLevel = 'Moderado';
    }

    // Detectar red flags
    const redFlagKeywords = [
      'shock', 'paro', 'infarto', 'ictus', 'hemorragia',
      'convulsión', 'coma', 'politraumatismo', 'intoxicación',
      'anafilaxia', 'sepsis', 'embolia'
    ];
    
    critical.redFlags = redFlagKeywords.filter(flag => 
      content.toLowerCase().includes(flag)
    );

    // Detectar necesidad de aislamiento
    const isolationKeywords = [
      'infeccioso', 'contagioso', 'tuberculosis', 'covid',
      'mrsa', 'c. difficile', 'aislamiento'
    ];
    
    critical.isolationRequired = isolationKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );

    return critical;
  }

  private async assessRisk(content: string): Promise<RiskAssessment> {
    const riskFactors: string[] = [];
    const mitigationStrategies: string[] = [];
    const monitoringRequired: string[] = [];
    const escalationCriteria: string[] = [];

    // Factores de riesgo comunes
    const commonRiskFactors = [
      { keyword: 'diabetes', factor: 'Diabetes mellitus' },
      { keyword: 'hipertensión', factor: 'Hipertensión arterial' },
      { keyword: 'cardiopatía', factor: 'Enfermedad cardiovascular' },
      { keyword: 'obesidad', factor: 'Obesidad' },
      { keyword: 'tabaquismo', factor: 'Tabaquismo' },
      { keyword: 'alcoholismo', factor: 'Alcoholismo' }
    ];

    commonRiskFactors.forEach(({ keyword, factor }) => {
      if (content.includes(keyword)) {
        riskFactors.push(factor);
      }
    });

    // Estrategias de mitigación basadas en riesgo
    if (riskFactors.length > 0) {
      mitigationStrategies.push('Monitoreo continuo de signos vitales');
      mitigationStrategies.push('Evaluación médica frecuente');
      
      if (riskFactors.includes('Diabetes mellitus')) {
        mitigationStrategies.push('Control estricto de glucemia');
        monitoringRequired.push('Glucometría cada 6 horas');
      }
      
      if (riskFactors.includes('Hipertensión arterial')) {
        mitigationStrategies.push('Control de presión arterial');
        monitoringRequired.push('Toma de presión arterial cada 4 horas');
      }
    }

    // Criterios de escalación
    if (content.includes('crítico') || content.includes('emergencia')) {
      escalationCriteria.push('Deterioro de signos vitales');
      escalationCriteria.push('Falta de respuesta al tratamiento inicial');
    }

    const overallRisk = this.calculateOverallRisk(riskFactors, content);

    return {
      overallRisk,
      riskFactors,
      mitigationStrategies,
      monitoringRequired,
      escalationCriteria
    };
  }

  private calculateOverallRisk(riskFactors: string[], content: string): 'Alto' | 'Medio' | 'Bajo' {
    let riskScore = 0;
    
    // Puntaje por factores de riesgo
    riskScore += riskFactors.length * 10;
    
    // Puntaje por palabras críticas
    if (this.config.criticalKeywords.some(keyword => content.includes(keyword))) {
      riskScore += 30;
    }
    
    // Puntaje por urgencia
    if (/urgente|crítico|emergencia/i.test(content)) {
      riskScore += 20;
    }

    if (riskScore >= 40) return 'Alto';
    if (riskScore >= 20) return 'Medio';
    return 'Bajo';
  }

  private async analyzeSentiment(content: string): Promise<SentimentAnalysis> {
    // Análisis de urgencia
    const urgencyKeywords = ['urgente', 'inmediato', 'crítico', 'emergencia', 'vital'];
    const urgency = urgencyKeywords.filter(keyword => content.includes(keyword)).length * 25;
    
    // Análisis de preocupación
    const concernKeywords = ['preocupante', 'grave', 'serio', 'complicado', 'deterioro'];
    const concern = concernKeywords.filter(keyword => content.includes(keyword)).length * 20;
    
    // Análisis de tono
    let tone: SentimentAnalysis['tone'] = 'routine';
    if (urgency > 50) tone = 'urgent';
    else if (concern > 40) tone = 'concerned';
    else if (/dr\.|estimado|cordialmente/i.test(content)) tone = 'formal';
    else if (/hola|saludos|gracias/i.test(content)) tone = 'casual';

    // Confianza en el análisis
    const confidence = Math.min(100, (urgency + concern) / 2 + 50);

    return {
      urgency: Math.min(100, urgency),
      concern: Math.min(100, concern),
      confidence,
      tone
    };
  }

  private async categorizeEmail(content: string): Promise<Record<string, number>> {
    const categories = {
      'referencia': 0,
      'contra-referencia': 0,
      'interconsulta': 0,
      'urgencia': 0,
      'seguimiento': 0,
      'laboratorio': 0,
      'otros': 0
    };

    // Análisis de palabras clave por categoría
    if (/referencia|remisión|envío/i.test(content)) {
      categories['referencia'] = 80;
    }
    
    if (/contra.?referencia|respuesta|informe/i.test(content)) {
      categories['contra-referencia'] = 80;
    }
    
    if (/interconsulta|consulta|valoración/i.test(content)) {
      categories['interconsulta'] = 75;
    }
    
    if (/urgencia|urgente|emergencia|crítico/i.test(content)) {
      categories['urgencia'] = 90;
    }
    
    if (/seguimiento|control|revisión/i.test(content)) {
      categories['seguimiento'] = 70;
    }
    
    if (/laboratorio|lab|examen|resultado/i.test(content)) {
      categories['laboratorio'] = 85;
    }

    // Normalizar probabilidades
    const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      Object.keys(categories).forEach(key => {
        categories[key] = (categories[key] / total) * 100;
      });
    } else {
      categories['otros'] = 100;
    }

    return categories;
  }

  private generateRecommendations(extractedData: ExtractedMedicalData, riskAssessment: RiskAssessment): string[] {
    const recommendations: string[] = [];

    // Recomendaciones basadas en riesgo
    if (riskAssessment.overallRisk === 'Alto') {
      recommendations.push('Priorizar atención médica inmediata');
      recommendations.push('Notificar al médico de turno');
    }

    // Recomendaciones basadas en datos críticos
    if (extractedData.critical.immediateCare) {
      recommendations.push('Activar protocolo de emergencia');
      recommendations.push('Preparar equipo de reanimación');
    }

    if (extractedData.critical.isolationRequired) {
      recommendations.push('Implementar medidas de aislamiento');
      recommendations.push('Usar equipo de protección personal');
    }

    // Recomendaciones basadas en datos del paciente
    if (extractedData.patient.allergies && extractedData.patient.allergies.length > 0) {
      recommendations.push('Verificar alergias antes de administrar medicamentos');
    }

    if (extractedData.medical.followUpRequired) {
      recommendations.push('Programar cita de seguimiento');
    }

    // Recomendaciones por defecto
    if (recommendations.length === 0) {
      recommendations.push('Proceder con protocolo estándar de atención');
      recommendations.push('Documentar en historia clínica');
    }

    return recommendations;
  }

  private detectFlags(extractedData: ExtractedMedicalData, riskAssessment: RiskAssessment, sentiment: SentimentAnalysis): AIFlag[] {
    const flags: AIFlag[] = [];

    // Flags críticos
    if (extractedData.critical.redFlags.length > 0) {
      flags.push({
        type: 'critical',
        category: 'medical',
        message: `Red flags detectadas: ${extractedData.critical.redFlags.join(', ')}`,
        severity: 10,
        actionRequired: true,
        autoResolvable: false
      });
    }

    // Flags de riesgo alto
    if (riskAssessment.overallRisk === 'Alto') {
      flags.push({
        type: 'warning',
        category: 'risk',
        message: 'Paciente de alto riesgo detectado',
        severity: 8,
        actionRequired: true,
        autoResolvable: false
      });
    }

    // Flags de urgencia
    if (sentiment.urgency > 70) {
      flags.push({
        type: 'warning',
        category: 'urgency',
        message: 'Comunicación urgente detectada',
        severity: 7,
        actionRequired: true,
        autoResolvable: false
      });
    }

    // Flags de datos incompletos
    if (!extractedData.patient.name || !extractedData.patient.id) {
      flags.push({
        type: 'info',
        category: 'data',
        message: 'Información del paciente incompleta',
        severity: 4,
        actionRequired: false,
        autoResolvable: true
      });
    }

    return flags;
  }

  private calculateConfidence(extractedData: ExtractedMedicalData, sentiment: SentimentAnalysis, categoryProbabilities: Record<string, number>): number {
    let confidence = 0;

    // Confianza basada en datos extraídos
    if (extractedData.patient.name) confidence += 15;
    if (extractedData.patient.id) confidence += 15;
    if (extractedData.patient.age) confidence += 10;
    if (extractedData.medical.primaryDiagnosis) confidence += 20;
    if (extractedData.institutional.referringDoctor) confidence += 10;
    if (extractedData.institutional.referringHospital) confidence += 10;

    // Confianza basada en categorización
    const maxCategoryProb = Math.max(...Object.values(categoryProbabilities));
    confidence += maxCategoryProb * 0.2;

    // Confianza basada en sentiment
    confidence += sentiment.confidence * 0.1;

    return Math.min(100, Math.round(confidence));
  }

  private updateMetrics(processingTime: number, confidence: number, flags: AIFlag[]): void {
    this.metrics.totalProcessed++;
    
    // Actualizar tiempo promedio de procesamiento
    this.metrics.averageProcessingTime = 
      (this.metrics.averageProcessingTime * (this.metrics.totalProcessed - 1) + processingTime) / 
      this.metrics.totalProcessed;

    // Actualizar score de precisión
    this.metrics.accuracyScore = 
      (this.metrics.accuracyScore * (this.metrics.totalProcessed - 1) + confidence) / 
      this.metrics.totalProcessed;

    // Contar casos críticos
    if (flags.some(flag => flag.type === 'critical')) {
      this.metrics.criticalCasesDetected++;
    }

    // Contar casos flaggeados para revisión
    if (confidence < this.config.alertThresholds.lowConfidence || flags.length > 0) {
      this.metrics.flaggedForReview++;
    }

    // Calcular tasa de éxito
    this.metrics.successRate = 
      ((this.metrics.totalProcessed - this.metrics.flaggedForReview) / this.metrics.totalProcessed) * 100;
  }

  private logProcessing(emailId: string, result: AIAnalysisResult): void {
    console.log(`[AI Processor] Email ${emailId} procesado:`, {
      confidence: result.confidence,
      processingTime: result.processingTime,
      flags: result.flags.length,
      criticalFindings: result.extractedData.critical.redFlags.length
    });
  }

  // === MÉTODOS PÚBLICOS ===

  async processAttachment(attachment: AttachmentData): Promise<AttachmentData['aiAnalysis']> {
    // Simular análisis de adjuntos con OCR y análisis médico
    const startTime = Date.now();
    
    try {
      // Simular OCR y extracción de texto
      const extractedText = await this.simulateOCR(attachment);
      
      // Análizar contenido médico del adjunto
      const medicalFindings = await this.analyzeMedicalDocument(extractedText, attachment.type);
      
      // Generar recomendaciones específicas
      const recommendations = this.generateAttachmentRecommendations(attachment.type, medicalFindings);
      
      // Calcular confianza del análisis
      const confidence = this.calculateAttachmentConfidence(extractedText, medicalFindings);

      return {
        extractedText,
        medicalFindings,
        recommendations,
        confidence
      };

    } catch (error) {
      console.error('Error procesando adjunto:', error);
      return {
        extractedText: 'Error en extracción de texto',
        medicalFindings: ['Error en análisis médico'],
        recommendations: ['Revisar manualmente'],
        confidence: 0
      };
    }
  }

  private async simulateOCR(attachment: AttachmentData): Promise<string> {
    // Simular extracción de texto basada en tipo de archivo
    const textTemplates: Record<AttachmentData['type'], string> = {
      'ECG': 'Electrocardiograma - Ritmo sinusal 75 lpm - QRS estrecho - Sin alteraciones agudas del ST',
      'Radiografía': 'Radiografía de tórax - Campos pulmonares claros - Silueta cardiaca normal - Sin consolidaciones',
      'Laboratorio': 'Hemograma completo: Leucocitos 8500, Hemoglobina 12.5, Plaquetas 250000 - Glucemia 95 mg/dl',
      'Historia Clínica': 'Paciente con antecedentes de HTA y DM - Consulta por dolor torácico - Examen físico normal',
      'Imagen Médica': 'TAC cerebral - Sin evidencia de lesiones agudas - Estructuras de línea media centradas',
      'Documento': 'Documento médico - Información cl��nica relevante extraída',
      'Otros': 'Contenido de archivo procesado mediante OCR'
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(textTemplates[attachment.type] || textTemplates['Otros']);
      }, Math.random() * 2000 + 500);
    });
  }

  private async analyzeMedicalDocument(text: string, type: AttachmentData['type']): Promise<string[]> {
    const findings: Record<AttachmentData['type'], string[]> = {
      'ECG': [
        'Ritmo sinusal normal',
        'Frecuencia cardíaca dentro de límites normales',
        'Sin evidencia de isquemia aguda'
      ],
      'Radiografía': [
        'Estructuras óseas íntegras',
        'Espacios articulares conservados',
        'Sin signos de fractura'
      ],
      'Laboratorio': [
        'Valores hemáticos dentro de parámetros normales',
        'Función renal conservada',
        'Perfil metabólico estable'
      ],
      'Historia Clínica': [
        'Antecedentes médicos documentados',
        'Evolución clínica favorable',
        'Plan de manejo establecido'
      ],
      'Imagen Médica': [
        'Estudio radiológico sin alteraciones significativas',
        'Anatomía normal preservada',
        'Sin lesiones evidentes'
      ],
      'Documento': [
        'Información médica relevante',
        'Documentación completa',
        'Datos clínicos verificables'
      ],
      'Otros': [
        'Contenido procesado correctamente',
        'Información extraída exitosamente'
      ]
    };

    return findings[type] || findings['Otros'];
  }

  private generateAttachmentRecommendations(type: AttachmentData['type'], findings: string[]): string[] {
    const recommendations: Record<AttachmentData['type'], string[]> = {
      'ECG': [
        'Correlacionar con clínica del paciente',
        'Continuar monitoreo cardiovascular',
        'Evaluar necesidad de estudios adicionales'
      ],
      'Radiografía': [
        'Correlacionar con examen físico',
        'Seguimiento según evolución clínica',
        'Considerar estudios complementarios si persisten síntomas'
      ],
      'Laboratorio': [
        'Interpretar en contexto clínico',
        'Repetir en caso de valores límite',
        'Seguimiento según protocolos institucionales'
      ],
      'Historia Clínica': [
        'Revisar antecedentes relevantes',
        'Actualizar plan de manejo',
        'Asegurar continuidad de atención'
      ],
      'Imagen Médica': [
        'Correlacionar con estudios previos',
        'Evaluación por especialista si indicado',
        'Seguimiento según hallazgos'
      ],
      'Documento': [
        'Archivar en expediente médico',
        'Compartir con equipo tratante',
        'Asegurar accesibilidad de información'
      ],
      'Otros': [
        'Revisar contenido detalladamente',
        'Clasificar según relevancia médica',
        'Integrar en historia clínica'
      ]
    };

    return recommendations[type] || recommendations['Otros'];
  }

  private calculateAttachmentConfidence(text: string, findings: string[]): number {
    let confidence = 50; // Base confidence
    
    // Incrementar por longitud del texto extraído
    confidence += Math.min(30, text.length / 10);
    
    // Incrementar por número de hallazgos
    confidence += findings.length * 5;
    
    // Incrementar por palabras médicas detectadas
    const medicalTerms = ['paciente', 'diagnóstico', 'tratamiento', 'examen', 'estudio', 'normal', 'alteración'];
    const foundTerms = medicalTerms.filter(term => text.toLowerCase().includes(term));
    confidence += foundTerms.length * 3;

    return Math.min(100, confidence);
  }

  getMetrics(): ProcessingMetrics {
    return { ...this.metrics };
  }

  getConfig(): AIConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<AIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  resetMetrics(): void {
    this.metrics = {
      totalProcessed: 0,
      successRate: 0,
      averageProcessingTime: 0,
      accuracyScore: 0,
      flaggedForReview: 0,
      criticalCasesDetected: 0
    };
  }
}

// === SINGLETON PARA USO GLOBAL ===
let aiProcessorInstance: AdvancedAIProcessor | null = null;

export function getAIProcessor(config?: Partial<AIConfig>): AdvancedAIProcessor {
  if (!aiProcessorInstance) {
    aiProcessorInstance = new AdvancedAIProcessor(config);
  }
  return aiProcessorInstance;
}

export function resetAIProcessor(): void {
  aiProcessorInstance = null;
}
