import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  UserCheck, 
  Mail, 
  Phone, 
  X,
  Award,
  BookOpen
} from 'lucide-react';
import { Faculty } from '../types';

interface FacultyManagerProps {
  faculty: Faculty[];
  onAdd: (data: any) => Promise<void>;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  user: any;
}

export default function FacultyManager({
  faculty,
  onAdd,
  onUpdate,
  onDelete,
  user
}: FacultyManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employeeId: '',
    department: 'Computer Science',
    designation: 'Assistant Professor',
    phone: '',
    subjects: [] as string[]
  });

  const departments = [
    'Computer Science',
    'Electronics & Comm',
    'Mechanical Eng',
    'Civil Engineering',
    'Biotechnology',
    'Applied Sciences'
  ];

  const designations = [
    'Head of Department',
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Senior Lecturer',
    'Lab Instructor'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      password: 'FacultyPassword123', // Default initial fallback
      employeeId: `FAC-${Date.now().toString().slice(-4)}`,
      department: 'Computer Science',
      designation: 'Assistant Professor',
      phone: '',
      subjects: []
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (fac: Faculty) => {
    setEditingFaculty(fac);
    setFormData({
      name: fac.name,
      email: fac.email,
      password: '', // Kept empty unless changed
      employeeId: fac.employeeId,
      department: fac.department || 'Computer Science',
      designation: fac.designation || 'Assistant Professor',
      phone: fac.phone || '',
      subjects: fac.subjects || []
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFaculty) {
        await onUpdate(editingFaculty._id, formData);
        setEditingFaculty(null);
      } else {
        await onAdd(formData);
        setIsAddModalOpen(false);
      }
    } catch (err: any) {
      alert(`Operation failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to retire this faculty member from active service?')) {
      try {
        await onDelete(id);
      } catch (err: any) {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  // Filter faculty
  const filteredFaculty = faculty.filter(fac => {
    const matchesSearch = fac.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          fac.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          fac.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'all' || fac.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const isEditable = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">Faculty Directory</h2>
          <p className="text-xs text-slate-500 mt-1">Manage professorial cohorts, board reviews, departments, and course allocations.</p>
        </div>
        {isEditable && (
          <button 
            onClick={openAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 shrink-0"
          >
            <UserCheck size={16} /> Onboard Faculty
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, employee code, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 shrink-0">
            <Filter size={14} /> Department:
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none text-slate-700 font-medium"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredFaculty.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 col-span-full text-slate-400 text-sm">
            <BookOpen size={32} className="mx-auto mb-2 text-slate-300" />
            No faculty members found matching filters.
          </div>
        ) : (
          filteredFaculty.map((fac) => (
            <div 
              key={fac._id} 
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm font-display">
                      {fac.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 leading-tight font-display">{fac.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">{fac.employeeId}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold tracking-wide uppercase bg-indigo-50 text-indigo-600 border border-indigo-100">
                    {fac.department.split(' ')[0]}
                  </span>
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Award size={14} className="text-amber-500 shrink-0" />
                    <span className="font-medium truncate">{fac.designation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{fac.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span>{fac.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {isEditable && (
                <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-slate-100/60 shrink-0">
                  <button
                    onClick={() => openEditModal(fac)}
                    className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition text-xs flex items-center gap-1 font-medium"
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(fac._id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition text-xs flex items-center gap-1 font-medium"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add & Edit Modal */}
      {(isAddModalOpen || editingFaculty) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="h-14 bg-slate-900 px-5 flex items-center justify-between text-white shrink-0">
              <h3 className="font-display font-semibold text-base">
                {editingFaculty ? 'Modify Faculty Record' : 'Onboard Faculty Officer'}
              </h3>
              <button 
                onClick={() => { setIsAddModalOpen(false); setEditingFaculty(null); }}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
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

                {!editingFaculty && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Initial Password</label>
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
                  <label className="block text-xs font-medium text-slate-500 mb-1">Employee Code ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    required
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-mono text-slate-700 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Staff Designation</label>
                  <select
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    {designations.map(des => (
                      <option key={des} value={des}>{des}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingFaculty(null); }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-indigo-600/10"
                >
                  {editingFaculty ? 'Update Record' : 'Onboard Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
