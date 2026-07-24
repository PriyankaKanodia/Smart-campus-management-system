import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Search, 
  Plus, 
  Filter, 
  QrCode, 
  Barcode as BarcodeIcon, 
  BookOpen, 
  FileText, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Eye, 
  User, 
  UserCheck, 
  RotateCcw, 
  Bookmark, 
  DollarSign, 
  Sparkles, 
  Trash2, 
  Edit, 
  Camera, 
  Check, 
  Building,
  Layers,
  FileSpreadsheet,
  RefreshCw,
  X,
  Maximize2
} from 'lucide-react';
import { LibraryBook, LibraryBorrowRecord } from '../types';
import { useToast } from './Toast';

interface LibraryManagerProps {
  user: any; // Admin, Faculty, or Student
  onBooksChange?: (books: LibraryBook[]) => void;
}

// Initial Mock Book Collection
const INITIAL_BOOKS: LibraryBook[] = [
  {
    _id: 'bk_101',
    title: 'Introduction to Algorithms (CLRS 4th Ed)',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
    isbn: '978-0262046305',
    category: 'Computer Science',
    totalCopies: 15,
    availableCopies: 11,
    borrowedBy: [
      {
        studentId: 's1',
        borrowDate: '2026-07-01',
        returnDate: '2026-07-15', // Overdue
        status: 'borrowed'
      }
    ],
    createdAt: '2026-01-10'
  },
  {
    _id: 'bk_102',
    title: 'Database System Concepts (7th Edition)',
    author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
    isbn: '978-0073523323',
    category: 'Computer Science',
    totalCopies: 10,
    availableCopies: 8,
    borrowedBy: [
      {
        studentId: 's2',
        borrowDate: '2026-07-10',
        returnDate: '2026-07-24',
        status: 'borrowed'
      }
    ],
    createdAt: '2026-01-12'
  },
  {
    _id: 'bk_103',
    title: 'Artificial Intelligence: A Modern Approach (4th Ed)',
    author: 'Stuart Russell, Peter Norvig',
    isbn: '978-0134610993',
    category: 'Computer Science',
    totalCopies: 8,
    availableCopies: 0, // Fully reserved/out of stock
    borrowedBy: [],
    createdAt: '2026-02-01'
  },
  {
    _id: 'bk_104',
    title: 'Discrete Mathematics and Its Applications',
    author: 'Kenneth H. Rosen',
    isbn: '978-1259676512',
    category: 'Mathematics',
    totalCopies: 20,
    availableCopies: 18,
    borrowedBy: [],
    createdAt: '2026-02-15'
  },
  {
    _id: 'bk_105',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin (Uncle Bob)',
    isbn: '978-0132350884',
    category: 'Software Engineering',
    totalCopies: 12,
    availableCopies: 9,
    borrowedBy: [],
    createdAt: '2026-03-01'
  },
  {
    _id: 'bk_106',
    title: 'Quantum Mechanics: The Theoretical Minimum',
    author: 'Leonard Susskind, Art Friedman',
    isbn: '978-0465062904',
    category: 'Physics',
    totalCopies: 6,
    availableCopies: 5,
    borrowedBy: [],
    createdAt: '2026-03-10'
  }
];

