import { Request, Response } from 'express';
import { dbAdapter } from '../config/dbAdapter.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

// --- FEES ---
export async function getFees(req: Request, res: Response): Promise<void> {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  const { studentId, status } = req.query;
  const query: any = {};

  // Student can ONLY view their own fees
  if (user.role === 'student') {
    query.studentId = user.id;
  } else {
    if (studentId) query.studentId = studentId;
  }

  if (status) query.status = status;

  try {
    const fees = await dbAdapter.find('fees', query, ['studentId']);
    res.json(fees);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching fees.', error: error.message });
  }
}

export async function createFee(req: Request, res: Response): Promise<void> {
  const { studentId, amount, dueDate, type } = req.body;
  if (!studentId || !amount || !dueDate || !type) {
    res.status(400).json({ message: 'studentId, amount, dueDate, and fee type are required.' });
    return;
  }
  try {
    const fee = await dbAdapter.create('fees', {
      studentId,
      amount: Number(amount),
      dueDate,
      type,
      status: 'unpaid'
    });
    res.status(201).json(fee);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating fee invoice.', error: error.message });
  }
}

export async function payFee(req: Request, res: Response): Promise<void> {
  const { feeId } = req.params;
  const { paymentMethod, transactionId } = req.body;

  if (!paymentMethod || !transactionId) {
    res.status(400).json({ message: 'paymentMethod and transactionId are required for payment processing.' });
    return;
  }

  try {
    const fee = await dbAdapter.findById('fees', feeId);
    if (!fee) {
      res.status(404).json({ message: 'Fee invoice not found.' });
      return;
    }

    const updated = await dbAdapter.update('fees', feeId, {
      status: 'paid',
      paymentMethod,
      transactionId,
      paidAt: new Date().toISOString()
    });

    res.json({ message: 'Fee payment simulated successfully!', fee: updated });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating fee payment status.', error: error.message });
  }
}


// --- LIBRARY ---
export async function getBooks(req: Request, res: Response): Promise<void> {
  const { category, search } = req.query;
  const query: any = {};
  if (category) query.category = category;

  try {
    const books = await dbAdapter.find('librarybooks', query);
    
    // If there is a manual search term
    if (search) {
      const term = String(search).toLowerCase();
      const filtered = books.filter((b: any) => 
        b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term) || b.isbn.includes(term)
      );
      res.json(filtered);
      return;
    }

    res.json(books);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching library books.', error: error.message });
  }
}

export async function createBook(req: Request, res: Response): Promise<void> {
  const { title, author, isbn, category, totalCopies } = req.body;
  if (!title || !author || !isbn || !category || totalCopies === undefined) {
    res.status(400).json({ message: 'All fields (title, author, isbn, category, totalCopies) are required.' });
    return;
  }
  try {
    const existing = await dbAdapter.findOne('librarybooks', { isbn });
    if (existing) {
      res.status(400).json({ message: 'A book with this ISBN already exists.' });
      return;
    }
    const book = await dbAdapter.create('librarybooks', {
      title,
      author,
      isbn,
      category,
      totalCopies: Number(totalCopies),
      availableCopies: Number(totalCopies),
      borrowedBy: []
    });
    res.status(201).json(book);
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding library book.', error: error.message });
  }
}

export async function borrowBook(req: Request, res: Response): Promise<void> {
  const { bookId } = req.params;
  const { studentId } = req.body;

  if (!studentId) {
    res.status(400).json({ message: 'studentId is required to borrow a book.' });
    return;
  }

  try {
    const book: any = await dbAdapter.findById('librarybooks', bookId);
    if (!book) {
      res.status(404).json({ message: 'Book not found.' });
      return;
    }

    if (book.availableCopies <= 0) {
      res.status(400).json({ message: 'No available copies left of this book.' });
      return;
    }

    const borrowedBy = book.borrowedBy || [];
    // Check if already borrowed and not returned
    const activeBorrow = borrowedBy.find((b: any) => b.studentId === studentId && b.status === 'borrowed');
    if (activeBorrow) {
      res.status(400).json({ message: 'Student has already borrowed a copy of this book and has not returned it yet.' });
      return;
    }

    borrowedBy.push({
      studentId,
      borrowDate: new Date().toISOString().split('T')[0],
      status: 'borrowed'
    });

    const updated = await dbAdapter.update('librarybooks', bookId, {
      borrowedBy,
      availableCopies: book.availableCopies - 1
    });

    res.json({ message: 'Book issued successfully!', book: updated });
  } catch (error: any) {
    res.status(500).json({ message: 'Error issuing book.', error: error.message });
  }
}

export async function returnBook(req: Request, res: Response): Promise<void> {
  const { bookId } = req.params;
  const { studentId } = req.body;

  if (!studentId) {
    res.status(400).json({ message: 'studentId is required to return a book.' });
    return;
  }

  try {
    const book: any = await dbAdapter.findById('librarybooks', bookId);
    if (!book) {
      res.status(404).json({ message: 'Book not found.' });
      return;
    }

    const borrowedBy = book.borrowedBy || [];
    const borrowRecord = borrowedBy.find((b: any) => b.studentId === studentId && b.status === 'borrowed');
    
    if (!borrowRecord) {
      res.status(400).json({ message: 'No active borrow record found for this student and book.' });
      return;
    }

    borrowRecord.status = 'returned';
    borrowRecord.returnDate = new Date().toISOString().split('T')[0];

    const updated = await dbAdapter.update('librarybooks', bookId, {
      borrowedBy,
      availableCopies: Math.min(book.totalCopies, book.availableCopies + 1)
    });

    res.json({ message: 'Book returned successfully!', book: updated });
  } catch (error: any) {
    res.status(500).json({ message: 'Error returning book.', error: error.message });
  }
}


