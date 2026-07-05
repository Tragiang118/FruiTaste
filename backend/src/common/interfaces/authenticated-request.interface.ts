import { Request } from 'express';
import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  id: number;
  userId?: number;
  email: string;
  role: Role;
  fullName?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
