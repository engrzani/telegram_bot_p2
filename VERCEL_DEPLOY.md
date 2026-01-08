# Vercel Deployment Configuration

⚠️ **IMPORTANT: SQLite Limitations on Vercel**

Vercel is a serverless platform that doesn't support:
- Long-running processes
- File system persistence (SQLite databases will be reset)
- WebSocket connections for real-time updates

## Options for Database:

### Option 1: Use PostgreSQL (Recommended)
Use Vercel Postgres or external PostgreSQL service:
```bash
npm install pg
```

### Option 2: Use MongoDB Atlas
Free tier available:
```bash
npm install mongodb mongoose
```

### Option 3: Use Vercel KV (Redis-based)
```bash
npm install @vercel/kv
```

## Current Deployment (Will have issues with SQLite)

The current code uses SQLite which will reset on every deployment.

## Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Set environment variables in Vercel dashboard:
- SESSION_SECRET
- DATABASE_URL (if switching from SQLite)

## For Production

You MUST switch from SQLite to a hosted database service before deploying to Vercel.
