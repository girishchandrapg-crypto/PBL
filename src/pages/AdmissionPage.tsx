import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Department, Course } from '../types/index.ts';
import {
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Building,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Shield,
  Camera,
} from 'lucide-react';

interface AdmissionPageProps {
  onSuccess: (studentId: number) => void;
  onCancel: () => void;
}

export const AdmissionPage: React.FC<AdmissionPageProps> = ({ onSuccess, onCancel }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '2005-05-15',
    gender: 'Male',
    email: '',
    phone: '+1 (555) ',
    address: '100 University Boulevard',
    city: 'Springfield',
    state: 'IL',
    pincode: '62704',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    admissionDate: new Date().toISOString().split('T')[0],
    departmentId: 0,
    courseId: 0,
    year: 1,
    semester: 1,
    section: 'A',
    rollNumber: '',
    parentName: '',
    parentPhone: '+1 (555) ',
    emergencyContact: 'Mother',
    status: 'Active' as const,
  });

  useEffect(() => {
    loadMeta();
  }, []);

  const loadMeta = async () => {
    try {
      setLoadingMeta(true);
      const [deptList, courseList] = await Promise.all([
        api.getDepartments(),
        api.getCourses(),
      ]);
      setDepartments(deptList);
      setCourses(courseList);
      if (deptList.length > 0) {
        setFormData((prev) => ({
          ...prev,
          departmentId: deptList[0].id,
          courseId: courseList.find((c) => c.departmentId === deptList[0].id)?.id || courseList[0]?.id || 1,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMeta(false);
    }
  };

  useEffect(() => {
    if (formData.departmentId) {
      const filtered = courses.filter((c) => c.departmentId === formData.departmentId);
      setFilteredCourses(filtered);
      if (filtered.length > 0 && !filtered.some((c) => c.id === formData.courseId)) {
        setFormData((prev) => ({ ...prev, courseId: filtered[0].id }));
      }
    } else {
      setFilteredCourses(courses);
    }
  }, [formData.departmentId, courses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setSubmitting(true);
      const studentId = `STU-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      const rollNumber = formData.rollNumber || `CSE-24-${Math.floor(100 + Math.random() * 900)}`;

      const created = await api.createStudent({
        ...formData,
        studentId,
        rollNumber,
      });

      onSuccess(created.id);
    } catch (err: any) {
      console.error('Failed to admit student', err);
      setErrorMsg(err.message || 'Failed to submit admission record');
    } finally {
      setSubmitting(false);
    }
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel & Return
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Student Admission & Enrollment Form</h1>
              <p className="text-xs text-slate-500">
                Register a new student, assign department & degree course, and generate official credentials.
              </p>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Section 1: Personal Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
                1
              </span>
              Personal & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vance"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="liam.vance@student.campuscore.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Street Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State / Zip</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {/* Profile Photo selector */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Student Profile Photo</label>
              <div className="flex items-center gap-3">
                {sampleAvatars.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, profilePhoto: url })}
                    className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${
                      formData.profilePhoto === url
                        ? 'border-indigo-600 scale-105 shadow-md ring-2 ring-indigo-200'
                        : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="Avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Academic Program Enrollment */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
                2
              </span>
              Academic Program & Cohort Assignment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Department *</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({ ...formData, departmentId: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Degree Program / Course *</label>
                <select
                  value={formData.courseId}
                  onChange={(e) =>
                    setFormData({ ...formData, courseId: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                >
                  {filteredCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.duration})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Admission Date *</label>
                <input
                  type="date"
                  required
                  value={formData.admissionDate}
                  onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cohort Academic Year *</label>
                <select
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value={1}>Year 1 (Freshman)</option>
                  <option value={2}>Year 2 (Sophomore)</option>
                  <option value={3}>Year 3 (Junior)</option>
                  <option value={4}>Year 4 (Senior)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Semester & Section *</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Sem {s}
                      </option>
                    ))}
                  </select>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number (Optional)</label>
                <input
                  type="text"
                  placeholder="Auto-generated if blank"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Parent & Emergency Details */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
                3
              </span>
              Guardian & Emergency Contacts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  placeholder="e.g. Robert Vance"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Phone Number</label>
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Person</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Enrolling Student...' : 'Complete Admission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
