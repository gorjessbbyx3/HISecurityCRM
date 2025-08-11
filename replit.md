# Project Overview

This is a full-stack JavaScript application with Express backend and React frontend using Vite. The project includes authentication via Replit's OpenID Connect system and a PostgreSQL database setup.

## Project Architecture

### Backend
- Express.js server with TypeScript
- JWT-based authentication with bcrypt
- In-memory storage system (no database)
- WebSocket support for real-time updates

### Frontend
- React with TypeScript
- Vite for development and build
- Tailwind CSS for styling
- Shadcn/ui components
- React Hook Form for forms
- TanStack Query for data fetching
- Wouter for routing

### Storage
- Complete in-memory storage system
- No database dependencies
- Supports all CRUD operations for clients, properties, staff, incidents, reports

## Dependencies
- Authentication: jsonwebtoken, bcrypt
- Storage: In-memory maps with TypeScript types
- UI: @radix-ui components, tailwindcss, lucide-react
- Utils: uuid for ID generation

## User Preferences
- Remove all PostgreSQL integrations and use in-memory storage

## Recent Changes
- 2025-08-11: Successfully migrated from Replit Agent to standard Replit environment
- 2025-08-11: Fixed database setup - PostgreSQL database created and connected
- 2025-08-11: Configured SESSION_SECRET environment variable for authentication
- 2025-08-11: Fixed component export issues (Header/Sidebar components)
- 2025-08-11: Updated scheduling schema to use insertAppointmentSchema
- 2025-08-11: Server running successfully on port 5000 with all core functionality
- 2025-08-11: Migrated authentication from session-based to JWT/Supabase for Vercel compatibility
- 2025-08-11: Completed PostgreSQL removal - migrated to in-memory storage system
- 2025-08-11: Removed all Drizzle ORM and database dependencies
- 2025-08-11: Implemented JWT-based authentication with bcrypt password hashing
- 2025-08-10: Integrated live crime data from Honolulu Police Department API
- 2025-08-10: Added role-based access control and user management system
- 2025-08-10: Created admin user credentials (STREETPATROL808/Password3211)

## Migration Status
Migration completed successfully. All features functional including:
- User authentication with role-based access working
- Live crime data integration with Honolulu PD API confirmed working
- Comprehensive law reference system for guard card compliance populated
- Real-time WebSocket connections for live updates
- Complete CRUD operations for clients, properties, staff, and incidents
- Full navigation menu with all page routes connected
- Crime intelligence dashboard displaying real Honolulu PD data