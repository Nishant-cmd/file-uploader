import { User as PrismaUser } from '../../generated/prisma/client';
import 'express-session';

declare global {
  namespace Express {
    interface User extends PrismaUser {}
  }
}

declare module 'express-session' {
  interface SessionData {
    messages: string[];
  }
}

export {};
