import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  GraduationCap,
  Bell,
  Search,
  ShieldCheck,
  UserCheck,
  BookOpen,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onSearch?: (query: string) => void;
  announcementCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onSearch, announcementCount = 4 }) => {
  const { user, role, switchRole, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg lg:hidden hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                CampusCore
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  SMS
                </span>
              </span>
              <p className="text-[11px] text-slate-500 hidden sm:block">University Management System</p>
            </div>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search students, roll #, courses, faculty..."
              value={searchValue}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Right: Quick Role Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher Buttons */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-medium">
            <span className="px-2 text-[11px] text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" /> Mode:
            </span>
            <button
              onClick={() => switchRole('admin')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                role === 'admin'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
            <button
              onClick={() => switchRole('teacher')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                role === 'teacher'
                  ? 'bg-amber-600 text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Faculty
            </button>
            <button
              onClick={() => switchRole('student')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                role === 'student'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Student
            </button>
          </div>

          {/* Notifications button */}
          <div className="relative">
            <button
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {announcementCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
              )}
            </button>
          </div>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 flex-shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-xs text-indigo-700 bg-indigo-50">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="hidden lg:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                  {user?.name || 'Guest User'}
                </div>
                <div className="text-[10px] font-medium capitalize text-indigo-600">
                  {role} Portal
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-slate-500 text-[11px] truncate">{user?.email}</p>
                  <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                    Role: {role}
                  </div>
                </div>

                {/* Mobile role switch within dropdown */}
                <div className="sm:hidden px-3.5 py-2 border-b border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Switch Role</p>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => { switchRole('admin'); setShowUserMenu(false); }}
                      className={`text-left px-2 py-1 rounded text-xs ${role === 'admin' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700'}`}
                    >
                      Admin Mode
                    </button>
                    <button
                      onClick={() => { switchRole('teacher'); setShowUserMenu(false); }}
                      className={`text-left px-2 py-1 rounded text-xs ${role === 'teacher' ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-700'}`}
                    >
                      Faculty Mode
                    </button>
                    <button
                      onClick={() => { switchRole('student'); setShowUserMenu(false); }}
                      className={`text-left px-2 py-1 rounded text-xs ${role === 'student' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700'}`}
                    >
                      Student Mode
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => { logout(); setShowUserMenu(false); }}
                  className="w-full px-3.5 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
