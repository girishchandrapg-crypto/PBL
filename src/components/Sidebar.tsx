import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CalendarCheck,
  Award,
  CreditCard,
  Calendar,
  FileText,
  Megaphone,
  BarChart3,
  GraduationCap,
  Building2,
  BookOpenCheck,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, isOpen, onClose }) => {
  const { role, isAdmin, isTeacher, isStudent } = useAuth();

  const handleNavClick = (tab: string) => {
    onSelectTab(tab);
    onClose();
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'teacher', 'student'],
      description: 'System overview & statistics',
    },
    {
      id: 'students',
      label: isStudent ? 'My Profile & Records' : 'Student Management',
      icon: Users,
      roles: ['admin', 'teacher', 'student'],
      badge: isStudent ? undefined : '20',
      description: 'Directory, CRUD, admission profiles',
    },
    {
      id: 'admissions',
      label: 'New Admission',
      icon: UserPlus,
      roles: ['admin'],
      description: 'Register & admit new students',
    },
    {
      id: 'attendance',
      label: isStudent ? 'My Attendance' : 'Attendance Registry',
      icon: CalendarCheck,
      roles: ['admin', 'teacher', 'student'],
      description: 'Daily & subject-wise attendance tracking',
    },
    {
      id: 'marks',
      label: isStudent ? 'My Grades & Marks' : 'Marks & Grading',
      icon: Award,
      roles: ['admin', 'teacher', 'student'],
      description: 'Assessments, grade scale, transcripts',
    },
    {
      id: 'fees',
      label: isStudent ? 'Fee Status & Payments' : 'Fee Management',
      icon: CreditCard,
      roles: ['admin', 'student'],
      description: 'Tuition fees, dues, receipts',
    },
    {
      id: 'timetable',
      label: 'Class Timetable',
      icon: Calendar,
      roles: ['admin', 'teacher', 'student'],
      description: 'Weekly schedule & classrooms',
    },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: FileText,
      roles: ['admin', 'teacher', 'student'],
      badge: '5',
      description: 'Homework, projects, submissions',
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: Megaphone,
      roles: ['admin', 'teacher', 'student'],
      badge: 'New',
      description: 'Campus circulars & notices',
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      roles: ['admin', 'teacher'],
      description: 'Student roaster, grade distributions',
    },
    {
      id: 'teachers',
      label: 'Faculty Directory',
      icon: GraduationCap,
      roles: ['admin', 'student'],
      description: 'Teaching staff & qualifications',
    },
    {
      id: 'academics',
      label: 'Courses & Departments',
      icon: Building2,
      roles: ['admin'],
      description: 'Departments, programs & syllabus',
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-slate-900 text-slate-300 z-50 flex flex-col transition-transform duration-200 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight">CampusCore</span>
              <p className="text-[10px] text-slate-400 font-medium">Student System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>

          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'New'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom role indicator box */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center font-bold text-xs text-indigo-400">
              {role.charAt(0).toUpperCase()}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-white capitalize">{role} Account</p>
              <p className="text-[10px] text-slate-400">Connected to Cloud SQL</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
