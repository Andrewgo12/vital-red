"""
Endpoints API adicionales para integración completa con frontend VITAL RED
"""

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, WebSocket
from fastapi.responses import FileResponse, StreamingResponse
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import asyncio
from sqlalchemy.orm import Session

from models.database import get_db
from models.auth_models import User
from models.email_models import EmailResponse, EmailDetail, AttachmentResponse
from auth.auth_service import get_current_user, require_admin, require_medico
from services.cache_service import cache_service, cached
from services.notification_service import notification_service, websocket_endpoint
from services.gmail_service import GmailService
from services.email_processor import EmailProcessor

# Crear router principal
router = APIRouter(prefix="/api/v1", tags=["API v1"])

# Servicios
gmail_service = GmailService()
email_processor = EmailProcessor()

# ===============================
# ENDPOINTS DE AUTENTICACIÓN
# ===============================

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

@auth_router.post("/login")
async def login(credentials: dict, db: Session = Depends(get_db)):
    """Autenticar usuario y generar token"""
    from auth.auth_service import auth_service
    
    username = credentials.get("username")
    password = credentials.get("password")
    
    if not username or not password:
        raise HTTPException(
            status_code=400,
            detail="Username y password son requeridos"
        )
    
    user = auth_service.authenticate_user(username, password, db)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Credenciales inválidas"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Cuenta desactivada"
        )
    
    # Crear token de acceso
    access_token = auth_service.create_access_token(
        data={"sub": user.id, "role": user.role.value}
    )
    
    # Crear sesión
    session = auth_service.create_session(user.id, access_token, db)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.value,
            "is_active": user.is_active
        }
    }

@auth_router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cerrar sesión y revocar token"""
    # Revocar sesión actual
    # Esto requeriría access al token actual, implementar según necesidades
    return {"message": "Sesión cerrada exitosamente"}

@auth_router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Obtener información del usuario actual"""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role.value,
        "specialty": current_user.specialty,
        "hospital": current_user.hospital,
        "is_active": current_user.is_active,
        "last_login_at": current_user.last_login_at,
        "created_at": current_user.created_at
    }

# ===============================
# ENDPOINTS DE CORREOS MÉDICOS AVANZADOS
# ===============================

emails_router = APIRouter(prefix="/emails", tags=["Medical Emails"])

@emails_router.get("/dashboard-summary")
@cached(ttl=300, key_prefix="email_dashboard")
async def get_dashboard_summary(
    current_user: User = Depends(require_medico),
    db: Session = Depends(get_db)
):
    """Resumen del dashboard de correos médicos"""
    
    # Verificar caché primero
    cached_summary = await cache_service.get_cached_dashboard_stats()
    if cached_summary:
        return cached_summary
    
    summary = await email_processor.get_dashboard_stats(db)
    
    # Cachear resultado
    await cache_service.cache_dashboard_stats(summary)
    
    return summary

@emails_router.get("/search")
async def search_emails(
    q: str = Query(..., min_length=3, description="Consulta de búsqueda"),
    specialty: Optional[str] = Query(None, description="Filtrar por especialidad"),
    priority: Optional[str] = Query(None, description="Filtrar por prioridad"),
    date_from: Optional[datetime] = Query(None, description="Fecha desde"),
    date_to: Optional[datetime] = Query(None, description="Fecha hasta"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_medico),
    db: Session = Depends(get_db)
):
    """Búsqueda avanzada de correos médicos"""
    
    filters = {
        "search": q,
        "specialty": specialty,
        "priority": priority,
        "date_from": date_from.isoformat() if date_from else None,
        "date_to": date_to.isoformat() if date_to else None,
        "skip": skip,
        "limit": limit
    }
    
    # Verificar caché
    cached_results = await cache_service.get_cached_search_results(q, filters)
    if cached_results:
        return cached_results
    
    # Realizar búsqueda
    results = await email_processor.search_emails(
        db=db,
        query=q,
        specialty=specialty,
        priority=priority,
        date_from=date_from,
        date_to=date_to,
        skip=skip,
        limit=limit
    )
    
    # Cachear resultados
    await cache_service.cache_search_results(q, filters, results)
    
    return results

@emails_router.get("/statistics/daily")
async def get_daily_statistics(
    days: int = Query(7, ge=1, le=30, description="Número de días"),
    current_user: User = Depends(require_medico),
    db: Session = Depends(get_db)
):
    """Estadísticas diarias de correos médicos"""
    
    stats = []
    
    for i in range(days):
        date = datetime.now() - timedelta(days=i)
        date_str = date.strftime("%Y-%m-%d")
        
        # Verificar caché
        cached_stats = await cache_service.get_cached_daily_stats(date_str)
        if cached_stats:
            stats.append(cached_stats)
        else:
            daily_stats = await email_processor.get_daily_stats(db, date)
            await cache_service.cache_daily_stats(date_str, daily_stats)
            stats.append(daily_stats)
    
    return {"statistics": sorted(stats, key=lambda x: x["date"])}

