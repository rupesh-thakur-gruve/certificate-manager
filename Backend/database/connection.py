"""
SQLite database connection management.
"""

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Generator

from config import get_settings

settings = get_settings()


def get_db_path() -> Path:
    """Get the database file path, creating parent directories if needed."""
    db_path = Path(settings.DATABASE_PATH)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    return db_path


@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    """
    Context manager for database connections.
    
    Usage:
        with get_db() as conn:
            cursor = conn.execute("SELECT * FROM employees")
    """
    conn = sqlite3.connect(str(get_db_path()))
    conn.row_factory = sqlite3.Row  # Enable dict-like access
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    """Initialize database with schema."""
    from .migrations import create_tables
    create_tables()
