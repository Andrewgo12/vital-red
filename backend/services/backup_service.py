"""
Sistema de respaldos automáticos para VITAL RED
Respaldos de base de datos, archivos adjuntos y configuraciones
"""

import os
import shutil
import gzip
import tarfile
import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pathlib import Path
import subprocess
import json
import hashlib

from models.database import SessionLocal, get_system_config, set_system_config
from services.cache_service import cache_service
from services.notification_service import notification_service, NotificationType, NotificationPriority
from config.settings import settings

logger = logging.getLogger("vitalred_gmail.backup")

class BackupType:
    """Tipos de respaldo"""
    DATABASE = "database"
    ATTACHMENTS = "attachments"
    LOGS = "logs"
    CONFIG = "config"
    FULL = "full"

class BackupStatus:
    """Estados de respaldo"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class BackupService:
    """Servicio de respaldos automáticos"""
    
    def __init__(self):
        self.backup_base_path = Path(settings.backup_base_path)
        self.retention_days = getattr(settings, 'backup_retention_days', 30)
        self.max_backup_size = getattr(settings, 'max_backup_size_gb', 10) * 1024**3  # GB to bytes
        
        # Crear directorios de respaldo
        self.backup_base_path.mkdir(parents=True, exist_ok=True)
        
        # Subdirectorios por tipo
        self.backup_dirs = {
            BackupType.DATABASE: self.backup_base_path / "database",
            BackupType.ATTACHMENTS: self.backup_base_path / "attachments", 
            BackupType.LOGS: self.backup_base_path / "logs",
            BackupType.CONFIG: self.backup_base_path / "config",
            BackupType.FULL: self.backup_base_path / "full"
        }
        
        for backup_dir in self.backup_dirs.values():
            backup_dir.mkdir(parents=True, exist_ok=True)
    
    async def create_database_backup(self, backup_id: str) -> Dict[str, Any]:
        """Crear respaldo de base de datos MySQL"""
        
        backup_info = {
            "id": backup_id,
            "type": BackupType.DATABASE,
            "status": BackupStatus.IN_PROGRESS,
            "started_at": datetime.now().isoformat(),
            "size_bytes": 0,
            "file_path": None,
            "error": None
        }
        
        try:
            # Nombre del archivo de respaldo
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"vitalred_db_{timestamp}.sql.gz"
            backup_path = self.backup_dirs[BackupType.DATABASE] / backup_filename
            
            # Comando mysqldump
            dump_cmd = [
                "mysqldump",
                f"--host={settings.mysql_host}",
                f"--port={settings.mysql_port}",
                f"--user={settings.mysql_user}",
                f"--password={settings.mysql_password}",
                "--single-transaction",
                "--routines",
                "--triggers",
                "--complete-insert",
                "--extended-insert",
                "--compress",
                settings.mysql_database
            ]
            
            logger.info(f"Starting database backup to {backup_path}")
            
            # Ejecutar mysqldump y comprimir
            with gzip.open(backup_path, 'wt') as gz_file:
                process = subprocess.Popen(
                    dump_cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                
                stdout, stderr = process.communicate()
                
                if process.returncode != 0:
                    raise Exception(f"mysqldump failed: {stderr}")
                
                gz_file.write(stdout)
            
            # Verificar archivo creado
            if backup_path.exists():
                backup_info.update({
                    "status": BackupStatus.COMPLETED,
                    "completed_at": datetime.now().isoformat(),
                    "size_bytes": backup_path.stat().st_size,
                    "file_path": str(backup_path),
                    "checksum": await self._calculate_file_checksum(backup_path)
                })
                
                logger.info(f"Database backup completed: {backup_path}")
            else:
                raise Exception("Backup file was not created")
                
        except Exception as e:
            logger.error(f"Database backup failed: {e}")
            backup_info.update({
                "status": BackupStatus.FAILED,
                "completed_at": datetime.now().isoformat(),
                "error": str(e)
            })
        
        return backup_info
    
    async def create_attachments_backup(self, backup_id: str) -> Dict[str, Any]:
        """Crear respaldo de archivos adjuntos"""
        
        backup_info = {
            "id": backup_id,
            "type": BackupType.ATTACHMENTS,
            "status": BackupStatus.IN_PROGRESS,
            "started_at": datetime.now().isoformat(),
            "size_bytes": 0,
            "file_path": None,
            "files_count": 0,
            "error": None
        }
        
        try:
            # Directorio fuente de adjuntos
            attachments_source = Path(settings.attachments_base_path)
            
            if not attachments_source.exists():
                logger.warning("Attachments directory does not exist")
                backup_info.update({
                    "status": BackupStatus.COMPLETED,
                    "completed_at": datetime.now().isoformat(),
                    "files_count": 0,
                    "size_bytes": 0
                })
                return backup_info
            
            # Nombre del archivo de respaldo
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"vitalred_attachments_{timestamp}.tar.gz"
            backup_path = self.backup_dirs[BackupType.ATTACHMENTS] / backup_filename
            
            logger.info(f"Starting attachments backup to {backup_path}")
            
            # Crear archivo tar comprimido
            with tarfile.open(backup_path, "w:gz") as tar:
                files_count = 0
                
                for file_path in attachments_source.rglob("*"):
                    if file_path.is_file():
                        # Agregar archivo al tar con ruta relativa
                        arcname = file_path.relative_to(attachments_source)
                        tar.add(file_path, arcname=arcname)
                        files_count += 1
                        
                        # Log progreso cada 100 archivos
                        if files_count % 100 == 0:
                            logger.debug(f"Backed up {files_count} attachment files")
            
            # Verificar archivo creado
            if backup_path.exists():
                backup_info.update({
                    "status": BackupStatus.COMPLETED,
                    "completed_at": datetime.now().isoformat(),
                    "size_bytes": backup_path.stat().st_size,
                    "file_path": str(backup_path),
                    "files_count": files_count,
                    "checksum": await self._calculate_file_checksum(backup_path)
                })
                
                logger.info(f"Attachments backup completed: {files_count} files, {backup_path}")
            else:
                raise Exception("Backup file was not created")
                
        except Exception as e:
            logger.error(f"Attachments backup failed: {e}")
            backup_info.update({
                "status": BackupStatus.FAILED,
                "completed_at": datetime.now().isoformat(),
                "error": str(e)
            })
        
        return backup_info
    
    async def create_logs_backup(self, backup_id: str) -> Dict[str, Any]:
        """Crear respaldo de logs del sistema"""
        
        backup_info = {
            "id": backup_id,
            "type": BackupType.LOGS,
            "status": BackupStatus.IN_PROGRESS,
            "started_at": datetime.now().isoformat(),
            "size_bytes": 0,
            "file_path": None,
            "files_count": 0,
            "error": None
        }
        
        try:
            # Directorio fuente de logs
            logs_source = Path(settings.logs_base_path)
            
            if not logs_source.exists():
                logger.warning("Logs directory does not exist")
                backup_info.update({
                    "status": BackupStatus.COMPLETED,
                    "completed_at": datetime.now().isoformat(),
                    "files_count": 0,
                    "size_bytes": 0
                })
                return backup_info
            
            # Nombre del archivo de respaldo
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"vitalred_logs_{timestamp}.tar.gz"
            backup_path = self.backup_dirs[BackupType.LOGS] / backup_filename
            
            logger.info(f"Starting logs backup to {backup_path}")
            
            # Crear archivo tar comprimido
            with tarfile.open(backup_path, "w:gz") as tar:
                files_count = 0
                
                for file_path in logs_source.rglob("*.log*"):
                    if file_path.is_file():
                        # Solo respaldar logs de los últimos 30 días
                        file_age = datetime.now() - datetime.fromtimestamp(file_path.stat().st_mtime)
                        if file_age.days <= 30:
                            arcname = file_path.relative_to(logs_source)
                            tar.add(file_path, arcname=arcname)
                            files_count += 1
            
            # Verificar archivo creado
            if backup_path.exists():
                backup_info.update({
                    "status": BackupStatus.COMPLETED,
                    "completed_at": datetime.now().isoformat(),
                    "size_bytes": backup_path.stat().st_size,
                    "file_path": str(backup_path),
                    "files_count": files_count,
                    "checksum": await self._calculate_file_checksum(backup_path)
                })
                
                logger.info(f"Logs backup completed: {files_count} files, {backup_path}")
            else:
                raise Exception("Backup file was not created")
                
        except Exception as e:
            logger.error(f"Logs backup failed: {e}")
            backup_info.update({
                "status": BackupStatus.FAILED,
                "completed_at": datetime.now().isoformat(),
                "error": str(e)
            })
        
        return backup_info
    
    async def create_config_backup(self, backup_id: str) -> Dict[str, Any]:
        """Crear respaldo de configuraciones del sistema"""
        
        backup_info = {
            "id": backup_id,
            "type": BackupType.CONFIG,
            "status": BackupStatus.IN_PROGRESS,
            "started_at": datetime.now().isoformat(),
            "size_bytes": 0,
            "file_path": None,
            "error": None
        }
        
        try:
            # Recopilar configuraciones
            config_data = {
                "system_config": {},
                "application_settings": {},
                "backup_metadata": {
                    "created_at": datetime.now().isoformat(),
                    "version": "1.0.0",
                    "backup_id": backup_id
                }
            }
            
            # Obtener configuraciones del sistema desde la DB
            db = SessionLocal()
            try:
                from models.database import SystemConfig
                configs = db.query(SystemConfig).all()
                
                for config in configs:
                    config_data["system_config"][config.key] = {
                        "value": config.value,
                        "description": config.description,
                        "updated_at": config.updated_at.isoformat() if config.updated_at else None
                    }
            finally:
                db.close()
            
            # Configuraciones de la aplicación (sin secretos)
            config_data["application_settings"] = {
                "app_name": settings.app_name,
                "app_version": settings.app_version,
                "mysql_host": settings.mysql_host,
                "mysql_port": settings.mysql_port,
                "mysql_database": settings.mysql_database,
                "gmail_scopes": settings.gmail_scopes,
                "medical_keywords": settings.medical_keywords,
                "medical_specialties": settings.medical_specialties,
                "allowed_attachment_types": settings.allowed_attachment_types,
                "max_attachment_size": settings.max_attachment_size
            }
            
            # Nombre del archivo de respaldo
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"vitalred_config_{timestamp}.json.gz"
            backup_path = self.backup_dirs[BackupType.CONFIG] / backup_filename
            
            logger.info(f"Starting config backup to {backup_path}")
            
            # Guardar configuraciones comprimidas
            with gzip.open(backup_path, 'wt', encoding='utf-8') as gz_file:
                json.dump(config_data, gz_file, indent=2, ensure_ascii=False)
            
            # Verificar archivo creado
            if backup_path.exists():
                backup_info.update({
                    "status": BackupStatus.COMPLETED,
                    "completed_at": datetime.now().isoformat(),
                    "size_bytes": backup_path.stat().st_size,
                    "file_path": str(backup_path),
                    "checksum": await self._calculate_file_checksum(backup_path)
                })
                
                logger.info(f"Config backup completed: {backup_path}")
            else:
                raise Exception("Backup file was not created")
                
        except Exception as e:
            logger.error(f"Config backup failed: {e}")
            backup_info.update({
                "status": BackupStatus.FAILED,
                "completed_at": datetime.now().isoformat(),
                "error": str(e)
            })
        
        return backup_info
    
    async def create_full_backup(self, backup_id: str) -> Dict[str, Any]:
        """Crear respaldo completo del sistema"""
        
        full_backup_info = {
            "id": backup_id,
            "type": BackupType.FULL,
            "status": BackupStatus.IN_PROGRESS,
            "started_at": datetime.now().isoformat(),
            "components": {},
            "total_size_bytes": 0,
            "file_path": None,
            "error": None
        }
        
        try:
            logger.info(f"Starting full system backup: {backup_id}")
            
            # Crear respaldos individuales
            db_backup = await self.create_database_backup(f"{backup_id}_db")
            attachments_backup = await self.create_attachments_backup(f"{backup_id}_attachments")
            logs_backup = await self.create_logs_backup(f"{backup_id}_logs")
            config_backup = await self.create_config_backup(f"{backup_id}_config")
            
            # Recopilar información de componentes
            full_backup_info["components"] = {
                "database": db_backup,
                "attachments": attachments_backup,
                "logs": logs_backup,
                "config": config_backup
            }
            
            # Verificar si todos los componentes fueron exitosos
            all_successful = all(
                comp["status"] == BackupStatus.COMPLETED 
                for comp in full_backup_info["components"].values()
            )
            
            if all_successful:
                # Crear archivo de respaldo completo combinando todos los componentes
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                full_backup_filename = f"vitalred_full_{timestamp}.tar.gz"
                full_backup_path = self.backup_dirs[BackupType.FULL] / full_backup_filename
                
                # Crear tar con todos los archivos de respaldo
                with tarfile.open(full_backup_path, "w:gz") as tar:
                    for component_name, component_info in full_backup_info["components"].items():
                        if component_info.get("file_path") and Path(component_info["file_path"]).exists():
                            file_path = Path(component_info["file_path"])
                            tar.add(file_path, arcname=f"{component_name}/{file_path.name}")
                
                # Calcular tamaño total
                total_size = sum(
                    comp.get("size_bytes", 0) 
                    for comp in full_backup_info["components"].values()
                )
                
                full_backup_info.update({
                    "status": BackupStatus.COMPLETED,
                    "completed_at": datetime.now().isoformat(),
                    "total_size_bytes": total_size,
                    "file_path": str(full_backup_path),
                    "checksum": await self._calculate_file_checksum(full_backup_path)
                })
                
                logger.info(f"Full backup completed: {full_backup_path}")
                
            else:
                failed_components = [
                    name for name, comp in full_backup_info["components"].items()
                    if comp["status"] != BackupStatus.COMPLETED
                ]
                
                raise Exception(f"Some backup components failed: {failed_components}")
                
        except Exception as e:
            logger.error(f"Full backup failed: {e}")
            full_backup_info.update({
                "status": BackupStatus.FAILED,
                "completed_at": datetime.now().isoformat(),
                "error": str(e)
            })
        
        return full_backup_info
    
    async def _calculate_file_checksum(self, file_path: Path) -> str:
        """Calcular checksum SHA-256 de un archivo"""
        hash_sha256 = hashlib.sha256()
        
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        
        return hash_sha256.hexdigest()
    
    async def cleanup_old_backups(self) -> Dict[str, Any]:
        """Limpiar respaldos antiguos según política de retención"""
        
        cleanup_info = {
            "started_at": datetime.now().isoformat(),
            "deleted_files": [],
            "freed_space_bytes": 0,
            "errors": []
        }
        
        cutoff_date = datetime.now() - timedelta(days=self.retention_days)
        
        try:
            for backup_type, backup_dir in self.backup_dirs.items():
                if not backup_dir.exists():
                    continue
                
                for file_path in backup_dir.iterdir():
                    if file_path.is_file():
                        # Verificar fecha de creación del archivo
                        file_mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
                        
                        if file_mtime < cutoff_date:
                            try:
                                file_size = file_path.stat().st_size
                                file_path.unlink()
                                
                                cleanup_info["deleted_files"].append({
                                    "file": str(file_path),
                                    "size_bytes": file_size,
                                    "created_at": file_mtime.isoformat()
                                })
                                cleanup_info["freed_space_bytes"] += file_size
                                
                                logger.info(f"Deleted old backup: {file_path}")
                                
                            except Exception as e:
                                error_msg = f"Failed to delete {file_path}: {e}"
                                cleanup_info["errors"].append(error_msg)
                                logger.error(error_msg)
            
            cleanup_info["completed_at"] = datetime.now().isoformat()
            logger.info(f"Backup cleanup completed: {len(cleanup_info['deleted_files'])} files deleted")
            
        except Exception as e:
            error_msg = f"Backup cleanup failed: {e}"
            cleanup_info["errors"].append(error_msg)
            logger.error(error_msg)
        
        return cleanup_info
    
    async def list_backups(self, backup_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Listar respaldos disponibles"""
        
        backups = []
        
        # Determinar directorios a buscar
        if backup_type and backup_type in self.backup_dirs:
            search_dirs = {backup_type: self.backup_dirs[backup_type]}
        else:
            search_dirs = self.backup_dirs
        
        for btype, backup_dir in search_dirs.items():
            if not backup_dir.exists():
                continue
            
            for file_path in backup_dir.iterdir():
                if file_path.is_file():
                    try:
                        stat = file_path.stat()
                        
                        backup_info = {
                            "type": btype,
                            "filename": file_path.name,
                            "file_path": str(file_path),
                            "size_bytes": stat.st_size,
                            "size_human": self._format_bytes(stat.st_size),
                            "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                            "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                            "checksum": await self._calculate_file_checksum(file_path)
                        }
                        
                        backups.append(backup_info)
                        
                    except Exception as e:
                        logger.error(f"Error reading backup file {file_path}: {e}")
        
        # Ordenar por fecha de creación (más reciente primero)
        backups.sort(key=lambda x: x["created_at"], reverse=True)
        
        return backups
    
    def _format_bytes(self, bytes_size: int) -> str:
        """Formatear tamaño en bytes a formato legible"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if bytes_size < 1024.0:
                return f"{bytes_size:.1f} {unit}"
            bytes_size /= 1024.0
        return f"{bytes_size:.1f} PB"
    
    async def schedule_automatic_backup(self, backup_type: str = BackupType.FULL):
        """Programar respaldo automático"""
        
        backup_id = f"auto_{backup_type}_{int(datetime.now().timestamp())}"
        
        try:
            logger.info(f"Starting scheduled {backup_type} backup: {backup_id}")
            
            # Notificar inicio
            await notification_service.notify_role(
                role="admin",
                notification_type=NotificationType.SYSTEM_ALERT,
                title="Respaldo Automático Iniciado",
                message=f"Iniciando respaldo automático: {backup_type}",
                priority=NotificationPriority.LOW,
                data={"backup_id": backup_id, "backup_type": backup_type}
            )
            
            # Ejecutar respaldo según tipo
            if backup_type == BackupType.FULL:
                result = await self.create_full_backup(backup_id)
            elif backup_type == BackupType.DATABASE:
                result = await self.create_database_backup(backup_id)
            elif backup_type == BackupType.ATTACHMENTS:
                result = await self.create_attachments_backup(backup_id)
            else:
                raise ValueError(f"Unsupported backup type: {backup_type}")
            
            # Limpiar respaldos antiguos
            cleanup_result = await self.cleanup_old_backups()
            
            # Notificar resultado
            if result["status"] == BackupStatus.COMPLETED:
                await notification_service.notify_role(
                    role="admin",
                    notification_type=NotificationType.SYSTEM_ALERT,
                    title="Respaldo Automático Completado",
                    message=f"Respaldo {backup_type} completado exitosamente",
                    priority=NotificationPriority.LOW,
                    data={
                        "backup_id": backup_id,
                        "backup_type": backup_type,
                        "size_bytes": result.get("total_size_bytes", result.get("size_bytes", 0)),
                        "cleanup": cleanup_result
                    }
                )
            else:
                await notification_service.notify_role(
                    role="admin",
                    notification_type=NotificationType.SYSTEM_ALERT,
                    title="Respaldo Automático Falló",
                    message=f"Error en respaldo {backup_type}: {result.get('error', 'Unknown error')}",
                    priority=NotificationPriority.HIGH,
                    data={"backup_id": backup_id, "backup_type": backup_type, "error": result.get("error")}
                )
            
            # Actualizar última fecha de respaldo
            set_system_config("last_backup_date", datetime.now().isoformat())
            
            return result
            
        except Exception as e:
            logger.error(f"Scheduled backup failed: {e}")
            
            await notification_service.notify_role(
                role="admin",
                notification_type=NotificationType.SYSTEM_ALERT,
                title="Error en Respaldo Automático",
                message=f"Fallo crítico en respaldo {backup_type}: {str(e)}",
                priority=NotificationPriority.CRITICAL,
                data={"backup_id": backup_id, "backup_type": backup_type, "error": str(e)}
            )
            
            return {
                "id": backup_id,
                "type": backup_type,
                "status": BackupStatus.FAILED,
                "error": str(e),
                "started_at": datetime.now().isoformat(),
                "completed_at": datetime.now().isoformat()
            }

# Instancia global del servicio de respaldos
backup_service = BackupService()

# Task para respaldos automáticos programados
async def automated_backup_task():
    """Task para ejecutar respaldos automáticos según programación"""
    
    while True:
        try:
            # Verificar si es hora de hacer respaldo automático
            last_backup_str = get_system_config("last_backup_date", "1970-01-01T00:00:00")
            last_backup = datetime.fromisoformat(last_backup_str.replace('Z', '+00:00').replace('+00:00', ''))
            
            # Respaldo diario a las 2:00 AM
            now = datetime.now()
            if (now.hour == 2 and now.minute == 0 and 
                (now.date() - last_backup.date()).days >= 1):
                
                await backup_service.schedule_automatic_backup(BackupType.FULL)
            
            # Esperar 1 hora antes de verificar nuevamente
            await asyncio.sleep(3600)
            
        except Exception as e:
            logger.error(f"Error in automated backup task: {e}")
            await asyncio.sleep(3600)  # Esperar antes de reintentar
