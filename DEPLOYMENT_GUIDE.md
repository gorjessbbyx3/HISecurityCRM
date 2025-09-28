# Hawaii Security CRM - Complete Deployment Guide

## Overview
This guide covers multiple deployment options for the Hawaii Security CRM system, including Vercel, Docker, Railway, and traditional server deployment.

## Prerequisites
- Node.js 20+ 
- Supabase account with project setup
- Git repository with project code

## Environment Variables Setup

### Required Variables
```bash
# Core Application
NODE_ENV=production
SESSION_SECRET=your-secure-random-string-min-32-chars
PORT=3000

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://user:password@host:5432/database

# Optional Enhancements
REDIS_URL=redis://localhost:6379  # For session storage
SENDGRID_API_KEY=your-sendgrid-key  # For email notifications
```

### Environment File Templates

#### .env.production
```bash
# Production Environment
NODE_ENV=production
SESSION_SECRET=your-production-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://user:password@host:5432/database
```

#### .env.development
```bash
# Development Environment
NODE_ENV=development
SESSION_SECRET=your-development-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://user:password@host:5432/database
```

## Deployment Options

### 1. Vercel Deployment (Recommended for Frontend-Heavy Apps)

#### Quick Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Manual Configuration
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set environment variables in project settings
4. Deploy with automatic GitHub integration

#### Vercel Configuration Files
- `vercel.json` - Main configuration
- `api/index.ts` - Serverless function entry
- `vercel-build.js` - Custom build script

### 2. Docker Deployment (Recommended for Full Control)

#### Using Docker Compose
```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in background
docker-compose up -d
```

#### Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - redis
    volumes:
      - ./uploads:/app/uploads

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### 3. Railway Deployment (Simple & Scalable)

#### Deploy via CLI
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

#### Deploy via Dashboard
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect GitHub repository
4. Add environment variables
5. Deploy

### 4. Traditional Server Deployment (VPS/Dedicated)

#### Ubuntu/Debian Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm i -g pm2

# Clone repository
git clone https://github.com/your-org/hawaii-security-crm.git
cd hawaii-security-crm

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Start with PM2
pm2 start npm --name "hawaii-crm" -- start
pm2 save
pm2 startup
```

#### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Database Setup & Migration

### Supabase Setup
1. Create new Supabase project
2. Run SQL schema from `supabase-schema.sql`
3. Configure RLS policies
4. Set up database webhooks if needed

### Migration Commands
```bash
# Reset database
npm run db:reset

# Push schema changes
npm run db:push

# Generate migration
npm run db:generate
```

## Build & Test Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
```

### Testing
```bash
npm run test        # Run test suite
npm run test:watch  # Watch mode testing
npm run lint        # Code linting
```

### Database
```bash
npm run db:reset    # Reset database
npm run db:push     # Push schema changes
npm run db:studio   # Database studio
```

## Health Checks & Monitoring

### Application Health Endpoint
```bash
# Check if app is running
curl http://localhost:3000/health

# Expected response
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### PM2 Monitoring
```bash
# Monitor application
pm2 monit

# View logs
pm2 logs hawaii-crm

# Restart application
pm2 restart hawaii-crm
```

## Security Considerations

### SSL Certificate (Let's Encrypt)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Security Headers
Add these to your reverse proxy:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## Troubleshooting

### Common Issues & Solutions

#### Build Failures
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run check
```

#### Database Connection Issues
```bash
# Test database connection
npx supabase status

# Reset connection pool
npm run db:reset
```

#### Memory Issues
```bash
# Check memory usage
free -h

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Log Locations
- **Application logs**: Check PM2 logs with `pm2 logs`
- **Nginx logs**: `/var/log/nginx/`
- **System logs**: `journalctl -u your-app-name`

## Performance Optimization

### Production Optimizations
```bash
# Enable gzip compression
npm install compression

# Use production build
NODE_ENV=production npm start

# Enable caching
npm install redis
```

### CDN Setup
- Use Cloudflare for static assets
- Configure asset caching headers
- Enable Brotli compression

## Backup & Recovery

### Database Backup
```bash
# Supabase backup
supabase db dump --local > backup.sql

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
```

### Application Backup
```bash
# Create application backup
tar -czf backup_$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  .
```

## Support & Resources

- **Documentation**: Check README.md for detailed setup
- **Issues**: Report bugs on GitHub issues
- **Discord**: Join our community Discord for support
- **Email**: Contact support@hawaiisecurity.com
