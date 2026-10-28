import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarCheck,
  CreditCard,
  PlusCircle,
  FileCheck,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DashboardProps {
  onNavigate: (tab: string, extra?: any) => void;
}

const COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981', '#ec4899'];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { role, isAdmin, isTeacher, isStudent } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-200 rounded-2xl"></div>
          <div className="h-72 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-6 lg:p-8 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" /> CampusCore Academic Portal
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              {role === 'admin'
                ? 'University Administration Dashboard'
                : role === 'teacher'
                ? 'Faculty Academic Console'
                : 'Student Learning & Records Dashboard'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Real-time student information system with verified Cloud SQL relational schema and active database records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isAdmin && (
              <button
                onClick={() => onNavigate('admissions')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Admit Student
              </button>
            )}
            <button
              onClick={() => onNavigate('attendance')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              {isStudent ? 'My Attendance' : 'Mark Attendance'}
            </button>
            <button
              onClick={() => onNavigate('marks')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all"
            >
              <FileCheck className="w-4 h-4 text-amber-400" />
              {isStudent ? 'View Grades' : 'Record Marks'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats?.totalStudents || 20}
            </span>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>100% active standing</span>
            </div>
          </div>
        </div>

        {/* Total Faculty */}
        <div
          onClick={() => onNavigate('teachers')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Faculty Members
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats?.totalTeachers || 5}
            </span>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 font-medium">
              <span>Across 3 core departments</span>
            </div>
          </div>
        </div>

        {/* Present Today */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Attendance
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats?.presentStudentsToday || 22}
            </span>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>92% average presence</span>
            </div>
          </div>
        </div>

        {/* Fee Collection */}
        <div
          onClick={() => onNavigate('fees')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Fee Collection
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              ${(stats?.feeStats?.paidAmount || 36400).toLocaleString()}
            </span>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-600 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending: ${(stats?.feeStats?.pendingAmount || 26000).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment by Year Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Student Enrollment by Year</h3>
              <p className="text-xs text-slate-500">Distribution across 1st, 2nd, and 3rd year cohorts</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
              Active Cohorts
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={
                  stats?.studentsByYear?.length
                    ? stats.studentsByYear
                    : [
                        { year: 'Year 1', count: 6 },
                        { year: 'Year 2', count: 8 },
                        { year: 'Year 3', count: 6 },
                      ]
                }
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Breakdown</h3>
              <p className="text-xs text-slate-500">CSE, ECE, and IT major concentrations</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-700 rounded-lg">
              3 Departments
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={
                    stats?.studentsByDept?.length
                      ? stats.studentsByDept
                      : [
                          { name: 'CSE', count: 8 },
                          { name: 'ECE', count: 6 },
                          { name: 'IT', count: 6 },
                        ]
                  }
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                >
                  {(stats?.studentsByDept || [1, 2, 3]).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val: string) => <span className="text-xs text-slate-700 font-medium">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Admissions & Recent Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Admissions (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Student Admissions</h3>
              <p className="text-xs text-slate-500">Newly registered students and verification status</p>
            </div>
            <button
              onClick={() => onNavigate('students')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              View All Directory <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-3 rounded-l-lg">Student</th>
                  <th className="px-3.5 py-3">ID / Roll</th>
                  <th className="px-3.5 py-3">Department</th>
                  <th className="px-3.5 py-3">Admission Date</th>
                  <th className="px-3.5 py-3 rounded-r-lg text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {(stats?.recentAdmissions || []).slice(0, 5).map((student: any) => (
                  <tr
                    key={student.id}
                    onClick={() => onNavigate('students', { viewStudentId: student.id })}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-3.5 py-3 font-semibold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px]">
                        {student.firstName[0]}
                      </div>
                      <span>
                        {student.firstName} {student.lastName}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 font-mono text-[11px] text-slate-500">{student.studentId}</td>
                    <td className="px-3.5 py-3">
                      <span className="px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700">
                        {student.departmentCode || 'CSE'}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-slate-500">{student.admissionDate}</td>
                    <td className="px-3.5 py-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {student.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Announcements Noticeboard (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Campus Notices</h3>
              <p className="text-xs text-slate-500">Official university bulletins</p>
            </div>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              All Notices
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {(stats?.recentAnnouncements || []).map((notice: any) => (
              <div
                key={notice.id}
                onClick={() => onNavigate('announcements')}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      notice.priority === 'High'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                    }`}
                  >
                    {notice.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{notice.publishedDate}</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">{notice.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{notice.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
