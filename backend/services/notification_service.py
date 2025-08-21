"""
Sistema de notificaciones en tiempo real para VITAL RED
WebSockets, eventos, y notificaciones push
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Any, Optional, Set
import json
import asyncio
import logging
from datetime import datetime, timedelta
from enum import Enum
import uuid

from models.database import get_db, SessionLocal
from models.auth_models import User
from services.cache_service import cache_service

logger = logging.getLogger("vitalred_gmail.notifications")

class NotificationType(Enum):
    """Tipos de notificación"""
    NEW_EMAIL = "new_email"
    EMAIL_PROCESSED = "email_processed"
    URGENT_EMAIL = "urgent_email"
    SYSTEM_ALERT = "system_alert"
    USER_MESSAGE = "user_message"
    SYNC_STATUS = "sync_status"
    ERROR = "error"

class NotificationPriority(Enum):
    """Prioridades de notificación"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"

class ConnectionManager:
    """Gestor de conexiones WebSocket"""
    
    def __init__(self):
        # Conexiones activas por usuario
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Información de usuarios conectados
        self.user_info: Dict[str, Dict[str, Any]] = {}
        # Canales de notificación
        self.channels: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str, user_info: Dict[str, Any]):
        """Conectar usuario via WebSocket"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        
        self.active_connections[user_id].append(websocket)
        self.user_info[user_id] = user_info
        
        logger.info(f"Usuario {user_id} conectado via WebSocket")
        
        # Enviar notificaciones pendientes
        await self._send_pending_notifications(user_id)
        
        # Notificar a otros usuarios (si es admin)
        if user_info.get("role") in ["admin", "superadmin"]:
            await self.broadcast_to_channel("admin", {
                "type": "user_connected",
                "user_id": user_id,
                "user_name": user_info.get("name"),
                "timestamp": datetime.now().isoformat()
            })
    
    async def disconnect(self, websocket: WebSocket, user_id: str):
        """Desconectar usuario"""
        if user_id in self.active_connections:
            try:
                self.active_connections[user_id].remove(websocket)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
                    if user_id in self.user_info:
                        del self.user_info[user_id]
            except ValueError:
                pass
        
        logger.info(f"Usuario {user_id} desconectado")
    
    async def send_personal_message(self, user_id: str, message: Dict[str, Any]):
        """Enviar mensaje a usuario específico"""
        if user_id in self.active_connections:
            disconnected_sockets = []
            for websocket in self.active_connections[user_id]:
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error enviando mensaje a {user_id}: {e}")
                    disconnected_sockets.append(websocket)
            
            # Limpiar conexiones muertas
            for socket in disconnected_sockets:
                await self.disconnect(socket, user_id)
    
    async def broadcast_to_all(self, message: Dict[str, Any]):
        """Enviar mensaje a todos los usuarios conectados"""
        for user_id in list(self.active_connections.keys()):
            await self.send_personal_message(user_id, message)
    
    async def broadcast_to_role(self, role: str, message: Dict[str, Any]):
        """Enviar mensaje a usuarios con rol específico"""
        for user_id, user_info in self.user_info.items():
            if user_info.get("role") == role:
                await self.send_personal_message(user_id, message)
    
    async def broadcast_to_channel(self, channel: str, message: Dict[str, Any]):
        """Enviar mensaje a canal específico"""
        if channel in self.channels:
            for user_id in self.channels[channel]:
                await self.send_personal_message(user_id, message)
    
    def subscribe_to_channel(self, user_id: str, channel: str):
        """Suscribir usuario a canal"""
        if channel not in self.channels:
            self.channels[channel] = set()
        self.channels[channel].add(user_id)
    
    def unsubscribe_from_channel(self, user_id: str, channel: str):
        """Desuscribir usuario de canal"""
        if channel in self.channels:
            self.channels[channel].discard(user_id)
    
    async def _send_pending_notifications(self, user_id: str):
        """Enviar notificaciones pendientes al usuario"""
        try:
            # Obtener notificaciones pendientes del caché
            pending_key = f"pending_notifications:{user_id}"
            pending = await cache_service.get(pending_key)
            
            if pending:
                for notification in pending:
                    await self.send_personal_message(user_id, notification)
                
                # Limpiar notificaciones pendientes
                await cache_service.delete(pending_key)
        except Exception as e:
            logger.error(f"Error enviando notificaciones pendientes a {user_id}: {e}")
    
    def get_connected_users(self) -> List[Dict[str, Any]]:
        """Obtener lista de usuarios conectados"""
        return [
            {
                "user_id": user_id,
                "user_info": info,
                "connections": len(self.active_connections.get(user_id, []))
            }
            for user_id, info in self.user_info.items()
        ]

class NotificationService:
    """Servicio principal de notificaciones"""
    
    def __init__(self):
        self.connection_manager = ConnectionManager()
        self.notification_queue = asyncio.Queue()
        self.is_processing = False
    
    async def start_processing(self):
        """Iniciar procesamiento de notificaciones en segundo plano"""
        if not self.is_processing:
            self.is_processing = True
            asyncio.create_task(self._process_notifications())
    
    async def _process_notifications(self):
        """Procesar cola de notificaciones"""
        while self.is_processing:
            try:
                notification = await asyncio.wait_for(
                    self.notification_queue.get(), 
                    timeout=1.0
                )
                await self._send_notification(notification)
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error(f"Error procesando notificación: {e}")
    
    async def _send_notification(self, notification: Dict[str, Any]):
        """Enviar notificación individual"""
        notification_type = notification.get("type")
        target = notification.get("target")
        message = notification.get("message")
        
        if target.get("type") == "user":
            await self.connection_manager.send_personal_message(
                target["user_id"], message
            )
        elif target.get("type") == "role":
            await self.connection_manager.broadcast_to_role(
                target["role"], message
            )
        elif target.get("type") == "channel":
            await self.connection_manager.broadcast_to_channel(
                target["channel"], message
            )
        elif target.get("type") == "broadcast":
            await self.connection_manager.broadcast_to_all(message)
    
    async def notify_user(
        self,
        user_id: str,
        notification_type: NotificationType,
        title: str,
        message: str,
        priority: NotificationPriority = NotificationPriority.NORMAL,
        data: Optional[Dict[str, Any]] = None
    ):
        """Notificar a usuario específico"""
        notification = {
            "id": str(uuid.uuid4()),
            "type": notification_type.value,
            "priority": priority.value,
            "title": title,
            "message": message,
            "data": data or {},
            "timestamp": datetime.now().isoformat(),
            "read": False
        }
        
        # Si el usuario está conectado, enviar inmediatamente
        if user_id in self.connection_manager.active_connections:
            await self.connection_manager.send_personal_message(user_id, notification)
        else:
            # Guardar para envío posterior
            await self._store_pending_notification(user_id, notification)
    
    async def notify_role(
        self,
        role: str,
        notification_type: NotificationType,
        title: str,
        message: str,
        priority: NotificationPriority = NotificationPriority.NORMAL,
        data: Optional[Dict[str, Any]] = None
    ):
        """Notificar a todos los usuarios con un rol específico"""
        notification = {
            "id": str(uuid.uuid4()),
            "type": notification_type.value,
            "priority": priority.value,
            "title": title,
            "message": message,
            "data": data or {},
            "timestamp": datetime.now().isoformat(),
            "read": False
        }
        
        await self.connection_manager.broadcast_to_role(role, notification)
    
    async def notify_new_email(self, email_data: Dict[str, Any]):
        """Notificar sobre nuevo correo médico"""
        # Determinar prioridad basada en urgencia del correo
        priority = NotificationPriority.NORMAL
        if email_data.get("urgency_level") == "critical":
            priority = NotificationPriority.CRITICAL
        elif email_data.get("urgency_level") == "moderate":
            priority = NotificationPriority.HIGH
        
        # Notificar a todos los médicos
        await self.notify_role(
            role="medico",
            notification_type=NotificationType.NEW_EMAIL,
            title="Nuevo Correo Médico",
            message=f"De: {email_data.get('sender_name', 'Desconocido')} - {email_data.get('subject', 'Sin asunto')}",
            priority=priority,
            data={
                "email_id": email_data.get("id"),
                "sender": email_data.get("sender_name"),
                "subject": email_data.get("subject"),
                "specialty": email_data.get("specialty"),
                "urgency": email_data.get("urgency_level")
            }
        )
    
    async def notify_sync_status(self, status: str, details: Dict[str, Any]):
        """Notificar estado de sincronización"""
        await self.notify_role(
            role="admin",
            notification_type=NotificationType.SYNC_STATUS,
            title="Estado de Sincronización",
            message=f"Sincronización {status}",
            data=details
        )
    
    async def notify_system_alert(self, alert_type: str, message: str, data: Optional[Dict] = None):
        """Notificar alerta del sistema"""
        await self.notify_role(
            role="admin",
            notification_type=NotificationType.SYSTEM_ALERT,
            title=f"Alerta del Sistema: {alert_type}",
            message=message,
            priority=NotificationPriority.HIGH,
            data=data
        )
    
    async def _store_pending_notification(self, user_id: str, notification: Dict[str, Any]):
        """Almacenar notificación pendiente para usuario desconectado"""
        pending_key = f"pending_notifications:{user_id}"
        
        try:
            # Obtener notificaciones pendientes existentes
            pending = await cache_service.get(pending_key) or []
            
            # Agregar nueva notificación
            pending.append(notification)
            
            # Mantener solo las últimas 50 notificaciones
            if len(pending) > 50:
                pending = pending[-50:]
            
            # Guardar en caché por 7 días
            await cache_service.set(pending_key, pending, ttl=7*24*3600)
            
        except Exception as e:
            logger.error(f"Error almacenando notificación pendiente: {e}")
    
    async def get_user_notifications(
        self,
        user_id: str,
        limit: int = 50,
        unread_only: bool = False
    ) -> List[Dict[str, Any]]:
        """Obtener notificaciones de usuario"""
        try:
            # Por ahora usar caché, en producción usar base de datos
            pending_key = f"pending_notifications:{user_id}"
            notifications = await cache_service.get(pending_key) or []
            
            if unread_only:
                notifications = [n for n in notifications if not n.get("read", False)]
            
            return notifications[-limit:] if limit else notifications
            
        except Exception as e:
            logger.error(f"Error obteniendo notificaciones de {user_id}: {e}")
            return []
    
    async def mark_notification_read(self, user_id: str, notification_id: str):
        """Marcar notificación como leída"""
        try:
            pending_key = f"pending_notifications:{user_id}"
            notifications = await cache_service.get(pending_key) or []
            
            for notification in notifications:
                if notification.get("id") == notification_id:
                    notification["read"] = True
                    break
            
            await cache_service.set(pending_key, notifications, ttl=7*24*3600)
            
        except Exception as e:
            logger.error(f"Error marcando notificación como leída: {e}")

# Instancia global del servicio
notification_service = NotificationService()

# WebSocket endpoint para conectar clientes
async def websocket_endpoint(websocket: WebSocket, user: User):
    """Endpoint WebSocket para notificaciones en tiempo real"""
    user_info = {
        "user_id": user.id,
        "name": user.full_name,
        "email": user.email,
        "role": user.role.value
    }
    
    await notification_service.connection_manager.connect(
        websocket, user.id, user_info
    )
    
    try:
        while True:
            # Escuchar mensajes del cliente
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Procesar comandos del cliente
            if message.get("type") == "subscribe":
                channel = message.get("channel")
                if channel:
                    notification_service.connection_manager.subscribe_to_channel(
                        user.id, channel
                    )
            
            elif message.get("type") == "unsubscribe":
                channel = message.get("channel")
                if channel:
                    notification_service.connection_manager.unsubscribe_from_channel(
                        user.id, channel
                    )
            
            elif message.get("type") == "mark_read":
                notification_id = message.get("notification_id")
                if notification_id:
                    await notification_service.mark_notification_read(
                        user.id, notification_id
                    )
    
    except WebSocketDisconnect:
        await notification_service.connection_manager.disconnect(websocket, user.id)
    except Exception as e:
        logger.error(f"Error en WebSocket para usuario {user.id}: {e}")
        await notification_service.connection_manager.disconnect(websocket, user.id)
