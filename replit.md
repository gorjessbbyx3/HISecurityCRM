# Project Overview

This is a full-stack JavaScript application with Express backend and React frontend using Vite. The project includes authentication via Replit's OpenID Connect system and a PostgreSQL database setup.

## Project Architecture

### Backend
- Express.js server with TypeScript
- JWT-based authentication with bcrypt
- Supabase integration for data persistence
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
- Supabase PostgreSQL database
- Real-time subscriptions support
- Supports all CRUD operations for clients, properties, staff, incidents, reports

## Dependencies
- Authentication: jsonwebtoken, bcrypt
- Database: @supabase/supabase-js
- UI: @radix-ui components, tailwindcss, lucide-react
- Utils: uuid for ID generation

## User Preferences
- Migrate authentication to Supabase for better deployment compatibility

## Recent Changes
- 2025-08-14: ✅ MIGRATION COMPLETE - Successfully migrated from Replit Agent to standard Replit environment
- 2025-08-14: All packages installed and workflow configured properly
- 2025-08-14: Server running successfully on port 5000 with authentication working
- 2025-08-14: Frontend loading correctly with Vite dev server configuration
- 2025-08-11: DEPLOYMENT READY - Fixed all TypeScript compilation and deployment errors
- 2025-08-11: Resolved Express Request type extension issues for deployment compatibility
- 2025-08-11: Fixed Tailwind CSS compilation errors (bg-green-500/20, status classes)
- 2025-08-11: Updated FinancialRecord interface with required 'type' property
- 2025-08-11: Fixed AI service initialization (groq property can be null)
- 2025-08-11: Added proper type declarations for Express Request extensions
- 2025-08-11: Updated TypeScript configuration for better deployment support
- 2025-08-11: Successfully migrated from Replit Agent to standard Replit environment
- 2025-08-11: Fixed database setup - PostgreSQL database created and connected
- 2025-08-11: Configured SESSION_SECRET environment variable for authentication
- 2025-08-11: Fixed component export issues (Header/Sidebar components)
- 2025-08-11: Updated scheduling schema to use insertAppointmentSchema
- 2025-08-11: Server running successfully on port 5000 with all core functionality
- 2025-08-11: Migrated authentication from session-based to JWT/Supabase for Vercel compatibility
- 2025-08-11: Completed Supabase migration - switched from in-memory to Supabase storage
- 2025-08-11: Implemented Supabase authentication with JWT tokens
- 2025-08-11: Configured Supabase environment secrets and connection
- 2025-08-10: Integrated live crime data from Honolulu Police Department API
- 2025-08-10: Added role-based access control and user management system
- 2025-08-10: Created admin user credentials (STREETPATROL808/Password3211)

## Deployment Status
✅ FULLY DEPLOYMENT READY - All errors resolved!

Migration and deployment fixes completed successfully:
- ✅ ALL TypeScript compilation errors fixed (0 diagnostics)  
- ✅ Express Request type extensions properly declared
- ✅ Tailwind CSS compilation working correctly
- ✅ All interface properties properly defined
- ✅ AI service initialization handling null states
- ✅ Server running successfully on port 5000
- ✅ User authentication with role-based access working
- ✅ Live crime data integration with Honolulu PD API confirmed working
- ✅ Comprehensive law reference system for guard card compliance populated
- ✅ Real-time WebSocket connections for live updates
- ✅ Complete CRUD operations for clients, properties, staff, and incidents
- ✅ Full navigation menu with all page routes connected
- ✅ Crime intelligence dashboard displaying real Honolulu PD data

Application ready for production deployment on Vercel or other platforms.