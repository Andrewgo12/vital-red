"""
VITAL RED - Enhanced Gmail Integration Backend
Sistema completo de procesamiento masivo de correos médicos
Versión mejorada con autenticación, caché, notificaciones, métricas y respaldos
"""

from fastapi import FastAPI, HTTPException, Depends, Query, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import uvicorn
import asyncio
import logging
from datetime import datetime

# Importar servicios principales
from models.database import get_db, init_database
from models.auth_models import User
from auth.auth_service import get_current_user
from services.gmail_service import GmailService
from services.email_processor import EmailProcessor
from services.cache_service import cache_service
from services.notification_service import notification_service, websocket_endpoint
from services.monitoring_service import metrics_collector, metrics_collection_task
from services.backup_service import backup_service, automated_backup_task
from routers.api_v1 import router as api_v1_router
from config.settings import settings, setup_logging

# Configurar logging
logger = setup_logging()

# Inicializar servicios
gmail_service = GmailService()
email_processor = EmailProcessor()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestión del ciclo de vida de la aplicación"""
    
    logger.info("🏥 Iniciando VITAL RED Gmail Integration Enhanced...")
    
    # === STARTUP ===
    startup_tasks = []
    
    try:
        # 1. Inicializar base de datos
        logger.info("📊 Inicializando base de datos...")
        init_database()
        logger.info("✅ Base de datos inicializada")
        
        # 2. Verificar servicios externos
        logger.info("🔍 Verificando servicios externos...")
        
        # Verificar caché
        cache_health = await cache_service.health_check()
        if cache_health.get("status") == "healthy":
            logger.info("✅ Servicio de caché conectado")
        else:
            logger.warning("⚠️  Servicio de caché no disponible")
        
        # 3. Inicializar Gmail API
        try:
            await gmail_service.initialize()
            logger.info("✅ Gmail API inicializada")
        except Exception as e:
            logger.warning(f"⚠️  Gmail API no disponible: {e}")
        
        # 4. Iniciar servicios en segundo plano
        logger.info("🚀 Iniciando servicios en segundo plano...")
        
        # Servicio de notificaciones
        startup_tasks.append(
            asyncio.create_task(notification_service.start_processing())
        )
        logger.info("✅ Servicio de notificaciones iniciado")
        
        # Recolección de métricas
        startup_tasks.append(
            asyncio.create_task(metrics_collection_task())
        )
        logger.info("✅ Recolección de métricas iniciada")
        
        # Respaldos automáticos
        startup_tasks.append(
            asyncio.create_task(automated_backup_task())
        )
        logger.info("✅ Sistema de respaldos automáticos iniciado")
        
        # 5. Notificar inicio del sistema
        await notification_service.notify_system_alert(
            alert_type="SYSTEM_START",
            message="VITAL RED sistema iniciado correctamente",
            data={
                "version": "1.0.0",
                "timestamp": datetime.now().isoformat(),
                "services": {
                    "database": "active",
                    "cache": cache_health.get("status", "unknown"),
                    "gmail": "active" if gmail_service.is_initialized else "inactive",
                    "notifications": "active",
                    "monitoring": "active",
                    "backups": "active"
                }
            }
        )
        
        logger.info("🎉 VITAL RED iniciado correctamente!")
        
    except Exception as e:
        logger.error(f"❌ Error durante el inicio: {e}")
        raise
    
    yield
    
    # === SHUTDOWN ===
    logger.info("🔄 Cerrando servicios...")
    
    try:
        # Cancelar tareas en segundo plano
        for task in startup_tasks:
            if not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass
        
        # Notificar cierre del sistema
        await notification_service.notify_system_alert(
            alert_type="SYSTEM_SHUTDOWN",
            message="VITAL RED sistema cerrando",
            data={"timestamp": datetime.now().isoformat()}
        )
        
        logger.info("✅ Servicios cerrados correctamente")
        
    except Exception as e:
        logger.error(f"❌ Error durante el cierre: {e}")

# Crear aplicación FastAPI
app = FastAPI(
    title="VITAL RED - Enhanced Gmail Integration API",
    description="""
    Sistema completo de procesamiento masivo de correos médicos para referencias y contra-referencias hospitalarias.
    
    **Características principales:**
    - 🔐 Sistema de autenticación y autorización
    - ⚡ Caché avanzado con Redis
    - 📱 Notificaciones en tiempo real via WebSocket
    - 📊 Métricas y monitoreo del sistema
    - 💾 Respaldos automáticos programados
    - 🔍 Búsqueda avanzada de correos médicos
    - 📎 Procesamiento inteligente de adjuntos
    - 🏥 Especializado para entorno hospitalario
    
    **Versión:** 1.0.0 Enhanced
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# === MIDDLEWARES ===

# CORS para el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.api_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compresión Gzip
app.add_middleware(GZipMiddleware, minimum_size=1000)

# === ENDPOINTS PRINCIPALES ===

