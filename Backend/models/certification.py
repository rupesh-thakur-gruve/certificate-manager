"""Certification Pydantic models."""

from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class CertificationStatus(str, Enum):
    """Certification status enumeration."""

    ACTIVE = "active"
    EXPIRED = "expired"
    IN_PROGRESS = "in_progress"
    NEVER_EXPIRES = "never_expires"


class CertificationBase(BaseModel):
    """Base certification model with common fields."""

    vendor_oem: str = Field(..., min_length=1, max_length=100)
    certification_name: str = Field(..., min_length=1, max_length=200)
    credential_id: Optional[str] = None
    date_obtained: date
    expiry_date: Optional[date] = None

    @field_validator("expiry_date")
    @classmethod
    def expiry_after_obtained(cls, v, info):
        """Validate expiry date is after obtained date."""
        if v and info.data.get("date_obtained") and v < info.data["date_obtained"]:
            raise ValueError("Expiry date must be after date obtained")
        return v


class CertificationCreate(CertificationBase):
    """Model for creating a new certification."""

    pass


class CertificationResponse(CertificationBase):
    """Model for certification API responses."""

    id: str  # CERT-2026-0001
    employee_id: int
    employee_name: str
    employee_email: EmailStr
    file_path: Optional[str] = None
    status: CertificationStatus
    validated_by: Optional[int] = None
    validated_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class CertificationValidate(BaseModel):
    """Model for validating a certification."""

    notes: Optional[str] = None


def compute_certification_status(
    expiry_date: Optional[date],
    validated_at: Optional[datetime],
) -> CertificationStatus:
    """
    Compute certification status (never stored, always computed).

    Rules:
    1. No validation yet → IN_PROGRESS
    2. No expiry_date and validated → NEVER_EXPIRES
    3. expiry_date < today → EXPIRED
    4. expiry_date >= today and validated → ACTIVE
    """
    today = date.today()

    if validated_at is None:
        return CertificationStatus.IN_PROGRESS

    if expiry_date is None:
        return CertificationStatus.NEVER_EXPIRES

    if expiry_date < today:
        return CertificationStatus.EXPIRED

    return CertificationStatus.ACTIVE
