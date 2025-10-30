# 🚀 Railway Deployment Guide - Complete Step-by-Step

## ✅ Pre-Deployment Checklist

Before deploying to Railway, make sure:

- [x] ✅ Database connection working locally
- [x] ✅ All environment variables in `.env`
- [x] ✅ `server.js` properly configured
- [x] ✅ `package.json` has correct start script
- [ ] 📦 Code pushed to GitHub
- [ ] 🚂 Railway project created
- [ ] 🔐 Environment variables set in Railway

---

## 🎯 Step-by-Step Deployment

### 📋 **Step 1: Prepare Your Code for GitHub**

1. **Make sure `.env` is in `.gitignore`** (NEVER commit secrets!)

   Check your `.gitignore` file contains:
   ```
   .env
   node_modules/
   uploads/
   logs/
   *.log
   ```

2. **Create a `.env.example` file** for reference:

   ```bash
   # In your terminal
   cd d:\MWT_PROJECT\zbackend
   ```

   Create a file called `.env.example` with:
   ```properties
   NODE_ENV=production
   PORT=5000
   
   # Database (Railway will use internal connection)
   DB_HOST=mysql.railway.internal
   DB_PORT=3306
   DB_NAME=railway
   DB_USER=root
   DB_PASSWORD=your_password_here
   
   # JWT Secret
   JWT_SECRET=your_secret_here
   
   # Email (Gmail SMTP)
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=your_app_password
   
   # OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=https://your-app.railway.app/api/auth/oauth/google/callback
   
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_REDIRECT_URI=https://your-app.railway.app/api/auth/oauth/github/callback
   ```

3. **Commit and push to GitHub:**

   ```bash
   git add .
   git commit -m "✅ Backend ready for Railway deployment"
   git push origin main
   ```

---

### 🚂 **Step 2: Create Railway Project**

