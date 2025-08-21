"""
Configuración del sistema VITAL RED Gmail Integration
"""

from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path

class Settings(BaseSettings):
    """Configuración del sistema"""
    
    # === CONFIGURACIÓN DE LA APLICACIÓN ===
    app_name: str = "VITAL RED Gmail Integration"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # === CONFIGURACIÓN DE BASE DE DATOS MYSQL ===
    mysql_host: str = "localhost"
    mysql_port: int = 3306
    mysql_user: str = "vitalred_user"
    mysql_password: str = ""
    mysql_database: str = "vitalred_gmail"
    
    @property
    def mysql_url(self) -> str:
        return f"mysql+aiomysql://{self.mysql_user}:{self.mysql_password}@{self.mysql_host}:{self.mysql_port}/{self.mysql_database}"
    
    # === CONFIGURACIÓN DE GMAIL API ===
    gmail_credentials_file: str = "credentials.json"
    gmail_token_file: str = "token.json"
    gmail_scopes: List[str] = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify'
    ]
    
    # Configuración de procesamiento masivo
    gmail_batch_size: int = 50  # Correos por lote
    gmail_max_daily_emails: int = 2500  # Máximo diario
    gmail_query_filter: str = "in:inbox"  # Filtro Gmail
    
    # === CONFIGURACIÓN DE ARCHIVOS Y ADJUNTOS ===
    attachments_base_path: str = "./storage/attachments"
    backup_base_path: str = "./storage/backups"
    logs_base_path: str = "./storage/logs"
    
    # Tipos de archivo permitidos para adjuntos médicos
    allowed_attachment_types: List[str] = [
        "application/pdf",          # PDFs
        "image/jpeg",              # Imágenes JPEG
        "image/png",               # Imágenes PNG
        "image/tiff",              # Imágenes TIFF (comunes en medicina)
        "application/msword",      # Documentos Word
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # DOCX
        "text/plain",              # Archivos de texto
        "application/zip",         # Archivos comprimidos
    ]
    
    # Tamaño máximo de adjuntos (en bytes) - 50MB
    max_attachment_size: int = 50 * 1024 * 1024
    
    # === CONFIGURACIÓN DE SEGURIDAD ===
    secret_key: str = "your-secret-key-here-change-in-production"
    access_token_expire_minutes: int = 30
    
    # === CONFIGURACIÓN DE CORREOS MÉDICOS ===
    # Palabras clave para identificar correos médicos relevantes
    medical_keywords: List[str] = [
        "referencia", "contra-referencia", "paciente", "médico",
        "hospital", "clínica", "diagnóstico", "tratamiento",
        "urgencia", "emergencia", "consulta", "interconsulta",
        "historia clínica", "examen", "laboratorio", "radiografía"
    ]
    
    # Especialidades médicas reconocidas
    medical_specialties: List[str] = [
        "Cardiología", "Neurología", "Pediatría", "Ginecología",
        "Traumatología", "Oncología", "Dermatología", "Psiquiatría",
        "Oftalmología", "Otorrinolaringología", "Urología",
        "Gastroenterología", "Endocrinología", "Neumología",
        "Medicina Interna", "Cirugía General", "Anestesiología",
        "Radiología", "Patología", "Medicina de Emergencia"
    ]
    
    # === CONFIGURACIÓN DE PROCESAMIENTO ===
    # Intervalo de sincronización automática (en minutos)
    sync_interval_minutes: int = 15
    
    # Número de días para retener correos procesados
    email_retention_days: int = 365
    
    # Configuración de reintentos para errores
    max_retries: int = 3
    retry_delay_seconds: int = 5
    
    # === CONFIGURACIÓN DE LOGS ===
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    log_file_max_size: int = 10 * 1024 * 1024  # 10MB
    log_backup_count: int = 5
    
    # === CONFIGURACIÓN DE FRONTEND ===
    frontend_url: str = "http://localhost:3000"
    api_cors_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Crear directorios necesarios
        self._create_directories()
    
    def _create_directories(self):
        """Crear directorios necesarios para el funcionamiento"""
        directories = [
            self.attachments_base_path,
            self.backup_base_path, 
            self.logs_base_path
        ]
        
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

# Instancia global de configuración
settings = Settings()

# === CONFIGURACIÓN DE LOGGING ===
import logging
import logging.handlers
from pathlib import Path

def setup_logging():
    """Configurar el sistema de logging"""
    
    # Crear directorio de logs si no existe
    log_dir = Path(settings.logs_base_path)
    log_dir.mkdir(parents=True, exist_ok=True)
    
    # Configurar formato
    formatter = logging.Formatter(settings.log_format)
    
    # Logger principal
    logger = logging.getLogger("vitalred_gmail")
    logger.setLevel(getattr(logging, settings.log_level.upper()))
    
    # Handler para archivo con rotación
    file_handler = logging.handlers.RotatingFileHandler(
        filename=log_dir / "vitalred_gmail.log",
        maxBytes=settings.log_file_max_size,
        backupCount=settings.log_backup_count,
        encoding="utf-8"
    )
    file_handler.setFormatter(formatter)
    
    # Handler para consola
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    
    # Agregar handlers
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

# Configurar logging
logger = setup_logging()
