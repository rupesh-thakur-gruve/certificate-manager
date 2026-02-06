"""Request size limiting middleware."""

from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    """Middleware to limit request body size."""

    def __init__(
        self,
        app,
        max_size: int = 10 * 1024 * 1024,  # 10MB default
    ):
        """
        Initialize size limiter.
        
        Args:
            app: Starlette/FastAPI app
            max_size: Maximum request body size in bytes
        """
        super().__init__(app)
        self.max_size = max_size

    async def dispatch(self, request: Request, call_next: Callable):
        """Check request size before processing."""
        content_length = request.headers.get("content-length")

        if content_length:
            try:
                if int(content_length) > self.max_size:
                    return JSONResponse(
                        status_code=413,
                        content={
                            "detail": f"Request too large. Maximum size: {self.max_size // (1024*1024)}MB",
                        },
                    )
            except ValueError:
                pass  # Invalid content-length header, let it through

        return await call_next(request)
