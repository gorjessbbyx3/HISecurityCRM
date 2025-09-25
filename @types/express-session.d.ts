
import { User } from '../server/memoryStorage';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: "admin" | "officer" | "supervisor";
        firstName?: string;
        lastName?: string;
        email?: string;
      };
    }
  }
}
