"""
Sistema de caché y optimización para VITAL RED
"""

import redis
import json
import hashlib
import pickle
from typing import Any, Optional, Dict, List
from datetime import datetime, timedelta
import asyncio
from functools import wraps
import logging

from config.settings import settings

logger = logging.getLogger("vitalred_gmail.cache")

class CacheService:
    """Servicio de caché con Redis para optimización de rendimiento"""
    
    def __init__(self):
        # Configuración de Redis
        self.redis_client = redis.Redis(
            host=getattr(settings, 'redis_host', 'localhost'),
            port=getattr(settings, 'redis_port', 6379),
            db=getattr(settings, 'redis_db', 0),
            password=getattr(settings, 'redis_password', None),
            decode_responses=True,
            health_check_interval=30
        )
        
        # Configuración de TTL (Time To Live) por tipo de caché
        self.cache_ttl = {
            'email_list': 300,      # 5 minutos para listas de correos
            'email_detail': 1800,   # 30 minutos para detalles de correo
            'user_session': 3600,   # 1 hora para sesiones de usuario
            'stats': 600,           # 10 minutos para estadísticas
            'search_results': 900,  # 15 minutos para resultados de búsqueda
            'attachment_meta': 3600, # 1 hora para metadatos de adjuntos
            'daily_stats': 86400,   # 24 horas para estadísticas diarias
        }
        
        # Prefijos para organizar las claves
        self.key_prefixes = {
            'email': 'email:',
            'user': 'user:',
            'stats': 'stats:',
            'search': 'search:',
            'attachment': 'attachment:',
            'session': 'session:',
        }
    
    def _generate_cache_key(self, prefix: str, identifier: str, **kwargs) -> str:
        """Generar clave de caché única"""
        base_key = f"{self.key_prefixes.get(prefix, prefix)}{identifier}"
        
        if kwargs:
            # Agregar parámetros adicionales al hash
            params_str = json.dumps(kwargs, sort_keys=True)
            params_hash = hashlib.md5(params_str.encode()).hexdigest()[:8]
            base_key = f"{base_key}:{params_hash}"
        
        return base_key
    
    async def get(self, key: str) -> Optional[Any]:
        """Obtener valor del caché"""
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Error getting cache key {key}: {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Establecer valor en caché"""
        try:
            serialized_value = json.dumps(value, default=str)
            return self.redis_client.setex(key, ttl or 3600, serialized_value)
        except Exception as e:
            logger.error(f"Error setting cache key {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Eliminar clave del caché"""
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            logger.error(f"Error deleting cache key {key}: {e}")
            return False
    
    async def delete_pattern(self, pattern: str) -> int:
        """Eliminar todas las claves que coincidan con un patrón"""
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Error deleting cache pattern {pattern}: {e}")
            return 0
    
    async def exists(self, key: str) -> bool:
        """Verificar si existe una clave en caché"""
        try:
            return bool(self.redis_client.exists(key))
        except Exception as e:
            logger.error(f"Error checking cache key {key}: {e}")
            return False
    
    # === MÉTODOS ESPECÍFICOS PARA CORREOS ===
    
    async def cache_email_list(self, filters: Dict, emails: List[Dict], ttl: Optional[int] = None) -> str:
        """Cachear lista de correos con filtros específicos"""
        cache_key = self._generate_cache_key('email', 'list', **filters)
        await self.set(cache_key, emails, ttl or self.cache_ttl['email_list'])
        return cache_key
    
    async def get_cached_email_list(self, filters: Dict) -> Optional[List[Dict]]:
        """Obtener lista de correos cacheada"""
        cache_key = self._generate_cache_key('email', 'list', **filters)
        return await self.get(cache_key)
    
    async def cache_email_detail(self, email_id: str, email_data: Dict, ttl: Optional[int] = None):
        """Cachear detalle de correo específico"""
        cache_key = self._generate_cache_key('email', f'detail:{email_id}')
        await self.set(cache_key, email_data, ttl or self.cache_ttl['email_detail'])
    
    async def get_cached_email_detail(self, email_id: str) -> Optional[Dict]:
        """Obtener detalle de correo cacheado"""
        cache_key = self._generate_cache_key('email', f'detail:{email_id}')
        return await self.get(cache_key)
    
    async def invalidate_email_cache(self, email_id: str = None):
        """Invalidar caché de correos"""
        if email_id:
            # Invalidar correo específico
            cache_key = self._generate_cache_key('email', f'detail:{email_id}')
            await self.delete(cache_key)
        else:
            # Invalidar todos los correos
            pattern = f"{self.key_prefixes['email']}*"
            await self.delete_pattern(pattern)
    
    # === MÉTODOS PARA ESTADÍSTICAS ===
    
    async def cache_dashboard_stats(self, stats: Dict, ttl: Optional[int] = None):
        """Cachear estadísticas del dashboard"""
        cache_key = self._generate_cache_key('stats', 'dashboard')
        await self.set(cache_key, stats, ttl or self.cache_ttl['stats'])
    
    async def get_cached_dashboard_stats(self) -> Optional[Dict]:
        """Obtener estadísticas del dashboard cacheadas"""
        cache_key = self._generate_cache_key('stats', 'dashboard')
        return await self.get(cache_key)
    
    async def cache_daily_stats(self, date_str: str, stats: Dict, ttl: Optional[int] = None):
        """Cachear estadísticas diarias"""
        cache_key = self._generate_cache_key('stats', f'daily:{date_str}')
        await self.set(cache_key, stats, ttl or self.cache_ttl['daily_stats'])
    
    async def get_cached_daily_stats(self, date_str: str) -> Optional[Dict]:
        """Obtener estadísticas diarias cacheadas"""
        cache_key = self._generate_cache_key('stats', f'daily:{date_str}')
        return await self.get(cache_key)
    
    # === MÉTODOS PARA BÚSQUEDAS ===
    
    async def cache_search_results(self, query: str, filters: Dict, results: List[Dict], ttl: Optional[int] = None):
        """Cachear resultados de búsqueda"""
        search_hash = hashlib.md5(f"{query}:{json.dumps(filters, sort_keys=True)}".encode()).hexdigest()
        cache_key = self._generate_cache_key('search', search_hash)
        await self.set(cache_key, results, ttl or self.cache_ttl['search_results'])
    
    async def get_cached_search_results(self, query: str, filters: Dict) -> Optional[List[Dict]]:
        """Obtener resultados de búsqueda cacheados"""
        search_hash = hashlib.md5(f"{query}:{json.dumps(filters, sort_keys=True)}".encode()).hexdigest()
        cache_key = self._generate_cache_key('search', search_hash)
        return await self.get(cache_key)
    
    # === MÉTODOS PARA SESIONES ===
    
    async def cache_user_session(self, user_id: str, session_data: Dict, ttl: Optional[int] = None):
        """Cachear datos de sesión de usuario"""
        cache_key = self._generate_cache_key('session', user_id)
        await self.set(cache_key, session_data, ttl or self.cache_ttl['user_session'])
    
    async def get_cached_user_session(self, user_id: str) -> Optional[Dict]:
        """Obtener datos de sesión cacheados"""
        cache_key = self._generate_cache_key('session', user_id)
        return await self.get(cache_key)
    
    async def invalidate_user_session(self, user_id: str):
        """Invalidar sesión de usuario"""
        cache_key = self._generate_cache_key('session', user_id)
        await self.delete(cache_key)
    
    # === HEALTH CHECK ===
    
    async def health_check(self) -> Dict[str, Any]:
        """Verificar estado del servicio de caché"""
        try:
            # Test básico de conectividad
            self.redis_client.ping()
            
            # Test de escritura/lectura
            test_key = "health_check_test"
            test_value = {"timestamp": datetime.now().isoformat()}
            self.redis_client.setex(test_key, 10, json.dumps(test_value))
            retrieved = json.loads(self.redis_client.get(test_key))
            self.redis_client.delete(test_key)
            
            # Información del servidor Redis
            info = self.redis_client.info()
            
            return {
                "status": "healthy",
                "redis_version": info.get("redis_version"),
                "connected_clients": info.get("connected_clients"),
                "used_memory_human": info.get("used_memory_human"),
                "keyspace": info.get("db0", {}),
                "test_successful": retrieved["timestamp"] == test_value["timestamp"]
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }

# Instancia global del servicio de caché
cache_service = CacheService()

# === DECORADORES PARA CACHÉ ===

def cached(ttl: int = 3600, key_prefix: str = "general"):
    """Decorador para cachear automáticamente resultados de funciones"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generar clave de caché basada en función y argumentos
            func_name = f"{func.__module__}.{func.__name__}"
            args_str = str(args) + str(sorted(kwargs.items()))
            cache_key = hashlib.md5(f"{key_prefix}:{func_name}:{args_str}".encode()).hexdigest()
            
            # Intentar obtener del caché
            cached_result = await cache_service.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit for {func_name}")
                return cached_result
            
            # Ejecutar función y cachear resultado
            logger.debug(f"Cache miss for {func_name}")
            result = await func(*args, **kwargs)
            await cache_service.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

def cache_invalidate(pattern: str):
    """Decorador para invalidar caché después de ejecutar una función"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            result = await func(*args, **kwargs)
            await cache_service.delete_pattern(pattern)
            logger.debug(f"Cache invalidated with pattern: {pattern}")
            return result
        return wrapper
    return decorator
