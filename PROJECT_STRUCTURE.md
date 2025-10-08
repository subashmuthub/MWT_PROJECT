# 🏢 Laboratory Management System - Complete Project Structure

## 📁 Project Overview
**Location:** `D:\MWT_PROJECT`  
**Type:** Full-stack Laboratory Management System  
**Tech Stack:** React + Vite (Frontend) | Node.js + Express + Sequelize (Backend) | MySQL (Database)

---

## 🗂️ Root Directory Structure

```
D:\MWT_PROJECT/
├── 📄 package.json                     # Main project configuration
├── 📄 package-lock.json                # Dependency lock file
├── 📄 start-servers.bat                # Automated startup script
├── 📄 start-app.bat                    # Alternative startup script
├── 📄 start-backend.bat                # Backend-only startup
├── 📄 start-frontend.bat               # Frontend-only startup
├── 📄 COMPREHENSIVE_TEST_RESULTS.md    # Testing documentation
├── 📄 ERROR_RESOLUTION_REPORT.md       # Error tracking document
├── 📄 SYSTEM_ANALYSIS.md               # System analysis report
├── 📄 VERIFICATION_GUIDE.md            # Verification procedures
├── 📁 .github/                         # GitHub configuration
│   └── 📄 copilot-instructions.md      # AI development guidelines
├── 📁 .vscode/                         # VS Code settings
│   └── 📄 settings.json                # IDE configuration
├── 📁 frontend/                        # React frontend application
└── 📁 zbackend/                        # Node.js backend server
```

---

## 🎨 Frontend Structure (React + Vite)

```
frontend/
├── 📄 package.json                     # Frontend dependencies & scripts
├── 📄 package-lock.json                # Dependency lock file
├── 📄 vite.config.js                   # Vite configuration with API proxy
├── 📄 tailwind.config.js               # TailwindCSS styling configuration
├── 📄 eslint.config.js                 # Code quality & linting rules
├── 📄 postcss.config.js                # PostCSS configuration
├── 📄 index.html                       # HTML entry point
├── 📄 README.md                        # Frontend documentation
├── 📁 public/                          # Static assets
│   └── 📁 Images/                      # Image resources
│       ├── 📄 Founder.jpg              # Founder photo
│       ├── 📄 Home.jpg                 # Homepage image
│       ├── 📄 Logo.png                 # Application logo
│       └── 📄 Logo1.png                # Alternative logo
└── 📁 src/                             # Source code
    ├── 📄 App.jsx                      # Main React application component
    ├── 📄 App.css                      # Application-wide styles
    ├── 📄 main.jsx                     # React application entry point
    ├── 📄 index.css                    # Global CSS styles
    ├── 📄 index.html                   # Additional HTML template
    ├── 📁 assets/                      # Asset files
    │   └── 📄 react.svg                # React logo
    ├── 📁 components/                  # Reusable React components
    │   ├── 📄 Chatbot.jsx              # AI chatbot interface
    │   ├── 📄 Header.jsx               # Navigation header
    │   ├── 📄 LabManagement.jsx        # Lab operations component
    │   ├── 📄 ErrorBoundary.jsx        # Error handling wrapper
    │   ├── 📄 LanguageSelector.jsx     # Internationalization
    │   ├── 📄 RecentlyAccessed.jsx     # Recent items display
    │   └── 📁 common/                  # Shared components
    │       ├── 📄 ProtectedRoute.jsx   # Authentication routing
    │       └── 📄 LoadingSpinner.jsx   # Loading UI feedback
    ├── 📁 config/                      # Configuration files
    │   └── 📄 api.js                   # API configuration
    ├── 📁 contexts/                    # React Context providers
    │   └── 📄 AuthContext.jsx          # Authentication state management
    ├── 📁 hooks/                       # Custom React hooks
    │   ├── 📄 useAuth.js               # Authentication logic hook
    │   └── 📄 useEquipment.js          # Equipment management hook
    ├── 📁 i18n/                        # Internationalization
    │   └── 📄 index.js                 # Language configuration
    ├── 📁 pages/                       # Main application pages
    │   ├── 📄 HomePage.jsx             # Landing/welcome page
    │   ├── 📄 LoginPage.jsx            # User authentication
    │   ├── 📄 RegisterPage.jsx         # User registration
    │   ├── 📄 Dashboard.jsx            # Main dashboard
    │   ├── 📄 StudentDashboard.jsx     # Student-specific dashboard
    │   ├── 📄 EquipmentInventory.jsx   # Equipment tracking & management
    │   ├── 📄 EquipmentDetails.jsx     # Individual equipment details
    │   ├── 📄 BookingSystem.jsx        # Lab reservation system
    │   ├── 📄 Calendar.jsx             # Calendar/scheduling view
    │   ├── 📄 UserManagement.jsx       # User administration
    │   ├── 📄 ReportsAnalytics.jsx     # Data visualization & reports
    │   ├── 📄 MaintenanceSchedule.jsx  # Equipment maintenance
    │   ├── 📄 OrderManagement.jsx      # Supply ordering system
    │   ├── 📄 Notifications.jsx        # System alerts & notifications
    │   ├── 📄 Training.jsx             # User training programs
    │   ├── 📄 Incidents.jsx            # Issue tracking & reporting
    │   ├── 📄 Settings.jsx             # System configuration
    │   ├── 📄 Profile.jsx              # User profile management
    │   └── 📄 AddLabModel.jsx          # Lab creation/editing
    ├── 📁 services/                    # API communication layer
    │   ├── 📄 api.js                   # Backend API communication
    │   └── 📄 reportService.js         # Report generation services
    └── 📁 utils/                       # Utility functions
        └── 📄 constants.js             # Application constants
```

