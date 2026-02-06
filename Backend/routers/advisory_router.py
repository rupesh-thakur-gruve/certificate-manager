"""AI Advisory router."""

from fastapi import APIRouter, Depends, Request

from auth.dependencies import get_current_user
from models.advisory import AdvisoryOutput, AdvisoryRequest
from models.audit import AuditAction
from models.employee import RoleEnum
from services.advisory_service import get_advisory_service, AdvisoryService
from services.audit_service import AuditService

advisory_router = APIRouter()


@advisory_router.post("", response_model=AdvisoryOutput)
async def get_recommendations(
    request: Request,
    advisory_request: AdvisoryRequest,
    user: dict = Depends(get_current_user),
    advisory_service: AdvisoryService = Depends(get_advisory_service),
):
    """
    Get AI-powered certification recommendations.
    
    Args:
        advisory_request: Skills and current certifications
        user: Current authenticated user
        advisory_service: Advisory service instance
        
    Returns:
        AI-generated recommendations
    """
    result = await advisory_service.get_recommendations_with_fallback(advisory_request)

    # Log advisory request
    AuditService.log(
        actor_role=RoleEnum(user["role"]),
        actor_email=user["sub"],
        action=AuditAction.ADVISORY,
        entity_type="advisory",
        notes=f"Skills: {', '.join(advisory_request.skills[:5])}...",
        ip_address=_get_client_ip(request),
    )

    return result


def _get_client_ip(request: Request) -> str:
    """Extract client IP from request."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
