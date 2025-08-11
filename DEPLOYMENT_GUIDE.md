# Vercel Deployment Guide for Hawaii Security CRM

## Quick Start

### 1. Environment Variables
Set these environment variables in Vercel dashboard:

```bash
# Required
NODE_ENV=production
SESSION_SECRET=your-secret-key
DATABASE_URL=your-supabase-url
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key

# Optional
PORT=3000
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option B: GitHub Integration
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Set environment variables
4. Deploy

### 3. Manual Build Test
```bash
# Test build locally
npm run build
npm start
```

## Configuration Files

### vercel.json
- Main Vercel configuration
- Routes all requests to server/index.ts
- Sets up Node.js runtime

### api/index.ts
- Vercel serverless function entry point
- Configured for Vercel's serverless environment

### vercel-build.js
- Custom build script for Vercel
- Builds both client and server

## Troubleshooting

### Common Issues

1. **TypeScript Errors**
   - Ensure all dependencies are installed
   - Check tsconfig.json includes proper types

2. **Build Failures**
   - Check environment variables are set
   - Verify all imports are correct

3. **Runtime Errors**
   - Check server logs in Vercel dashboard
   - Verify database connections

### Build Commands
- **Development**: `npm run dev`
- **Production Build**: `npm run build`
- **Start**: `npm start`

## Project Structure for Vercel

```
├── api/
│   └── index.ts          # Serverless function
├── client/               # Frontend
├── server/               # Backend
├── dist/                 # Build output
├── vercel.json           # Vercel config
├── vercel-build.js       # Build script
└── package.json          # Dependencies
