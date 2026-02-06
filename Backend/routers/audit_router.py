"""Audit router."""

from typing import Optional

from fastapi import APIRouter, Depends, Query

from auth.dependencies import require_role
from models.audit import AuditLogResponse
from services.audit_service import AuditService

audit_router = APIRouter()


@audit_router.get("", response_model=dict)
async def get_audit_logs(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    user: dict = Depends(require_role(["manager"])),
):
    """
    Get audit logs with pagination (manager only).
    
    Args:
        limit: Maximum number of logs to return
        offset: Number of logs to skip
        
    Returns:
        Paginated audit logs with total count
    """
    logs, total = AuditService.get_logs(limit=limit, offset=offset)

    return {
        "items": logs,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@audit_router.get("/entity/{entity_type}/{entity_id}", response_model=list[AuditLogResponse])
async def get_entity_audit_logs(
    entity_type: str,
    entity_id: str,
    user: dict = Depends(require_role(["manager"])),
):
    """
    Get audit logs for a specific entity (manager only).
    
    Args:
        entity_type: Type of entity (e.g., 'certification')
        entity_id: ID of the entity
        
    Returns:
        List of audit logs for the entity
    """
    return AuditService.get_entity_logs(entity_type, entity_id)
