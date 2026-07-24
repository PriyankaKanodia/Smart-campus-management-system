import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbAdapter } from '../config/dbAdapter.js';
import { generateToken, generateRefreshToken, verifyRefreshToken, AuthenticatedRequest } from '../middleware/auth.js';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    res.status(400).json({ message: 'Email, password, and role are required.' });
    return;
  }

  try {
    let collection: 'admins' | 'faculty' | 'students';
    if (role === 'admin') collection = 'admins';
    else if (role === 'faculty') collection = 'faculty';
    else if (role === 'student') collection = 'students';
    else {
      res.status(400).json({ message: 'Invalid role specified.' });
      return;
    }

    const user: any = await dbAdapter.findOne(collection, { email });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    // Check account lockout
    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      const remainingMins = Math.ceil((new Date(user.lockUntil).getTime() - Date.now()) / 60000);
      res.status(403).json({ 
        message: `Account temporarily locked due to 5 consecutive failed attempts. Try again in ${remainingMins} minute(s).` 
      });
      return;
    }

    // Compare passwords with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    
    // Client IP and user agent for history tracking
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    if (!isMatch) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      let lockUntil = null;
      if (attempts >= 5) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // Lock for 15 minutes
      }

      // Record failed attempt in history
      const history = user.loginHistory || [];
      history.unshift({
        timestamp: new Date().toISOString(),
        ip: clientIp,
        userAgent,
        status: 'FAILED'
      });

      await dbAdapter.update(collection, user._id, {
        failedLoginAttempts: attempts >= 5 ? 0 : attempts,
        lockUntil,
        loginHistory: history.slice(0, 20) // Keep last 20 entries
      });

      if (lockUntil) {
        res.status(403).json({ message: 'Account locked due to 5 failed login attempts. Try again in 15 minutes.' });
      } else {
        res.status(401).json({ message: `Invalid credentials. ${5 - attempts} attempt(s) remaining.` });
      }
      return;
    }

    // Login successful: Reset failed attempts, generate JWTs
    const token = generateToken({
      id: user._id,
      role: user.role || role,
      email: user.email
    });

    const refreshToken = generateRefreshToken({
      id: user._id,
      role: user.role || role,
      email: user.email
    });

    // Record successful login in history
    const history = user.loginHistory || [];
    history.unshift({
      timestamp: new Date().toISOString(),
      ip: clientIp,
      userAgent,
      status: 'SUCCESS'
    });

    await dbAdapter.update(collection, user._id, {
      failedLoginAttempts: 0,
      lockUntil: null,
      lastLoginAt: new Date().toISOString(),
      loginHistory: history.slice(0, 20)
    });

    // Strip password out
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful!',
      token,
      refreshToken,
      user: userWithoutPassword
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  const { refreshToken: token } = req.body;

  if (!token) {
    res.status(400).json({ message: 'Refresh token is required.' });
    return;
  }

  try {
    const decoded = verifyRefreshToken(token);
    const newToken = generateToken({
      id: decoded.id,
      role: decoded.role,
      email: decoded.email
    });
    const newRefreshToken = generateRefreshToken({
      id: decoded.id,
      role: decoded.role,
      email: decoded.email
    });

    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error: any) {
    res.status(401).json({ message: 'Invalid or expired refresh token.' });
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const decoded = (req as AuthenticatedRequest).user;
  if (!decoded) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  try {
    let user: any = null;
    if (decoded.role === 'admin') {
      user = await dbAdapter.findById('admins', decoded.id);
    } else if (decoded.role === 'faculty') {
      user = await dbAdapter.findById('faculty', decoded.id);
    } else if (decoded.role === 'student') {
      user = await dbAdapter.findById('students', decoded.id);
    }

    if (!user) {
      res.status(404).json({ message: 'User profile not found.' });
      return;
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error fetching user profile.', error: error.message });
  }
}

export async function registerAdmin(req: Request, res: Response): Promise<void> {
  const { name, email, password, employeeId } = req.body;

  if (!name || !email || !password || !employeeId) {
    res.status(400).json({ message: 'All fields (name, email, password, employeeId) are required.' });
    return;
  }

  try {
    const existing = await dbAdapter.findOne('admins', { email });
    if (existing) {
      res.status(400).json({ message: 'An admin with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await dbAdapter.create('admins', {
      name,
      email,
      password: hashedPassword,
      employeeId,
      role: 'admin',
      isEmailVerified: true,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Admin registered successfully!',
      adminId: (newAdmin as any)._id
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error registering admin.', error: error.message });
  }
}

export async function sendEmailVerification(req: Request, res: Response): Promise<void> {
  const { email, role } = req.body;

  if (!email || !role) {
    res.status(400).json({ message: 'Email and role are required.' });
    return;
  }

  try {
    let collection: 'admins' | 'faculty' | 'students';
    if (role === 'admin') collection = 'admins';
    else if (role === 'faculty') collection = 'faculty';
    else if (role === 'student') collection = 'students';
    else {
      res.status(400).json({ message: 'Invalid role.' });
      return;
    }

    const user: any = await dbAdapter.findOne(collection, { email });
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    await dbAdapter.update(collection, user._id, {
      verificationCode,
      verificationCodeExpires: expiry
    });

    console.log(`✉️ [EMAIL VERIFICATION] Sent to: ${email}, Code: ${verificationCode}`);

    res.json({
      message: 'Email verification code sent successfully!',
      verificationCode, // Included for development/testing sandbox
      email
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error sending verification email.', error: error.message });
  }
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const { email, role, code } = req.body;

  if (!email || !role || !code) {
    res.status(400).json({ message: 'Email, role, and verification code are required.' });
    return;
  }

  try {
    let collection: 'admins' | 'faculty' | 'students';
    if (role === 'admin') collection = 'admins';
    else if (role === 'faculty') collection = 'faculty';
    else if (role === 'student') collection = 'students';
    else {
      res.status(400).json({ message: 'Invalid role.' });
      return;
    }

    const user: any = await dbAdapter.findOne(collection, { email });
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      res.status(400).json({ message: 'Invalid verification code.' });
      return;
    }

    if (new Date(user.verificationCodeExpires) < new Date()) {
      res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
      return;
    }

    await dbAdapter.update(collection, user._id, {
      isEmailVerified: true,
      verificationCode: null,
      verificationCodeExpires: null
    });

    res.json({ message: 'Email address verified successfully!' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error verifying email.', error: error.message });
  }
}

export async function getLoginHistory(req: Request, res: Response): Promise<void> {
  const decoded = (req as AuthenticatedRequest).user;
  if (!decoded) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  try {
    let collection: 'admins' | 'faculty' | 'students';
    if (decoded.role === 'admin') collection = 'admins';
    else if (decoded.role === 'faculty') collection = 'faculty';
    else collection = 'students';

    const user: any = await dbAdapter.findById(collection, decoded.id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.json(user.loginHistory || []);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching login history.', error: error.message });
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email, role } = req.body;

  if (!email || !role) {
    res.status(400).json({ message: 'Email and role are required.' });
    return;
  }

  try {
    let collection: 'admins' | 'faculty' | 'students';
    if (role === 'admin') collection = 'admins';
    else if (role === 'faculty') collection = 'faculty';
    else if (role === 'student') collection = 'students';
    else {
      res.status(400).json({ message: 'Invalid role.' });
      return;
    }

    const user: any = await dbAdapter.findOne(collection, { email });
    if (!user) {
      res.status(404).json({ message: 'No registered user found with this email address.' });
      return;
    }

    // Generate a secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await dbAdapter.update(collection, user._id, {
      resetToken: otp,
      resetTokenExpires: expiry
    });

    console.log(`🔑 [PASSWORD RESET] Email: ${email}, Role: ${role}, OTP: ${otp}`);

    res.json({
      message: 'Password reset OTP generated successfully!',
      simulatedOtp: otp,
      email
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error initiating password reset.', error: error.message });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { email, role, otp, newPassword } = req.body;

  if (!email || !role || !otp || !newPassword) {
    res.status(400).json({ message: 'Email, role, OTP, and newPassword are required.' });
    return;
  }

  try {
    let collection: 'admins' | 'faculty' | 'students';
    if (role === 'admin') collection = 'admins';
    else if (role === 'faculty') collection = 'faculty';
    else if (role === 'student') collection = 'students';
    else {
      res.status(400).json({ message: 'Invalid role.' });
      return;
    }

    const user: any = await dbAdapter.findOne(collection, { email });
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    if (!user.resetToken || user.resetToken !== otp) {
      res.status(400).json({ message: 'Invalid reset OTP.' });
      return;
    }

    const isExpired = new Date(user.resetTokenExpires) < new Date();
    if (isExpired) {
      res.status(400).json({ message: 'Reset OTP has expired. Please request a new one.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await dbAdapter.update(collection, user._id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
      failedLoginAttempts: 0,
      lockUntil: null
    });

    res.json({ message: 'Password has been reset successfully! You can now log in.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error resetting password.', error: error.message });
  }
}

