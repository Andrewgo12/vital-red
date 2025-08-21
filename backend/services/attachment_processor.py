"""
Procesador de adjuntos médicos para VITAL RED
Extrae y analiza PDFs, imágenes y documentos médicos
"""

import os
import hashlib
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple
import mimetypes
import json

# Procesamiento de PDFs
import PyPDF2
import pdfplumber

# Procesamiento de imágenes
from PIL import Image, ImageEnhance
import cv2
import numpy as np

# OCR
import pytesseract
import easyocr

# Documentos Office
from docx import Document as DocxDocument
import openpyxl

# Análisis de texto
import re
from textblob import TextBlob

from models.database import Attachment
from config.settings import settings

logger = logging.getLogger("vitalred_gmail.attachment_processor")

class AttachmentProcessor:
    """
    Procesador especializado para adjuntos médicos
    Soporta PDFs, imágenes, documentos y extracción de contenido
    """
    
    def __init__(self):
        self.storage_path = Path(settings.attachments_base_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        
        # Configurar OCR
        self.easyocr_reader = easyocr.Reader(['es', 'en'])  # Español e inglés
        
        # Patrones médicos para clasificación
        self.medical_patterns = self._load_medical_patterns()
        
        # Tipos de archivo soportados
        self.supported_types = {
            'application/pdf': self._process_pdf,
            'image/jpeg': self._process_image,
            'image/png': self._process_image,
            'image/tiff': self._process_image,
            'application/msword': self._process_doc,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': self._process_docx,
            'text/plain': self._process_text,
        }
    
    def _load_medical_patterns(self) -> Dict[str, List[str]]:
        """
        Cargar patrones para clasificación de documentos médicos
        """
        return {
            'ECG': [
                r'electrocardiograma', r'ecg', r'ritmo\s+cardiaco', 
                r'frecuencia\s+cardiaca', r'derivaciones', r'ondas?\s+[pqrst]'
            ],
            'Radiografía': [
                r'radiografía', r'rayos?\s+x', r'rx', r'proyección',
                r'tórax', r'abdomen', r'extremidades', r'ap\s+y\s+lateral'
            ],
            'Laboratorio': [
                r'laboratorio', r'hemograma', r'química\s+sanguínea',
                r'glucosa', r'creatinina', r'urea', r'hemoglobina',
                r'hematocrito', r'plaquetas', r'leucocitos'
            ],
            'Historia Clínica': [
                r'historia\s+clínica', r'anamnesis', r'antecedentes',
                r'examen\s+físico', r'diagnóstico', r'plan\s+de\s+manejo'
            ],
            'Imagen Médica': [
                r'tomografía', r'resonancia', r'ecografía', r'ultrasonido',
                r'endoscopia', r'mamografía', r'tac', r'rm', r'eco'
            ],
            'Documento': [
                r'informe', r'reporte', r'concepto', r'valoración',
                r'interconsulta', r'referencia', r'contrarreferencia'
            ]
        }
    
    async def process_attachment(self, email_id: str, attachment_data: Dict, file_data: bytes) -> Optional[Attachment]:
        """
        Procesar un adjunto médico completo
        """
        try:
            logger.info(f"📎 Procesando adjunto: {attachment_data.get('filename')}")
            
            # Validar archivo
            if not self._validate_attachment(attachment_data, file_data):
                logger.warning(f"Adjunto no válido: {attachment_data.get('filename')}")
                return None
            
            # Generar hash del archivo
            file_hash = hashlib.sha256(file_data).hexdigest()
            
            # Verificar si ya existe (evitar duplicados)
            existing_path = self._find_existing_file(file_hash)
            if existing_path:
                logger.info(f"Archivo ya existe: {existing_path}")
                file_path = existing_path
            else:
                # Guardar archivo en disco
                file_path = await self._save_attachment_file(
                    attachment_data['filename'], 
                    file_data, 
                    file_hash
                )
            
            # Extraer contenido y metadatos
            extraction_result = await self._extract_content(
                file_path, 
                attachment_data['mime_type']
            )
            
            # Clasificar tipo médico
            medical_classification = self._classify_medical_type(
                attachment_data['filename'],
                extraction_result.get('text_content', ''),
                extraction_result.get('metadata', {})
            )
            
            # Crear registro de adjunto
            attachment_record = Attachment(
                id=attachment_data['id'],
                email_id=email_id,
                filename=attachment_data['filename'],
                content_type=attachment_data['mime_type'],
                file_size=len(file_data),
                file_path=str(file_path),
                file_hash=file_hash,
                
                # Clasificación médica
                attachment_type=medical_classification['type'],
                medical_relevance=medical_classification['relevance'],
                
                # Contenido extraído
                text_content=extraction_result.get('text_content', ''),
                metadata=json.dumps(extraction_result.get('metadata', {})),
                keywords_found=json.dumps(medical_classification.get('keywords', [])),
                
                processed_status='completed'
            )
            
            logger.info(f"✅ Adjunto procesado: {attachment_data['filename']} ({medical_classification['type']})")
            return attachment_record
            
        except Exception as e:
            logger.error(f"❌ Error procesando adjunto {attachment_data.get('filename')}: {e}")
            return None
    
    def _validate_attachment(self, attachment_data: Dict, file_data: bytes) -> bool:
        """
        Validar adjunto antes de procesar
        """
        # Verificar tamaño
        if len(file_data) > settings.max_attachment_size:
            logger.warning(f"Archivo muy grande: {len(file_data)} bytes")
            return False
        
        # Verificar tipo MIME
        if attachment_data['mime_type'] not in settings.allowed_attachment_types:
            logger.warning(f"Tipo no permitido: {attachment_data['mime_type']}")
            return False
        
        # Verificar que no esté vacío
        if len(file_data) == 0:
            logger.warning("Archivo vacío")
            return False
        
        return True
    
    def _find_existing_file(self, file_hash: str) -> Optional[Path]:
        """
        Buscar archivo existente por hash
        """
        for file_path in self.storage_path.rglob("*"):
            if file_path.is_file() and file_hash in file_path.name:
                return file_path
        return None
    
    async def _save_attachment_file(self, filename: str, file_data: bytes, file_hash: str) -> Path:
        """
        Guardar adjunto en disco con estructura organizada
        """
        # Crear estructura de directorios por fecha
        today = datetime.now()
        dir_path = self.storage_path / str(today.year) / f"{today.month:02d}" / f"{today.day:02d}"
        dir_path.mkdir(parents=True, exist_ok=True)
        
        # Limpiar nombre de archivo
        safe_filename = self._sanitize_filename(filename)
        
        # Agregar hash para evitar colisiones
        name_parts = safe_filename.rsplit('.', 1)
        if len(name_parts) == 2:
            safe_filename = f"{name_parts[0]}_{file_hash[:8]}.{name_parts[1]}"
        else:
            safe_filename = f"{safe_filename}_{file_hash[:8]}"
        
        file_path = dir_path / safe_filename
        
        # Guardar archivo
        with open(file_path, 'wb') as f:
            f.write(file_data)
        
        logger.info(f"💾 Archivo guardado: {file_path}")
        return file_path
    
    def _sanitize_filename(self, filename: str) -> str:
        """
        Limpiar nombre de archivo para sistema de archivos
        """
        # Remover caracteres especiales
        safe_name = re.sub(r'[<>:"/\\|?*]', '_', filename)
        # Limitar longitud
        if len(safe_name) > 100:
            name_parts = safe_name.rsplit('.', 1)
            if len(name_parts) == 2:
                safe_name = f"{name_parts[0][:90]}.{name_parts[1]}"
            else:
                safe_name = safe_name[:100]
        
        return safe_name
    
    async def _extract_content(self, file_path: Path, mime_type: str) -> Dict[str, Any]:
        """
        Extraer contenido según el tipo de archivo
        """
        try:
            if mime_type in self.supported_types:
                processor_func = self.supported_types[mime_type]
                return await processor_func(file_path)
            else:
                logger.warning(f"Tipo no soportado para extracción: {mime_type}")
                return {'text_content': '', 'metadata': {}}
        
        except Exception as e:
            logger.error(f"Error extrayendo contenido de {file_path}: {e}")
            return {'text_content': '', 'metadata': {'extraction_error': str(e)}}
    
    async def _process_pdf(self, file_path: Path) -> Dict[str, Any]:
        """
        Procesar archivo PDF
        """
        text_content = ""
        metadata = {}
        
        try:
            # Usar pdfplumber para extracción de texto avanzada
            with pdfplumber.open(file_path) as pdf:
                metadata['pages'] = len(pdf.pages)
                metadata['pdf_metadata'] = pdf.metadata
                
                # Extraer texto de todas las páginas
                for page_num, page in enumerate(pdf.pages):
                    page_text = page.extract_text()
                    if page_text:
                        text_content += f"\\n--- Página {page_num + 1} ---\\n{page_text}"
                    
                    # Extraer tablas si las hay
                    tables = page.extract_tables()
                    if tables:
                        metadata[f'tables_page_{page_num + 1}'] = len(tables)
                        for table_num, table in enumerate(tables):
                            table_text = self._table_to_text(table)
                            text_content += f"\\n--- Tabla {table_num + 1} (Página {page_num + 1}) ---\\n{table_text}"
            
            # Fallback con PyPDF2 si pdfplumber falla
            if not text_content.strip():
                text_content = await self._extract_pdf_pypdf2(file_path)
            
            # Análisis adicional para PDFs médicos
            medical_analysis = self._analyze_medical_pdf_content(text_content)
            metadata.update(medical_analysis)
            
        except Exception as e:
            logger.error(f"Error procesando PDF: {e}")
            metadata['pdf_error'] = str(e)
        
        return {
            'text_content': text_content,
            'metadata': metadata
        }
    
    async def _extract_pdf_pypdf2(self, file_path: Path) -> str:
        """
        Extracción de PDF con PyPDF2 como fallback
        """
        text_content = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    if page_text:
                        text_content += f"\\n--- Página {page_num + 1} ---\\n{page_text}"
        except Exception as e:
            logger.error(f"Error con PyPDF2: {e}")
        
        return text_content
    
    def _table_to_text(self, table: List[List[str]]) -> str:
        """
        Convertir tabla extraída a texto legible
        """
        if not table:
            return ""
        
        text_lines = []
        for row in table:
            if row:  # Filtrar filas vacías
                row_text = " | ".join([cell if cell else "" for cell in row])
                text_lines.append(row_text)
        
        return "\\n".join(text_lines)
    
    def _analyze_medical_pdf_content(self, text_content: str) -> Dict[str, Any]:
        """
        Análisis específico para contenido médico en PDFs
        """
        analysis = {}
        
        # Detectar si es un laboratorio por estructura
        if re.search(r'\\b(?:resultado|valor|referencia|unidad)\\b', text_content, re.IGNORECASE):
            analysis['likely_lab_report'] = True
        
        # Detectar fechas médicas
        date_patterns = [
            r'\\b(?:fecha|date):\\s*(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})\\b',
            r'\\b(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})\\b'
        ]
        
        dates_found = []
        for pattern in date_patterns:
            matches = re.findall(pattern, text_content, re.IGNORECASE)
            dates_found.extend(matches)
        
        if dates_found:
            analysis['dates_found'] = dates_found[:5]  # Limitar a 5 fechas
        
        # Detectar valores numéricos (posibles resultados)
        numeric_values = re.findall(r'\\b\\d+\\.?\\d*\\s*(?:mg/dl|mmol/L|ng/ml|mg/L|%)\\b', text_content)
        if numeric_values:
            analysis['numeric_values_count'] = len(numeric_values)
        
        return analysis
    
    async def _process_image(self, file_path: Path) -> Dict[str, Any]:
        """
        Procesar imagen médica con OCR
        """
        text_content = ""
        metadata = {}
        
        try:
            # Abrir imagen
            with Image.open(file_path) as img:
                # Metadatos básicos
                metadata['image_size'] = img.size
                metadata['image_mode'] = img.mode
                metadata['image_format'] = img.format
                
                # Convertir a RGB si es necesario
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Preprocesar imagen para mejor OCR
                processed_img = self._preprocess_image_for_ocr(img)
                
                # OCR con EasyOCR (mejor para texto en español)
                try:
                    results = self.easyocr_reader.readtext(np.array(processed_img))
                    easyocr_text = " ".join([result[1] for result in results if result[2] > 0.5])
                    text_content += f"EasyOCR: {easyocr_text}\\n"
                    metadata['easyocr_confidence'] = np.mean([result[2] for result in results])
                except Exception as e:
                    logger.warning(f"Error con EasyOCR: {e}")
                
                # OCR con Tesseract como respaldo
                try:
                    # Configurar Tesseract para español
                    custom_config = r'--oem 3 --psm 6 -l spa+eng'
                    tesseract_text = pytesseract.image_to_string(processed_img, config=custom_config)
                    if tesseract_text.strip():
                        text_content += f"Tesseract: {tesseract_text}\\n"
                except Exception as e:
                    logger.warning(f"Error con Tesseract: {e}")
                
                # Análisis de imagen médica
                medical_analysis = self._analyze_medical_image(img, text_content)
                metadata.update(medical_analysis)
        
        except Exception as e:
            logger.error(f"Error procesando imagen: {e}")
            metadata['image_error'] = str(e)
        
        return {
            'text_content': text_content,
            'metadata': metadata
        }
    
    def _preprocess_image_for_ocr(self, img: Image.Image) -> Image.Image:
        """
        Preprocesar imagen para mejorar OCR
        """
        # Convertir a numpy array para OpenCV
        img_array = np.array(img)
        
        # Convertir a escala de grises
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Reducir ruido
        denoised = cv2.medianBlur(gray, 3)
        
        # Mejorar contraste
        enhanced = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8)).apply(denoised)
        
        # Binarización adaptativa
        binary = cv2.adaptiveThreshold(
            enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        
        # Convertir de vuelta a PIL
        return Image.fromarray(binary)
    
    def _analyze_medical_image(self, img: Image.Image, ocr_text: str) -> Dict[str, Any]:
        """
        Análisis específico para imágenes médicas
        """
        analysis = {}
        
        # Análisis de dimensiones (detectar tipo probable)
        width, height = img.size
        aspect_ratio = width / height
        
        if aspect_ratio > 1.5:
            analysis['probable_scan_type'] = 'panoramic_xray'
        elif 0.7 <= aspect_ratio <= 1.3:
            analysis['probable_scan_type'] = 'standard_image'
        else:
            analysis['probable_scan_type'] = 'unknown'
        
        # Detectar si hay texto médico en la imagen
        medical_text_indicators = [
            'hospital', 'clinic', 'patient', 'date', 'edad', 'sexo',
            'radiografía', 'ecografía', 'rx', 'eco'
        ]
        
        found_indicators = [
            indicator for indicator in medical_text_indicators 
            if indicator.lower() in ocr_text.lower()
        ]
        
        if found_indicators:
            analysis['medical_text_indicators'] = found_indicators
            analysis['likely_medical_image'] = True
        
        return analysis
    
    async def _process_docx(self, file_path: Path) -> Dict[str, Any]:
        """
        Procesar documento Word (.docx)
        """
        text_content = ""
        metadata = {}
        
        try:
            doc = DocxDocument(file_path)
            
            # Extraer texto de párrafos
            paragraphs_text = []
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    paragraphs_text.append(paragraph.text)
            
            text_content = "\\n".join(paragraphs_text)
            
            # Extraer texto de tablas
            tables_text = []
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join([cell.text for cell in row.cells])
                    tables_text.append(row_text)
            
            if tables_text:
                text_content += "\\n\\n--- TABLAS ---\\n" + "\\n".join(tables_text)
            
            # Metadatos del documento
            metadata['paragraphs_count'] = len(doc.paragraphs)
            metadata['tables_count'] = len(doc.tables)
            
            if hasattr(doc.core_properties, 'author') and doc.core_properties.author:
                metadata['author'] = doc.core_properties.author
            
            if hasattr(doc.core_properties, 'created') and doc.core_properties.created:
                metadata['created_date'] = doc.core_properties.created.isoformat()
        
        except Exception as e:
            logger.error(f"Error procesando DOCX: {e}")
            metadata['docx_error'] = str(e)
        
        return {
            'text_content': text_content,
            'metadata': metadata
        }
    
    async def _process_doc(self, file_path: Path) -> Dict[str, Any]:
        """
        Procesar documento Word (.doc) - versión limitada
        """
        # Para archivos .doc antiguos, la extracción es más limitada
        return {
            'text_content': f"Documento Word (.doc): {file_path.name}\\nExtracción de texto no disponible para este formato.",
            'metadata': {'format': 'legacy_doc', 'extraction_limited': True}
        }
    
    async def _process_text(self, file_path: Path) -> Dict[str, Any]:
        """
        Procesar archivo de texto plano
        """
        text_content = ""
        metadata = {}
        
        try:
            # Intentar diferentes codificaciones
            encodings = ['utf-8', 'latin-1', 'cp1252']
            
            for encoding in encodings:
                try:
                    with open(file_path, 'r', encoding=encoding) as f:
                        text_content = f.read()
                    metadata['encoding_used'] = encoding
                    break
                except UnicodeDecodeError:
                    continue
            
            if not text_content:
                text_content = "Error: No se pudo decodificar el archivo"
                metadata['encoding_error'] = True
            else:
                # Estadísticas básicas
                metadata['character_count'] = len(text_content)
                metadata['line_count'] = text_content.count('\\n')
                metadata['word_count'] = len(text_content.split())
        
        except Exception as e:
            logger.error(f"Error procesando texto: {e}")
            metadata['text_error'] = str(e)
        
        return {
            'text_content': text_content,
            'metadata': metadata
        }
    
    def _classify_medical_type(self, filename: str, text_content: str, metadata: Dict) -> Dict[str, Any]:
        """
        Clasificar tipo de documento médico
        """
        classification = {
            'type': 'Otros',
            'relevance': 'Unknown',
            'keywords': [],
            'confidence': 0
        }
        
        # Combinar filename y contenido para análisis
        full_content = f"{filename} {text_content}".lower()
        
        # Buscar patrones médicos
        max_matches = 0
        best_type = 'Otros'
        all_keywords = []
        
        for doc_type, patterns in self.medical_patterns.items():
            matches = 0
            type_keywords = []
            
            for pattern in patterns:
                if re.search(pattern, full_content, re.IGNORECASE):
                    matches += 1
                    type_keywords.append(pattern)
            
            if matches > max_matches:
                max_matches = matches
                best_type = doc_type
                all_keywords = type_keywords
        
        if max_matches > 0:
            classification['type'] = best_type
            classification['keywords'] = all_keywords
            classification['confidence'] = min(100, max_matches * 20)
            
            # Determinar relevancia médica
            if max_matches >= 3:
                classification['relevance'] = 'High'
            elif max_matches >= 2:
                classification['relevance'] = 'Medium'
            else:
                classification['relevance'] = 'Low'
        
        # Factores adicionales para relevancia
        if any(keyword in full_content for keyword in ['paciente', 'diagnóstico', 'tratamiento']):
            if classification['relevance'] == 'Unknown':
                classification['relevance'] = 'Medium'
        
        # Verificar metadatos específicos
        if metadata.get('likely_lab_report'):
            classification['type'] = 'Laboratorio'
            classification['relevance'] = 'High'
        
        if metadata.get('likely_medical_image'):
            classification['relevance'] = 'High'
        
        return classification
