# Quick Start Guide

Get Opportunity Radar Phase 0 running in 5 minutes.

## 1. Install Node.js

If you don't have Node.js installed:

```bash
# macOS (using Homebrew)
brew install node

# Or download from https://nodejs.org/
```

Verify: `node --version` (should be v18+)

## 2. Install Dependencies

```bash
npm install
```

## 3. Set Up Environment

```bash
# Backend environment
cd apps/api
cp .dev.vars.example .dev.vars
# Edit .dev.vars and add your credentials

# Frontend environment
cd ../..
cp .env.example .env
# Default values work for local development
```

### Required Credentials

1. **Neon PostgreSQL**: Sign up at https://neon.tech and create a database
2. **Gemini API Key**: Get from https://aistudio.google.com/app/apikey
3. **Spike Token**: Generate with `openssl rand -hex 32`

Add these to `apps/api/.dev.vars`:
```
DATABASE_URL=postgresql://...
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-1.5-flash
SPIKE_TOKEN=...
```

## 4. Set Up Database

```bash
cd apps/api
npm run db:generate
npm run db:migrate
```

## 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd apps/api
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
npm run dev
```

## 6. Verify Setup

Open http://localhost:5173

1. Click "Check Backend Health" → Should show "Connected"
2. Click "Check Database Connection" → Should show "Connected"

## 7. Test Queue Processing

```bash
curl -X POST http://localhost:8787/internal/spike/enqueue \
  -H "Authorization: Bearer YOUR_SPIKE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"triggerSource": "manual"}'
```

Check backend terminal for "Successfully processed event ..."

## Next Steps

- Read `docs/SETUP.md` for detailed setup instructions
- Read `docs/PHASE0_TESTING.md` for testing procedures
- Read `docs/DEPLOYMENT.md` for deployment guide
- Read `docs/PHASE0_SUMMARY.md` for complete overview

## Troubleshooting

**Frontend shows disconnected?**
- Verify backend is running on port 8787
- Check VITE_API_BASE_URL in .env

**Database connection fails?**
- Verify DATABASE_URL in apps/api/.dev.vars
- Check your Neon database is active

**Queue not processing?**
- Check all environment variables are set
- Verify GEMINI_API_KEY is valid
- Check backend terminal for errors

For more help, see `docs/SETUP.md`
