# Overview

Hawaii Security CRM is a comprehensive security management system designed for Hawaii-based crime watch and protection services. The application provides a centralized platform for managing clients, properties, patrol reports, crime intelligence, staff scheduling, and financial records. It features real-time dashboard analytics, incident tracking, community outreach resources, and Hawaii-specific law reference materials.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS styling
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom Hawaii Security theme colors (navy, gold, slate)

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured route handlers
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **Real-time Features**: WebSocket server for live updates

## Database Architecture
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Comprehensive schema covering users, clients, properties, incidents, patrol reports, appointments, financial records, and file uploads
- **Migrations**: Drizzle Kit for database migrations and schema management

## Authentication & Authorization
- **Provider**: Replit Auth with OIDC flow
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Role-based Access**: Support for admin, supervisor, and security_officer roles
- **Security**: HTTP-only cookies with secure flags for production

## Key Data Models
- **Users**: Staff members with roles, zones, shifts, and contact information
- **Clients**: Customer information with contact details and service agreements
- **Properties**: Managed properties with risk levels, addresses, and client associations
- **Incidents**: Crime and security incidents with priority levels and status tracking
- **Patrol Reports**: Daily patrol summaries with checkpoints, photos, and officer assignments
- **Financial Records**: Billing and payment tracking with client associations

## External Dependencies

- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Replit Authentication**: Integrated OIDC authentication service
- **Font Awesome**: Icon library for UI elements
- **Google Fonts**: Inter font family for typography
- **Unsplash**: Placeholder images for evidence gallery and property photos