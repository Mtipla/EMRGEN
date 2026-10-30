FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY locks/requirements-linux-py312.lock ./
RUN pip install --no-cache-dir --require-hashes -r requirements-linux-py312.lock \
    && useradd --create-home --uid 10001 emergen
COPY --chown=emergen:emergen app ./app
COPY --chown=emergen:emergen run.py ./
USER emergen
EXPOSE 8000
CMD ["python", "run.py"]
