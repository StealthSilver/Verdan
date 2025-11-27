# 🌳 Verdan - Greener Tomorrow

<div align="center">
  <img src="./frontend/src/assets/verdan_dark.svg" alt="Verdan Logo" width="150" height="150">
  
  **Nurture nature, one tree at a time**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)](https://www.mongodb.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-19+-blue)](https://reactjs.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-15+-black)](https://nextjs.org/)
</div>

## 📖 What is Verdan?

Verdan is a comprehensive **tree planting management platform** that empowers teams to plant, monitor, and nurture trees across multiple sites. With complete photo documentation, GPS tracking, and growth insights, Verdan bridges the gap between environmental conservation and modern technology.

### 🎯 Who is it for?

- **Environmental Organizations** - Track large-scale reforestation projects
- **Corporate CSR Teams** - Manage company-wide tree planting initiatives
- **Educational Institutions** - Monitor campus green spaces and student projects
- **Municipal Departments** - Oversee urban tree management programs
- **Community Groups** - Organize local tree planting drives
- **Research Organizations** - Collect data on tree growth and environmental impact

### 🌟 Why Verdan?

In an era of climate change and environmental awareness, tracking and managing tree planting efforts is crucial. Verdan provides:

- **Real-time monitoring** of tree health and growth
- **Collaborative team management** across multiple sites
- **Data-driven insights** for environmental impact assessment
- **Photo documentation** for progress tracking
- **GPS precision** for accurate location mapping
- **Role-based access** for secure data management

---

## ✨ Key Features

### 🏢 For Administrators

- **Site Management**: Create and manage multiple planting sites with GPS coordinates
- **Team Administration**: Add team members and assign them to specific sites
- **Advanced Analytics**: View comprehensive growth reports, verification statistics, and site performance
- **Verification System**: Approve and verify tree records submitted by team members
- **Real-time Dashboards**: Monitor all activities across all sites from a central dashboard

### 👥 For Team Members

- **Tree Registration**: Add new tree records with photos, GPS coordinates, and metadata
- **Progress Tracking**: Upload photos and update tree status over time
- **Site Dashboard**: View all trees planted at assigned sites
- **Profile Management**: Manage personal information and view planting history
- **Mobile-Friendly Interface**: Access all features on mobile devices

### 🔧 Technical Features

- **Photo Upload**: Cloud-based image storage with automatic timestamp
- **GPS Integration**: Precise location tracking for every tree
- **Real-time Sync**: Live updates across all user interfaces
- **Data Export**: Export data for reports and analysis
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **RESTful API**: Full API access for integrations

---

## 🏗️ Application Architecture

### 🧩 System Components

```
🌐 Frontend (React + Vite)     🌍 Landing Page (Next.js)     ⚙️ Backend (Node.js + Express)
├── User Dashboard              ├── Hero Section              ├── Authentication System
├── Admin Panel                 ├── Features Showcase         ├── User Management
├── Site Management            ├── About Section              ├── Site Management APIs
├── Tree Tracking              ├── Call-to-Action            ├── Tree CRUD Operations
├── Photo Management           └── Contact Information        ├── Image Handling
└── Analytics Dashboard                                       ├── Email Notifications
                                                             └── Data Analytics
```

### 📊 Database Schema

```mermaid
erDiagram
    User {
        string id PK
        string name
        string email UK
        string password
        enum role
        string designation
        string organization
        ObjectId siteId FK
        enum gender
        date createdAt
        date updatedAt
    }

    Site {
        string id PK
        string name
        string address
        object coordinates
        enum status
        string type
        string image
        array teamMembers
        date createdAt
        date updatedAt
    }

    Tree {
        string id PK
        ObjectId siteId FK
        ObjectId plantedBy FK
        string treeName
        string treeType
        object coordinates
        date datePlanted
        date timestamp
        string status
        string remarks
        boolean verified
        array images
        date createdAt
        date updatedAt
    }

    User ||--o{ Tree : plants
    Site ||--o{ Tree : contains
    User }|--|| Site : assigned_to
```

### 🔄 Application Flow

#### **For New Users:**

1. **Registration** → Admin creates account and assigns to site
2. **Login** → User receives credentials and accesses dashboard
3. **Site Access** → User views assigned site(s)
4. **Tree Planting** → User adds tree records with photos and GPS
5. **Tracking** → User updates tree status over time

#### **For Administrators:**

1. **Site Creation** → Admin creates new planting sites
2. **Team Management** → Admin adds team members to sites
3. **Monitoring** → Admin reviews all tree records and activities
4. **Verification** → Admin verifies tree records for accuracy
5. **Analytics** → Admin views growth reports and insights

#### **Data Flow:**

```
📱 User Input → 🔄 API Validation → 💾 Database Storage → 📊 Real-time Updates → 📈 Analytics Dashboard
```

---

## 🚀 Quick Start Guide

### Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)
- **A text editor** (VS Code recommended)

### ⚡ Express Setup (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/StealthSilver/Verdan.git
cd Verdan

# 2. Install dependencies for all components
npm install                    # Install root dependencies
cd backend && npm install      # Install backend dependencies
cd ../frontend && npm install  # Install frontend dependencies
cd ../landing && npm install   # Install landing page dependencies
cd ..                         # Return to root

# 3. Set up environment variables
cp backend/.env.example backend/.env    # Copy environment template
# Edit backend/.env with your MongoDB connection string

# 4. Start MongoDB (if not already running)
mongod --dbpath /path/to/your/db

# 5. Create an admin user
cd backend
npm run create-admin                    # Creates default admin user

# 6. Start all services
cd ..
npm run dev                             # Starts all services concurrently
```

### 🌐 Access Your Application

After setup, access these URLs:

- **Main Application**: http://localhost:5173 (Frontend)
- **Landing Page**: http://localhost:3000 (Marketing site)
- **API Server**: http://localhost:8000 (Backend API)

### 🔑 Default Login Credentials

```
Email: admin@verdan.com
Password: admin123
```

> ⚠️ **Important**: Change these credentials immediately after first login!

---

## 💻 Detailed Installation Guide

### Step 1: Environment Setup

#### MongoDB Setup Options:

**Option A: Local Installation**

```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community

# Ubuntu/Debian
sudo apt-get install gnupg
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Windows
# Download MongoDB installer from https://www.mongodb.com/try/download/community
# Follow the installation wizard
```

**Option B: MongoDB Atlas (Cloud)**

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create a new cluster
3. Get your connection string
4. Use it in your `.env` file

#### Environment Configuration:

Create `backend/.env`:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/verdan
# For MongoDB Atlas: MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/verdan

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Email Configuration (Optional - for notifications)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomin.com

# Server Configuration
PORT=8000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Step 2: Database Initialization

```bash
# Navigate to backend
cd backend

# Build the TypeScript code
npm run build

# Seed the database with sample data (optional)
npm run seed

# Create your first admin user
npm run create-admin:custom
```

### Step 3: Start Development Servers

#### Option A: Start All at Once

```bash
# From root directory
npm run dev
```

#### Option B: Start Individually

```bash
# Terminal 1: Backend API
cd backend
npm run dev

# Terminal 2: Frontend Application
cd frontend
npm run dev

# Terminal 3: Landing Page
cd landing
npm run dev
```

---

## 🎮 User Guide

### 👑 For Administrators

#### Getting Started

1. **Login** with your admin credentials
2. **Create Sites**: Add locations where trees will be planted

   - Enter site name and address
   - Set GPS coordinates
   - Upload site photo
   - Set site status (active/inactive)

3. **Add Team Members**: Invite users to manage sites
   - Enter user details
   - Assign to specific sites
   - Set user roles and permissions

#### Managing Sites

- **View All Sites**: Dashboard shows all created sites
- **Edit Site Details**: Update information anytime
- **Monitor Activity**: See real-time tree planting activities
- **Team Management**: Add/remove team members from sites

#### Analytics & Reporting

- **Growth Tracking**: View tree growth over time
- **Verification Status**: See which trees need verification
- **Site Performance**: Compare activity across different sites
- **Export Data**: Download reports for external analysis

### 👥 For Team Members

#### Getting Started

1. **Receive Credentials**: Admin will provide login details
2. **Access Dashboard**: View your assigned sites
3. **Explore Interface**: Familiarize yourself with the dashboard

#### Planting Trees

1. **Select Site**: Choose from your assigned sites
2. **Add Tree Record**:

   - Enter tree name and type
   - Take a photo
   - Mark GPS location
   - Add planting date
   - Include any remarks

3. **Submit for Verification**: Admin will review and verify

#### Tracking Progress

- **Update Tree Status**: Mark trees as healthy, needs attention, etc.
- **Upload Progress Photos**: Document growth over time
- **Add Maintenance Notes**: Record care activities
- **View Site Summary**: See all trees planted at your sites

#### Profile Management

- **Update Personal Info**: Keep your profile current
- **View History**: See all trees you've planted
- **Change Password**: Maintain account security

---

## 🛠️ Development Guide

### Project Structure

```
Verdan/
├── 📁 backend/                 # Node.js + Express API
│   ├── 📁 src/
│   │   ├── 📁 controllers/     # Route handlers
│   │   ├── 📁 middlewares/     # Auth, validation, etc.
│   │   ├── 📁 models/          # MongoDB schemas
│   │   ├── 📁 routes/          # API route definitions
│   │   ├── 📁 scripts/         # Database scripts
│   │   ├── 📁 utils/           # Helper functions
│   │   └── 📄 server.ts        # Main server file
│   ├── 📄 package.json
│   └── 📄 tsconfig.json
│
├── 📁 frontend/                # React + Vite application
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable UI components
│   │   ├── 📁 context/         # React context providers
│   │   ├── 📁 Pages/           # Page components
│   │   ├── 📁 assets/          # Images, icons, etc.
│   │   ├── 📄 api.ts           # API client configuration
│   │   ├── 📄 App.tsx          # Main app component
│   │   └── 📄 main.tsx         # React entry point
│   ├── 📄 package.json
│   ├── 📄 tailwind.config.js   # Tailwind CSS config
│   └── 📄 vite.config.ts       # Vite configuration
│
├── 📁 landing/                 # Next.js landing page
│   ├── 📁 src/
│   │   ├── 📁 app/             # Next.js 13+ app directory
│   │   ├── 📁 components/      # Landing page components
│   │   └── 📁 config/          # Site configuration
│   ├── 📄 package.json
│   └── 📄 next.config.ts       # Next.js configuration
│
├── 📄 README.md                # This file
├── 📄 ADMIN_MANAGEMENT.md      # Admin setup guide
└── 📄 package.json             # Root package.json
```

### 🔧 Available Scripts

#### Root Level

```bash
npm run dev          # Start all services concurrently
npm run build        # Build all projects
npm run clean        # Clean all node_modules and build files
```

#### Backend Scripts

```bash
npm run build              # Compile TypeScript
npm start                  # Start production server
npm run dev               # Start development server
npm run create-admin      # Create default admin user
npm run create-admin:custom # Create custom admin user
npm run seed              # Populate database with sample data
```

#### Frontend Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm test           # Run tests
```

#### Landing Page Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
```

### 🌐 API Documentation

#### Authentication Endpoints

```
POST   /auth/login              # User login
POST   /auth/register           # User registration (admin only)
GET    /auth/me                 # Get current user info
```

#### User Endpoints

```
GET    /user/dashboard          # Get user dashboard data
GET    /user/profile            # Get user profile
GET    /user/sites/assigned     # Get assigned sites
GET    /user/sites/:siteId/trees # Get trees for site
POST   /user/sites/:siteId/trees # Create new tree record
PUT    /user/sites/:siteId/trees/:treeId # Update tree record
DELETE /user/sites/:siteId/trees/:treeId # Delete tree record
```

#### Admin Endpoints

```
GET    /admin/dashboard         # Get admin dashboard data
GET    /admin/sites             # Get all sites
POST   /admin/sites             # Create new site
PUT    /admin/sites/:siteId     # Update site
DELETE /admin/sites/:siteId     # Delete site
GET    /admin/sites/:siteId/trees # Get trees for site
POST   /admin/sites/:siteId/verify/:treeId # Verify tree record
GET    /admin/users             # Get all users
POST   /admin/users             # Create new user
PUT    /admin/users/:userId     # Update user
DELETE /admin/users/:userId     # Delete user
```

### 🔒 Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant DB as Database

    C->>S: POST /auth/login {email, password}
    S->>DB: Find user by email
    DB-->>S: User data
    S->>S: Compare password hash
    S->>S: Generate JWT token
    S-->>C: {token, user}

    Note over C: Store token in localStorage

    C->>S: GET /user/dashboard {Authorization: Bearer token}
    S->>S: Verify JWT token
    S->>DB: Get user data
    DB-->>S: User dashboard data
    S-->>C: Dashboard data
```

### 🧪 Testing

#### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests (when available)
cd backend
npm test

# End-to-end tests (when available)
npm run test:e2e
```

#### Test Structure

```
tests/
├── 📁 unit/          # Unit tests
├── 📁 integration/   # Integration tests
├── 📁 e2e/           # End-to-end tests
└── 📁 fixtures/      # Test data
```

---

## 🚀 Deployment

### 🌟 Production Deployment

#### Prerequisites

- MongoDB Atlas account or production MongoDB server
- Cloud hosting service (Vercel, Netlify, DigitalOcean, etc.)
- Domain name (optional but recommended)

#### Backend Deployment

**Option A: Vercel (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd backend
vercel --prod
```

**Option B: DigitalOcean App Platform**

1. Connect your GitHub repository
2. Select `backend` folder as source
3. Configure environment variables
4. Deploy

**Environment Variables for Production:**

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/verdan_prod
JWT_SECRET=your_super_long_and_secure_production_jwt_secret
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://your-frontend-domain.com
RESEND_API_KEY=your_production_resend_api_key
```

#### Frontend Deployment

**Option A: Vercel**

```bash
cd frontend
vercel --prod
```

**Option B: Netlify**

```bash
cd frontend
npm run build
# Upload dist/ folder to Netlify or connect via Git
```

**Environment Variables:**

```env
VITE_API_URL=https://your-backend-domain.com
```

#### Landing Page Deployment

```bash
cd landing
vercel --prod
```

### 📊 Production Checklist

- [ ] MongoDB Atlas cluster configured
- [ ] Environment variables set for production
- [ ] Default admin password changed
- [ ] CORS configured for production domains
- [ ] SSL certificates installed
- [ ] Domain names configured
- [ ] Database backups scheduled
- [ ] Monitoring tools set up
- [ ] Error logging configured

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Standards

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Use Prettier for code formatting
- **Testing**: Add tests for new features
- **Documentation**: Update documentation for changes

### Commit Message Convention

```
type(scope): description

feat(auth): add OAuth login support
fix(api): resolve tree creation bug
docs(readme): update installation guide
refactor(frontend): simplify tree card component
```

---

## 🐛 Troubleshooting

### Common Issues

#### 🔌 Connection Issues

**"Cannot connect to MongoDB"**

```bash
# Check MongoDB status
brew services list | grep mongodb
# or
sudo systemctl status mongod

# Restart MongoDB
brew services restart mongodb/brew/mongodb-community
# or
sudo systemctl restart mongod
```

**"CORS Error"**

- Check FRONTEND_URL in backend `.env`
- Ensure frontend URL matches exactly
- Verify CORS middleware configuration

#### 🔑 Authentication Issues

**"Token expired" or "Invalid token"**

- Clear localStorage in browser
- Check JWT_SECRET matches between sessions
- Verify token expiration time

**"Admin user already exists"**

- Use different email for new admin
- Check existing admins in database:
  ```bash
  mongo verdan
  db.users.find({role: "admin"})
  ```

#### 📦 Build Issues

**"Module not found"**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**"TypeScript compilation errors"**

```bash
# Check TypeScript version
npx tsc --version

# Rebuild
npm run build
```

#### 🖼️ Image Upload Issues

**"Image upload failed"**

- Check file size (limit: 5MB)
- Verify supported formats (JPG, PNG, WebP)
- Check network connectivity
- Verify backend storage configuration

### Getting Help

1. **Check the logs**: Look in browser console and server logs
2. **Search issues**: Check GitHub issues for similar problems
3. **Create an issue**: Provide detailed error information
4. **Join discussions**: Participate in community discussions

---

## 📚 Additional Resources

### Learning Materials

- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Related Projects

- [Forest Management Systems](https://github.com/topics/forest-management)
- [Environmental Monitoring](https://github.com/topics/environmental-monitoring)
- [Tree Tracking Applications](https://github.com/topics/tree-tracking)

### Community

- **GitHub Discussions**: Share ideas and get help
- **Issues**: Report bugs and request features
- **Wiki**: Additional documentation and guides

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Verdan Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 💚 Acknowledgments

- **Environmental Organizations** for inspiration and feedback
- **Open Source Community** for the amazing tools and libraries
- **Contributors** who help make Verdan better
- **Users** who trust us with their environmental initiatives

### Built With Love For Nature 🌱

Verdan is more than just a software project - it's a commitment to environmental stewardship and sustainable technology. Every tree tracked through our platform represents a step toward a greener future.

**Together, we're growing a better tomorrow, one tree at a time.** 🌳

---

<div align="center">
  <p>Made with 💚 by the Verdan Team</p>
  <p>
    <a href="https://github.com/StealthSilver/Verdan">GitHub</a> •
    <a href="https://twitter.com/Rajat_0409">Twitter</a> •
    <a href="mailto:contact@verdan.com">Contact</a>
  </p>
</div>
