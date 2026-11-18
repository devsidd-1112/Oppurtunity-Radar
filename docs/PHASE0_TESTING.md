# Phase 0 Testing Guide

This document describes how to test the Phase 0 infrastructure.

## Local Testing

### 1. Backend Health Checks

Test basic health endpoint:

```bash
curl http://localhost:8787/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-18T10:00:00.000Z"
}
```

Test database health:

```bash
curl http://localhost:8787/health/db
```

Expected response (success):
```json
{
  "status": "ok",
  "message": "Database connection successful",
  "timestamp": "2024-11-18T10:00:00.000Z"
}
```

### 2. Queue Message Enqueuing

Test manual message enqueuing (requires SPIKE_TOKEN):

```bash
curl -X POST http://localhost:8787/internal/spike/enqueue \
  -H "Authorization: Bearer YOUR_SPIKE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"triggerSource": "manual"}'
```

Expected response:
```json
{
  "success": true,
  "eventId": "123e4567-e89b-12d3-a456-426614174000",
  "message": "Message enqueued successfully"
}
```

### 3. Queue Processing

In local development, queue messages are processed immediately. Watch the terminal output for:

```
Processing queue message: <message-id>
Gemini API request: <result>
Successfully processed event <event-id>
```

### 4. Database Verification

Connect to your Neon database and verify events are being recorded:

```sql
SELECT * FROM phase0_integration_events 
ORDER BY created_at DESC;
```

Verify the record contains:
- `id`: UUID matching the event ID
- `trigger_source`: "manual" or "cron"
- `gemini_model`: Your configured model
- `gemini_result`: JSON object with status and message
- `status`: "success" or "error"
- `created_at`: Timestamp

### 5. Frontend Testing

Open http://localhost:5173 in your browser.

**Test Backend Connectivity:**
1. Click "Check Backend Health"
2. Status should show "Connected"
3. Should display connection timestamp

**Test Database Connectivity:**
1. Click "Check Database Connection"
2. Status should show "Connected"
3. Should display "Database connection successful"

**Error Handling:**
1. Stop the backend: `Ctrl+C` in API terminal
2. Click "Check Backend Health"
3. Status should show "Error" or "Disconnected"

## Production Testing

### 1. Deploy and Verify

After deployment, test the production endpoints:

```bash
# Replace with your actual Worker URL
export API_URL="https://opportunity-radar-api.YOUR-SUBDOMAIN.workers.dev"

# Basic health
curl $API_URL/health

# Database health
curl $API_URL/health/db

# Manual enqueue
curl -X POST $API_URL/internal/spike/enqueue \
  -H "Authorization: Bearer YOUR_SPIKE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"triggerSource": "manual"}'
```

### 2. Monitor Queue Processing

View real-time logs:

```bash
cd apps/api
npx wrangler tail
```

Look for:
- "Processing queue message"
- "Successfully processed event"
- No errors or retries

### 3. Verify Cron Trigger

The cron runs every 6 hours by default. To test sooner:

**Option A: Trigger manually via Dashboard**
1. Go to Cloudflare Dashboard
2. Workers & Pages → Your Worker
3. Triggers → Cron Triggers
4. Click "Send test event"

**Option B: Temporary frequent cron**
Edit `wrangler.toml`:
```toml
[triggers]
crons = ["*/5 * * * *"]  # Every 5 minutes
```

Deploy:
```bash
npm run deploy
```

Wait 5 minutes and check logs:
```bash
npx wrangler tail
```

Look for: "Cron trigger fired at: ..."

**Remember to revert the cron schedule:**
```toml
[triggers]
crons = ["0 */6 * * *"]  # Back to every 6 hours
```

### 4. Test Error Handling

**Test invalid authentication:**
```bash
curl -X POST $API_URL/internal/spike/enqueue \
  -H "Authorization: Bearer wrong-token" \
  -H "Content-Type: application/json" \
  -d '{"triggerSource": "manual"}'
```

Expected: 401 Unauthorized

**Test invalid request body:**
```bash
curl -X POST $API_URL/internal/spike/enqueue \
  -H "Authorization: Bearer YOUR_SPIKE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"triggerSource": "invalid"}'
```

Expected: 400 Bad Request with validation errors