1. **Go to Railway Dashboard:**
   - Visit: [https://railway.app/dashboard](https://railway.app/dashboard)
   - Click **"New Project"**

2. **Choose deployment method:**
   - Click **"Deploy from GitHub repo"**
   - Select your repository: `MWT_PROJECT`
   - Railway will automatically detect it's a Node.js project

3. **Railway will auto-detect:**
   - ✅ `package.json` found
   - ✅ Start command: `node server.js`
   - ✅ Port: 5000

---

### 🔐 **Step 3: Configure Environment Variables**

1. **In Railway dashboard, click on your backend service**

2. **Go to "Variables" tab**

3. **Add these environment variables ONE BY ONE:**

   Click **"New Variable"** and add:

   ```properties
   NODE_ENV=production
   ```

   ```properties
   PORT=5000
   ```

   ```properties
   DB_HOST_PROD=mysql.railway.internal
   ```

   ```properties
   DB_PORT_PROD=3306
   ```

   ```properties
   DB_NAME=railway
   ```

   ```properties
   DB_USER=root
   ```

   ```properties
   DB_PASSWORD=LjcsGFNvzfqyLGDbwCJfVazoOJzQiJsF
   ```

   ```properties
   JWT_SECRET=c2e063a46747f08be687f771d82637545d5b218d7b7ea9439885adbbfa6d0d08338f52a7ccbba34c013029751138e6a820f5052b82647c408a65403edeb6dbb6
   ```

   ```properties
   GMAIL_USER=subash1310m@gmail.com
   ```

   ```properties
   GMAIL_APP_PASSWORD=upixgzdsvkgojvmt
   ```

   ```properties
   GOOGLE_CLIENT_ID=[copy from your .env file]
   ```

   ```properties
   GOOGLE_CLIENT_SECRET=[copy from your .env file]
   ```

   ```properties
   GITHUB_CLIENT_ID=[copy from your .env file]
   ```

   ```properties
   GITHUB_CLIENT_SECRET=[copy from your .env file]
   ```

4. **IMPORTANT: Update OAuth Redirect URIs after deployment**
   
   After your app is deployed, Railway will give you a URL like:
   `https://your-app-name.up.railway.app`
   
   Then update these variables:
   ```properties
   GOOGLE_REDIRECT_URI=https://your-app-name.up.railway.app/api/auth/oauth/google/callback
   GITHUB_REDIRECT_URI=https://your-app-name.up.railway.app/api/auth/oauth/github/callback
   ```

   Also update the redirect URIs in:
   - Google Cloud Console
   - GitHub OAuth Settings

---

### 🗄️ **Step 4: Link MySQL Database**

Your MySQL database is already in the same Railway project!

1. **In Railway, you should see two services:**
   - 🗄️ MySQL (your database)
   - 🚀 Backend (your Node.js app)

2. **Railway automatically provides internal connection:**
   - Your backend will connect via `mysql.railway.internal`
   - No public connection needed in production!

3. **Verify connection:**
   - The auto-switching logic in `database.js` will use:
     - `DB_HOST_PROD=mysql.railway.internal` ✅
     - Fast, secure, internal connection

---

### 🚀 **Step 5: Deploy!**

1. **Railway will automatically deploy when you push to GitHub**

2. **Monitor the deployment:**
   - Click on your backend service
   - Go to **"Deployments"** tab
   - Watch the build logs in real-time

3. **Build process:**
   ```
   📦 Installing dependencies...
   🔨 Building application...
   🚀 Starting server...
   ✅ Deployment successful!
   ```

4. **Check logs:**
   - Go to **"Logs"** tab
   - You should see:
     ```
     🗄️  DATABASE CONNECTION CONFIGURATION
     🌍 Mode: 🚀 PRODUCTION
     📍 Host: mysql.railway.internal
     🔌 Port: 3306
     ✅ Database connected
     🚀 Server is running on http://localhost:5000
     ```

---

### 🌐 **Step 6: Get Your Live URL**

1. **In Railway dashboard → Settings tab**

2. **Under "Domains" section:**
   - Click **"Generate Domain"**
   - Railway will create: `https://your-app-name.up.railway.app`

3. **Test your API:**
   - Open: `https://your-app-name.up.railway.app/`
   - Should see API documentation JSON
   
   - Test health: `https://your-app-name.up.railway.app/api/health`
   - Should return:
     ```json
     {
       "status": "OK",
       "timestamp": "2025-10-30T...",
       "database": "Connected"
     }
     ```

---

### 🔧 **Step 7: Update Frontend Configuration**

Once your backend is live, update your frontend:

1. **Update frontend `.env`:**
   ```properties
   VITE_API_URL=https://your-app-name.up.railway.app/api
   ```

2. **Or in your frontend config:**
   ```javascript
   const API_URL = process.env.NODE_ENV === 'production'
     ? 'https://your-app-name.up.railway.app/api'
     : 'http://localhost:5000/api';
   ```

3. **Redeploy frontend** (Vercel/Netlify/etc.)

---

## 🎯 Deployment Verification Checklist

After deployment, test these endpoints:

- [ ] ✅ Root: `https://your-app.railway.app/`
- [ ] ✅ Health: `https://your-app.railway.app/api/health`
- [ ] ✅ Test: `https://your-app.railway.app/api/test`
- [ ] ✅ Auth login: `POST https://your-app.railway.app/api/auth/login`
- [ ] ✅ Users: `GET https://your-app.railway.app/api/users`

---

## 🔄 Continuous Deployment

Railway automatically redeploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "✨ New feature"
git push origin main

# Railway automatically:
# 1. Detects push
# 2. Builds new version
# 3. Deploys
# 4. Switches traffic to new version
```

---

## 🐛 Troubleshooting

### **Problem: Can't connect to database**

**Solution:**
- Check environment variables in Railway
- Verify `DB_HOST_PROD=mysql.railway.internal`
- Check Railway logs for connection errors

### **Problem: OAuth redirect mismatch**

**Solution:**
- Update `GOOGLE_REDIRECT_URI` and `GITHUB_REDIRECT_URI` in Railway
- Update redirect URIs in Google Cloud Console and GitHub settings
- Match exactly: `https://your-app.railway.app/api/auth/oauth/google/callback`

### **Problem: Server not starting**

**Solution:**
- Check Railway logs for errors
- Verify `package.json` has `"start": "node server.js"`
- Make sure `PORT` environment variable is set

### **Problem: 404 on all routes**

**Solution:**
- Check if server is listening on `process.env.PORT`
- Verify routes are properly loaded in `server.js`
- Check Railway logs for route loading messages

---

## 📊 Monitoring Your Deployment

### **Logs:**
- Railway Dashboard → Your Service → "Logs" tab
- Real-time logs of your application

### **Metrics:**
- Railway Dashboard → Your Service → "Metrics" tab
- CPU, Memory, Network usage

### **Deployments:**
- Railway Dashboard → Your Service → "Deployments" tab
- History of all deployments
- Rollback option available

---

## 💰 Cost Considerations

**Railway Pricing:**
- **Developer Plan** (Free): $5 credit/month
- **Hobby Plan**: $5/month + usage
- **Pro Plan**: $20/month + usage

**Your setup:**
- MySQL database: ~$2-5/month
- Backend app: ~$5-10/month (depends on traffic)

**Total estimated:** ~$7-15/month for full production app

---

## 🎉 Success!

Once deployed, your backend will:
- ✅ Auto-scale based on traffic
- ✅ Auto-restart if crashes
- ✅ Auto-deploy on git push
- ✅ Use fast internal MySQL connection
- ✅ Serve your frontend via API
- ✅ Handle OAuth authentication
- ✅ Send emails via Gmail SMTP
- ✅ Run chatbot with OpenAI

**Your app is production-ready! 🚀**

---

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app/)
- [Node.js Deployment Guide](https://docs.railway.app/guides/nodejs)
- [Environment Variables](https://docs.railway.app/develop/variables)
- [Custom Domains](https://docs.railway.app/deploy/exposing-your-app)

---

## 🆘 Need Help?

If you encounter any issues:

1. Check Railway logs first
2. Verify all environment variables
3. Test locally with `NODE_ENV=production`
4. Check database connection in Railway MySQL logs

**Share the error logs and I'll help you debug immediately!** 🚀
