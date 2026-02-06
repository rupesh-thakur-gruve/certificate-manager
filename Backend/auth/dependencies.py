"""FastAPI authentication dependencies."""

from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError

from .jwt_handler import decode_token

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Decode and validate JWT, return user claims.
    
    Args:
        credentials: HTTP Bearer credentials from request
        
    Returns:
        Dict with user claims from JWT payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    token = credentials.credentials
    
    try:
        payload = decode_token(token)
        return payload
    except JWTError as e:
        if "expired" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_role(allowed_roles: list[str]) -> Callable:
    """
    Factory for role-based dependency.
    
    Args:
        allowed_roles: List of roles that are allowed access
        
    Returns:
        Dependency function that validates user role
    """

    async def role_checker(user: dict = Depends(get_current_user)) -> dict:
        """Check if user has required role."""
        user_role = user.get("role")
        
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user_role}' not authorized. Required: {allowed_roles}",
            )
        return user

    return role_checker
