"""Audit service for logging operations."""

from typing import Optional

from database.repositories import AuditRepository
from models.audit import AuditAction, AuditLogResponse
from models.employee import RoleEnum


class AuditService:
    """Service for audit logging operations."""

    @staticmethod
    def log(
        actor_role: RoleEnum,
        actor_email: str,
        action: AuditAction,
        entity_type: str,
        entity_id: Optional[str] = None,
        notes: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLogResponse:
        """
        Log an audit event.
        
        Args:
            actor_role: Role of the user performing the action
            actor_email: Email of the user
            action: Type of action performed
            entity_type: Type of entity (e.g., 'certification')
            entity_id: Optional ID of the entity
            notes: Optional notes about the action
            ip_address: Optional IP address
            
        Returns:
            Created audit log entry
        """
        return AuditRepository.create(
            actor_role=actor_role,
            actor_email=actor_email,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            notes=notes,
            ip_address=ip_address,
        )

    @staticmethod
    def get_logs(
        limit: int = 100,
        offset: int = 0,
    ) -> tuple[list[AuditLogResponse], int]:
        """
        Get audit logs with pagination.
        
        Args:
            limit: Max number of logs to return
            offset: Number of logs to skip
            
        Returns:
            Tuple of (logs list, total count)
        """
        logs = AuditRepository.get_all(limit=limit, offset=offset)
        total = AuditRepository.get_count()
        return logs, total

    @staticmethod
    def get_entity_logs(
        entity_type: str,
        entity_id: str,
    ) -> list[AuditLogResponse]:
        """
        Get audit logs for a specific entity.
        
        Args:
            entity_type: Type of entity
            entity_id: ID of the entity
            
        Returns:
            List of audit logs for the entity
        """
        return AuditRepository.get_by_entity(entity_type, entity_id)
