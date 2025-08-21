"""
Sistema de métricas y monitoreo para VITAL RED
Métricas de rendimiento, salud del sistema y alertas automáticas
"""

import time
import psutil
import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import json

from models.database import get_db, SessionLocal
from services.cache_service import cache_service
from services.notification_service import notification_service, NotificationType, NotificationPriority

logger = logging.getLogger("vitalred_gmail.monitoring")

class MetricType(Enum):
    """Tipos de métricas"""
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    TIMER = "timer"

class AlertLevel(Enum):
    """Niveles de alerta"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

@dataclass
class Metric:
    """Estructura de métrica"""
    name: str
    type: MetricType
    value: float
    timestamp: datetime
    labels: Dict[str, str] = None
    description: str = ""

@dataclass
class Alert:
    """Estructura de alerta"""
    id: str
    name: str
    level: AlertLevel
    message: str
    metric_name: str
    threshold: float
    current_value: float
    timestamp: datetime
    resolved: bool = False

class MetricsCollector:
    """Recolector de métricas del sistema"""
    
    def __init__(self):
        self.metrics_history: Dict[str, List[Metric]] = {}
        self.alerts: List[Alert] = []
        self.alert_rules: Dict[str, Dict] = self._setup_alert_rules()
        
        # Contadores internos
        self.counters = {}
        self.timers = {}
        
    def _setup_alert_rules(self) -> Dict[str, Dict]:
        """Configurar reglas de alerta"""
        return {
            "cpu_usage": {
                "threshold": 80.0,
                "level": AlertLevel.WARNING,
                "message": "Alto uso de CPU: {value}%"
            },
            "memory_usage": {
                "threshold": 85.0,
                "level": AlertLevel.WARNING,
                "message": "Alto uso de memoria: {value}%"
            },
            "disk_usage": {
                "threshold": 90.0,
                "level": AlertLevel.ERROR,
                "message": "Bajo espacio en disco: {value}%"
            },
            "email_processing_errors": {
                "threshold": 10.0,
                "level": AlertLevel.ERROR,
                "message": "Muchos errores procesando correos: {value}"
            },
            "database_connections": {
                "threshold": 50.0,
                "level": AlertLevel.WARNING,
                "message": "Muchas conexiones a DB: {value}"
            },
            "response_time": {
                "threshold": 5000.0,  # 5 segundos
                "level": AlertLevel.WARNING,
                "message": "Tiempo de respuesta alto: {value}ms"
            }
        }
    
    async def collect_system_metrics(self) -> Dict[str, Metric]:
        """Recopilar métricas del sistema"""
        metrics = {}
        
        # Métricas de CPU
        cpu_percent = psutil.cpu_percent(interval=1)
        metrics["cpu_usage"] = Metric(
            name="cpu_usage",
            type=MetricType.GAUGE,
            value=cpu_percent,
            timestamp=datetime.now(),
            description="Porcentaje de uso de CPU"
        )
        
        # Métricas de memoria
        memory = psutil.virtual_memory()
        metrics["memory_usage"] = Metric(
            name="memory_usage",
            type=MetricType.GAUGE,
            value=memory.percent,
            timestamp=datetime.now(),
            description="Porcentaje de uso de memoria"
        )
        
        metrics["memory_available"] = Metric(
            name="memory_available",
            type=MetricType.GAUGE,
            value=memory.available / (1024**3),  # GB
            timestamp=datetime.now(),
            description="Memoria disponible en GB"
        )
        
        # Métricas de disco
        disk = psutil.disk_usage('/')
        metrics["disk_usage"] = Metric(
            name="disk_usage",
            type=MetricType.GAUGE,
            value=(disk.used / disk.total) * 100,
            timestamp=datetime.now(),
            description="Porcentaje de uso de disco"
        )
        
        metrics["disk_free"] = Metric(
            name="disk_free",
            type=MetricType.GAUGE,
            value=disk.free / (1024**3),  # GB
            timestamp=datetime.now(),
            description="Espacio libre en disco (GB)"
        )
        
        # Métricas de red
        network = psutil.net_io_counters()
        metrics["network_bytes_sent"] = Metric(
            name="network_bytes_sent",
            type=MetricType.COUNTER,
            value=network.bytes_sent,
            timestamp=datetime.now(),
            description="Bytes enviados por la red"
        )
        
        metrics["network_bytes_recv"] = Metric(
            name="network_bytes_recv",
            type=MetricType.COUNTER,
            value=network.bytes_recv,
            timestamp=datetime.now(),
            description="Bytes recibidos por la red"
        )
        
        return metrics
    
    async def collect_application_metrics(self) -> Dict[str, Metric]:
        """Recopilar métricas de la aplicación"""
        metrics = {}
        
        try:
            # Métricas de base de datos
            db = SessionLocal()
            
            # Número de correos procesados hoy
            today = datetime.now().date()
            from models.database import Email
            emails_today = db.query(Email).filter(
                Email.processed_at >= today
            ).count()
            
            metrics["emails_processed_today"] = Metric(
                name="emails_processed_today",
                type=MetricType.GAUGE,
                value=emails_today,
                timestamp=datetime.now(),
                description="Correos procesados hoy"
            )
            
            # Correos con errores
            emails_with_errors = db.query(Email).filter(
                Email.processing_status == "error"
            ).count()
            
            metrics["emails_with_errors"] = Metric(
                name="emails_with_errors",
                type=MetricType.GAUGE,
                value=emails_with_errors,
                timestamp=datetime.now(),
                description="Correos con errores de procesamiento"
            )
            
            # Adjuntos pendientes
            from models.database import Attachment
            attachments_pending = db.query(Attachment).filter(
                Attachment.processed_status == "pending"
            ).count()
            
            metrics["attachments_pending"] = Metric(
                name="attachments_pending",
                type=MetricType.GAUGE,
                value=attachments_pending,
                timestamp=datetime.now(),
                description="Adjuntos pendientes de procesar"
            )
            
            db.close()
            
        except Exception as e:
            logger.error(f"Error collecting application metrics: {e}")
        
        return metrics
    
    async def collect_cache_metrics(self) -> Dict[str, Metric]:
        """Recopilar métricas del caché"""
        metrics = {}
        
        try:
            cache_health = await cache_service.health_check()
            
            if cache_health.get("status") == "healthy":
                metrics["cache_status"] = Metric(
                    name="cache_status",
                    type=MetricType.GAUGE,
                    value=1.0,  # 1 = healthy, 0 = unhealthy
                    timestamp=datetime.now(),
                    description="Estado del caché (1=saludable, 0=problemas)"
                )
                
                # Memoria usada por Redis
                if "used_memory_human" in cache_health:
                    memory_str = cache_health["used_memory_human"]
                    # Convertir a MB (simplificado)
                    if "M" in memory_str:
                        memory_mb = float(memory_str.replace("M", ""))
                    elif "K" in memory_str:
                        memory_mb = float(memory_str.replace("K", "")) / 1024
                    else:
                        memory_mb = 0
                    
                    metrics["cache_memory_usage"] = Metric(
                        name="cache_memory_usage",
                        type=MetricType.GAUGE,
                        value=memory_mb,
                        timestamp=datetime.now(),
                        description="Memoria usada por el caché (MB)"
                    )
                
                # Clientes conectados
                if "connected_clients" in cache_health:
                    metrics["cache_connected_clients"] = Metric(
                        name="cache_connected_clients",
                        type=MetricType.GAUGE,
                        value=cache_health["connected_clients"],
                        timestamp=datetime.now(),
                        description="Clientes conectados al caché"
                    )
            else:
                metrics["cache_status"] = Metric(
                    name="cache_status",
                    type=MetricType.GAUGE,
                    value=0.0,
                    timestamp=datetime.now(),
                    description="Estado del caché (1=saludable, 0=problemas)"
                )
                
        except Exception as e:
            logger.error(f"Error collecting cache metrics: {e}")
            metrics["cache_status"] = Metric(
                name="cache_status",
                type=MetricType.GAUGE,
                value=0.0,
                timestamp=datetime.now(),
                description="Estado del caché (1=saludable, 0=problemas)"
            )
        
        return metrics
    
    async def collect_all_metrics(self) -> Dict[str, Metric]:
        """Recopilar todas las métricas"""
        all_metrics = {}
        
        # Recopilar métricas del sistema
        system_metrics = await self.collect_system_metrics()
        all_metrics.update(system_metrics)
        
        # Recopilar métricas de la aplicación
        app_metrics = await self.collect_application_metrics()
        all_metrics.update(app_metrics)
        
        # Recopilar métricas del caché
        cache_metrics = await self.collect_cache_metrics()
        all_metrics.update(cache_metrics)
        
        # Almacenar en historial
        for name, metric in all_metrics.items():
            if name not in self.metrics_history:
                self.metrics_history[name] = []
            
            self.metrics_history[name].append(metric)
            
            # Mantener solo las últimas 1000 métricas por tipo
            if len(self.metrics_history[name]) > 1000:
                self.metrics_history[name] = self.metrics_history[name][-1000:]
        
        # Verificar alertas
        await self.check_alerts(all_metrics)
        
        return all_metrics
    
    async def check_alerts(self, metrics: Dict[str, Metric]):
        """Verificar y generar alertas basadas en métricas"""
        
        for metric_name, metric in metrics.items():
            if metric_name in self.alert_rules:
                rule = self.alert_rules[metric_name]
                threshold = rule["threshold"]
                
                if metric.value > threshold:
                    # Generar alerta
                    alert = Alert(
                        id=f"{metric_name}_{int(time.time())}",
                        name=metric_name,
                        level=rule["level"],
                        message=rule["message"].format(value=metric.value),
                        metric_name=metric_name,
                        threshold=threshold,
                        current_value=metric.value,
                        timestamp=datetime.now()
                    )
                    
                    # Verificar si ya existe una alerta similar activa
                    existing_alert = None
                    for existing in self.alerts:
                        if (existing.metric_name == metric_name and 
                            not existing.resolved and
                            datetime.now() - existing.timestamp < timedelta(minutes=30)):
                            existing_alert = existing
                            break
                    
                    if not existing_alert:
                        self.alerts.append(alert)
                        await self._send_alert_notification(alert)
                        logger.warning(f"Alert triggered: {alert.message}")
    
    async def _send_alert_notification(self, alert: Alert):
        """Enviar notificación de alerta"""
        
        # Determinar prioridad de notificación
        priority_map = {
            AlertLevel.INFO: NotificationPriority.LOW,
            AlertLevel.WARNING: NotificationPriority.NORMAL,
            AlertLevel.ERROR: NotificationPriority.HIGH,
            AlertLevel.CRITICAL: NotificationPriority.CRITICAL
        }
        
        await notification_service.notify_system_alert(
            alert_type=alert.level.value.upper(),
            message=alert.message,
            data={
                "alert_id": alert.id,
                "metric_name": alert.metric_name,
                "threshold": alert.threshold,
                "current_value": alert.current_value,
                "timestamp": alert.timestamp.isoformat()
            }
        )
    
    def increment_counter(self, name: str, value: float = 1.0, labels: Dict[str, str] = None):
        """Incrementar contador"""
        key = f"{name}:{json.dumps(labels or {}, sort_keys=True)}"
        if key not in self.counters:
            self.counters[key] = 0
        self.counters[key] += value
    
    def record_timer(self, name: str, duration_ms: float, labels: Dict[str, str] = None):
        """Registrar tiempo de ejecución"""
        key = f"{name}:{json.dumps(labels or {}, sort_keys=True)}"
        if key not in self.timers:
            self.timers[key] = []
        self.timers[key].append(duration_ms)
        
        # Mantener solo las últimas 100 mediciones
        if len(self.timers[key]) > 100:
            self.timers[key] = self.timers[key][-100:]
    
    def get_metrics_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Obtener resumen de métricas"""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        summary = {}
        
        for metric_name, history in self.metrics_history.items():
            recent_metrics = [m for m in history if m.timestamp > cutoff_time]
            
            if recent_metrics:
                values = [m.value for m in recent_metrics]
                summary[metric_name] = {
                    "current": values[-1] if values else 0,
                    "min": min(values),
                    "max": max(values),
                    "avg": sum(values) / len(values),
                    "count": len(values)
                }
        
        return summary
    
    def get_active_alerts(self) -> List[Alert]:
        """Obtener alertas activas"""
        return [alert for alert in self.alerts if not alert.resolved]
    
    async def resolve_alert(self, alert_id: str) -> bool:
        """Resolver alerta"""
        for alert in self.alerts:
            if alert.id == alert_id:
                alert.resolved = True
                logger.info(f"Alert resolved: {alert.message}")
                return True
        return False

