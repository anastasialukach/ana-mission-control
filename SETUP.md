# Mission Control — Setup & Configuration

## 🚀 Deployment Info

### Cloudflare Pages (Production)
- **Site URL:** https://ana-mission-control.pages.dev
- **Latest Deployment:** https://c1a0a89c.ana-mission-control.pages.dev
- **Project Name:** `ana-mission-control`
- **Production Branch:** `main`

### Cloudflare D1 Database
- **Database Name:** `mission-control-db`
- **Database ID:** `0ad5c5b6-001b-40bf-81bb-64a954fbb86e`
- **Region:** APAC (Singapore)
- **Tables:** 
  - `calendar_user_data` — User edits, metrics, and post URLs
  - `job_statuses` — Job tracker statuses
  - `kanban_tasks` — Kanban board tasks
  - `user_notes` — General key-value notes

### Cloudflare Account
- **Account ID:** `b3138480be9fa3e3074343fbef9c340e`
- **Email:** anastasia.lukach@gmail.com
- **Auth:** Wrangler OAuth (already authenticated)

---

## 📂 Architecture

### Frontend
- **Location:** `/Users/anastasia/.openclaw/workspace/mission-control/`
- **Key Files:**
  - `index.html` — Main dashboard
  - `calendar.html` — Daily briefing calendar (now with cloud sync!)
  - `calendar-data.js` — Static daily briefing data (updated by Benji cron)
  - `functions/api/[[path]].js` — Cloudflare Pages Function (backend API)

### Backend API
- **Type:** Cloudflare Pages Functions
- **Base URL:** Same-origin `/api/*` (on Pages deployment)
- **Fallback:** localStorage (for offline use)

### API Endpoints
All routes are under `/api/`:

#### Calendar
- `GET /api/calendar/:date` — Get user data for a specific date
- `PUT /api/calendar/:date/:postIndex` — Save user edits & metrics
- `GET /api/calendar/all` — Get all user data (for analytics)

#### Jobs
- `GET /api/jobs` — Get all job statuses
- `PUT /api/jobs/:jobId` — Update job status

#### Kanban
- `GET /api/kanban` — Get all kanban tasks
- `PUT /api/kanban/:id` — Update task
- `DELETE /api/kanban/:id` — Delete task

#### Notes
- `GET /api/notes/:key` — Get a note by key
- `PUT /api/notes/:key` — Save a note

#### Health
- `GET /api/health` — API health check

---

## 🛠️ Development Workflow

### Deploy Frontend + API
```bash
cd /Users/anastasia/.openclaw/workspace/mission-control
wrangler pages deploy . --project-name=ana-mission-control
```

### Test Locally
```bash
cd /Users/anastasia/.openclaw/workspace/mission-control
wrangler pages dev . --d1 DB=0ad5c5b6-001b-40bf-81bb-64a954fbb86e
```

### Update Database Schema
```bash
wrangler d1 execute mission-control-db --remote --file=schema.sql
```

### Query Database Directly
```bash
wrangler d1 execute mission-control-db --remote --command="SELECT * FROM calendar_user_data LIMIT 10"
```

### Push to GitHub
```bash
cd /Users/anastasia/.openclaw/workspace/mission-control
git add -A
git commit -m "Your commit message"
git push origin main
```

---

## 🔄 How Data Flows

### Daily Briefing (Read-Only)
1. Benji runs cron at 9am Dubai
2. Generates news + posts → updates `calendar-data.js`
3. Pushes to GitHub → triggers GitHub Pages rebuild
4. Calendar loads static briefing data from `calendar-data.js`

### User Edits (Read-Write)
1. User opens calendar.html
2. Clicks a day → loads from D1 API (localStorage fallback)
3. User enters metrics/post text → auto-saves to:
   - **Cloud:** Cloudflare D1 via Pages Function API
   - **Local:** localStorage (backup/offline cache)
4. Shows sync indicator: "☁️ Synced" or "📱 Local only"

---

## 📊 Tested & Working

✅ D1 database created  
✅ API deployed as Pages Function  
✅ Frontend syncs to cloud  
✅ localStorage fallback works  
✅ Mobile Safari compatible  
✅ No build step required  
✅ GitHub auto-deploys to Pages  

### API Test Results
```bash
# Health check
curl https://c1a0a89c.ana-mission-control.pages.dev/api/health
# {"status":"ok","service":"mission-control-api","timestamp":"..."}

# Save data
curl -X PUT -H "Content-Type: application/json" \
  -d '{"final_text":"Test","views":100,"likes":10}' \
  https://c1a0a89c.ana-mission-control.pages.dev/api/calendar/2026-02-20/0
# {"success":true,"date":"2026-02-20","postIndex":0}

# Get data
curl https://c1a0a89c.ana-mission-control.pages.dev/api/calendar/2026-02-20
# [{"date":"2026-02-20","post_index":0,"final_text":"Test",...}]
```

---

## 🎯 Next Steps (Optional)

### Add Authentication
If you want to make this more secure:
1. Add Cloudflare Access in front of the Pages deployment
2. Or add a simple token check in the Pages Function

### Add Analytics
- Hook up Cloudflare Web Analytics
- Add custom events for "post copied", "metrics saved", etc.

### Automate Deployments
- GitHub Actions to deploy on push to `main`
- Or use Cloudflare Pages GitHub integration (auto-deploy on push)

### Migrate Existing localStorage Data
Run this in browser console on the old GitHub Pages site:
```javascript
// Export all metrics
const data = {};
for (const [key, val] of Object.entries(localStorage)) {
  if (key.startsWith('metrics_')) data[key] = JSON.parse(val);
}
console.log(JSON.stringify(data));
// Copy the output, then import on the new site
```

---

## 📝 Notes

- **GitHub Pages still works** as a fallback (no API, localStorage only)
- **Cloudflare Pages is now primary** (has cloud sync via D1)
- **No breaking changes** — existing UI/UX exactly the same
- **calendar-data.js still works** the same way (Benji pushes daily briefings)
- **User data now syncs** across devices via D1

---

## 🐛 Troubleshooting

### API returns 500
Check D1 binding in Cloudflare dashboard:
```bash
wrangler pages project list
wrangler d1 list
```

### Data not syncing
1. Check browser console for errors
2. Verify API_BASE in calendar.html points to correct URL
3. Test API health endpoint: `/api/health`

### Local dev not working
Make sure D1 binding is correct:
```bash
wrangler pages dev . --d1 DB=0ad5c5b6-001b-40bf-81bb-64a954fbb86e
```

---

**Built:** Feb 20, 2026  
**Last Updated:** Feb 20, 2026  
**Deployed by:** Benji (OpenClaw subagent) 🐾
