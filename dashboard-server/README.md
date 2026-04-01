# Claude Token Dashboard - Backend Server

Node.js/Express API server that tracks Claude token usage and provides real-time data to the frontend dashboard.

## Features

- **SQLite Database** - Stores daily token usage records
- **ccusage Integration** - Automatically syncs with Anthropic's official token usage API
- **RESTful API** - Provides endpoints for token stats, limits, and manual sync
- **Automatic Sync** - Runs every 5 minutes to fetch latest token counts
- **CORS Enabled** - Frontend can safely communicate with this API

## Quick Start

### Install Dependencies

```bash
cd dashboard-server
npm install
```

### Development

```bash
npm run dev
```

Starts with `ts-node` for live reloading.

### Production

```bash
npm run build
npm start
```

## API Endpoints

### GET `/api/usage`

Get current daily, weekly, and monthly token usage statistics.

**Response:**
```json
{
  "daily": {
    "used": 45000,
    "limit": 100000,
    "remaining": 55000,
    "percentage": 45,
    "color": "green",
    "formatted": {
      "used": "45K",
      "remaining": "55K"
    }
  },
  "weekly": {
    "used": 280000,
    "limit": 600000,
    "remaining": 320000,
    "percentage": 46,
    "color": "green",
    "formatted": {
      "used": "280K",
      "remaining": "320K"
    }
  },
  "monthly": {
    "used": 1200000,
    "limit": 3000000,
    "remaining": 1800000,
    "percentage": 40,
    "color": "green",
    "formatted": {
      "used": "1.2M",
      "remaining": "1.8M"
    }
  },
  "lastUpdated": "2026-04-01T14:30:00.000Z"
}
```

### POST `/api/sync`

Manually trigger a sync with ccusage to fetch latest token counts.

**Response:**
```json
{
  "success": true,
  "tokensUsed": 45000,
  "message": "Updated tokens: 45000"
}
```

### GET `/api/limits`

Get current limit settings for each period.

**Response:**
```json
{
  "daily": 100000,
  "weekly": 600000,
  "monthly": 3000000
}
```

### PUT `/api/limits/:period`

Update limit for a specific period.

**Request:**
```json
{
  "limit": 120000
}
```

**Response:**
```json
{
  "success": true,
  "period": "daily",
  "limit": 120000,
  "message": "Updated daily limit to 120000"
}
```

### GET `/api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-01T14:30:00.000Z"
}
```

## How It Works

### Data Flow

```
ccusage CLI (every 5 min)
    ↓
    ├→ Parses token count
    ├→ Updates SQLite database
    └→ Available via /api/usage

Frontend
    ├→ Polls /api/usage every 10 seconds
    ├→ Renders steam gauges
    └→ Displays real-time updates
```

### Database Schema

**tokens_log table:**
```sql
- id: INTEGER PRIMARY KEY
- date: TEXT (YYYY-MM-DD)
- tokens_used: INTEGER (cumulative tokens for day)
- commands_run: INTEGER (count of commands)
- created_at: DATETIME
```

**limits table:**
```sql
- period: TEXT (daily/weekly/monthly)
- limit_tokens: INTEGER (max tokens allowed)
- reset_date: TEXT (when the limit resets)
```

## Configuration

Set environment variables:

```bash
# Port to run server on (default: 5000)
PORT=5000

# Database path (default: ./tokens.db)
DB_PATH=./tokens.db
```

## Requirements

- Node.js 16+
- npm or yarn
- `ccusage` CLI tool (for automatic token sync)
  - Install: `npm install -g ccusage@latest`

## Troubleshooting

### ccusage not available
If you see "⚠️ ccusage not available", install it globally:
```bash
npm install -g ccusage@latest
```

### Database locked
If you get "database is locked" error, ensure only one instance is running.

### Port already in use
Change the port:
```bash
PORT=5001 npm run dev
```

## Notes

- Default limits are Claude Pro plan:
  - Daily: 100,000 tokens
  - Weekly: ~600,000 tokens (600K/7 days)
  - Monthly: ~3,000,000 tokens (3M/30 days)

- Token counts are updated automatically every 5 minutes
- The database persists locally in `tokens.db`
- All endpoints are CORS-enabled for the frontend

---

Made with ❤️ for the Claude community.
