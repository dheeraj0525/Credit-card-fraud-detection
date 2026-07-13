# FraudSense: Credit Card Fraud Detection System

An enterprise-grade, ML-powered real-time credit card fraud detection system featuring advanced behavioral spending analysis, comprehensive case management, and administrative observability metrics.

---

## 📋 Table of Contents
1. [Technologies Used](#-technologies-used)
2. [Folder Structure](#-folder-structure)
3. [Architecture Diagram](#-architecture-diagram)
4. [Database ER Diagram](#-database-er-diagram)
5. [Complete Feature Checklist](#-complete-feature-checklist)
6. [API List Documentation](#-api-list-documentation)
7. [Installation & Setup Guide](#-installation--setup-guide)
8. [Docker Instructions](#-docker-instructions)
9. [Swagger Usage Guide](#-swagger-usage-guide)
10. [Deployment Guide](#-deployment-guide)
11. [User & Admin Manuals](#-user--admin-manuals)
12. [Interview & Resume Portfolios](#-interview--resume-portfolios)

---

## 🛠️ Technologies Used

### Backend
- **Python 3.12** & **FastAPI** (High-performance ASGI framework)
- **SQLAlchemy ORM** & **Alembic** migrations
- **SQLite** / **PostgreSQL** Database
- **JWT Auth** (access and refresh token pairs)
- **Bcrypt** password hashing

### Machine Learning
- **XGBoost Inference** (High-precision classification)
- **Scikit-learn** & **StandardScaler** Preprocessing
- **Joblib** serialization models
- **SHAP** feature attributionattributions logs

### Frontend
- **HTML5**, **CSS3 (Vanilla)**, & **JavaScript (Vanilla)**
- **Chart.js** (Dynamic risk gauges, drift charts, analytics histograms)
- **FontAwesome** Icons

---

## 📂 Folder Structure

```text
credit-card-fraud-detection/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── admin.py           # Admin health, performance, audit metrics
│   │   │   │   ├── auth.py            # Login, registration, password resets, refresh
│   │   │   │   ├── bank_analysis.py   # Spending uploads and customer profile metrics
│   │   │   │   ├── cases.py           # Fraud case assignments and journals
│   │   │   │   ├── files.py           # Staging model staging downloads and report streams
│   │   │   │   ├── monitoring.py      # CPU/Memory and in-app alerts checks
│   │   │   │   └── transactions.py    # Scoring single/batch transactions
│   │   │   └── router.py              # Root router mounts
│   │   ├── core/
│   │   │   ├── config.py              # App environment properties
│   │   │   ├── database.py            # SQLAlchemy sessions engine
│   │   │   ├── security.py            # JWT and Bcrypt cryptographies
│   │   │   └── security_dep.py        # Dependency injection auth blocks
│   │   ├── middleware/
│   │   │   └── rate_limiter.py        # IP limiting and security headers
│   │   ├── models/                    # SQL Database Tables
│   │   │   ├── audit_log.py
│   │   │   ├── bank_analysis.py       # BankTransaction and BehaviouralProfile
│   │   │   ├── case_management.py     # FraudCase management
│   │   │   ├── in_app_notification.py # InAppNotification alert feeds
│   │   │   ├── notification_log.py    # NotificationLog email records
│   │   │   ├── transaction.py         # Scored transactions
│   │   │   └── user.py                # Analyst profile logs
│   │   ├── services/
│   │   │   ├── auth_service.py        # Login logic and account lockouts
│   │   │   └── fraud_scorer.py        # Scaler and XGBoost inference loader
│   │   ├── tasks/
│   │   │   └── scheduler.py           # Background task cron loop
│   │   └── main.py                    # Server initiation lifespan
│   ├── ml/
│   │   ├── data/
│   │   │   └── processed/
│   │   │       └── scaler.pkl         # Trained StandardScaler
│   │   └── models/
│   │       └── xgboost_v1.pkl         # Trained XGBoost binary
│   ├── tests/
│   │   └── test_production_readiness.py # Self-contained integration test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── index.html                     # Core Single Page Shell
│   ├── app.js                         # SPA Routing, charts, metrics, controllers
│   └── style.css                      # Premium dark-theme custom UI
├── docker-compose.yml
├── requirements.txt                   # Top-level dependencies
└── settings.json                      # Dynamically updated configs
```

---

## 📐 Architecture Diagram

```mermaid
graph TD
    Client[Vanilla HTML/JS Frontend] -->|REST Requests| Gate[Rate Limiter & Security Headers Middleware]
    Gate -->|Auth Required| Router[FastAPI Router]
    Router -->|Verify Credentials| Security[Core Security & JWT Auth]
    Router -->|Score Request| Scorer[Fraud Scorer Engine]
    Scorer -->|Feature scaling| Scaler[StandardScaler pkl]
    Scorer -->|Compute Probability| XGBoost[XGBoost Model v1 pkl]
    Scorer -->|Anomalies Checks| BankAnalysis[Bank Behavioural Profile]
    Router -->|Case Review / Settings| DB[(SQLite / PostgreSQL DB)]
    Router -->|Observability Metrics| Monitor[Uptime & System Monitor]
    
    Lifespan[Lifespan Task Scheduler] -->|Cron Runs| DB
```

---

## 📊 Database ER Diagram

```mermaid
erDiagram
    USERS {
        int id PK
        string email
        string hashed_password
        boolean is_admin
        boolean is_active
    }
    TRANSACTIONS {
        int id PK
        float amount
        float fraud_probability
        string risk_level
        string status
        string comments
        string audited_by
        datetime created_at
    }
    BANK_TRANSACTIONS {
        int id PK
        string customer_id
        datetime date
        float amount
        string merchant
        string location
        string time
    }
    BEHAVIOURAL_PROFILES {
        int id PK
        string customer_id UK
        float avg_spending
        float max_spending
        float min_spending
        float avg_daily_spending
        float avg_monthly_spending
        string common_merchants
        string common_locations
        string common_times
        float weekend_ratio
        float tx_frequency
    }
    FRAUD_CASES {
        int id PK
        int transaction_id FK
        string assigned_to
        string status
        string notes
        datetime updated_at
    }
    NOTIFICATION_LOGS {
        int id PK
        string customer_name
        string account_number
        string transaction_id
        float amount
        string merchant
        string location
        datetime datetime
        float ml_risk_score
        float behavioural_risk_score
        string shap_summary
        string recommendation
        string status
        datetime created_at
    }
    AUDIT_LOGS {
        int id PK
        string action
        datetime created_at
    }
    IN_APP_NOTIFICATIONS {
        int id PK
        string message
        boolean read
        datetime created_at
    }
```

---

## ✔ Complete Feature Checklist

- **Authentication & Security**:
  - [x] JWT access & refresh token pair validation.
  - [x] Strict client & server password strength check.
  - [x] IP-based rate limiting (100 req/min) & account lockouts (5 failed tries ➡️ 15 mins block).
  - [x] Security headers auto-injection.
- **Scoring Pipeline**:
  - [x] StandardScaler scaling V1-V28 vectors on-the-fly.
  - [x] XGBoost model classification checking against dynamic thresholds.
  - [x] Merged behavioral anomalies (Impossible travel, spending spikes) combined score calculations.
- **Administrative Operations**:
  - [x] In-app alerts, audit timeline logging, and CPU/Memory monitoring metrics.
  - [x] Staged model and training CSV file uploads.
  - [x] Configurable SMTP variables and dynamic fraud thresholds.
  - [x] Interactive analytics using Chart.js.

---

## ⚡ API List Documentation

| Endpoint | Method | Security | Description |
|---|---|---|---|
| `/api/auth/register` | `POST` | Public | Create new analyst login |
| `/api/auth/login` | `POST` | Public | Login credentials, resets locks, issues tokens |
| `/api/auth/refresh` | `POST` | Public | Refresh expired access token using refresh token |
| `/api/auth/forgot-password` | `POST` | Public | Request secure password reset token |
| `/api/auth/reset-password` | `POST` | Public | Update password using reset token |
| `/api/transactions/score` | `POST` | Public | Score a single transaction (ML + behavioral) |
| `/api/transactions/upload` | `POST` | Analyst | Batch score transaction list from CSV file |
| `/api/bank/import` | `POST` | Analyst | Import historical spending profiles |
| `/api/bank/profiles/{customer_id}` | `GET` | Analyst | Fetch behavioral analytics for customer |
| `/api/cases` | `GET` | Analyst | Retrieve active fraud cases |
| `/api/cases/{case_id}` | `PUT` | Analyst | Assign case and record investigation notes |
| `/api/monitoring/metrics` | `GET` | Analyst | Uptime, memory usage, CPU load, latencies |
| `/api/monitoring/notifications` | `GET` | Analyst | List unread in-app alerts |
| `/api/monitoring/notifications/{id}/read` | `PUT` | Analyst | Mark alert banner notification as read |
| `/api/model-monitoring/drift` | `GET` | Analyst | Retrieve feature drift PSI histograms |
| `/api/config` | `GET` | Analyst | Read active smtp parameters & thresholds |
| `/api/config` | `PUT` | Admin | Write configs to `settings.json` dynamically |
| `/api/files/models` | `POST` | Admin | Stage joblib model pickle binaries |
| `/api/files/datasets` | `POST` | Admin | Upload training CSV datasets |
| `/api/files/reports/{type}` | `GET` | Analyst | Stream downloadable PDF/CSV audit reports |

---

## 🚀 Installation & Setup Guide

### Prerequisites
- Python 3.11 or Python 3.12
- SQLite (default) / PostgreSQL

### Native Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/fraudsense/fraud-detection.git
   cd fraud-detection
   ```
2. Navigate to the backend directory, initialize a virtual environment, and install dependencies:
   ```bash
   cd backend
   python -m venv .venv
   .\.venv\Scripts\activate   # Windows
   source .venv/bin/activate  # macOS/Linux
   pip install -r requirements.txt
   ```
3. Start the FastAPI backend server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```
4. Access the frontend dashboard client by navigating to `http://localhost:8000/index.html` in your web browser.

---

## 🐳 Docker Instructions

Build and deploy the application within a containerized environment.

1. Build the backend image:
   ```bash
   docker build -t fraudsense-backend ./backend
   ```
2. Run the container:
   ```bash
   docker run -d -p 8000:8000 --name fraudsense-service fraudsense-backend
   ```
3. Using Docker Compose:
   Deploy the entire application including databases and configurations:
   ```bash
   docker-compose up --build -d
   ```

---

## 📖 Swagger Usage Guide

FastAPI automatically compiles interactive OpenAPI documentation.
1. Start the server and navigate to `http://localhost:8000/docs` in your browser.
2. Select the `/api/auth/login` endpoint, click **Try it out**, fill in the administrator username (`admin@fraudsense.com`) and password (`admin123`), and click **Execute**.
3. Copy the returned `access_token` string.
4. Scroll to the top of the Swagger interface and click the green **Authorize** button.
5. Paste the copied token in the value input format: `Bearer YOUR_TOKEN_STRING` and click **Authorize**.
6. All restricted analyst and admin API endpoints are now unlocked for testing directly within the browser interface.

---

## 🌐 Deployment Guide

To deploy **FraudSense** to production (e.g. AWS EC2 / Heroku / GCP):
1. **Database Configuration**: Override the database URI variable in `.env` to point to a production-grade PostgreSQL server:
   ```env
   DATABASE_URL=postgresql://user:password@rds-instance:5432/fraudsense
   ```
2. **Reverse Proxy & SSL**: Configure Nginx as a reverse proxy in front of uvicorn to handle SSL termination, redirecting port 80 requests to port 443.
3. **Process Manager**: Run uvicorn using `gunicorn` with Uvicorn workers to manage process lifespans and system restarts:
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
   ```

---

## 🧑‍💻 User & Admin Manuals

### Analyst Manual
- **Logging In**: Log in using your registered analyst email. Basic `USER` observers can only view dashboards, while `ANALYST` accounts can evaluate scores.
- **Scoring Transactions**: Navigate to **New Predict**. Select a testing template or manually fill Amount, Location, and Merchant parameters. Click **Get Score** to see ML attributions and behavioral anomaly alerts.
- **Alert Bank**: If a scored transaction returns a high risk warning, click **Notify Bank** to view and send the structured fraud alert email.

### Administrator Manual
- **Managing Configs**: Click **Admin Panel** ➡️ **Settings** tab. Adjust the active Fraud threshold slider (e.g., lowering to `0.2` makes system highly alert; increasing to `0.8` makes it conservative) and click save.
- **Reviewing Drift**: Check the **Model Drift** tab to see Kolmogorov-Smirnov / PSI histogram metrics for PCA components.

---

## 💼 Interview & Resume Portfolios

### Resume Description
> **Lead AI & Security Engineer — FraudSense Detection System**
> - Designed and deployed a high-performance credit card fraud detection system utilizing FastAPI, SQLAlchemy, and a custom-integrated XGBoost model pipeline achieving latency profiles under 10ms.
> - Engineered a custom IP-based rate limiting middleware and an in-memory account lockout security subsystem protecting endpoints from brute force vectors.
> - Integrated a customer behavioral spending analysis engine mapping outlier transaction anomalies against historical spending profiles.

### Interview QA Script
* **Q: How does the system protect against brute force login attacks?**
  * *A: We implemented an in-memory failed attempt counter on the FastAPI backend. If an IP address or email credentials fail authentication 5 consecutive times, further calls are blocked for a 15-minute cooloff period before verification checks are permitted again. This avoids database overhead during active attacks.*
* **Q: How are database operations protected from SQL Injection?**
  * *A: The application avoids raw SQL string formatting completely. Every transaction, case, and notification check runs through SQLAlchemy's parameterized expression engine, binding variables securely to SQL compile boundaries.*
