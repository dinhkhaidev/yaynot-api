# YayNot API

> [English](README.md) | **Tiếng Việt**

**YayNot** là nền tảng mạng xã hội Q&A (Hỏi đáp) với tính năng real-time chat, notification, voting và content moderation.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/atlas)
[![Redis](https://img.shields.io/badge/Redis-Cloud-red)](https://redis.io/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-CloudAMQP-orange)](https://www.cloudamqp.com/)

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Kiến trúc](#-kiến-trúc)
- [Tech Stack](#-tech-stack)
- [Cài đặt](#-cài-đặt)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)

---

## ✨ Tính năng

### Core Features

- **Authentication & Authorization**

  - JWT-based authentication (Access Token + Refresh Token)
  - Email verification với OTP
  - Role-based access control (RBAC)
  - Rate limiting cho security

- **Question Management**

  - Tạo, sửa, xóa câu hỏi
  - Draft mode và publish workflow
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

  - Upvote/Downvote cho questions
  - Vote analytics

- **Social Features**

  - Follow/Unfollow users
  - User profiles với avatar, bio, links
  - Activity feed

- **Real-time Features**

  - Socket.io cho chat real-time
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
  - Periodic data sync từ Redis → MongoDB
  - Scheduled cleanup tasks

- **Caching (Redis)**
  - Query result caching
  - Session storage
  - Rate limiting counters
  - Distributed locks

---

## 🏗️ Kiến trúc

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
- ❌ KHÔNG có cron jobs
- ❌ KHÔNG có message consumers

**Railway (Worker - IS_SERVERLESS=false):**

- ✅ RabbitMQ consumers
- ✅ Cron jobs (view sync, data flush)
- ✅ Background tasks
- ❌ KHÔNG có HTTP endpoints (optional)

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

## 🚀 Cài đặt

### Prerequisites

```bash
node >= 20.x
npm >= 10.x
docker & docker-compose (tùy chọn - cho local dev)
```

### 1. Clone Repository

```bash
git clone https://github.com/khaicoderproject/yaynot-api.git
cd yaynot-api
```

### 2. Cài Dependencies

```bash
npm install
```

### 3. Thiết lập Environment

Tạo file `.env` từ template:

```bash
# Copy và chỉnh sửa
cp .env.example .env
```

Xem [Environment Variables](#-environment-variables) để biết chi tiết.

### 4. Chạy Local Development

**Option A: Docker Compose (Khuyến nghị)**

```bash
# Khởi động tất cả services (MongoDB, Redis, RabbitMQ, Backend)
docker-compose up -d

# Xem logs
docker-compose logs -f backend

# Tắt services
docker-compose down
```

**Option B: Local Node.js**

```bash
# Cần MongoDB, Redis, RabbitMQ chạy riêng
npm run dev

# Hoặc chạy socket server riêng
npm run socket
```

### 5. Khởi tạo Database (Tùy chọn)

```bash
npm run initdb
```

### 6. Truy cập Application

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

**3. Thêm Environment Variables trên Vercel Dashboard:**

- Vào **Settings → Environment Variables**
- Add tất cả variables từ `.env.production`
- **Quan trọng:** Set `IS_SERVERLESS=true`

**4. Deploy:**

```bash
vercel --prod
```

**Hoặc tự động qua GitHub Actions:**

- Push code lên `main` branch
- Workflow `.github/workflows/deploy-vercel.yml` tự động chạy

### Railway (Workers)

**1. Tạo Railway Project:**

- Vào [railway.app](https://railway.app)
- Tạo project mới
- Connect GitHub repo

**2. Thêm Environment Variables:**

- Set `IS_SERVERLESS=false`
- Add MongoDB, Redis, RabbitMQ URLs

**3. Deploy:**

- Railway tự động build từ `Dockerfile`
- Hoặc trigger qua workflow: `.github/workflows/deploy-railway.yml`

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

Truy cập **Swagger docs** tại:

- **Local:** http://localhost:8888/api-docs
- **Production:** https://yaynot-api.vercel.app/api-docs

### Tổng quan API Endpoints

| Module            | Endpoint                  | Methods                                  |
| ----------------- | ------------------------- | ---------------------------------------- |
| **Auth**          | `/api/v1/auth/*`          | Register, Login, Logout, Refresh, Verify |
| **Questions**     | `/api/v1/questions/*`     | CRUD, Publish, Bookmark, View, Share     |
| **Comments**      | `/api/v1/comments/*`      | CRUD, Like, Pin                          |
| **Votes**         | `/api/v1/votes/*`         | Upvote, Downvote                         |
| **Users**         | `/api/v1/profiles/*`      | Cập nhật profile, Avatar                 |
| **Follow**        | `/api/v1/follows/*`       | Follow, Unfollow, Followers, Followings  |
| **Upload**        | `/api/v1/uploads/:type`   | Upload ảnh (avatar, post, thumb)         |
| **Chat**          | `/api/v1/chats/*`         | Conversations, Messages                  |
| **Notifications** | `/api/v1/notifications/*` | Danh sách, Đánh dấu đã đọc, Xóa          |
| **Reports**       | `/api/v1/reports/*`       | Gửi báo cáo, Xem báo cáo                 |
| **Admin**         | `/api/admin/v1/*`         | Kiểm duyệt, Thống kê                     |

### Authentication

Hầu hết endpoints yêu cầu **JWT token** trong header:

```http
Authorization: Bearer <your_access_token>
```

---

## 📁 Cấu trúc thư mục

```
yaynot-api/
├── .github/
│   └── workflows/          # CI/CD workflows
│       ├── deploy-vercel.yml
│       └── deploy-railway.yml
├── src/
│   ├── app.js             # Express app setup
│   ├── auth/              # JWT utilities
│   ├── configs/           # Config files (DB, Redis, RabbitMQ, Multer, etc.)
│   ├── constants/         # Enums & constants
│   ├── controllers/       # Request handlers
│   │   ├── access/        # Auth controllers
│   │   ├── question/
│   │   ├── comment/
│   │   ├── vote/
│   │   ├── notification/
│   │   └── report/
│   ├── core/              # Response wrappers (success/error)
│   ├── cronjob/           # Scheduled tasks
│   │   └── question/
│   ├── databases/         # DB connection (MongoDB, Redis)
│   ├── domain/            # Business logic layer
│   │   ├── question/
│   │   └── report/
│   ├── helpers/           # Utility functions
│   ├── interface/         # Contracts/interfaces
│   ├── logger/            # Winston logger
│   ├── logs/              # Log files
│   ├── message-queue/     # RabbitMQ setup
│   │   └── rabbitmq/
│   │       ├── setupRabbitmq.js
│   │       ├── consumers/
│   │       └── producers/
│   ├── middlewares/       # Express middlewares
│   │   ├── auth/
│   │   ├── rbac/
│   │   └── validate.js
│   ├── models/            # Mongoose models
│   │   └── repositories/  # Repository pattern
│   ├── routes/            # API routes
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── auth/
│   │   │   │   └── user/
│   │   │   └── admin/
│   │   └── index.js
│   ├── services/          # Business logic services
│   ├── sockets/           # Socket.io handlers
│   ├── test/              # Unit & integration tests
│   ├── utils/             # Helper utilities
│   ├── validations/       # Joi schemas
│   └── workers/           # Background worker entry
├── swagger/
│   ├── swagger-generate.js
│   └── swagger-output.json
├── md-docs/               # Additional documentation
├── docker-compose.yaml    # Docker orchestration
├── Dockerfile             # Container build
├── vercel.json            # Vercel config
├── railway.json           # Railway config
├── server.js              # Entry point
├── package.json
├── README.md              # English docs
└── README.vi.md           # Vietnamese docs
```

---

## 🔐 Environment Variables

### Required Variables

```bash
# Server
PORT=8888
NODE_ENV=production  # hoặc developer

# MongoDB
URL_MONGODB=mongodb+srv://user:pass@cluster.mongodb.net/YayNot

# Redis
REDIS_URL=redis://user:pass@host:port
# HOẶC cấu hình riêng lẻ:
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
IS_SERVERLESS=false  # true cho Vercel, false cho Railway/local

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
VERCEL=1  # Tự động set bởi Vercel
```

### Railway-specific

```bash
IS_SERVERLESS=false
```

---

## 📜 Scripts

```bash
# Development
npm run dev          # Khởi động với nodemon (auto-reload)
npm run socket       # Chỉ chạy socket server

# Production
npm start            # Khởi động server (node server.js)

# Database
npm run initdb       # Khởi tạo database với seed data

# Testing
npm test             # Chạy Jest tests

# Linting
npm run lint         # Kiểm tra code style
npm run lint:fix     # Tự động sửa lỗi lint
npm run lint:errors  # Chỉ hiện errors (bỏ qua warnings)
```

---

## 🧪 Testing

```bash
# Chạy tất cả tests
npm test

# Chạy test file cụ thể
npm test -- src/test/auth.test.js

# Watch mode
npm test -- --watch
```

---

## 📖 Tài liệu bổ sung

Xem thêm docs trong thư mục `md-docs/`:

- **API Structure:** `API_STRUCTURE.md`
- **Domain Layer:** `DOMAIN_LAYER_INDEX.md`
- **Routes Detail:** `ROUTES_DETAILED_FUNCTIONS.md`
- **Production Readiness:** `REPORT_PRODUCTION_READINESS.md`
- **Feature Guide:** `REPORT_FEATURE_GUIDE.md`

---

## 🤝 Đóng góp

1. Fork repo
2. Tạo feature branch (`git checkout -b feature/TinhNangTuyetVoi`)
3. Commit changes (`git commit -m 'Thêm tính năng tuyệt vời'`)
4. Push to branch (`git push origin feature/TinhNangTuyetVoi`)
5. Mở Pull Request

---

## 📝 Giấy phép

Dự án này được cấp phép theo **Thỏa thuận Giấy phép Phần mềm Độc quyền** - vui lòng xem file [LICENSE](LICENSE) để biết đầy đủ các điều khoản và điều kiện.

Bản quyền © 2025 Đinh Như Khải. Bảo lưu toàn bộ quyền.

**Tóm tắt Giấy phép:** Phần mềm này miễn phí cho mục đích giáo dục và sử dụng cá nhân. Việc sờ dụng thương mại yêu cầu sự cho phép bằng văn bản từ chủ sở hữu bản quyền.

---

## 👥 Tác giả

- **Đinh Như Khải** - [@dinhkhaidev](https://github.com/dinhkhaidev)

---

## 🙏 Cảm ơn

- MongoDB Atlas
- Redis Cloud
- CloudAMQP
- Vercel
- Railway
- Tất cả các thư viện open-source được sử dụng trong project

---

## 📞 Hỗ trợ

Nếu có vấn đề, hãy tạo [Issue](https://github.com/khaicoderproject/yaynot-api/issues) hoặc liên hệ qua email.

---

**Được xây dựng với ❤️ sử dụng Node.js, Express, MongoDB, Redis & RabbitMQ**