---

## 🔧 Backend Structure (Node.js + Express + Sequelize)

```
zbackend/
├── 📄 server.js                        # Main Express server entry point
├── 📄 package.json                     # Backend dependencies & scripts
├── 📄 package-lock.json                # Dependency lock file
├── 📄 .env                             # Environment variables (database, keys)
├── 📄 .gitignore                       # Git ignore patterns
├── 📄 oauth-deps.json                  # OAuth dependencies
├── 📄 module-integration-report.md     # Module integration documentation
├── 📁 config/                          # Configuration files
│   └── 📄 database.js                  # MySQL database configuration
├── 📁 middleware/                      # Express middleware
│   └── 📄 auth.js                      # JWT authentication middleware
├── 📁 migrations/                      # Database schema migrations
│   ├── 📄 add_equipment_specs.js       # Equipment specifications migration
│   └── 📄 add_equipment_specs_columns.js # Equipment columns migration
├── 📁 models/                          # Sequelize database models
│   ├── 📄 index.js                     # Model associations & setup
│   ├── 📄 User.js                      # User accounts & roles
│   ├── 📄 Lab.js                       # Laboratory definitions
│   ├── 📄 Equipment.js                 # Equipment inventory tracking
│   ├── 📄 Booking.js                   # Lab reservation system
│   ├── 📄 Maintenance.js               # Equipment maintenance records
│   ├── 📄 Order.js                     # Supply order management
│   ├── 📄 Notification.js              # System notifications
│   ├── 📄 NotificationSettings.js      # User notification preferences
│   ├── 📄 Training.js                  # Training program definitions
│   ├── 📄 TrainingCertification.js     # Training completion records
│   ├── 📄 Incident.js                  # Issue tracking & reporting
│   ├── 📄 Report.js                    # Report definitions
│   ├── 📄 ReportSchedule.js            # Scheduled report generation
│   └── 📄 RecentlyAccessed.js          # User activity tracking
├── 📁 routes/                          # API endpoint definitions
│   ├── 📄 auth.js                      # Authentication endpoints
│   ├── 📄 oauth.js                     # OAuth integration endpoints
│   ├── 📄 users.js                     # User management API
│   ├── 📄 labs.js                      # Laboratory management
│   ├── 📄 equipment.js                 # Equipment operations
│   ├── 📄 bookings.js                  # Reservation system API
│   ├── 📄 maintenance.js               # Maintenance scheduling
│   ├── 📄 orders.js                    # Supply management API
│   ├── 📄 reports.js                   # Analytics & reporting
│   ├── 📄 chatbot.js                   # AI assistant endpoints
│   ├── 📄 notification.js              # Alert system API
│   ├── 📄 training.js                  # Training management
│   ├── 📄 incidents.js                 # Issue tracking API
│   ├── 📄 activities.js                # Activity logging
│   ├── 📄 recentlyAccessed.js          # Recent activity tracking
│   └── 📄 system.js                    # System administration
├── 📁 services/                        # Business logic services
│   ├── 📄 reportService.js             # Report generation logic
│   └── 📄 excelExportService.js        # Data export functionality
└── 📁 utils/                           # Utility functions
    └── 📄 notificationService.js       # Notification handling utilities
```

