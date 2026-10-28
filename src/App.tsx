import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { StudentsList } from './pages/StudentsList.tsx';
import { StudentProfile } from './pages/StudentProfile.tsx';
import { AdmissionPage } from './pages/AdmissionPage.tsx';
import { AttendancePage } from './pages/AttendancePage.tsx';
import { MarksPage } from './pages/MarksPage.tsx';
import { FeesPage } from './pages/FeesPage.tsx';
import { TimetablePage } from './pages/TimetablePage.tsx';
import { AssignmentsPage } from './pages/AssignmentsPage.tsx';
import { AnnouncementsPage } from './pages/AnnouncementsPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { TeachersList } from './pages/TeachersList.tsx';
import { AcademicsPage } from './pages/AcademicsPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';

function MainApp() {
  const { user, isLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center animate-bounce shadow-lg shadow-indigo-600/40">
          <span className="font-extrabold text-xl">C</span>
        </div>
        <p className="text-xs text-slate-400 font-medium tracking-wider uppercase animate-pulse">
          Connecting to Cloud SQL & Initializing CampusCore...
        </p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoggedIn={() => setCurrentTab('dashboard')} />;
  }

  const handleSelectStudent = (id: number) => {
    setSelectedStudentId(id);
    setCurrentTab('profile');
  };

  const handleNavigate = (tab: string, extra?: any) => {
    if (tab === 'students' && extra?.viewStudentId) {
      handleSelectStudent(extra.viewStudentId);
      return;
    }
    setCurrentTab(tab);
    if (tab !== 'profile') setSelectedStudentId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'profile') setSelectedStudentId(null);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onSearch={(query) => {
            setSearchQuery(query);
            if (query && currentTab !== 'students') {
              setCurrentTab('students');
            }
          }}
          announcementCount={4}
        />

        <main className="flex-1 pb-16">
          {currentTab === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}

          {currentTab === 'students' && (
            <StudentsList
              onSelectStudent={handleSelectStudent}
              onOpenAdmission={() => setCurrentTab('admissions')}
              externalSearch={searchQuery}
            />
          )}

          {currentTab === 'profile' && selectedStudentId && (
            <StudentProfile
              studentId={selectedStudentId}
              onBack={() => setCurrentTab('students')}
            />
          )}

          {currentTab === 'admissions' && (
            <AdmissionPage
              onSuccess={(newId) => {
                setSelectedStudentId(newId);
                setCurrentTab('profile');
              }}
              onCancel={() => setCurrentTab('students')}
            />
          )}

          {currentTab === 'attendance' && <AttendancePage />}

          {currentTab === 'marks' && <MarksPage />}

          {currentTab === 'fees' && <FeesPage />}

          {currentTab === 'timetable' && <TimetablePage />}

          {currentTab === 'assignments' && <AssignmentsPage />}

          {currentTab === 'announcements' && <AnnouncementsPage />}

          {currentTab === 'reports' && <ReportsPage />}

          {currentTab === 'teachers' && <TeachersList />}

          {currentTab === 'academics' && <AcademicsPage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
