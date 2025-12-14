"""
Health Check Controller with Threshold-Based Monitoring

Provides comprehensive health check including:
- Database latency monitoring (with warning/critical thresholds)
- Redis availability
- Database connection pool utilization percentage
- Overall system health classification
"""

import time
from datetime import datetime
from fastapi import APIRouter

from config.database import check_connection, engine
from config.redis_config import check_redis_connection

router = APIRouter()

# Health check thresholds
THRESHOLDS = {
    "db_latency": {
        "warning": 100.0,   # ms
        "critical": 500.0   # ms
    },
    "db_pool_utilization": {
        "warning": 70.0,    # %
        "critical": 90.0    # %
    }
}


def evaluate_health_level(*statuses):
    """
    Determine overall system health.

    Priority:
    critical > degraded > warning > healthy
    """
    if "critical" in statuses:
        return "critical"
    if "degraded" in statuses:
        return "degraded"
    if "warning" in statuses:
        return "warning"
    return "healthy"


@router.get("")
def health_check():
    """
    FULL SYSTEM HEALTH CHECK
    ------------------------
    Evaluates:
    - Database: up/down + latency + threshold health
    - Redis: up/down
    - DB Pool: size, checked out, utilization %, thresholds
    - Overall system health level
    """
    checks = {}
    component_statuses = []

    # -----------------------
    # Database connection + latency
    # -----------------------
    start = time.time()
    db_status = check_connection()
    db_latency_ms = round((time.time() - start) * 1000, 2)

    if not db_status:
        db_health = "critical"
        component_statuses.append("critical")
    elif db_latency_ms >= THRESHOLDS["db_latency"]["critical"]:
        db_health = "critical"
        component_statuses.append("critical")
    elif db_latency_ms >= THRESHOLDS["db_latency"]["warning"]:
        db_health = "warning"
        component_statuses.append("warning")
    else:
        db_health = "healthy"
        component_statuses.append("healthy")

    checks["database"] = {
        "status": "up" if db_status else "down",
        "health": db_health,
        "latency_ms": db_latency_ms if db_status else None,
        "thresholds": THRESHOLDS["db_latency"]
    }

    # -----------------------
    # Redis
    # -----------------------
    redis_status = check_redis_connection()
    redis_health = "healthy" if redis_status else "degraded"

    component_statuses.append(redis_health)

    checks["redis"] = {
        "status": "up" if redis_status else "down",
        "health": redis_health
    }

    # -----------------------
    # Database connection pool metrics
    # -----------------------
    try:
        pool = engine.pool
        checked_out = pool.checkedout()
        checked_in = pool.checkedin()
        overflow = pool.overflow()
        size = pool.size()

        # Total capacity logic
        total_capacity = size + (overflow if overflow > 0 else 0)
        utilization = (checked_out / total_capacity * 100) if total_capacity else 0
        utilization = round(utilization, 1)

        # Determine pool health
        if utilization >= THRESHOLDS["db_pool_utilization"]["critical"]:
            pool_health = "critical"
            component_statuses.append("critical")
        elif utilization >= THRESHOLDS["db_pool_utilization"]["warning"]:
            pool_health = "warning"
            component_statuses.append("warning")
        else:
            pool_health = "healthy"
            component_statuses.append("healthy")

        checks["db_pool"] = {
            "health": pool_health,
            "size": size,
            "checked_in": checked_in,
            "checked_out": checked_out,
            "overflow": overflow,
            "total_capacity": total_capacity,
            "utilization_percent": utilization,
            "thresholds": THRESHOLDS["db_pool_utilization"]
        }

    except Exception as e:
        checks["db_pool"] = {
            "health": "critical",
            "status": "error",
            "error": str(e)
        }
        component_statuses.append("critical")

    # -----------------------
    # Overall health
    # -----------------------
    overall_health = evaluate_health_level(*component_statuses)

    return {
        "status": overall_health,
        "timestamp": datetime.utcnow().isoformat(),
        "checks": checks
    }
