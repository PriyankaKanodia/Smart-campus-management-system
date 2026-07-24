import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  FileText, 
  BookOpen, 
  Users, 
  Calendar, 
  GraduationCap, 
  Search, 
  Upload, 
  Award, 
  FileSignature, 
  Check, 
  AlertTriangle,
  FileSpreadsheet,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  UserCheck,
  Send,
  Building,
  ShieldCheck,
  Bell,
  BarChart2,
  ListFilter,
  BookMarked
} from 'lucide-react';
import { 
  Faculty, 
  Student, 
  Course, 
  Subject, 
  Attendance, 
  Assignment, 
  Result, 
  LeaveRequest, 
  TimetableEntry,
  StudyMaterial,
  ClassSchedule,
  Notice
} from '../types';
import { apiClient } from '../utils/apiClient';
import { useToast } from './Toast';
import LibraryManager from './LibraryManager';

interface FacultyDashboardProps {
  user: Faculty;
  courses: Course[];
  students: Student[];
}

export default function FacultyDashboard({
  user,
  courses,
  students
}: FacultyDashboardProps) {
  const { toast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<
    'attendance' | 'assignments' | 'grading' | 'reports' | 'timetable' | 
    'leaves' | 'profile' | 'subjects' | 'scheduling' | 'notices' | 
    'materials' | 'marks' | 'library'
  >('attendance');

  // Core Data
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [classSchedules, setClassSchedules] = useState<ClassSchedule[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  // Attendance Marking State
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [markingGrid, setMarkingGrid] = useState<Record<string, 'present' | 'absent' | 'late'>>({});

  // New Assignment Modal / Form
  const [isAsgModalOpen, setIsAsgModalOpen] = useState(false);
  const [newAsgForm, setNewAsgForm] = useState({
    title: '',
    description: '',
    subjectId: '',
    dueDate: '',
    totalMarks: 100
  });

  // Grading Modal State
  const [selectedSubmissionToGrade, setSelectedSubmissionToGrade] = useState<{
    asgId: string;
    asgTitle: string;
    studentId: string;
    studentName: string;
    fileUrl: string;
    submittedAt: string;
    totalMarks: number;
    existingScore?: number;
    existingFeedback?: string;
  } | null>(null);
  const [gradeInputScore, setGradeInputScore] = useState<number>(90);
  const [gradeInputFeedback, setGradeInputFeedback] = useState<string>('');

  // Study Material Form
  const [isMatModalOpen, setIsMatModalOpen] = useState(false);
  const [newMatForm, setNewMatForm] = useState({
    title: '',
    description: '',
    subjectId: '',
    fileUrl: ''
  });

  // Schedule Extra Class Form
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    subjectId: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM - 11:30 AM',
    roomNumber: 'Lab Block A',
    type: 'Extra Class' as ClassSchedule['type']
  });

  // Announcement Form
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    audience: 'students' as Notice['audience']
  });

  // Result / Marks Entry Form
  const [marksForm, setMarksForm] = useState({
    studentId: '',
    subjectId: '',
    examType: 'midterm' as Result['examType'],
    marksObtained: 85,
    totalMarks: 100,
    grade: 'A+',
    remarks: 'Excellent work',
    semester: 1
  });

  // Faculty Profile Phone/Address state
  const [facultyPhone, setFacultyPhone] = useState(user.phone || '');
  const [facultyDept, setFacultyDept] = useState(user.department || 'Computer Science & Engineering');

  // Performance Report Search
  const [reportSearchStudent, setReportSearchStudent] = useState('');

  useEffect(() => {
    fetchFacultyData();
  }, [user]);

  const fetchFacultyData = async () => {
    setLoading(true);
    try {
      // 1. Subjects assigned to faculty
      const subjectsList = await apiClient.get<Subject[]>('/subjects').catch(() => []);
      const facultySubs = subjectsList.filter(s => s.facultyId === user._id || user.subjects?.includes(s._id));
      const filledSubjects = facultySubs.length > 0 ? facultySubs : [
        { _id: 'sub1', name: 'Data Structures & Algorithms', code: 'CS-201', courseId: 'c1', facultyId: user._id, semester: 1 },
        { _id: 'sub2', name: 'Database Management Systems', code: 'CS-202', courseId: 'c1', facultyId: user._id, semester: 1 },
      ];
      setSubjects(filledSubjects);
      if (filledSubjects.length > 0) {
        setSelectedSubject(filledSubjects[0]._id);
      }

      // 2. Attendance
      const attendanceList = await apiClient.get<Attendance[]>('/attendance').catch(() => []);
      setAttendanceRecords(attendanceList);

      // 3. Assignments
      const assignmentList = await apiClient.get<Assignment[]>('/assignments').catch(() => []);
      const filledAssignments = assignmentList.length > 0 ? assignmentList : [
        {
          _id: 'asg1',
          title: 'Binary Search Trees & Red-Black Balancing',
          description: 'Implement a self-balancing tree visualizer in Python or TypeScript.',
          subjectId: 'sub1',
          facultyId: user._id,
          dueDate: '2026-07-28',
          totalMarks: 100,
          submissions: [
            {
              studentId: students[0]?._id || 'st1',
              fileUrl: 'https://campus.edu/submissions/dsa_sol.pdf',
              fileName: 'dsa_sol.pdf',
              submittedAt: '2026-07-10T14:00:00Z'
            }
          ]
        }
      ];
      setAssignments(filledAssignments as Assignment[]);

      // 4. Results
      const resultsList = await apiClient.get<Result[]>('/results').catch(() => []);
      setResults(resultsList);

      // 5. Leave Requests
      const leavesList = await apiClient.get<LeaveRequest[]>('/leaves').catch(() => []);
      setLeaveRequests(leavesList);

      // 6. Timetable
      const timetableList = await apiClient.get<TimetableEntry[]>('/timetable').catch(() => []);
      const filledTimetable = timetableList.filter(t => t.facultyId === user._id);
      const defaultTimetable = filledTimetable.length > 0 ? filledTimetable : [
        { _id: 'tt1', courseId: 'c1', subjectId: 'sub1', facultyId: user._id, dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:30', roomNumber: 'Auditorium 302', semester: 1 },
        { _id: 'tt2', courseId: 'c1', subjectId: 'sub2', facultyId: user._id, dayOfWeek: 'Monday', startTime: '11:00', endTime: '12:30', roomNumber: 'CS Lab 2', semester: 1 },
        { _id: 'tt3', courseId: 'c1', subjectId: 'sub1', facultyId: user._id, dayOfWeek: 'Wednesday', startTime: '10:00', endTime: '11:30', roomNumber: 'Room 204', semester: 1 }
      ];
      setTimetable(defaultTimetable as TimetableEntry[]);

      // 7. Extra Class Schedules
      setClassSchedules([
        { _id: 'cs1', title: 'Special Doubt Clearing Session: Red-Black Rotation', subjectId: 'sub1', facultyId: user._id, date: '2026-07-25', time: '04:00 PM - 05:30 PM', roomNumber: 'Lab Block B', type: 'Extra Class' }
      ]);

      // 8. Notices
      const noticesList = await apiClient.get<Notice[]>('/notices').catch(() => []);
      setNotices(noticesList);

      // 9. Materials
      setMaterials([
        { _id: 'm1', title: 'Red-Black Tree Rotations Lecture Deck', description: 'Slides on left/right rotations and insertion re-balancing.', subjectId: 'sub1', subjectName: 'Data Structures & Algorithms', facultyId: user._id, fileUrl: 'https://campus.edu/docs/redblack.pdf', fileName: 'redblack.pdf', fileSize: '3.1 MB', uploadedAt: '2026-07-01' }
      ]);

    } catch (err) {
      console.error('Error fetching faculty data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mark Attendance Grid Shortcuts
  const markAllPresent = () => {
    const grid: Record<string, 'present' | 'absent' | 'late'> = {};
    students.forEach(s => {
      grid[s._id] = 'present';
    });
    setMarkingGrid(grid);
    toast('Marked all students as Present in grid!', 'info');
  };

  const handleSaveAttendance = async () => {
    if (!selectedSubject) {
      toast('Please select a subject to record attendance.', 'warning');
      return;
    }

    try {
      const recordsToSave = Object.entries(markingGrid).map(([studentId, status]) => ({
        studentId,
        subjectId: selectedSubject,
        date: attendanceDate,
        status,
        markedBy: user._id
      }));

      for (const rec of recordsToSave) {
        await apiClient.post('/attendance', rec).catch(() => null);
      }

      toast(`Attendance saved successfully for ${recordsToSave.length} students!`, 'success');
      setMarkingGrid({});
    } catch (err) {
      toast('Failed to record attendance batch.', 'error');
    }
  };

  // Create New Assignment
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgForm.title || !newAsgForm.subjectId || !newAsgForm.dueDate) {
      toast('Please fill out assignment title, subject, and due date.', 'warning');
      return;
    }

    try {
      const res = await apiClient.post<Assignment>('/assignments', {
        ...newAsgForm,
        facultyId: user._id,
        submissions: []
      }).catch(() => ({
        _id: `asg_${Date.now()}`,
        ...newAsgForm,
        facultyId: user._id,
        submissions: []
      }));

      setAssignments(prev => [res, ...prev]);
      setIsAsgModalOpen(false);
      setNewAsgForm({ title: '', description: '', subjectId: '', dueDate: '', totalMarks: 100 });
      toast('New Assignment created and published!', 'success');
    } catch (err) {
      toast('Failed to create assignment.', 'error');
    }
  };

  // Submit Grade & Feedback for Student Submission
  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionToGrade) return;

    try {
      await apiClient.post(`/assignments/${selectedSubmissionToGrade.asgId}/grade`, {
        studentId: selectedSubmissionToGrade.studentId,
        marksObtained: gradeInputScore,
        feedback: gradeInputFeedback
      }).catch(() => null);

      setAssignments(prev => prev.map(asg => {
        if (asg._id === selectedSubmissionToGrade.asgId) {
          const updatedSubs = asg.submissions.map(s => {
            if (s.studentId === selectedSubmissionToGrade.studentId) {
              return { ...s, marksObtained: gradeInputScore, feedback: gradeInputFeedback };
            }
            return s;
          });
          return { ...asg, submissions: updatedSubs };
        }
        return asg;
      }));

      toast('Grade and feedback saved successfully!', 'success');
      setSelectedSubmissionToGrade(null);
    } catch (err) {
      toast('Failed to record grade.', 'error');
    }
  };

  // Leave Approval Action
  const handleReviewLeave = async (leaveId: string, status: 'approved' | 'rejected') => {
    try {
      await apiClient.post(`/leaves/${leaveId}/review`, {
        status,
        approvedBy: user._id
      }).catch(() => null);

      setLeaveRequests(prev => prev.map(l => l._id === leaveId ? { ...l, status, approvedBy: user._id } : l));
      toast(`Leave application ${status.toUpperCase()}!`, 'success');
    } catch (err) {
      toast('Failed to update leave status.', 'error');
    }
  };

  // Post Notice/Announcement
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.content) {
      toast('Please enter notice title and message content.', 'warning');
      return;
    }

    try {
      const res = await apiClient.post<Notice>('/notices', {
        title: noticeForm.title,
        content: noticeForm.content,
        audience: noticeForm.audience,
        authorId: user._id,
        authorName: user.name
      }).catch(() => ({
        _id: `not_${Date.now()}`,
        title: noticeForm.title,
        content: noticeForm.content,
        audience: noticeForm.audience,
        authorId: user._id,
        authorName: user.name,
        createdAt: new Date().toISOString()
      }));

      setNotices(prev => [res, ...prev]);
      setNoticeForm({ title: '', content: '', audience: 'students' });
      toast('Notice published to Campus Board!', 'success');
    } catch (err) {
      toast('Failed to publish notice.', 'error');
    }
  };

  // Add Marks / Result
  const handleAddResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marksForm.studentId || !marksForm.subjectId) {
      toast('Please select a student and subject.', 'warning');
      return;
    }

    try {
      const res = await apiClient.post<Result>('/results', marksForm).catch(() => ({
        _id: `res_${Date.now()}`,
        ...marksForm
      }));

      setResults(prev => [res, ...prev]);
      toast('Student exam result recorded successfully!', 'success');
    } catch (err) {
      toast('Failed to save result.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Faculty Welcome Header Card */}
      <div className="bg-gradient-to-r from-zinc-900 via-purple-950 to-zinc-900 border border-zinc-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/20 shrink-0">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {user.designation || 'Senior Professor'}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Emp ID: <strong className="text-zinc-200">{user.employeeId}</strong></span>
                <span>•</span>
                <span>Department: <strong className="text-zinc-200">{user.department}</strong></span>
                <span>•</span>
                <span>Assigned Subjects: <strong className="text-zinc-200">{subjects.length}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAsgModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
            >
              <Plus className="h-4 w-4" /> Create Assignment
            </button>
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs flex items-center gap-2 border border-zinc-700 transition-all"
            >
              <Calendar className="h-4 w-4" /> Schedule Extra Class
            </button>
          </div>
        </div>
      </div>

      {/* Faculty Navigation Subtabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-800">
        {[
          { id: 'attendance', label: 'Manage Attendance', icon: UserCheck },
          { id: 'assignments', label: 'Assignments', icon: FileText },
          { id: 'grading', label: 'Grade Submissions', icon: Award },
          { id: 'marks', label: 'Enter Marks & Grades', icon: GraduationCap },
          { id: 'reports', label: 'Student Reports', icon: BarChart2 },
          { id: 'timetable', label: 'Teaching Schedule', icon: Calendar },
          { id: 'leaves', label: 'Leave Approvals', icon: FileSignature },
          { id: 'subjects', label: 'Subject Management', icon: BookOpen },
          { id: 'scheduling', label: 'Class Scheduling', icon: Clock },
          { id: 'notices', label: 'Broadcast Notices', icon: Bell },
          { id: 'materials', label: 'Upload Notes', icon: Upload },
          { id: 'library', label: 'Library Catalog', icon: BookMarked },
          { id: 'profile', label: 'Faculty Profile', icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
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

      {/* 1. MANAGE ATTENDANCE */}
      {activeSubTab === 'attendance' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-purple-400" />
                Daily Student Attendance Register
              </h3>
              <p className="text-xs text-zinc-400">Select course subject and mark attendance status for enrolled students.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
              >
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>{s.code} - {s.name}</option>
                ))}
              </select>

              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
              />

              <button
                onClick={markAllPresent}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
              >
                Mark All Present
              </button>

              <button
                onClick={handleSaveAttendance}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20"
              >
                Save Attendance
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Batch</th>
                  <th className="p-3 text-center">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {students.map((st) => {
                  const status = markingGrid[st._id] || 'present';
                  return (
                    <tr key={st._id} className="hover:bg-zinc-800/40">
                      <td className="p-3 font-mono font-bold text-purple-400">{st.rollNumber}</td>
                      <td className="p-3 font-semibold text-zinc-100">{st.name}</td>
                      <td className="p-3 text-zinc-400">{st.batch || '2023-2027'}</td>
                      <td className="p-3 text-center">
                        <div className="inline-flex rounded-xl p-1 bg-zinc-950 border border-zinc-800 gap-1">
                          <button
                            type="button"
                            onClick={() => setMarkingGrid({ ...markingGrid, [st._id]: 'present' })}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              status === 'present' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => setMarkingGrid({ ...markingGrid, [st._id]: 'absent' })}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              status === 'absent' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => setMarkingGrid({ ...markingGrid, [st._id]: 'late' })}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              status === 'late' ? 'bg-amber-600 text-white' : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            Late
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ASSIGNMENTS */}
      {activeSubTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-100">Course Assignments Published</h3>
            <button
              onClick={() => setIsAsgModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> New Assignment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((asg) => {
              const subject = subjects.find(s => s._id === asg.subjectId);
              return (
                <div key={asg._id} className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {subject?.code || 'CS'} • {subject?.name || 'Subject'}
                  </span>
                  <h4 className="text-base font-bold text-zinc-100 mt-1">{asg.title}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-2">{asg.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs text-zinc-500">
                    <span>Due: {asg.dueDate} • Max: {asg.totalMarks} marks</span>
                    <span className="text-purple-400 font-bold">{asg.submissions.length} Turn-ins</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. GRADE SUBMISSIONS */}
      {activeSubTab === 'grading' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-400" />
            Review Student Submissions & Assign Grades
          </h3>

          <div className="space-y-4">
            {assignments.flatMap(asg => 
              asg.submissions.map(sub => {
                const student = students.find(s => s._id === sub.studentId);
                return (
                  <div key={`${asg._id}_${sub.studentId}`} className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-purple-400">{asg.title}</span>
                      <h4 className="text-sm font-bold text-zinc-100 mt-0.5">{student?.name || 'Student'} ({student?.rollNumber || 'ST-001'})</h4>
                      <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline mt-1 block">
                        View Submission File: {sub.fileName || 'solution.pdf'}
                      </a>
                    </div>

                    <div className="flex items-center gap-3">
                      {sub.marksObtained !== undefined ? (
                        <div className="text-right">
                          <span className="text-emerald-400 font-extrabold text-sm block">{sub.marksObtained} / {asg.totalMarks}</span>
                          <span className="text-[10px] text-zinc-500">Graded</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedSubmissionToGrade({
                            asgId: asg._id,
                            asgTitle: asg.title,
                            studentId: sub.studentId,
                            studentName: student?.name || 'Student',
                            fileUrl: sub.fileUrl,
                            submittedAt: sub.submittedAt,
                            totalMarks: asg.totalMarks
                          })}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                        >
                          Grade Solution
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Grading Modal */}
          {selectedSubmissionToGrade && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-4">
                <h3 className="text-base font-bold text-zinc-100">Grade Submission</h3>
                <p className="text-xs text-purple-300 font-semibold">{selectedSubmissionToGrade.asgTitle} • {selectedSubmissionToGrade.studentName}</p>

                <form onSubmit={handleGradeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Score Obtained (Out of {selectedSubmissionToGrade.totalMarks})</label>
                    <input
                      type="number"
                      max={selectedSubmissionToGrade.totalMarks}
                      value={gradeInputScore}
                      onChange={(e) => setGradeInputScore(parseInt(e.target.value) || 0)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Feedback / Written Evaluation</label>
                    <textarea
                      rows={3}
                      value={gradeInputFeedback}
                      onChange={(e) => setGradeInputFeedback(e.target.value)}
                      placeholder="Write evaluation remarks..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSubmissionToGrade(null)}
                      className="w-1/2 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
                    >
                      Submit Grade
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. ENTER MARKS & RESULTS */}
      {activeSubTab === 'marks' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-purple-400" />
            Enter Examination Marks & Final Letter Grades
          </h3>

          <form onSubmit={handleAddResult} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-950/80 p-5 rounded-xl border border-zinc-800">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Select Student</label>
              <select
                value={marksForm.studentId}
                onChange={(e) => setMarksForm({ ...marksForm, studentId: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
              >
                <option value="">-- Choose Student --</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Select Subject</label>
              <select
                value={marksForm.subjectId}
                onChange={(e) => setMarksForm({ ...marksForm, subjectId: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
              >
                <option value="">-- Choose Subject --</option>
                {subjects.map(sub => (
                  <option key={sub._id} value={sub._id}>{sub.code} - {sub.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Exam Type</label>
              <select
                value={marksForm.examType}
                onChange={(e) => setMarksForm({ ...marksForm, examType: e.target.value as any })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
              >
                <option value="midterm">Mid-Term Exam</option>
                <option value="final">Final Semester Exam</option>
                <option value="quiz">Class Quiz</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Marks Obtained</label>
              <input
                type="number"
                value={marksForm.marksObtained}
                onChange={(e) => setMarksForm({ ...marksForm, marksObtained: parseInt(e.target.value) || 0 })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Grade Letter</label>
              <input
                type="text"
                value={marksForm.grade}
                onChange={(e) => setMarksForm({ ...marksForm, grade: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20"
              >
                Save Exam Result
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. STUDENT REPORTS */}
      {activeSubTab === 'reports' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-purple-400" />
              Student Performance Analytics
            </h3>
            <input
              type="text"
              placeholder="Search student..."
              value={reportSearchStudent}
              onChange={(e) => setReportSearchStudent(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students
              .filter(st => st.name.toLowerCase().includes(reportSearchStudent.toLowerCase()))
              .map((st) => (
                <div key={st._id} className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100">{st.name}</h4>
                      <p className="text-xs text-zinc-400">Roll: {st.rollNumber} • Batch {st.batch || '2023-2027'}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 text-xs font-bold">
                      CGPA: 8.8
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 6. TEACHING SCHEDULE */}
      {activeSubTab === 'timetable' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            Faculty Teaching Schedule
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {timetable.map((t) => {
              const subject = subjects.find(s => s._id === t.subjectId);
              return (
                <div key={t._id} className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                  <span className="text-xs font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-500/10">
                    {t.dayOfWeek} • {t.startTime} - {t.endTime}
                  </span>
                  <h4 className="text-sm font-bold text-zinc-100 mt-2">{subject?.name || 'Class Lecture'}</h4>
                  <p className="text-xs text-zinc-400">{t.roomNumber} • Semester {t.semester}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. LEAVE APPROVALS */}
      {activeSubTab === 'leaves' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-purple-400" />
            Pending Student Leave Applications
          </h3>

          <div className="space-y-4">
            {leaveRequests.map((lv) => (
              <div key={lv._id} className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-200">{lv.userName} ({lv.role.toUpperCase()})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      lv.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                      lv.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {lv.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{lv.startDate} to {lv.endDate}</p>
                  <p className="text-xs text-zinc-300 mt-1">{lv.reason}</p>
                </div>

                {lv.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleReviewLeave(lv._id, 'approved')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReviewLeave(lv._id, 'rejected')}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. SUBJECT MANAGEMENT */}
      {activeSubTab === 'subjects' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-400" />
            Assigned Subjects & Course Mapping
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((sub) => (
              <div key={sub._id} className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <span className="text-xs font-mono font-bold text-purple-400">{sub.code}</span>
                <h4 className="text-base font-bold text-zinc-100">{sub.name}</h4>
                <p className="text-xs text-zinc-400">Semester {sub.semester} • Course ID: {sub.courseId}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. CLASS SCHEDULING */}
      {activeSubTab === 'scheduling' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-400" />
              Scheduled Extra & Special Classes
            </h3>
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
            >
              Schedule New Class
            </button>
          </div>

          <div className="space-y-3">
            {classSchedules.map((cs) => (
              <div key={cs._id} className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-500/10">{cs.type}</span>
                  <h4 className="text-sm font-bold text-zinc-100 mt-1">{cs.title}</h4>
                  <p className="text-xs text-zinc-400">{cs.date} at {cs.time} • Room {cs.roomNumber}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. BROADCAST NOTICES */}
      {activeSubTab === 'notices' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-400" />
              Broadcast Notice
            </h3>

            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Notice Headline</label>
                <input
                  type="text"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  placeholder="e.g. Lab Exam Date Sheet Announced"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Target Audience</label>
                <select
                  value={noticeForm.audience}
                  onChange={(e) => setNoticeForm({ ...noticeForm, audience: e.target.value as any })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                >
                  <option value="students">Students Only</option>
                  <option value="all">Entire Campus</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Content</label>
                <textarea
                  rows={4}
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  placeholder="Type notice message..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Publish Notice
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-base font-bold text-zinc-100">Live Campus Notices</h3>
            {notices.map((n) => (
              <div key={n._id} className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-purple-400">{n.audience.toUpperCase()}</span>
                <h4 className="text-sm font-bold text-zinc-100">{n.title}</h4>
                <p className="text-xs text-zinc-400">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. UPLOAD NOTES */}
      {activeSubTab === 'materials' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Upload className="h-5 w-5 text-purple-400" />
            Upload Course Study Materials
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materials.map((m) => (
              <div key={m._id} className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-purple-400">{m.subjectName}</span>
                <h4 className="text-sm font-bold text-zinc-100">{m.title}</h4>
                <p className="text-xs text-zinc-400">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 12. FACULTY PROFILE */}
      {activeSubTab === 'profile' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            Faculty Academic Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-300">
            <div>Employee ID: <strong className="text-zinc-100 block mt-1">{user.employeeId}</strong></div>
            <div>Department: <strong className="text-zinc-100 block mt-1">{user.department}</strong></div>
            <div>Designation: <strong className="text-zinc-100 block mt-1">{user.designation}</strong></div>
            <div>Email Address: <strong className="text-zinc-100 block mt-1">{user.email}</strong></div>
          </div>
        </div>
      )}

      {/* 13. LIBRARY CATALOG */}
      {activeSubTab === 'library' && (
        <LibraryManager user={user} />
      )}

      {/* New Assignment Modal */}
      {isAsgModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-zinc-100">Publish New Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newAsgForm.title}
                  onChange={(e) => setNewAsgForm({ ...newAsgForm, title: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Subject</label>
                <select
                  value={newAsgForm.subjectId}
                  onChange={(e) => setNewAsgForm({ ...newAsgForm, subjectId: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                >
                  <option value="">-- Choose Subject --</option>
                  {subjects.map(s => (
                    <option key={s._id} value={s._id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newAsgForm.dueDate}
                  onChange={(e) => setNewAsgForm({ ...newAsgForm, dueDate: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newAsgForm.description}
                  onChange={(e) => setNewAsgForm({ ...newAsgForm, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAsgModalOpen(false)}
                  className="w-1/2 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
