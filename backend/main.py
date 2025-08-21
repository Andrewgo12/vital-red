"""
VITAL RED - Gmail Integration Backend
Sistema de procesamiento masivo de correos médicos
"""

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import uvicorn
import os
from typing import List, Optional
from datetime import datetime, timedelta

from models.database import get_db
from models.email_models import EmailResponse, EmailDetail, AttachmentResponse
from services.gmail_service import GmailService
from services.email_processor import EmailProcessor
from config.settings import settings

# Inicializar servicios
gmail_service = GmailService()
email_processor = EmailProcessor()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestión del ciclo de vida de la aplicación"""
    # Startup
    print("🏥 Iniciando VITAL RED Gmail Integration...")
    
    # Verificar conexión a base de datos
    try:
        from models.database import engine
        print("✅ Conexión a MySQL establecida")
    except Exception as e:
        print(f"❌ Error conectando a MySQL: {e}")
    
    # Inicializar Gmail API
    try:
        await gmail_service.initialize()
        print("✅ Gmail API inicializada")
    except Exception as e:
        print(f"❌ Error inicializando Gmail API: {e}")
    
    yield
    
    # Shutdown
    print("🔄 Cerrando servicios...")

app = FastAPI(
    title="VITAL RED - Gmail Integration API",
    description="Sistema de procesamiento masivo de correos médicos para referencias y contra-referencias hospitalarias",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configurar CORS para el frontend Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Health"])
async def root():
    """Endpoint de salud del servicio"""
    return {
        "service": "VITAL RED Gmail Integration",
        "status": "active",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Verificación completa del estado del sistema"""
    health_status = {
        "database": "checking",
        "gmail_api": "checking",
        "processor": "checking"
    }
    
    try:
        # Verificar base de datos
        db = next(get_db())
        health_status["database"] = "connected"
        
        # Verificar Gmail API
        if gmail_service.is_connected():
            health_status["gmail_api"] = "connected"
        else:
            health_status["gmail_api"] = "disconnected"
            
        # Verificar procesador
        health_status["processor"] = "ready"
        
    except Exception as e:
        health_status["error"] = str(e)
    
    return health_status

# ===============================
# ENDPOINTS DE CORREOS MÉDICOS
# ===============================

@app.get("/emails", response_model=List[EmailResponse], tags=["Emails"])
async def get_emails(
    skip: int = Query(0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(50, ge=1, le=100, description="Límite de registros"),
    search: Optional[str] = Query(None, description="Búsqueda por asunto o remitente"),
    sender: Optional[str] = Query(None, description="Filtrar por remitente"),
    date_from: Optional[datetime] = Query(None, description="Fecha desde"),
    date_to: Optional[datetime] = Query(None, description="Fecha hasta"),
    specialty: Optional[str] = Query(None, description="Especialidad médica"),
    priority: Optional[str] = Query(None, description="Prioridad del caso"),
    has_attachments: Optional[bool] = Query(None, description="Con adjuntos"),
    db = Depends(get_db)
):
    """
    Obtener lista paginada de correos médicos procesados
    Soporta filtros avanzados para referencias hospitalarias
    """
    try:
        emails = await email_processor.get_emails_paginated(
            db=db,
            skip=skip,
            limit=limit,
            search=search,
            sender=sender,
            date_from=date_from,
            date_to=date_to,
            specialty=specialty,
            priority=priority,
            has_attachments=has_attachments
        )
        return emails
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving emails: {str(e)}")

@app.get("/emails/{email_id}", response_model=EmailDetail, tags=["Emails"])
async def get_email_detail(email_id: str, db = Depends(get_db)):
    """
    Obtener detalle completo de un correo médico específico
    Incluye contenido completo, adjuntos y metadatos
    """
    try:
        email = await email_processor.get_email_by_id(db, email_id)
        if not email:
            raise HTTPException(status_code=404, detail="Email not found")
        return email
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving email: {str(e)}")

@app.get("/emails/{email_id}/attachments", response_model=List[AttachmentResponse], tags=["Attachments"])
async def get_email_attachments(email_id: str, db = Depends(get_db)):
    """
    Obtener lista de adjuntos de un correo médico
    """
    try:
        attachments = await email_processor.get_attachments(db, email_id)
        return attachments
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving attachments: {str(e)}")

@app.get("/attachments/{attachment_id}/download", tags=["Attachments"])
async def download_attachment(attachment_id: str, db = Depends(get_db)):
    """
    Descargar adjunto médico (PDF, imágenes, documentos)
    """
    try:
        file_path = await email_processor.get_attachment_file_path(db, attachment_id)
        if not file_path or not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Attachment not found")
        
        return FileResponse(
            path=file_path,
            filename=os.path.basename(file_path),
            media_type='application/octet-stream'
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading attachment: {str(e)}")

# ===============================
# ENDPOINTS DE SINCRONIZACIÓN
# ===============================

@app.post("/sync/start", tags=["Sync"])
async def start_email_sync():
    """
    Iniciar sincronización manual de correos desde Gmail
    Procesa correos nuevos y actualiza la base de datos
    """
    try:
        result = await email_processor.sync_emails()
        return {
            "status": "success",
            "message": "Email synchronization started",
            "processed_count": result.get("processed", 0),
            "new_emails": result.get("new_emails", 0),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting sync: {str(e)}")

@app.get("/sync/status", tags=["Sync"])
async def get_sync_status():
    """
    Obtener estado actual del proceso de sincronización
    """
    try:
        status = await email_processor.get_sync_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting sync status: {str(e)}")

# ===============================
# ENDPOINTS DE ESTADÍSTICAS
# ===============================

@app.get("/stats/dashboard", tags=["Statistics"])
async def get_dashboard_stats(db = Depends(get_db)):
    """
    Estadísticas del dashboard para correos médicos
    """
    try:
        stats = await email_processor.get_dashboard_stats(db)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving stats: {str(e)}")

@app.get("/stats/daily", tags=["Statistics"])
async def get_daily_stats(
    days: int = Query(7, ge=1, le=30, description="Número de días"),
    db = Depends(get_db)
):
    """
    Estadísticas diarias de procesamiento de correos
    """
    try:
        stats = await email_processor.get_daily_stats(db, days)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving daily stats: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
