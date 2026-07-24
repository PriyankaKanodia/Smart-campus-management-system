import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  UserPlus, 
  Users,
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  X,
  CreditCard,
  Building
} from 'lucide-react';
import { Student, Course } from '../types';

interface StudentManagerProps {
  students: Student[];
  courses: Course[];
  onAdd: (data: any) => Promise<void>;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  user: any;
}

export default function StudentManager({
  students,
  courses,
  onAdd,
  onUpdate,
  onDelete,
  user
}: StudentManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    courseId: '',
    batch: '2023-2027',
    phone: '',
    address: '',
    dob: '',
    gender: 'male',
    guardianName: '',
    guardianPhone: '',
    hostelId: '',
    roomNumber: ''
  });

  const batches = ['2023-2027', '2024-2028', '2025-2029', '2026-2030'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      password: 'StudentPassword123', // Default initial fallback
      rollNumber: `ROLL-${Date.now().toString().slice(-5)}`,
      courseId: courses[0]?._id || '',
      batch: '2024-2028',
      phone: '',
      address: '',
      dob: '2004-01-01',
      gender: 'male',
      guardianName: '',
      guardianPhone: '',
      hostelId: '',
      roomNumber: ''
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      password: '', // Kept empty unless changed
      rollNumber: student.rollNumber,
      courseId: student.courseId,
      batch: student.batch,
      phone: student.phone || '',
      address: student.address || '',
      dob: student.dob || '',
      gender: student.gender || 'male',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
      hostelId: student.hostelId || '',
      roomNumber: student.roomNumber || ''
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await onUpdate(editingStudent._id, formData);
        setEditingStudent(null);
      } else {
        await onAdd(formData);
        setIsAddModalOpen(false);
      }
    } catch (err: any) {
      alert(`Operation failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you absolutely sure you want to delete this student record? This is irreversible.')) {
      try {
        await onDelete(id);
      } catch (err: any) {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourseId === 'all' || student.courseId === selectedCourseId;
    const matchesBatch = selectedBatch === 'all' || student.batch === selectedBatch;
    return matchesSearch && matchesCourse && matchesBatch;
  });

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c._id === courseId);
    return course ? `${course.code} - ${course.name}` : 'Unassigned';
  };

  const isEditable = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">Student Management</h2>
          <p className="text-xs text-slate-500 mt-1">Admissions list, roll allocations, department courses, and boarding details.</p>
        </div>
        {isEditable && (
          <button 
            onClick={openAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 shrink-0"
          >
            <UserPlus size={16} /> Admit Student
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, roll no, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 shrink-0">
            <Filter size={14} /> Filters:
          </div>

          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none text-slate-700 font-medium"
          >
            <option value="all">All Programs</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.code}</option>
            ))}
          </select>

          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none text-slate-700 font-medium"
          >
            <option value="all">All Batches</option>
            {batches.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-5">Student / Roll</th>
                <th className="py-3.5 px-5">Academic Program</th>
                <th className="py-3.5 px-5">Contact Details</th>
                <th className="py-3.5 px-5">Intake Batch</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <Users size={32} className="mx-auto mb-2 text-slate-300" />
                    No students found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/40 transition">
                    <td className="py-3.5 px-5">
                      <div>
                        <span 
                          onClick={() => setViewingStudent(student)}
                          className="font-semibold text-slate-800 hover:text-indigo-600 cursor-pointer block hover:underline"
                        >
                          {student.name}
                        </span>
                        <span className="text-xs text-slate-400 font-mono block mt-0.5">{student.rollNumber}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="text-slate-600 truncate max-w-xs">{getCourseName(student.courseId)}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="space-y-0.5 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Mail size={12} className="text-slate-400" />
                          <span>{student.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="text-slate-400" />
                          <span>{student.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-xs rounded-full font-medium">
                        {student.batch}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingStudent(student)}
                          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="View Profile Details"
                        >
                          View
                        </button>
                        {isEditable && (
                          <>
                            <button
                              onClick={() => openEditModal(student)}
                              className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                              title="Edit Student Info"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(student._id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                              title="Delete Student Record"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add & Edit Modal */}
      {(isAddModalOpen || editingStudent) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto select-none">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="h-14 bg-slate-900 px-5 flex items-center justify-between text-white shrink-0">
              <h3 className="font-display font-semibold text-base">
                {editingStudent ? 'Edit Student Details' : 'Onboard New Student'}
              </h3>
              <button 
                onClick={() => { setIsAddModalOpen(false); setEditingStudent(null); }}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 overflow-y-auto space-y-4">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Personal Info</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {!editingStudent && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1 mt-6">Academic Mapping</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Roll Number</label>
                  <input
                    type="text"
                    name="rollNumber"
                    required
                    value={formData.rollNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-mono text-slate-700 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Program / Course</label>
                  <select
                    name="courseId"
                    required
                    value={formData.courseId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>{course.code} - {course.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Intake Batch</label>
                  <select
                    name="batch"
                    required
                    value={formData.batch}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-white font-mono"
                  >
                    {batches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1 mt-6">Emergency & Guardian Contacts</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Guardian Full Name</label>
                  <input
                    type="text"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Guardian Phone</label>
                  <input
                    type="tel"
                    name="guardianPhone"
                    value={formData.guardianPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Correspondence Address</label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingStudent(null); }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-indigo-600/10"
                >
                  {editingStudent ? 'Save Updates' : 'Complete Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Details Drawer */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-950 p-5 text-white relative">
              <button 
                onClick={() => setViewingStudent(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-4 mt-2">
                <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-700 font-display flex items-center justify-center text-lg font-bold">
                  {viewingStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-display font-semibold leading-none">{viewingStudent.name}</h3>
                  <p className="text-xs text-indigo-400 font-mono mt-1">{viewingStudent.rollNumber}</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4 text-slate-700 text-xs">
              <div className="space-y-2">
                <p className="font-mono text-slate-400 uppercase tracking-wider text-[10px]">Academic Enrolment</p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-slate-800">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{getCourseName(viewingStudent.courseId)}</p>
                    <p className="text-slate-500 mt-0.5">Intake Intake: {viewingStudent.batch}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p className="font-mono text-slate-400 uppercase tracking-wider text-[10px]">Student Demographics</p>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase leading-none">Date of Birth</p>
                      <p className="font-medium mt-0.5">{viewingStudent.dob || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building size={14} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase leading-none">Gender</p>
                      <p className="font-medium mt-0.5 capitalize">{viewingStudent.gender || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase leading-none">Email Address</p>
                      <p className="font-medium mt-0.5 truncate max-w-[120px]">{viewingStudent.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase leading-none">Phone Number</p>
                      <p className="font-medium mt-0.5">{viewingStudent.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 items-start mt-3.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase leading-none">Permanent Address</p>
                    <p className="text-slate-600 mt-1 leading-normal">{viewingStudent.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="font-mono text-slate-400 uppercase tracking-wider text-[10px]">Guardian Details</p>
                <div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-100 flex justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 leading-none">Name</p>
                    <p className="font-medium text-slate-700 mt-1">{viewingStudent.guardianName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 leading-none">Contact</p>
                    <p className="font-medium text-slate-700 mt-1">{viewingStudent.guardianPhone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end shrink-0">
              <button 
                onClick={() => setViewingStudent(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
