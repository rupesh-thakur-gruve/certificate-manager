"""Employee repository for database operations."""

from datetime import datetime
from typing import Optional

from database.connection import get_db
from models.employee import EmployeeInDB, RoleEnum


class EmployeeRepository:
    """Repository for employee database operations."""

    @staticmethod
    def get_by_email(email: str) -> Optional[EmployeeInDB]:
        """Get employee by email."""
        with get_db() as conn:
            row = conn.execute(
                "SELECT * FROM employees WHERE email = ?",
                (email,),
            ).fetchone()

            if row:
                return EmployeeInDB(
                    id=row["id"],
                    email=row["email"],
                    password_hash=row["password_hash"],
                    name=row["name"],
                    role=RoleEnum(row["role"]),
                    department=row["department"],
                    created_at=datetime.fromisoformat(row["created_at"]),
                    updated_at=datetime.fromisoformat(row["updated_at"]),
                )
            return None

    @staticmethod
    def get_by_id(employee_id: int) -> Optional[EmployeeInDB]:
        """Get employee by ID."""
        with get_db() as conn:
            row = conn.execute(
                "SELECT * FROM employees WHERE id = ?",
                (employee_id,),
            ).fetchone()

            if row:
                return EmployeeInDB(
                    id=row["id"],
                    email=row["email"],
                    password_hash=row["password_hash"],
                    name=row["name"],
                    role=RoleEnum(row["role"]),
                    department=row["department"],
                    created_at=datetime.fromisoformat(row["created_at"]),
                    updated_at=datetime.fromisoformat(row["updated_at"]),
                )
            return None

    @staticmethod
    def create(
        email: str,
        password_hash: str,
        name: str,
        role: RoleEnum,
        department: Optional[str] = None,
    ) -> EmployeeInDB:
        """Create a new employee."""
        with get_db() as conn:
            cursor = conn.execute(
                """
                INSERT INTO employees (email, password_hash, name, role, department)
                VALUES (?, ?, ?, ?, ?)
                """,
                (email, password_hash, name, role.value, department),
            )
            employee_id = cursor.lastrowid

        return EmployeeRepository.get_by_id(employee_id)

    @staticmethod
    def get_all() -> list[EmployeeInDB]:
        """Get all employees."""
        with get_db() as conn:
            rows = conn.execute("SELECT * FROM employees").fetchall()

            return [
                EmployeeInDB(
                    id=row["id"],
                    email=row["email"],
                    password_hash=row["password_hash"],
                    name=row["name"],
                    role=RoleEnum(row["role"]),
                    department=row["department"],
                    created_at=datetime.fromisoformat(row["created_at"]),
                    updated_at=datetime.fromisoformat(row["updated_at"]),
                )
                for row in rows
            ]
