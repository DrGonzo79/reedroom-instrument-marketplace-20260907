FROM python:3.13-slim
COPY --from=ghcr.io/astral-sh/uv:0.8.15 /uv /usr/local/bin/uv
WORKDIR /service
COPY api/pyproject.toml api/uv.lock ./api/
WORKDIR /service/api
RUN uv sync --frozen --no-dev
COPY api/main.py ./main.py
COPY data /service/data
RUN useradd --uid 10001 --create-home app
USER app
EXPOSE 8000
CMD [".venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