export default function LibraryManager({ user, onBooksChange }: LibraryManagerProps) {
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin';
  const isFaculty = user?.role === 'faculty';
  const isStudent = user?.role === 'student';

  const [books, setBooks] = useState<LibraryBook[]>(INITIAL_BOOKS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showEbooksOnly, setShowEbooksOnly] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'catalog' | 'issued' | 'fines' | 'reservations' | 'scanner'>('catalog');

  // Selected Book Details / E-book Modal
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [readingEbook, setReadingEbook] = useState<LibraryBook | null>(null);

  // Modal Forms
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Form States
  const [newBookForm, setNewBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science',
    totalCopies: 5,
    shelfLocation: 'Rack B-102',
    isEbook: false,
    pdfUrl: ''
  });

  const [issueForm, setIssueForm] = useState({
    bookId: '',
    borrowerName: '',
    borrowerId: '',
    borrowerRole: 'student' as 'student' | 'faculty',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [returnSelected, setReturnSelected] = useState<{
    bookId: string;
    bookTitle: string;
    studentId: string;
    borrowDate: string;
    dueDate: string;
    overdueDays: number;
    fineAmount: number;
    waiveFine: boolean;
  } | null>(null);

  const [scannerInput, setScannerInput] = useState('');

  // Sample categories
  const categories = ['All', 'Computer Science', 'Mathematics', 'Software Engineering', 'Physics', 'Electronics', 'Literature', 'Management'];

  // Helper: Calculate Overdue Days and Fines ($1.00 per day)
  const calculateFine = (dueDateStr: string): { overdueDays: number; fineAmount: number } => {
    const due = new Date(dueDateStr);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const overdueDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const fineAmount = overdueDays * 1; // $1 per day
    return { overdueDays, fineAmount };
  };

  // Filtered Books
  const filteredBooks = books.filter(b => {
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.isbn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate Library Stats
  const totalBooksCount = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const totalAvailableCount = books.reduce((acc, b) => acc + b.availableCopies, 0);
  const totalIssuedCount = totalBooksCount - totalAvailableCount;

  // Active Borrowed Records across all books
  const activeIssuedRecords = books.flatMap(b => 
    (b.borrowedBy || [])
      .filter(r => r.status === 'borrowed')
      .map(r => {
        const { overdueDays, fineAmount } = calculateFine(r.returnDate || '2026-07-20');
        return {
          bookId: b._id,
          bookTitle: b.title,
          isbn: b.isbn,
          studentId: r.studentId,
          borrowDate: r.borrowDate,
          dueDate: r.returnDate || '2026-07-20',
          overdueDays,
          fineAmount
        };
      })
  );

  const totalPendingFines = activeIssuedRecords.reduce((sum, r) => sum + r.fineAmount, 0);

  // Add Book Handler
  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookForm.title || !newBookForm.author || !newBookForm.isbn) {
      toast('Please enter title, author, and ISBN number.', 'warning');
      return;
    }

    const newBook: LibraryBook = {
      _id: `bk_${Date.now()}`,
      title: newBookForm.title,
      author: newBookForm.author,
      isbn: newBookForm.isbn,
      category: newBookForm.category,
      totalCopies: Number(newBookForm.totalCopies) || 1,
      availableCopies: Number(newBookForm.totalCopies) || 1,
      borrowedBy: [],
      createdAt: new Date().toISOString()
    };

    const updated = [newBook, ...books];
    setBooks(updated);
    if (onBooksChange) onBooksChange(updated);
    setIsAddBookModalOpen(false);
    setNewBookForm({ title: '', author: '', isbn: '', category: 'Computer Science', totalCopies: 5, shelfLocation: 'Rack B-102', isEbook: false, pdfUrl: '' });
    toast(`Book "${newBook.title}" added to catalog successfully!`, 'success');
  };

  // Issue Book Handler
  const handleIssueBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.bookId || !issueForm.borrowerId) {
      toast('Please select a book and specify the borrower ID.', 'warning');
      return;
    }

    const targetBook = books.find(b => b._id === issueForm.bookId);
    if (!targetBook || targetBook.availableCopies <= 0) {
      toast('This book is currently out of stock or unavailable.', 'error');
      return;
    }

    const updatedBooks = books.map(b => {
      if (b._id === issueForm.bookId) {
        const newRecord: LibraryBorrowRecord = {
          studentId: issueForm.borrowerId,
          borrowDate: new Date().toISOString().split('T')[0],
          returnDate: issueForm.dueDate,
          status: 'borrowed'
        };
        return {
          ...b,
          availableCopies: b.availableCopies - 1,
          borrowedBy: [...(b.borrowedBy || []), newRecord]
        };
      }
      return b;
    });

    setBooks(updatedBooks);
    if (onBooksChange) onBooksChange(updatedBooks);
    setIsIssueModalOpen(false);
    toast(`Book issued to ${issueForm.borrowerId}! Due date: ${issueForm.dueDate}`, 'success');
  };

  // Return Book Handler
  const handleConfirmReturn = () => {
    if (!returnSelected) return;

    const updatedBooks = books.map(b => {
      if (b._id === returnSelected.bookId) {
        const updatedRecords = (b.borrowedBy || []).map(r => {
          if (r.studentId === returnSelected.studentId && r.status === 'borrowed') {
            return { ...r, status: 'returned' as const };
          }
          return r;
        });
        return {
          ...b,
          availableCopies: Math.min(b.totalCopies, b.availableCopies + 1),
          borrowedBy: updatedRecords
        };
      }
      return b;
    });

    setBooks(updatedBooks);
    if (onBooksChange) onBooksChange(updatedBooks);
    setReturnSelected(null);
    toast(`Book returned successfully! ${returnSelected.fineAmount > 0 && !returnSelected.waiveFine ? `Fine of $${returnSelected.fineAmount} collected.` : ''}`, 'success');
  };

  // Reserve Book Handler
  const handleReserveBook = (book: LibraryBook) => {
    toast(`Reservation hold placed for "${book.title}". You will be notified when copies arrive!`, 'info');
  };

  // Simulated Barcode / QR Scanner
  const handleScanCode = (scannedVal: string) => {
    const matchedBook = books.find(b => b.isbn.includes(scannedVal) || b._id.includes(scannedVal) || scannedVal.toLowerCase().includes('clrs'));
    if (matchedBook) {
      setSelectedBook(matchedBook);
      setIsScannerOpen(false);
      toast(`QR/Barcode Matched: ${matchedBook.title}`, 'success');
    } else {
      toast(`No book record matching barcode "${scannedVal}".`, 'warning');
    }
  };

  // Render SVG Barcode representation
  const renderSvgBarcode = (code: string) => {
    return (
      <svg className="w-full h-12 text-slate-800" viewBox="0 0 200 40">
        {code.split('').map((char, i) => {
          const width = (char.charCodeAt(0) % 3) + 1;
          const x = i * 14 + 10;
          return (
            <rect key={i} x={x} y="5" width={width * 2} height="30" fill="currentColor" />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Module Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-2xl font-bold shadow-lg shadow-indigo-600/20 shrink-0">
              <BookOpen className="h-7 w-7 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-display font-bold tracking-tight text-white">Smart Campus Library</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Digital Catalog & Circulation
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-4">
                <span>Total Titles: <strong className="text-slate-200">{books.length}</strong></span>
                <span>•</span>
                <span>Total Copies: <strong className="text-slate-200">{totalBooksCount}</strong></span>
                <span>•</span>
                <span>Available: <strong className="text-emerald-400">{totalAvailableCount}</strong></span>
                <span>•</span>
                <span>Issued: <strong className="text-amber-400">{totalIssuedCount}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition"
            >
              <QrCode className="h-4 w-4 text-indigo-400" /> Scan QR / Barcode
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => setIsIssueModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
                >
                  <UserCheck className="h-4 w-4" /> Issue Book
                </button>
                <button
                  onClick={() => setIsAddBookModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition"
                >
                  <Plus className="h-4 w-4" /> Add New Book
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Cataloged Titles</p>
            <p className="text-2xl font-bold font-mono text-slate-800 mt-0.5">{books.length}</p>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Book size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Available Copies</p>
            <p className="text-2xl font-bold font-mono text-emerald-600 mt-0.5">{totalAvailableCount}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Borrowed</p>
            <p className="text-2xl font-bold font-mono text-amber-600 mt-0.5">{activeIssuedRecords.length}</p>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Overdue Fines</p>
            <p className="text-2xl font-bold font-mono text-rose-600 mt-0.5">${totalPendingFines}</p>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'catalog', label: 'All Books Catalog', icon: Book },
              { id: 'issued', label: `Active Circulation (${activeIssuedRecords.length})`, icon: Clock },
              { id: 'fines', label: `Fines & Overdue ($${totalPendingFines})`, icon: DollarSign }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search title, author, ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
            />
          </div>
        </div>

        {/* Categories Bar */}
        {activeTab === 'catalog' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter size={12} /> Category:
            </span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-100 text-indigo-700 font-bold border border-indigo-200'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB CONTENT PANELS */}

      {/* 1. CATALOG TAB */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map((book) => {
            const isAvailable = book.availableCopies > 0;
            const percentageAvailable = Math.round((book.availableCopies / book.totalCopies) * 100);

            return (
              <div key={book._id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 relative overflow-hidden">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {book.category}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isAvailable ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {isAvailable ? `${book.availableCopies} Available` : 'Out of Stock'}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-slate-900 text-base mt-2.5 leading-snug line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium line-clamp-1">By {book.author}</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">ISBN: {book.isbn}</p>

                  {/* Copies Availability Bar */}
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Stock Ratio</span>
                      <span>{book.availableCopies} / {book.totalCopies} copies</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${percentageAvailable}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedBook(book)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Eye size={14} /> Details
                  </button>

                  <div className="flex items-center gap-1.5">
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIssueForm({ ...issueForm, bookId: book._id });
                          setIsIssueModalOpen(true);
                        }}
                        disabled={!isAvailable}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          isAvailable
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/10'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <UserCheck size={14} /> Issue
                      </button>
                    )}

                    {!isAdmin && (
                      <button
                        onClick={() => handleReserveBook(book)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/10"
                      >
                        Reserve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. ACTIVE CIRCULATION TAB */}
      {activeTab === 'issued' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              Active Issued Books & Circulation Logs
            </h3>
            <span className="text-xs font-mono text-slate-500">Total Active Borrowed: {activeIssuedRecords.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Book Title</th>
                  <th className="p-3">ISBN</th>
                  <th className="p-3">Borrower ID</th>
                  <th className="p-3">Issue Date</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeIssuedRecords.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="p-3 font-semibold text-slate-900">{rec.bookTitle}</td>
                    <td className="p-3 font-mono text-slate-500">{rec.isbn}</td>
                    <td className="p-3 font-mono font-bold text-indigo-600">{rec.studentId}</td>
                    <td className="p-3 text-slate-500">{rec.borrowDate}</td>
                    <td className="p-3 text-slate-500">{rec.dueDate}</td>
                    <td className="p-3">
                      {rec.overdueDays > 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-700 border border-rose-200">
                          {rec.overdueDays} Days Overdue (${rec.fineAmount} Fine)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          Active Loan
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {isAdmin && (
                        <button
                          onClick={() => setReturnSelected({
                            bookId: rec.bookId,
                            bookTitle: rec.bookTitle,
                            studentId: rec.studentId,
                            borrowDate: rec.borrowDate,
                            dueDate: rec.dueDate,
                            overdueDays: rec.overdueDays,
                            fineAmount: rec.fineAmount,
                            waiveFine: false
                          })}
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm"
                        >
                          Process Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. FINES & OVERDUE TAB */}
      {activeTab === 'fines' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-rose-600" />
                Library Overdue Fines & Fine Waiver Ledger
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Calculated automatically at $1.00 / day past due return date.</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-mono block">Outstanding Fine Ledger</span>
              <span className="text-2xl font-bold font-mono text-rose-600">${totalPendingFines}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeIssuedRecords.filter(r => r.overdueDays > 0).map((r, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                    {r.overdueDays} Days Overdue
                  </span>
                  <h4 className="font-semibold text-slate-800 text-sm mt-1">{r.bookTitle}</h4>
                  <p className="text-xs text-slate-500 font-mono">Borrower: {r.studentId} • Due: {r.dueDate}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold font-mono text-rose-600 block">${r.fineAmount}</span>
                  {isAdmin && (
                    <button
                      onClick={() => setReturnSelected({
                        bookId: r.bookId,
                        bookTitle: r.bookTitle,
                        studentId: r.studentId,
                        borrowDate: r.borrowDate,
                        dueDate: r.dueDate,
                        overdueDays: r.overdueDays,
                        fineAmount: r.fineAmount,
                        waiveFine: false
                      })}
                      className="text-xs text-indigo-600 hover:underline font-bold mt-1 inline-block"
                    >
                      Collect / Waive Fine
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODALS & OVERLAYS --- */}

      {/* BOOK DETAILS MODAL WITH QR & BARCODE */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <BookOpen size={24} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">
                  {selectedBook.category}
                </span>
                <h3 className="font-display font-bold text-slate-900 text-lg leading-tight mt-1">
                  {selectedBook.title}
                </h3>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p><strong>Author:</strong> {selectedBook.author}</p>
              <p><strong>ISBN Number:</strong> <span className="font-mono">{selectedBook.isbn}</span></p>
              <p><strong>Total Stock Copies:</strong> {selectedBook.totalCopies}</p>
              <p><strong>Available Copies:</strong> {selectedBook.availableCopies}</p>
              <p><strong>Catalog Date:</strong> {selectedBook.createdAt ? new Date(selectedBook.createdAt).toLocaleDateString() : 'Active'}</p>
            </div>

            {/* Visual QR Code & Barcode Pass */}
            <div className="bg-slate-900 p-4 rounded-2xl text-white text-center space-y-3">
              <p className="text-xs font-mono text-indigo-300 uppercase tracking-widest">Library System Pass Tag</p>
              <div className="bg-white p-3 rounded-xl inline-block">
                <QrCode className="h-20 w-20 text-slate-900" />
              </div>
              {renderSvgBarcode(selectedBook.isbn)}
              <p className="text-[10px] font-mono text-slate-400">Scan at Circulation Desk Scanner</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedBook(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-semibold text-xs"
              >
                Close Pass View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCANNER MODAL */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Camera className="h-5 w-5 text-indigo-400 animate-pulse" />
                QR / Barcode Optical Scanner
              </h3>
              <button onClick={() => setIsScannerOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="h-48 rounded-2xl bg-slate-950 border-2 border-dashed border-indigo-500/50 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
              <div className="absolute inset-x-0 h-0.5 bg-indigo-500 animate-ping top-1/2" />
              <QrCode className="h-12 w-12 text-indigo-400 mb-2" />
              <p className="text-xs text-slate-400">Align ISBN or Library Pass QR inside the reticle</p>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Or Type / Paste Scanned Code:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 978-0262046305"
                  value={scannerInput}
                  onChange={(e) => setScannerInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  onClick={() => handleScanCode(scannerInput || '978-0262046305')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Lookup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD BOOK MODAL */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-display font-bold text-slate-900 text-base">Add New Book Title to Library</h3>
            <form onSubmit={handleAddBook} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Book Title</label>
                <input
                  type="text"
                  required
                  value={newBookForm.title}
                  onChange={(e) => setNewBookForm({ ...newBookForm, title: e.target.value })}
                  placeholder="e.g. Introduction to Algorithms"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Author Name(s)</label>
                <input
                  type="text"
                  required
                  value={newBookForm.author}
                  onChange={(e) => setNewBookForm({ ...newBookForm, author: e.target.value })}
                  placeholder="e.g. Thomas H. Cormen"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ISBN Number</label>
                  <input
                    type="text"
                    required
                    value={newBookForm.isbn}
                    onChange={(e) => setNewBookForm({ ...newBookForm, isbn: e.target.value })}
                    placeholder="978-0262046305"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select
                    value={newBookForm.category}
                    onChange={(e) => setNewBookForm({ ...newBookForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Total Stock Copies</label>
                <input
                  type="number"
                  min="1"
                  value={newBookForm.totalCopies}
                  onChange={(e) => setNewBookForm({ ...newBookForm, totalCopies: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="w-1/2 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  Save Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE BOOK MODAL */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-display font-bold text-slate-900 text-base">Issue Book to Student / Faculty</h3>
            <form onSubmit={handleIssueBookSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Book</label>
                <select
                  value={issueForm.bookId}
                  onChange={(e) => setIssueForm({ ...issueForm, bookId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                >
                  <option value="">-- Select Book Title --</option>
                  {books.map(b => (
                    <option key={b._id} value={b._id} disabled={b.availableCopies <= 0}>
                      {b.title} ({b.availableCopies} left)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Borrower ID (Roll Number / Emp ID)</label>
                <input
                  type="text"
                  required
                  value={issueForm.borrowerId}
                  onChange={(e) => setIssueForm({ ...issueForm, borrowerId: e.target.value })}
                  placeholder="e.g. ROLL-22045"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Return Due Date</label>
                <input
                  type="date"
                  required
                  value={issueForm.dueDate}
                  onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="w-1/2 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM RETURN & FINE MODAL */}
      {returnSelected && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-display font-bold text-slate-900 text-base">Process Book Return</h3>
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-700 border border-slate-100">
              <p><strong>Book:</strong> {returnSelected.bookTitle}</p>
              <p><strong>Borrower:</strong> {returnSelected.studentId}</p>
              <p><strong>Due Date:</strong> {returnSelected.dueDate}</p>
              <p className={returnSelected.overdueDays > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600'}>
                <strong>Overdue Status:</strong> {returnSelected.overdueDays > 0 ? `${returnSelected.overdueDays} Days Past Due` : 'Returned On Time'}
              </p>
            </div>

            {returnSelected.fineAmount > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-bold text-rose-700">
                  <span>Calculated Overdue Fine:</span>
                  <span>${returnSelected.fineAmount}</span>
                </div>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={returnSelected.waiveFine}
                    onChange={(e) => setReturnSelected({ ...returnSelected, waiveFine: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Waive Overdue Fine (Special Approval)</span>
                </label>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReturnSelected(null)}
                className="w-1/2 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                className="w-1/2 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Complete Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
