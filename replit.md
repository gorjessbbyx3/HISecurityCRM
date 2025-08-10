# Project Overview

This is a full-stack JavaScript application with Express backend and React frontend using Vite. The project includes authentication via Replit's OpenID Connect system and a PostgreSQL database setup.

## Project Architecture

### Backend
- Express.js server with TypeScript
- Replit OpenID Connect authentication
- PostgreSQL database with Drizzle ORM
- Session management with connect-pg-simple

### Frontend
- React with TypeScript
- Vite for development and build
- Tailwind CSS for styling
- Shadcn/ui components
- React Hook Form for forms
- TanStack Query for data fetching
- Wouter for routing

### Database
- PostgreSQL with Drizzle ORM
- Session storage for authentication

## Dependencies
- Authentication: openid-client, passport, passport-local
- Database: drizzle-orm, drizzle-kit, @neondatabase/serverless
- UI: @radix-ui components, tailwindcss, lucide-react
- Utils: memoizee for caching

## User Preferences
- None specified yet

## Recent Changes
- 2025-08-10: Completed migration from Replit Agent to Replit environment
- 2025-08-10: Integrated live crime data from Honolulu Police Department API
- 2025-08-10: Added role-based access control and user management system
- 2025-08-10: Populated law reference database with Hawaii security guard requirements
- 2025-08-10: Implemented real-time crime analytics and pattern recognition
- 2025-08-10: Created admin user credentials (STREETPATROL808/Password3211)
- 2025-08-10: All API endpoints functional with PostgreSQL persistence

## Migration Status
Migration completed successfully. All features functional including:
- User authentication with role-based access
- Live crime data integration with Honolulu PD API
- Comprehensive law reference system for guard card compliance
- Real-time WebSocket connections for live updates
- Complete CRUD operations for clients, properties, staff, and incidents