# SNAPSHARE — Real-Time Ephemeral Private Messaging

A high-performance, production-grade real-time private chat application where messages **disappear forever immediately after the recipient reads them**. Built using Clean Architecture, FastAPI, PostgreSQL 16, Redis 7, React 19, and Docker.

---

## Key Features

- ⚡ **Atomic Disappearing Engine**: Messages are purged permanently from PostgreSQL and memory the instant they are opened by the recipient. Fully idempotent with zero data retention.
- 🚀 **Asynchronous Scalability**: Full async I/O pipeline (`asyncpg`, SQLAlchemy 2.0 Async, `redis-py` async) with shared connection pooling handling thousands of concurrent sessions.
- 🔄 **Real-Time WebSocket Sync**: Native WebSockets with exponential backoff auto-reconnection, heartbeat monitoring, and distributed multi-instance broadcasting via Redis Pub/Sub.
- 🟢 **Live Online Presence & Typing**: Active status indicators, last seen timestamps, and dynamic typing feedback across multiple tabs/devices.
- 🎨 **Modern Dark UI/UX**: Built with React 19, Vite, Tailwind CSS, Lucide icons, and responsive mobile layouts.
- 🔒 **Security Hardened**: JWT access/refresh token rotation, bcrypt password hashing, sliding-window rate limiting, input validation via Pydantic v2, and CORS/XSS protection.
- 🐳 **Production Docker Suite**: Multi-stage Docker builds, Nginx reverse proxy with security headers, and Docker Compose orchestration.

---

## Production Deployment Guide

### 1. Requirements
- Docker & Docker Compose
- Or: Python 3.11+, Node.js 20+, PostgreSQL 16, Redis 7

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in secure production secrets:
```bash
cp .env.example .env
```

### 3. Production Deployment with Docker Compose
Run the multi-instance container stack (2 Backend Replicas, Frontend, PostgreSQL, Redis, Nginx Reverse Proxy):

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

Access the application at `http://localhost` (or your configured domain/HTTPS endpoint).

---

## Running Automated Tests & Load Testing

### Run Pytest Test Suite
```bash
cd backend
python -m pytest -v
```

### Run Locust Load Benchmark
```bash
cd load_testing
locust -f locustfile.py --headless -u 100 -r 20 --run-time 1m --host http://localhost:8000
```

---

## License

MIT License. Designed & Developed for Scalable Real-Time Ephemeral Communication.