@app.get("/", tags=["Health"])
async def root():
    """Endpoint principal del servicio"""
    return {
        "service": "VITAL RED Gmail Integration Enhanced",
        "status": "active",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "Authentication & Authorization",
            "Advanced Caching",
            "Real-time Notifications",
            "System Monitoring",
            "Automated Backups",
            "Medical Email Processing",
            "Attachment Intelligence"
        ]
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Verificación completa del estado del sistema"""
    
    health_status = {
        "overall": "checking",
        "timestamp": datetime.now().isoformat(),
        "services": {}
    }
    
    try:
        # Verificar base de datos
        db = next(get_db())
        health_status["services"]["database"] = {
            "status": "connected",
            "type": "MySQL"
        }
        
        # Verificar Gmail API
        if gmail_service.is_initialized:
            health_status["services"]["gmail"] = {
                "status": "connected",
                "type": "Gmail API"
            }
        else:
            health_status["services"]["gmail"] = {
                "status": "disconnected",
                "type": "Gmail API"
            }
        
        # Verificar caché
        cache_health = await cache_service.health_check()
        health_status["services"]["cache"] = cache_health
        
        # Verificar métricas
        health_status["services"]["monitoring"] = {
            "status": "active",
            "metrics_collected": len(metrics_collector.metrics_history)
        }
        
        # Verificar notificaciones
        connected_users = notification_service.connection_manager.get_connected_users()
        health_status["services"]["notifications"] = {
            "status": "active",
            "connected_users": len(connected_users)
        }
        
        # Verificar respaldos
        try:
            backups = await backup_service.list_backups()
            health_status["services"]["backups"] = {
                "status": "active",
                "total_backups": len(backups)
            }
        except Exception as e:
            health_status["services"]["backups"] = {
                "status": "error",
                "error": str(e)
            }
        
        # Determinar estado general
        all_critical_services_ok = all([
            health_status["services"]["database"]["status"] == "connected",
            health_status["services"]["cache"]["status"] == "healthy",
            health_status["services"]["monitoring"]["status"] == "active",
            health_status["services"]["notifications"]["status"] == "active"
        ])
        
        health_status["overall"] = "healthy" if all_critical_services_ok else "degraded"
        
    except Exception as e:
        health_status["overall"] = "unhealthy"
        health_status["error"] = str(e)
        logger.error(f"Health check failed: {e}")
    
    return health_status

@app.get("/metrics", tags=["Monitoring"])
async def get_system_metrics(current_user: User = Depends(get_current_user)):
    """Obtener métricas del sistema (requiere autenticación)"""
    
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    # Obtener métricas actuales
    current_metrics = await metrics_collector.collect_all_metrics()
    
    # Obtener resumen de métricas
    metrics_summary = metrics_collector.get_metrics_summary(hours=24)
    
    # Obtener alertas activas
    active_alerts = metrics_collector.get_active_alerts()
    
    return {
        "current_metrics": {
            name: {
                "value": metric.value,
                "type": metric.type.value,
                "timestamp": metric.timestamp.isoformat(),
                "description": metric.description
            }
            for name, metric in current_metrics.items()
        },
        "summary_24h": metrics_summary,
        "active_alerts": [
            {
                "id": alert.id,
                "name": alert.name,
                "level": alert.level.value,
                "message": alert.message,
                "timestamp": alert.timestamp.isoformat()
            }
            for alert in active_alerts
        ],
        "system_info": {
            "connected_users": len(notification_service.connection_manager.get_connected_users()),
            "cache_keys": len(metrics_collector.metrics_history),
            "uptime": datetime.now().isoformat()
        }
    }

# === WebSocket para notificaciones ===

@app.websocket("/ws/notifications")
async def websocket_notifications_endpoint(
    websocket: WebSocket,
    current_user: User = Depends(get_current_user)
):
    """WebSocket endpoint para notificaciones en tiempo real"""
    await websocket_endpoint(websocket, current_user)

# === INCLUIR ROUTERS ===

# API v1 con todas las funcionalidades
app.include_router(api_v1_router)

# === ENDPOINTS LEGACY (compatibilidad) ===

@app.get("/emails", tags=["Legacy"])
async def get_emails_legacy(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """Endpoint legacy para obtener correos (redirige a API v1)"""
    # Redirigir a la nueva API
    from routers.api_v1 import search_emails
    return await search_emails(
        q="*",  # Buscar todos
        skip=skip,
        limit=limit,
        current_user=current_user,
        db=next(get_db())
    )

@app.post("/sync/start", tags=["Legacy"])
async def start_sync_legacy(current_user: User = Depends(get_current_user)):
    """Endpoint legacy para iniciar sincronización (redirige a API v1)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    from routers.api_v1 import trigger_manual_sync
    return await trigger_manual_sync(
        force=False,
        current_user=current_user,
        db=next(get_db())
    )

# === MANEJO DE ERRORES PERSONALIZADO ===

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Manejador global de excepciones"""
    
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    # Notificar error crítico a administradores
    try:
        await notification_service.notify_system_alert(
            alert_type="UNHANDLED_EXCEPTION",
            message=f"Error no manejado en la aplicación: {str(exc)}",
            data={
                "exception_type": type(exc).__name__,
                "path": str(request.url),
                "method": request.method,
                "timestamp": datetime.now().isoformat()
            }
        )
    except:
        pass  # No fallar si no se puede enviar la notificación
    
    return {
        "error": "Internal server error",
        "message": "Se ha producido un error interno. Los administradores han sido notificados.",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    # Ejecutar servidor
    uvicorn.run(
        "main_enhanced:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Deshabilitado en producción
        log_level="info",
        access_log=True,
        use_colors=True
    )