### 5. Test Retry Logic

To test retry logic, temporarily introduce an error:

1. Remove DATABASE_URL secret:
```bash
cd apps/api
npx wrangler secret delete DATABASE_URL
```

2. Enqueue a message:
```bash
curl -X POST $API_URL/internal/spike/enqueue \
  -H "Authorization: Bearer YOUR_SPIKE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"triggerSource": "manual"}'
```

3. Check logs - should see retry attempts:
```bash
npx wrangler tail
```

4. Check DLQ after max retries (3):
   - Go to Cloudflare Dashboard
   - Queues → opportunity-radar-dlq
   - Should see the failed message

5. Restore DATABASE_URL:
```bash
npx wrangler secret put DATABASE_URL
```

## Validation Checklist

Use this checklist to validate Phase 0 is working correctly:

### Backend
- [ ] GET /health returns 200 OK
- [ ] GET /health/db returns 200 OK with database connection
- [ ] POST /internal/spike/enqueue requires authentication
- [ ] POST /internal/spike/enqueue with valid token enqueues message
- [ ] Invalid requests return appropriate error codes
- [ ] CORS headers allow frontend requests

### Database
- [ ] Can connect to Neon PostgreSQL
- [ ] phase0_integration_events table exists
- [ ] Events are persisted after queue processing
- [ ] Duplicate event IDs are prevented (unique constraint)

### Queue Processing
- [ ] Messages are consumed from queue
- [ ] Invalid messages are acknowledged (not retried)
- [ ] Valid messages are processed
- [ ] Failed messages are retried (up to 3 times)
- [ ] Permanently failed messages move to DLQ

### Gemini Integration
- [ ] Gemini API is called successfully
- [ ] Response is validated with Zod
- [ ] Valid responses are persisted
- [ ] API errors trigger retries
- [ ] Configuration errors fail permanently

### Cron Trigger
- [ ] Cron trigger fires on schedule
- [ ] Scheduled handler enqueues test message
- [ ] Enqueued message is processed by queue consumer

### Frontend
- [ ] Loads at correct URL
- [ ] Backend health check works
- [ ] Database health check works
- [ ] UI shows connection status correctly
- [ ] Error states display properly
- [ ] Responsive on mobile devices

### Security
- [ ] No secrets in source code
- [ ] No secrets in API responses
- [ ] SPIKE_TOKEN authentication works
- [ ] Environment variables loaded correctly
- [ ] HTTPS enforced (production only)

## Performance Benchmarks

Expected performance for Phase 0:

| Metric | Target | Notes |
|--------|--------|-------|
| Health endpoint latency | < 100ms | Simple JSON response |
| DB health endpoint latency | < 300ms | Includes Neon roundtrip |
| Queue processing latency | < 5s | Includes Gemini API call |
| Frontend load time | < 2s | Static assets only |

## Troubleshooting

### Frontend can't connect to backend

**Symptoms:** "Network error" or "Disconnected"

**Solutions:**
1. Verify VITE_API_BASE_URL is set correctly
2. Check backend is running: `curl http://localhost:8787/health`
3. Check browser console for CORS errors
4. Verify no firewall blocking connections

### Queue messages not processing

**Symptoms:** No logs after enqueuing

**Solutions:**
1. Check Worker logs: `npx wrangler tail`
2. Verify queue binding in wrangler.toml
3. Check DLQ for failed messages
4. Verify DATABASE_URL and GEMINI_API_KEY are set

### Database connection fails

**Symptoms:** GET /health/db returns error

**Solutions:**
1. Verify DATABASE_URL is correct
2. Test connection string locally
3. Check Neon database is active (not paused)
4. Verify network connectivity

### Gemini API errors

**Symptoms:** Events in database with status="error"

**Solutions:**
1. Verify GEMINI_API_KEY is valid
2. Check GEMINI_MODEL is a valid model identifier
3. Review Gemini API quotas and limits
4. Check API request/response in logs

## Next Steps

After Phase 0 validation:

1. **Document any production-specific issues**
2. **Collect performance metrics**
3. **Review error logs**
4. **Gather team feedback**
5. **Prepare for Phase 1 approval**
6. **Archive Phase 0 artifacts**
