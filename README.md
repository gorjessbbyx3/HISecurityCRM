
# Hawaii Security CRM

A comprehensive security management system designed for Hawaii-based crime watch and protection services. The application provides a centralized platform for managing clients, properties, patrol reports, crime intelligence, staff scheduling, and financial records with real-time dashboard analytics.

## 🏝️ Features

- **Crime Intelligence & Mapping** - Real-time incident tracking with live Honolulu Police Department data integration
- **Patrol Management** - Staff scheduling, route optimization, and daily patrol documentation
- **Client & Property Database** - Comprehensive customer management with contract tracking
- **Hawaii Law Reference** - Quick access to relevant security regulations and legal codes
- **Community Outreach** - Social services directory and emergency contact resources
- **Smart Accounting** - Financial tracking with automated tax categorization
- **Real-time Activity Feed** - Live system updates via WebSocket connections
- **Mobile-responsive Design** - Optimized for desktop, tablet, and mobile devices

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript and Vite
- **Tailwind CSS** with Shadcn/ui components
- **TanStack Query** for data fetching and caching
- **React Hook Form** with Zod validation
- **Wouter** for client-side routing

### Backend
- **Node.js** with Express.js and TypeScript
- **Supabase** for authentication and PostgreSQL database
- **JWT-based authentication** with bcrypt password hashing
- **WebSocket support** for real-time updates
- **RESTful API** with structured route handlers

### Database
- **Supabase PostgreSQL** with real-time subscriptions
- **UUID primary keys** for all entities
- **Comprehensive schema** for users, clients, properties, incidents, patrol reports, and financial records

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 20+ 
- Supabase account and project

### Environment Variables
Create the following secrets in your Replit environment:

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

## 🔐 Authentication

### Default Admin Credentials
- **Username**: `STREETPATROL808`
- **Password**: `Password3211`

### User Roles
- **Admin** - Full system access and user management
- **Supervisor** - Limited administrative functions
- **Security Officer** - Basic patrol and reporting functions

## 📊 Database Schema

### Core Tables
- `users` - Staff authentication and role management
- `clients` - Customer information and contracts
- `properties` - Managed locations with security details
- `incidents` - Crime reporting and tracking
- `patrol_reports` - Daily patrol documentation
- `activities` - System audit logs
- `financial_records` - Accounting and expense tracking

## 🌐 API Endpoints

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

## 🏃‍♂️ Development Commands

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

## 🚢 Deployment

This application is optimized for deployment on Replit with the following configuration:

### Build Configuration
- Vite builds the frontend to `dist/`
- TypeScript compiles the backend with esbuild
- Static files served from `dist/` in production

### Environment Setup
- Configure Supabase secrets in Replit Secrets tab
- Ensure `SESSION_SECRET` is set for JWT signing
- Database automatically connects via Supabase environment variables

## 🔄 Recent Updates

- **January 2025**: Migrated from local PostgreSQL to Supabase for better deployment compatibility
- **January 2025**: Implemented JWT-based authentication replacing session-based auth
- **January 2025**: Integrated live crime data from Honolulu Police Department API
- **January 2025**: Added comprehensive Hawaii law reference system
- **January 2025**: Configured WebSocket support for real-time updates

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

This is a private security management system. For feature requests or bug reports, please contact the development team.

## 📞 Support

For technical support or questions about the Hawaii Security CRM system, please contact the system administrator.
