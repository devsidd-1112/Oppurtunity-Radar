# Phase 0 Setup Guide

This guide will walk you through setting up the Opportunity Radar Phase 0 environment from scratch.

## Prerequisites Installation

### 1. Install Node.js

Download and install Node.js 18 or higher from:
- Official website: https://nodejs.org/
- Or using Homebrew (macOS): `brew install node`

Verify installation:
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v9.0.0 or higher
```

### 2. Install Dependencies

From the project root:

```bash
npm install
```

This will install dependencies for all workspaces:
- `packages/shared` - Shared validation schemas
- `apps/api` - Backend Worker
- `apps/web` - Frontend React app

## Environment Configuration

### 1. Backend Configuration

Create your local development variables file:

```bash
cd apps/api
cp .dev.vars.example .dev.vars
```

Edit `apps/api/.dev.vars` and fill in:

```bash
# Get from https://neon.tech
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Get from https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key

# Model to use (gemini-1.5-flash, gemini-1.5-pro, etc.)
GEMINI_MODEL=gemini-1.5-flash

# Generate a secure token: openssl rand -hex 32
SPIKE_TOKEN=your-secure-random-token
```

### 2. Frontend Configuration

Create your local environment file:

```bash
cd ../web
cp ../../.env.example ../../.env
```

Edit `.env` in the project root:

```bash
# For local development
VITE_API_BASE_URL=http://localhost:8787
```

## Database Setup

### 1. Create Neon Database

1. Sign up at https://neon.tech (free tier available)
2. Create a new project
3. Copy the connection string
4. Paste it into `apps/api/.dev.vars` as `DATABASE_URL`

### 2. Generate Migration

```bash
cd apps/api
npm run db:generate
```

This creates a SQL migration file in `apps/api/drizzle/`

### 3. Apply Migration

```bash
npm run db:migrate
```

This runs the migration against your Neon database, creating the `phase0_integration_events` table.

## Google Gemini API Setup

### 1. Get API Key

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key
5. Paste it into `apps/api/.dev.vars` as `GEMINI_API_KEY`

### 2. Choose Model

Common models:
- `gemini-1.5-flash` - Faster, cheaper (recommended for development)
- `gemini-1.5-pro` - More capable, slower
- `gemini-1.0-pro` - Earlier version

Set your choice in `apps/api/.dev.vars` as `GEMINI_MODEL`

## Local Development

### Start Backend (Terminal 1)

```bash
cd apps/api
npm run dev
```

The API will be available at http://localhost:8787

Expected output:
```
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

### Start Frontend (Terminal 2)

```bash
cd apps/web
npm run dev
```

The frontend will be available at http://localhost:5173

Expected output:
```
  VITE v6.0.1  ready in 500 ms

  ➜  Local:   http://localhost:5173/
```

### Verify Setup

Open http://localhost:5173 in your browser.

1. Click "Check Backend Health" - Should show "Connected"
2. Click "Check Database Connection" - Should show "Connected"

## Testing Queue Processing

### Manual Test

In a third terminal:

```bash
curl -X POST http://localhost:8787/internal/spike/enqueue \
  -H "Authorization: Bearer YOUR_SPIKE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"triggerSource": "manual"}'
```

Replace `YOUR_SPIKE_TOKEN` with the value from your `.dev.vars` file.

Expected response:
```json
{
  "success": true,
  "eventId": "123e4567-e89b-12d3-a456-426614174000",
  "message": "Message enqueued successfully"
}
```

Watch the backend terminal for processing logs:
```
Processing queue message: ...
Gemini API request successful
Successfully processed event ...
```

### Verify in Database

Connect to your Neon database and check:

```sql
SELECT * FROM phase0_integration_events 
ORDER BY created_at DESC 
LIMIT 1;
```

You should see the event with:
- `trigger_source`: "manual"
- `status`: "success"
- `gemini_result`: JSON with status "ok"

## Running Tests

### Backend Tests

```bash
cd apps/api
npm run test
```

