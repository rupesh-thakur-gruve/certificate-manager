"""
Database migrations - schema creation and updates.
"""

from .connection import get_db


def create_tables() -> None:
    """Create all database tables if they don't exist."""
    with get_db() as conn:
        # Employees table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS employees (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                email           TEXT UNIQUE NOT NULL,
                password_hash   TEXT NOT NULL,
                name            TEXT NOT NULL,
                role            TEXT NOT NULL CHECK (role IN ('employee', 'manager')),
                department      TEXT,
                created_at      TEXT DEFAULT (datetime('now')),
                updated_at      TEXT DEFAULT (datetime('now'))
            )
        """)

        # Certifications table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS certifications (
                id              TEXT PRIMARY KEY,
                employee_id     INTEGER NOT NULL,
                employee_name   TEXT NOT NULL,
                employee_email  TEXT NOT NULL,
                vendor_oem      TEXT NOT NULL,
                certification_name TEXT NOT NULL,
                credential_id   TEXT,
                date_obtained   TEXT NOT NULL,
                expiry_date     TEXT,
                file_path       TEXT,
                validated_by    INTEGER,
                validated_at    TEXT,
                created_at      TEXT DEFAULT (datetime('now')),
                updated_at      TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (employee_id) REFERENCES employees(id),
                FOREIGN KEY (validated_by) REFERENCES employees(id)
            )
        """)

        # Audit logs table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp       TEXT DEFAULT (datetime('now')),
                actor_role      TEXT NOT NULL,
                actor_email     TEXT NOT NULL,
                action          TEXT NOT NULL,
                entity_type     TEXT NOT NULL,
                entity_id       TEXT,
                notes           TEXT,
                ip_address      TEXT
            )
        """)

        # Sequence table for cert ID generation
        conn.execute("""
            CREATE TABLE IF NOT EXISTS cert_sequence (
                year            INTEGER PRIMARY KEY,
                last_number     INTEGER DEFAULT 0
            )
        """)

        # Create indexes
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_certs_employee 
            ON certifications(employee_id)
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_certs_expiry 
            ON certifications(expiry_date)
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_audit_actor 
            ON audit_logs(actor_email)
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_audit_entity 
            ON audit_logs(entity_type, entity_id)
        """)


def seed_demo_users() -> None:
    """Seed demo users for testing."""
    from auth.password import hash_password

    demo_users = [
        {
            "email": "rupesh.thakur@gruve.ai",
            "password": "Pass@#8550",
            "name": "Rupesh Thakur",
            "role": "employee",
            "department": "Engineering",
        },
        {
            "email": "gajanan.patil@gruve.ai",
            "password": "Pass@#123123",
            "name": "Gajanan Patil",
            "role": "manager",
            "department": "Engineering",
        },
    ]

    with get_db() as conn:
        for user in demo_users:
            # Check if user exists
            existing = conn.execute(
                "SELECT id FROM employees WHERE email = ?",
                (user["email"],)
            ).fetchone()

            if not existing:
                password_hash = hash_password(user["password"])
                conn.execute(
                    """
                    INSERT INTO employees (email, password_hash, name, role, department)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        user["email"],
                        password_hash,
                        user["name"],
                        user["role"],
                        user["department"],
                    ),
                )
