"""Certification repository for database operations."""

from datetime import datetime, date
from typing import Optional

from database.connection import get_db
from models.certification import (
    CertificationResponse,
    CertificationStatus,
    compute_certification_status,
)


class CertificationRepository:
    """Repository for certification database operations."""

    @staticmethod
    def generate_cert_id() -> str:
        """
        Generate a unique, human-readable certificate ID.
        Format: CERT-YYYY-NNNN (e.g., CERT-2026-0001)
        Uses SQLite's atomic UPDATE with RETURNING for concurrency safety.
        """
        current_year = datetime.now().year

        with get_db() as conn:
            cursor = conn.execute(
                """
                INSERT INTO cert_sequence (year, last_number)
                VALUES (?, 1)
                ON CONFLICT(year) DO UPDATE SET last_number = last_number + 1
                RETURNING last_number
                """,
                (current_year,),
            )
            next_number = cursor.fetchone()[0]

        return f"CERT-{current_year}-{next_number:04d}"

    @staticmethod
    def _row_to_response(row) -> CertificationResponse:
        """Convert database row to CertificationResponse."""
        expiry_date = (
            date.fromisoformat(row["expiry_date"]) if row["expiry_date"] else None
        )
        validated_at = (
            datetime.fromisoformat(row["validated_at"]) if row["validated_at"] else None
        )

        status = compute_certification_status(expiry_date, validated_at)

        return CertificationResponse(
            id=row["id"],
            employee_id=row["employee_id"],
            employee_name=row["employee_name"],
            employee_email=row["employee_email"],
            vendor_oem=row["vendor_oem"],
            certification_name=row["certification_name"],
            credential_id=row["credential_id"],
            date_obtained=date.fromisoformat(row["date_obtained"]),
            expiry_date=expiry_date,
            file_path=row["file_path"],
            status=status,
            validated_by=row["validated_by"],
            validated_at=validated_at,
            created_at=datetime.fromisoformat(row["created_at"]),
        )

    @staticmethod
    def create(
        employee_id: int,
        employee_name: str,
        employee_email: str,
        vendor_oem: str,
        certification_name: str,
        date_obtained: date,
        credential_id: Optional[str] = None,
        expiry_date: Optional[date] = None,
        file_path: Optional[str] = None,
    ) -> CertificationResponse:
        """Create a new certification."""
        cert_id = CertificationRepository.generate_cert_id()

        with get_db() as conn:
            conn.execute(
                """
                INSERT INTO certifications (
                    id, employee_id, employee_name, employee_email,
                    vendor_oem, certification_name, credential_id,
                    date_obtained, expiry_date, file_path
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    cert_id,
                    employee_id,
                    employee_name,
                    employee_email,
                    vendor_oem,
                    certification_name,
                    credential_id,
                    date_obtained.isoformat(),
                    expiry_date.isoformat() if expiry_date else None,
                    file_path,
                ),
            )

        return CertificationRepository.get_by_id(cert_id)

    @staticmethod
    def get_by_id(cert_id: str) -> Optional[CertificationResponse]:
        """Get certification by ID."""
        with get_db() as conn:
            row = conn.execute(
                "SELECT * FROM certifications WHERE id = ?",
                (cert_id,),
            ).fetchone()

            if row:
                return CertificationRepository._row_to_response(row)
            return None

    @staticmethod
    def get_by_employee(employee_id: int) -> list[CertificationResponse]:
        """Get all certifications for an employee."""
        with get_db() as conn:
            rows = conn.execute(
                "SELECT * FROM certifications WHERE employee_id = ? ORDER BY created_at DESC",
                (employee_id,),
            ).fetchall()

            return [CertificationRepository._row_to_response(row) for row in rows]

    @staticmethod
    def get_all() -> list[CertificationResponse]:
        """Get all certifications."""
        with get_db() as conn:
            rows = conn.execute(
                "SELECT * FROM certifications ORDER BY created_at DESC"
            ).fetchall()

            return [CertificationRepository._row_to_response(row) for row in rows]

    @staticmethod
    def validate(cert_id: str, validated_by: int) -> Optional[CertificationResponse]:
        """Validate a certification."""
        with get_db() as conn:
            conn.execute(
                """
                UPDATE certifications
                SET validated_by = ?, validated_at = datetime('now'), updated_at = datetime('now')
                WHERE id = ?
                """,
                (validated_by, cert_id),
            )

        return CertificationRepository.get_by_id(cert_id)

    @staticmethod
    def delete(cert_id: str) -> bool:
        """Delete a certification."""
        with get_db() as conn:
            cursor = conn.execute(
                "DELETE FROM certifications WHERE id = ?",
                (cert_id,),
            )
            return cursor.rowcount > 0
