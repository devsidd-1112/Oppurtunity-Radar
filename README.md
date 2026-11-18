# Opportunity Radar

A multi-user opportunity intelligence platform that discovers opportunities, extracts requirements, evaluates eligibility, and delivers notifications.

## Phase 0: Foundation and Technical Feasibility

This phase validates the core infrastructure stack:
- Frontend: React + Vite + TypeScript
- Backend: Cloudflare Workers + Hono
- Database: Neon PostgreSQL + Drizzle ORM
- AI: Google Gemini API
- Background: Cloudflare Queues + Cron Triggers

## Repository Structure

```
opportunity-radar/
  apps/
    web/          # React frontend
    api/          # Cloudflare Worker backend
  packages/
    shared/       # Shared types and validation
  docs/           # Documentation
```

## Development Setup

### Prerequisites

- Node.js 18+
- npm
- Neon PostgreSQL database
- Cloudflare account (for deployment)
- Google Gemini API key

### Installation

```bash
npm install
```

### Configuration

1. Copy environment templates:
```bash
cp .env.example .env
cp apps/api/.dev.vars.example apps/api/.dev.vars
```

2. Fill in your credentials in `apps/api/.dev.vars`:
   - `DATABASE_URL`: Neon PostgreSQL connection string
   - `GEMINI_API_KEY`: Google Gemini API key
   - `GEMINI_MODEL`: Gemini model identifier (e.g., gemini-1.5-flash)
   - `SPIKE_TOKEN`: Random secure token for internal endpoints

3. Configure frontend API URL in `.env`:
   - `VITE_API_BASE_URL`: Backend URL (http://localhost:8787 for local)

### Database Setup

```bash
# Generate migration
cd apps/api
npm run db:generate

# Apply migration to Neon
npm run db:migrate
```

### Local Development

```bash
# Terminal 1: Start backend
npm run dev:api

# Terminal 2: Start frontend
npm run dev:web
```

The frontend will be available at http://localhost:5173
The backend will be available at http://localhost:8787

### Testing

```bash
# Run all checks
npm run typecheck
npm run lint
npm run test
```

## API Endpoints

### Health Checks

- `GET /health` - Basic health check
- `GET /health/db` - Database connectivity check

### Internal Endpoints

- `POST /internal/spike/enqueue` - Enqueue test message (requires SPIKE_TOKEN)

## Background Processing

### Scheduled Job

The worker includes a cron trigger that runs periodically to enqueue test messages.

### Queue Consumer

Processes messages by:
1. Validating message structure
2. Connecting to database
3. Making Gemini API request
4. Persisting results
5. Handling retries and failures

## Deployment

### Deploy to Cloudflare

```bash
cd apps/api

# Set secrets
npx wrangler secret put DATABASE_URL
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put GEMINI_MODEL
npx wrangler secret put SPIKE_TOKEN

# Deploy
npm run deploy
```

### Deploy Frontend

Follow your preferred static hosting provider's instructions (Cloudflare Pages, Vercel, Netlify, etc.)

## Phase 0 Limitations

This phase implements only technical feasibility validation:

- ❌ No authentication or user management
- ❌ No user onboarding
- ❌ No real job discovery
- ❌ No academic taxonomy
- ❌ No production eligibility engine
- ❌ No matching or scoring
- ❌ No notifications
- ✅ Infrastructure validation
- ✅ Database connectivity
- ✅ Queue processing
- ✅ Gemini integration
- ✅ Frontend-backend communication

## Next Steps

Phase 1 and beyond will implement the full product features after Phase 0 validation is approved.
