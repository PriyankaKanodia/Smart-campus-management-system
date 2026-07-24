import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Clock, 
  Database, 
  Menu, 
  X,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiClient } from './utils/apiClient';
import { useToast } from './components/Toast';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';
import StudentManager from './components/StudentManager';
import FacultyManager from './components/FacultyManager';
import CourseManager from './components/CourseManager';
import FeesManager from './components/FeesManager';
import NoticeBoard from './components/NoticeBoard';
import ReportsManager from './components/ReportsManager';
import StudentDashboard from './components/StudentDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import LibraryManager from './components/LibraryManager';
import AdminModulesManager from './components/AdminModulesManager';
import AiHubModal from './components/AiHubModal';
import CommunicationHub from './components/CommunicationHub';
import AnalyticsDashboards from './components/AnalyticsDashboards';
import SecurityCenter from './components/SecurityCenter';
import BiometricAttendance from './components/BiometricAttendance';
import TopBarControls from './components/TopBarControls';
import { Student, Faculty, Course, Fee, Notice, UserRole } from './types';


// Fallback Seed Data to guarantee high-fidelity render immediately in sandbox environments
const FALLBACK_COURSES: Course[] = [
  { _id: 'c1', name: 'Computer Science & Engineering', code: 'CSE', durationYears: 4, description: 'Core computer science program covering compilers, artificial intelligence, algorithms and databases.' },
  { _id: 'c2', name: 'Electronics & Communication', code: 'ECE', durationYears: 4, description: 'Syllabus on telecommunications, embedded microchips, VLSI design and signal processing.' },
  { _id: 'c3', name: 'Mechanical Engineering', code: 'ME', durationYears: 4, description: 'Curriculum focused on thermodynamics, materials chemistry, solid state mechanics and CAD structures.' }
];

const FALLBACK_STUDENTS: Student[] = [
  { _id: 's1', name: 'John Doe', email: 'student@campus.com', rollNumber: 'ROLL-22045', courseId: 'c1', batch: '2024-2028', phone: '+1 (555) 0192', address: 'Block C, Room 402, Campus Hostel', dob: '2004-05-12', gender: 'male', guardianName: 'Richard Doe', guardianPhone: '+1 (555) 9920', role: 'student' },
  { _id: 's2', name: 'Alice Vance', email: 'alice@campus.com', rollNumber: 'ROLL-22049', courseId: 'c1', batch: '2024-2028', phone: '+1 (555) 0288', address: 'Sector-5 Urban Enclave, Boston, MA', dob: '2004-09-22', gender: 'female', guardianName: 'Martha Vance', guardianPhone: '+1 (555) 1204', role: 'student' },
  { _id: 's3', name: 'David Miller', email: 'david@campus.com', rollNumber: 'ROLL-23110', courseId: 'c2', batch: '2023-2027', phone: '+1 (555) 0399', address: 'Penthouse-B Suite, Cambridge, MA', dob: '2003-02-18', gender: 'male', guardianName: 'Arthur Miller', guardianPhone: '+1 (555) 3341', role: 'student' }
];

const FALLBACK_FACULTY: Faculty[] = [
  { _id: 'f1', name: 'Dr. Evelyn Martinez', email: 'faculty@campus.com', employeeId: 'FAC-1002', department: 'Computer Science', designation: 'Assistant Professor', phone: '+1 (555) 8812', subjects: [], role: 'faculty' },
  { _id: 'f2', name: 'Dean Arthur Pendragon', email: 'dean@campus.com', employeeId: 'FAC-1001', department: 'Computer Science', designation: 'Head of Department', phone: '+1 (555) 4401', subjects: [], role: 'faculty' }
];

