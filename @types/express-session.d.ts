import session from 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    passport?: {
      user: string;
    };
  }
}

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    };
  }
}