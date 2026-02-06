"""Audit repository for database operations."""

from datetime import datetime
from typing import Optional

from database.connection import get_db
from models.audit import AuditAction, AuditLogResponse
from models.employee import RoleEnum


class AuditRepository:
    """Repository for audit log database operations."""

    @staticmethod
    def create(
        actor_role: RoleEnum,
        actor_email: str,
        action: AuditAction,
        entity_type: str,
        entity_id: Optional[str] = None,
        notes: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLogResponse:
        """Create a new audit log entry."""
        with get_db() as conn:
            cursor = conn.execute(
                """
                INSERT INTO audit_logs (
                    actor_role, actor_email, action, entity_type,
                    entity_id, notes, ip_address
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    actor_role.value,
                    actor_email,
                    action.value,
                    entity_type,
                    entity_id,
                    notes,
                    ip_address,
                ),
            )
            log_id = cursor.lastrowid

        return AuditRepository.get_by_id(log_id)

    @staticmethod
    def get_by_id(log_id: int) -> Optional[AuditLogResponse]:
        """Get audit log by ID."""
        with get_db() as conn:
            row = conn.execute(
                "SELECT * FROM audit_logs WHERE id = ?",
                (log_id,),
            ).fetchone()

            if row:
                return AuditLogResponse(
                    id=row["id"],
                    timestamp=datetime.fromisoformat(row["timestamp"]),
                    actor_role=RoleEnum(row["actor_role"]),
                    actor_email=row["actor_email"],
                    action=AuditAction(row["action"]),
                    entity_type=row["entity_type"],
                    entity_id=row["entity_id"],
                    notes=row["notes"],
                    ip_address=row["ip_address"],
                )
            return None

    @staticmethod
    def get_all(limit: int = 100, offset: int = 0) -> list[AuditLogResponse]:
        """Get all audit logs with pagination."""
        with get_db() as conn:
            rows = conn.execute(
                """
                SELECT * FROM audit_logs 
                ORDER BY timestamp DESC 
                LIMIT ? OFFSET ?
                """,
                (limit, offset),
            ).fetchall()

            return [
                AuditLogResponse(
                    id=row["id"],
                    timestamp=datetime.fromisoformat(row["timestamp"]),
                    actor_role=RoleEnum(row["actor_role"]),
                    actor_email=row["actor_email"],
                    action=AuditAction(row["action"]),
                    entity_type=row["entity_type"],
                    entity_id=row["entity_id"],
                    notes=row["notes"],
                    ip_address=row["ip_address"],
                )
                for row in rows
            ]

    @staticmethod
    def get_by_entity(entity_type: str, entity_id: str) -> list[AuditLogResponse]:
        """Get audit logs for a specific entity."""
        with get_db() as conn:
            rows = conn.execute(
                """
                SELECT * FROM audit_logs 
                WHERE entity_type = ? AND entity_id = ?
                ORDER BY timestamp DESC
                """,
                (entity_type, entity_id),
            ).fetchall()

            return [
                AuditLogResponse(
                    id=row["id"],
                    timestamp=datetime.fromisoformat(row["timestamp"]),
                    actor_role=RoleEnum(row["actor_role"]),
                    actor_email=row["actor_email"],
                    action=AuditAction(row["action"]),
                    entity_type=row["entity_type"],
                    entity_id=row["entity_id"],
                    notes=row["notes"],
                    ip_address=row["ip_address"],
                )
                for row in rows
            ]

    @staticmethod
    def get_count() -> int:
        """Get total count of audit logs."""
        with get_db() as conn:
            row = conn.execute("SELECT COUNT(*) as count FROM audit_logs").fetchone()
            return row["count"]
