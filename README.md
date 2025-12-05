# YayNot API

> **English** | [Tiếng Việt](README.vi.md)

**YayNot** is a social Q&A platform with real-time chat, notifications, voting, and content moderation features.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/atlas)
[![Redis](https://img.shields.io/badge/Redis-Cloud-red)](https://redis.io/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-CloudAMQP-orange)](https://www.cloudamqp.com/)

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)

---

## ✨ Features

### Core Features

- **Authentication & Authorization**

  - JWT-based authentication (Access Token + Refresh Token)
  - Email verification with OTP
  - Role-based access control (RBAC)
  - Rate limiting for security

- **Question Management**

  - Create, edit, delete questions
  - Draft mode and publish workflow
  - Visibility control (public/private/followers only)
  - Question history tracking
  - Bookmark, view count, share tracking
  - Care/Follow questions

- **Comments & Interactions**

  - Nested comments (replies)
  - Comment likes
  - Pin comments (question owner only)
  - Rich text support

- **Voting System**

  - Upvote/Downvote for questions
  - Vote analytics

- **Social Features**

  - Follow/Unfollow users
  - User profiles with avatar, bio, links
  - Activity feed

- **Real-time Features**

  - Socket.io for real-time chat
  - Live notifications
  - Presence indicators

- **Content Moderation**

  - Report system (questions, comments, users)
  - Admin review panel
  - Automated actions (hide, delete, warn, ban)
  - Report statistics

- **Media Upload**
  - Cloudinary integration
  - Image optimization (avatar, posts, thumbnails)
  - Multer middleware

### Background Processing

- **Message Queue (RabbitMQ)**

  - Async notification delivery
  - Email sending queue
  - Event-driven architecture

- **Cron Jobs**

  - Async view count updates
  - Periodic data sync from Redis → MongoDB
  - Scheduled cleanup tasks

- **Caching (Redis)**
  - Query result caching
  - Session storage
  - Rate limiting counters
  - Distributed locks

---

## 🏗️ Architecture

### Hybrid Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                                │
│                   (Web/Mobile App)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼─────┐          ┌─────▼────┐
    │  VERCEL  │          │ Railway  │
    │(Serverless)│        │(Workers) │
    │  API Only │          │Background│
    └────┬─────┘          └─────┬────┘
         │                      │
         ├──────────┬───────────┤
         │          │           │
    ┌────▼───┐ ┌───▼────┐ ┌───▼─────┐
    │MongoDB │ │ Redis  │ │RabbitMQ │
    │ Atlas  │ │ Cloud  │ │CloudAMQP│
    └────────┘ └────────┘ └─────────┘
```

### Component Separation

**Vercel (Serverless - IS_SERVERLESS=true):**

- ✅ Express API routes
- ✅ JWT authentication
- ✅ Database queries (MongoDB + Redis)
- ✅ Message producers (RabbitMQ)
- ❌ NO cron jobs
- ❌ NO message consumers

**Railway (Worker - IS_SERVERLESS=false):**

- ✅ RabbitMQ consumers
- ✅ Cron jobs (view sync, data flush)
- ✅ Background tasks
- ❌ NO HTTP endpoints (optional)

---

## 🛠️ Tech Stack

### Backend

- **Runtime:** Node.js 20.x
- **Framework:** Express 5.x
- **Language:** JavaScript (ES6+)

### Databases & Storage

- **MongoDB 6.x** - Primary database (Mongoose ODM)
- **Redis 5.x** - Caching & session (ioredis)
- **Cloudinary** - Image/media storage

### Message Queue & Real-time

- **RabbitMQ** - Async messaging (amqplib)
- **Socket.io** - WebSocket real-time

### Security & Validation

- **JWT** - Authentication (jsonwebtoken)
- **Bcrypt** - Password hashing
- **Joi** - Request validation
- **express-rate-limit** - DDoS protection
- **AccessControl** - RBAC

### DevOps & Deployment

- **Docker** - Containerization
- **Docker Compose** - Local dev orchestration
- **Vercel** - Serverless API hosting
- **Railway** - Worker hosting
- **GitHub Actions** - CI/CD

### Monitoring & Logging

- **Winston** - Structured logging
- **winston-daily-rotate-file** - Log rotation

### Developer Tools

- **Nodemon** - Dev auto-reload
- **ESLint** - Code linting
- **Jest** - Testing framework
- **Swagger** - API documentation

---

## 🚀 Installation

### Prerequisites

```bash
node >= 20.x
npm >= 10.x
docker & docker-compose (optional - for local dev)
```

### 1. Clone Repository

```bash
git clone https://github.com/khaicoderproject/yaynot-api.git
cd yaynot-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create `.env` file from template:

```bash
# Copy and edit
cp .env.example .env
```

See [Environment Variables](#-environment-variables) for details.

### 4. Local Development

**Option A: Docker Compose (Recommended)**

```bash
# Start all services (MongoDB, Redis, RabbitMQ, Backend)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

**Option B: Local Node.js**

```bash
# Requires MongoDB, Redis, RabbitMQ running separately
npm run dev

# Or run socket server separately
npm run socket
```

### 5. Initialize Database (Optional)

```bash
npm run initdb
```

### 6. Access Application

- **API:** http://localhost:8888
- **Health Check:** http://localhost:8888/health
- **Swagger Docs:** http://localhost:8888/api-docs

---

## 🌐 Deployment

### Vercel (API Serverless)

**1. Cài Vercel CLI:**

```bash
npm i -g vercel
```

**2. Link project:**

```bash
vercel link
```

**3. Add Environment Variables on Vercel Dashboard:**

- Go to **Settings → Environment Variables**
- Add all variables from `.env.production` (see below)
- **Important:** Set `IS_SERVERLESS=true`

**4. Deploy:**

```bash
vercel --prod
```

**Or automatically via GitHub Actions:**

- Push code to `main` branch
- Workflow `.github/workflows/deploy-vercel.yml` runs automatically

### Railway (Workers)

**1. Create Railway Project:**

- Go to [railway.app](https://railway.app)
- Create new project
- Connect GitHub repo

**2. Add Environment Variables:**

- Set `IS_SERVERLESS=false`
- Add MongoDB, Redis, RabbitMQ URLs

**3. Deploy:**

- Railway automatically builds from `Dockerfile`
- Or trigger via workflow: `.github/workflows/deploy-railway.yml`

### Docker (Self-hosted)

```bash
# Build image
docker build -t yaynot-api .

# Run container
docker run -p 8888:8888 \
  -e URL_MONGODB="mongodb://..." \
  -e REDIS_URL="redis://..." \
  yaynot-api
```

### Docker Compose (Production)

```bash
docker-compose -f docker-compose.yaml up -d
```

---

## 📚 API Documentation

### Swagger UI

Access **Swagger docs** at:

- **Local:** http://localhost:8888/api-docs
- **Production:** https://yaynot-api.vercel.app/api-docs

### API Endpoints Overview

| Module            | Endpoint                  | Methods                                             |
| ----------------- | ------------------------- | --------------------------------------------------- |
| **Auth**          | `/api/v1/auth/*`          | Register, Login, Logout, Refresh, Verify, Sessions  |
| **Questions**     | `/api/v1/questions/*`     | CRUD, Publish, Bookmark, View, Share, Care, History |
| **Trending**      | `/api/v1/trending/*`      | Get trending questions, Statistics                  |
| **Comments**      | `/api/v1/comments/*`      | CRUD, Like, Pin                                     |
| **Votes**         | `/api/v1/votes/*`         | Upvote, Downvote                                    |
| **Profile**       | `/api/v1/profile/*`       | Update profile, Avatar                              |
| **Follow**        | `/api/v1/follows/*`       | Follow, Unfollow, Followers, Followings             |
| **Upload**        | `/api/v1/uploads/:type`   | Image upload (avatar, post, thumb)                  |
| **Chat**          | `/api/v1/chats/*`         | Conversations, Messages, Search                     |
| **Notifications** | `/api/v1/notifications/*` | List, Mark read, Delete                             |
| **Reports**       | `/api/v1/reports/*`       | Submit, View reports, Cancel                        |
| **Admin**         | `/api/admin/v1/*`         | Moderation, Statistics, Reports Review              |

### Authentication

Most endpoints require **JWT token** in header:

```http
Authorization: Bearer <your_access_token>
```

---

## 📁 Project Structure

```
yaynot-api/
├── .github/
│   └── workflows/              # CI/CD workflows
│       ├── deploy-vercel.yml   # Vercel auto deployment
│       ├── deploy-railway.yml  # Railway auto deployment
│       ├── deploy-render.yml   # Render deployment
│       └── deploy-cloud.yml    # Cloud deployment
├── src/
│   ├── app.js                  # Express app setup
│   ├── auth/                   # JWT utilities
│   │   └── authUtil.hybrid.js
│   ├── configs/                # Configuration files
│   │   ├── auth.config.js
│   │   ├── mongodb.config.js
│   │   ├── redis.config.js
│   │   ├── rabbitmq.config.js
│   │   ├── cloudinary.config.js
│   │   ├── multer.config.js
│   │   ├── socketio.config.js
│   │   ├── trending.config.js
│   │   └── ...
│   ├── constants/              # Enums & constants
│   ├── controllers/            # Request handlers
│   │   ├── auth/
│   │   ├── question/
│   │   ├── nestedComment/
│   │   ├── vote/
│   │   ├── follow/
│   │   ├── chat/
│   │   ├── notification/
│   │   ├── report/
│   │   ├── upload/
│   │   ├── userProfile/
│   │   └── rbac/
│   ├── core/                   # Response wrappers
│   │   ├── success.response.js
│   │   └── error.response.js
│   ├── cronjob/                # Scheduled tasks
│   │   └── question/
│   ├── databases/              # DB connections
│   │   ├── init.mongodb.js
│   │   └── init.redis.js
│   ├── domain/                 # Business logic layer
│   │   ├── question/
│   │   └── report/
│   ├── helpers/                # Utility functions
│   ├── infrastructures/        # Infrastructure layer
│   ├── interface/              # Contracts/interfaces
│   ├── logger/                 # Winston logger
│   ├── logs/                   # Log files (gitignored)
│   ├── message-queue/          # Message queue systems
│   │   ├── kafka/
│   │   └── rabbitmq/
│   │       ├── connectRabbitmq.js
│   │       ├── setupRabbitmq.js
│   │       ├── consumers/
│   │       ├── producers/
│   │       ├── dlx/
│   │       └── retry-policy/
│   ├── middlewares/            # Express middlewares
│   │   ├── auth/
│   │   ├── rbac/
│   │   ├── vote/
│   │   ├── validate.js
│   │   ├── checkOwnership.js
│   │   └── ...
│   ├── models/                 # Mongoose models
│   │   ├── user.model.js
│   │   ├── question.model.js
│   │   ├── nestedComment.model.js
│   │   ├── vote.model.js
│   │   ├── notification.model.js
│   │   ├── report.model.js
│   │   ├── bookmark.model.js
│   │   ├── follow.model.js
│   │   └── repositories/       # Repository pattern
│   ├── routes/                 # API routes
│   │   ├── api/
│   │   │   ├── v1/             # API version 1
│   │   │   │   ├── auth/
│   │   │   │   ├── question/
│   │   │   │   ├── comment/
│   │   │   │   ├── vote/
│   │   │   │   ├── follow/
│   │   │   │   ├── chat/
│   │   │   │   ├── notification/
│   │   │   │   ├── report/
│   │   │   │   ├── upload/
│   │   │   │   └── trending/
│   │   │   └── admin/          # Admin routes
│   │   │       └── v1/
│   │   └── index.js
│   ├── services/               # Business logic services
│   │   ├── auth.service.js
│   │   ├── question/
│   │   ├── nestedComment.service.js
│   │   ├── vote.service.js
│   │   ├── follow.service.js
│   │   ├── chat.service.js
│   │   ├── notification.service.js
│   │   ├── report.service.js
│   │   ├── trending/
│   │   └── cache/
│   ├── sockets/                # Socket.io handlers
│   ├── test/                   # Unit & integration tests
│   ├── utils/                  # Helper utilities
│   ├── validations/            # Joi schemas
│   │   ├── Joi/
│   │   └── service/
│   └── workers/                # Background workers
├── swagger/                    # API documentation
│   ├── swagger-generate.js
│   ├── swagger-output.json
│   ├── swagger-output.local.json
│   └── swagger-output-vercel.json
├── md-docs/                    # Additional documentation
│   ├── API_STRUCTURE.md
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── DOMAIN_LAYER_INDEX.md
│   ├── RAILWAY_SETUP.md
│   ├── VERCEL_DEPLOYMENT.md
│   └── trending/
├── docker-compose.yaml         # Docker orchestration
├── Dockerfile                  # Production container
├── Dockerfile.production       # Alternative build
├── vercel.json                 # Vercel config
├── railway.json                # Railway config
├── render.yaml                 # Render config
├── nixpacks.toml               # Nixpacks config
├── Procfile                    # Process file
├── server.js                   # Entry point
├── package.json                # Dependencies
├── .eslintrc.json              # ESLint config
├── .env.example                # Environment template
└── README.md
```

---

## 🔐 Environment Variables

### Required Variables

```bash
# Server
PORT=8888
NODE_ENV=production  # or developer

# MongoDB
URL_MONGODB=mongodb+srv://user:pass@cluster.mongodb.net/YayNot

# Redis
REDIS_URL=redis://user:pass@host:port
# OR individual configs:
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=yourpassword

# RabbitMQ
URL_RABBITMQ=amqps://user:pass@host/vhost

# JWT
TTL_ACCESS_TOKEN=1d
TTL_REFRESH_TOKEN=5 days
TTL_BLACKLIST=180

# Email (Nodemailer)
EMAIL_NODEMAILER=your-email@gmail.com
PASS_NODEMAILER=your-app-password
URL_MAIL_VERIFY=http://localhost:8888/v1/auth/verify

# Cloudinary
CLOUD_NAME=your-cloud-name
API_KEY=your-api-key
API_SECRET=your-api-secret

# Deployment Mode
IS_SERVERLESS=false  # true for Vercel, false for Railway/local
IS_PAAS=false        # true for PaaS platforms (Render/Railway), false for local/IaaS

# Rate Limiting
WINDOW_MS_AUTH=10
MAX_AUTH=10
MESSAGE_AUTH="Too many requests login, please try again later!"
WINDOW_MS_USER=10
MAX_USER=100
MESSAGE_USER="Too many requests, please try again later!"

# MongoDB Pool
POOL_SIZE_MONGODB_DEV=10
POOL_SIZE_MONGODB_PRODUCTION=100
```

### Vercel-specific

```bash
IS_SERVERLESS=true
VERCEL=1  # Auto-set by Vercel
```

### Railway-specific

```bash
IS_SERVERLESS=false
```

### Platform Performance Configuration

**`IS_PAAS`** - Optimizes retry logic and timeout settings based on platform infrastructure:

| Platform Type               | `IS_PAAS` | Redis Latency | Config Optimization                                             |
| --------------------------- | --------- | ------------- | --------------------------------------------------------------- |
| **Local Development**       | `false`   | ~1-5ms        | Fast polling (30-50ms intervals), 5 retries, ~300-450ms total   |
| **PaaS (Render/Railway)**   | `true`    | ~50-200ms     | Slower polling (60-90ms intervals), 6 retries, ~400-600ms total |
| **IaaS (AWS EC2/Azure VM)** | `false`   | ~5-50ms       | Use local config if Redis in same VPC/region                    |

**When to use `IS_PAAS=true`:**

- Deploying to **Render**, **Railway**, or similar PaaS platforms
- Using **managed Redis** services (Upstash, Redis Cloud, CloudAMQP)
- App and Redis are in **different networks/regions**

**When to use `IS_PAAS=false`:**

- **Local development** with Redis on same machine
- **IaaS deployments** (AWS EC2, Azure VM) with Redis in same VPC
- **Self-hosted** infrastructure with low-latency Redis connection

**Impact:**

- Email OTP verification response time
- Background job processing speed
- Cache polling intervals for async operations

**Example:**

```bash
# Render/Railway deployment
IS_PAAS=true
REDIS_URL=redis://upstash.redis.com:6379

# Local development
IS_PAAS=false
REDIS_HOST=localhost
REDIS_PORT=6379

# AWS EC2 with Redis in same VPC
IS_PAAS=false
REDIS_HOST=10.0.1.50  # Private IP in VPC
```

---

## 📜 Scripts

```bash
# Development
npm run dev          # Start with nodemon (auto-reload)
npm run socket       # Start socket server only

# Production
npm start            # Start server (node server.js)

# Database
npm run initdb       # Initialize database with seed data

# Testing
npm test             # Run Jest tests

# Linting
npm run lint         # Check code style
npm run lint:fix     # Auto-fix lint errors
npm run lint:errors  # Show only errors (ignore warnings)
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/test/auth.test.js

# Watch mode
npm test -- --watch
```

---

## 📖 Additional Documentation

See more docs in `md-docs/` folder:

- **API Structure:** `API_STRUCTURE.md`
- **Domain Layer:** `DOMAIN_LAYER_INDEX.md`
- **Routes Detail:** `ROUTES_DETAILED_FUNCTIONS.md`
- **Production Readiness:** `REPORT_PRODUCTION_READINESS.md`
- **Feature Guide:** `REPORT_FEATURE_GUIDE.md`

---

## 🤝 Contributing

1. Fork repo
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under a **Proprietary Software License Agreement** - see the [LICENSE](LICENSE) file for complete terms and conditions.

Copyright © 2025 Đinh Như Khải. All Rights Reserved.

**License Summary:** This software is freely available for educational and personal use. Commercial utilization requires prior written authorization from the copyright holder.

---

## 👥 Authors

- **Đinh Như Khải** - [@dinhkhaidev](https://github.com/dinhkhaidev)

---

## 🙏 Acknowledgments

- MongoDB Atlas
- Redis Cloud
- CloudAMQP
- Vercel
- Railway
- All open-source libraries used in this project

---

## 📞 Support

If you have any issues, please create an [Issue](https://github.com/khaicoderproject/yaynot-api/issues) or contact via email.

---

**Built with ❤️ using Node.js, Express, MongoDB, Redis & RabbitMQ**
