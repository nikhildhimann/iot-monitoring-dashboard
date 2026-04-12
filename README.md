# Amrik

Amrik has two apps:

- `frontend/`: Next.js dashboard
- `backend/`: Express + MongoDB API and Socket.IO server

## Quick start

1. Copy env files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

2. Install dependencies:

```bash
npm run install:all
```

3. Start both apps in separate terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

Frontend runs on `http://localhost:3000` and backend runs on `http://localhost:5000`.

## Environment variables

### Backend

Use [`backend/.env.example`](backend/.env.example) as the template.

- `PORT`: backend port
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: optional token expiry, defaults to `7d`
- `CLIENT_URLS`: comma-separated allowed frontend origins for CORS and Socket.IO
- `NODE_ENV`: `development` or `production`
- `WEIGHT_MIN_THRESHOLD`, `WEIGHT_MAX_THRESHOLD`, `WIFI_SIGNAL_WEAK_THRESHOLD`, `DEVICE_OFFLINE_AFTER_MS`, `DEVICE_OFFLINE_CHECK_INTERVAL_MS`: optional monitoring thresholds

### Frontend

Use [`frontend/.env.example`](frontend/.env.example) as the template.

- `NEXT_PUBLIC_API_URL`: full backend API URL, for example `http://localhost:5000/api`
- `NEXT_PUBLIC_SOCKET_URL`: full backend Socket.IO base URL, for example `http://localhost:5000`

## Production deployment

Recommended setup:

1. Deploy `backend/` to Render, Railway, or any Node host.
2. Deploy `frontend/` to Vercel.
3. Set the frontend env vars to your live backend URLs.
4. Set `CLIENT_URLS` on the backend to your live frontend domain.

### Backend deploy settings

- Root directory: `backend`
- Install command: `npm install`
- Start command: `npm start`
- Health check path: `/health`

### Frontend deploy settings

- Root directory: `frontend`
- Build command: `npm run build`
- Start command: `npm start`

## GitHub upload

This repo now ignores `node_modules`, `.next`, logs, and `.env` files, so GitHub uploads stay fast and clean.

If you want to push it to a new GitHub repo:

```bash
git add .
git commit -m "Initial production-ready setup"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```
