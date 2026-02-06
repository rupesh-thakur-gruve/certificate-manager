# Certificate Manager Backend - Makefile
# Uses uv for Python package management

.PHONY: help setup install run-local test lint format setup-pre-commit run-hooks clean

help:
	@echo "Certificate Manager Backend - Available Commands:"
	@echo ""
	@echo "  make setup           - Create virtual environment and install dependencies"
	@echo "  make install         - Install project dependencies only"
	@echo "  make run-local       - Start Docker services (if available) and run the app"
	@echo "  make run             - Run the application directly (Ctrl+C to stop)"
	@echo "  make test            - Run all tests with pytest"
	@echo "  make lint            - Run linting checks with ruff"
	@echo "  make format          - Format code with ruff"
	@echo "  make setup-pre-commit - Install pre-commit hooks"
	@echo "  make run-hooks       - Run all pre-commit hooks"
	@echo "  make clean           - Remove cache and build artifacts"
	@echo ""

setup:
	@echo "Setting up development environment..."
	@if ! command -v uv &> /dev/null; then \
		echo "Installing uv..."; \
		curl -LsSf https://astral.sh/uv/install.sh | sh; \
	fi
	@echo "Creating virtual environment and installing dependencies..."
	uv venv
	uv pip install -r requirements.txt
	@echo "Copying example environment file..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env file - please update with your settings"; \
	fi
	@echo "Setup complete! Run 'make run' to start the application."

install:
	@echo "Installing dependencies..."
	uv pip install -r requirements.txt

run-local:
	@echo "Starting Docker Compose services (if available)..."
	@if [ -f "docker/docker-compose-local.yml" ]; then \
		docker compose -f docker/docker-compose-local.yml up -d || { echo "Warning: Failed to start Docker Compose services"; }; \
	else \
		echo "docker-compose-local.yml not found — skipping Docker Compose."; \
	fi

	@echo "Running the application (Ctrl+C to stop)..."
	@trap 'echo "\nStopping Docker Compose services..."; \
		if [ -f "docker/docker-compose-local.yml" ]; then \
			docker compose -f docker/docker-compose-local.yml down; \
		fi; \
	' INT EXIT; \
	uv run uvicorn main:app --reload --port 8000

run:
	@echo "Starting the application on http://localhost:8000..."
	uv run uvicorn main:app --reload --port 8000

test:
	@echo "Running tests with pytest..."
	uv run pytest -v --tb=short

test-cov:
	@echo "Running tests with coverage..."
	uv run pytest -v --cov=. --cov-report=html --cov-report=term-missing

lint:
	@echo "Running linting checks with ruff..."
	uv run ruff check .

format:
	@echo "Formatting code with ruff..."
	uv run ruff format .
	uv run ruff check . --fix

setup-pre-commit:
	@echo "Setting up pre-commit hooks..."
	uv run pre-commit install

run-hooks:
	@echo "Running all pre-commit hooks..."
	uv run pre-commit run --all-files

clean:
	@echo "Cleaning up cache and build artifacts..."
	rm -rf __pycache__ .pytest_cache .ruff_cache .coverage htmlcov
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "Cleanup complete!"

# Development helpers
init-db:
	@echo "Initializing database..."
	uv run python -c "from database.migrations import init_db; import asyncio; asyncio.run(init_db())"

seed-db:
	@echo "Seeding demo users..."
	uv run python -c "from database.migrations import seed_demo_users; import asyncio; asyncio.run(seed_demo_users())"
