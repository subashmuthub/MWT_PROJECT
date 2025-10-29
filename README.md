# Lab Management System

Full-stack Laboratory Management System with React frontend and Node.js backend.

## 🚀 Deployment

### Backend (Render.com)
1. Create account at render.com
2. New Web Service → Connect GitHub repo
3. Settings:
   - Root: `zbackend`
   - Build: `npm install`
   - Start: `npm start`
4. Create MySQL database in Render
5. Link database to web service
6. Set `FRONTEND_URL` env variable after Vercel deployment

### Frontend (Vercel)
1. Create account at vercel.com
2. Import GitHub repo
3. Settings:
   - Framework: Vite
   - Root: `frontend`
   - Build: `npm run build`
   - Output: `dist`
4. Add env variable:
   - `VITE_API_URL`: Your Render backend URL + `/api`

## 📦 Local Development

### Backend
```bash
cd zbackend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuration Files
- `render.yaml` - Render.com backend config
- `frontend/vercel.json` - Vercel frontend config
- `frontend/vite.config.js` - Vite build config
- `zbackend/server.js` - Express server with CORS
