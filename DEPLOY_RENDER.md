# Deploy Qikobot WhatsApp on Render

## 1. GitHub repo

Push `whatsapp-app` to its own repo (recommended) or a monorepo subfolder with **Root Directory** = `whatsapp-app`.

```bash
cd whatsapp-app
git init
git remote add origin https://github.com/YOUR_ORG/qiko-whatsapp-app.git
git add .
git commit -m "Initial Qiko WhatsApp app"
git push -u origin main
```

## 2. Render web service

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint** (or Web Service).
2. Connect repo; if monorepo, set **Root Directory** to `whatsapp-app`.
3. Or paste `render.yaml` from this folder.

| Setting | Value |
|---------|--------|
| Build | `corepack enable && pnpm install --frozen-lockfile && pnpm run build` |
| Start | `node dist/index.js` |
| Health | `/health` |

## 3. Environment variables

| Key | Required | Notes |
|-----|----------|--------|
| `META_ACCESS_TOKEN` | Yes | System user or permanent token |
| `META_APP_SECRET` | Yes | App Dashboard → App settings → Basic |
| `META_VERIFY_TOKEN` | Yes | Any random string; same in Meta webhook form |
| `META_PHONE_NUMBER_ID` | Yes | WhatsApp → API Setup |
| `META_GRAPH_API_VERSION` | No | Default `v21.0` |
| `QIKO_API_BASE_URL` | Yes | e.g. `https://stage-backend.qiko.ai/api/avatar` |
| `QIKO_WEB_ORIGIN` | Yes | e.g. `https://stage-app.qiko.ai` |
| `QIKO_WEB_APP_URL` | No | Link in help message |

`RENDER_EXTERNAL_URL` is set automatically → used as webhook base URL.

## 4. Meta webhook (after deploy)

1. Copy public URL: `https://YOUR-SERVICE.onrender.com/webhook`
2. Meta Developer → your app → **WhatsApp** → **Configuration** → **Webhook**
3. **Callback URL:** paste above  
4. **Verify token:** same as `META_VERIFY_TOKEN`  
5. Subscribe to **messages** field  
6. Click **Verify and save**

## 5. Smoke test

1. Add your phone as a **test recipient** in Meta (API Setup) if using test number.
2. Send `help` to the business number on WhatsApp.
3. `login` → email → password → `workers` → `worker <name>` → ask a question.

## 6. Sessions on free tier

Sessions are stored in `data/whatsapp-sessions.json` on disk. Render free disk is **ephemeral** — users may need to `login` again after redeploy. For production, move sessions to Postgres (same pattern as Slack app).