// --- HOSTELS ---
export async function getHostels(req: Request, res: Response): Promise<void> {
  try {
    const hostels = await dbAdapter.find('hostels');
    res.json(hostels);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching hostels.', error: error.message });
  }
}

export async function createHostel(req: Request, res: Response): Promise<void> {
  const { name, type, capacity, rooms, wardenName, wardenPhone } = req.body;
  if (!name || !type || !capacity || !wardenName || !wardenPhone) {
    res.status(400).json({ message: 'name, type, capacity, wardenName, and wardenPhone are required.' });
    return;
  }

  try {
    const defaultRooms = rooms || [
      { roomNumber: '101', studentIds: [], capacity: 2 },
      { roomNumber: '102', studentIds: [], capacity: 2 },
      { roomNumber: '103', studentIds: [], capacity: 2 }
    ];

    const hostel = await dbAdapter.create('hostels', {
      name,
      type,
      capacity: Number(capacity),
      rooms: defaultRooms,
      wardenName,
      wardenPhone
    });
    res.status(201).json(hostel);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating hostel block.', error: error.message });
  }
}


// --- EVENTS ---
export async function getEvents(req: Request, res: Response): Promise<void> {
  try {
    const events = await dbAdapter.find('events');
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching events.', error: error.message });
  }
}

export async function createEvent(req: Request, res: Response): Promise<void> {
  const { title, description, date, time, location, organizer, type } = req.body;
  if (!title || !description || !date || !time || !location || !organizer || !type) {
    res.status(400).json({ message: 'All fields are required.' });
    return;
  }
  try {
    const event = await dbAdapter.create('events', { title, description, date, time, location, organizer, type });
    res.status(201).json(event);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating event.', error: error.message });
  }
}


// --- NOTICES ---
export async function getNotices(req: Request, res: Response): Promise<void> {
  const { audience } = req.query;
  const query: any = {};
  if (audience) query.audience = audience;

  try {
    const notices = await dbAdapter.find('notices', query);
    res.json(notices);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching notices.', error: error.message });
  }
}

export async function createNotice(req: Request, res: Response): Promise<void> {
  const user = (req as AuthenticatedRequest).user;
  const { title, content, audience } = req.body;

  if (!title || !content || !audience) {
    res.status(400).json({ message: 'title, content, and audience are required.' });
    return;
  }

  try {
    let authorName = 'System Admin';
    if (user?.role === 'faculty') {
      const faculty: any = await dbAdapter.findById('faculty', user.id);
      if (faculty) authorName = faculty.name;
    } else if (user?.role === 'admin') {
      const admin: any = await dbAdapter.findById('admins', user.id);
      if (admin) authorName = admin.name;
    }

    const notice = await dbAdapter.create('notices', {
      title,
      content,
      audience,
      authorId: user?.id,
      authorName
    });
    res.status(201).json(notice);
  } catch (error: any) {
    res.status(500).json({ message: 'Error publishing notice.', error: error.message });
  }
}


// --- LEAVES ---
export async function getLeaves(req: Request, res: Response): Promise<void> {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  const { status } = req.query;
  const query: any = {};

  // Students see ONLY their own requests. Faculty see their own or student requests depending on status.
  if (user.role === 'student') {
    query.userId = user.id;
  } else if (user.role === 'faculty') {
    // Can view all student leaves or their own
    query.role = 'student';
  }

  if (status) query.status = status;

  try {
    const leaves = await dbAdapter.find('leaverequests', query);
    res.json(leaves);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching leave requests.', error: error.message });
  }
}

export async function applyLeave(req: Request, res: Response): Promise<void> {
  const user = (req as AuthenticatedRequest).user;
  const { startDate, endDate, reason } = req.body;

  if (!startDate || !endDate || !reason) {
    res.status(400).json({ message: 'startDate, endDate, and reason are required.' });
    return;
  }

  try {
    let userName = 'User';
    if (user?.role === 'student') {
      const student: any = await dbAdapter.findById('students', user.id);
      if (student) userName = student.name;
    } else if (user?.role === 'faculty') {
      const faculty: any = await dbAdapter.findById('faculty', user.id);
      if (faculty) userName = faculty.name;
    }

    const newRequest = await dbAdapter.create('leaverequests', {
      userId: user?.id,
      userName,
      role: user?.role,
      startDate,
      endDate,
      reason,
      status: 'pending'
    });

    res.status(201).json(newRequest);
  } catch (error: any) {
    res.status(500).json({ message: 'Error submitting leave application.', error: error.message });
  }
}

export async function reviewLeave(req: Request, res: Response): Promise<void> {
  const user = (req as AuthenticatedRequest).user;
  const { leaveId } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  if (!status || !['approved', 'rejected'].includes(status)) {
    res.status(400).json({ message: 'Valid status (approved or rejected) is required.' });
    return;
  }

  try {
    const leave: any = await dbAdapter.findById('leaverequests', leaveId);
    if (!leave) {
      res.status(404).json({ message: 'Leave request not found.' });
      return;
    }

    // Faculty can review Student leaves, Admins can review all leaves
    if (user?.role === 'faculty' && leave.role !== 'student') {
      res.status(403).json({ message: 'Faculty can only review student leave requests.' });
      return;
    }

    const updated = await dbAdapter.update('leaverequests', leaveId, {
      status,
      approvedBy: user?.id
    });

    res.json({ message: `Leave request has been ${status}!`, leave: updated });
  } catch (error: any) {
    res.status(500).json({ message: 'Error reviewing leave request.', error: error.message });
  }
}
