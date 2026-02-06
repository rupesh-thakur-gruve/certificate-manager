"""Authentication router."""

from fastapi import APIRouter, HTTPException, Request, status

from models.audit import AuditAction
from models.employee import LoginRequest, TokenResponse, EmployeeCreate, EmployeeResponse, RoleEnum
from services.auth_service import AuthService
from services.audit_service import AuditService

auth_router = APIRouter()


@auth_router.post("/login", response_model=TokenResponse)
async def login(request: Request, login_data: LoginRequest):
    """
    Authenticate user and return tokens.
    
    Args:
        login_data: Email and password
        
    Returns:
        Access token, refresh token, and user info
    """
    result = AuthService.authenticate(login_data.email, login_data.password)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Log successful login
    AuditService.log(
        actor_role=result.user.role,
        actor_email=result.user.email,
        action=AuditAction.LOGIN,
        entity_type="auth",
        notes="Successful login",
        ip_address=_get_client_ip(request),
    )

    return result


@auth_router.post("/register", response_model=EmployeeResponse)
async def register(request: Request, employee_data: EmployeeCreate):
    """
    Register a new employee.
    
    Args:
        employee_data: Employee registration data
        
    Returns:
        Created employee
    """
    result = AuthService.register(employee_data)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Log registration
    AuditService.log(
        actor_role=result.role,
        actor_email=result.email,
        action=AuditAction.LOGIN,
        entity_type="employee",
        entity_id=str(result.id),
        notes="New user registration",
        ip_address=_get_client_ip(request),
    )

    return result


def _get_client_ip(request: Request) -> str:
    """Extract client IP from request."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
