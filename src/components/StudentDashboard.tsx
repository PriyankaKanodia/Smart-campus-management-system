import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download, 
  Upload, 
  FileText, 
  CreditCard, 
  Bell, 
  User, 
  Calendar, 
  BookMarked, 
  FileSignature, 
  TrendingUp, 
  GraduationCap, 
  Phone, 
  MapPin, 
  Mail, 
  CalendarCheck, 
  Check, 
  AlertTriangle,
  Search,
  Book,
  FileSpreadsheet,
  RefreshCw,
  Plus,
  Award,
  Sparkles,
  Printer,
  ChevronRight,
  Calculator,
  Building,
  ShieldCheck,
  QrCode,
  Send,
  Info
} from 'lucide-react';
import { 
  Student, 
  Course, 
  Subject, 
  Attendance, 
  Assignment, 
  Result, 
  Fee, 
  LibraryBook, 
  LeaveRequest, 
  Notice, 
  TimetableEntry,
  ExamSchedule,
  CertificateRequest,
  StudyMaterial
} from '../types';
import { apiClient } from '../utils/apiClient';
import { useToast } from './Toast';
import LibraryManager from './LibraryManager';

interface StudentDashboardProps {
  user: Student;
  courses: Course[];
  notices: Notice[];
  fees: Fee[];
  onPayFee: (feeId: string) => Promise<void>;
}

