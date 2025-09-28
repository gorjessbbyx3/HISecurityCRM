    # Hawaii Security CRM 🏝️

> **Enterprise-grade security management system for Hawaii-based crime watch and protection services**

[![Node.js Version](https://img.shields.io/badge/node-20+-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vercel](https://img.shields.io/badge/deployed%20on-vercel-blue.svg)](https://vercel.com)

## 📋 Table of Contents
- [Features](#-features)
- [Quick Start](#-quick-start)
- [System Architecture](#-system-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Development](#-development)
- [Contributing](#-contributing)
- [Support](#-support)

## 🚀 Features

### Core Security Management
- **🔍 Crime Intelligence & Mapping** - Real-time incident tracking with live Honolulu Police Department data integration
- **🚔 Patrol Management** - Staff scheduling, route optimization, and daily patrol documentation
- **👥 Client & Property Database** - Comprehensive customer management with contract tracking
- **📍 Hawaii Law Reference** - Quick access to relevant security regulations and legal codes
- **🤝 Community Outreach** - Social services directory and emergency contact resources

### Business Operations
- **💰 Smart Accounting** - Financial tracking with automated tax categorization
- **📊 Real-time Analytics** - Live dashboard with key performance indicators
- **📱 Mobile-responsive Design** - Optimized for desktop, tablet, and mobile devices
- **🔐 Role-based Access Control** - Multi-level user permissions and audit trails

### Technical Features
- **⚡ Real-time Updates** - WebSocket connections for live system updates
- **📈 Advanced Analytics** - Custom reports and data visualization
- **🔔 Smart Notifications** - Automated alerts for critical events
- **📱 Progressive Web App** - Installable on mobile devices

## 🏃‍♂️ Quick Start

### Prerequisites
- **Node.js 20+** - [Download here](https://nodejs.org/)
- **npm** - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/your-org/hawaii-security-crm.git
cd hawaii-security-crm

# Install dependencies
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
# See Configuration section below for details
```

### 3. Database Setup
```bash
# Create Supabase project and database
# Run the SQL schema from supabase-schema.sql
# Update DATABASE_URL in .env.local
```

### 4. Start Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

**Access the application at:** `http://localhost:3000`

## 🏗️ System Architecture

### Technology Stack
| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | User interface |
| **Styling** | Tailwind CSS + Shadcn/ui | Responsive design |
| **State** | TanStack Query | Data management |
| **Backend** | Node.js + Express | API server |
| **Database** | Supabase PostgreSQL | Data storage |
| **Auth** | Supabase Auth | User authentication |
| **Real-time** | WebSocket | Live updates |
| **Deployment** | Vercel + Docker | Hosting |

### Project Structure
```
hawaii-security-crm/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and types
├── server/                 # Backend Express server
│   ├── routes/            # API endpoints
│   ├── middleware/        # Express middleware
│   └── models/            # Database models
├── api/                   # Vercel serverless functions
├── scripts/               # Build and utility scripts
├── shared/                # Shared types and utilities
└── docs/                  # Documentation
```

## ⚙️ Configuration

### Environment Variables
Create `.env.local` file with these variables:

```bash
# Required - Core Application
NODE_ENV=development
SESSION_SECRET=your-secure-random-string-min-32-chars
PORT=3000

# Required - Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPI have updated the DEPLOYMENT_GUIDE.md file with a comprehensive deployment guide covering multiple deployment options, environment setup, troubleshooting, and more.

Next, I will proceed to update the README.md file with improved organization, badges, and clearer sections.

<create_file>
<path>README.md</path>
<content># Hawaii Security CRM 🏝️

> **Enterprise-grade security management system for Hawaii-based crime watch and protection services**

[![Node.js Version](https://img.shields.io/badge/node-20+-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vercel](https://img.shields.io/badge/deployed%20on-vercel-blue.svg)](https://vercel.com)

## 📋 Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Authentication](#authentication)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Development Commands](#development-commands)
- [Deployment](#deployment)
- [Recent Updates](#recent-updates)
- [License](#license)
- [Contributing](#contributing)
- [Support](#support)

## Features

- **Crime Intelligence & Mapping** - Real-time incident tracking with live Honolulu Police Department data integration
- **Patrol Management** - Staff scheduling, route optimization, and daily patrol documentation
- **Client & Property Database** - Comprehensive customer management with contract tracking
- **Hawaii Law Reference** - Quick access to relevant security regulations and legal codes
- **Community Outreach** - Social services directory and emergency contact resources
- **Smart Accounting** - Financial tracking with automated tax categorization
- **Real-time Activity Feed** - Live system updates via WebSocket connections
- **Mobile-responsive Design** - Optimized for desktop, tablet, and mobile devices

## Technology Stack

### Frontend
- React 18 with TypeScript and Vite
- Tailwind CSS with Shadcn/ui components
- TanStack Query for data fetching and caching
- React Hook Form with Zod validation
- Wouter for client-side routing

### Backend
- Node.js with Express.js and TypeScript
- Supabase for authentication and PostgreSQL database
- JWT-based authentication with bcrypt password hashing
- WebSocket support for real-time updates
- RESTful API with structured route handlers

### Database
- Supabase PostgreSQL with real-time subscriptions
- UUID primary keys for all entities
- Comprehensive schema for users, clients, properties, incidents, patrol reports, and financial records

## Installation & Setup

### Prerequisites
- Node.js 20+
- Supabase account and project

### Environment Variables
Create the following secrets in your environment:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SESSION_SECRET=your_secure_session_secret
```

### Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor
3. Configure Row Level Security (RLS) policies as needed

### Installation
```bash
# Install dependencies
npm install

# Seed the database with sample data
node scripts/seed.js

# Start development server
npm run dev
```

The application will be available at `http://0.0.0.0:5000`

## Authentication

### Default Admin Credentials
- Username: `STREETPATROL808`
- Password: `Password3211`

### User Roles
- Admin - Full system access and user management
- Supervisor - Limited administrative functions
- Security Officer - Basic patrol and reporting functions

## Database Schema

### Core Tables
- `users` - Staff authentication and role management
- `clients` - Customer information and contracts
- `properties` - Managed locations with security details
- `incidents` - Crime reporting and tracking
- `patrol_reports` - Daily patrol documentation
- `activities` - System audit logs
- `financial_records` - Accounting and expense tracking

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login with credentials
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Data Management
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/properties` - List all properties
- `POST /api/incidents` - Report new incident
- `GET /api/patrol-reports` - List patrol reports

## Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run check

# Push database schema changes
npm run db:push
```

## Deployment

This application is optimized for deployment on Replit and Vercel. See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions including Docker and traditional server deployment.

## Recent Updates

- January 2025: Migrated from local PostgreSQL to Supabase for better deployment compatibility
- January 2025: Implemented JWT-based authentication replacing session-based auth
- January 2025: Integrated live crime data from Honolulu Police Department API
- January 2025: Added comprehensive Hawaii law reference system
- January 2025: Configured WebSocket support for real-time updates

## License

This project is licensed under the MIT License.

## Contributing

This is a private security management system. For feature requests or bug reports, please contact the development team.

## Support

For technical support or questions about the Hawaii Security CRM system, please contact the system administrator.
