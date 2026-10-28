import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Teacher, Department } from '../types/index.ts';
import { Modal } from '../components/Modal.tsx';
import {
  GraduationCap,
  Mail,
  Phone,
  Building,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
} from 'lucide-react';

export const TeachersList: React.FC = () => {
  const { isAdmin } = useAuth();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '+1 (555) 234-5678',
    departmentId: 1,
    qualification: 'Ph.D. in Computer Science',
    joiningDate: '2023-08-15',
    status: 'Active' as const,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tList, dList] = await Promise.all([
        api.getTeachers(),
        api.getDepartments(),
      ]);
      setTeachers(tList);
      setDepartments(dList);
      if (dList.length > 0) setForm((f) => ({ ...f, departmentId: dList[0].id }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setForm({
      name: '',
      email: '',
      phone: '+1 (555) 234-5678',
      departmentId: departments[0]?.id || 1,
      qualification: 'Ph.D. in Engineering',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setForm({
      name: t.name,
      email: t.email,
      phone: t.phone || '',
      departmentId: t.departmentId,
      qualification: t.qualification || '',
      joiningDate: t.joiningDate || '',
      status: t.status as any,
      avatar: t.avatar || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingTeacher) {
        await api.updateTeacher(editingTeacher.id, form);
      } else {
        await api.createTeacher(form);
      }
      setModalOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this faculty member?')) return;
    try {
      await api.deleteTeacher(id);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(term) ||
      t.email.toLowerCase().includes(term) ||
      t.teacherId.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">University Faculty Directory</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Professors, lecturers, department heads, and academic credentials.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Faculty Member
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search faculty by name, department, or teacher ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
          />
        </div>
      </div>

      {/* Teachers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 border border-slate-200 flex-shrink-0">
                  {teacher.avatar ? (
                    <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                      {teacher.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{teacher.name}</h3>
                  <div className="text-[11px] font-mono text-indigo-600">{teacher.teacherId}</div>
                  <div className="text-[10px] text-slate-500">{teacher.departmentName || 'Computer Science'}</div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 py-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{teacher.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{teacher.qualification}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                {teacher.status}
              </span>

              {isAdmin && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(teacher)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(teacher.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Faculty Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingTeacher ? `Edit Faculty: ${editingTeacher.name}` : 'Add Faculty Member'}
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">University Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={form.departmentId}
                  onChange={(e) => setForm({ ...form, departmentId: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Qualifications</label>
              <input
                type="text"
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Faculty'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