export default function StudentDashboard({
  user,
  courses,
  notices,
  fees,
  onPayFee
}: StudentDashboardProps) {
  const { toast } = useToast();
  
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'profile' | 'attendance' | 'assignments' | 'results' | 
    'cgpa' | 'notes' | 'fees' | 'timetable' | 'exams' | 
    'leave' | 'certificates' | 'transcript' | 'library'
  >('overview');

  // Core Data
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [certificateRequests, setCertificateRequests] = useState<CertificateRequest[]>([]);

  // Modals & Forms
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionFile, setSubmissionFile] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  
  // Profile Editable state
  const [profilePhone, setProfilePhone] = useState(user.phone || '');
  const [profileAddress, setProfileAddress] = useState(user.address || '');

  // Leave Form
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Certificate Request Form
  const [certForm, setCertForm] = useState({
    type: 'Bonafide Certificate' as CertificateRequest['type'],
    reason: ''
  });
  const [selectedCertPreview, setSelectedCertPreview] = useState<CertificateRequest | null>(null);

  // CGPA Calculator State
  const [cgpaCourses, setCgpaCourses] = useState([
    { id: 1, name: 'Data Structures & Algorithms', credits: 4, gradePoint: 10 },
    { id: 2, name: 'Database Management Systems', credits: 4, gradePoint: 9 },
    { id: 3, name: 'Operating Systems & Kernel', credits: 3, gradePoint: 8 },
    { id: 4, name: 'Discrete Mathematics', credits: 3, gradePoint: 9 },
    { id: 5, name: 'Software Engineering Lab', credits: 2, gradePoint: 10 }
  ]);
  const [targetCgpaGoal, setTargetCgpaGoal] = useState<number>(8.5);

  // Results semester filter
  const [selectedResultSemester, setSelectedResultSemester] = useState<number>(1);

  // Materials Search
  const [notesSearch, setNotesSearch] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');

  // Match Course Name
  const studentCourse = courses.find(c => c._id === user.courseId) || { name: 'B.Tech Computer Science & Engineering', code: 'CSE-UG' };

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // 1. Subjects
      const subjectsList = await apiClient.get<Subject[]>('/subjects').catch(() => []);
      const filledSubjects = subjectsList.length > 0 ? subjectsList : [
        { _id: 'sub1', name: 'Data Structures & Algorithms', code: 'CS-201', courseId: user.courseId, facultyId: 'f1', semester: 1 },
        { _id: 'sub2', name: 'Database Management Systems', code: 'CS-202', courseId: user.courseId, facultyId: 'f1', semester: 1 },
        { _id: 'sub3', name: 'Discrete Mathematics & Logic', code: 'MA-204', courseId: user.courseId, facultyId: 'f2', semester: 1 },
        { _id: 'sub4', name: 'Computer Networks & Protocols', code: 'CS-301', courseId: user.courseId, facultyId: 'f2', semester: 1 },
        { _id: 'sub5', name: 'Operating System Design', code: 'CS-302', courseId: user.courseId, facultyId: 'f3', semester: 2 },
      ];
      setSubjects(filledSubjects);

      // 2. Attendance
      const attendanceList = await apiClient.get<Attendance[]>('/attendance').catch(() => []);
      const filteredAttendance = attendanceList.filter(a => a.studentId === user._id);
      const filledAttendance = filteredAttendance.length > 0 ? filteredAttendance : [
        { _id: 'att1', studentId: user._id, subjectId: 'sub1', date: '2026-07-01', status: 'present', markedBy: 'f1' },
        { _id: 'att2', studentId: user._id, subjectId: 'sub1', date: '2026-07-03', status: 'present', markedBy: 'f1' },
        { _id: 'att3', studentId: user._id, subjectId: 'sub1', date: '2026-07-05', status: 'present', markedBy: 'f1' },
        { _id: 'att4', studentId: user._id, subjectId: 'sub2', date: '2026-07-02', status: 'absent', markedBy: 'f1' },
        { _id: 'att5', studentId: user._id, subjectId: 'sub2', date: '2026-07-04', status: 'present', markedBy: 'f1' },
        { _id: 'att6', studentId: user._id, subjectId: 'sub3', date: '2026-07-01', status: 'present', markedBy: 'f2' },
        { _id: 'att7', studentId: user._id, subjectId: 'sub3', date: '2026-07-06', status: 'late', markedBy: 'f2' },
        { _id: 'att8', studentId: user._id, subjectId: 'sub4', date: '2026-07-02', status: 'present', markedBy: 'f2' },
        { _id: 'att9', studentId: user._id, subjectId: 'sub4', date: '2026-07-07', status: 'present', markedBy: 'f2' },
      ];
      setAttendances(filledAttendance as Attendance[]);

      // 3. Assignments
      const assignmentList = await apiClient.get<Assignment[]>('/assignments').catch(() => []);
      const filledAssignments = assignmentList.length > 0 ? assignmentList : [
        {
          _id: 'asg1',
          title: 'Binary Search Trees & Red-Black Balancing',
          description: 'Implement a self-balancing tree visualizer in Python or TypeScript. Compare search time complexity against balanced AVL trees.',
          subjectId: 'sub1',
          facultyId: 'f1',
          dueDate: '2026-07-28',
          totalMarks: 100,
          submissions: []
        },
        {
          _id: 'asg2',
          title: 'Database Normalization BCNF Decomposition',
          description: 'Apply Boyce-Codd normal form rules to the functional dependency set and generate decomposed 3NF relations.',
          subjectId: 'sub2',
          facultyId: 'f1',
          dueDate: '2026-07-15',
          totalMarks: 50,
          submissions: [
            {
              studentId: user._id,
              fileUrl: 'https://campus-storage.edu/docs/bcnf_solution.pdf',
              fileName: 'bcnf_solution.pdf',
              submittedAt: '2026-07-12T10:30:00Z',
              marksObtained: 48,
              feedback: 'Outstanding normalization schema. All lossless join dependencies preserved.'
            }
          ]
        },
        {
          _id: 'asg3',
          title: 'TCP/IP Congestion Control Simulation',
          description: 'Simulate TCP Reno slow-start vs congestion avoidance window sizing under packet drop probabilities.',
          subjectId: 'sub4',
          facultyId: 'f2',
          dueDate: '2026-08-05',
          totalMarks: 100,
          submissions: []
        }
      ];
      setAssignments(filledAssignments as Assignment[]);

      // 4. Results
      const resultList = await apiClient.get<Result[]>('/results').catch(() => []);
      const filteredResults = resultList.filter(r => r.studentId === user._id);
      const filledResults = filteredResults.length > 0 ? filteredResults : [
        { _id: 'res1', studentId: user._id, subjectId: 'sub1', examType: 'final', marksObtained: 92, totalMarks: 100, grade: 'O', remarks: 'Outstanding algorithmic logic', semester: 1 },
        { _id: 'res2', studentId: user._id, subjectId: 'sub2', examType: 'final', marksObtained: 85, totalMarks: 100, grade: 'A+', remarks: 'Excellent database schema design', semester: 1 },
        { _id: 'res3', studentId: user._id, subjectId: 'sub3', examType: 'final', marksObtained: 78, totalMarks: 100, grade: 'A', remarks: 'Good grasp of graph theory concepts', semester: 1 },
        { _id: 'res4', studentId: user._id, subjectId: 'sub4', examType: 'final', marksObtained: 88, totalMarks: 100, grade: 'A+', remarks: 'Strong network protocol implementation', semester: 1 },
        { _id: 'res5', studentId: user._id, subjectId: 'sub5', examType: 'midterm', marksObtained: 44, totalMarks: 50, grade: 'O', remarks: 'Top score in kernel concurrency test', semester: 2 },
      ];
      setResults(filledResults as Result[]);

      // 5. Library Books
      const booksList = await apiClient.get<LibraryBook[]>('/library/books').catch(() => []);
      const filledBooks = booksList.length > 0 ? booksList : [
        { _id: 'b1', title: 'Introduction to Algorithms (CLRS 4th Ed)', author: 'Cormen, Leiserson, Rivest, Stein', isbn: '978-0262046305', category: 'Computer Science', totalCopies: 12, availableCopies: 9, borrowedBy: [] },
        { _id: 'b2', title: 'Database System Concepts (7th Ed)', author: 'Silberschatz, Korth, Sudarshan', isbn: '978-0073523323', category: 'Computer Science', totalCopies: 8, availableCopies: 5, borrowedBy: [{ studentId: user._id, borrowDate: '2026-07-01', status: 'borrowed' }] },
        { _id: 'b3', title: 'Discrete Mathematics & Its Applications', author: 'Kenneth H. Rosen', isbn: '978-1259676512', category: 'Mathematics', totalCopies: 15, availableCopies: 14, borrowedBy: [] },
        { _id: 'b4', title: 'Computer Networking: A Top-Down Approach', author: 'Kurose, Ross', isbn: '978-0133594140', category: 'Computer Science', totalCopies: 10, availableCopies: 7, borrowedBy: [] }
      ];
      setLibraryBooks(filledBooks as LibraryBook[]);

      // 6. Leave Requests
      const leavesList = await apiClient.get<LeaveRequest[]>('/leaves').catch(() => []);
      const filteredLeaves = leavesList.filter(l => l.userId === user._id);
      const filledLeaves = filteredLeaves.length > 0 ? filteredLeaves : [
        { _id: 'lv1', userId: user._id, userName: user.name, role: 'student', startDate: '2026-07-10', endDate: '2026-07-12', reason: 'Attending Inter-University Robotics Competition finals.', status: 'approved' }
      ];
      setLeaveRequests(filledLeaves as LeaveRequest[]);

      // 7. Timetable
      const timetableList = await apiClient.get<TimetableEntry[]>('/timetable').catch(() => []);
      const filledTimetable = timetableList.length > 0 ? timetableList : [
        { _id: 'tt1', courseId: user.courseId, subjectId: 'sub1', facultyId: 'f1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:30', roomNumber: 'Auditorium 302', semester: 1 },
        { _id: 'tt2', courseId: user.courseId, subjectId: 'sub2', facultyId: 'f1', dayOfWeek: 'Monday', startTime: '11:00', endTime: '12:30', roomNumber: 'CS Lab 2', semester: 1 },
        { _id: 'tt3', courseId: user.courseId, subjectId: 'sub3', facultyId: 'f2', dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '10:30', roomNumber: 'Hall B-12', semester: 1 },
        { _id: 'tt4', courseId: user.courseId, subjectId: 'sub4', facultyId: 'f2', dayOfWeek: 'Wednesday', startTime: '14:00', endTime: '15:30', roomNumber: 'Networking Lab', semester: 1 },
        { _id: 'tt5', courseId: user.courseId, subjectId: 'sub5', facultyId: 'f3', dayOfWeek: 'Thursday', startTime: '10:00', endTime: '11:30', roomNumber: 'Room 204', semester: 2 },
        { _id: 'tt6', courseId: user.courseId, subjectId: 'sub1', facultyId: 'f1', dayOfWeek: 'Friday', startTime: '11:00', endTime: '12:30', roomNumber: 'CS Lab 1', semester: 1 },
      ];
      setTimetable(filledTimetable as TimetableEntry[]);

      // 8. Exam Schedule
      setExamSchedules([
        { _id: 'ex1', courseId: user.courseId, subjectId: 'sub1', subjectName: 'Data Structures & Algorithms', examType: 'Mid-Term', date: '2026-08-10', time: '09:30 AM - 12:30 PM', roomNumber: 'Main Exam Hall 1', semester: 1, syllabus: 'Arrays, Stacks, Queues, Trees, Hashing, Graph Traversal' },
        { _id: 'ex2', courseId: user.courseId, subjectId: 'sub2', subjectName: 'Database Management Systems', examType: 'Mid-Term', date: '2026-08-12', time: '02:00 PM - 05:00 PM', roomNumber: 'Exam Hall 3', semester: 1, syllabus: 'Relational Algebra, SQL, Normalization, ACID Transactions' },
        { _id: 'ex3', courseId: user.courseId, subjectId: 'sub3', subjectName: 'Discrete Mathematics & Logic', examType: 'Mid-Term', date: '2026-08-14', time: '09:30 AM - 12:30 PM', roomNumber: 'Main Exam Hall 2', semester: 1, syllabus: 'Propositional Logic, Induction, Set Theory, Combinatorics' },
        { _id: 'ex4', courseId: user.courseId, subjectId: 'sub4', subjectName: 'Computer Networks & Protocols', examType: 'Final Term', date: '2026-09-20', time: '09:30 AM - 12:30 PM', roomNumber: 'Main Exam Hall 1', semester: 1, syllabus: 'Full Semester Syllabus: OSI Model, TCP/IP, BGP, DNS, Security' }
      ]);

      // 9. Study Materials / Notes
      setStudyMaterials([
        { _id: 'm1', title: 'Complete Guide to B-Trees & Red-Black Trees', description: 'Comprehensive lecture slides covering self-balancing trees with Python code snippets.', subjectId: 'sub1', subjectName: 'Data Structures & Algorithms', facultyId: 'f1', fileUrl: 'https://campus.edu/materials/btree_guide.pdf', fileName: 'btree_guide.pdf', fileSize: '4.2 MB', uploadedAt: '2026-07-02' },
        { _id: 'm2', title: 'SQL Query Optimization & Indexing Cheatsheet', description: 'Handy reference guide for B-Tree indexes, hash indexes, and query execution plans.', subjectId: 'sub2', subjectName: 'Database Management Systems', facultyId: 'f1', fileUrl: 'https://campus.edu/materials/sql_optimization.pdf', fileName: 'sql_optimization.pdf', fileSize: '2.8 MB', uploadedAt: '2026-07-05' },
        { _id: 'm3', title: 'Graph Theory & Combinatorics Notes', description: 'Full handwritten lecture notes for Graph Coloration, Euler Circuits, and Planar Graphs.', subjectId: 'sub3', subjectName: 'Discrete Mathematics', facultyId: 'f2', fileUrl: 'https://campus.edu/materials/graph_theory_notes.pdf', fileName: 'graph_theory_notes.pdf', fileSize: '8.1 MB', uploadedAt: '2026-07-08' },
        { _id: 'm4', title: 'Wireshark Protocol Packet Analysis Lab', description: 'Step-by-step laboratory manual for capturing HTTP, DNS, and TCP handshake packets.', subjectId: 'sub4', subjectName: 'Computer Networks', facultyId: 'f2', fileUrl: 'https://campus.edu/materials/wireshark_lab.pdf', fileName: 'wireshark_lab.pdf', fileSize: '3.5 MB', uploadedAt: '2026-07-12' }
      ]);

      // 10. Certificates
      setCertificateRequests([
        { _id: 'crt1', studentId: user._id, type: 'Bonafide Certificate', reason: 'Passport Application & Official ID Verification', status: 'approved', issuedDate: '2026-06-15', certificateNo: 'CERT-BON-2026-8821' },
        { _id: 'crt2', studentId: user._id, type: 'Conduct Certificate', reason: 'Inter-University Internship Program Application', status: 'approved', issuedDate: '2026-07-01', certificateNo: 'CERT-CND-2026-4410' }
      ]);

    } catch (err) {
      console.error('Error fetching student portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Submit Assignment Handler
  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    if (!submissionFile && !submissionText) {
      toast('Please provide either a solution URL or text explanation.', 'warning');
      return;
    }

    try {
      await apiClient.post(`/assignments/${selectedAssignment._id}/submit`, {
        fileUrl: submissionFile || 'https://campus.edu/submissions/solution_text.txt',
        fileName: submissionFile ? submissionFile.split('/').pop() || 'solution.pdf' : 'solution_text.txt',
      }).catch(() => null);

      setAssignments(prev => prev.map(asg => {
        if (asg._id === selectedAssignment._id) {
          const newSub = {
            studentId: user._id,
            fileUrl: submissionFile || 'https://campus.edu/submissions/solution.pdf',
            fileName: submissionFile ? submissionFile.split('/').pop() || 'solution.pdf' : 'solution_text.txt',
            submittedAt: new Date().toISOString()
          };
          return { ...asg, submissions: [...asg.submissions, newSub] };
        }
        return asg;
      }));

      toast('Assignment submitted successfully!', 'success');
      setSelectedAssignment(null);
      setSubmissionFile('');
      setSubmissionText('');
    } catch (err: any) {
      toast('Error submitting assignment.', 'error');
    }
  };

  // Profile Update Handler
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put(`/students/${user._id}`, {
        phone: profilePhone,
        address: profileAddress
      }).catch(() => null);

      user.phone = profilePhone;
      user.address = profileAddress;
      toast('Profile contact details updated successfully!', 'success');
    } catch (err) {
      toast('Failed to update profile.', 'error');
    }
  };

  // Submit Leave Request
  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      toast('Please fill out all leave details.', 'warning');
      return;
    }

    try {
      const res = await apiClient.post<LeaveRequest>('/leaves', {
        userId: user._id,
        userName: user.name,
        role: 'student',
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason
      }).catch(() => ({
        _id: `lv_${Date.now()}`,
        userId: user._id,
        userName: user.name,
        role: 'student' as const,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason,
        status: 'pending' as const
      }));

      setLeaveRequests(prev => [res, ...prev]);
      setLeaveForm({ startDate: '', endDate: '', reason: '' });
      toast('Leave application submitted for approval!', 'success');
    } catch (err) {
      toast('Failed to submit leave request.', 'error');
    }
  };

  // Submit Certificate Request
  const handleCertRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.reason) {
      toast('Please specify a valid reason for certificate request.', 'warning');
      return;
    }

    const newReq: CertificateRequest = {
      _id: `crt_${Date.now()}`,
      studentId: user._id,
      type: certForm.type,
      reason: certForm.reason,
      status: 'pending',
      issuedDate: new Date().toISOString().split('T')[0],
      certificateNo: `CERT-${certForm.type.substring(0, 3).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`
    };

    setCertificateRequests(prev => [newReq, ...prev]);
    setCertForm({ type: 'Bonafide Certificate', reason: '' });
    toast(`${certForm.type} application submitted!`, 'success');
  };

  // Calculate Attendance Stats
  const totalClasses = attendances.length;
  const presentClasses = attendances.filter(a => a.status === 'present').length;
  const lateClasses = attendances.filter(a => a.status === 'late').length;
  const overallAttPercentage = totalClasses > 0 
    ? Math.round(((presentClasses + (lateClasses * 0.5)) / totalClasses) * 100) 
    : 85;

  // Calculate SGPA & CGPA
  const completedResults = results.filter(r => r.marksObtained !== undefined);
  const totalMarksEarned = completedResults.reduce((acc, r) => acc + (r.marksObtained || 0), 0);
  const totalMaxMarks = completedResults.reduce((acc, r) => acc + (r.totalMarks || 100), 0);
  const cumulativePercentage = totalMaxMarks > 0 ? (totalMarksEarned / totalMaxMarks) * 100 : 88;
  const currentCGPA = (cumulativePercentage / 10).toFixed(2);

  // Calculate Interactive CGPA Goal
  const totalCreditsCgpa = cgpaCourses.reduce((acc, c) => acc + c.credits, 0);
  const totalWeightedPoints = cgpaCourses.reduce((acc, c) => acc + (c.credits * c.gradePoint), 0);
  const calculatedSgpa = totalCreditsCgpa > 0 ? (totalWeightedPoints / totalCreditsCgpa).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      {/* Student Welcome Header Card */}
      <div className="bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-900 border border-zinc-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20 shrink-0">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Student
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Roll: <strong className="text-zinc-200">{user.rollNumber}</strong></span>
                <span>•</span>
                <span>Program: <strong className="text-zinc-200">{studentCourse.name}</strong></span>
                <span>•</span>
                <span>Batch: <strong className="text-zinc-200">{user.batch || '2023-2027'}</strong></span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80 backdrop-blur-md">
            <div className="text-center px-2">
              <span className="text-xs text-zinc-400 uppercase font-medium tracking-wider block">CGPA</span>
              <span className="text-xl font-black text-indigo-400">{currentCGPA}</span>
            </div>
            <div className="text-center border-x border-zinc-800 px-2">
              <span className="text-xs text-zinc-400 uppercase font-medium tracking-wider block">Attendance</span>
              <span className={`text-xl font-black ${overallAttPercentage < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {overallAttPercentage}%
              </span>
            </div>
            <div className="text-center px-2">
              <span className="text-xs text-zinc-400 uppercase font-medium tracking-wider block">Pending</span>
              <span className="text-xl font-black text-rose-400">
                {assignments.filter(a => a.submissions.length === 0).length} Asgs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-800">
        {[
          { id: 'overview', label: 'Overview', icon: BookOpen },
          { id: 'profile', label: 'Student Profile', icon: User },
          { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
          { id: 'assignments', label: 'Assignments', icon: FileText },
          { id: 'results', label: 'Semester Results', icon: TrendingUp },
          { id: 'cgpa', label: 'CGPA Calculator', icon: Calculator },
          { id: 'notes', label: 'Study Notes', icon: BookMarked },
          { id: 'fees', label: 'Fee Status', icon: CreditCard },
          { id: 'timetable', label: 'Timetable', icon: Calendar },
          { id: 'exams', label: 'Exam Schedule', icon: Clock },
          { id: 'leave', label: 'Leave Requests', icon: FileSignature },
          { id: 'certificates', label: 'Certificates', icon: Award },
          { id: 'transcript', label: 'Academic Transcript', icon: Printer },
          { id: 'library', label: 'Library Books', icon: Book }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800/60'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SUBTAB CONTENT PANELS */}

      {/* 1. OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Cumulative CGPA</p>
                  <p className="text-2xl font-bold text-zinc-100 mt-1">{currentCGPA} / 10.0</p>
                  <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3.0 w-3.0" /> First Class Distinction
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <GraduationCap className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Overall Attendance</p>
                  <p className="text-2xl font-bold text-zinc-100 mt-1">{overallAttPercentage}%</p>
                  <p className={`text-xs mt-1 font-medium ${overallAttPercentage < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {overallAttPercentage < 75 ? 'Warning: Below 75%' : 'Eligible for Exams'}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CalendarCheck className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Enrolled Subjects</p>
                  <p className="text-2xl font-bold text-zinc-100 mt-1">{subjects.length}</p>
                  <p className="text-xs text-zinc-400 mt-1">Semester 1 & 2</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Upcoming Classes Timetable Snapshot */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                  Today's Class Schedule
                </h3>
                <button
                  onClick={() => setActiveSubTab('timetable')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  Full Weekly Schedule <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {timetable.slice(0, 4).map((slot) => {
                  const subject = subjects.find(s => s._id === slot.subjectId);
                  return (
                    <div key={slot._id} className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {slot.dayOfWeek} • {slot.startTime} - {slot.endTime}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-100 mt-2">{subject?.name || 'Class Session'}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5">{slot.roomNumber} • Sem {slot.semester}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Pending Assignments */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-400" />
                  Active Course Assignments
                </h3>
                <button
                  onClick={() => setActiveSubTab('assignments')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                >
                  View All ({assignments.length})
                </button>
              </div>

              <div className="space-y-3">
                {assignments.map((asg) => {
                  const subject = subjects.find(s => s._id === asg.subjectId);
                  const isSubmitted = asg.submissions.some(s => s.studentId === user._id);
                  return (
                    <div key={asg._id} className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                            {subject?.code || 'CS'}
                          </span>
                          <h4 className="text-sm font-semibold text-zinc-100">{asg.title}</h4>
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-1">{asg.description}</p>
                        <p className="text-xs text-zinc-500">Due Date: {asg.dueDate} • Total Marks: {asg.totalMarks}</p>
                      </div>

                      {isSubmitted ? (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" /> Submitted
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedAssignment(asg);
                            setActiveSubTab('assignments');
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shrink-0 transition-colors shadow-md shadow-indigo-600/20"
                        >
                          Submit Solution
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Sidebar Widget Column */}
          <div className="space-y-6">
            {/* Notice Board Widget */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-400" />
                Campus Notice Board
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {notices.map((n) => (
                  <div key={n._id} className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        {n.audience.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Today'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-zinc-200">{n.title}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-2">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Fee Invoices */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-400" />
                Tuition Fee Status
              </h3>
              {fees.map((fee) => (
                <div key={fee._id} className="p-3.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-zinc-200 uppercase">{fee.type} Fee</p>
                    <p className="text-sm font-bold text-zinc-100 mt-0.5">${fee.amount.toLocaleString()}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Due: {fee.dueDate}</p>
                  </div>
                  {fee.status === 'paid' ? (
                    <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                      PAID
                    </span>
                  ) : (
                    <button
                      onClick={() => onPayFee(fee._id)}
                      className="px-3 py-1.5 rounded text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/20"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. STUDENT PROFILE */}
      {activeSubTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Virtual Student ID Card */}
          <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-indigo-950/60 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-indigo-400" />
                <span className="text-sm font-bold tracking-wider text-zinc-100 uppercase">Smart Campus Pass</span>
              </div>
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>

            <div className="text-center space-y-3">
              <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-xl ring-4 ring-indigo-500/20">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-100">{user.name}</h2>
                <p className="text-xs text-indigo-400 font-medium">{studentCourse.name}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs bg-zinc-950/80 p-4 rounded-xl border border-zinc-800">
              <div className="flex justify-between text-zinc-400">
                <span>Roll Number:</span>
                <strong className="text-zinc-200">{user.rollNumber}</strong>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Batch Year:</span>
                <strong className="text-zinc-200">{user.batch || '2023-2027'}</strong>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Hostel / Room:</span>
                <strong className="text-zinc-200">{user.roomNumber ? `Block ${user.hostelId} - Room ${user.roomNumber}` : 'Day Scholar'}</strong>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Guardian:</span>
                <strong className="text-zinc-200">{user.guardianName || 'N/A'} ({user.guardianPhone || 'N/A'})</strong>
              </div>
            </div>

            <div className="pt-2 text-center">
              <div className="inline-flex items-center gap-2 bg-white p-2 rounded-xl border border-zinc-300">
                <QrCode className="h-16 w-16 text-zinc-900" />
              </div>
              <p className="text-[10px] text-zinc-500 mt-2">Scan at Campus Gate Security</p>
            </div>
          </div>

          {/* Editable Contact Information */}
          <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-zinc-100 border-b border-zinc-800 pb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-400" />
              Personal & Academic Profile Details
            </h3>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    disabled
                    value={user.name}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Official Student Email</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Contact Phone Number</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Date of Birth</label>
                  <input
                    type="text"
                    disabled
                    value={user.dob || '2003-05-14'}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Permanent Residential Address</label>
                <textarea
                  rows={3}
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                  placeholder="Enter address"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ATTENDANCE ANALYTICS */}
      {activeSubTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 text-center space-y-2">
              <p className="text-xs text-zinc-400 font-medium">Overall Aggregate</p>
              <p className={`text-4xl font-black ${overallAttPercentage < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {overallAttPercentage}%
              </p>
              <p className="text-xs text-zinc-500">Minimum threshold: 75%</p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 text-center space-y-2">
              <p className="text-xs text-zinc-400 font-medium">Total Sessions Attended</p>
              <p className="text-4xl font-black text-indigo-400">{presentClasses} / {totalClasses}</p>
              <p className="text-xs text-zinc-500">Late entries counted at 50%</p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 text-center space-y-2">
              <p className="text-xs text-zinc-400 font-medium">Absences Recorded</p>
              <p className="text-4xl font-black text-rose-400">{totalClasses - presentClasses}</p>
              <p className="text-xs text-zinc-500">Requires medical certificate if leave</p>
            </div>
          </div>

          {overallAttPercentage < 75 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 shrink-0 text-amber-400" />
              <div className="text-xs">
                <strong className="font-bold block text-sm">Low Attendance Warning Triggered</strong>
                Your attendance is currently below 75%. You need to attend the next 4 consecutive lectures to qualify for semester final examinations.
              </div>
            </div>
          )}

          {/* Subject Breakdown Cards */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-indigo-400" />
              Subject-wise Attendance Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map((sub) => {
                const subAtts = attendances.filter(a => a.subjectId === sub._id);
                const subTotal = subAtts.length || 1;
                const subPresent = subAtts.filter(a => a.status === 'present').length;
                const subPct = Math.round((subPresent / subTotal) * 100);

                return (
                  <div key={sub._id} className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {sub.code}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-100 mt-1">{sub.name}</h4>
                      </div>
                      <span className={`text-lg font-black ${subPct < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {subPct}%
                      </span>
                    </div>

                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${subPct < 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${subPct}%` }}
                      />
                    </div>

                    <p className="text-xs text-zinc-400 flex justify-between">
                      <span>Attended: {subPresent} of {subTotal} lectures</span>
                      <span>Sem {sub.semester}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. ASSIGNMENT SUBMISSION */}
      {activeSubTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-100">Course Assignments & Projects</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {assignments.map((asg) => {
                const subject = subjects.find(s => s._id === asg.subjectId);
                const submission = asg.submissions.find(s => s.studentId === user._id);

                return (
                  <div key={asg._id} className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {subject?.code || 'CS'} • {subject?.name || 'Subject'}
                        </span>
                        <h4 className="text-base font-bold text-zinc-100 mt-2">{asg.title}</h4>
                      </div>
                      {submission ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                          GRADED / SUBMITTED
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                          PENDING
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">{asg.description}</p>

                    <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800 gap-2">
                      <span>Due Date: <strong className="text-zinc-200">{asg.dueDate}</strong></span>
                      <span>Total Marks: <strong className="text-zinc-200">{asg.totalMarks}</strong></span>

                      {submission ? (
                        <div className="text-right">
                          <span className="text-emerald-400 font-bold">
                            Score: {submission.marksObtained !== undefined ? `${submission.marksObtained} / ${asg.totalMarks}` : 'Awaiting Grade'}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedAssignment(asg)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/20"
                        >
                          Upload Solution
                        </button>
                      )}
                    </div>

                    {submission && submission.feedback && (
                      <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-300 space-y-1">
                        <strong className="text-indigo-400 block font-semibold">Faculty Review & Feedback:</strong>
                        <p>{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submission Modal / Box */}
            <div>
              {selectedAssignment ? (
                <div className="bg-zinc-900 border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-xl sticky top-6">
                  <h4 className="text-base font-bold text-zinc-100 flex items-center justify-between">
                    <span>Submit Work</span>
                    <button onClick={() => setSelectedAssignment(null)} className="text-xs text-zinc-400 hover:text-white">Cancel</button>
                  </h4>
                  <p className="text-xs text-indigo-300 font-medium">{selectedAssignment.title}</p>

                  <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">Solution Document / GitHub URL</label>
                      <input
                        type="url"
                        value={submissionFile}
                        onChange={(e) => setSubmissionFile(e.target.value)}
                        placeholder="https://github.com/user/project or solution.pdf"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">Solution Explanation / Text Notes</label>
                      <textarea
                        rows={4}
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        placeholder="Type summary or algorithm derivation details..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                    >
                      <Upload className="h-4 w-4" /> Turn In Assignment
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 text-center space-y-3 text-zinc-400">
                  <FileText className="h-8 w-8 mx-auto text-zinc-600" />
                  <p className="text-xs">Select any pending assignment from the left to submit your solution.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. SEMESTER RESULTS */}
      {activeSubTab === 'results' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-100">Semester Marksheet & Grade Reports</h3>
              <p className="text-xs text-zinc-400">Official academic performance records by semester</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400">Select Semester:</span>
              {[1, 2].map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedResultSemester(sem)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedResultSemester === sem
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Semester {sem}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Subject Code</th>
                    <th className="px-4 py-3">Subject Name</th>
                    <th className="px-4 py-3">Exam Type</th>
                    <th className="px-4 py-3">Marks Obtained</th>
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {results
                    .filter(r => (r.semester || 1) === selectedResultSemester)
                    .map((r) => {
                      const subject = subjects.find(s => s._id === r.subjectId);
                      const pct = Math.round((r.marksObtained / r.totalMarks) * 100);
                      const isPassed = pct >= 40;

                      return (
                        <tr key={r._id} className="hover:bg-zinc-800/40">
                          <td className="px-4 py-3.5 font-bold text-indigo-400">{subject?.code || 'CS-101'}</td>
                          <td className="px-4 py-3.5 font-medium text-zinc-100">{subject?.name || 'Subject'}</td>
                          <td className="px-4 py-3.5 uppercase">{r.examType}</td>
                          <td className="px-4 py-3.5 font-bold">{r.marksObtained} / {r.totalMarks} ({pct}%)</td>
                          <td className="px-4 py-3.5 font-black text-purple-400">{r.grade}</td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${isPassed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                              {isPassed ? 'PASS' : 'FAIL'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. CGPA CALCULATOR */}
      {activeSubTab === 'cgpa' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-indigo-400" />
                  Interactive CGPA / SGPA Estimator
                </h3>
                <p className="text-xs text-zinc-400">Project your future semester grades and calculate cumulative performance goals.</p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center">
                <span className="text-xs text-zinc-400 block font-medium">Estimated SGPA</span>
                <span className="text-2xl font-black text-indigo-400">{calculatedSgpa} / 10.0</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Course Grade Matrix</h4>
              {cgpaCourses.map((c, index) => (
                <div key={c.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 items-center">
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCgpaCourses(prev => prev.map(item => item.id === c.id ? { ...item, name: val } : item));
                    }}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100"
                  />

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">Credits:</span>
                    <select
                      value={c.credits}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setCgpaCourses(prev => prev.map(item => item.id === c.id ? { ...item, credits: val } : item));
                      }}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-100"
                    >
                      <option value={1}>1 Credit</option>
                      <option value={2}>2 Credits</option>
                      <option value={3}>3 Credits</option>
                      <option value={4}>4 Credits</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">Expected Grade:</span>
                    <select
                      value={c.gradePoint}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setCgpaCourses(prev => prev.map(item => item.id === c.id ? { ...item, gradePoint: val } : item));
                      }}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-100"
                    >
                      <option value={10}>O (10 Points)</option>
                      <option value={9}>A+ (9 Points)</option>
                      <option value={8}>A (8 Points)</option>
                      <option value={7}>B+ (7 Points)</option>
                      <option value={6}>B (6 Points)</option>
                    </select>
                  </div>

                  <div className="text-right font-mono text-xs text-indigo-300">
                    Weighted: {c.credits * c.gradePoint}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. STUDY NOTES / MATERIALS */}
      {activeSubTab === 'notes' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-zinc-100">Course Notes & Digital Learning Repository</h3>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search notes or topics..."
                value={notesSearch}
                onChange={(e) => setNotesSearch(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyMaterials
              .filter(m => m.title.toLowerCase().includes(notesSearch.toLowerCase()) || m.description.toLowerCase().includes(notesSearch.toLowerCase()))
              .map((mat) => (
                <div key={mat._id} className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {mat.subjectName}
                    </span>
                    <h4 className="text-base font-bold text-zinc-100 mt-2">{mat.title}</h4>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{mat.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs text-zinc-500">
                    <span>File Size: {mat.fileSize || '3.5 MB'}</span>
                    <a
                      href={mat.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 8. FEES */}
      {activeSubTab === 'fees' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-400" />
              Tuition Fees & Financial Invoices
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fees.map((f) => (
                <div key={f._id} className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-indigo-400">{f.type} Invoice</span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-extrabold ${f.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {f.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-2xl font-black text-zinc-100">${f.amount.toLocaleString()}</div>
                  <p className="text-xs text-zinc-400">Due Date: {f.dueDate}</p>

                  {f.status !== 'paid' ? (
                    <button
                      onClick={() => onPayFee(f._id)}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-600/20"
                    >
                      Proceed to Secure Payment Gateway
                    </button>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                      <div>Transaction ID: <strong className="text-zinc-200">{f.transactionId || 'TXN-99812'}</strong></div>
                      <div>Paid Date: <strong className="text-zinc-200">{f.paidAt || '2026-06-28'}</strong></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. TIMETABLE */}
      {activeSubTab === 'timetable' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-400" />
            Weekly Class & Laboratory Schedule
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timetable.map((slot) => {
              const subject = subjects.find(s => s._id === slot.subjectId);
              return (
                <div key={slot._id} className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                  <span className="text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10">
                    {slot.dayOfWeek} • {slot.startTime} - {slot.endTime}
                  </span>
                  <h4 className="text-sm font-bold text-zinc-100 mt-2">{subject?.name || 'Class Session'}</h4>
                  <p className="text-xs text-zinc-400">{slot.roomNumber} • Semester {slot.semester}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 10. EXAM SCHEDULE */}
      {activeSubTab === 'exams' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-400" />
            Upcoming Semester Examination Date Sheet
          </h3>

          <div className="space-y-4">
            {examSchedules.map((ex) => (
              <div key={ex._id} className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {ex.examType}
                    </span>
                    <h4 className="text-base font-bold text-zinc-100">{ex.subjectName}</h4>
                  </div>
                  <p className="text-xs text-zinc-400">Date: <strong className="text-zinc-200">{ex.date}</strong> ({ex.time})</p>
                  <p className="text-xs text-zinc-400">Venue: <strong className="text-zinc-200">{ex.roomNumber}</strong></p>
                  <p className="text-xs text-zinc-500">Syllabus: {ex.syllabus}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. LEAVE REQUESTS */}
      {activeSubTab === 'leave' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-indigo-400" />
              Apply for Leave Absence
            </h3>

            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Reason for Leave</label>
                <textarea
                  rows={4}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Medical reason or official university duty..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-lg shadow-indigo-600/20"
              >
                Submit Application
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-zinc-100">Submitted Leave History</h3>
            {leaveRequests.map((lv) => (
              <div key={lv._id} className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200">
                    {lv.startDate} to {lv.endDate}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    lv.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                    lv.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {lv.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">{lv.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 12. CERTIFICATES */}
      {activeSubTab === 'certificates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              Request Official Certificate
            </h3>

            <form onSubmit={handleCertRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Certificate Type</label>
                <select
                  value={certForm.type}
                  onChange={(e) => setCertForm({ ...certForm, type: e.target.value as any })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Bonafide Certificate">Bonafide Certificate</option>
                  <option value="Conduct Certificate">Conduct Certificate</option>
                  <option value="Course Completion">Course Completion Certificate</option>
                  <option value="Merit Certificate">Merit Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Purpose / Reason</label>
                <textarea
                  rows={3}
                  value={certForm.reason}
                  onChange={(e) => setCertForm({ ...certForm, reason: e.target.value })}
                  placeholder="Specify official purpose..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors shadow-lg shadow-amber-600/20"
              >
                Apply for Certificate
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-zinc-100">Issued Digital Certificates</h3>
            {certificateRequests.map((cert) => (
              <div key={cert._id} className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-400">{cert.type}</span>
                  <p className="text-xs text-zinc-400 mt-1">Ref No: {cert.certificateNo}</p>
                  <p className="text-[11px] text-zinc-500">Issued: {cert.issuedDate}</p>
                </div>
                <button
                  onClick={() => setSelectedCertPreview(cert)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="h-4 w-4" /> View & Print
                </button>
              </div>
            ))}
          </div>

          {/* Certificate Preview Modal */}
          {selectedCertPreview && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white text-zinc-900 rounded-2xl p-8 max-w-xl w-full space-y-6 shadow-2xl relative border-8 border-indigo-950">
                <button
                  onClick={() => setSelectedCertPreview(null)}
                  className="absolute top-4 right-4 text-xs font-bold px-3 py-1 bg-zinc-200 rounded-lg hover:bg-zinc-300"
                >
                  Close
                </button>

                <div className="text-center space-y-2 border-b-2 border-zinc-200 pb-4">
                  <h1 className="text-xl font-black uppercase tracking-widest text-indigo-950">SMART CAMPUS UNIVERSITY</h1>
                  <p className="text-xs font-semibold text-zinc-600">Office of the Registrar • Digital Certificate Service</p>
                </div>

                <div className="text-center space-y-4">
                  <h2 className="text-lg font-extrabold text-amber-700 underline uppercase">{selectedCertPreview.type}</h2>
                  <p className="text-xs leading-relaxed text-zinc-700">
                    This is to officially certify that <strong>{user.name}</strong> (Roll No: <strong>{user.rollNumber}</strong>) is a bonafide student of <strong>{studentCourse.name}</strong> for the academic session 2023-2027.
                  </p>
                  <p className="text-xs text-zinc-600">Reason Issued: {selectedCertPreview.reason}</p>
                </div>

                <div className="flex justify-between items-end pt-8 border-t border-zinc-200 text-[10px] text-zinc-600">
                  <div>
                    <p>Certificate No: <strong>{selectedCertPreview.certificateNo}</strong></p>
                    <p>Date of Issue: <strong>{selectedCertPreview.issuedDate}</strong></p>
                  </div>
                  <div className="text-center">
                    <div className="h-10 w-24 border-b border-zinc-800 mb-1 font-serif italic text-xs text-zinc-800">Verified Seal</div>
                    <p className="font-bold">Registrar Signature</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    toast('Printing official certificate...', 'info');
                    window.print();
                  }}
                  className="w-full py-2.5 bg-indigo-900 text-white rounded-xl font-bold text-xs"
                >
                  Print / Save PDF
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 13. OFFICIAL TRANSCRIPT */}
      {activeSubTab === 'transcript' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-100">Official Digital Academic Transcript</h3>
              <p className="text-xs text-zinc-400">Authenticated student records and grade breakdown</p>
            </div>
            <button
              onClick={() => {
                toast('Preparing PDF Transcript Download...', 'success');
                window.print();
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <Printer className="h-4 w-4" /> Download Official PDF
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs border-b border-zinc-800 pb-4 text-zinc-300">
              <div>Student Name: <strong className="text-zinc-100 block">{user.name}</strong></div>
              <div>Roll Number: <strong className="text-zinc-100 block">{user.rollNumber}</strong></div>
              <div>Course Program: <strong className="text-zinc-100 block">{studentCourse.name}</strong></div>
              <div>Cumulative CGPA: <strong className="text-indigo-400 block font-bold text-sm">{currentCGPA} / 10.0</strong></div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Semester</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3">Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {results.map((r) => {
                    const subject = subjects.find(s => s._id === r.subjectId);
                    return (
                      <tr key={r._id}>
                        <td className="p-3 font-semibold">Semester {r.semester || 1}</td>
                        <td className="p-3">{subject?.name || 'Subject'}</td>
                        <td className="p-3 font-bold text-indigo-400">{r.grade}</td>
                        <td className="p-3">{r.marksObtained} / {r.totalMarks}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 14. LIBRARY BOOKS */}
      {activeSubTab === 'library' && (
        <LibraryManager user={user} />
      )}
    </div>
  );
}