# Instancia global del colector de métricas
metrics_collector = MetricsCollector()

class PerformanceTimer:
    """Context manager para medir tiempos de ejecución"""
    
    def __init__(self, name: str, labels: Dict[str, str] = None):
        self.name = name
        self.labels = labels
        self.start_time = None
    
    def __enter__(self):
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.start_time:
            duration_ms = (time.time() - self.start_time) * 1000
            metrics_collector.record_timer(self.name, duration_ms, self.labels)

def monitor_performance(name: str, labels: Dict[str, str] = None):
    """Decorador para monitorear rendimiento de funciones"""
    def decorator(func):
        async def async_wrapper(*args, **kwargs):
            with PerformanceTimer(name, labels):
                return await func(*args, **kwargs)
        
        def sync_wrapper(*args, **kwargs):
            with PerformanceTimer(name, labels):
                return func(*args, **kwargs)
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator

# Task de recolección periódica de métricas
async def metrics_collection_task():
    """Task para recopilar métricas periódicamente"""
    while True:
        try:
            await metrics_collector.collect_all_metrics()
            logger.debug("Metrics collected successfully")
            
            # Esperar 60 segundos antes de la siguiente recolección
            await asyncio.sleep(60)
            
        except Exception as e:
            logger.error(f"Error in metrics collection: {e}")
            await asyncio.sleep(60)  # Esperar antes de reintentar
