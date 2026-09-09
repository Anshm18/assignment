import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import type { AuthRequest } from '../types';

const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({ status: 'fail', message: 'User no longer exists' });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json({ status: 'fail', message: 'Invalid token' });
  }
};

export default protect;