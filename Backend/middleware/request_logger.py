"""Request logging middleware."""

import logging
import time
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from config import get_settings

settings = get_settings()

# Configure logger
logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL))
logger = logging.getLogger("certtrack.requests")


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    """Middleware to log all requests."""

    async def dispatch(self, request: Request, call_next: Callable):
        """Log request details and timing."""
        start_time = time.time()

        # Get client IP
        forwarded = request.headers.get("x-forwarded-for")
        client_ip = forwarded.split(",")[0].strip() if forwarded else (
            request.client.host if request.client else "unknown"
        )

        # Process request
        response = await call_next(request)

        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000

        # Log request
        logger.info(
            f"{request.method} {request.url.path} "
            f"[{response.status_code}] "
            f"{duration_ms:.2f}ms "
            f"IP:{client_ip}"
        )

        return response
