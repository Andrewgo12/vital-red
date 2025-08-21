"""
Modelos Pydantic para respuestas de API - VITAL RED Gmail Integration
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

# === ENUMS ===

class EmailPriority(str, Enum):
    ALTA = "Alta"
    MEDIA = "Media"
    BAJA = "Baja"

class EmailStatus(str, Enum):
    PROCESSED = "processed"
    PROCESSING = "processing"
    ERROR = "error"
    PENDING = "pending"

class MedicalCategory(str, Enum):
    REFERENCIA = "referencia"
    CONTRA_REFERENCIA = "contra-referencia"
    INTERCONSULTA = "interconsulta"
    URGENCIA = "urgencia"
    SEGUIMIENTO = "seguimiento"
    LABORATORIO = "laboratorio"
    OTROS = "otros"

class AttachmentType(str, Enum):
    ECG = "ECG"
    RADIOGRAFIA = "Radiografía"
    LABORATORIO = "Laboratorio"
    HISTORIA_CLINICA = "Historia Clínica"
    IMAGEN_MEDICA = "Imagen Médica"
    DOCUMENTO = "Documento"
    OTROS = "Otros"

# === MODELOS BASE ===

class PatientInfo(BaseModel):
    """Información del paciente extraída del correo"""
    name: Optional[str] = None
    id: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None

class HospitalInfo(BaseModel):
    """Información hospitalaria"""
    referring_hospital: Optional[str] = None
    referring_doctor: Optional[str] = None
    receiving_hospital: Optional[str] = None

class EmailMetadata(BaseModel):
    """Metadatos del correo"""
    labels: List[str] = []
    keywords_found: List[str] = []
    confidence_score: int = Field(default=0, ge=0, le=100)
    processing_time_ms: Optional[int] = None

# === MODELOS DE ADJUNTOS ===

class AttachmentBase(BaseModel):
    """Modelo base para adjuntos"""
    id: str
    filename: str
    content_type: str
    file_size: int
    attachment_type: Optional[AttachmentType] = None
    medical_relevance: Optional[str] = None

class AttachmentResponse(AttachmentBase):
    """Respuesta de adjunto para listados"""
    email_id: str
    file_hash: str
    processed_status: str
    keywords_found: List[str] = []
    created_at: datetime
    
    class Config:
        from_attributes = True

class AttachmentDetail(AttachmentResponse):
    """Detalle completo de adjunto"""
    text_content: Optional[str] = None
    metadata: Dict[str, Any] = {}
    download_url: str
    
    @validator('download_url', pre=True, always=True)
    def set_download_url(cls, v, values):
        if 'id' in values:
            return f"/attachments/{values['id']}/download"
        return v

# === MODELOS DE CORREOS ===

class EmailBase(BaseModel):
    """Modelo base para correos"""
    id: str
    subject: str
    sender_email: str
    sender_name: Optional[str] = None
    received_at: datetime
    medical_category: Optional[MedicalCategory] = None
    specialty: Optional[str] = None
    priority: EmailPriority = EmailPriority.MEDIA

class EmailResponse(EmailBase):
    """Respuesta de correo para listados"""
    snippet: Optional[str] = None
    patient: PatientInfo
    hospital: HospitalInfo
    has_attachments: bool = False
    attachment_count: int = 0
    processing_status: EmailStatus
    urgency_level: Optional[str] = None
    processed_at: datetime
    
    @validator('patient', pre=True, always=True)
    def set_patient_info(cls, v, values):
        if isinstance(v, dict):
            return v
        # Extraer información del paciente desde los valores del email
        return PatientInfo(
            name=values.get('patient_name'),
            id=values.get('patient_id'),
            age=values.get('patient_age'),
            gender=values.get('patient_gender')
        )
    
    @validator('hospital', pre=True, always=True)
    def set_hospital_info(cls, v, values):
        if isinstance(v, dict):
            return v
        return HospitalInfo(
            referring_hospital=values.get('referring_hospital'),
            referring_doctor=values.get('referring_doctor'),
            receiving_hospital=values.get('receiving_hospital')
        )
    
    class Config:
        from_attributes = True

class EmailDetail(EmailResponse):
    """Detalle completo del correo"""
    body_text: Optional[str] = None
    body_html: Optional[str] = None
    recipient_email: str
    recipient_name: Optional[str] = None
    thread_id: Optional[str] = None
    
    # Información adicional
    attachments: List[AttachmentResponse] = []
    metadata: EmailMetadata
    
    # Headers importantes
    headers: Dict[str, Any] = {}
    
    @validator('metadata', pre=True, always=True)
    def set_metadata(cls, v, values):
        if isinstance(v, dict):
            return EmailMetadata(**v)
        
        # Crear metadata desde los campos del email
        keywords = []
        if 'keywords_found' in values and values['keywords_found']:
            try:
                import json
                keywords = json.loads(values['keywords_found'])
            except:
                keywords = []
        
        return EmailMetadata(
            keywords_found=keywords,
            confidence_score=values.get('confidence_score', 0)
        )

# === MODELOS DE ESTADÍSTICAS ===

class DashboardStats(BaseModel):
    """Estadísticas del dashboard"""
    total_emails: int = 0
    emails_today: int = 0
    emails_pending: int = 0
    emails_processed: int = 0
    
    # Por prioridad
    high_priority: int = 0
    medium_priority: int = 0
    low_priority: int = 0
    
    # Por especialidad
    specialties_stats: Dict[str, int] = {}
    
    # Por hospital
    hospitals_stats: Dict[str, int] = {}
    
    # Adjuntos
    total_attachments: int = 0
    attachments_today: int = 0
    
    # Última sincronización
    last_sync_time: Optional[datetime] = None
    sync_status: str = "unknown"

class DailyStats(BaseModel):
    """Estadísticas diarias"""
    date: str
    emails_received: int = 0
    emails_processed: int = 0
    attachments_processed: int = 0
    average_processing_time: Optional[float] = None
    
    # Por categoría médica
    by_category: Dict[str, int] = {}
    
    # Por especialidad
    by_specialty: Dict[str, int] = {}

class SyncStatusResponse(BaseModel):
    """Estado de sincronización"""
    is_running: bool = False
    last_sync_time: Optional[datetime] = None
    emails_processed: int = 0
    emails_new: int = 0
    errors_count: int = 0
    status: str = "idle"
    progress_percentage: float = 0.0
    estimated_time_remaining: Optional[str] = None

# === MODELOS DE FILTROS ===

class EmailFilters(BaseModel):
    """Filtros para búsqueda de correos"""
    search: Optional[str] = None
    sender: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    specialty: Optional[str] = None
    priority: Optional[EmailPriority] = None
    medical_category: Optional[MedicalCategory] = None
    has_attachments: Optional[bool] = None
    referring_hospital: Optional[str] = None
    patient_id: Optional[str] = None
    
    # Paginación
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=50, ge=1, le=100)

# === MODELOS DE RESPUESTA ===

class PaginatedResponse(BaseModel):
    """Respuesta paginada genérica"""
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int
    has_next: bool
    has_prev: bool

class EmailListResponse(PaginatedResponse):
    """Respuesta paginada de correos"""
    items: List[EmailResponse]

class ApiResponse(BaseModel):
    """Respuesta estándar de API"""
    success: bool = True
    message: str = ""
    data: Optional[Any] = None
    errors: List[str] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ErrorResponse(BaseModel):
    """Respuesta de error"""
    success: bool = False
    message: str
    error_code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# === MODELOS DE PROCESAMIENTO ===

class ProcessingResult(BaseModel):
    """Resultado de procesamiento"""
    email_id: str
    success: bool
    message: str
    processing_time_ms: int
    attachments_processed: int = 0
    errors: List[str] = []

class BatchProcessingResult(BaseModel):
    """Resultado de procesamiento en lote"""
    total_processed: int
    successful: int
    failed: int
    processing_time_ms: int
    results: List[ProcessingResult] = []
    
class SyncResult(BaseModel):
    """Resultado de sincronización"""
    started_at: datetime
    completed_at: Optional[datetime] = None
    emails_processed: int = 0
    new_emails: int = 0
    updated_emails: int = 0
    errors: int = 0
    status: str = "running"
    message: str = ""
