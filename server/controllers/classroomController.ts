import { Request, Response } from 'express';
import { dbAdapter } from '../config/dbAdapter.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

// --- ATTENDANCE ---
export async function getAttendance(req: Request, res: Response): Promise<void> {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  const { studentId, subjectId, date } = req.query;
  const query: any = {};

  // If student is logged in, they can ONLY see their own attendance! Security first.
  if (user.role === 'student') {
    query.studentId = user.id;
  } else {
    if (studentId) query.studentId = studentId;
  }

  if (subjectId) query.subjectId = subjectId;
  if (date) query.date = date;

  try {
    const attendanceRecords = await dbAdapter.find('attendance', query, ['studentId', 'subjectId', 'markedBy']);
    res.json(attendanceRecords);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching attendance.', error: error.message });
  }
}

export async function markAttendance(req: Request, res: Response): Promise<void> {
  const user = (req as AuthenticatedRequest).user;
  const { studentId, subjectId, date, status } = req.body;

  if (!studentId || !subjectId || !date || !status) {
    res.status(400).json({ message: 'studentId, subjectId, date, and status are required.' });
    return;
  }

  try {
    // Check if attendance already marked for this student on this date for this subject
    const existing = await dbAdapter.findOne('attendance', { studentId, subjectId, date });
    
    let result: any;
    if (existing) {
      result = await dbAdapter.update('attendance', (existing as any)._id, { status, markedBy: user?.id });
    } else {
      result = await dbAdapter.create('attendance', {
        studentId,
        subjectId,
        date,
        status,
        markedBy: user?.id
      });
    }

    res.json({ message: 'Attendance marked successfully!', result });
  } catch (error: any) {
    res.status(500).json({ message: 'Error marking attendance.', error: error.message });
  }
}


// --- ASSIGNMENTS ---
export async function getAssignments(req: Request, res: Response): Promise<void> {
  const { subjectId } = req.query;
  const query: any = {};
  if (subjectId) query.subjectId = subjectId;

  try {
    const assignments = await dbAdapter.find('assignments', query, ['subjectId', 'facultyId']);
    res.json(assignments);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching assignments.', error: error.message });
  }
}

export async function createAssignment(req: Request, res: Response): Promise<void> {
  const user = (req as AuthenticatedRequest).user;
  const { title, description, subjectId, dueDate, totalMarks } = req.body;

  if (!title || !description || !subjectId || !dueDate || !totalMarks) {
    res.status(400).json({ message: 'All fields (title, description, subjectId, dueDate, totalMarks) are required.' });
    return;
  }

  try {
    const newAssignment = await dbAdapter.create('assignments', {
      title,
      description,
      subjectId,
      facultyId: user?.id,
      dueDate,
      totalMarks: Number(totalMarks),
      submissions: []
    });
    res.status(201).json(newAssignment);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating assignment.', error: error.message });
  }
}

export async function submitAssignment(req: Request, res: Response): Promise<void> {
  const user = (req as AuthenticatedRequest).user;
  const { assignmentId } = req.params;
  const { fileUrl, fileName } = req.body; // Can also be uploaded via Multer

  if (!assignmentId) {
    res.status(400).json({ message: 'Assignment ID is required.' });
    return;
  }

  try {
    const assignment: any = await dbAdapter.findById('assignments', assignmentId);
    if (!assignment) {
      res.status(404).json({ message: 'Assignment not found.' });
      return;
    }

    const submissions = assignment.submissions || [];
    // Check if student already submitted, if so, update submission
    const existingIndex = submissions.findIndex((s: any) => String(s.studentId) === user?.id);

    const submissionData = {
      studentId: user?.id,
      fileUrl: fileUrl || 'https://campus-uploads.s3.amazonaws.com/assignment-mock.pdf',
      fileName: fileName || 'submission.pdf',
      submittedAt: new Date().toISOString()
    };

    if (existingIndex !== -1) {
      submissions[existingIndex] = { ...submissions[existingIndex], ...submissionData };
    } else {
      submissions.push(submissionData);
    }

    const updated = await dbAdapter.update('assignments', assignmentId, { submissions });
    res.json({ message: 'Assignment submitted successfully!', assignment: updated });
  } catch (error: any) {
    res.status(500).json({ message: 'Error submitting assignment.', error: error.message });
  }
}

export async function gradeSubmission(req: Request, res: Response): Promise<void> {
  const { assignmentId } = req.params;
  const { studentId, marksObtained, feedback } = req.body;

  if (!studentId || marksObtained === undefined) {
    res.status(400).json({ message: 'Student ID and marksObtained are required.' });
    return;
  }

  try {
    const assignment: any = await dbAdapter.findById('assignments', assignmentId);
    if (!assignment) {
      res.status(404).json({ message: 'Assignment not found.' });
      return;
    }

    const submissions = assignment.submissions || [];
    const submission = submissions.find((s: any) => String(s.studentId) === studentId);
    if (!submission) {
      res.status(404).json({ message: 'Submission not found for this student.' });
      return;
    }

    submission.marksObtained = Number(marksObtained);
    submission.feedback = feedback || '';

    const updated = await dbAdapter.update('assignments', assignmentId, { submissions });
    res.json({ message: 'Submission graded successfully!', assignment: updated });
  } catch (error: any) {
    res.status(500).json({ message: 'Error grading submission.', error: error.message });
  }
}


// --- RESULTS / GRADES ---
export async function getResults(req: Request, res: Response): Promise<void> {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  const { studentId, subjectId, semester } = req.query;
  const query: any = {};

  // Students see ONLY their own grades. Zero trust boundary!
  if (user.role === 'student') {
    query.studentId = user.id;
  } else {
    if (studentId) query.studentId = studentId;
  }

  if (subjectId) query.subjectId = subjectId;
  if (semester) query.semester = Number(semester);

  try {
    const results = await dbAdapter.find('results', query, ['studentId', 'subjectId']);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching results.', error: error.message });
  }
}

export async function createResult(req: Request, res: Response): Promise<void> {
  const { studentId, subjectId, examType, marksObtained, totalMarks, grade, remarks, semester } = req.body;

  if (!studentId || !subjectId || !examType || marksObtained === undefined || !totalMarks || !grade || !semester) {
    res.status(400).json({ message: 'All fields (studentId, subjectId, examType, marksObtained, totalMarks, grade, semester) are required.' });
    return;
  }

  try {
    const newResult = await dbAdapter.create('results', {
      studentId,
      subjectId,
      examType,
      marksObtained: Number(marksObtained),
      totalMarks: Number(totalMarks),
      grade,
      remarks: remarks || '',
      semester: Number(semester)
    });
    res.status(201).json(newResult);
  } catch (error: any) {
    res.status(500).json({ message: 'Error publishing exam result.', error: error.message });
  }
}

export async function updateResult(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const updated = await dbAdapter.update('results', id, req.body);
    if (!updated) {
      res.status(404).json({ message: 'Result record not found.' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating result.', error: error.message });
  }
}

export async function deleteResult(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const success = await dbAdapter.delete('results', id);
    if (!success) {
      res.status(404).json({ message: 'Result record not found.' });
      return;
    }
    res.json({ message: 'Result record deleted successfully!' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting result.', error: error.message });
  }
}
