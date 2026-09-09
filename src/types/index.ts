import type { Request } from 'express';
import type { IUser } from '../models/User';
import type { HydratedDocument } from 'mongoose';

// Extend Express Request to include our authenticated user
export interface AuthRequest extends Request {
  user?: HydratedDocument<IUser>;
}