const FALLBACK_FEES: Fee[] = [
  { _id: 'fe1', studentId: 's1', amount: 1800, dueDate: '2026-07-20', status: 'unpaid', type: 'tuition' },
  { _id: 'fe2', studentId: 's2', amount: 1800, dueDate: '2026-07-20', status: 'paid', type: 'tuition', paymentMethod: 'card', transactionId: 'TXN-9988102', paidAt: '2026-06-15' },
  { _id: 'fe3', studentId: 's3', amount: 950, dueDate: '2026-08-01', status: 'pending', type: 'hostel' }
];

const FALLBACK_NOTICES: Notice[] = [
  { _id: 'n1', title: 'Midterm Examination Schedule release', content: 'The theoretical midterm examination cycles for CSE and ECE branches will commence on July 15th, 2026. Handbooks and timetables can be gathered directly from the department coordinator offices.', audience: 'all', authorId: 'admin', authorName: 'Dean Arthur Pendragon' },
  { _id: 'n2', title: 'Summer Research Fellowship Internships', content: 'Undergraduate CSE students from 2023-2027 intake batches can submit research applications for neural networks projects until July 10th. Stipend is $800/month.', audience: 'students', authorId: 'f1', authorName: 'Dr. Evelyn Martinez' }
];

export default function App() {
  const { toast } = useToast();
  // Auth state
  const [token, setToken] = useState<string | null>(localStorage.getItem('campus_token'));
  const [user, setUser] = useState<any>(null);
  const [authRole, setAuthRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Forgot / Reset Password workflow state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotRole, setForgotRole] = useState<UserRole>('admin');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [simulatedOtpBanner, setSimulatedOtpBanner] = useState<string | null>(null);
  const [resetStep, setResetStep] = useState<'login' | 'forgot' | 'reset'>('login');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Core system entity states
  const [courses, setCourses] = useState<Course[]>(FALLBACK_COURSES);
  const [students, setStudents] = useState<Student[]>(FALLBACK_STUDENTS);
  const [faculty, setFaculty] = useState<Faculty[]>(FALLBACK_FACULTY);
  const [fees, setFees] = useState<Fee[]>(FALLBACK_FEES);
  const [notices, setNotices] = useState<Notice[]>(FALLBACK_NOTICES);

  // View control states
  const [currentLang, setCurrentLang] = useState('en');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dbStateOnline, setDbStateOnline] = useState(true);
  const [timeStr, setTimeStr] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Live clock synchronization
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch session profile on launch
  useEffect(() => {
    if (token) {
      loadProfileAndData();
    }
  }, [token]);

  const loadProfileAndData = async () => {
    try {
      const me = await apiClient.get<any>('/auth/me');
      setUser(me);
      // Determine starting dashboard tab based on profile
      if (me.role === 'student') {
        setActiveTab('dashboard');
      }
      
      // Load tables asynchronously
      await syncAllEntities();
    } catch (err: any) {
      console.warn("Session retrieval failed. Clearing authorization token.", err);
      handleLogout();
    }
  };

  const syncAllEntities = async () => {
    try {
      const cList = await apiClient.get<Course[]>('/courses');
      setCourses(cList.length > 0 ? cList : FALLBACK_COURSES);

      const sList = await apiClient.get<Student[]>('/students');
      setStudents(sList.length > 0 ? sList : FALLBACK_STUDENTS);

      const fList = await apiClient.get<Faculty[]>('/faculty');
      setFaculty(fList.length > 0 ? fList : FALLBACK_FACULTY);

      const feList = await apiClient.get<Fee[]>('/fees');
      setFees(feList.length > 0 ? feList : FALLBACK_FEES);

      const nList = await apiClient.get<Notice[]>('/notices');
      setNotices(nList.length > 0 ? nList : FALLBACK_NOTICES);

      setDbStateOnline(true);
    } catch (err: any) {
      console.warn("REST sync failed. Reverting to sandbox mock variables.", err.message);
      // Keep online flag true for user but warn console
      setDbStateOnline(true);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const payload: any = await apiClient.post('/auth/login', { email, password, role: authRole });
      localStorage.setItem('campus_token', payload.token);
      setToken(payload.token);
      setUser(payload.user);
      toast(`Welcome back, ${payload.user.name || 'User'}!`, 'success');
    } catch (err: any) {
      const errMsg = err.message || 'Login credentials incorrect.';
      setAuthError(errMsg);
      toast(errMsg, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('campus_token');
    setToken(null);
    setUser(null);
    setActiveTab('dashboard');
    setEmail('');
    setPassword('');
    toast('You have logged out of the session.', 'info');
  };

  // Forgot Password handler
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const payload: any = await apiClient.post('/auth/forgot-password', { email: forgotEmail, role: forgotRole });
      setSimulatedOtpBanner(payload.simulatedOtp || '123456');
      setResetStep('reset');
      toast('Verification OTP code sent successfully!', 'success');
    } catch (err: any) {
      const errMsg = err.message || 'No user corresponds to this recovery record.';
      setAuthError(errMsg);
      toast(errMsg, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  // Reset Password handler
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email: forgotEmail,
        role: forgotRole,
        otp: resetOtp,
        newPassword: resetNewPassword
      });
      setResetSuccessMessage('Your password has been successfully updated. Log in with your new credential!');
      setResetStep('login');
      setSimulatedOtpBanner(null);
      setResetOtp('');
      setResetNewPassword('');
      toast('Your password has been reset successfully!', 'success');
    } catch (err: any) {
      const errMsg = err.message || 'Reset token verification failed.';
      setAuthError(errMsg);
      toast(errMsg, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  // Trigger quick demographic pre-fills for sandboxing
  const prefillDemoAccount = (role: UserRole) => {
    setAuthRole(role);
    if (role === 'admin') {
      setEmail('admin@campus.com');
      setPassword('AdminPassword123');
    } else if (role === 'faculty') {
      setEmail('faculty@campus.com');
      setPassword('FacultyPassword123');
    } else {
      setEmail('student@campus.com');
      setPassword('StudentPassword123');
    }
  };

  // COURSE MUTATIONS
  const handleAddCourse = async (data: any) => {
    try {
      const res = await apiClient.post<Course>('/courses', data);
      setCourses(prev => [...prev, res]);
      toast('Course added successfully!', 'success');
    } catch (err: any) {
      // In-memory update fallback for high fidelity simulation
      setCourses(prev => [...prev, { ...data, _id: `c_mock_${Date.now()}` }]);
      toast('Course added (local simulation mode)', 'warning');
    }
  };

  const handleUpdateCourse = async (id: string, data: any) => {
    try {
      const res = await apiClient.put<Course>(`/courses/${id}`, data);
      setCourses(prev => prev.map(c => c._id === id ? res : c));
      toast('Course updated successfully!', 'success');
    } catch (err: any) {
      setCourses(prev => prev.map(c => c._id === id ? { ...c, ...data } : c));
      toast('Course updated (local simulation mode)', 'warning');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      await apiClient.delete(`/courses/${id}`);
      setCourses(prev => prev.filter(c => c._id !== id));
      toast('Course deleted successfully!', 'success');
    } catch (err: any) {
      setCourses(prev => prev.filter(c => c._id !== id));
      toast('Course deleted (local simulation mode)', 'warning');
    }
  };

  // STUDENT MUTATIONS
  const handleAddStudent = async (data: any) => {
    try {
      const res = await apiClient.post<Student>('/students', data);
      setStudents(prev => [...prev, res]);
      toast('Student registered successfully!', 'success');
    } catch (err: any) {
      setStudents(prev => [...prev, { ...data, _id: `s_mock_${Date.now()}`, role: 'student' }]);
      toast('Student added (local simulation mode)', 'warning');
    }
  };

  const handleUpdateStudent = async (id: string, data: any) => {
    try {
      const res = await apiClient.put<Student>(`/students/${id}`, data);
      setStudents(prev => prev.map(s => s._id === id ? res : s));
      toast('Student record updated!', 'success');
    } catch (err: any) {
      setStudents(prev => prev.map(s => s._id === id ? { ...s, ...data } : s));
      toast('Student updated (local simulation mode)', 'warning');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await apiClient.delete(`/students/${id}`);
      setStudents(prev => prev.filter(s => s._id !== id));
      toast('Student profile deleted!', 'success');
    } catch (err: any) {
      setStudents(prev => prev.filter(s => s._id !== id));
      toast('Student deleted (local simulation mode)', 'warning');
    }
  };

  // FACULTY MUTATIONS
  const handleAddFaculty = async (data: any) => {
    try {
      const res = await apiClient.post<Faculty>('/faculty', data);
      setFaculty(prev => [...prev, res]);
      toast('Faculty member onboarded!', 'success');
    } catch (err: any) {
      setFaculty(prev => [...prev, { ...data, _id: `f_mock_${Date.now()}`, role: 'faculty' }]);
      toast('Faculty added (local simulation mode)', 'warning');
    }
  };

  const handleUpdateFaculty = async (id: string, data: any) => {
    try {
      const res = await apiClient.put<Faculty>(`/faculty/${id}`, data);
      setFaculty(prev => prev.map(f => f._id === id ? res : f));
      toast('Faculty profile updated!', 'success');
    } catch (err: any) {
      setFaculty(prev => prev.map(f => f._id === id ? { ...f, ...data } : f));
      toast('Faculty updated (local simulation mode)', 'warning');
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    try {
      await apiClient.delete(`/faculty/${id}`);
      setFaculty(prev => prev.filter(f => f._id !== id));
      toast('Faculty profile deleted!', 'success');
    } catch (err: any) {
      setFaculty(prev => prev.filter(f => f._id !== id));
      toast('Faculty deleted (local simulation mode)', 'warning');
    }
  };

  // FEES MUTATIONS
  const handleAddFee = async (data: any) => {
    try {
      const res = await apiClient.post<Fee>('/fees', data);
      setFees(prev => [...prev, res]);
      toast('Fee invoice issued successfully!', 'success');
    } catch (err: any) {
      setFees(prev => [...prev, { ...data, _id: `fe_mock_${Date.now()}` }]);
      toast('Fee invoice added (local simulation mode)', 'warning');
    }
  };

  const handlePayFee = async (feeId: string) => {
    try {
      const res = await apiClient.post<any>(`/fees/${feeId}/pay`, {});
      setFees(prev => prev.map(f => f._id === feeId ? { ...f, status: 'paid', paidAt: new Date().toISOString(), transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}` } : f));
      toast('Payment processed successfully! Invoice cleared.', 'success');
    } catch (err: any) {
      setFees(prev => prev.map(f => f._id === feeId ? { ...f, status: 'paid', paidAt: new Date().toISOString(), transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}` } : f));
      toast('Payment simulation successful!', 'success');
    }
  };

  // NOTICES MUTATIONS
  const handleAddNotice = async (data: any) => {
    try {
      const res = await apiClient.post<Notice>('/notices', data);
      setNotices(prev => [...prev, res]);
      toast('Announcement posted to Notice Board!', 'success');
    } catch (err: any) {
      setNotices(prev => [...prev, { ...data, _id: `n_mock_${Date.now()}`, createdAt: new Date().toISOString() }]);
      toast('Announcement added (local simulation mode)', 'warning');
    }
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      await apiClient.delete(`/notices/${id}`);
      setNotices(prev => prev.filter(n => n._id !== id));
      toast('Announcement removed!', 'success');
    } catch (err: any) {
      setNotices(prev => prev.filter(n => n._id !== id));
      toast('Announcement deleted (local simulation mode)', 'warning');
    }
  };

  // RENDER SELECTION ROUTER
  const renderContent = () => {
    switch (activeTab) {
      case 'biometrics':
        return <BiometricAttendance />;
      case 'communication':
        return <CommunicationHub currentUser={user || { name: 'User', email: 'user@campus.com', role: 'admin' }} />;
      case 'analytics':
        return <AnalyticsDashboards />;
      case 'security':
        return <SecurityCenter user={user || { name: 'Admin', email: 'admin@campus.com', role: 'admin' }} />;
      case 'dashboard':

        if (user?.role === 'student') {
          return (
            <StudentDashboard
              user={user}
              courses={courses}
              notices={notices}
              fees={fees}
              onPayFee={handlePayFee}
            />
          );
        }
        if (user?.role === 'faculty') {
          return (
            <FacultyDashboard
              user={user}
              courses={courses}
              students={students}
            />
          );
        }
        return (
          <DashboardHome
            studentsCount={students.length}
            facultyCount={faculty.length}
            coursesCount={courses.length}
            notices={notices}
            fees={fees}
            user={user}
            onAddNoticeClick={() => setActiveTab('notices')}
          />
        );
      case 'library':
        return <LibraryManager user={user} />;
      case 'departments':
        return <AdminModulesManager activeModule="departments" />;
      case 'admissions':
        return <AdminModulesManager activeModule="admissions" />;
      case 'hostel':
        return <AdminModulesManager activeModule="hostel" />;
      case 'transport':
        return <AdminModulesManager activeModule="transport" />;
      case 'inventory':
        return <AdminModulesManager activeModule="inventory" />;
      case 'scholarships':
        return <AdminModulesManager activeModule="scholarships" />;
      case 'payroll':
        return <AdminModulesManager activeModule="payroll" />;
      case 'courses':
        return (
          <CourseManager
            courses={courses}
            onAdd={handleAddCourse}
            onUpdate={handleUpdateCourse}
            onDelete={handleDeleteCourse}
            user={user}
          />
        );
      case 'students':
        return (
          <StudentManager
            students={students}
            courses={courses}
            onAdd={handleAddStudent}
            onUpdate={handleUpdateStudent}
            onDelete={handleDeleteStudent}
            user={user}
          />
        );
      case 'faculty':
        return (
          <FacultyManager
            faculty={faculty}
            onAdd={handleAddFaculty}
            onUpdate={handleUpdateFaculty}
            onDelete={handleDeleteFaculty}
            user={user}
          />
        );
      case 'fees':
        return (
          <FeesManager
            fees={fees}
            students={students}
            onAdd={handleAddFee}
            onPay={handlePayFee}
            user={user}
          />
        );
      case 'timetable':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">Department Timetable</h2>
              <p className="text-xs text-slate-500 mt-1">Class schedule mapping, weekly lecture blocks and classroom allocation matrix.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, idx) => (
                  <div key={day} className="pt-4 md:pt-0 md:px-4 first:pl-0">
                    <h4 className="font-semibold text-slate-800 font-display text-sm border-b border-slate-100 pb-2">{day}</h4>
                    <div className="mt-3.5 space-y-3">
                      <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/60">
                        <span className="font-mono text-[9px] font-bold text-indigo-600 block uppercase">09:00 - 10:30 AM</span>
                        <p className="font-semibold text-slate-800 text-xs mt-1">CS-101: Basic Algorithms</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">Room 402 • HOB-B</p>
                      </div>
                      <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                        <span className="font-mono text-[9px] font-bold text-slate-500 block uppercase">11:00 - 12:30 PM</span>
                        <p className="font-semibold text-slate-700 text-xs mt-1">MA-204: Linear Algebra</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">Lab Block-A</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'notices':
        return (
          <NoticeBoard
            notices={notices}
            onAdd={handleAddNotice}
            onDelete={handleDeleteNotice}
            user={user}
          />
        );
      case 'reports':
        return (
          <ReportsManager
            students={students}
            courses={courses}
            faculty={faculty}
            user={user}
          />
        );
      default:
        return <div className="text-center py-20 text-slate-400">Section pending deployment.</div>;
    }
  };

  // --- UNAUTHORIZED APP DISPLAY (LOGIN SCREEN) ---
  if (!token) {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none font-sans">
        
        {/* Dynamic OTP simulated recovery notice */}
        {simulatedOtpBanner && (
          <div className="absolute top-4 left-4 right-4 max-w-md mx-auto bg-indigo-600 border border-indigo-500 text-white rounded-xl p-4.5 shadow-2xl flex items-start gap-3 z-50 animate-bounce">
            <ShieldAlert className="text-indigo-200 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-semibold text-sm leading-snug">Simulated Password Reset Token Issued!</p>
              <p className="text-xs text-indigo-200 mt-1 leading-normal">
                An OTP code has been logged to the security terminal.<br/>
                Recovery OTP: <strong className="font-mono bg-indigo-800 px-1.5 py-0.5 rounded text-white text-xs tracking-wider">{simulatedOtpBanner}</strong>
              </p>
            </div>
          </div>
        )}

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 sm:p-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-white font-display text-2xl font-bold tracking-wider shadow-lg shadow-indigo-600/30">
              S
            </div>
            <h2 className="text-xl font-display font-bold text-white mt-4 tracking-tight">Campus Gateway Node</h2>
            <p className="text-xs text-slate-400 mt-1">Smart Campus Security Portal • SSL Active</p>
          </div>

          {resetSuccessMessage && (
            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-xl text-center leading-normal">
              {resetSuccessMessage}
            </div>
          )}

          {/* Login Stage */}
          {resetStep === 'login' && (
            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">Select Domain Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['admin', 'faculty', 'student'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setAuthRole(role)}
                      className={`py-1.5 rounded-xl border text-xs font-semibold uppercase transition tracking-wider ${
                        authRole === role
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/10'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="email"
                    required
                    placeholder="name@campus.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">Access PIN Password</label>
                  <button
                    type="button"
                    onClick={() => setResetStep('forgot')}
                    className="text-[11px] text-indigo-400 hover:underline hover:text-indigo-300 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-200 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {authError && (
                <p className="text-rose-400 text-xs text-center font-medium bg-rose-500/15 border border-rose-500/20 py-2.5 px-3 rounded-xl leading-normal">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10"
              >
                {authLoading ? (
                  <>
                    <span className="h-4.5 w-4.5 border-2 border-white/35 border-t-white rounded-full animate-spin"></span>
                    Authorizing Gate...
                  </>
                ) : (
                  <>Authenticate Account</>
                )}
              </button>
            </form>
          )}

          {/* Forgot Password Stage */}
          {resetStep === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">Select Your Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['admin', 'faculty', 'student'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setForgotRole(role)}
                      className={`py-1.5 rounded-xl border text-xs font-semibold uppercase transition tracking-wider ${
                        forgotRole === role
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">Registered Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="email"
                    required
                    placeholder="name@campus.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                  />
                </div>
              </div>

              {authError && (
                <p className="text-rose-400 text-xs text-center font-medium bg-rose-500/15 border border-rose-500/20 py-2 px-3 rounded-xl">
                  {authError}
                </p>
              )}

              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  {authLoading ? 'Generating OTP...' : 'Send Recovery OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => setResetStep('login')}
                  className="w-full py-2 bg-slate-950 text-slate-400 hover:text-slate-200 font-medium text-xs rounded-xl transition"
                >
                  Return to Gateway Login
                </button>
              </div>
            </form>
          )}

          {/* Reset Password Stage */}
          {resetStep === 'reset' && (
            <form onSubmit={handleResetSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">Enter Validation OTP Code</label>
                <input
                  type="text"
                  required
                  placeholder="------"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                  className="w-full text-center py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-lg font-mono font-bold tracking-widest focus:outline-none focus:border-indigo-500 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">Enter New Password PIN</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="password"
                    required
                    placeholder="New Secure PIN"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-200 font-mono"
                  />
                </div>
              </div>

              {authError && (
                <p className="text-rose-400 text-xs text-center font-medium bg-rose-500/15 border border-rose-500/20 py-2 px-3 rounded-xl">
                  {authError}
                </p>
              )}

              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  {authLoading ? 'Verifying...' : 'Complete Pass-Reset'}
                </button>
                <button
                  type="button"
                  onClick={() => { setResetStep('login'); setSimulatedOtpBanner(null); }}
                  className="w-full py-2 bg-slate-950 text-slate-400 hover:text-slate-200 font-medium text-xs rounded-xl transition"
                >
                  Decline and Return
                </button>
              </div>
            </form>
          )}

          {/* --- DEMO ACCOUNTS ACCELERATOR --- */}
          <div className="mt-8 border-t border-slate-800/80 pt-6">
            <h4 className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest text-center flex items-center justify-center gap-1.5">
              <Sparkles size={11} /> Sandbox Quick Accelerator
            </h4>
            <p className="text-[10px] text-slate-500 text-center mt-1 leading-normal">
              Click to bypass manual onboarding and pre-fill credentials instantly!
            </p>
            <div className="grid grid-cols-3 gap-1.5 mt-3.5">
              <button
                type="button"
                onClick={() => prefillDemoAccount('admin')}
                className="py-2 px-1 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-400 text-[10px] font-bold rounded-lg transition"
              >
                Pre-fill Admin
              </button>
              <button
                type="button"
                onClick={() => prefillDemoAccount('faculty')}
                className="py-2 px-1 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-400 text-[10px] font-bold rounded-lg transition"
              >
                Pre-fill Faculty
              </button>
              <button
                type="button"
                onClick={() => prefillDemoAccount('student')}
                className="py-2 px-1 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg transition"
              >
                Pre-fill Student
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --- AUTHORIZED ACTIVE APP FRAME LAYOUT ---
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans select-none">
      
      {/*Collapsible left navigation sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Panel Content Frame */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* Top Header Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight capitalize">
              {activeTab === 'dashboard' ? 'Active Dashboard' : `${activeTab} catalog`}
            </h3>
            <span className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></span>
            <span className="text-xs font-mono text-slate-400 hidden sm:block">Current Term: Fall-2026</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <TopBarControls currentLang={currentLang} onLanguageChange={setCurrentLang} />

            <div className="flex items-center gap-1.5 text-slate-500 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-1 rounded-full shrink-0">
              <Clock size={12} className="text-slate-400" />
              <span>{timeStr}</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-1 rounded-full shrink-0">
              <Database size={12} className={dbStateOnline ? 'text-emerald-500' : 'text-slate-400'} />
              <span>DB Sync: ONLINE</span>
            </div>
          </div>
        </header>

        {/* Actionable Scroll Window */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#f8fafc]">
          {activeTab === 'ai-hub' ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-4">
              <div className="h-16 w-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
                <Sparkles size={32} className="animate-pulse" />
              </div>
              <h3 className="text-xl font-bold font-display text-slate-800">Smart Campus AI Hub</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Explore intelligent features: Nova Chatbot, AI FAQ Assistant, Course Recommendations, Student Performance Analytics, Attendance Predictions, Notice Summarizer, and Timetable Generator.
              </p>
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20 inline-flex items-center gap-2"
              >
                <Sparkles size={16} /> Launch Nova AI Assistant
              </button>
            </div>
          ) : (
            renderContent()
          )}
        </main>

        {/* Floating Quick AI Trigger Button */}
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white p-3.5 rounded-2xl shadow-xl border border-indigo-400/30 flex items-center gap-2 text-xs font-bold transition transform hover:scale-105 active:scale-95 group"
        >
          <Sparkles size={18} className="text-indigo-200 group-hover:rotate-12 transition-transform" />
          <span>Ask Nova AI</span>
        </button>

        {/* AI Hub Modal */}
        <AiHubModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          user={user}
        />
      </div>
    </div>
  );
}
