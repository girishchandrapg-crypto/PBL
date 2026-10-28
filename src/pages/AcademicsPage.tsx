import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Department, Course, Subject, Teacher } from '../types/index.ts';
import { Modal } from '../components/Modal.tsx';
import {
  Building2,
  BookOpen,
  GraduationCap,
  Plus,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const AcademicsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [activeTab, setActiveTab] = useState<'departments' | 'courses' | 'subjects'>('departments');

  // Modals
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', hod: '', description: '' });

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({ name: '', code: '', departmentId: 1, duration: '4 Years', totalSemesters: 8 });

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjForm, setSubjForm] = useState({ name: '', code: '', courseId: 1, semester: 1, credits: 3, teacherId: 1 });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dList, cList, sList, tList] = await Promise.all([
        api.getDepartments(),
        api.getCourses(),
        api.getSubjects(),
        api.getTeachers(),
      ]);
      setDepartments(dList);
      setCourses(cList);
      setSubjects(sList);
      setTeachers(tList);
      if (dList.length > 0) setCourseForm((f) => ({ ...f, departmentId: dList[0].id }));
      if (cList.length > 0) setSubjForm((f) => ({ ...f, courseId: cList[0].id }));
      if (tList.length > 0) setSubjForm((f) => ({ ...f, teacherId: tList[0].id }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDepartment(deptForm);
      setShowDeptModal(false);
      setDeptForm({ name: '', code: '', hod: '', description: '' });
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCourse(courseForm);
      setShowCourseModal(false);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSubject(subjForm);
      setShowSubjectModal(false);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Curriculum & Structure</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Collegiate departments, degree programs, semester syllabus, and credit requirements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'departments' && (
            <button
              onClick={() => setShowDeptModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Department
            </button>
          )}
          {activeTab === 'courses' && (
            <button
              onClick={() => setShowCourseModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Course
            </button>
          )}
          {activeTab === 'subjects' && (
            <button
              onClick={() => setShowSubjectModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Subject
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { id: 'departments', label: `Departments (${departments.length})`, icon: Building2 },
          { id: 'courses', label: `Degree Courses (${courses.length})`, icon: GraduationCap },
          { id: 'subjects', label: `Course Subjects (${subjects.length})`, icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 font-semibold text-xs transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {departments.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    {d.code}
                  </span>
                  <span className="text-xs text-slate-400">ID #{d.id}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">{d.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{d.description}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Head of Dept:</span>
                <span className="font-bold text-slate-800">{d.hod || 'Unassigned'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs">
                    {c.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {c.duration}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">{c.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{c.description}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-slate-800">{c.departmentName}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Code</th>
                <th className="px-6 py-3.5">Subject Name</th>
                <th className="px-6 py-3.5">Course Program</th>
                <th className="px-6 py-3.5 text-center">Semester</th>
                <th className="px-6 py-3.5 text-center">Credits</th>
                <th className="px-6 py-3.5">Assigned Instructor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {subjects.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3.5 font-mono font-bold text-indigo-600">{s.code}</td>
                  <td className="px-6 py-3.5 font-semibold text-slate-900">{s.name}</td>
                  <td className="px-6 py-3.5">{s.courseName}</td>
                  <td className="px-6 py-3.5 text-center font-medium">Sem {s.semester}</td>
                  <td className="px-6 py-3.5 text-center font-bold text-slate-900">{s.credits} Credits</td>
                  <td className="px-6 py-3.5">{s.teacherName || 'Faculty Assigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Department Modal */}
      {showDeptModal && (
        <Modal
          isOpen={showDeptModal}
          onClose={() => setShowDeptModal(false)}
          title="Add Academic Department"
          maxWidth="md"
        >
          <form onSubmit={handleCreateDept} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mechanical & Aerospace Engineering"
                value={deptForm.name}
                onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Code *</label>
                <input
                  type="text"
                  required
                  placeholder="MAE"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Head of Dept</label>
                <input
                  type="text"
                  placeholder="Dr. John Doe"
                  value={deptForm.hod}
                  onChange={(e) => setDeptForm({ ...deptForm, hod: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={deptForm.description}
                onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowDeptModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
              >
                Create Department
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Course Modal */}
      {showCourseModal && (
        <Modal
          isOpen={showCourseModal}
          onClose={() => setShowCourseModal(false)}
          title="Add Degree Course"
          maxWidth="md"
        >
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. B.Tech Artificial Intelligence"
                value={courseForm.name}
                onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code *</label>
                <input
                  type="text"
                  required
                  placeholder="BT-AI"
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={courseForm.duration}
                  onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={courseForm.departmentId}
                onChange={(e) => setCourseForm({ ...courseForm, departmentId: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowCourseModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
              >
                Create Course
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Subject Modal */}
      {showSubjectModal && (
        <Modal
          isOpen={showSubjectModal}
          onClose={() => setShowSubjectModal(false)}
          title="Add Syllabus Subject"
          maxWidth="md"
        >
          <form onSubmit={handleCreateSubject} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Distributed Cloud Systems"
                value={subjForm.name}
                onChange={(e) => setSubjForm({ ...subjForm, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Code *</label>
                <input
                  type="text"
                  required
                  placeholder="CSE-401"
                  value={subjForm.code}
                  onChange={(e) => setSubjForm({ ...subjForm, code: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Credits</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={subjForm.credits}
                  onChange={(e) => setSubjForm({ ...subjForm, credits: parseInt(e.target.value, 10) || 3 })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course</label>
                <select
                  value={subjForm.courseId}
                  onChange={(e) => setSubjForm({ ...subjForm, courseId: parseInt(e.target.value, 10) })}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                <select
                  value={subjForm.semester}
                  onChange={(e) => setSubjForm({ ...subjForm, semester: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Teacher</label>
              <select
                value={subjForm.teacherId}
                onChange={(e) => setSubjForm({ ...subjForm, teacherId: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowSubjectModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
              >
                Create Subject
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
