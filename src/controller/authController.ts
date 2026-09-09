import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const signToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Registeration of user started');
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ status: 'fail', message: 'Please provide name, email, and password' });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id.toString() as string);

    console.log('User registered successfully');

    res.status(201).json({
      status: 'success',
      token,
      data: { user: { id: user._id, name: user.name, email: user.email } }
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ status: 'fail', message: 'Email already exists' });
    }
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Login process started');
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
    }

    console.log('User logged in successfully');

    res.status(200).json({ status: 'success', token: signToken(user._id.toString() as string) });
  } catch (err) {
    next(err);
  }
};