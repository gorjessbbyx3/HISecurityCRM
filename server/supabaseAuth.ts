import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import type { Express, RequestHandler } from "express";
import { supabase } from "./supabaseStorage";

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
export async function loginHandler(credentials: { username: string; password: string } | string, passwordParam?: string) {
  try {
    // Handle both object and string parameter formats
    const username = typeof credentials === 'string' ? credentials : credentials.username;
    const password = typeof credentials === 'string' ? passwordParam! : credentials.password;
    
    console.log('🔐 Attempting Supabase login for:', username);
    
    // Check against default credentials first
    if (username === DEFAULT_CREDENTIALS.username && password === DEFAULT_CREDENTIALS.password) {
      // Try to get or create the default admin user in Supabase
      let user = await supabase
        .from('users')
        .select('*')
        .eq('id', DEFAULT_CREDENTIALS.userId)
        .single();

      if (user.error) {
        // Create default admin user in Supabase
        const hashedPassword = await bcrypt.hash(DEFAULT_CREDENTIALS.password, 10);
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: DEFAULT_CREDENTIALS.userId,
            email: DEFAULT_CREDENTIALS.email,
            firstName: DEFAULT_CREDENTIALS.firstName,
            lastName: DEFAULT_CREDENTIALS.lastName,
            role: DEFAULT_CREDENTIALS.role,
            status: 'active',
            hashedPassword,
            permissions: ['all'],
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .select()
          .single();

        if (createError) {
          console.error('Failed to create default admin user:', createError);
        } else {
          user.data = newUser;
        }
      }

      const userForToken = {
        id: DEFAULT_CREDENTIALS.userId,
        username: DEFAULT_CREDENTIALS.username,
        email: DEFAULT_CREDENTIALS.email,
        firstName: DEFAULT_CREDENTIALS.firstName,
        lastName: DEFAULT_CREDENTIALS.lastName,
        role: DEFAULT_CREDENTIALS.role,
      };
      
      const token = generateToken(userForToken);
      console.log('✅ Default admin login successful');
      return { success: true, token, user: userForToken };
    }

    // Try to find user in Supabase and verify password
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${username},firstName.eq.${username.split(' ')[0] || username}`);

    if (!error && users && users.length > 0) {
      for (const user of users) {
        if (user.hashedPassword) {
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
            console.log('✅ Supabase user login successful:', username);
            return { success: true, token, user: userForToken };
          }
        }
      }
    }
    
    console.log('❌ Invalid credentials for:', username);
    return { success: false, message: 'Invalid credentials' };
  } catch (error) {
    console.error('Supabase login error:', error);
    return { success: false, message: 'Login failed' };
  }
}

export async function setupSupabaseAuth(app: Express) {
  // Test Supabase connection
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Supabase connection failed:', error);
    } else {
      console.log('✅ Supabase connection successful');
    }
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
  }
  
  console.log("✅ Supabase JWT authentication configured");
}