---

## 🌐 API Architecture

### **Backend Endpoints (Port 5000)**
- **Authentication:** `/api/auth` - User login, registration, JWT management
- **OAuth:** `/api/auth` - OAuth integration (Google, Microsoft)
- **Users:** `/api/users` - User management & administration
- **Labs:** `/api/labs` - Laboratory management operations
- **Equipment:** `/api/equipment` - Equipment inventory & tracking
- **Bookings:** `/api/bookings` - Lab reservation system
- **Maintenance:** `/api/maintenance` - Equipment maintenance scheduling
- **Orders:** `/api/orders` - Supply ordering & management
- **Reports:** `/api/reports` - Analytics & report generation
- **Chatbot:** `/api/chatbot` - AI assistant for lab queries
- **Notifications:** `/api/notifications` - Alert & notification system
- **Training:** `/api/training` - Training program management
- **Incidents:** `/api/incidents` - Issue tracking & reporting
- **Activities:** `/api/activities` - Activity logging & audit trails

### **Frontend Access (Port 5173/5174)**
- **Public Routes:** Homepage, Login, Register
- **Protected Routes:** Dashboard, Equipment, Bookings, Reports
- **Role-based Access:** Admin, Teacher, Lab Assistant, Student roles
- **API Proxy:** Vite proxies `/api/*` requests to backend

---

## 🗄️ Database Schema

### **Core Tables:**
- **users** - User accounts, roles, authentication
- **labs** - Laboratory definitions, capacity, resources
- **equipment** - Equipment inventory, specifications, status
- **bookings** - Lab reservations, scheduling, conflicts
- **maintenance** - Maintenance records, schedules, history
- **orders** - Supply orders, inventory management
- **notifications** - System alerts, user notifications
- **training** - Training programs, certifications
- **incidents** - Issue tracking, resolution status
- **reports** - Report definitions, scheduling
- **recently_accessed** - User activity tracking

---

## 🚀 Getting Started

### **Prerequisites:**
- Node.js (v14+ recommended)
- MySQL database server
- Git for version control

### **Quick Start:**
```bash
# Clone and setup
cd D:\MWT_PROJECT

# Install dependencies
npm install
cd frontend && npm install
cd ../zbackend && npm install

# Start both servers
..\start-servers.bat

# Access application
Frontend: http://localhost:5173
Backend API: http://localhost:5000
```

### **Environment Setup:**
1. Configure database in `zbackend/.env`
2. Set JWT secrets and API keys
3. Configure OAuth credentials (optional)
4. Run database migrations if needed

---

## 🔧 Key Features

### **Frontend Features:**
- 🎨 Modern React UI with TailwindCSS
- 🔐 JWT-based authentication with role management
- 📱 Responsive design for all devices
- 🤖 Integrated AI chatbot for lab assistance
- 📊 Real-time data visualization and reporting
- 🌐 Internationalization support (i18n)
- ⚡ Fast development with Vite and HMR

### **Backend Features:**
- 🚀 RESTful API with Express.js
- 🔒 Secure JWT authentication & authorization
- 🗄️ Sequelize ORM with MySQL integration
- 📧 Notification system with email support
- 📈 Advanced reporting and analytics
- 🔍 AI-powered search and assistance
- ⚙️ Role-based access control (RBAC)
- 📋 Comprehensive audit logging

### **System Capabilities:**
- 🏢 Multi-laboratory management
- 📦 Equipment inventory tracking
- 📅 Advanced booking and scheduling
- 🛠️ Maintenance tracking and alerts
- 🛒 Supply order management
- 👥 User management with role hierarchy
- 📊 Comprehensive reporting and analytics
- 🚨 Incident tracking and resolution
- 📚 Training program management
- 🔔 Real-time notifications and alerts

---

## 📝 Documentation Files

- **COMPREHENSIVE_TEST_RESULTS.md** - Complete testing documentation
- **ERROR_RESOLUTION_REPORT.md** - Error tracking and solutions
- **SYSTEM_ANALYSIS.md** - System architecture analysis
- **VERIFICATION_GUIDE.md** - Verification and validation procedures
- **copilot-instructions.md** - AI development guidelines and patterns

---

*This Laboratory Management System provides a complete solution for educational institutions to manage their laboratory resources, equipment, users, and operations efficiently.*