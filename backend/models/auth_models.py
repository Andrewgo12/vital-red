"""
Modelos de autenticación y usuarios para VITAL RED
"""

from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum
import uuid

from models.database import Base

class UserRole(enum.Enum):
    """Roles de usuario en el sistema"""
    VIEWER = "viewer"           # Solo lectura
    MEDICO = "medico"          # Médico evaluador
    ADMIN = "admin"            # Administrador
    SUPERADMIN = "superadmin"  # Super administrador

class User(Base):
    """Modelo de usuario del sistema"""
    __tablename__ = "users"
    
    # Identificador único
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Información personal
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    
    # Autenticación
    password_hash = Column(String(255), nullable=False)
    
    # Información profesional
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.VIEWER)
    medical_license = Column(String(100))  # Número de licencia médica
    specialty = Column(String(100))        # Especialidad médica
    hospital = Column(String(255))         # Hospital de trabajo
    department = Column(String(100))       # Departamento
    
    # Contacto
    phone = Column(String(20))
    emergency_contact = Column(String(255))
    
    # Estado de cuenta
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    email_verified_at = Column(DateTime)
    
    # Configuración
    notifications_enabled = Column(Boolean, default=True)
    timezone = Column(String(50), default="America/Bogota")
    language = Column(String(10), default="es")
    
    # Metadatos
    last_login_at = Column(DateTime)
    last_login_ip = Column(String(45))
    failed_login_attempts = Column(String(10), default="0")
    locked_until = Column(DateTime)
    
    # Auditoria
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String(36), ForeignKey("users.id"))
    
    # Relaciones
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    created_users = relationship("User", remote_side=[id])
    
    def __repr__(self):
        return f"<User {self.username} ({self.role.value})>"
    
    @property
    def is_admin(self) -> bool:
        return self.role in [UserRole.ADMIN, UserRole.SUPERADMIN]
    
    @property
    def is_medico(self) -> bool:
        return self.role in [UserRole.MEDICO, UserRole.ADMIN, UserRole.SUPERADMIN]
    
    def can_access_emails(self) -> bool:
        """Verificar si puede acceder a correos médicos"""
        return self.role in [UserRole.MEDICO, UserRole.ADMIN, UserRole.SUPERADMIN]
    
    def can_manage_users(self) -> bool:
        """Verificar si puede gestionar usuarios"""
        return self.role in [UserRole.ADMIN, UserRole.SUPERADMIN]

class Session(Base):
    """Sesiones de usuario activas"""
    __tablename__ = "user_sessions"
    
    # Identificador
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Token info
    token_hash = Column(String(64), nullable=False, index=True)  # SHA-256 del JWT
    
    # Información de sesión
    ip_address = Column(String(45))
    user_agent = Column(Text)
    device_info = Column(Text)
    
    # Tiempos
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    last_activity_at = Column(DateTime, default=datetime.utcnow)
    revoked_at = Column(DateTime)
    
    # Relaciones
    user = relationship("User", back_populates="sessions")
    
    @property
    def is_active(self) -> bool:
        """Verificar si la sesión está activa"""
        now = datetime.utcnow()
        return (
            self.revoked_at is None and
            self.expires_at > now
        )
    
    def __repr__(self):
        return f"<Session {self.id} for {self.user.username}>"

class PermissionGroup(Base):
    """Grupos de permisos"""
    __tablename__ = "permission_groups"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    
    # Permisos específicos (JSON)
    permissions = Column(Text)  # JSON con permisos específicos
    
    # Auditoria
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AuditLog(Base):
    """Log de auditoria de acciones de usuarios"""
    __tablename__ = "audit_logs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Usuario que realizó la acción
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Información de la acción
    action = Column(String(100), nullable=False, index=True)  # login, logout, view_email, etc.
    resource_type = Column(String(50), index=True)           # user, email, attachment, etc.
    resource_id = Column(String(255), index=True)            # ID del recurso afectado
    
    # Detalles
    description = Column(Text)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    
    # Datos adicionales (JSON)
    metadata = Column(Text)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relaciones
    user = relationship("User")
    
    def __repr__(self):
        return f"<AuditLog {self.action} by {self.user.username}>"

class APIKey(Base):
    """Claves API para integraciones externas"""
    __tablename__ = "api_keys"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Información de la clave
    name = Column(String(100), nullable=False)
    key_hash = Column(String(64), unique=True, nullable=False, index=True)
    
    # Permisos
    permissions = Column(Text)  # JSON con permisos específicos
    allowed_ips = Column(Text)  # JSON con IPs permitidas
    
    # Usuario propietario
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Estado
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime)
    
    # Uso
    last_used_at = Column(DateTime)
    usage_count = Column(String(10), default="0")
    rate_limit_per_hour = Column(String(10), default="1000")
    
    # Auditoria
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    user = relationship("User")
    
    def __repr__(self):
        return f"<APIKey {self.name} for {self.user.username}>"
