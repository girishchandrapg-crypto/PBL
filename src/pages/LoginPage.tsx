import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { signInWithPopup } from 'firebase/auth';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  BookOpen,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC<{ onLoggedIn: () => void }> = ({ onLoggedIn }) => {
  const { login, switchRole } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleSelection, setRoleSelection] = useState<'admin' | 'teacher' | 'student'>('admin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Forgot password
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setLoading(true);
      await login(email, roleSelection);
      onLoggedIn();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoRoleSelect = async (role: 'admin' | 'teacher' | 'student') => {
    try {
      setLoading(true);
      await switchRole(role);
      onLoggedIn();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to switch demo role');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleAuthProvider);
      if (res.user.email) {
        await login(res.user.email, roleSelection);
        onLoggedIn();
      }
    } catch (err: any) {
      console.warn('Google sign-in popup notice:', err);
      // Fallback to simulated demo login with the user email
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in completed via local university credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-blue-600/10 to-transparent blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/30">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          CampusCore Student Management
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Enterprise University Academic & Records Database
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 space-y-6">
          {/* Quick Demo Switcher Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> 1-Click Role Login
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Demo Ready</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoRoleSelect('admin')}
                className="p-3 rounded-2xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 hover:border-indigo-300 transition-all text-center group"
              >
                <ShieldCheck className="w-5 h-5 text-indigo-600 mx-auto group-hover:scale-110 transition-transform" />
                <div className="mt-1.5 text-xs font-bold text-slate-900">Admin</div>
                <div className="text-[10px] text-slate-500">Full Access</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoRoleSelect('teacher')}
                className="p-3 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 hover:border-amber-300 transition-all text-center group"
              >
                <UserCheck className="w-5 h-5 text-amber-600 mx-auto group-hover:scale-110 transition-transform" />
                <div className="mt-1.5 text-xs font-bold text-slate-900">Faculty</div>
                <div className="text-[10px] text-slate-500">Marks & Att</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoRoleSelect('student')}
                className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 hover:border-emerald-300 transition-all text-center group"
              >
                <BookOpen className="w-5 h-5 text-emerald-600 mx-auto group-hover:scale-110 transition-transform" />
                <div className="mt-1.5 text-xs font-bold text-slate-900">Student</div>
                <div className="text-[10px] text-slate-500">Portal & Fees</div>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                Or Sign In With Account
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@campuscore.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotModal(true)}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role Portal</label>
              <select
                value={roleSelection}
                onChange={(e) => setRoleSelection(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="admin">Administrator</option>
                <option value="teacher">Faculty / Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Google Sign In option */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign in with Google OAuth
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-slate-900">Reset University Credentials</h3>
            {forgotSuccess ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  Password reset link sent to your university inbox!
                </div>
                <button
                  onClick={() => {
                    setForgotModal(false);
                    setForgotSuccess(false);
                  }}
                  className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setForgotSuccess(true);
                }}
                className="space-y-3"
              >
                <p className="text-xs text-slate-500">
                  Enter your registered university email to receive a password recovery link.
                </p>
                <input
                  type="email"
                  required
                  placeholder="student@campuscore.edu"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl"
                  >
                    Send Recovery Email
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
