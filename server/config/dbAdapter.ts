import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { isConnected } from './db.js';
import * as mongooseModels from '../models/mongooseSchemas.js';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'campus-db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default data schema structure
interface CampusDbSchema {
  courses: any[];
  subjects: any[];
  students: any[];
  faculty: any[];
  admins: any[];
  attendance: any[];
  assignments: any[];
  results: any[];
  fees: any[];
  librarybooks: any[];
  hostels: any[];
  events: any[];
  notices: any[];
  leaverequests: any[];
  timetableentries: any[];
}

const emptyDb: CampusDbSchema = {
  courses: [],
  subjects: [],
  students: [],
  faculty: [],
  admins: [],
  attendance: [],
  assignments: [],
  results: [],
  fees: [],
  librarybooks: [],
  hostels: [],
  events: [],
  notices: [],
  leaverequests: [],
  timetableentries: []
};

// Generates a mock ObjectID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Seed helper to hash passwords synchronously
function hashPasswordSync(pwd: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(pwd, salt);
}

// Reads the DB file
function readDbFile(): CampusDbSchema {
  if (!fs.existsSync(DB_FILE)) {
    // Generate initial seeds!
    const db = { ...emptyDb };
    
    // 1. Preseed Courses
    const courseId1 = generateId();
    const courseId2 = generateId();
    db.courses = [
      { _id: courseId1, name: 'Computer Science & Engineering', code: 'CSE', durationYears: 4, description: 'B.Tech Program in CSE focusing on Software, Systems, and AI.' },
      { _id: courseId2, name: 'Electronics & Communication Engineering', code: 'ECE', durationYears: 4, description: 'B.Tech Program in ECE focusing on circuits, embedded systems, and communications.' }
    ];

    // 2. Preseed Faculty & Admin
    const facultyId1 = generateId();
    const adminId1 = generateId();
    db.admins = [
      {
        _id: adminId1,
        name: 'Dean Arthur Pendragon',
        email: 'admin@campus.com',
        password: hashPasswordSync('AdminPassword123'),
        employeeId: 'ADM-1001',
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    ];

    db.faculty = [
      {
        _id: facultyId1,
        name: 'Dr. Evelyn Martinez',
        email: 'faculty@campus.com',
        password: hashPasswordSync('FacultyPassword123'),
        employeeId: 'FAC-2001',
        department: 'Computer Science',
        designation: 'Professor',
        phone: '123-456-7890',
        subjects: [],
        role: 'faculty',
        createdAt: new Date().toISOString()
      }
    ];

    // 3. Preseed Subjects
    const subjectId1 = generateId();
    const subjectId2 = generateId();
    db.subjects = [
      { _id: subjectId1, name: 'Data Structures & Algorithms', code: 'CSE-301', courseId: courseId1, facultyId: facultyId1, semester: 3, createdAt: new Date().toISOString() },
      { _id: subjectId2, name: 'Advanced Software Engineering', code: 'CSE-302', courseId: courseId1, facultyId: facultyId1, semester: 3, createdAt: new Date().toISOString() }
    ];
    db.faculty[0].subjects = [subjectId1, subjectId2];

    // 4. Preseed Hostels
    const hostelId1 = generateId();
    db.hostels = [
      {
        _id: hostelId1,
        name: 'Silicon Boys Hostel A',
        type: 'boys',
        capacity: 100,
        rooms: [
          { roomNumber: '101', studentIds: [], capacity: 2 },
          { roomNumber: '102', studentIds: [], capacity: 2 }
        ],
        wardenName: 'Mr. Ronald Wesley',
        wardenPhone: '111-222-3333',
        createdAt: new Date().toISOString()
      }
    ];

    // 5. Preseed Student
    const studentId1 = generateId();
    db.students = [
      {
        _id: studentId1,
        name: 'John Doe',
        email: 'student@campus.com',
        password: hashPasswordSync('StudentPassword123'),
        rollNumber: 'CS-2023-045',
        courseId: courseId1,
        batch: '2023-2027',
        phone: '987-654-3210',
        address: '123 Campus Lane, Silicon City',
        dob: '2004-05-15',
        gender: 'male',
        guardianName: 'Richard Doe',
        guardianPhone: '987-654-3211',
        hostelId: hostelId1,
        roomNumber: '101',
        role: 'student',
        createdAt: new Date().toISOString()
      }
    ];
    db.hostels[0].rooms[0].studentIds = [studentId1];

    // 6. Preseed Library Books
    db.librarybooks = [
      { _id: generateId(), title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', isbn: '9780262033848', category: 'Computer Science', totalCopies: 10, availableCopies: 9, borrowedBy: [{ studentId: studentId1, borrowDate: '2026-06-25', status: 'borrowed' }], createdAt: new Date().toISOString() },
      { _id: generateId(), title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', category: 'Software Development', totalCopies: 5, availableCopies: 5, borrowedBy: [], createdAt: new Date().toISOString() }
    ];

    // 7. Preseed Notices
    db.notices = [
      { _id: generateId(), title: 'Mid-Semester Examinations Schedule', content: 'Mid-sem exams will commence from August 10th. Timetables have been published in the portal.', audience: 'all', authorId: adminId1, authorName: 'Dean Arthur Pendragon', createdAt: new Date().toISOString() },
      { _id: generateId(), title: 'Hackathon 2026 Registrations Open', content: 'Annual Campus Hackathon is on July 25th. Register in teams of 4 by July 20th.', audience: 'students', authorId: facultyId1, authorName: 'Dr. Evelyn Martinez', createdAt: new Date().toISOString() }
    ];

    // 8. Preseed Events
    db.events = [
      { _id: generateId(), title: 'TechSymposium 2026', description: 'National Technical Symposium featuring paper presentations, coding contests, and guest lectures.', date: '2026-07-20', time: '09:00', location: 'Main Auditorium', organizer: 'CSE Department', type: 'academic', createdAt: new Date().toISOString() },
      { _id: generateId(), title: 'Inter-Hostel Football Tournament', description: 'Exciting matches between silicone and copper halls of residence.', date: '2026-07-15', time: '16:30', location: 'Campus Sports Ground', organizer: 'Sports Committee', type: 'sports', createdAt: new Date().toISOString() }
    ];

    // Write back the initialized DB
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    return db;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading fallback db file:', error);
    return { ...emptyDb };
  }
}

// Writes back changes to the file DB
function writeDbFile(db: CampusDbSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing fallback db file:', error);
  }
}

// Simple query matcher for Mongo-like syntax
function queryMatches(item: any, query: any): boolean {
  if (!query) return true;
  for (const key in query) {
    const val = query[key];
    if (val && typeof val === 'object' && '$in' in val) {
      if (!Array.isArray(val.$in) || !val.$in.includes(String(item[key]))) {
        return false;
      }
    } else if (val && typeof val === 'object' && '$or' in val) {
      // Direct array of subqueries
    } else {
      // Standard comparison, stringify ID comparisons just in case
      const itemVal = item[key] ? String(item[key]) : '';
      const queryVal = val ? String(val) : '';
      if (itemVal !== queryVal) {
        return false;
      }
    }
  }
  return true;
}

// DB Repository Pattern API
export const dbAdapter = {
  // Returns model or collection
  async find<T>(collectionName: keyof CampusDbSchema, query: any = {}, populateFields: string[] = []): Promise<T[]> {
    if (isConnected()) {
      const model = (mongooseModels as any)[getMongooseModelName(collectionName)];
      if (model) {
        let q = model.find(query);
        for (const field of populateFields) {
          q = q.populate(field);
        }
        return await q.lean();
      }
    }

    // Fallback implementation
    const db = readDbFile();
    const items = db[collectionName] || [];
    const matched = items.filter(item => queryMatches(item, query));

    // Simple manual hydration for fallback if populated fields are requested
    if (populateFields.length > 0) {
      const dbFull = readDbFile();
      for (const item of matched) {
        for (const field of populateFields) {
          if (field === 'courseId') {
            item.courseId = dbFull.courses.find(c => c._id === String(item.courseId)) || item.courseId;
          }
          if (field === 'subjectId') {
            item.subjectId = dbFull.subjects.find(s => s._id === String(item.subjectId)) || item.subjectId;
          }
          if (field === 'facultyId') {
            item.facultyId = dbFull.faculty.find(f => f._id === String(item.facultyId)) || item.facultyId;
          }
          if (field === 'studentId') {
            item.studentId = dbFull.students.find(s => s._id === String(item.studentId)) || item.studentId;
          }
          if (field === 'hostelId') {
            item.hostelId = dbFull.hostels.find(h => h._id === String(item.hostelId)) || item.hostelId;
          }
        }
      }
    }

    return matched as any as T[];
  },

  async findOne<T>(collectionName: keyof CampusDbSchema, query: any, populateFields: string[] = []): Promise<T | null> {
    if (isConnected()) {
      const model = (mongooseModels as any)[getMongooseModelName(collectionName)];
      if (model) {
        let q = model.findOne(query);
        for (const field of populateFields) {
          q = q.populate(field);
        }
        return await q.lean();
      }
    }

    const matched = await dbAdapter.find<T>(collectionName, query, populateFields);
    return matched.length > 0 ? matched[0] : null;
  },

  async findById<T>(collectionName: keyof CampusDbSchema, id: string, populateFields: string[] = []): Promise<T | null> {
    if (isConnected()) {
      const model = (mongooseModels as any)[getMongooseModelName(collectionName)];
      if (model) {
        let q = model.findById(id);
        for (const field of populateFields) {
          q = q.populate(field);
        }
        return await q.lean();
      }
    }

    return await dbAdapter.findOne<T>(collectionName, { _id: id }, populateFields);
  },

  async create<T>(collectionName: keyof CampusDbSchema, data: any): Promise<T> {
    const now = new Date().toISOString();
    const finalData = {
      _id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now
    };

    if (isConnected()) {
      const model = (mongooseModels as any)[getMongooseModelName(collectionName)];
      if (model) {
        const created = await model.create(data);
        return created.toObject() as T;
      }
    }

    const db = readDbFile();
    if (!db[collectionName]) {
      db[collectionName] = [];
    }
    db[collectionName].push(finalData);
    writeDbFile(db);
    return finalData as any as T;
  },

  async update<T>(collectionName: keyof CampusDbSchema, id: string, data: any): Promise<T | null> {
    if (isConnected()) {
      const model = (mongooseModels as any)[getMongooseModelName(collectionName)];
      if (model) {
        const updated = await model.findByIdAndUpdate(id, data, { new: true });
        return updated ? updated.toObject() as T : null;
      }
    }

    const db = readDbFile();
    const items = db[collectionName] || [];
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;

    const updatedItem = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    items[index] = updatedItem;
    writeDbFile(db);
    return updatedItem as any as T;
  },

  async delete(collectionName: keyof CampusDbSchema, id: string): Promise<boolean> {
    if (isConnected()) {
      const model = (mongooseModels as any)[getMongooseModelName(collectionName)];
      if (model) {
        const deleted = await model.findByIdAndDelete(id);
        return deleted !== null;
      }
    }

    const db = readDbFile();
    const items = db[collectionName] || [];
    const initialLength = items.length;
    db[collectionName] = items.filter(item => item._id !== id);
    writeDbFile(db);
    return db[collectionName].length < initialLength;
  }
};

// Helper to translate plural collection keys to Mongoose model compiling exports
function getMongooseModelName(key: keyof CampusDbSchema): string {
  const map: Record<keyof CampusDbSchema, string> = {
    courses: 'CourseM',
    subjects: 'SubjectM',
    students: 'StudentM',
    faculty: 'FacultyM',
    admins: 'AdminM',
    attendance: 'AttendanceM',
    assignments: 'AssignmentM',
    results: 'ResultM',
    fees: 'FeeM',
    librarybooks: 'LibraryBookM',
    hostels: 'HostelM',
    events: 'EventM',
    notices: 'NoticeM',
    leaverequests: 'LeaveRequestM',
    timetableentries: 'TimetableEntryM'
  };
  return map[key];
}
