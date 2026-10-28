import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Student, Department, Course } from '../types/index.ts';
import { Modal } from '../components/Modal.tsx';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Printer,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Building,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface StudentsListProps {
  onSelectStudent: (studentId: number) => void;
  onOpenAdmission?: () => void;
  externalSearch?: string;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  onSelectStudent,
  onOpenAdmission,
  externalSearch = '',
}) => {
  const { isAdmin, isTeacher, isStudent, user } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(externalSearch);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Metadata
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Modals
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    if (externalSearch !== undefined && externalSearch !== search) {
      setSearch(externalSearch);
      setPage(1);
    }
  }, [externalSearch]);

  useEffect(() => {
    loadStudents();
  }, [search, selectedDept, selectedYear, selectedStatus, page]);

  const loadMeta = async () => {
    try {
      const [deptList, courseList] = await Promise.all([
        api.getDepartments(),
        api.getCourses(),
      ]);
      setDepartments(deptList);
      setCourses(courseList);
    } catch (e) {
      console.error(e);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await api.getStudents({
        search,
        departmentId: selectedDept ? parseInt(selectedDept, 10) : undefined,
        year: selectedYear ? parseInt(selectedYear, 10) : undefined,
        status: selectedStatus || undefined,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
      setStudents(res.students);
      setTotalStudents(res.total);
    } catch (err) {
      console.error('Failed to load students', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      setIsDeleting(true);
      await api.deleteStudent(deleteConfirmId);
      setDeleteConfirmId(null);
      await loadStudents();
    } catch (err) {
      console.error('Failed to delete student', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      setIsSaving(true);
      await api.updateStudent(editingStudent.id, editingStudent);
      setEditingStudent(null);
      await loadStudents();
    } catch (err) {
      console.error('Failed to update student', err);
    } finally {
      setIsSaving(false);
    }
  };

  // CSV Export
  const exportToCSV = () => {
    const headers = [
      'Student ID',
      'Roll Number',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Department',
      'Course',
      'Year',
      'Semester',
      'Section',
      'Status',
    ];
    const rows = students.map((s) => [
      s.studentId,
      s.rollNumber,
      s.firstName,
      s.lastName,
      s.email,
      s.phone,
      s.departmentCode || s.departmentName || '',
      s.courseCode || s.courseName || '',
      s.year,
      s.semester,
      s.section,
      s.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Students_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(totalStudents / pageSize) || 1;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header with Title and Action buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {totalStudents} Enrolled
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete records, academic tracking, personal info, and status management.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={exportToCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-2 shadow-2xs transition-all"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-2 shadow-2xs transition-all"
            title="Print roster"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print List
          </button>
          {isAdmin && onOpenAdmission && (
            <button
              onClick={onOpenAdmission}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add New Student
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, student ID, roll number, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Academic Years</option>
              <option value="1">Year 1 (Freshman)</option>
              <option value="2">Year 2 (Sophomore)</option>
              <option value="3">Year 3 (Junior)</option>
              <option value="4">Year 4 (Senior)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Graduated">Graduated</option>
              <option value="Suspended">Suspended</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No students found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search criteria, clear active filters, or admit a new student into the system.
            </p>
            {isAdmin && onOpenAdmission && (
              <button
                onClick={onOpenAdmission}
                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
              >
                Admit Student
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Student Details</th>
                  <th className="px-4 py-3.5">ID / Roll No</th>
                  <th className="px-4 py-3.5">Course & Dept</th>
                  <th className="px-4 py-3.5">Year / Sem</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectStudent(student.id)}
                  >
                    {/* Student Details */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-200 border border-slate-200 flex-shrink-0">
                          {student.profilePhoto ? (
                            <img
                              src={student.profilePhoto}
                              alt={student.firstName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                              {student.firstName[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span className="capitalize">{student.gender}</span> • DOB: {student.dateOfBirth}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ID / Roll */}
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-semibold text-slate-800">{student.studentId}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Roll: {student.rollNumber}</div>
                    </td>

                    {/* Course & Dept */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">
                        {student.departmentCode || 'CSE'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                        {student.courseName || 'B.Tech CS'}
                      </div>
                    </td>

                    {/* Year / Sem */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded font-semibold text-[11px] bg-indigo-50 text-indigo-700">
                        Year {student.year} (Sem {student.semester})
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">Sec: {student.section}</div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-[11px] text-slate-700">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[130px]">{student.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{student.phone}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          student.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : student.status === 'Graduated'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : student.status === 'Suspended'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td
                      className="px-4 py-3.5 text-right space-x-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onSelectStudent(student.id)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View profile & academic ledger"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => setEditingStudent({ ...student })}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit student"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(student.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{students.length}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalStudents}</span> students
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <Modal
          isOpen={!!editingStudent}
          onClose={() => setEditingStudent(null)}
          title={`Edit Student: ${editingStudent.firstName} ${editingStudent.lastName}`}
          subtitle={`Student ID: ${editingStudent.studentId}`}
          maxWidth="2xl"
        >
          <form onSubmit={handleUpdateStudent} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={editingStudent.firstName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, firstName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={editingStudent.lastName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, lastName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  required
                  value={editingStudent.phone}
                  onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={editingStudent.departmentId}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, departmentId: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course</label>
                <select
                  value={editingStudent.courseId}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, courseId: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Year & Semester</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={editingStudent.year}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, year: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                  <select
                    value={editingStudent.semester}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, semester: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Sem {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editingStudent.status}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, status: e.target.value as any })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Active">Active</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  value={editingStudent.parentName || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Phone</label>
                <input
                  type="text"
                  value={editingStudent.parentPhone || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <Modal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title="Confirm Student Deletion"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 bg-red-50 text-red-800 rounded-xl border border-red-200">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
              <p className="text-xs leading-relaxed">
                Are you sure you want to delete this student record? This will permanently remove all associated attendance, grades, fee vouchers, and submissions from Cloud SQL.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Student'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
