"""Audit log Pydantic models."""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr

from .employee import RoleEnum


class AuditAction(str, Enum):
    """Audit action enumeration."""

    UPLOAD = "UPLOAD"
    VALIDATE = "VALIDATE"
    DELETE = "DELETE"
    VIEW = "VIEW"
    EXPORT = "EXPORT"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    ADVISORY = "ADVISORY"


class AuditLogCreate(BaseModel):
    """Model for creating an audit log entry."""

    actor_role: RoleEnum
    actor_email: EmailStr
    action: AuditAction
    entity_type: str
    entity_id: Optional[str] = None
    notes: Optional[str] = None


class AuditLogResponse(AuditLogCreate):
    """Model for audit log API responses."""

    id: int
    timestamp: datetime
    ip_address: Optional[str] = None

    class Config:
        """Pydantic config."""

        from_attributes = True
