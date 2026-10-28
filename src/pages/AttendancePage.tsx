import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Subject, Student, AttendanceRecord, Course } from '../types/index.ts';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  Save,
  Users,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { role, isAdmin, isTeacher, isStudent, user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [existingRecords, setExistingRecords] = useState<AttendanceRecord[]>([]);

  const [selectedCourseId, setSelectedCourseId] = useState<number>(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Attendance states map: studentId -> 'Present' | 'Absent' | 'Late' | 'Excused'
  const [attendanceState, setAttendanceState] = useState<Record<number, string>>({});
  const [remarksState, setRemarksState] = useState<Record<number, string>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Student portal attendance records
  const [studentRecords, setStudentRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    if (isStudent && user?.studentProfile?.id) {
      loadStudentAttendance(user.studentProfile.id);
    } else if (selectedSubjectId) {
      loadCohortAttendance();
    }
  }, [selectedSubjectId, selectedCourseId, selectedDate, isStudent, user]);

  const loadMetadata = async () => {
    try {
      setLoading(true);
      const [courseList, subjectList] = await Promise.all([
        api.getCourses(),
        api.getSubjects(),
      ]);
      setCourses(courseList);
      setSubjects(subjectList);
      if (courseList.length > 0) setSelectedCourseId(courseList[0].id);
      if (subjectList.length > 0) setSelectedSubjectId(subjectList[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentAttendance = async (studentId: number) => {
    try {
      setLoading(true);
      const records = await api.getAttendance({ studentId });
      setStudentRecords(records);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadCohortAttendance = async () => {
    try {
      setLoading(true);
      const [studentList, records] = await Promise.all([
        api.getStudents({ courseId: selectedCourseId, limit: 50 }),
        api.getAttendance({ subjectId: selectedSubjectId, date: selectedDate }),
      ]);

      setStudents(studentList.students);
      setExistingRecords(records);

      // Pre-fill attendance states
      const stateMap: Record<number, string> = {};
      const remMap: Record<number, string> = {};

      studentList.students.forEach((s) => {
        const found = records.find((r) => r.studentId === s.id);
        stateMap[s.id] = found ? found.status : 'Present';
        remMap[s.id] = found?.remarks || '';
      });

      setAttendanceState(stateMap);
      setRemarksState(remMap);
    } catch (err) {
      console.error('Failed to load cohort attendance', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAll = (status: 'Present' | 'Absent') => {
    const updated: Record<number, string> = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceState(updated);
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);

      const recordsToSave = students.map((s) => ({
        studentId: s.id,
        subjectId: selectedSubjectId,
        date: selectedDate,
        status: attendanceState[s.id] || 'Present',
        remarks: remarksState[s.id] || '',
      }));

      await api.recordAttendance(recordsToSave);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await loadCohortAttendance();
    } catch (err) {
      console.error('Failed to save attendance', err);
    } finally {
      setSaving(false);
    }
  };

  // Student Portal View
  if (isStudent) {
    const totalSessions = studentRecords.length;
    const presentCount = studentRecords.filter((r) => r.status === 'Present').length;
    const percentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

    return (
      <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">My Attendance Record</h1>
            <p className="text-xs text-slate-500 mt-1">Track your mandatory 75% attendance threshold per course.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <span className="text-[11px] text-slate-500">Total Classes</span>
              <div className="text-xl font-bold text-slate-900">{totalSessions}</div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="text-center">
              <span className="text-[11px] text-slate-500">Attended</span>
              <div className="text-xl font-bold text-emerald-600">{presentCount}</div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="text-center">
              <span className="text-[11px] text-slate-500">Rate</span>
              <div className={`text-xl font-extrabold ${percentage >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {percentage}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Attendance Log History</h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {studentRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    No attendance records logged yet.
                  </td>
                </tr>
              ) : (
                studentRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-semibold text-slate-900">{rec.date}</td>
                    <td className="px-6 py-3 font-medium text-slate-800">{rec.subjectName || rec.subjectCode}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          rec.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {rec.status === 'Present' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500">{rec.remarks || 'Regular class'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Teacher / Admin Registry View
  const totalStudentsInClass = students.length;
  const presentCount = Object.values(attendanceState).filter((v) => v === 'Present').length;
  const absentCount = Object.values(attendanceState).filter((v) => v === 'Absent').length;
  const sessionPercentage = totalStudentsInClass > 0 ? Math.round((presentCount / totalStudentsInClass) * 100) : 0;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Save Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Class Attendance Registry</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Mark daily attendance for enrolled cohorts with instant Cloud SQL persistence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> Attendance Saved!
            </span>
          )}
          <button
            onClick={handleSaveAttendance}
            disabled={saving || students.length === 0}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Filter Row: Course, Subject, Date */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course Program</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white"
            >
              {subjects
                .filter((s) => s.courseId === selectedCourseId)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Session Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white"
            />
          </div>
        </div>

        {/* Quick Batch Actions & Session Summary Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Quick Mark:</span>
            <button
              onClick={() => handleMarkAll('Present')}
              className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors"
            >
              All Present
            </button>
            <button
              onClick={() => handleMarkAll('Absent')}
              className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold rounded-lg border border-red-200 transition-colors"
            >
              All Absent
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <span>
              Total: <strong className="text-slate-900">{totalStudentsInClass}</strong>
            </span>
            <span>
              Present: <strong className="text-emerald-600">{presentCount}</strong>
            </span>
            <span>
              Absent: <strong className="text-red-600">{absentCount}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
              {sessionPercentage}% Attendance Rate
            </span>
          </div>
        </div>
      </div>

      {/* Attendance Sheet Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No students enrolled in this course program.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Roll No</th>
                  <th className="px-4 py-3.5">Student Name</th>
                  <th className="px-4 py-3.5">Student ID</th>
                  <th className="px-4 py-3.5 text-center">Attendance Status</th>
                  <th className="px-4 py-3.5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((student) => {
                  const currentStatus = attendanceState[student.id] || 'Present';
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        {student.rollNumber}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px]">
                            {student.firstName[0]}
                          </div>
                          <span>
                            {student.firstName} {student.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-500">{student.studentId}</td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl gap-1">
                          {(['Present', 'Absent', 'Late', 'Excused'] as const).map((status) => {
                            const isSelected = currentStatus === status;
                            return (
                              <button
                                key={status}
                                onClick={() =>
                                  setAttendanceState((prev) => ({ ...prev, [student.id]: status }))
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                  isSelected
                                    ? status === 'Present'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : status === 'Absent'
                                      ? 'bg-red-600 text-white shadow-xs'
                                      : 'bg-amber-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-white'
                                }`}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <input
                          type="text"
                          placeholder="Optional notes..."
                          value={remarksState[student.id] || ''}
                          onChange={(e) =>
                            setRemarksState((prev) => ({ ...prev, [student.id]: e.target.value }))
                          }
                          className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg w-full max-w-xs focus:bg-white"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
