import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

import {
  login,
  getMe,
  registerAdmin,
  forgotPassword,
  resetPassword,
  refreshToken,
  sendEmailVerification,
  verifyEmail,
  getLoginHistory
} from '../controllers/authController.js';

import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry
} from '../controllers/academicController.js';

import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty
} from '../controllers/userController.js';

import {
  getAttendance,
  markAttendance,
  getAssignments,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  getResults,
  createResult,
  updateResult,
  deleteResult
} from '../controllers/classroomController.js';

import {
  getFees,
  createFee,
  payFee,
  getBooks,
  createBook,
  borrowBook,
  returnBook,
  getHostels,
  createHostel,
  getEvents,
  createEvent,
  getNotices,
  createNotice,
  getLeaves,
  applyLeave,
  reviewLeave
} from '../controllers/utilityController.js';

import {
  handleAiChat,
  handleSummarizeNotice,
  handleGenerateTimetable,
  handleRecommendCourses,
  handleAnalyzePerformance,
  handlePredictAttendance,
  handleFaqAssistant
} from '../controllers/aiController.js';

import {
  getAuditLogs,
  send2FaOtp,
  verify2FaOtp,
  getCsrfToken,
  getSecurityStatus,
  testEncryption
} from '../controllers/securityController.js';

import {
  getChatRooms,
  getRoomMessages,
  createChatRoom,
  sendMessageHttp,
  uploadChatFile
} from '../controllers/chatController.js';

import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, `chat-${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

const router = Router();


// --- AUTH ROUTING ---
router.post('/auth/login', login);
router.post('/auth/refresh-token', refreshToken);
router.get('/auth/me', authenticateToken, getMe);
router.get('/auth/login-history', authenticateToken, getLoginHistory);
router.post('/auth/register-admin', registerAdmin); // Admin initial registration seed
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);
router.post('/auth/send-verification', sendEmailVerification);
router.post('/auth/verify-email', verifyEmail);

// --- ACADEMIC ROUTING ---
router.get('/courses', getCourses);
router.post('/courses', authenticateToken, authorizeRoles('admin'), createCourse);
router.put('/courses/:id', authenticateToken, authorizeRoles('admin'), updateCourse);
router.delete('/courses/:id', authenticateToken, authorizeRoles('admin'), deleteCourse);

router.get('/subjects', getSubjects);
router.post('/subjects', authenticateToken, authorizeRoles('admin'), createSubject);
router.put('/subjects/:id', authenticateToken, authorizeRoles('admin'), updateSubject);
router.delete('/subjects/:id', authenticateToken, authorizeRoles('admin'), deleteSubject);

router.get('/timetable', getTimetable);
router.post('/timetable', authenticateToken, authorizeRoles('admin', 'faculty'), createTimetableEntry);
router.put('/timetable/:id', authenticateToken, authorizeRoles('admin', 'faculty'), updateTimetableEntry);
router.delete('/timetable/:id', authenticateToken, authorizeRoles('admin', 'faculty'), deleteTimetableEntry);

// --- USER ROUTING ---
router.get('/students', authenticateToken, getStudents);
router.post('/students', authenticateToken, authorizeRoles('admin'), createStudent);
router.put('/students/:id', authenticateToken, authorizeRoles('admin'), updateStudent);
router.delete('/students/:id', authenticateToken, authorizeRoles('admin'), deleteStudent);

router.get('/faculty', authenticateToken, getFaculty);
router.post('/faculty', authenticateToken, authorizeRoles('admin'), createFaculty);
router.put('/faculty/:id', authenticateToken, authorizeRoles('admin'), updateFaculty);
router.delete('/faculty/:id', authenticateToken, authorizeRoles('admin'), deleteFaculty);

// --- CLASSROOM ROUTING ---
router.get('/attendance', authenticateToken, getAttendance);
router.post('/attendance', authenticateToken, authorizeRoles('faculty'), markAttendance);

router.get('/assignments', authenticateToken, getAssignments);
router.post('/assignments', authenticateToken, authorizeRoles('faculty'), createAssignment);
router.post('/assignments/:assignmentId/submit', authenticateToken, authorizeRoles('student'), submitAssignment);
router.post('/assignments/:assignmentId/grade', authenticateToken, authorizeRoles('faculty'), gradeSubmission);

router.get('/results', authenticateToken, getResults);
router.post('/results', authenticateToken, authorizeRoles('faculty', 'admin'), createResult);
router.put('/results/:id', authenticateToken, authorizeRoles('faculty', 'admin'), updateResult);
router.delete('/results/:id', authenticateToken, authorizeRoles('faculty', 'admin'), deleteResult);

// --- UTILITY ROUTING ---
router.get('/fees', authenticateToken, getFees);
router.post('/fees', authenticateToken, authorizeRoles('admin'), createFee);
router.post('/fees/:feeId/pay', authenticateToken, authorizeRoles('student'), payFee);

router.get('/books', authenticateToken, getBooks);
router.post('/books', authenticateToken, authorizeRoles('admin', 'faculty'), createBook);
router.post('/books/:bookId/borrow', authenticateToken, authorizeRoles('admin', 'faculty'), borrowBook);
router.post('/books/:bookId/return', authenticateToken, authorizeRoles('admin', 'faculty'), returnBook);

router.get('/hostels', authenticateToken, getHostels);
router.post('/hostels', authenticateToken, authorizeRoles('admin'), createHostel);

router.get('/events', authenticateToken, getEvents);
router.post('/events', authenticateToken, authorizeRoles('admin', 'faculty'), createEvent);

router.get('/notices', authenticateToken, getNotices);
router.post('/notices', authenticateToken, authorizeRoles('admin', 'faculty'), createNotice);

router.get('/leaves', authenticateToken, getLeaves);
router.post('/leaves', authenticateToken, applyLeave);
router.post('/leaves/:leaveId/review', authenticateToken, authorizeRoles('admin', 'faculty'), reviewLeave);

// --- AI ROUTING ---
router.post('/ai/chat', handleAiChat);
router.post('/ai/summarize-notice', handleSummarizeNotice);
router.post('/ai/generate-timetable', handleGenerateTimetable);
router.post('/ai/recommend-courses', handleRecommendCourses);
router.post('/ai/analyze-performance', handleAnalyzePerformance);
router.post('/ai/predict-attendance', handlePredictAttendance);
router.post('/ai/faq-assistant', handleFaqAssistant);

// --- SECURITY & AUDIT ROUTING ---
router.get('/security/audit-logs', authenticateToken, authorizeRoles('admin'), getAuditLogs);
router.post('/auth/2fa/send-otp', send2FaOtp);
router.post('/auth/2fa/verify-otp', verify2FaOtp);
router.get('/security/csrf-token', getCsrfToken);
router.get('/security/status', authenticateToken, getSecurityStatus);
router.post('/security/test-encryption', authenticateToken, authorizeRoles('admin'), testEncryption);

// --- COMMUNICATION & CHAT ROUTING ---
router.get('/chat/rooms', authenticateToken, getChatRooms);
router.get('/chat/rooms/:roomId/messages', authenticateToken, getRoomMessages);
router.post('/chat/rooms', authenticateToken, createChatRoom);
router.post('/chat/messages', authenticateToken, sendMessageHttp);
router.post('/chat/upload', authenticateToken, upload.single('file'), uploadChatFile);

export default router;

