# Hawaii Security CRM - Project Requirements

## System Overview
Hawaii Security CRM is a comprehensive security management system designed for crime intelligence, patrol management, and client tracking in Hawaii.

## Technical Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Credential-based login system
- **Session Management**: express-session with PostgreSQL store
- **Real-time**: WebSocket support for live updates

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query
- **Routing**: Wouter

### Database Schema
- **users**: Staff authentication and management
- **clients**: Customer information and contracts
- **properties**: Location and security details
- **incidents**: Crime reporting and tracking
- **patrol_reports**: Daily patrol documentation
- **appointments**: Scheduling and meetings
- **activities**: System audit logs
- **financial_records**: Accounting and expenses
- **file_uploads**: Document management
- **sessions**: Authentication sessions

## Core Features
1. **Crime Intelligence & Mapping** - Real-time incident tracking and analysis
2. **Patrol Management** - Staff scheduling and route optimization
3. **Client & Property Database** - Comprehensive customer management
4. **Hawaii Law Reference** - Quick access to relevant regulations
5. **Community Outreach** - Social services and assistance programs
6. **Smart Accounting** - Financial tracking with tax categorization
7. **Real-time Activity Feed** - Live system updates
8. **Mobile-responsive Design** - Works on all devices

## Authentication
- **Method**: Username/Password credentials
- **Default Admin**: STREETPATROL808 / Password3211
- **Security**: Session-based with PostgreSQL storage
- **Encryption**: All sessions encrypted with SESSION_SECRET

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `PORT`: Server port (default: 5000)

## Development Setup
1. Install Node.js dependencies
2. Configure PostgreSQL database
3. Set environment variables
4. Run database migrations
5. Start development server

## Deployment Requirements
- PostgreSQL database instance
- Node.js 20+ runtime environment
- Environment variables configured
- HTTPS enabled for production

## Security Features
- Encrypted session storage
- SQL injection protection via Drizzle ORM
- Input validation with Zod schemas
- Secure authentication flow
- Activity logging for audit trails