Expected: All validation tests pass.

### Type Checking

```bash
# Check all workspaces
npm run typecheck

# Or check individually
cd apps/api
npm run typecheck

cd ../web
npm run typecheck
```

### Linting

```bash
# Check all workspaces
npm run lint

# Or check individually
cd apps/api
npm run lint

cd ../web
npm run lint
```

## Troubleshooting

### "Cannot find module '@opportunity-radar/shared'"

**Solution**: Install dependencies from the root:
```bash
cd /Users/siddarthp/Projects/Oppurtunity\ Radar
npm install
```

### "DATABASE_URL not configured"

**Solution**: 
1. Verify `apps/api/.dev.vars` exists
2. Verify `DATABASE_URL` is set
3. Restart the backend dev server

### "Gemini API error"

**Solution**:
1. Verify `GEMINI_API_KEY` is valid
2. Check you have API quota remaining
3. Verify `GEMINI_MODEL` is a valid model name
4. Test the API key at https://aistudio.google.com

### Frontend shows "Disconnected"

**Solution**:
1. Verify backend is running on port 8787
2. Check `VITE_API_BASE_URL` in `.env`
3. Restart the frontend dev server
4. Check browser console for errors

### Queue messages not processing

**Solution**:
1. Check backend terminal for errors
2. Verify all environment variables are set
3. Check database connection
4. Verify Gemini API credentials

### Migration fails

**Solution**:
1. Verify DATABASE_URL is correct
2. Check Neon database is active
3. Verify you have permissions to create tables
4. Try connecting to the database directly to test connectivity

## Next Steps

Once your local environment is working:

1. ✅ Verify all health checks pass
2. ✅ Successfully process a queue message
3. ✅ See event in database
4. ✅ Run all tests
5. ✅ Pass type checking
6. ✅ Pass linting

Then proceed to:
- Review `docs/PHASE0_TESTING.md` for comprehensive testing
- Review `docs/DEPLOYMENT.md` for deployment instructions
- Test scheduled cron functionality
- Test error handling and retries
- Prepare for Phase 0B deployment

## Common Commands Reference

```bash
# Development
npm run dev:api          # Start backend
npm run dev:web          # Start frontend

# Build
npm run build            # Build all workspaces

# Quality checks
npm run typecheck        # Type check all workspaces
npm run lint             # Lint all workspaces
npm run test             # Run all tests

# Database
cd apps/api
npm run db:generate      # Generate migration
npm run db:migrate       # Apply migration

# Deployment
cd apps/api
npm run deploy           # Deploy to Cloudflare
```

## Getting Help

If you encounter issues:

1. Check this setup guide
2. Review `docs/PHASE0_TESTING.md` for testing procedures
3. Check Cloudflare Workers documentation: https://developers.cloudflare.com/workers/
4. Check Neon documentation: https://neon.tech/docs
5. Check Gemini API documentation: https://ai.google.dev/docs

## Project Structure

```
opportunity-radar/
├── apps/
│   ├── api/                    # Cloudflare Worker backend
│   │   ├── src/
│   │   │   ├── db/            # Database schema and client
│   │   │   ├── handlers/      # Queue and scheduled handlers
│   │   │   ├── routes/        # HTTP routes
│   │   │   ├── services/      # Gemini integration
│   │   │   └── types/         # TypeScript types
│   │   ├── .dev.vars.example  # Environment template
│   │   └── wrangler.toml      # Worker configuration
│   └── web/                    # React frontend
│       ├── src/
│       │   ├── App.tsx        # Main component
│       │   └── App.css        # Styles
│       └── vite.config.ts     # Vite configuration
├── packages/
│   └── shared/                 # Shared types and validation
│       └── src/
│           └── validation.ts   # Zod schemas
├── docs/                       # Documentation
│   ├── SETUP.md               # This file
│   ├── PHASE0_TESTING.md      # Testing guide
│   └── DEPLOYMENT.md          # Deployment guide
├── .env.example               # Environment template
└── package.json               # Root workspace config
```
