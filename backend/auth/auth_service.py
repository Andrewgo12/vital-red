"""
Sistema de autenticación y autorización para VITAL RED
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
import secrets
import hashlib

from models.database import SessionLocal, get_db
from models.auth_models import User, UserRole, Session as UserSession
from config.settings import settings

# Configuración de seguridad
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

class AuthService:
    """Servicio de autenticación y autorización"""
    
    def __init__(self):
        self.algorithm = "HS256"
        self.secret_key = settings.secret_key
        self.access_token_expire_minutes = settings.access_token_expire_minutes
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verificar contraseña"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Generar hash de contraseña"""
        return pwd_context.hash(password)
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Crear token de acceso JWT"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verificar y decodificar token JWT"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    def authenticate_user(self, username: str, password: str, db) -> Optional[User]:
        """Autenticar usuario"""
        user = db.query(User).filter(User.email == username).first()
        if not user:
            return None
        if not self.verify_password(password, user.password_hash):
            return None
        return user
    
    def create_session(self, user_id: str, token: str, db) -> UserSession:
        """Crear sesión de usuario"""
        session = UserSession(
            user_id=user_id,
            token_hash=hashlib.sha256(token.encode()).hexdigest(),
            expires_at=datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes),
            created_at=datetime.utcnow()
        )
        db.add(session)
        db.commit()
        return session
    
    def revoke_session(self, token: str, db):
        """Revocar sesión"""
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        session = db.query(UserSession).filter(UserSession.token_hash == token_hash).first()
        if session:
            session.revoked_at = datetime.utcnow()
            db.commit()
    
    def check_permissions(self, user: User, required_role: str) -> bool:
        """Verificar permisos de usuario"""
        role_hierarchy = {
            "viewer": 1,
            "medico": 2,
            "admin": 3,
            "superadmin": 4
        }
        
        user_level = role_hierarchy.get(user.role.value, 0)
        required_level = role_hierarchy.get(required_role, 0)
        
        return user_level >= required_level

# Instancia global del servicio
auth_service = AuthService()

# Dependencias para FastAPI
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db = Depends(get_db)
) -> User:
    """Obtener usuario actual desde token JWT"""
    token = credentials.credentials
    
    try:
        payload = auth_service.verify_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
        )
    
    # Verificar si la sesión existe y no está revocada
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    session = db.query(UserSession).filter(
        UserSession.token_hash == token_hash,
        UserSession.revoked_at.is_(None),
        UserSession.expires_at > datetime.utcnow()
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión expirada o inválida",
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
        )
    
    return user

def require_role(required_role: str):
    """Decorador para requerir rol específico"""
    def role_checker(current_user: User = Depends(get_current_user)):
        if not auth_service.check_permissions(current_user, required_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permisos insuficientes",
            )
        return current_user
    return role_checker

# Shortcuts para roles comunes
require_admin = require_role("admin")
require_medico = require_role("medico")
require_viewer = require_role("viewer")
