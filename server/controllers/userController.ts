import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbAdapter } from '../config/dbAdapter.js';

// --- STUDENTS ---
export async function getStudents(req: Request, res: Response): Promise<void> {
  try {
    const { courseId, rollNumber } = req.query;
    const query: any = {};
    if (courseId) query.courseId = courseId;
    if (rollNumber) query.rollNumber = rollNumber;

    const students = await dbAdapter.find('students', query, ['courseId', 'hostelId']);
    // Remove sensitive passwords before sending
    const safeStudents = students.map((s: any) => {
      const { password, ...rest } = s;
      return rest;
    });

    res.json(safeStudents);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching students.', error: error.message });
  }
}

export async function createStudent(req: Request, res: Response): Promise<void> {
  const { name, email, password, rollNumber, courseId, batch, phone, address, dob, gender, guardianName, guardianPhone, hostelId, roomNumber } = req.body;
  if (!name || !email || !password || !rollNumber || !courseId || !batch || !phone || !address || !dob || !gender || !guardianName || !guardianPhone) {
    res.status(400).json({ message: 'Missing required student registration details.' });
    return;
  }

  try {
    const existing = await dbAdapter.findOne('students', { email });
    const existingRoll = await dbAdapter.findOne('students', { rollNumber });
    if (existing || existingRoll) {
      res.status(400).json({ message: 'A student with this email or roll number already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStudent = await dbAdapter.create('students', {
      name,
      email,
      password: hashedPassword,
      rollNumber,
      courseId,
      batch,
      phone,
      address,
      dob,
      gender,
      guardianName,
      guardianPhone,
      hostelId,
      roomNumber,
      role: 'student'
    });

    // If hostel and room allocation is specified, allocate immediately!
    if (hostelId && roomNumber) {
      const hostel: any = await dbAdapter.findById('hostels', hostelId);
      if (hostel) {
        const rooms = hostel.rooms || [];
        const roomIndex = rooms.findIndex((r: any) => r.roomNumber === roomNumber);
        if (roomIndex !== -1) {
          const room = rooms[roomIndex];
          if (!room.studentIds) room.studentIds = [];
          if (!room.studentIds.includes((newStudent as any)._id)) {
            room.studentIds.push((newStudent as any)._id);
            await dbAdapter.update('hostels', hostelId, { rooms });
          }
        }
      }
    }

    const { password: _, ...safeStudent } = newStudent as any;
    res.status(201).json(safeStudent);
  } catch (error: any) {
    res.status(500).json({ message: 'Error registering student.', error: error.message });
  }
}

export async function updateStudent(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const data = { ...req.body };

  try {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      delete data.password;
    }

    const updated = await dbAdapter.update('students', id, data);
    if (!updated) {
      res.status(404).json({ message: 'Student not found.' });
      return;
    }

    const { password: _, ...safeStudent } = updated as any;
    res.json(safeStudent);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating student details.', error: error.message });
  }
}

export async function deleteStudent(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    // Also remove from hostel rooms if allocated
    const student: any = await dbAdapter.findById('students', id);
    if (student && student.hostelId && student.roomNumber) {
      const hostel: any = await dbAdapter.findById('hostels', student.hostelId);
      if (hostel) {
        const rooms = hostel.rooms || [];
        const room = rooms.find((r: any) => r.roomNumber === student.roomNumber);
        if (room && room.studentIds) {
          room.studentIds = room.studentIds.filter((sid: string) => sid !== id);
          await dbAdapter.update('hostels', student.hostelId, { rooms });
        }
      }
    }

    const success = await dbAdapter.delete('students', id);
    if (!success) {
      res.status(404).json({ message: 'Student not found.' });
      return;
    }
    res.json({ message: 'Student deleted successfully!' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting student.', error: error.message });
  }
}


// --- FACULTY ---
export async function getFaculty(req: Request, res: Response): Promise<void> {
  try {
    const faculty = await dbAdapter.find('faculty', {}, ['subjects']);
    const safeFaculty = faculty.map((f: any) => {
      const { password, ...rest } = f;
      return rest;
    });
    res.json(safeFaculty);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching faculty.', error: error.message });
  }
}

export async function createFaculty(req: Request, res: Response): Promise<void> {
  const { name, email, password, employeeId, department, designation, phone, subjects } = req.body;
  if (!name || !email || !password || !employeeId || !department || !designation || !phone) {
    res.status(400).json({ message: 'Missing required faculty details.' });
    return;
  }

  try {
    const existing = await dbAdapter.findOne('faculty', { email });
    const existingId = await dbAdapter.findOne('faculty', { employeeId });
    if (existing || existingId) {
      res.status(400).json({ message: 'A faculty member with this email or employee ID already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newFaculty = await dbAdapter.create('faculty', {
      name,
      email,
      password: hashedPassword,
      employeeId,
      department,
      designation,
      phone,
      subjects: subjects || [],
      role: 'faculty'
    });

    const { password: _, ...safeFaculty } = newFaculty as any;
    res.status(201).json(safeFaculty);
  } catch (error: any) {
    res.status(500).json({ message: 'Error registering faculty.', error: error.message });
  }
}

export async function updateFaculty(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const data = { ...req.body };

  try {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      delete data.password;
    }

    const updated = await dbAdapter.update('faculty', id, data);
    if (!updated) {
      res.status(404).json({ message: 'Faculty not found.' });
      return;
    }

    const { password: _, ...safeFaculty } = updated as any;
    res.json(safeFaculty);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating faculty details.', error: error.message });
  }
}

export async function deleteFaculty(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const success = await dbAdapter.delete('faculty', id);
    if (!success) {
      res.status(404).json({ message: 'Faculty member not found.' });
      return;
    }
    res.json({ message: 'Faculty member deleted successfully!' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting faculty member.', error: error.message });
  }
}
