import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import type { Express, RequestHandler } from "express";
import { storage } from "./memoryStorage";

// JWT secret - using SESSION_SECRET as fallback for compatibility
const jwtSecret = process.env.JWT_SECRET || process.env.SESSION_SECRET;

if (!jwtSecret) {
  console.error('❌ JWT_SECRET is missing. Please set JWT_SECRET environment variable');
}

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
    console.log('🔐 Attempting login for:', username);
    
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
      console.log('✅ Default admin login successful');
      return { success: true, token, user };
    }

    // Try to find user in storage and verify password
    const users = await storage.getStaffMembers();
    for (const user of users) {
      if ((user.email === username || user.firstName + user.lastName === username) && user.hashedPassword) {
        const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
        if (isValidPassword) {
          const userForToken = {
            id: user.id,
            username: user.email || `${user.firstName}${user.lastName}`,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          };
          
          const token = generateToken(userForToken);
          console.log('✅ Database user login successful:', username);
          return { success: true, token, user: userForToken };
        }
      }
    }
    
    console.log('❌ Invalid credentials for:', username);
    return { success: false, message: 'Invalid credentials' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed' };
  }
}

export async function setupMemoryAuth(app: Express) {
  console.log("✅ Memory-based JWT authentication configured");
}