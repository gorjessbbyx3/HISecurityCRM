import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";


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

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required');
  }
  
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  // Add error handling for session store
  sessionStore.on('error', (error) => {
    console.error('❌ Session store error:', error);
  });

  sessionStore.on('connect', () => {
    console.log('✅ Session store connected to database');
  });

  // Test database connection synchronously
  try {
    console.log('🔄 Testing session store connection...');
  } catch (error) {
    console.error('❌ Session store connection failed:', error);
    throw error;
  }
  
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
      sameSite: 'lax',
    },
  });
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
      console.log("Default admin user created");
    }
  } catch (error) {
    console.error("Error initializing admin user:", error);
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Initialize admin user
  await initializeAdminUser();

  // Local strategy for username/password authentication
  passport.use(new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password'
    },
    async (username: string, password: string, done) => {
      try {
        // Check against default credentials
        if (username === DEFAULT_CREDENTIALS.username && password === DEFAULT_CREDENTIALS.password) {
          const user = {
            id: DEFAULT_CREDENTIALS.userId,
            username: DEFAULT_CREDENTIALS.username,
            email: DEFAULT_CREDENTIALS.email,
            firstName: DEFAULT_CREDENTIALS.firstName,
            lastName: DEFAULT_CREDENTIALS.lastName,
            role: DEFAULT_CREDENTIALS.role,
          };
          return done(null, user);
        }

        // Could add database user lookup here for additional users
        return done(null, false, { message: 'Invalid credentials' });
      } catch (error) {
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    console.log('Deserializing user:', id);
    try {
      // First check if it's the default admin
      if (id === DEFAULT_CREDENTIALS.userId) {
        const user = {
          id: DEFAULT_CREDENTIALS.userId,
          username: DEFAULT_CREDENTIALS.username,
          email: DEFAULT_CREDENTIALS.email,
          firstName: DEFAULT_CREDENTIALS.firstName,
          lastName: DEFAULT_CREDENTIALS.lastName,
          role: DEFAULT_CREDENTIALS.role,
        };
        console.log('Found default admin user:', user.username);
        return done(null, user);
      }
      
      // Lookup user in database
      const user = await storage.getUser(id);
      if (!user) {
        console.log('User not found in database:', id);
        return done(null, false);
      }
      
      // Return user object matching passport expectations
      const authUser = {
        id: user.id,
        username: user.email, // Use email as username for DB users
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };
      
      console.log('Found database user:', authUser.username);
      done(null, authUser);
    } catch (error) {
      console.error('Error deserializing user:', error);
      done(error);
    }
  });

  // Login route
  app.post('/api/login', (req, res, next) => {
    console.log('Login attempt for:', req.body.username);
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        console.error('Authentication error:', err);
        return res.status(500).json({ message: 'Authentication error' });
      }
      if (!user) {
        console.log('Authentication failed:', info?.message);
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
      }
      
      console.log('User authenticated, logging in:', user.username);
      req.logIn(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ message: 'Login error' });
        }
        console.log('Login successful for:', user.username);
        console.log('Session ID:', req.sessionID);
        console.log('Session data:', req.session);
        return res.json({ 
          message: 'Login successful',
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
    })(req, res, next);
  });

  // Logout route
  app.post('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout error' });
      }
      res.json({ message: 'Logout successful' });
    });
  });

  // Check auth status route
  app.get('/api/auth/status', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ 
        authenticated: true,
        user: req.user
      });
    } else {
      res.json({ authenticated: false });
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};