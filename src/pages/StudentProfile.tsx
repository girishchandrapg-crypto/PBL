import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Student, MarkRecord, FeeRecord, AttendanceRecord, TimetableSlot } from '../types/index.ts';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  GraduationCap,
  Award,
  CreditCard,
  CalendarCheck,
  Clock,
  Printer,
  Download,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Shield,
} from 'lucide-react';

interface StudentProfileProps {
  studentId: number;
  onBack: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ studentId, onBack }) => {
  const [student, setStudent] = useState<any>(null);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'attendance' | 'marks' | 'fees' | 'timetable'>('personal');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentDetails();
  }, [studentId]);

  const loadStudentDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentById(studentId);
      setStudent(data);

      if (data?.courseId && data?.semester) {
        const slots = await api.getTimetables({
          courseId: data.courseId,
          semester: data.semester,
        });
        setTimetable(slots);
      }
    } catch (err) {
      console.error('Failed to load student profile', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !student) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-24"></div>
        <div className="h-44 bg-slate-200 rounded-2xl"></div>
        <div className="h-80 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  const attendancePercent = student.attendanceStats?.percentage ?? 100;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Back & Print Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students Directory
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Student Dossier
          </button>
        </div>
      </div>

      {/* Main Profile Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 relative"></div>
        <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white p-1 shadow-lg ring-4 ring-white flex-shrink-0">
              {student.profilePhoto ? (
                <img src={student.profilePhoto} alt={student.firstName} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-2xl">
                  {student.firstName[0]}
                </div>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {student.firstName} {student.lastName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {student.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Student ID: <span className="font-semibold text-slate-700">{student.studentId}</span> • Roll: <span className="font-semibold text-slate-700">{student.rollNumber}</span>
              </p>
              <p className="text-xs text-indigo-600 font-medium mt-0.5">
                {student.courseName} • Year {student.year} (Semester {student.semester}) • Sec {student.section}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 text-center">
            <div>
              <div className="text-[11px] font-medium text-slate-500">Attendance</div>
              <div className={`text-xl font-extrabold ${attendancePercent >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {attendancePercent}%
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Graded Courses</div>
              <div className="text-xl font-extrabold text-indigo-600">
                {student.marks?.length || 0}
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Fee Standing</div>
              <div className="text-xl font-extrabold text-slate-900">
                {student.fees?.[0]?.status === 'Paid' ? (
                  <span className="text-emerald-600">Cleared</span>
                ) : (
                  <span className="text-amber-600">Due</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-t border-slate-100 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'personal', label: 'Personal Information', icon: User },
            { id: 'academic', label: 'Academic Standing', icon: GraduationCap },
            { id: 'attendance', label: `Attendance (${student.attendance?.length || 0})`, icon: CalendarCheck },
            { id: 'marks', label: `Grades & Marks (${student.marks?.length || 0})`, icon: Award },
            { id: 'fees', label: 'Fees & Invoices', icon: CreditCard },
            { id: 'timetable', label: 'Class Timetable', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3.5 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Personal Information */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" /> Bio & Contact Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Full Name</span>
                <span className="font-semibold text-slate-800">{student.firstName} {student.lastName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Date of Birth</span>
                <span className="font-semibold text-slate-800">{student.dateOfBirth}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Gender</span>
                <span className="font-semibold text-slate-800 capitalize">{student.gender}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Email Address</span>
                <span className="font-semibold text-slate-800">{student.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Phone Number</span>
                <span className="font-semibold text-slate-800">{student.phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Residential Address</span>
                <span className="font-semibold text-slate-800 text-right">{student.address || '742 Evergreen Terrace'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">City / State / Pincode</span>
                <span className="font-semibold text-slate-800">{student.city || 'Springfield'}, {student.state || 'IL'} {student.pincode || '62704'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" /> Parent & Emergency Contacts
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Parent / Guardian Name</span>
                <span className="font-semibold text-slate-800">{student.parentName || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Parent Contact Phone</span>
                <span className="font-semibold text-slate-800">{student.parentPhone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Emergency Contact Person</span>
                <span className="font-semibold text-slate-800">{student.emergencyContact || 'Guardian on record'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Admission Date</span>
                <span className="font-semibold text-slate-800">{student.admissionDate}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Enrollment Status</span>
                <span className="font-bold text-emerald-600">{student.status} Matriculated</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Academic Information */}
      {activeTab === 'academic' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Academic Program & Department</h3>
            <p className="text-xs text-slate-500">Curriculum pathway and degree requirements</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] text-slate-500">Department</div>
              <div className="font-bold text-slate-900 mt-1">{student.departmentName || 'Computer Science & Eng'}</div>
              <div className="text-[10px] text-indigo-600 font-semibold uppercase">{student.departmentCode || 'CSE'}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] text-slate-500">Degree Course</div>
              <div className="font-bold text-slate-900 mt-1">{student.courseName || 'B.Tech CSE'}</div>
              <div className="text-[10px] text-indigo-600 font-semibold">{student.courseCode}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] text-slate-500">Cohort Year & Semester</div>
              <div className="font-bold text-slate-900 mt-1">Year {student.year} • Semester {student.semester}</div>
              <div className="text-[10px] text-slate-500">Section {student.section}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] text-slate-500">Roll Number</div>
              <div className="font-bold font-mono text-slate-900 mt-1">{student.rollNumber}</div>
              <div className="text-[10px] text-emerald-600 font-semibold">Active Enrollment</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Attendance */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Total Tracked Sessions</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {student.attendanceStats?.totalDays || 0} Classes
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Sessions Attended</span>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                {student.attendanceStats?.presentDays || 0} Present
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Cumulative Attendance Rate</span>
              <div className={`text-2xl font-extrabold mt-1 ${attendancePercent >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {attendancePercent}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Attendance Log History</h3>
              <span className="text-xs text-slate-500">Subject-wise daily marks</span>
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
                {(student.attendance || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      No attendance logs recorded for this student yet.
                    </td>
                  </tr>
                ) : (
                  student.attendance.map((att: any) => (
                    <tr key={att.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-semibold text-slate-900">{att.date}</td>
                      <td className="px-6 py-3">
                        <span className="font-semibold text-slate-800">{att.subjectCode}</span> - {att.subjectName}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            att.status === 'Present'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {att.status === 'Present' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {att.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-500">{att.remarks || 'Normal attendance'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Marks & Transcripts */}
      {activeTab === 'marks' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Academic Assessment & Grade Sheet</h3>
              <p className="text-xs text-slate-500">Continuous internal assessments, assignments, midterm, and final scores</p>
            </div>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">
              Official University Transcript
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">Subject Code & Name</th>
                <th className="px-4 py-3 text-center">Internal (20)</th>
                <th className="px-4 py-3 text-center">Assign (20)</th>
                <th className="px-4 py-3 text-center">Midterm (25)</th>
                <th className="px-4 py-3 text-center">Practical (20)</th>
                <th className="px-4 py-3 text-center">Final (15)</th>
                <th className="px-4 py-3 text-center">Total (100)</th>
                <th className="px-4 py-3 text-center">Grade</th>
                <th className="px-4 py-3 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(student.marks || []).length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-400">
                    No examination records entered for this student yet.
                  </td>
                </tr>
              ) : (
                student.marks.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      <div>{m.subjectName}</div>
                      <span className="text-[11px] font-mono text-indigo-600">{m.subjectCode}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-medium">{m.internalMarks}</td>
                    <td className="px-4 py-3 text-center font-medium">{m.assignmentMarks}</td>
                    <td className="px-4 py-3 text-center font-medium">{m.midtermMarks}</td>
                    <td className="px-4 py-3 text-center font-medium">{m.practicalMarks}</td>
                    <td className="px-4 py-3 text-center font-medium">{m.finalMarks}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900">{m.totalMarks}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {m.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Fees */}
      {activeTab === 'fees' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Fee Invoices & Payment Ledger</h3>
              <p className="text-xs text-slate-500">Tuition fees, lab fees, and payment receipts</p>
            </div>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Fee Title</th>
                <th className="px-6 py-3">Total Amount</th>
                <th className="px-6 py-3">Paid Amount</th>
                <th className="px-6 py-3">Pending</th>
                <th className="px-6 py-3">Due Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Receipt #</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(student.fees || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No fee records issued for this student yet.
                  </td>
                </tr>
              ) : (
                student.fees.map((fee: FeeRecord) => (
                  <tr key={fee.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-semibold text-slate-900">{fee.title}</td>
                    <td className="px-6 py-3 font-bold text-slate-900">${fee.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-3 font-semibold text-emerald-600">${fee.paidAmount.toLocaleString()}</td>
                    <td className="px-6 py-3 font-semibold text-amber-600">${fee.pendingAmount.toLocaleString()}</td>
                    <td className="px-6 py-3 text-slate-500">{fee.dueDate}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          fee.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : fee.status === 'Partially Paid'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-[11px] text-slate-600">
                      {fee.receiptNumber || 'Pending payment'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 6: Timetable */}
      {activeTab === 'timetable' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Enrolled Semester Timetable</h3>
            <p className="text-xs text-slate-500">Weekly class times, assigned lecture halls, and faculty</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timetable.map((slot) => (
              <div key={slot.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-indigo-300 transition-colors">
                <div className="flex items-center justify-between text-xs font-semibold text-indigo-700 mb-1">
                  <span>{slot.day}</span>
                  <span className="font-mono text-slate-500">{slot.startTime} - {slot.endTime}</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{slot.subjectName}</div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">{slot.subjectCode}</div>
                <div className="mt-2 text-xs text-slate-600 flex items-center justify-between pt-2 border-t border-slate-200/50">
                  <span>Prof. {slot.teacherName}</span>
                  <span className="font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    {slot.classroom}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
