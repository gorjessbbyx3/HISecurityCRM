import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const jwtSecret = process.env.JWT_SECRET || process.env.SESSION_SECRET;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

if (!jwtSecret) {
  console.error('❌ JWT_SECRET is missing. Please set JWT_SECRET environment variable');
}

export const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Default admin credentials
const DEFAULT_CREDENTIALS = {
  username: "STREETPATROL808",
  password: "Password3211",
  userId: "admin-001",
  email: "admin@hawaiisecurity.com",
  firstName: "Admin",
  lastName: "User",
  role: "admin"
};

// Middleware to verify JWT token
export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  if (!jwtSecret) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  jwt.verify(token, jwtSecret, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Optional middleware - doesn't fail if no token provided
export const optionalAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  if (!jwtSecret) {
    req.user = null;
    return next();
  }

  jwt.verify(token, jwtSecret, (err: any, user: any) => {
    req.user = err ? null : user;
    next();
  });
};

// Generate JWT token for user
export function generateToken(user: any): string {
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }
  
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName
    },
    jwtSecret,
    { expiresIn: '7d' }
  );
}

// Login handler
export async function loginHandler(username: string, password: string) {
  try {
    // Check against default credentials first
    if (username === DEFAULT_CREDENTIALS.username && password === DEFAULT_CREDENTIALS.password) {
      const user = {
        id: DEFAULT_CREDENTIALS.userId,
        username: DEFAULT_CREDENTIALS.username,
        email: DEFAULT_CREDENTIALS.email,
        firstName: DEFAULT_CREDENTIALS.firstName,
        lastName: DEFAULT_CREDENTIALS.lastName,
        role: DEFAULT_CREDENTIALS.role,
      };
      
      const token = generateToken(user);
      return { success: true, token, user };
    }

    // If Supabase is configured, you could add additional user lookup here
    // For now, just handle the default admin
    
    return { success: false, message: 'Invalid credentials' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed' };
  }
}

// Initialize default admin user
async function initializeAdminUser() {
  try {
    const existingUser = await storage.getUser(DEFAULT_CREDENTIALS.userId);
    if (!existingUser) {
      await storage.upsertUser({
        id: DEFAULT_CREDENTIALS.userId,
        email: DEFAULT_CREDENTIALS.email,
        firstName: DEFAULT_CREDENTIALS.firstName,
        lastName: DEFAULT_CREDENTIALS.lastName,
        role: DEFAULT_CREDENTIALS.role,
        status: "active",
      });
      console.log("✅ Default admin user created");
    }
  } catch (error) {
    console.error("❌ Error initializing admin user:", error);
  }
}

export async function setupSupabaseAuth(app: Express) {
  // Initialize admin user
  await initializeAdminUser();
  
  console.log("✅ Supabase authentication configured");
}