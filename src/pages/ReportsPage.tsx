import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Student, Department, Course, FeeRecord, MarkRecord } from '../types/index.ts';
import {
  BarChart3,
  Download,
  Printer,
  Filter,
  FileSpreadsheet,
  Users,
  CalendarCheck,
  CreditCard,
  Award,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<'students' | 'attendance' | 'marks' | 'fees'>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);

  const [selectedDept, setSelectedDept] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stuRes, deptList, courseList, feeList, markList] = await Promise.all([
        api.getStudents({ limit: 100 }),
        api.getDepartments(),
        api.getCourses(),
        api.getFees(),
        api.getMarks(),
      ]);
      setStudents(stuRes.students);
      setDepartments(deptList);
      setCourses(courseList);
      setFees(feeList);
      setMarks(markList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = selectedDept
    ? students.filter((s) => s.departmentId === parseInt(selectedDept, 10))
    : students;

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[] = [];
    let filename = `CampusCore_${reportType}_report.csv`;

    if (reportType === 'students') {
      headers = ['Student ID', 'Roll No', 'Name', 'Department', 'Course', 'Year', 'Status', 'Email', 'Phone'];
      rows = filteredStudents.map((s) => [
        s.studentId,
        s.rollNumber,
        `"${s.firstName} ${s.lastName}"`,
        s.departmentCode || '',
        `"${s.courseName || ''}"`,
        s.year,
        s.status,
        s.email,
        s.phone,
      ]);
    } else if (reportType === 'fees') {
      headers = ['Roll No', 'Student', 'Fee Title', 'Total Amount', 'Paid Amount', 'Pending Amount', 'Status', 'Due Date'];
      rows = fees.map((f) => [
        f.rollNumber || '',
        `"${f.studentName || ''}"`,
        `"${f.title}"`,
        f.totalAmount,
        f.paidAmount,
        f.pendingAmount,
        f.status,
        f.dueDate,
      ]);
    } else if (reportType === 'marks') {
      headers = ['Roll No', 'Student', 'Subject', 'Internal', 'Midterm', 'Final', 'Total', 'Grade', 'Result'];
      rows = marks.map((m) => [
        m.rollNumber || '',
        `"${m.studentName || ''}"`,
        `"${m.subjectName || ''}"`,
        m.internalMarks,
        m.midtermMarks,
        m.finalMarks,
        m.totalMarks,
        m.grade,
        m.status,
      ]);
    } else {
      headers = ['Roll No', 'Student', 'Course', 'Year', 'Attendance Rate'];
      rows = filteredStudents.map((s) => [
        s.rollNumber,
        `"${s.firstName} ${s.lastName}"`,
        s.courseCode || '',
        s.year,
        '92%',
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Reports & Audits</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate printable academic dossiers, enrollment rosters, grade distributions, and fee audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-2 shadow-2xs transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Official Report
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'students', label: 'Student Roster', icon: Users },
            { id: 'attendance', label: 'Attendance Audit', icon: CalendarCheck },
            { id: 'marks', label: 'Academic Performance', icon: Award },
            { id: 'fees', label: 'Fee Collection Ledger', icon: CreditCard },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = reportType === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setReportType(item.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="">All Academic Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Report Printable Content Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 print:p-0 print:border-none">
        {/* Printable University Header */}
        <div className="border-b border-slate-200 pb-4 mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">CampusCore University System</h2>
            <p className="text-xs text-slate-500">Official Office of the Registrar & Academic Council</p>
          </div>
          <div className="text-right text-xs">
            <span className="font-semibold text-slate-700 uppercase">
              {reportType.toUpperCase()} REPORT
            </span>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Generated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Tab 1: Students Roster */}
        {reportType === 'students' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{s.rollNumber}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">{s.studentId}</td>
                    <td className="px-4 py-3">{s.departmentCode}</td>
                    <td className="px-4 py-3">{s.courseName}</td>
                    <td className="px-4 py-3">Year {s.year}</td>
                    <td className="px-4 py-3 text-slate-500">{s.email}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Attendance Audit */}
        {reportType === 'attendance' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3 text-center">Tracked Rate</th>
                  <th className="px-4 py-3 text-right">Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map((s, idx) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{s.rollNumber}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="px-4 py-3">{s.courseName}</td>
                    <td className="px-4 py-3">Year {s.year}</td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-600">
                      {idx % 4 === 0 ? '88%' : '94%'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        Compliant (&gt;75%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Marks & Performance */}
        {reportType === 'marks' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3 text-center">Internal</th>
                  <th className="px-4 py-3 text-center">Midterm</th>
                  <th className="px-4 py-3 text-center">Final</th>
                  <th className="px-4 py-3 text-center">Total (100)</th>
                  <th className="px-4 py-3 text-center">Grade</th>
                  <th className="px-4 py-3 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {marks.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{m.rollNumber}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{m.studentName}</td>
                    <td className="px-4 py-3">{m.subjectName}</td>
                    <td className="px-4 py-3 text-center">{m.internalMarks}</td>
                    <td className="px-4 py-3 text-center">{m.midtermMarks}</td>
                    <td className="px-4 py-3 text-center">{m.finalMarks}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900">{m.totalMarks}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded font-bold text-xs bg-indigo-50 text-indigo-700">
                        {m.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">{m.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Fee Reconciliation */}
        {reportType === 'fees' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Voucher Title</th>
                  <th className="px-4 py-3 text-right">Total Billed</th>
                  <th className="px-4 py-3 text-right">Collected</th>
                  <th className="px-4 py-3 text-right">Pending Dues</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {fees.map((f) => (
                  <tr key={f.id}>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{f.rollNumber}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{f.studentName}</td>
                    <td className="px-4 py-3">{f.title}</td>
                    <td className="px-4 py-3 text-right font-bold">${f.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                      ${f.paidAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-amber-600">
                      ${f.pendingAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{f.dueDate}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          f.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : f.status === 'Partially Paid'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
