from fastapi import Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware
import time
import json
from typing import Dict, List

class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = 100, window: int = 60):
        super().__init__(app)
        self.limit = limit
        self.window = window
        self.requests: Dict[str, List[float]] = {}

    async def dispatch(self, request: Request, call_next):
        # Allow tests to skip rate limits to prevent cross-contamination
        skip_limit = request.headers.get("X-Skip-Rate-Limit") == "True"
        
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Keep window clean
        if client_ip not in self.requests:
            self.requests[client_ip] = []
            
        self.requests[client_ip] = [t for t in self.requests[client_ip] if now - t < self.window]
        
        if not skip_limit and len(self.requests[client_ip]) >= self.limit:
            response = Response(
                content=json.dumps({"detail": "Too many requests. Rate limit exceeded."}),
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                media_type="application/json"
            )
        else:
            if not skip_limit:
                self.requests[client_ip].append(now)
            response = await call_next(request)
            
        # Ensure security headers are ALWAYS appended to all responses
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response
