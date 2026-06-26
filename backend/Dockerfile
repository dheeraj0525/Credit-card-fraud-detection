# ---------- BASE IMAGE ----------
FROM python:3.11-slim

# ---------- ENV VARIABLES ----------
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# ---------- WORKDIR ----------
WORKDIR /app

# ---------- SYSTEM DEPENDENCIES ----------
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# ---------- INSTALL PYTHON DEPENDENCIES ----------
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ---------- COPY APP ----------
COPY . .

# ---------- EXPOSE PORT ----------
EXPOSE 8000

# ---------- START SERVER ----------
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]