@emails_router.post("/{email_id}/mark-processed")
async def mark_email_processed(
    email_id: str,
    processing_notes: Optional[str] = None,
    current_user: User = Depends(require_medico),
    db: Session = Depends(get_db)
):
    """Marcar correo como procesado por un médico"""
    
    result = await email_processor.mark_email_processed(
        db=db,
        email_id=email_id,
        processed_by=current_user.id,
        notes=processing_notes
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Email not found")
    
    # Invalidar caché
    await cache_service.invalidate_email_cache(email_id)
    
    # Notificar a administradores
    await notification_service.notify_role(
        role="admin",
        notification_type="email_processed",
        title="Correo Procesado",
        message=f"El Dr. {current_user.full_name} procesó un correo médico",
        data={"email_id": email_id, "processed_by": current_user.full_name}
    )
    
    return {"message": "Email marcado como procesado", "email_id": email_id}

# ===============================
# ENDPOINTS DE ADJUNTOS
# ===============================

attachments_router = APIRouter(prefix="/attachments", tags=["Attachments"])

@attachments_router.get("/{attachment_id}/preview")
async def preview_attachment(
    attachment_id: str,
    current_user: User = Depends(require_medico),
    db: Session = Depends(get_db)
):
    """Vista previa de adjunto médico"""
    
    attachment = await email_processor.get_attachment_preview(db, attachment_id)
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    return attachment

@attachments_router.post("/{attachment_id}/analyze")
async def analyze_attachment(
    attachment_id: str,
    analysis_type: str = Query("auto", description="Tipo de análisis"),
    current_user: User = Depends(require_medico),
    db: Session = Depends(get_db)
):
    """Analizar adjunto médico con AI/OCR"""
    
    result = await email_processor.analyze_attachment(
        db=db,
        attachment_id=attachment_id,
        analysis_type=analysis_type
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    return result

# ===============================
# ENDPOINTS DE SINCRONIZACIÓN
# ===============================

sync_router = APIRouter(prefix="/sync", tags=["Synchronization"])

@sync_router.post("/manual")
async def trigger_manual_sync(
    force: bool = Query(False, description="Forzar sincronización completa"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Iniciar sincronización manual de Gmail"""
    
    try:
        # Iniciar sincronización en segundo plano
        task = asyncio.create_task(
            email_processor.sync_emails(force_full=force)
        )
        
        # Notificar inicio
        await notification_service.notify_sync_status(
            status="started",
            details={"started_by": current_user.full_name, "force": force}
        )
        
        return {
            "message": "Sincronización iniciada",
            "task_id": str(id(task)),
            "force": force
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error iniciando sincronización: {str(e)}"
        )

@sync_router.get("/history")
async def get_sync_history(
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Historial de sincronizaciones"""
    
    history = await email_processor.get_sync_history(db, limit)
    return {"history": history}

# ===============================
# ENDPOINTS DE NOTIFICACIONES
# ===============================

notifications_router = APIRouter(prefix="/notifications", tags=["Notifications"])

@notifications_router.get("/")
async def get_user_notifications(
    limit: int = Query(50, ge=1, le=100),
    unread_only: bool = Query(False),
    current_user: User = Depends(get_current_user)
):
    """Obtener notificaciones del usuario"""
    
    notifications = await notification_service.get_user_notifications(
        user_id=current_user.id,
        limit=limit,
        unread_only=unread_only
    )
    
    return {"notifications": notifications}

@notifications_router.post("/{notification_id}/mark-read")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user)
):
    """Marcar notificación como leída"""
    
    await notification_service.mark_notification_read(
        user_id=current_user.id,
        notification_id=notification_id
    )
    
    return {"message": "Notification marked as read"}

@notifications_router.websocket("/ws")
async def websocket_notifications(
    websocket: WebSocket,
    current_user: User = Depends(get_current_user)
):
    """WebSocket para notificaciones en tiempo real"""
    await websocket_endpoint(websocket, current_user)

# ===============================
# ENDPOINTS ADMINISTRATIVOS
# ===============================

admin_router = APIRouter(prefix="/admin", tags=["Administration"])

@admin_router.get("/system-status")
async def get_system_status(current_user: User = Depends(require_admin)):
    """Estado general del sistema"""
    
    # Estado de servicios
    gmail_status = await gmail_service.health_check()
    cache_status = await cache_service.health_check()
    
    # Usuarios conectados
    connected_users = notification_service.connection_manager.get_connected_users()
    
    return {
        "system": {
            "status": "operational",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        },
        "services": {
            "gmail": gmail_status,
            "cache": cache_status,
            "database": {"status": "connected"}  # Implementar check de DB
        },
        "users": {
            "connected": len(connected_users),
            "details": connected_users
        }
    }

@admin_router.get("/metrics")
async def get_system_metrics(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Métricas del sistema"""
    
    metrics = await email_processor.get_system_metrics(db)
    return metrics

@admin_router.post("/cache/clear")
async def clear_system_cache(
    pattern: Optional[str] = Query(None, description="Patrón de claves a limpiar"),
    current_user: User = Depends(require_admin)
):
    """Limpiar caché del sistema"""
    
    if pattern:
        cleared = await cache_service.delete_pattern(pattern)
    else:
        cleared = await cache_service.delete_pattern("*")
    
    return {
        "message": f"Cache cleared: {cleared} keys removed",
        "pattern": pattern or "all"
    }

# Registrar routers
router.include_router(auth_router)
router.include_router(emails_router)
router.include_router(attachments_router)
router.include_router(sync_router)
router.include_router(notifications_router)
router.include_router(admin_router)
