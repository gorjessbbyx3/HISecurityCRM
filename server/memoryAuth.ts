import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import type { Express, RequestHandler } from "express";
import { storage } from "./memoryStorage";

// JWT secret - using SUPABASE_JWT_SECRET as primary, with fallbacks for compatibility
const jwtSecret = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || process.env.SESSION_SECRET;

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
export async function loginHandler(credentials: { username: string; password: string }, storage?: any) {
  const { username, password } = credentials;
  try {
    console.log('🔐 Attempting login for:', username);
    console.log('🔐 Credentials received:', { username: username, passwordLength: password?.length });

    if (!username || !password) {
      console.log('❌ Missing username or password');
      return { success: false, message: 'Username and password are required' };
    }

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
  // Auth status route
  app.get('/api/auth/status', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.json({ authenticated: false });
    }

    if (!jwtSecret) {
      return res.json({ authenticated: false });
    }

    jwt.verify(token, jwtSecret, (err: any, user: any) => {
      if (err) {
        return res.json({ authenticated: false });
      }
      res.json({ 
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    });
  });

  // Login route
  app.post('/api/auth/login', async (req, res) => {
    try {
      console.log('Login attempt with body:', req.body);
      console.log('Content-Type:', req.headers['content-type']);

      let username, password;

      // Handle different content types
      if (typeof req.body === 'string') {
        try {
          const parsed = JSON.parse(req.body);
          username = parsed.username;
          password = parsed.password;
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          return res.status(400).json({ message: 'Invalid JSON format' });
        }
      } else if (typeof req.body === 'object') {
        username = req.body.username;
        password = req.body.password;
      } else {
        return res.status(400).json({ message: 'Invalid request format' });
      }

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }

      const result = await loginHandler({ username, password });

      if (result.success) {
        res.json(result);
      } else {
        res.status(401).json({ message: result.message });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Auth status route
  app.get('/api/auth/status', authenticateToken, (req, res) => {
    res.json({
      authenticated: true,
      user: req.user
    });
  });

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logout successful' });
  });

  console.log("✅ Memory-based JWT authentication configured");
}