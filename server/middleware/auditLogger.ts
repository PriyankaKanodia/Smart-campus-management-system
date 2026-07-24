import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';

export interface AuditRecord {
  _id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: 'auth' | 'fees' | 'grades' | 'academics' | 'library' | 'users' | 'security' | 'chat';
  ipAddress: string;
  status: 'success' | 'warning' | 'failure';
  details: string;
  timestamp: string;
}

// In-memory store for audit logs (with default seed entries)
export const auditLogs: AuditRecord[] = [
  {
    _id: 'audit-001',
    userId: 'admin-1',
    userName: 'Campus Administrator',
    userRole: 'admin',
    action: 'SYSTEM_BOOT',
    module: 'security',
    ipAddress: '127.0.0.1',
    status: 'success',
    details: 'Security subsystems initialized with Helmet, Rate Limiting & AES-256 Encryption',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    _id: 'audit-002',
    userId: 'admin-1',
    userName: 'Campus Administrator',
    userRole: 'admin',
    action: '2FA_ENFORCED',
    module: 'auth',
    ipAddress: '127.0.0.1',
    status: 'success',
    details: 'Two-Factor Authentication policy enabled for administrative roles',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
];

export function logAuditAction(
  req: Request,
  action: string,
  module: AuditRecord['module'],
  status: 'success' | 'warning' | 'failure',
  details: string
) {
  const authReq = req as AuthenticatedRequest;
  const user = authReq.user;

  const record: AuditRecord = {
    _id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: user?.id || 'anonymous',
    userName: user?.email ? user.email.split('@')[0] : 'Guest User',
    userRole: user?.role || 'guest',
    action,
    module,
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
    status,
    details,
    timestamp: new Date().toISOString()
  };

  auditLogs.unshift(record);
  if (auditLogs.length > 500) {
    auditLogs.pop();
  }
}

// Express Middleware for automatic HTTP route auditing
export function auditMiddleware(module: AuditRecord['module'], actionName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      if (res.statusCode < 400) {
        logAuditAction(req, actionName, module, 'success', `HTTP ${req.method} ${req.originalUrl} returned ${res.statusCode}`);
      } else {
        logAuditAction(req, actionName, module, 'failure', `HTTP ${req.method} ${req.originalUrl} failed with status ${res.statusCode}`);
      }
    });
    next();
  };
}
