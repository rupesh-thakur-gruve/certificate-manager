"""Certification service."""

from datetime import date
from pathlib import Path
from typing import Optional

from config import get_settings
from database.repositories import CertificationRepository
from models.certification import (
    CertificationCreate,
    CertificationResponse,
)

settings = get_settings()


class CertificationService:
    """Service for certification operations."""

    @staticmethod
    def create_certification(
        employee_id: int,
        employee_name: str,
        employee_email: str,
        data: CertificationCreate,
        file_path: Optional[str] = None,
    ) -> CertificationResponse:
        """
        Create a new certification.
        
        Args:
            employee_id: ID of the employee
            employee_name: Name of the employee
            employee_email: Email of the employee
            data: Certification creation data
            file_path: Optional path to uploaded file
            
        Returns:
            Created certification response
        """
        return CertificationRepository.create(
            employee_id=employee_id,
            employee_name=employee_name,
            employee_email=employee_email,
            vendor_oem=data.vendor_oem,
            certification_name=data.certification_name,
            credential_id=data.credential_id,
            date_obtained=data.date_obtained,
            expiry_date=data.expiry_date,
            file_path=file_path,
        )

    @staticmethod
    def get_certification(cert_id: str) -> Optional[CertificationResponse]:
        """Get certification by ID."""
        return CertificationRepository.get_by_id(cert_id)

    @staticmethod
    def get_employee_certifications(employee_id: int) -> list[CertificationResponse]:
        """Get all certifications for an employee."""
        return CertificationRepository.get_by_employee(employee_id)

    @staticmethod
    def get_all_certifications() -> list[CertificationResponse]:
        """Get all certifications (manager view)."""
        return CertificationRepository.get_all()

    @staticmethod
    def validate_certification(
        cert_id: str,
        validated_by: int,
    ) -> Optional[CertificationResponse]:
        """
        Validate a certification.
        
        Args:
            cert_id: Certification ID
            validated_by: ID of the manager validating
            
        Returns:
            Updated certification or None if not found
        """
        return CertificationRepository.validate(cert_id, validated_by)

    @staticmethod
    def delete_certification(cert_id: str) -> bool:
        """Delete a certification."""
        return CertificationRepository.delete(cert_id)

    @staticmethod
    def save_upload_file(
        file_content: bytes,
        filename: str,
        employee_id: int,
    ) -> str:
        """
        Save uploaded file and return the path.
        
        Args:
            file_content: Raw file bytes
            filename: Original filename
            employee_id: Employee ID for directory
            
        Returns:
            Relative file path
        """
        upload_dir = Path(settings.UPLOAD_DIR) / str(employee_id)
        upload_dir.mkdir(parents=True, exist_ok=True)

        # Generate unique filename
        import uuid
        ext = Path(filename).suffix
        unique_name = f"{uuid.uuid4()}{ext}"
        file_path = upload_dir / unique_name

        with open(file_path, "wb") as f:
            f.write(file_content)

        return str(file_path)
