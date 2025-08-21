"""
Servicio de Gmail API para VITAL RED
Conexión con Gmail usando librerías Python puras para procesamiento masivo
"""

import base64
import json
import email
import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any, Tuple
import asyncio
import aiohttp
import logging
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import email.utils
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from config.settings import settings

logger = logging.getLogger("vitalred_gmail.gmail_service")

class GmailService:
    """
    Servicio para interactuar con Gmail API
    Optimizado para procesamiento masivo de correos médicos
    """
    
    def __init__(self):
        self.service = None
        self.credentials = None
        self.is_initialized = False
        
        # Configuración para procesamiento masivo
        self.batch_size = settings.gmail_batch_size
        self.max_daily_emails = settings.gmail_max_daily_emails
        
        # Filtros específicos para correos médicos
        self.medical_query_filters = self._build_medical_filters()
        
    def _build_medical_filters(self) -> str:
        """
        Construir filtros Gmail para correos médicos relevantes
        """
        # Palabras clave médicas
        keywords = " OR ".join([f'"{keyword}"' for keyword in settings.medical_keywords])
        
        # Filtro base combinado
        base_filter = settings.gmail_query_filter
        medical_filter = f"({keywords})"
        
        # Excluir spam y papelera
        exclude_filter = "-in:spam -in:trash"
        
        return f"{base_filter} {medical_filter} {exclude_filter}"
    
    async def initialize(self) -> bool:
        """
        Inicializar conexión con Gmail API
        """
        try:
            logger.info("🔄 Inicializando Gmail API...")
            
            # Cargar credenciales
            creds = self._load_credentials()
            
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    logger.info("Renovando token de acceso...")
                    creds.refresh(Request())
                else:
                    logger.info("Iniciando flujo de autenticación...")
                    creds = await self._run_auth_flow()
                
                # Guardar credenciales
                self._save_credentials(creds)
            
            # Crear servicio
            self.credentials = creds
            self.service = build('gmail', 'v1', credentials=creds)
            self.is_initialized = True
            
            # Verificar conexión
            profile = self.service.users().getProfile(userId='me').execute()
            logger.info(f"✅ Gmail API inicializada para: {profile.get('emailAddress')}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error inicializando Gmail API: {e}")
            self.is_initialized = False
            return False
    
    def _load_credentials(self) -> Optional[Credentials]:
        """Cargar credenciales guardadas"""
        token_file = Path(settings.gmail_token_file)
        if token_file.exists():
            try:
                return Credentials.from_authorized_user_file(str(token_file), settings.gmail_scopes)
            except Exception as e:
                logger.warning(f"Error cargando credenciales: {e}")
        return None
    
    def _save_credentials(self, creds: Credentials):
        """Guardar credenciales"""
        try:
            with open(settings.gmail_token_file, 'w') as token:
                token.write(creds.to_json())
            logger.info("✅ Credenciales guardadas")
        except Exception as e:
            logger.error(f"Error guardando credenciales: {e}")
    
    async def _run_auth_flow(self) -> Credentials:
        """Ejecutar flujo de autenticación OAuth2"""
        credentials_file = Path(settings.gmail_credentials_file)
        if not credentials_file.exists():
            raise FileNotFoundError(
                f"Archivo de credenciales no encontrado: {credentials_file}\\n"
                f"Descarga credentials.json desde Google Cloud Console y colócalo en la raíz del proyecto"
            )
        
        flow = InstalledAppFlow.from_client_secrets_file(
            str(credentials_file), settings.gmail_scopes
        )
        
        # Ejecutar flujo local
        creds = flow.run_local_server(port=0)
        return creds
    
    def is_connected(self) -> bool:
        """Verificar si la conexión está activa"""
        return self.is_initialized and self.service is not None
    
    async def get_recent_emails(self, max_results: int = None, since_date: datetime = None) -> List[Dict]:
        """
        Obtener correos recientes con filtros médicos
        """
        if not self.is_connected():
            raise Exception("Gmail API no está inicializada")
        
        try:
            # Construir query
            query = self.medical_query_filters
            
            if since_date:
                date_str = since_date.strftime('%Y/%m/%d')
                query += f" after:{date_str}"
            
            # Limitar resultados
            max_results = max_results or self.batch_size
            
            logger.info(f"🔍 Buscando correos con query: {query}")
            
            # Buscar mensajes
            results = self.service.users().messages().list(
                userId='me',
                q=query,
                maxResults=max_results
            ).execute()
            
            messages = results.get('messages', [])
            logger.info(f"📧 Encontrados {len(messages)} correos")
            
            # Procesar en lotes para optimizar
            email_details = []
            for i in range(0, len(messages), 10):  # Lotes de 10
                batch = messages[i:i+10]
                batch_details = await self._get_emails_batch(batch)
                email_details.extend(batch_details)
            
            return email_details
            
        except HttpError as e:
            logger.error(f"Error de Gmail API: {e}")
            raise
        except Exception as e:
            logger.error(f"Error obteniendo correos: {e}")
            raise
    
    async def _get_emails_batch(self, message_ids: List[Dict]) -> List[Dict]:
        """
        Obtener detalles de un lote de correos
        """
        email_details = []
        
        for msg_data in message_ids:
            try:
                msg_id = msg_data['id']
                
                # Obtener mensaje completo
                message = self.service.users().messages().get(
                    userId='me',
                    id=msg_id,
                    format='full'
                ).execute()
                
                # Procesar mensaje
                email_data = await self._process_email_message(message)
                if email_data:
                    email_details.append(email_data)
                    
            except Exception as e:
                logger.error(f"Error procesando mensaje {msg_data.get('id')}: {e}")
                continue
        
        return email_details
    
    async def _process_email_message(self, message: Dict) -> Optional[Dict]:
        """
        Procesar un mensaje de Gmail y extraer información relevante
        """
        try:
            msg_id = message['id']
            thread_id = message['threadId']
            
            # Obtener headers
            headers = {h['name']: h['value'] for h in message['payload'].get('headers', [])}
            
            # Información básica
            subject = headers.get('Subject', '')
            sender = headers.get('From', '')
            recipient = headers.get('To', '')
            date_str = headers.get('Date', '')
            
            # Parsear fecha
            received_at = self._parse_email_date(date_str)
            
            # Parsear sender
            sender_email, sender_name = self._parse_email_address(sender)
            recipient_email, recipient_name = self._parse_email_address(recipient)
            
            # Obtener contenido del cuerpo
            body_text, body_html = self._extract_email_body(message['payload'])
            
            # Obtener snippet
            snippet = message.get('snippet', '')
            
            # Procesar adjuntos
            attachments = await self._extract_attachments_info(message['payload'], msg_id)
            
            # Obtener labels
            label_ids = message.get('labelIds', [])
            
            # Análisis médico del contenido
            medical_analysis = self._analyze_medical_content(subject, body_text, sender_email)
            
            email_data = {
                'id': msg_id,
                'thread_id': thread_id,
                'subject': subject,
                'sender_email': sender_email,
                'sender_name': sender_name,
                'recipient_email': recipient_email,
                'recipient_name': recipient_name,
                'received_at': received_at,
                'body_text': body_text,
                'body_html': body_html,
                'snippet': snippet,
                'attachments': attachments,
                'labels': label_ids,
                'headers': headers,
                'medical_analysis': medical_analysis
            }
            
            return email_data
            
        except Exception as e:
            logger.error(f"Error procesando email: {e}")
            return None
    
    def _extract_email_body(self, payload: Dict) -> Tuple[str, str]:
        """
        Extraer contenido del cuerpo del email (texto y HTML)
        """
        body_text = ""
        body_html = ""
        
        def extract_body_recursive(part):
            nonlocal body_text, body_html
            
            if 'parts' in part:
                for subpart in part['parts']:
                    extract_body_recursive(subpart)
            else:
                mime_type = part.get('mimeType', '')
                body_data = part.get('body', {}).get('data', '')
                
                if body_data:
                    try:
                        # Decodificar base64
                        decoded_data = base64.urlsafe_b64decode(body_data + '===').decode('utf-8')
                        
                        if mime_type == 'text/plain' and not body_text:
                            body_text = decoded_data
                        elif mime_type == 'text/html' and not body_html:
                            body_html = decoded_data
                            
                    except Exception as e:
                        logger.warning(f"Error decodificando cuerpo: {e}")
        
        extract_body_recursive(payload)
        return body_text, body_html
    
    async def _extract_attachments_info(self, payload: Dict, message_id: str) -> List[Dict]:
        """
        Extraer información de adjuntos
        """
        attachments = []
        
        def find_attachments_recursive(part):
            if 'parts' in part:
                for subpart in part['parts']:
                    find_attachments_recursive(subpart)
            else:
                if part.get('filename'):
                    attachment_id = part.get('body', {}).get('attachmentId')
                    if attachment_id:
                        attachments.append({
                            'id': attachment_id,
                            'filename': part['filename'],
                            'mime_type': part.get('mimeType', ''),
                            'size': part.get('body', {}).get('size', 0),
                            'message_id': message_id
                        })
        
        find_attachments_recursive(payload)
        return attachments
    
    async def download_attachment(self, message_id: str, attachment_id: str) -> bytes:
        """
        Descargar adjunto de Gmail
        """
        try:
            attachment = self.service.users().messages().attachments().get(
                userId='me',
                messageId=message_id,
                id=attachment_id
            ).execute()
            
            data = attachment['data']
            file_data = base64.urlsafe_b64decode(data + '===')
            
            return file_data
            
        except Exception as e:
            logger.error(f"Error descargando adjunto: {e}")
            raise
    
    def _parse_email_date(self, date_str: str) -> datetime:
        """Parsear fecha del email"""
        try:
            # Usar email.utils para parsear fecha RFC 2822
            parsed_date = email.utils.parsedate_tz(date_str)
            if parsed_date:
                timestamp = email.utils.mktime_tz(parsed_date)
                return datetime.fromtimestamp(timestamp)
        except:
            pass
        
        # Fallback a fecha actual
        return datetime.utcnow()
    
    def _parse_email_address(self, address_str: str) -> Tuple[str, str]:
        """
        Parsear dirección de email y nombre
        """
        try:
            parsed = email.utils.parseaddr(address_str)
            name, email_addr = parsed
            return email_addr.strip(), name.strip() if name else ""
        except:
            return address_str.strip(), ""
    
    def _analyze_medical_content(self, subject: str, body: str, sender: str) -> Dict:
        """
        Análisis básico de contenido médico
        """
        content = f"{subject} {body}".lower()
        
        # Buscar palabras clave médicas
        keywords_found = []
        for keyword in settings.medical_keywords:
            if keyword.lower() in content:
                keywords_found.append(keyword)
        
        # Detectar especialidades
        specialty_detected = None
        for specialty in settings.medical_specialties:
            if specialty.lower() in content:
                specialty_detected = specialty
                break
        
        # Detectar tipo de comunicación médica
        medical_category = "otros"
        if any(word in content for word in ["referencia", "remisión"]):
            medical_category = "referencia"
        elif any(word in content for word in ["contra-referencia", "contrarreferencia"]):
            medical_category = "contra-referencia"
        elif any(word in content for word in ["interconsulta", "consulta"]):
            medical_category = "interconsulta"
        elif any(word in content for word in ["urgencia", "urgente", "emergencia"]):
            medical_category = "urgencia"
        elif any(word in content for word in ["laboratorio", "lab", "examen"]):
            medical_category = "laboratorio"
        
        # Calcular score de confianza
        confidence_score = min(100, len(keywords_found) * 20)
        
        # Detectar prioridad basada en palabras clave
        priority = "Media"
        if any(word in content for word in ["urgente", "crítico", "emergencia", "inmediato"]):
            priority = "Alta"
        elif any(word in content for word in ["rutina", "programado", "seguimiento"]):
            priority = "Baja"
        
        return {
            'keywords_found': keywords_found,
            'specialty': specialty_detected,
            'medical_category': medical_category,
            'confidence_score': confidence_score,
            'priority': priority
        }
    
    async def mark_as_processed(self, message_id: str):
        """
        Marcar correo como procesado (agregar label)
        """
        try:
            # Agregar label personalizado
            self.service.users().messages().modify(
                userId='me',
                id=message_id,
                body={
                    'addLabelIds': ['UNREAD'],  # Mantener como no leído para seguimiento
                    'removeLabelIds': []
                }
            ).execute()
            
        except Exception as e:
            logger.warning(f"Error marcando como procesado: {e}")
    
    async def get_email_count_since(self, since_date: datetime) -> int:
        """
        Obtener cantidad de correos desde una fecha
        """
        try:
            date_str = since_date.strftime('%Y/%m/%d')
            query = f"{self.medical_query_filters} after:{date_str}"
            
            results = self.service.users().messages().list(
                userId='me',
                q=query,
                maxResults=1
            ).execute()
            
            return results.get('resultSizeEstimate', 0)
            
        except Exception as e:
            logger.error(f"Error obteniendo conteo: {e}")
            return 0
