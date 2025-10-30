# Quick Railway Deployment Script
# This creates a .env.example file for reference

Write-Host "Preparing for Railway Deployment..." -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "❌ .env file not found! Create one first." -ForegroundColor Red
    exit 1
}

# Create .env.example
Write-Host "📝 Creating .env.example..." -ForegroundColor Cyan

$envExample = @"
# Server Configuration
NODE_ENV=production
PORT=5000

# Database Configuration (Railway Internal)
DB_HOST_PROD=mysql.railway.internal
DB_PORT_PROD=3306
DB_NAME=railway
DB_USER=root
DB_PASSWORD=your_password_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Email Configuration
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-app.railway.app/api/auth/oauth/google/callback

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=https://your-app.railway.app/api/auth/oauth/github/callback
"@

$envExample | Out-File -FilePath ".env.example" -Encoding utf8

Write-Host "✅ .env.example created" -ForegroundColor Green
Write-Host ""

# Check .gitignore
Write-Host "🔍 Checking .gitignore..." -ForegroundColor Cyan

if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    
    $requiredEntries = @(".env", "node_modules", "uploads", "logs")
    $missing = @()
    
    foreach ($entry in $requiredEntries) {
        if ($gitignoreContent -notmatch [regex]::Escape($entry)) {
            $missing += $entry
        }
    }
    
    if ($missing.Count -eq 0) {
        Write-Host "✅ .gitignore properly configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Missing entries in .gitignore:" -ForegroundColor Yellow
        $missing | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
        Write-Host ""
        Write-Host "Adding missing entries..." -ForegroundColor Cyan
        Add-Content ".gitignore" "`n# Added by deployment script"
        $missing | ForEach-Object { Add-Content ".gitignore" $_ }
        Write-Host "✅ .gitignore updated" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  .gitignore not found, creating one..." -ForegroundColor Yellow
    
    $gitignoreContent = @"
# Environment variables
.env
.env.local
.env.production

# Dependencies
node_modules/

# Uploads
uploads/

# Logs
logs/
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
"@
    
    $gitignoreContent | Out-File -FilePath ".gitignore" -Encoding utf8
    Write-Host "✅ .gitignore created" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ READY FOR RAILWAY DEPLOYMENT!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Commit your changes:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m '✅ Backend ready for deployment'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Go to Railway:" -ForegroundColor White
Write-Host "   👉 https://railway.app/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Create new project:" -ForegroundColor White
Write-Host "   - Click 'New Project'" -ForegroundColor Gray
Write-Host "   - Select 'Deploy from GitHub repo'" -ForegroundColor Gray
Write-Host "   - Choose your repository" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Set environment variables in Railway" -ForegroundColor White
Write-Host "   (See RAILWAY_DEPLOYMENT_GUIDE.md for full list)" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Deploy and get your live URL! 🚀" -ForegroundColor White
Write-Host ""
Write-Host "📚 Full guide: RAILWAY_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
