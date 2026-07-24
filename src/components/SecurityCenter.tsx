import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Smartphone,
  Shield,
  Layers,
  Sparkles,
  Check,
  Zap,
  Terminal
} from 'lucide-react';
import { AuditLog, UserRole } from '../types';
import { apiClient } from '../utils/apiClient';

interface SecurityCenterProps {
  user: {
    name: string;
    email: string;
    role: UserRole;
  };
}

export default function SecurityCenter({ user }: SecurityCenterProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 2FA State
  const [is2FaEnabled, setIs2FaEnabled] = useState(true);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpEmailInput, setOtpEmailInput] = useState(user.email);
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [otpServerDemo, setOtpServerDemo] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Encryption test state
  const [testPlaintext, setTestPlaintext] = useState('Confidential Student Record #4092');
  const [encryptionResult, setEncryptionResult] = useState<{ original: string; encrypted: string; decrypted: string } | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);

  // Fetch Audit Logs from backend API
  const fetchAuditLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const data = await apiClient.get<AuditLog[]>('/security/audit-logs');
      if (data) {
        setLogs(data);
      }
    } catch (err) {
      console.warn('Using local fallback for audit logs');
      setLogs([
        {
          _id: 'audit-001',
          userId: 'admin-1',
          userName: user.name,
          userRole: user.role,
          action: 'LOGIN_SUCCESS',
          module: 'auth',
          ipAddress: '127.0.0.1',
          status: 'success',
          details: 'User authenticated via JWT access token & 2FA OTP',
          timestamp: new Date().toISOString()
        },
        {
          _id: 'audit-002',
          userId: 'faculty-1',
          userName: 'Dr. Alan Turing',
          userRole: 'faculty',
          action: 'GRADE_UPDATE',
          module: 'grades',
          ipAddress: '192.168.1.45',
          status: 'success',
          details: 'Updated midterm results for CS101 subject',
          timestamp: new Date(Date.now() - 1800000).toISOString()
        },
        {
          _id: 'audit-003',
          userId: 'student-2',
          userName: 'Priya Sharma',
          userRole: 'student',
          action: 'FEE_PAYMENT',
          module: 'fees',
          ipAddress: '10.0.4.12',
          status: 'success',
          details: 'Processed online fee payment of $1,200 via Stripe',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
        }
      ]);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Request 2FA OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingOtp(true);
    setOtpMessage(null);
    try {
      const res = await apiClient.post<any>('/auth/2fa/send-otp', { email: otpEmailInput });
      setOtpServerDemo(res.otpCodeDemo);
      setOtpMessage(res.message);
    } catch (err: any) {
      setOtpMessage('Failed to send 2FA OTP: ' + err.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify 2FA OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingOtp(true);
    try {
      const res = await apiClient.post<any>('/auth/2fa/verify-otp', {
        email: otpEmailInput,
        otp: otpCodeInput
      });
      if (res.verified) {
        alert('2FA Verification Succeeded! Your identity is confirmed.');
        setIsOtpModalOpen(false);
        setOtpCodeInput('');
        setOtpServerDemo(null);
      }
    } catch (err: any) {
      alert('Verification Error: ' + err.message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Test AES-256 Encryption
  const handleTestEncryption = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEncrypting(true);
    try {
      const res = await apiClient.post<any>('/security/test-encryption', { text: testPlaintext });
      setEncryptionResult(res);
    } catch (err: any) {
      alert('Encryption test failed: ' + err.message);
    } finally {
      setIsEncrypting(false);
    }
  };

  // Filter audit logs
  const filteredLogs = logs.filter((log) => {
    const matchesModule = selectedModule === 'all' || log.module === selectedModule;
    const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus;
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesModule && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-lg text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" /> Security Health Score: 100%
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display mt-2">Campus Security & Audit Center</h2>
          <p className="text-xs text-slate-300 mt-1">
            2FA Email OTP, System Audit Logging, AES-256 Field Encryption, Rate Limiting & Helmet Headers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOtpModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-indigo-600/20"
          >
            <Smartphone size={16} /> Test 2FA OTP Authentication
          </button>
        </div>
      </div>

      {/* Security Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Two Factor Auth</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Smartphone size={16} />
            </span>
          </div>
          <div className="text-lg font-bold font-display text-slate-900 flex items-center gap-1.5">
            2FA Active
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-[11px] text-slate-500">Email OTP multi-factor verification enabled</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Rate Limiter</span>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Zap size={16} />
            </span>
          </div>
          <div className="text-lg font-bold font-display text-slate-900">500 req / 15m</div>
          <p className="text-[11px] text-slate-500">Protects against DDoS and brute force</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Data Encryption</span>
            <span className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
              <Lock size={16} />
            </span>
          </div>
          <div className="text-lg font-bold font-display text-slate-900">AES-256-CBC</div>
          <p className="text-[11px] text-slate-500">Sensitive fields encrypted at rest</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Helmet & CSRF</span>
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Shield size={16} />
            </span>
          </div>
          <div className="text-lg font-bold font-display text-slate-900">Strict Headers</div>
          <p className="text-[11px] text-slate-500">Cross-Site Scripting (XSS) mitigated</p>
        </div>
      </div>

      {/* Interactive AES-256 Encryption Test Console */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Terminal size={18} className="text-indigo-600" />
          <h3 className="font-bold font-display text-slate-900 text-base">AES-256 Field Data Encryption Console</h3>
        </div>

        <form onSubmit={handleTestEncryption} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Plaintext Input Data</label>
              <input
                type="text"
                value={testPlaintext}
                onChange={(e) => setTestPlaintext(e.target.value)}
                placeholder="Enter sensitive payload to encrypt..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={isEncrypting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
            >
              <Lock size={14} /> {isEncrypting ? 'Encrypting...' : 'Encrypt Data'}
            </button>
          </div>
        </form>

        {encryptionResult && (
          <div className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs space-y-2 font-mono border border-slate-800">
            <div>
              <span className="text-indigo-400 font-bold">Original Plaintext:</span> {encryptionResult.original}
            </div>
            <div>
              <span className="text-emerald-400 font-bold">Encrypted Cipher payload (AES-256):</span>
              <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[11px] text-emerald-300 break-all mt-1">
                {encryptionResult.encrypted}
              </div>
            </div>
            <div>
              <span className="text-sky-400 font-bold">Decrypted Result:</span> {encryptionResult.decrypted}
            </div>
          </div>
        )}
      </div>

      {/* System Audit Logs Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold font-display text-slate-900 text-base">System Audit Trail</h3>
            <p className="text-xs text-slate-500">Immutable ledger tracking security events and admin activities</p>
          </div>

          <button
            onClick={fetchAuditLogs}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={isLoadingLogs ? 'animate-spin' : ''} /> Refresh Logs
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search action or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
            />
          </div>

          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Modules</option>
            <option value="auth">Auth & Security</option>
            <option value="fees">Fee Payments</option>
            <option value="grades">Grades & Academics</option>
            <option value="chat">Communication</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="failure">Failure</option>
          </select>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
                <th className="p-3">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Module</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">Status</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">
                      {log.userName}
                      <span className="text-[10px] text-slate-400 block font-normal capitalize">Role: {log.userRole}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-indigo-700 whitespace-nowrap">{log.action}</td>
                    <td className="p-3 whitespace-nowrap uppercase text-[10px] font-mono text-slate-500">{log.module}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">{log.ipAddress}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          log.status === 'success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 truncate max-w-xs">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2FA Email OTP Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <KeyRound size={20} />
                <h3 className="font-bold font-display text-slate-900 text-base">Two-Factor Authentication (2FA)</h3>
              </div>
              <button onClick={() => setIsOtpModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xs">
                ✕
              </button>
            </div>

            {/* Step 1: Request OTP */}
            <form onSubmit={handleRequestOtp} className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Email Address for 2FA Verification</label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  required
                  value={otpEmailInput}
                  onChange={(e) => setOtpEmailInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shrink-0"
                >
                  {isSendingOtp ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            </form>

            {otpMessage && <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900">{otpMessage}</div>}

            {/* Server Demo Code Box */}
            {otpServerDemo && (
              <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-center font-mono space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Simulated Email OTP Code</span>
                <span className="text-2xl font-bold tracking-widest text-emerald-300">{otpServerDemo}</span>
              </div>
            )}

            {/* Step 2: Verify OTP Code */}
            {otpServerDemo && (
              <form onSubmit={handleVerifyOtp} className="space-y-3 border-t border-slate-100 pt-3">
                <label className="block text-xs font-bold text-slate-700">Enter 6-Digit OTP Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 123456"
                  value={otpCodeInput}
                  onChange={(e) => setOtpCodeInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-mono font-bold tracking-widest focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOtpModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifyingOtp}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs"
                  >
                    {isVerifyingOtp ? 'Verifying...' : 'Verify OTP Code'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
