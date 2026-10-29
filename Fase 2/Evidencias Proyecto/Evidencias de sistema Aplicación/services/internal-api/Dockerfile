FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements-runtime.txt ./
RUN pip install --no-cache-dir -r requirements-runtime.txt \
    && useradd --create-home --uid 10001 emergen
COPY --chown=emergen:emergen app ./app
COPY --chown=emergen:emergen run.py ./
USER emergen
EXPOSE 8000
CMD ["python", "run.py"]
