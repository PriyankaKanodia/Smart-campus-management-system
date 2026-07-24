import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Book, 
  Trash2, 
  Edit3, 
  X, 
  Layers,
  FileText
} from 'lucide-react';
import { Course } from '../types';

interface CourseManagerProps {
  courses: Course[];
  onAdd: (data: any) => Promise<void>;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  user: any;
}

export default function CourseManager({
  courses,
  onAdd,
  onUpdate,
  onDelete,
  user
}: CourseManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    durationYears: 4,
    description: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'durationYears' ? Number(value) : value 
    }));
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      code: `CSE-${Date.now().toString().slice(-3)}`,
      durationYears: 4,
      description: ''
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      durationYears: course.durationYears,
      description: course.description || ''
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await onUpdate(editingCourse._id, formData);
        setEditingCourse(null);
      } else {
        await onAdd(formData);
        setIsAddModalOpen(false);
      }
    } catch (err: any) {
      alert(`Course operation failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you absolutely sure you want to remove this course and its credit tracks? Existing student associations will have to be re-mapped.')) {
      try {
        await onDelete(id);
      } catch (err: any) {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isEditable = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">Academic Curriculum</h2>
          <p className="text-xs text-slate-500 mt-1">Manage degree courses, program blocks, credit catalogs, and course structures.</p>
        </div>
        {isEditable && (
          <button 
            onClick={openAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 shrink-0"
          >
            <Plus size={16} /> New Program
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search programs by code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredCourses.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 col-span-full text-slate-400 text-sm">
            <Layers size={32} className="mx-auto mb-2 text-slate-300" />
            No academic programs configured yet.
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div 
              key={course._id} 
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Book size={20} />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                    {course.durationYears} Years Program
                  </span>
                </div>

                <div className="mt-4">
                  <span className="text-xs text-indigo-600 font-mono font-semibold tracking-wider block uppercase">{course.code}</span>
                  <h4 className="font-semibold text-slate-900 text-base font-display mt-0.5 leading-snug">{course.name}</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">{course.description || 'No course overview description available.'}</p>
                </div>
              </div>

              {isEditable && (
                <div className="flex items-center justify-end gap-1 mt-5 pt-3 border-t border-slate-100/60 shrink-0">
                  <button
                    onClick={() => openEditModal(course)}
                    className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition text-xs flex items-center gap-1 font-medium"
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
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
      {(isAddModalOpen || editingCourse) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="h-14 bg-slate-900 px-5 flex items-center justify-between text-white shrink-0">
              <h3 className="font-display font-semibold text-base">
                {editingCourse ? 'Edit Syllabus Program' : 'Configure New Curriculum'}
              </h3>
              <button 
                onClick={() => { setIsAddModalOpen(false); setEditingCourse(null); }}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Syllabus Program Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g., Computer Science & Engineering"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Program Code</label>
                    <input
                      type="text"
                      name="code"
                      required
                      placeholder="e.g., CSE"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-mono text-slate-700 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Duration (Years)</label>
                    <input
                      type="number"
                      name="durationYears"
                      required
                      min={1}
                      max={6}
                      value={formData.durationYears}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Course Curriculum Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Outline credit metrics and core study tracks..."
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingCourse(null); }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-indigo-600/10"
                >
                  {editingCourse ? 'Save Changes' : 'Publish Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
