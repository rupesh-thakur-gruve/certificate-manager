"""In-memory rate limiting middleware."""

import time
from collections import defaultdict
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple in-memory rate limiting middleware.
    
    WARNING: This is hackathon-grade. For production:
    - Use Redis-backed rate limiting
    - Consider using slowapi library
    """

    def __init__(
        self,
        app,
        requests_per_minute: int = 100,
    ):
        """
        Initialize rate limiter.
        
        Args:
            app: Starlette/FastAPI app
            requests_per_minute: Max requests per minute per IP
        """
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests: dict[str, list[float]] = defaultdict(list)

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request."""
        # Check X-Forwarded-For header first (for proxies)
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _is_rate_limited(self, client_ip: str) -> bool:
        """Check if client is rate limited."""
        now = time.time()
        window_start = now - 60  # 1 minute window

        # Clean old requests
        self.requests[client_ip] = [
            ts for ts in self.requests[client_ip] if ts > window_start
        ]

        # Check limit
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            return True

        # Record this request
        self.requests[client_ip].append(now)
        return False

    async def dispatch(self, request: Request, call_next: Callable):
        """Process request with rate limiting."""
        client_ip = self._get_client_ip(request)

        if self._is_rate_limited(client_ip):
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Too many requests. Please slow down.",
                    "retry_after": 60,
                },
                headers={"Retry-After": "60"},
            )

        return await call_next(request)
