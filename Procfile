# Railway Procfile - Multiple deployment modes
# Uncomment the mode you want to use (only ONE at a time)

# ============================================
# MODE 1: Worker Only (Hybrid with Vercel)
# ============================================
# Use this when: Vercel handles API, Railway runs background jobs only
# Features: RabbitMQ consumers, Cron jobs
# Uncomment below:

worker: node src/workers/index.js
# ============================================
# MODE 2: Full Stack (Standalone)
# ============================================
# Use this when: Railway runs everything (no Vercel)
# Features: API + RabbitMQ + Cron jobs + WebSocket
# Uncomment below:

# web: node server.js

# ============================================
# How to switch modes:
# 1. Comment out current mode (add # at start)
# 2. Uncomment desired mode (remove # at start)
# 3. Git commit & push
# ============================================
