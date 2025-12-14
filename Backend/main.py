"""
Main application module for FastAPI e-commerce REST API.

Initializes the FastAPI application, registers routers,
configures CORS, logging, rate limiting, and health checks.
"""
import os
import uvicorn
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette import status
from starlette.responses import JSONResponse

from config.logging_config import setup_logging
from config.database import create_tables, engine
from config.redis_config import redis_config, check_redis_connection

from middleware.rate_limiter import RateLimiterMiddleware
from middleware.request_id_middleware import RequestIDMiddleware

# Setup centralized logging FIRST
setup_logging()
logger = logging.getLogger(__name__)

# Controllers
from controllers.address_controller import AddressController
from controllers.bill_controller import BillController
from controllers.category_controller import CategoryController
from controllers.client_controller import ClientController
from controllers.order_controller import OrderController
from controllers.order_detail_controller import OrderDetailController
from controllers.product_controller import ProductController
from controllers.review_controller import ReviewController
from controllers.health_check import router as health_check_controller

from repositories.base_repository_impl import InstanceNotFoundError


from contextlib import asynccontextmanager

# Lifespan manager for startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles startup and shutdown events for the FastAPI application.
    """
    logger.info("🚀 Starting FastAPI E-commerce API...")

    # Create database tables on startup
    logger.info("📦 Creating database tables...")
    try:
        create_tables()
        logger.info("✅ Database tables created successfully")
    except Exception as e:
        logger.error(f"❌ Error creating database tables: {e}")
        # Optionally, you might want to prevent startup on DB error
        # raise e 

    if check_redis_connection():
        logger.info("✅ Redis cache available")
    else:
        logger.warning("⚠️ Redis NOT available")
    
    yield
    
    logger.info("👋 Shutting down API...")
    try:
        redis_config.close()
        logger.info("✅ Redis connection closed")
    except Exception as e:
        logger.error(f"❌ Redis close error: {e}")

    try:
        engine.dispose()
        logger.info("✅ DB engine disposed")
    except Exception as e:
        logger.error(f"❌ DB dispose error: {e}")
    logger.info("✅ Shutdown complete")


def create_fastapi_app() -> FastAPI:

    fastapi_app = FastAPI(
        title="E-commerce REST API",
        description="FastAPI REST API for e-commerce system with PostgreSQL",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        # 👉 Si NO querés redirección 307 por la barra final, descomentá esto:
        redirect_slashes=False,
        lifespan=lifespan
    )

    # Global exception handler
    @fastapi_app.exception_handler(InstanceNotFoundError)
    async def instance_not_found_exception_handler(request, exc):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": str(exc)},
        )

    # Generic error handler - MUST BE AFTER specific handlers
    @fastapi_app.exception_handler(Exception)
    async def generic_exception_handler(request, exc):
        # This will catch any unhandled exception
        logger.error(f"Unhandled exception for request {request.url}: {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "message": "An unexpected internal server error occurred.",
                "error_type": type(exc).__name__,
                "details": str(exc)
            },
        )

    # Routers
    fastapi_app.include_router(ClientController().router, prefix="/clients")
    fastapi_app.include_router(OrderController().router, prefix="/orders")
    fastapi_app.include_router(ProductController().router, prefix="/products")
    fastapi_app.include_router(AddressController().router, prefix="/addresses")
    fastapi_app.include_router(BillController().router, prefix="/bills")
    fastapi_app.include_router(OrderDetailController().router, prefix="/order_details")
    fastapi_app.include_router(ReviewController().router, prefix="/reviews")
    fastapi_app.include_router(CategoryController().router, prefix="/categories")

    # Health Check — SOLO UNA VEZ ❗
    fastapi_app.include_router(health_check_controller, prefix="/health_check")

    # Middleware
    fastapi_app.add_middleware(RequestIDMiddleware)
    logger.info("✅ Request ID middleware enabled")

    cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
    fastapi_app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins if cors_origins != ["*"] else ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    logger.info(f"✅ CORS enabled for origins: {cors_origins}")

    fastapi_app.add_middleware(RateLimiterMiddleware, calls=1000, period=60)
    logger.info("✅ Rate limiting enabled (1000 req / 60s)")

    return fastapi_app


def run_app(fastapi_app: FastAPI):
    uvicorn.run(fastapi_app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    create_tables()
    app = create_fastapi_app()
    run_app(app)
