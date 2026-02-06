"""Authentication service."""

from typing import Optional

from auth.jwt_handler import create_access_token, create_refresh_token
from auth.password import hash_password, verify_password
from database.repositories import EmployeeRepository
from models.employee import (
    EmployeeCreate,
    EmployeeInDB,
    EmployeeResponse,
    TokenResponse,
)


class AuthService:
    """Service for authentication operations."""

    @staticmethod
    def authenticate(email: str, password: str) -> Optional[TokenResponse]:
        """
        Authenticate user and return tokens.
        
        Args:
            email: User email
            password: Plain text password
            
        Returns:
            TokenResponse with access/refresh tokens and user info, or None
        """
        employee = EmployeeRepository.get_by_email(email)

        if not employee:
            return None

        if not verify_password(password, employee.password_hash):
            return None

        # Create token payload
        token_data = {
            "sub": employee.email,
            "user_id": employee.id,
            "role": employee.role.value,
            "name": employee.name,
        }

        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        user_response = EmployeeResponse(
            id=employee.id,
            email=employee.email,
            name=employee.name,
            role=employee.role,
            department=employee.department,
            created_at=employee.created_at,
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_response,
        )

    @staticmethod
    def register(employee_data: EmployeeCreate) -> Optional[EmployeeResponse]:
        """
        Register a new employee.
        
        Args:
            employee_data: Employee creation data
            
        Returns:
            Created employee response, or None if email exists
        """
        # Check if email already exists
        existing = EmployeeRepository.get_by_email(employee_data.email)
        if existing:
            return None

        # Hash password and create employee
        password_hash = hash_password(employee_data.password)
        employee = EmployeeRepository.create(
            email=employee_data.email,
            password_hash=password_hash,
            name=employee_data.name,
            role=employee_data.role,
            department=employee_data.department,
        )

        return EmployeeResponse(
            id=employee.id,
            email=employee.email,
            name=employee.name,
            role=employee.role,
            department=employee.department,
            created_at=employee.created_at,
        )
