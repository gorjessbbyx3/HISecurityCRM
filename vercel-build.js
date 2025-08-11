#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

console.log('🚀 Building for Vercel deployment...');

// Build client
console.log('📦 Building client...');
execSync('vite build', { stdio: 'inherit' });

// Build server
console.log('🔧 Building server...');
execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });

// Ensure dist directory exists
const distPath = path.join(process.cwd(), 'dist');
if (!existsSync(distPath)) {
  mkdirSync(distPath, { recursive: true });
}

console.log('✅ Build completed successfully!');
