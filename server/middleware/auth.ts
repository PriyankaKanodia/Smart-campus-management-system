import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'super-refresh-secret-key-change-in-production';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'admin' | 'faculty' | 'student';
    email: string;
  };
}

// Authentication Middleware
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: 'admin' | 'faculty' | 'student'; email: string };
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.', code: 'TOKEN_EXPIRED' });
  }
}

// Role Authorization Middleware
export function authorizeRoles(...allowedRoles: ('admin' | 'faculty' | 'student')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      res.status(401).json({ message: 'Unauthorized. Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ message: `Access denied. Requires one of the roles: ${allowedRoles.join(', ')}` });
      return;
    }

    next();
  };
}

// Helper to sign Access JWTs
export function generateToken(payload: { id: string; role: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

// Helper to sign Refresh JWTs
export function generateRefreshToken(payload: { id: string; role: string; email: string }): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

// Helper to verify Refresh Token
export function verifyRefreshToken(token: string): { id: string; role: 'admin' | 'faculty' | 'student'; email: string } {
  return jwt.verify(token, REFRESH_SECRET) as { id: string; role: 'admin' | 'faculty' | 'student'; email: string };
}

