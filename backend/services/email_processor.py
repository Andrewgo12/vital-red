"""
Procesador de correos masivo para VITAL RED
Optimizado para manejar 2000+ correos diarios
"""

import asyncio
import logging
import hashlib
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any, Tuple
from pathlib import Path
import re
from concurrent.futures import ThreadPoolExecutor

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func, text
from sqlalchemy.exc import IntegrityError

from models.database import Email, Attachment, ProcessingLog, SyncStatus, get_system_config, set_system_config
from models.email_models import EmailResponse, EmailDetail, AttachmentResponse, DashboardStats, DailyStats
from services.gmail_service import GmailService
from services.attachment_processor import AttachmentProcessor
from config.settings import settings

logger = logging.getLogger("vitalred_gmail.email_processor")

class EmailProcessor:
    """
    Procesador principal de correos médicos
    Maneja sincronización masiva, análisis y almacenamiento
    """
    
    def __init__(self):
        self.gmail_service = GmailService()
        self.attachment_processor = AttachmentProcessor()
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Control de procesamiento
        self.is_processing = False
        self.current_sync_id = None
        
        # Métricas
        self.processed_count = 0
        self.error_count = 0
        self.start_time = None
    
    async def sync_emails(self, force_full_sync: bool = False) -> Dict[str, Any]:
        """
        Sincronización principal de correos desde Gmail
        """
        if self.is_processing:
            return {"error": "Sync already in progress"}
        
        self.is_processing = True
        self.start_time = datetime.utcnow()
        
        try:
            logger.info("🔄 Iniciando sincronización masiva de correos médicos...")
            
            # Crear registro de sincronización
            sync_record = await self._create_sync_record()
            self.current_sync_id = sync_record.id
            
            # Determinar fecha de última sincronización
            if force_full_sync:
                since_date = datetime.utcnow() - timedelta(days=30)  # Último mes
            else:
                last_sync = get_system_config("last_sync_time", "1970-01-01T00:00:00Z")
                since_date = datetime.fromisoformat(last_sync.replace('Z', '+00:00'))
            
            logger.info(f"📅 Sincronizando correos desde: {since_date}")
            
            # Obtener correos de Gmail
            emails_data = await self.gmail_service.get_recent_emails(
                max_results=settings.gmail_max_daily_emails,
                since_date=since_date
            )
            
            logger.info(f"📧 Obtenidos {len(emails_data)} correos de Gmail")
            
            # Procesar correos en lotes
            results = await self._process_emails_batch(emails_data)
            
            # Actualizar registro de sincronización
            await self._complete_sync_record(sync_record, results)
            
            # Actualizar última sincronización
            set_system_config("last_sync_time", datetime.utcnow().isoformat())
            
            logger.info(f"✅ Sincronización completada: {results['processed']} correos procesados")
            
            return results
            
        except Exception as e:
            logger.error(f"❌ Error en sincronización: {e}")
            await self._log_error("sync_emails", str(e))
            raise
        finally:
            self.is_processing = False
            self.current_sync_id = None
    
    async def _create_sync_record(self) -> SyncStatus:
        """Crear registro de sincronización"""
        from models.database import SessionLocal
        
        db = SessionLocal()
        try:
            sync_record = SyncStatus(
                sync_type="automatic",
                started_at=datetime.utcnow(),
                status="running"
            )
            db.add(sync_record)
            db.commit()
            db.refresh(sync_record)
            return sync_record
        finally:
            db.close()
    
    async def _complete_sync_record(self, sync_record: SyncStatus, results: Dict):
        """Completar registro de sincronización"""
        from models.database import SessionLocal
        
        db = SessionLocal()
        try:
            sync_record.completed_at = datetime.utcnow()
            sync_record.status = "completed" if results['errors'] == 0 else "partial_errors"
            sync_record.emails_processed = results['processed']
            sync_record.emails_new = results['new_emails']
            sync_record.emails_errors = results['errors']
            
            db.commit()
        finally:
            db.close()
    
    async def _process_emails_batch(self, emails_data: List[Dict]) -> Dict[str, int]:
        """
        Procesar lote de correos de forma optimizada
        """
        results = {
            'processed': 0,
            'new_emails': 0,
            'updated': 0,
            'errors': 0,
            'attachments': 0
        }
        
        # Procesar en chunks más pequeños para optimizar memoria
        chunk_size = 10
        
        for i in range(0, len(emails_data), chunk_size):
            chunk = emails_data[i:i + chunk_size]
            
            # Procesar chunk en paralelo usando thread pool
            tasks = []
            for email_data in chunk:
                task = asyncio.create_task(self._process_single_email(email_data))
                tasks.append(task)
            
            # Esperar completación del chunk
            chunk_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Consolidar resultados
            for result in chunk_results:
                if isinstance(result, Exception):
                    results['errors'] += 1
                    logger.error(f"Error procesando email: {result}")
                elif isinstance(result, dict):
                    for key in ['processed', 'new_emails', 'updated', 'attachments']:
                        results[key] += result.get(key, 0)
            
            # Log progreso
            progress = (i + len(chunk)) / len(emails_data) * 100
            logger.info(f"📊 Progreso: {progress:.1f}% ({i + len(chunk)}/{len(emails_data)})")
        
        return results
    
    async def _process_single_email(self, email_data: Dict) -> Dict[str, int]:
        """
        Procesar un solo correo
        """
        from models.database import SessionLocal
        
        result = {'processed': 0, 'new_emails': 0, 'updated': 0, 'attachments': 0}
        
        db = SessionLocal()
        try:
            email_id = email_data['id']
            
            # Verificar si ya existe
            existing_email = db.query(Email).filter(Email.id == email_id).first()
            
            if existing_email:
                # Actualizar si es necesario
                if await self._should_update_email(existing_email, email_data):
                    await self._update_existing_email(db, existing_email, email_data)
                    result['updated'] = 1
                result['processed'] = 1
                return result
            
            # Crear nuevo email
            email_record = await self._create_email_record(email_data)
            db.add(email_record)
            db.flush()  # Para obtener el ID
            
            # Procesar adjuntos
            attachments_processed = 0
            if email_data.get('attachments'):
                attachments_processed = await self._process_email_attachments(
                    db, email_id, email_data['attachments']
                )
            
            # Actualizar contadores de adjuntos
            email_record.has_attachments = attachments_processed > 0
            email_record.attachment_count = attachments_processed
            
            db.commit()
            
            # Marcar como procesado en Gmail
            await self.gmail_service.mark_as_processed(email_id)
            
            result.update({
                'processed': 1,
                'new_emails': 1,
                'attachments': attachments_processed
            })
            
            await self._log_processing("process_email", email_id, "success", 
                                     f"Email procesado con {attachments_processed} adjuntos")
            
            return result
            
        except IntegrityError as e:
            db.rollback()
            logger.warning(f"Email duplicado ignorado: {email_data.get('id')}")
            result['processed'] = 1
            return result
            
        except Exception as e:
            db.rollback()
            await self._log_error("process_single_email", str(e), email_data.get('id'))
            raise
        finally:
            db.close()
    
    async def _create_email_record(self, email_data: Dict) -> Email:
        """
        Crear registro de email en base de datos
        """
        medical_analysis = email_data.get('medical_analysis', {})
        
        # Extraer información del paciente usando regex
        patient_info = self._extract_patient_info(
            email_data.get('subject', '') + ' ' + email_data.get('body_text', '')
        )
        
        # Extraer información hospitalaria
        hospital_info = self._extract_hospital_info(
            email_data.get('sender_email', ''),
            email_data.get('body_text', '')
        )
        
        email_record = Email(
            id=email_data['id'],
            thread_id=email_data.get('thread_id'),
            subject=email_data['subject'][:500] if email_data['subject'] else '',
            sender_email=email_data['sender_email'],
            sender_name=email_data.get('sender_name', ''),
            recipient_email=email_data['recipient_email'],
            recipient_name=email_data.get('recipient_name', ''),
            received_at=email_data['received_at'],
            body_text=email_data.get('body_text', ''),
            body_html=email_data.get('body_html', ''),
            snippet=email_data.get('snippet', ''),
            
            # Clasificación médica
            medical_category=medical_analysis.get('medical_category', 'otros'),
            specialty=medical_analysis.get('specialty'),
            priority=medical_analysis.get('priority', 'Media'),
            urgency_level=self._determine_urgency_level(medical_analysis),
            
            # Información del paciente
            patient_name=patient_info.get('name'),
            patient_id=patient_info.get('id'),
            patient_age=patient_info.get('age'),
            patient_gender=patient_info.get('gender'),
            
            # Hospital/Institución
            referring_hospital=hospital_info.get('referring_hospital'),
            referring_doctor=hospital_info.get('referring_doctor'),
            receiving_hospital=hospital_info.get('receiving_hospital'),
            
            # Metadatos
            labels=json.dumps(email_data.get('labels', [])),
            headers=json.dumps(email_data.get('headers', {})),
            keywords_found=json.dumps(medical_analysis.get('keywords_found', [])),
            confidence_score=medical_analysis.get('confidence_score', 0),
            
            processing_status='processed'
        )
        
        return email_record
    
    def _extract_patient_info(self, content: str) -> Dict[str, Any]:
        """
        Extraer información del paciente usando regex
        """
        patient_info = {}
        
        # Patrones regex para información médica
        patterns = {
            'name': [
                r'paciente:?\s*([A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóú]+)+)',
                r'nombre:?\s*([A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóú]+)+)',
                r'señor[a]?\s+([A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóú]+)+)'
            ],
            'id': [
                r'(?:cédula|cc|identificación|documento):?\s*([0-9]{6,12})',
                r'id:?\s*([0-9]{6,12})'
            ],
            'age': [
                r'edad:?\s*(\d{1,3})\s*años?',
                r'(\d{1,3})\s*años?\s*de\s*edad'
            ],
            'gender': [
                r'(masculino|femenino|hombre|mujer|m|f)',
                r'género:?\s*(masculino|femenino|hombre|mujer)'
            ]
        }
        
        content_lower = content.lower()
        
        for field, field_patterns in patterns.items():
            for pattern in field_patterns:
                match = re.search(pattern, content_lower if field != 'name' else content)
                if match:
                    value = match.group(1).strip()
                    
                    if field == 'age':
                        try:
                            patient_info[field] = int(value)
                        except ValueError:
                            continue
                    elif field == 'gender':
                        # Normalizar género
                        if value.lower() in ['masculino', 'hombre', 'm']:
                            patient_info[field] = 'Masculino'
                        elif value.lower() in ['femenino', 'mujer', 'f']:
                            patient_info[field] = 'Femenino'
                    else:
                        patient_info[field] = value
                    break
        
        return patient_info
    
    def _extract_hospital_info(self, sender_email: str, content: str) -> Dict[str, Any]:
        """
        Extraer información hospitalaria
        """
        hospital_info = {}
        
        # Detectar hospital desde email
        hospital_domains = {
            'hospital': 'Hospital',
            'clinica': 'Clínica',
            'ips': 'IPS',
            'ese': 'ESE',
            'universitaria': 'Hospital Universitario'
        }
        
        for keyword, hospital_type in hospital_domains.items():
            if keyword in sender_email.lower():
                hospital_info['referring_hospital'] = f"{hospital_type} (desde email)"
                break
        
        # Buscar nombres de hospitales en el contenido
        hospital_patterns = [
            r'hospital\s+([A-ZÁÉÍÓÚ][a-záéíóú\s]+)',
            r'clínica\s+([A-ZÁÉÍÓÚ][a-záéíóú\s]+)',
            r'ese\s+([A-ZÁÉÍÓÚ][a-záéíóú\s]+)'
        ]
        
        for pattern in hospital_patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                hospital_name = match.group(0).strip()
                if not hospital_info.get('referring_hospital'):
                    hospital_info['referring_hospital'] = hospital_name
                break
        
        # Buscar médico referente
        doctor_patterns = [
            r'dr\.?\s+([A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóú]+)*)',
            r'médico:?\s+([A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóú]+)*)',
            r'referido\s+por:?\s+([A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóú]+)*)'
        ]
        
        for pattern in doctor_patterns:
            match = re.search(pattern, content)
            if match:
                hospital_info['referring_doctor'] = match.group(1).strip()
                break
        
        return hospital_info
    
    def _determine_urgency_level(self, medical_analysis: Dict) -> str:
        """
        Determinar nivel de urgencia basado en análisis médico
        """
        priority = medical_analysis.get('priority', 'Media')
        keywords = medical_analysis.get('keywords_found', [])
        
        critical_keywords = ['emergencia', 'crítico', 'urgente', 'inmediato', 'vital']
        moderate_keywords = ['prioridad', 'importante', 'seguimiento']
        
        if priority == 'Alta' or any(kw in ' '.join(keywords).lower() for kw in critical_keywords):
            return 'Crítica'
        elif any(kw in ' '.join(keywords).lower() for kw in moderate_keywords):
            return 'Moderada'
        else:
            return 'Normal'
    
    async def _process_email_attachments(self, db: Session, email_id: str, attachments_data: List[Dict]) -> int:
        """
        Procesar adjuntos de un email
        """
        processed_count = 0
        
        for attachment_data in attachments_data:
            try:
                # Descargar adjunto desde Gmail
                file_data = await self.gmail_service.download_attachment(
                    email_id, attachment_data['id']
                )
                
                # Procesar adjunto
                attachment_record = await self.attachment_processor.process_attachment(
                    email_id=email_id,
                    attachment_data=attachment_data,
                    file_data=file_data
                )
                
                if attachment_record:
                    db.add(attachment_record)
                    processed_count += 1
                
            except Exception as e:
                logger.error(f"Error procesando adjunto {attachment_data.get('id')}: {e}")
                continue
        
        return processed_count
    
    async def _should_update_email(self, existing_email: Email, email_data: Dict) -> bool:
        """
        Determinar si un email existente debe actualizarse
        """
        # Actualizar si el estado de procesamiento ha cambiado
        # o si hay nuevos adjuntos
        current_attachment_count = len(email_data.get('attachments', []))
        return existing_email.attachment_count != current_attachment_count
    
    async def _update_existing_email(self, db: Session, existing_email: Email, email_data: Dict):
        """
        Actualizar email existente
        """
        # Actualizar campos relevantes
        existing_email.updated_at = datetime.utcnow()
        
        # Procesar nuevos adjuntos si los hay
        if email_data.get('attachments'):
            new_attachments = await self._process_email_attachments(
                db, existing_email.id, email_data['attachments']
            )
            existing_email.attachment_count += new_attachments
            existing_email.has_attachments = existing_email.attachment_count > 0
    
    # === MÉTODOS DE CONSULTA ===
    
    async def get_emails_paginated(self, db: Session, skip: int = 0, limit: int = 50, **filters) -> List[EmailResponse]:
        """
        Obtener correos paginados con filtros
        """
        query = db.query(Email)
        
        # Aplicar filtros
        if filters.get('search'):
            search = f"%{filters['search']}%"
            query = query.filter(
                or_(
                    Email.subject.like(search),
                    Email.sender_email.like(search),
                    Email.body_text.like(search)
                )
            )
        
        if filters.get('sender'):
            query = query.filter(Email.sender_email.like(f"%{filters['sender']}%"))
        
        if filters.get('specialty'):
            query = query.filter(Email.specialty == filters['specialty'])
        
        if filters.get('priority'):
            query = query.filter(Email.priority == filters['priority'])
        
        if filters.get('has_attachments') is not None:
            query = query.filter(Email.has_attachments == filters['has_attachments'])
        
        if filters.get('date_from'):
            query = query.filter(Email.received_at >= filters['date_from'])
        
        if filters.get('date_to'):
            query = query.filter(Email.received_at <= filters['date_to'])
        
        # Ordenar por fecha reciente
        query = query.order_by(desc(Email.received_at))
        
        # Paginar
        emails = query.offset(skip).limit(limit).all()
        
        return [EmailResponse.from_orm(email) for email in emails]
    
    async def get_email_by_id(self, db: Session, email_id: str) -> Optional[EmailDetail]:
        """
        Obtener detalle de un email específico
        """
        email = db.query(Email).filter(Email.id == email_id).first()
        if not email:
            return None
        
        return EmailDetail.from_orm(email)
    
    async def get_attachments(self, db: Session, email_id: str) -> List[AttachmentResponse]:
        """
        Obtener adjuntos de un email
        """
        attachments = db.query(Attachment).filter(Attachment.email_id == email_id).all()
        return [AttachmentResponse.from_orm(att) for att in attachments]
    
    async def get_attachment_file_path(self, db: Session, attachment_id: str) -> Optional[str]:
        """
        Obtener ruta del archivo de adjunto
        """
        attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
        return attachment.file_path if attachment else None
    
    async def get_dashboard_stats(self, db: Session) -> DashboardStats:
        """
        Obtener estadísticas del dashboard
        """
        today = datetime.utcnow().date()
        
        # Consultas básicas
        total_emails = db.query(func.count(Email.id)).scalar()
        emails_today = db.query(func.count(Email.id)).filter(
            func.date(Email.received_at) == today
        ).scalar()
        
        # Por prioridad
        high_priority = db.query(func.count(Email.id)).filter(Email.priority == 'Alta').scalar()
        medium_priority = db.query(func.count(Email.id)).filter(Email.priority == 'Media').scalar()
        low_priority = db.query(func.count(Email.id)).filter(Email.priority == 'Baja').scalar()
        
        # Estadísticas por especialidad
        specialty_stats = dict(
            db.query(Email.specialty, func.count(Email.id))
            .filter(Email.specialty.isnot(None))
            .group_by(Email.specialty)
            .all()
        )
        
        # Adjuntos
        total_attachments = db.query(func.count(Attachment.id)).scalar()
        attachments_today = db.query(func.count(Attachment.id)).filter(
            func.date(Attachment.created_at) == today
        ).scalar()
        
        return DashboardStats(
            total_emails=total_emails or 0,
            emails_today=emails_today or 0,
            high_priority=high_priority or 0,
            medium_priority=medium_priority or 0,
            low_priority=low_priority or 0,
            specialties_stats=specialty_stats,
            total_attachments=total_attachments or 0,
            attachments_today=attachments_today or 0,
            last_sync_time=datetime.fromisoformat(
                get_system_config("last_sync_time", "1970-01-01T00:00:00").replace('Z', '')
            )
        )
    
    async def get_daily_stats(self, db: Session, days: int = 7) -> List[DailyStats]:
        """
        Obtener estadísticas diarias
        """
        start_date = datetime.utcnow().date() - timedelta(days=days)
        
        # Query con agrupación por fecha
        daily_data = db.query(
            func.date(Email.received_at).label('date'),
            func.count(Email.id).label('emails_received'),
            Email.medical_category,
            Email.specialty
        ).filter(
            func.date(Email.received_at) >= start_date
        ).group_by(
            func.date(Email.received_at),
            Email.medical_category,
            Email.specialty
        ).all()
        
        # Procesar datos por fecha
        stats_by_date = {}
        for row in daily_data:
            date_str = row.date.strftime('%Y-%m-%d')
            if date_str not in stats_by_date:
                stats_by_date[date_str] = DailyStats(
                    date=date_str,
                    by_category={},
                    by_specialty={}
                )
            
            stats_by_date[date_str].emails_received += row.emails_received
            
            if row.medical_category:
                stats_by_date[date_str].by_category[row.medical_category] = \
                    stats_by_date[date_str].by_category.get(row.medical_category, 0) + row.emails_received
            
            if row.specialty:
                stats_by_date[date_str].by_specialty[row.specialty] = \
                    stats_by_date[date_str].by_specialty.get(row.specialty, 0) + row.emails_received
        
        return list(stats_by_date.values())
    
    async def get_sync_status(self) -> Dict[str, Any]:
        """
        Obtener estado actual de sincronización
        """
        return {
            "is_running": self.is_processing,
            "processed_count": self.processed_count,
            "error_count": self.error_count,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "sync_id": self.current_sync_id
        }
    
    # === MÉTODOS DE LOGGING ===
    
    async def _log_processing(self, process_type: str, email_id: str, status: str, message: str):
        """Log de procesamiento exitoso"""
        await self._log_to_database(process_type, email_id, status, message)
    
    async def _log_error(self, process_type: str, error_message: str, email_id: str = None):
        """Log de error"""
        await self._log_to_database(process_type, email_id, "error", error_message, error_message)
    
    async def _log_to_database(self, process_type: str, email_id: str, status: str, 
                             message: str, error_details: str = None):
        """Guardar log en base de datos"""
        from models.database import SessionLocal
        
        db = SessionLocal()
        try:
            log_entry = ProcessingLog(
                process_type=process_type,
                email_id=email_id,
                status=status,
                message=message,
                error_details=error_details,
                processing_time_ms=0  # TODO: implementar medición de tiempo
            )
            db.add(log_entry)
            db.commit()
        except Exception as e:
            logger.error(f"Error guardando log: {e}")
        finally:
            db.close()
