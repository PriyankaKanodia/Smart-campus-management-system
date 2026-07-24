/**
 * Smart Campus Management System Types
 */

export type UserRole = 'admin' | 'faculty' | 'student';

export interface BaseEntity {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student extends BaseEntity {
  name: string;
  email: string;
  password?: string;
  rollNumber: string;
  courseId: string; // Course Reference
  batch: string; // e.g., "2023-2027"
  phone: string;
  address: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  guardianName: string;
  guardianPhone: string;
  hostelId?: string; // Optional Hostel Reference
  roomNumber?: string;
  role: 'student';
}

export interface Faculty extends BaseEntity {
  name: string;
  email: string;
  password?: string;
  employeeId: string;
  department: string;
  designation: string;
  phone: string;
  subjects: string[]; // Subject IDs
  role: 'faculty';
}

export interface Admin extends BaseEntity {
  name: string;
  email: string;
  password?: string;
  employeeId: string;
  role: 'admin';
}

export interface Course extends BaseEntity {
  name: string;
  code: string;
  durationYears: number;
  description: string;
}

export interface Subject extends BaseEntity {
  name: string;
  code: string;
  courseId: string; // Course ID
  facultyId: string; // Faculty ID
  semester: number;
}

export interface Attendance extends BaseEntity {
  studentId: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late';
  markedBy: string; // Faculty ID
}

export interface Submission {
  studentId: string;
  fileUrl: string;
  fileName: string;
  submittedAt: string;
  marksObtained?: number;
  feedback?: string;
}

export interface Assignment extends BaseEntity {
  title: string;
  description: string;
  subjectId: string;
  facultyId: string;
  dueDate: string;
  totalMarks: number;
  submissions: Submission[];
}

export interface Result extends BaseEntity {
  studentId: string;
  subjectId: string;
  examType: 'midterm' | 'final' | 'quiz' | 'assignment';
  marksObtained: number;
  totalMarks: number;
  grade: string;
  remarks?: string;
  semester: number;
}

export interface FeeInstallment {
  installmentNo: number;
  amount: number;
  dueDate: string;
  status: 'paid' | 'unpaid';
  paidAt?: string;
  transactionId?: string;
}

export interface Fee extends BaseEntity {
  studentId: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'pending';
  paymentMethod?: 'card' | 'upi' | 'bank_transfer' | 'cash' | 'netbanking' | 'wallet';
  transactionId?: string;
  paidAt?: string;
  type: 'tuition' | 'hostel' | 'library' | 'exam' | 'transport' | 'sports';
  scholarshipAmount?: number;
  scholarshipName?: string;
  fineAmount?: number;
  fineReason?: string;
  installments?: FeeInstallment[];
  receiptNo?: string;
  remarks?: string;
}

export interface LibraryBorrowRecord {
  studentId: string;
  borrowDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned';
}

export interface LibraryBook extends BaseEntity {
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  borrowedBy: LibraryBorrowRecord[];
}

export interface RoomAllocation {
  roomNumber: string;
  studentIds: string[]; // Student IDs in this room
  capacity: number;
}

export interface Hostel extends BaseEntity {
  name: string;
  type: 'boys' | 'girls';
  capacity: number;
  rooms: RoomAllocation[];
  wardenName: string;
  wardenPhone: string;
}

export interface Event extends BaseEntity {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  type: 'academic' | 'sports' | 'cultural' | 'seminar';
}

export interface Notice extends BaseEntity {
  title: string;
  content: string;
  audience: 'all' | 'students' | 'faculty';
  authorId: string; // Admin or Faculty ID
  authorName: string;
}

export interface LeaveRequest extends BaseEntity {
  userId: string;
  userName: string;
  role: 'student' | 'faculty';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string; // Reviewer ID
}

export interface TimetableEntry extends BaseEntity {
  courseId: string;
  subjectId: string;
  facultyId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "10:30"
  roomNumber: string;
  semester: number;
}

export interface ExamSchedule extends BaseEntity {
  courseId: string;
  subjectId: string;
  subjectName?: string;
  examType: 'Mid-Term' | 'Final Term' | 'Lab Exam' | 'Quiz';
  date: string;
  time: string;
  roomNumber: string;
  semester: number;
  syllabus: string;
}

export interface CertificateRequest extends BaseEntity {
  studentId: string;
  type: 'Bonafide Certificate' | 'Conduct Certificate' | 'Course Completion' | 'Merit Certificate';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  issuedDate?: string;
  certificateNo?: string;
}

export interface StudyMaterial extends BaseEntity {
  title: string;
  description: string;
  subjectId: string;
  subjectName?: string;
  facultyId: string;
  fileUrl: string;
  fileName: string;
  fileSize?: string;
  uploadedAt: string;
}

export interface ClassSchedule extends BaseEntity {
  title: string;
  subjectId: string;
  facultyId: string;
  date: string;
  time: string;
  roomNumber: string;
  meetingLink?: string;
  type: 'Regular' | 'Extra Class' | 'Makeup Class' | 'Lab Session';
}

// --- COMMUNICATION TYPES ---
export interface ChatMessage extends BaseEntity {
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  readBy: string[]; // List of user IDs who have read
  readAt?: string;
  isBroadcast?: boolean;
}

export interface ChatRoom extends BaseEntity {
  name: string;
  type: 'private' | 'group' | 'department' | 'broadcast';
  department?: string;
  members: string[]; // List of user IDs
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

export interface AuditLog extends BaseEntity {
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: 'auth' | 'fees' | 'grades' | 'academics' | 'library' | 'users' | 'security';
  ipAddress: string;
  status: 'success' | 'warning' | 'failure';
  details: string;
  timestamp: string;
}

export interface TwoFactorState {
  enabled: boolean;
  email: string;
  secret?: string;
  verified: boolean;
}


