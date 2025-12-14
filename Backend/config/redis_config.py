"""
Redis Configuration Module

Provides Redis client connection and configuration for caching,
sessions, and rate limiting.
"""
import os
import logging
from typing import Optional
import redis
from redis.connection import ConnectionPool

logger = logging.getLogger(__name__)


class RedisConfig:
    """
    Singleton Redis configuration class

    Manages Redis connection pool and provides a single client instance
    across the application.
    """

    _instance: Optional['RedisConfig'] = None
    _client: Optional[redis.Redis] = None
    _pool: Optional[ConnectionPool] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self._client is None:
            self._initialize_client()

    def _initialize_client(self):
        """Initialize Redis client with connection pool"""
        redis_url = os.getenv('REDIS_URL')
        max_connections = int(os.getenv('REDIS_MAX_CONNECTIONS', '50'))

        try:
            if redis_url:
                # If REDIS_URL is provided (e.g., from a hosting service), use it.
                logger.info("Connecting to Redis using REDIS_URL.")
                self._pool = ConnectionPool.from_url(
                    redis_url,
                    max_connections=max_connections,
                    decode_responses=True,
                    socket_timeout=5,
                    socket_connect_timeout=5,
                    retry_on_timeout=True
                )
                # For logging, let's not expose the full URL.
                conn_details = self._pool.connection_kwargs
                log_host = conn_details.get('host')
                log_port = conn_details.get('port')
                log_db = conn_details.get('db')
                logger.info(f"✅ Redis configured via URL for host: {log_host}:{log_port}, DB: {log_db}")
            else:
                # Fallback to individual environment variables for local development.
                logger.info("Connecting to Redis using individual HOST/PORT variables.")
                redis_host = os.getenv('REDIS_HOST', 'localhost')
                redis_port = int(os.getenv('REDIS_PORT', '6379'))
                redis_db = int(os.getenv('REDIS_DB', '0'))
                redis_password = os.getenv('REDIS_PASSWORD', None)

                self._pool = ConnectionPool(
                    host=redis_host,
                    port=redis_port,
                    db=redis_db,
                    password=redis_password,
                    max_connections=max_connections,
                    decode_responses=True,  # Auto-decode bytes to str
                    socket_timeout=5,
                    socket_connect_timeout=5,
                    retry_on_timeout=True
                )
                logger.info(f"✅ Redis connected successfully: {redis_host}:{redis_port} (DB: {redis_db})")

            # Create Redis client from the pool
            self._client = redis.Redis(connection_pool=self._pool)

            # Test the connection
            self._client.ping()

        except redis.ConnectionError as e:
            logger.warning(f"⚠️  Redis connection failed: {e}")
            logger.warning("Application will run without caching")
            self._client = None
        except Exception as e:
            logger.error(f"❌ Redis initialization error: {e}")
            self._client = None

    def get_client(self) -> Optional[redis.Redis]:
        """
        Get Redis client instance

        Returns:
            Redis client or None if connection failed
        """
        return self._client

    def is_available(self) -> bool:
        """
        Check if Redis is available

        Returns:
            True if Redis is connected and responsive
        """
        if self._client is None:
            return False

        try:
            return self._client.ping()
        except (redis.ConnectionError, redis.TimeoutError, Exception) as e:
            logger.debug(f"Redis ping failed: {e}")
            return False

    def close(self):
        """Close Redis connection and pool"""
        if self._client:
            self._client.close()
            logger.info("Redis connection closed")

        if self._pool:
            self._pool.disconnect()
            logger.info("Redis connection pool disconnected")


# Global Redis instance
redis_config = RedisConfig()


def get_redis_client() -> Optional[redis.Redis]:
    """
    Dependency injection function for FastAPI

    Returns:
        Redis client instance or None
    """
    return redis_config.get_client()


def check_redis_connection() -> bool:
    """
    Check if Redis is available

    Returns:
        True if Redis is connected
    """
    return redis_config.is_available()