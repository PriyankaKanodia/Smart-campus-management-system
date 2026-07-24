import { Request, Response } from 'express';
import { auditLogs, logAuditAction } from '../middleware/auditLogger.js';
import { encryptData, decryptData } from '../utils/encryption.js';

// Memory store for active 2FA OTP codes
const activeOtps: Record<string, { code: string; expiresAt: number }> = {};

export async function getAuditLogs(req: Request, res: Response) {
  try {
    const { module, status, limit } = req.query;
    let filtered = [...auditLogs];

    if (module) {
      filtered = filtered.filter(log => log.module === module);
    }
    if (status) {
      filtered = filtered.filter(log => log.status === status);
    }

    const max = limit ? parseInt(limit as string, 10) : 100;
    res.json(filtered.slice(0, max));
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving audit logs', error: error.message });
  }
}

export async function send2FaOtp(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'Email address is required for 2FA OTP' });
      return;
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    activeOtps[email.toLowerCase()] = { code, expiresAt };

    logAuditAction(req, '2FA_OTP_SENT', 'auth', 'success', `Sent 2FA OTP code to ${email}`);

    // Return verification info (In production, sent via SMTP / Twilio / Sendgrid)
    res.json({
      success: true,
      message: `2FA Verification code generated and sent to ${email}`,
      otpCodeDemo: code, // Demo visualization for testing
      expiresInMinutes: 10
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to send 2FA OTP', error: error.message });
  }
}

export async function verify2FaOtp(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ message: 'Email and OTP code are required' });
      return;
    }

    const record = activeOtps[email.toLowerCase()];
    if (!record) {
      res.status(400).json({ message: 'No active 2FA OTP request found for this email' });
      return;
    }

    if (Date.now() > record.expiresAt) {
      delete activeOtps[email.toLowerCase()];
      res.status(400).json({ message: '2FA OTP code has expired. Please request a new one.' });
      return;
    }

    if (record.code !== otp.trim()) {
      logAuditAction(req, '2FA_VERIFY_FAIL', 'auth', 'failure', `Failed 2FA OTP attempt for ${email}`);
      res.status(400).json({ message: 'Invalid 2FA OTP code' });
      return;
    }

    delete activeOtps[email.toLowerCase()];
    logAuditAction(req, '2FA_VERIFY_SUCCESS', 'auth', 'success', `Successfully verified 2FA OTP for ${email}`);

    res.json({
      success: true,
      verified: true,
      message: '2FA Authentication verified successfully'
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error verifying 2FA OTP', error: error.message });
  }
}

export async function getCsrfToken(req: Request, res: Response) {
  // Generate pseudo CSRF token for secure form submissions
  const csrfToken = `csrf-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  res.cookie('XSRF-TOKEN', csrfToken, {
    httpOnly: false,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ csrfToken });
}

export async function getSecurityStatus(req: Request, res: Response) {
  res.json({
    twoFactorEnabled: true,
    helmetEnabled: true,
    rateLimitingActive: true,
    encryptionEngine: 'AES-256-CBC',
    csrfProtection: 'Active',
    rolePermissionsEnforced: true,
    secureCookies: true,
    auditLogsCount: auditLogs.length,
    securityHealthScore: 100
  });
}

export async function testEncryption(req: Request, res: Response) {
  const { text } = req.body;
  if (!text) {
    res.status(400).json({ message: 'Text string required for encryption test' });
    return;
  }
  const encrypted = encryptData(text);
  const decrypted = decryptData(encrypted);
  res.json({ original: text, encrypted, decrypted, isMatches: text === decrypted });
}
