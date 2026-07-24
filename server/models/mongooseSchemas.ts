import mongoose from 'mongoose';

// 1. Course Schema
export const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  durationYears: { type: Number, required: true },
  description: { type: String },
}, { timestamps: true });

// 2. Subject Schema
export const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  semester: { type: Number, required: true },
}, { timestamps: true });

// 3. Student Schema
export const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  batch: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  dob: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  guardianName: { type: String, required: true },
  guardianPhone: { type: String, required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
  roomNumber: { type: String },
  role: { type: String, default: 'student' },
}, { timestamps: true });

// 4. Faculty Schema
export const FacultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  phone: { type: String, required: true },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  role: { type: String, default: 'faculty' },
}, { timestamps: true });

// 5. Admin Schema
export const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  role: { type: String, default: 'admin' },
}, { timestamps: true });

// 6. Attendance Schema
export const AttendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  status: { type: String, enum: ['present', 'absent', 'late'], required: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
}, { timestamps: true });

// 7. Assignment Schema
export const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  dueDate: { type: String, required: true },
  totalMarks: { type: Number, required: true },
  submissions: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    marksObtained: { type: Number },
    feedback: { type: String }
  }]
}, { timestamps: true });

// 8. Result Schema
export const ResultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  examType: { type: String, enum: ['midterm', 'final', 'quiz', 'assignment'], required: true },
  marksObtained: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  grade: { type: String, required: true },
  remarks: { type: String },
  semester: { type: Number, required: true },
}, { timestamps: true });

// 9. Fee Schema
export const FeeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  dueDate: { type: String, required: true },
  status: { type: String, enum: ['paid', 'unpaid', 'pending'], default: 'unpaid' },
  paymentMethod: { type: String, enum: ['card', 'upi', 'bank_transfer', 'cash'] },
  transactionId: { type: String },
  paidAt: { type: String },
  type: { type: String, enum: ['tuition', 'hostel', 'library', 'exam'], required: true },
}, { timestamps: true });

// 10. Library Book Schema
export const LibraryBookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  totalCopies: { type: Number, required: true },
  availableCopies: { type: Number, required: true },
  borrowedBy: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    borrowDate: { type: String, required: true },
    returnDate: { type: String },
    status: { type: String, enum: ['borrowed', 'returned'], default: 'borrowed' }
  }]
}, { timestamps: true });

// 11. Hostel Schema
export const HostelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['boys', 'girls'], required: true },
  capacity: { type: Number, required: true },
  rooms: [{
    roomNumber: { type: String, required: true },
    studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    capacity: { type: Number, required: true }
  }],
  wardenName: { type: String, required: true },
  wardenPhone: { type: String, required: true },
}, { timestamps: true });

// 12. Event Schema
export const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  organizer: { type: String, required: true },
  type: { type: String, enum: ['academic', 'sports', 'cultural', 'seminar'], required: true },
}, { timestamps: true });

// 13. Notice Schema
export const NoticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  audience: { type: String, enum: ['all', 'students', 'faculty'], required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  authorName: { type: String, required: true },
}, { timestamps: true });

// 14. Leave Request Schema
export const LeaveRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userName: { type: String, required: true },
  role: { type: String, enum: ['student', 'faculty'], required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });

// 15. Timetable Entry Schema
export const TimetableEntrySchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  roomNumber: { type: String, required: true },
  semester: { type: Number, required: true },
}, { timestamps: true });

// Compilation of Models
export const CourseM = mongoose.models.Course || mongoose.model('Course', CourseSchema);
export const SubjectM = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
export const StudentM = mongoose.models.Student || mongoose.model('Student', StudentSchema);
export const FacultyM = mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema);
export const AdminM = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
export const AttendanceM = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
export const AssignmentM = mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);
export const ResultM = mongoose.models.Result || mongoose.model('Result', ResultSchema);
export const FeeM = mongoose.models.Fee || mongoose.model('Fee', FeeSchema);
export const LibraryBookM = mongoose.models.LibraryBook || mongoose.model('LibraryBook', LibraryBookSchema);
export const HostelM = mongoose.models.Hostel || mongoose.model('Hostel', HostelSchema);
export const EventM = mongoose.models.Event || mongoose.model('Event', EventSchema);
export const NoticeM = mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);
export const LeaveRequestM = mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', LeaveRequestSchema);
export const TimetableEntryM = mongoose.models.TimetableEntry || mongoose.model('TimetableEntry', TimetableEntrySchema);
