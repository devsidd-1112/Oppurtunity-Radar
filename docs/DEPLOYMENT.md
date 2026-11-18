# Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **Cloudflare Account** - Sign up at https://cloudflare.com
2. **Neon PostgreSQL Database** - Create at https://neon.tech
3. **Google Gemini API Key** - Get from https://aistudio.google.com/app/apikey
4. **Wrangler CLI** - Installed via `npm install` in the API workspace

## Backend Deployment to Cloudflare Workers

### Step 1: Configure Secrets

Navigate to the API directory:

```bash
cd apps/api
```

Set the required secrets using Wrangler:

```bash
npx wrangler secret put DATABASE_URL
# Paste your Neon connection string when prompted

npx wrangler secret put GEMINI_API_KEY
# Paste your Gemini API key when prompted

npx wrangler secret put GEMINI_MODEL
# Enter: gemini-3.5-flash-lite

npx wrangler secret put SPIKE_TOKEN
# Enter a secure random token (generate with: openssl rand -hex 32)
```

### Step 2: Apply Database Migrations

Before deploying, ensure your database schema is up to date:

```bash
npm run db:migrate
```

### Step 3: Deploy the Worker

```bash
npm run deploy
```

This will:
- Bundle your Worker code
- Create the Cloudflare Queue and Dead Letter Queue
- Set up the cron trigger
- Deploy to Cloudflare's global network

After deployment, you'll see your Worker URL (e.g., `https://opportunity-radar-api.YOUR-SUBDOMAIN.workers.dev`)

### Step 4: Verify Deployment

Test the health endpoints:

```bash
# Basic health check
curl https://opportunity-radar-api.YOUR-SUBDOMAIN.workers.dev/health

# Database health check
curl https://opportunity-radar-api.YOUR-SUBDOMAIN.workers.dev/health/db
```

### Step 5: Test Queue Processing

Manually enqueue a test message:

```bash
curl -X POST https://opportunity-radar-api.YOUR-SUBDOMAIN.workers.dev/internal/spike/enqueue \
  -H "Authorization: Bearer YOUR_SPIKE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"triggerSource": "manual"}'
```

### Step 6: Monitor Execution

View logs in real-time:

```bash
npx wrangler tail
```

Or check the Cloudflare Dashboard:
1. Go to Workers & Pages
2. Select your Worker
3. Click on "Logs" tab

## Frontend Deployment

### Option 1: Cloudflare Pages

1. Navigate to the web directory:
```bash
cd apps/web
```

2. Update `.env.production` with your Worker URL:
```bash
VITE_API_BASE_URL=https://opportunity-radar-api.YOUR-SUBDOMAIN.workers.dev
```

3. Build the frontend:
```bash
npm run build
```

4. Deploy to Cloudflare Pages:
```bash
npx wrangler pages deploy dist --project-name opportunity-radar-web
```

### Option 2: Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd apps/web
vercel
```

3. Set environment variable in Vercel dashboard:
   - `VITE_API_BASE_URL`: Your Worker URL

### Option 3: Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
cd apps/web
netlify deploy --prod
```

3. Set environment variable in Netlify dashboard:
   - `VITE_API_BASE_URL`: Your Worker URL

## Database Management

### Viewing Events

Connect to your Neon database and query the events table:

```sql
SELECT * FROM phase0_integration_events 
ORDER BY created_at DESC 
LIMIT 10;
```

### Resetting the Database (Development Only)

```sql
TRUNCATE TABLE phase0_integration_events;
```

## Queue Management

### View Queue Status

In Cloudflare Dashboard:
1. Go to Queues
2. Select `opportunity-radar-queue`
3. View message statistics and processing status

### Check Dead Letter Queue

If messages fail repeatedly, they'll move to the DLQ:

1. Go to Queues
2. Select `opportunity-radar-dlq`
3. Review failed messages for debugging

### Adjust Cron Schedule

Edit `apps/api/wrangler.toml`:

```toml
[triggers]
crons = ["0 */6 * * *"]  # Every 6 hours
# Change to your desired schedule
# Examples:
# "0 * * * *"    - Every hour
# "*/30 * * * *" - Every 30 minutes
# "0 0 * * *"    - Daily at midnight
```

Redeploy after changes:

```bash
npm run deploy
```

## Monitoring and Debugging

### View Worker Analytics

Cloudflare Dashboard → Workers & Pages → Your Worker → Analytics

Monitor:
- Request volume
- Success rate
- CPU time
- Errors

### Check Queue Metrics

Cloudflare Dashboard → Queues → Your Queue

Monitor:
- Messages queued
- Messages processed
- Messages in DLQ
- Processing latency

### Troubleshooting Common Issues

#### "DATABASE_URL not configured"

**Solution**: Set the secret again:
```bash
cd apps/api
npx wrangler secret put DATABASE_URL
```

#### "GEMINI_API_KEY not configured"

**Solution**: Verify the secret is set:
```bash
cd apps/api
npx wrangler secret put GEMINI_API_KEY
```

#### Database connection fails

**Solution**: 
1. Verify your Neon database is active
2. Check connection string format
3. Ensure IP restrictions allow Cloudflare Workers

#### Queue messages not processing

**Solution**:
1. Check Worker logs: `npx wrangler tail`
2. Verify queue binding in `wrangler.toml`
3. Check for messages in DLQ

#### Cron not triggering

**Solution**:
1. Verify `[triggers]` section in `wrangler.toml`
2. Check cron syntax is valid
3. Redeploy: `npm run deploy`
4. Check logs for scheduled events

## Security Considerations

### Never Expose Secrets

- ❌ Don't commit `.env` or `.dev.vars` files
- ❌ Don't log environment variables
- ❌ Don't expose secrets in API responses
- ✅ Use Wrangler secrets for all sensitive data
- ✅ Rotate SPIKE_TOKEN periodically
- ✅ Use HTTPS for all API communication

### Production Hardening

Before production use:

1. **Remove or protect spike endpoint**:
   - Change authentication to a production-ready method
   - Or remove the `/internal/spike/enqueue` endpoint entirely

2. **Restrict CORS**:
   - Update `src/index.ts` to only allow your frontend domain:
   ```typescript
   cors({
     origin: 'https://your-frontend-domain.com',
     credentials: true,
   })
   ```

3. **Add rate limiting**:
   - Implement rate limiting on endpoints
   - Use Cloudflare rate limiting rules

4. **Enable monitoring alerts**:
   - Set up alerts for error rates
   - Monitor queue DLQ for failures
   - Track API latency

## Rollback Procedure

If deployment fails:

```bash
cd apps/api

# List deployments
npx wrangler deployments list

# Rollback to previous version
npx wrangler rollback --message "Rolling back due to issue"
```

## Cost Optimization

Phase 0 is designed for Cloudflare Workers Free plan:

- **Workers**: 100,000 requests/day (free)
- **Queues**: 1,000,000 messages/month (free)
- **Cron Triggers**: Included in free tier

Monitor usage in Cloudflare Dashboard to stay within limits.

## Next Steps

After successful deployment:

1. Test all endpoints
2. Verify queue processing
3. Check database records
4. Monitor for 24-48 hours
5. Document any production-specific configuration
6. Prepare for Phase 1 implementation
