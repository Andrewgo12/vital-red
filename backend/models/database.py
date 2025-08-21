"""
Modelos de base de datos MySQL para VITAL RED Gmail Integration
"""

from sqlalchemy import create_engine, Column, String, Text, DateTime, Integer, Boolean, LargeBinary, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.dialects.mysql import LONGTEXT, MEDIUMBLOB
from datetime import datetime
from typing import Generator
import json

from config.settings import settings

# === CONFIGURACIÓN DE BASE DE DATOS ===
engine = create_engine(
    settings.mysql_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_recycle=3600,  # Reciclar conexiones cada hora
    connect_args={
        "charset": "utf8mb4",
        "collation": "utf8mb4_unicode_ci"
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# === MODELOS DE DATOS ===

class Email(Base):
    """
    Modelo principal para correos médicos procesados
    """
    __tablename__ = "emails"
    
    # Identificadores
    id = Column(String(255), primary_key=True, index=True)  # Gmail message ID
    thread_id = Column(String(255), index=True)  # Gmail thread ID
    
    # Metadatos del correo
    subject = Column(Text, nullable=False)
    sender_email = Column(String(255), nullable=False, index=True)
    sender_name = Column(String(255))
    recipient_email = Column(String(255), nullable=False)
    recipient_name = Column(String(255))
    
    # Fechas
    received_at = Column(DateTime, nullable=False, index=True)
    processed_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Contenido
    body_text = Column(LONGTEXT)  # Texto plano
    body_html = Column(LONGTEXT)  # HTML
    snippet = Column(Text)  # Resumen corto del correo
    
    # Clasificación médica
    medical_category = Column(String(100), index=True)  # referencia, contra-referencia, etc.
    specialty = Column(String(100), index=True)  # Especialidad médica
    priority = Column(String(50), default="Media", index=True)  # Alta, Media, Baja
    urgency_level = Column(String(50), index=True)  # Crítica, Moderada, Normal
    
    # Información del paciente (extraída del correo)
    patient_name = Column(String(255))
    patient_id = Column(String(100), index=True)
    patient_age = Column(Integer)
    patient_gender = Column(String(20))
    
    # Hospital/Institución
    referring_hospital = Column(String(255), index=True)
    referring_doctor = Column(String(255))
    receiving_hospital = Column(String(255))
    
    # Estado de procesamiento
    processing_status = Column(String(50), default="processed", index=True)
    has_attachments = Column(Boolean, default=False, index=True)
    attachment_count = Column(Integer, default=0)
    
    # Metadatos adicionales
    labels = Column(Text)  # Labels de Gmail (JSON)
    headers = Column(LONGTEXT)  # Headers completos (JSON)
    
    # Análisis de contenido
    keywords_found = Column(Text)  # Palabras clave médicas encontradas (JSON)
    confidence_score = Column(Integer, default=0)  # Puntuación de confianza (0-100)
    
    # Auditoria
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    attachments = relationship("Attachment", back_populates="email", cascade="all, delete-orphan")
    
    # Índices
    __table_args__ = (
        Index('idx_email_medical', 'medical_category', 'specialty', 'priority'),
        Index('idx_email_patient', 'patient_name', 'patient_id'),
        Index('idx_email_hospital', 'referring_hospital', 'receiving_hospital'),
        Index('idx_email_date_status', 'received_at', 'processing_status'),
    )

class Attachment(Base):
    """
    Modelo para adjuntos médicos (PDFs, imágenes, documentos)
    """
    __tablename__ = "attachments"
    
    # Identificadores
    id = Column(String(255), primary_key=True, index=True)
    email_id = Column(String(255), ForeignKey("emails.id", ondelete="CASCADE"), nullable=False)
    
    # Información del archivo
    filename = Column(String(255), nullable=False)
    content_type = Column(String(100), nullable=False, index=True)
    file_size = Column(Integer, nullable=False)
    
    # Almacenamiento
    file_path = Column(String(500))  # Ruta en disco
    file_hash = Column(String(64), index=True)  # SHA-256 hash
    
    # Clasificación médica del adjunto
    attachment_type = Column(String(100), index=True)  # ECG, Radiografía, Lab, etc.
    medical_relevance = Column(String(50), default="Unknown")  # High, Medium, Low, Unknown
    
    # Metadatos extraídos
    text_content = Column(LONGTEXT)  # Texto extraído (OCR o PDF)
    metadata = Column(Text)  # Metadatos adicionales (JSON)
    
    # Análisis de contenido
    keywords_found = Column(Text)  # Palabras clave encontradas (JSON)
    processed_status = Column(String(50), default="pending", index=True)
    
    # Auditoria
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    email = relationship("Email", back_populates="attachments")
    
    # Índices
    __table_args__ = (
        Index('idx_attachment_type', 'content_type', 'attachment_type'),
        Index('idx_attachment_email', 'email_id', 'processed_status'),
    )

class ProcessingLog(Base):
    """
    Log de procesamiento de correos para auditoria y debugging
    """
    __tablename__ = "processing_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Información del proceso
    process_type = Column(String(100), nullable=False, index=True)  # sync, process_email, extract_attachment
    email_id = Column(String(255), index=True)
    
    # Estado
    status = Column(String(50), nullable=False, index=True)  # success, error, warning
    message = Column(Text)
    error_details = Column(LONGTEXT)
    
    # Métricas
    processing_time_ms = Column(Integer)
    memory_usage_mb = Column(Integer)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Índices
    __table_args__ = (
        Index('idx_log_process', 'process_type', 'status', 'created_at'),
    )

class SyncStatus(Base):
    """
    Estado de sincronización con Gmail
    """
    __tablename__ = "sync_status"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Información de sincronización
    sync_type = Column(String(50), nullable=False)  # manual, automatic
    started_at = Column(DateTime, nullable=False)
    completed_at = Column(DateTime)
    
    # Estadísticas
    emails_processed = Column(Integer, default=0)
    emails_new = Column(Integer, default=0)
    emails_updated = Column(Integer, default=0)
    emails_errors = Column(Integer, default=0)
    attachments_processed = Column(Integer, default=0)
    
    # Estado
    status = Column(String(50), nullable=False, index=True)  # running, completed, error
    error_message = Column(Text)
    
    # Último mensaje procesado
    last_processed_message_id = Column(String(255))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)

class SystemConfig(Base):
    """
    Configuración del sistema
    """
    __tablename__ = "system_config"
    
    key = Column(String(100), primary_key=True)
    value = Column(Text, nullable=False)
    description = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# === FUNCIONES DE BASE DE DATOS ===

def get_db() -> Generator[Session, None, None]:
    """Obtener sesión de base de datos"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_database():
    """Inicializar base de datos y crear tablas"""
    try:
        # Crear todas las tablas
        Base.metadata.create_all(bind=engine)
        
        # Insertar configuración inicial
        db = SessionLocal()
        try:
            # Verificar si ya existe configuración
            existing_config = db.query(SystemConfig).first()
            if not existing_config:
                initial_configs = [
                    SystemConfig(
                        key="last_sync_time",
                        value="1970-01-01T00:00:00Z",
                        description="Última sincronización exitosa con Gmail"
                    ),
                    SystemConfig(
                        key="total_emails_processed",
                        value="0",
                        description="Total de correos procesados"
                    ),
                    SystemConfig(
                        key="system_status",
                        value="active",
                        description="Estado general del sistema"
                    )
                ]
                
                for config in initial_configs:
                    db.add(config)
                
                db.commit()
                print("✅ Configuración inicial de base de datos creada")
            else:
                print("✅ Base de datos ya configurada")
                
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Error inicializando base de datos: {e}")
        raise

def get_system_config(key: str, default_value: str = None) -> str:
    """Obtener valor de configuración del sistema"""
    db = SessionLocal()
    try:
        config = db.query(SystemConfig).filter(SystemConfig.key == key).first()
        return config.value if config else default_value
    finally:
        db.close()

def set_system_config(key: str, value: str, description: str = None):
    """Establecer valor de configuración del sistema"""
    db = SessionLocal()
    try:
        config = db.query(SystemConfig).filter(SystemConfig.key == key).first()
        if config:
            config.value = value
            config.updated_at = datetime.utcnow()
            if description:
                config.description = description
        else:
            config = SystemConfig(key=key, value=value, description=description)
            db.add(config)
        
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    # Ejecutar inicialización si se ejecuta directamente
    init_database()
