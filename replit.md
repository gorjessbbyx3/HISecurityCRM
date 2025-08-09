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
- 2025-01-09: Migrating project from Replit Agent to Replit environment
- 2025-01-09: Installing missing dependencies (openid-client, memoizee, @types/memoizee)
- 2025-01-09: Fixed TypeScript errors in routes.ts
- 2025-01-09: Created database schema and pushed to PostgreSQL
- 2025-01-09: Generated SESSION_SECRET (pending user configuration)

## Migration Status
Currently migrating from Replit Agent to standard Replit environment. Progress tracked in `.local/state/replit/agent/progress_tracker.md`.