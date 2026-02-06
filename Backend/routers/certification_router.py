"""Certification router."""

from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status

from auth.dependencies import get_current_user, require_role
from config import get_settings
from models.audit import AuditAction
from models.certification import CertificationCreate, CertificationResponse
from models.employee import RoleEnum
from services.audit_service import AuditService
from services.certification_service import CertificationService

settings = get_settings()
certification_router = APIRouter()


@certification_router.post("", response_model=CertificationResponse)
async def create_certification(
    request: Request,
    vendor_oem: str = Form(...),
    certification_name: str = Form(...),
    date_obtained: str = Form(...),
    credential_id: Optional[str] = Form(None),
    expiry_date: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    user: dict = Depends(get_current_user),
):
    """
    Upload a new certification.
    
    Args:
        vendor_oem: Vendor/OEM name
        certification_name: Name of the certification
        date_obtained: Date obtained (YYYY-MM-DD)
        credential_id: Optional credential ID
        expiry_date: Optional expiry date (YYYY-MM-DD)
        file: Optional certification file
        user: Current authenticated user
        
    Returns:
        Created certification
    """
    from datetime import date as date_type

    # Validate file if provided
    file_path = None
    if file:
        # Check MIME type
        content = await file.read()
        await file.seek(0)

        # Simple MIME check (in production, use python-magic)
        if file.content_type not in settings.allowed_mime_types_list:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not allowed. Allowed: {settings.ALLOWED_MIME_TYPES}",
            )

        # Check file size
        if len(content) > settings.max_upload_size_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum: {settings.MAX_UPLOAD_SIZE_MB}MB",
            )

        # Save file
        file_path = CertificationService.save_upload_file(
            file_content=content,
            filename=file.filename,
            employee_id=user["user_id"],
        )

    # Parse dates
    try:
        date_obtained_parsed = date_type.fromisoformat(date_obtained)
        expiry_date_parsed = date_type.fromisoformat(expiry_date) if expiry_date else None
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD",
        )

    # Create certification data
    cert_data = CertificationCreate(
        vendor_oem=vendor_oem,
        certification_name=certification_name,
        credential_id=credential_id,
        date_obtained=date_obtained_parsed,
        expiry_date=expiry_date_parsed,
    )

    # Create certification
    cert = CertificationService.create_certification(
        employee_id=user["user_id"],
        employee_name=user["name"],
        employee_email=user["sub"],
        data=cert_data,
        file_path=file_path,
    )

    # Log upload
    AuditService.log(
        actor_role=RoleEnum(user["role"]),
        actor_email=user["sub"],
        action=AuditAction.UPLOAD,
        entity_type="certification",
        entity_id=cert.id,
        notes=f"Uploaded: {certification_name}",
        ip_address=_get_client_ip(request),
    )

    return cert


@certification_router.get("/my", response_model=list[CertificationResponse])
async def get_my_certifications(
    user: dict = Depends(get_current_user),
):
    """
    Get current user's certifications.
    
    Returns:
        List of user's certifications
    """
    return CertificationService.get_employee_certifications(user["user_id"])


@certification_router.get("", response_model=list[CertificationResponse])
async def get_all_certifications(
    user: dict = Depends(require_role(["manager"])),
):
    """
    Get all certifications (manager only).
    
    Returns:
        List of all certifications
    """
    return CertificationService.get_all_certifications()


@certification_router.get("/{cert_id}", response_model=CertificationResponse)
async def get_certification(
    cert_id: str,
    user: dict = Depends(get_current_user),
):
    """
    Get a specific certification.
    
    Args:
        cert_id: Certification ID
        
    Returns:
        Certification details
    """
    cert = CertificationService.get_certification(cert_id)

    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certification not found",
        )

    # Employees can only view their own certifications
    if user["role"] == "employee" and cert.employee_id != user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access other employee's certification",
        )

    return cert


@certification_router.post("/{cert_id}/validate", response_model=CertificationResponse)
async def validate_certification(
    request: Request,
    cert_id: str,
    user: dict = Depends(require_role(["manager"])),
):
    """
    Validate a certification (manager only).
    
    Args:
        cert_id: Certification ID
        
    Returns:
        Updated certification
    """
    cert = CertificationService.validate_certification(
        cert_id=cert_id,
        validated_by=user["user_id"],
    )

    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certification not found",
        )

    # Log validation
    AuditService.log(
        actor_role=RoleEnum(user["role"]),
        actor_email=user["sub"],
        action=AuditAction.VALIDATE,
        entity_type="certification",
        entity_id=cert_id,
        notes=f"Validated: {cert.certification_name}",
        ip_address=_get_client_ip(request),
    )

    return cert


@certification_router.delete("/{cert_id}")
async def delete_certification(
    request: Request,
    cert_id: str,
    user: dict = Depends(require_role(["manager"])),
):
    """
    Delete a certification (manager only).
    
    Args:
        cert_id: Certification ID
        
    Returns:
        Success message
    """
    # Get cert first for audit
    cert = CertificationService.get_certification(cert_id)
    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certification not found",
        )

    success = CertificationService.delete_certification(cert_id)

    if success:
        # Log deletion
        AuditService.log(
            actor_role=RoleEnum(user["role"]),
            actor_email=user["sub"],
            action=AuditAction.DELETE,
            entity_type="certification",
            entity_id=cert_id,
            notes=f"Deleted: {cert.certification_name}",
            ip_address=_get_client_ip(request),
        )

    return {"message": "Certification deleted successfully"}


def _get_client_ip(request: Request) -> str:
    """Extract client IP from request."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
