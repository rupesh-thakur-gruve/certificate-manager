"""Employee Pydantic models."""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class RoleEnum(str, Enum):
    """User role enumeration."""

    EMPLOYEE = "employee"
    MANAGER = "manager"


class EmployeeBase(BaseModel):
    """Base employee model with common fields."""

    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)
    role: RoleEnum
    department: Optional[str] = None


class EmployeeCreate(EmployeeBase):
    """Model for creating a new employee."""

    password: str = Field(..., min_length=8)


class EmployeeResponse(EmployeeBase):
    """Model for employee API responses."""

    id: int
    created_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class EmployeeInDB(EmployeeBase):
    """Employee model with database fields."""

    id: int
    password_hash: str
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class LoginRequest(BaseModel):
    """Login request model."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Token response model."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: EmployeeResponse
