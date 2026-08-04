# SnapChat Clone — Real-Time Disappearing Chat Application

A high-performance, production-grade real-time private chat application where messages **disappear forever immediately after the receiver reads them**. Built from scratch using Clean Architecture, FastAPI, PostgreSQL, Redis, React 19, and Docker.

---

## Key Features

- ⚡ **Instant Disappearing Engine**: Messages are purged permanently from PostgreSQL and Redis memory the second they are opened by the recipient. Zero recovery, zero backups.
- 🚀 **Asynchronous Architecture**: Full async I/O pipeline (`asyncpg`, SQLAlchemy 2.0 Async, `redis-py` async) handling thousands of concurrent WebSocket sessions.
- 🔄 **Real-Time WebSocket Sync**: Native WebSockets with automated reconnection, 25s heartbeat monitoring, and distributed multi-instance broadcasting via Redis Pub/Sub.
- 🟢 **Live Online Presence & Typing**: Active status indicators, last seen timestamps, and dynamic typing feedback.
- 🎨 **Modern Dark UI/UX**: Built with React 19, Vite, Tailwind CSS, Lucide icons, and smooth micro-animations.
- 🔒 **Security Hardened**: JWT access/refresh token rotation, bcrypt password hashing, input validation via Pydantic v2, and CORS/XSS protection.
- 🐳 **Docker Production Suite**: Multi-stage Docker builds and Docker Compose setup orchestrated with an Nginx reverse proxy.

---

## Tech Stack & Architecture

| Layer | Technology |
| :--- | :--- |
| **Backend Framework** | Python 3.11, FastAPI |
| **ORM & Database** | SQLAlchemy 2.0 Async, PostgreSQL 16 (`asyncpg`), Alembic |
| **Presence & Pub/Sub** | Redis 7 (`redis-py` async pub/sub) |
| **Auth & Security** | JWT (PyJWT), Passlib (Bcrypt), OAuth2 Bearer |
| **Frontend Framework** | React 19, Vite, Tailwind CSS |
| **Real-Time Layer** | Native WebSockets with Custom Reconnection & Heartbeat Hook |
| **Container & Proxy** | Docker, Docker Compose, Nginx Reverse Proxy |

---

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI REST endpoints & WebSocket router
│   │   ├── config/          # Pydantic environment settings
│   │   ├── database/        # Async SQLAlchemy engine & session factory
│   │   ├── dependencies/    # FastAPI dependency injectors (Auth, DB, Redis)
│   │   ├── middleware/      # CORS & global error handlers
│   │   ├── models/          # ORM database models (User, Message, RefreshToken, Session)
│   │   ├── repositories/    # Async CRUD & instant disappearing delete engine
│   │   ├── schemas/         # Pydantic request/response validation schemas
│   │   ├── services/        # Domain business logic (Auth, User, Message, Presence)
│   │   ├── utils/           # Password hashing & JWT token generators
│   │   ├── websocket/       # ConnectionManager, EventHandlers & Redis PubSub
│   │   └── main.py          # FastAPI application entrypoint & lifespan context
│   ├── alembic/             # Database migration scripts
│   ├── tests/               # Pytest async test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Avatar, Button, ChatWindow, UserList, etc.)
│   │   ├── contexts/        # AuthContext, SocketContext, ThemeContext
│   │   ├── hooks/           # useAuth, useSocket custom React hooks
│   │   ├── pages/           # View pages (Splash, Login, Register, Chat, Profile, Settings)
│   │   └── services/        # Axios API client & endpoints
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # Production multi-container orchestration
├── nginx.conf               # Root reverse proxy routing rules
└── README.md
```

---

## Environment Variables

Copy `.env.example` in `backend/` to `.env`:

```env
# Application Settings
PROJECT_NAME="SnapChat Clone"
API_V1_STR="/api/v1"
SECRET_KEY="super-secret-jwt-key-change-this-in-production-32chars"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database (PostgreSQL)
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=snapchat_chat

# Redis Cache & Pub/Sub
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## Quick Start — Local Development

### 1. Requirements
- Python 3.11+
- Node.js 20+
- PostgreSQL 16
- Redis 7

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend will start on `http://localhost:8000`. Swagger API docs available at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:5173`.

---

## Production Deployment with Docker Compose

Run the full container stack (PostgreSQL, Redis, FastAPI Backend, React Frontend, Nginx Proxy) with a single command:

```bash
docker-compose up --build -d
```

Access the application at: `http://localhost`.

---

## Real-Time Disappearing Message Protocol

```
Client A                         Server / DB                         Client B
   |                                  |                                  |
   |--- 1. send_message ------------->|                                  |
   |                                  |--- Store status: 'sent' -------->|
   |                                  |--- 2. WS new_message ------------>|
   |<-- ACK message_sent -------------|                                  |
   |                                  |                                  |
   |                                  |<-- 3. read_message (on open) ----|
   |                                  |--- Update status: 'seen' ------->|
   |                                  |--- DELETE FROM messages -------->|
   |<-- 4. WS message_deleted --------|--- 4. WS message_deleted ------->|
   |                                  |                                  |
   +====== (Message permanently purged from database and both UIs) ======+
```

---

## API & WebSocket Documentation

- **Swagger REST API UI**: `http://localhost/docs`
- **WebSocket Endpoint**: `ws://localhost/ws?token=<access_token>`
  - Supported Client Events: `send_message`, `read_message`, `typing`, `stop_typing`, `heartbeat`.
  - Server Broadcast Events: `new_message`, `message_deleted`, `typing_indicator`, `user_presence`, `pong`.

---

## Running Automated Tests

```bash
cd backend
pytest -v
```

Tests include auth registration/login, user search, and verification that read messages are permanently purged from database tables.

---

## License

MIT License. Designed & Developed for Scalable Real-Time Ephemeral Communication.
