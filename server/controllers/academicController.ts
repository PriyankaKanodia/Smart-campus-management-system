import { Request, Response } from 'express';
import { dbAdapter } from '../config/dbAdapter.js';

// --- COURSES ---
export async function getCourses(req: Request, res: Response): Promise<void> {
  try {
    const courses = await dbAdapter.find('courses');
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching courses.', error: error.message });
  }
}

export async function createCourse(req: Request, res: Response): Promise<void> {
  const { name, code, durationYears, description } = req.body;
  if (!name || !code || !durationYears) {
    res.status(400).json({ message: 'Name, code, and duration are required.' });
    return;
  }
  try {
    const existing = await dbAdapter.findOne('courses', { code });
    if (existing) {
      res.status(400).json({ message: 'A course with this code already exists.' });
      return;
    }
    const newCourse = await dbAdapter.create('courses', { name, code, durationYears, description });
    res.status(201).json(newCourse);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating course.', error: error.message });
  }
}

export async function updateCourse(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const updated = await dbAdapter.update('courses', id, req.body);
    if (!updated) {
      res.status(404).json({ message: 'Course not found.' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating course.', error: error.message });
  }
}

export async function deleteCourse(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const success = await dbAdapter.delete('courses', id);
    if (!success) {
      res.status(404).json({ message: 'Course not found.' });
      return;
    }
    res.json({ message: 'Course deleted successfully!' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting course.', error: error.message });
  }
}


// --- SUBJECTS ---
export async function getSubjects(req: Request, res: Response): Promise<void> {
  try {
    const { courseId, semester } = req.query;
    const query: any = {};
    if (courseId) query.courseId = courseId;
    if (semester) query.semester = Number(semester);

    const subjects = await dbAdapter.find('subjects', query, ['courseId', 'facultyId']);
    res.json(subjects);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching subjects.', error: error.message });
  }
}

export async function createSubject(req: Request, res: Response): Promise<void> {
  const { name, code, courseId, facultyId, semester } = req.body;
  if (!name || !code || !courseId || !facultyId || !semester) {
    res.status(400).json({ message: 'All fields are required.' });
    return;
  }
  try {
    const existing = await dbAdapter.findOne('subjects', { code });
    if (existing) {
      res.status(400).json({ message: 'A subject with this code already exists.' });
      return;
    }
    const newSubject = await dbAdapter.create('subjects', { name, code, courseId, facultyId, semester: Number(semester) });
    res.status(201).json(newSubject);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating subject.', error: error.message });
  }
}

export async function updateSubject(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const updated = await dbAdapter.update('subjects', id, req.body);
    if (!updated) {
      res.status(404).json({ message: 'Subject not found.' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating subject.', error: error.message });
  }
}

export async function deleteSubject(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const success = await dbAdapter.delete('subjects', id);
    if (!success) {
      res.status(404).json({ message: 'Subject not found.' });
      return;
    }
    res.json({ message: 'Subject deleted successfully!' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting subject.', error: error.message });
  }
}


// --- TIMETABLE ---
export async function getTimetable(req: Request, res: Response): Promise<void> {
  try {
    const { courseId, semester, facultyId } = req.query;
    const query: any = {};
    if (courseId) query.courseId = courseId;
    if (semester) query.semester = Number(semester);
    if (facultyId) query.facultyId = facultyId;

    const entries = await dbAdapter.find('timetableentries', query, ['courseId', 'subjectId', 'facultyId']);
    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching timetable.', error: error.message });
  }
}

export async function createTimetableEntry(req: Request, res: Response): Promise<void> {
  const { courseId, subjectId, facultyId, dayOfWeek, startTime, endTime, roomNumber, semester } = req.body;
  if (!courseId || !subjectId || !facultyId || !dayOfWeek || !startTime || !endTime || !roomNumber || !semester) {
    res.status(400).json({ message: 'All fields are required.' });
    return;
  }
  try {
    const newEntry = await dbAdapter.create('timetableentries', {
      courseId,
      subjectId,
      facultyId,
      dayOfWeek,
      startTime,
      endTime,
      roomNumber,
      semester: Number(semester)
    });
    res.status(201).json(newEntry);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating timetable entry.', error: error.message });
  }
}

export async function updateTimetableEntry(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const updated = await dbAdapter.update('timetableentries', id, req.body);
    if (!updated) {
      res.status(404).json({ message: 'Timetable entry not found.' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating timetable entry.', error: error.message });
  }
}

export async function deleteTimetableEntry(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const success = await dbAdapter.delete('timetableentries', id);
    if (!success) {
      res.status(404).json({ message: 'Timetable entry not found.' });
      return;
    }
    res.json({ message: 'Timetable entry deleted successfully!' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting timetable entry.', error: error.message });
  }
}
