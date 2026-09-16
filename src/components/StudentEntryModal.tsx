import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  Shield,
  BookOpen,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { StudentProfile, UserRole } from '../types';
import { api } from '../services/api';

interface StudentEntryModalProps {
  isOpen: boolean;
  initialStudent?: StudentProfile | null;
  onRegister?: (student: StudentProfile) => void;
  onSubmit?: (name: string) => void;
  onClose?: () => void;
}

export const StudentEntryModal: React.FC<StudentEntryModalProps> = ({
  isOpen,
  initialStudent,
  onRegister,
  onSubmit,
  onClose
}) => {
  // Modal mode: 'LOGIN' or 'SIGNUP'
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  // Role: 'STUDENT' or 'INSTRUCTOR'
  const [role, setRole] = useState<UserRole>('STUDENT');

  // Student Sign Up Fields
  const [studentName, setStudentName] = useState('');
  const [studentTupId, setStudentTupId] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Instructor Sign Up Fields
  const [instructorName, setInstructorName] = useState('');
  const [instructorDept, setInstructorDept] = useState('');
  const [instructorPassword, setInstructorPassword] = useState('');

  // Log In Fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialStudent) {
      if (initialStudent.role === 'INSTRUCTOR') {
        setRole('INSTRUCTOR');
        setInstructorName(initialStudent.name || '');
        setInstructorDept(initialStudent.department || initialStudent.year_section || '');
      } else {
        setRole('STUDENT');
        setStudentName(initialStudent.name || '');
        setStudentTupId(initialStudent.tup_id || initialStudent.student_id || '');
      }
    }
  }, [initialStudent]);

  if (!isOpen) return null;

  const handleModeChange = (newMode: 'LOGIN' | 'SIGNUP') => {
    setMode(newMode);
    setError('');
    setSuccessMessage('');
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setError('');
    setSuccessMessage('');
  };

  const handleStudentSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = studentName.trim();
    const cleanTupId = studentTupId.trim().toUpperCase();
    const cleanPass = studentPassword.trim();

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }
    if (!cleanTupId) {
      setError('Please enter your TUP ID (e.g., TUPM-21-1234).');
      return;
    }
    if (!cleanPass) {
      setError('Please create a password for your account.');
      return;
    }
    if (cleanPass.length < 4) {
      setError('Password should be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userProfile = await api.registerUser({
        role: 'STUDENT',
        name: cleanName,
        tup_id: cleanTupId,
        password: cleanPass
      });

      setSuccessMessage(`Account created successfully! Welcome, ${cleanName}.`);
      await api.logAction(
        userProfile.student_id,
        'sess_initial',
        `Student signed up: ${userProfile.name} (${cleanTupId})`
      );

      setTimeout(() => {
        if (onRegister) onRegister(userProfile);
        else if (onSubmit) onSubmit(cleanName);
        if (onClose) onClose();
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstructorSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = instructorName.trim();
    const cleanDept = instructorDept.trim();
    const cleanPass = instructorPassword.trim();

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }
    if (!cleanDept) {
      setError('Please enter your department (e.g., College of Industrial Technology).');
      return;
    }
    if (!cleanPass) {
      setError('Please create a password for your account.');
      return;
    }
    if (cleanPass.length < 4) {
      setError('Password should be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userProfile = await api.registerUser({
        role: 'INSTRUCTOR',
        name: cleanName,
        department: cleanDept,
        password: cleanPass
      });

      setSuccessMessage(`Instructor account created successfully! Welcome, ${cleanName}.`);
      await api.logAction(
        userProfile.student_id,
        'sess_initial',
        `Instructor signed up: ${userProfile.name} (${cleanDept})`
      );

      setTimeout(() => {
        if (onRegister) onRegister(userProfile);
        else if (onSubmit) onSubmit(cleanName);
        if (onClose) onClose();
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanIdentifier = loginIdentifier.trim();
    const cleanPass = loginPassword.trim();

    if (!cleanIdentifier) {
      setError(
        role === 'STUDENT'
          ? 'Please enter your TUP ID or Name.'
          : 'Please enter your Instructor Name or Department.'
      );
      return;
    }
    if (!cleanPass) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userProfile = await api.loginUser({
        role,
        identifier: cleanIdentifier,
        password: cleanPass
      });

      setSuccessMessage(`Logged in successfully as ${userProfile.name}!`);
      await api.logAction(
        userProfile.student_id,
        'sess_initial',
        `${role === 'INSTRUCTOR' ? 'Instructor' : 'Student'} logged in: ${userProfile.name}`
      );

      setTimeout(() => {
        if (onRegister) onRegister(userProfile);
        else if (onSubmit) onSubmit(userProfile.name);
        if (onClose) onClose();
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    api.clearSavedStudent();
    if (onRegister) {
      onRegister({
        student_id: '',
        name: '',
        year_section: '',
        created_at: ''
      });
    }
    setLoginIdentifier('');
    setLoginPassword('');
    setStudentName('');
    setStudentTupId('');
    setStudentPassword('');
    setInstructorName('');
    setInstructorDept('');
    setInstructorPassword('');
    setError('');
    setSuccessMessage('Logged out successfully.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 relative flex flex-col max-h-[92vh]">
        
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            aria-label="Close portal"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Portal Header */}
        <div className="bg-linear-to-br from-slate-900 via-blue-950 to-indigo-950 text-white px-6 pt-6 pb-5 text-center relative shrink-0">
          <div className="w-12 h-12 mx-auto mb-2.5 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">CSSENTIAL PORTAL</h2>
          <p className="text-xs text-blue-200 mt-1 max-w-sm mx-auto">
            Computer System Installation &amp; Configuration Platform
          </p>

          {/* Mode Switcher: Log In vs Sign Up */}
          <div className="mt-4 flex items-center p-1 bg-white/10 rounded-xl max-w-xs mx-auto backdrop-blur-xs border border-white/15">
            <button
              type="button"
              id="auth-tab-login"
              onClick={() => handleModeChange('LOGIN')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'LOGIN'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              id="auth-tab-signup"
              onClick={() => handleModeChange('SIGNUP')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'SIGNUP'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Active Session Notice if already logged in */}
        {initialStudent && initialStudent.name && (
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2 truncate mr-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="truncate">
                Currently logged in as <strong className="text-slate-900 font-bold">{initialStudent.name}</strong> ({initialStudent.role === 'INSTRUCTOR' ? 'Instructor' : initialStudent.tup_id || 'Student'})
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer shrink-0"
              title="Log out from this account"
            >
              <LogOut className="w-3 h-3" />
              <span>Log Out</span>
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                id="role-select-student"
                onClick={() => handleRoleChange('STUDENT')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 text-xs font-black transition-all cursor-pointer ${
                  role === 'STUDENT'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                <GraduationCap className={`w-4 h-4 ${role === 'STUDENT' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span>Student</span>
              </button>

              <button
                type="button"
                id="role-select-instructor"
                onClick={() => handleRoleChange('INSTRUCTOR')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 text-xs font-black transition-all cursor-pointer ${
                  role === 'INSTRUCTOR'
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-xs'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                <Briefcase className={`w-4 h-4 ${role === 'INSTRUCTOR' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span>Instructor</span>
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-700 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* FORM: SIGN UP MODE */}
          {mode === 'SIGNUP' && (
            <>
              {role === 'STUDENT' ? (
                // STUDENT SIGN UP: Name, TUP ID (TUPM-**-****), Password
                <form onSubmit={handleStudentSignUp} className="space-y-3.5">
                  <div className="space-y-1">
                    <label htmlFor="student-signup-name" className="block text-xs font-black uppercase tracking-wider text-gray-700">
                      Student Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="student-signup-name"
                        type="text"
                        autoFocus
                        value={studentName}
                        onChange={(e) => {
                          setStudentName(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="e.g., Juan Dela Cruz"
                        className="w-full pl-3.5 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all text-gray-900 placeholder:text-gray-400 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="student-signup-tupid" className="block text-xs font-black uppercase tracking-wider text-gray-700">
                        TUP ID <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] font-semibold text-blue-600">Format: TUPM-**-****</span>
                    </div>
                    <input
                      id="student-signup-tupid"
                      type="text"
                      value={studentTupId}
                      onChange={(e) => {
                        setStudentTupId(e.target.value.toUpperCase());
                        if (error) setError('');
                      }}
                      placeholder="e.g., TUPM-21-1234"
                      className="w-full px-3.5 py-2.5 text-sm uppercase tracking-wider font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all text-gray-900 placeholder:text-gray-400 font-bold"
                    />
                    <p className="text-[11px] text-gray-500">
                      Your official Technological University of the Philippines ID (e.g., TUPM-21-1234).
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="student-signup-password" className="block text-xs font-black uppercase tracking-wider text-gray-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="student-signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={studentPassword}
                        onChange={(e) => {
                          setStudentPassword(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="Create a secure password"
                        className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all text-gray-900 placeholder:text-gray-400 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      id="student-signup-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-black text-sm rounded-xl shadow-xs transition-all cursor-pointer active:scale-98"
                    >
                      <User className="w-4 h-4" />
                      <span>{isSubmitting ? 'CREATING ACCOUNT...' : 'Sign Up as Student'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                // INSTRUCTOR SIGN UP: Name, Department, Password
                <form onSubmit={handleInstructorSignUp} className="space-y-3.5">
                  <div className="space-y-1">
                    <label htmlFor="instructor-signup-name" className="block text-xs font-black uppercase tracking-wider text-gray-700">
                      Instructor Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="instructor-signup-name"
                      type="text"
                      autoFocus
                      value={instructorName}
                      onChange={(e) => {
                        setInstructorName(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="e.g., Prof. Maria Santos"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-hidden transition-all text-gray-900 placeholder:text-gray-400 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="instructor-signup-dept" className="block text-xs font-black uppercase tracking-wider text-gray-700">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="instructor-signup-dept"
                      type="text"
                      value={instructorDept}
                      onChange={(e) => {
                        setInstructorDept(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="e.g., College of Industrial Technology / Computer Engineering"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-hidden transition-all text-gray-900 placeholder:text-gray-400 font-medium"
                    />
                    <p className="text-[11px] text-gray-500">
                      Enter your college, academic department, or faculty unit.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="instructor-signup-password" className="block text-xs font-black uppercase tracking-wider text-gray-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="instructor-signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={instructorPassword}
                        onChange={(e) => {
                          setInstructorPassword(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="Create instructor password"
                        className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-hidden transition-all text-gray-900 placeholder:text-gray-400 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      id="instructor-signup-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-700 hover:bg-indigo-800 text-white font-black text-sm rounded-xl shadow-xs transition-all cursor-pointer active:scale-98"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>{isSubmitting ? 'CREATING INSTRUCTOR ACCOUNT...' : 'Sign Up as Instructor'}</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* FORM: LOG IN MODE */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="space-y-1">
                <label htmlFor="login-identifier-input" className="block text-xs font-black uppercase tracking-wider text-gray-700">
                  {role === 'STUDENT' ? 'TUP ID or Student Name' : 'Instructor Name or Department'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="login-identifier-input"
                  type="text"
                  autoFocus
                  value={loginIdentifier}
                  onChange={(e) => {
                    setLoginIdentifier(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder={
                    role === 'STUDENT'
                      ? 'e.g., TUPM-21-1234 or Juan Dela Cruz'
                      : 'e.g., Prof. Maria Santos'
                  }
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all text-gray-900 placeholder:text-gray-400 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="login-password-input" className="block text-xs font-black uppercase tracking-wider text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter your password"
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all text-gray-900 placeholder:text-gray-400 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 text-white font-black text-sm rounded-xl shadow-xs transition-all cursor-pointer active:scale-98 ${
                    role === 'STUDENT'
                      ? 'bg-blue-700 hover:bg-blue-800'
                      : 'bg-indigo-700 hover:bg-indigo-800'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'LOGGING IN...'
                      : role === 'STUDENT'
                      ? 'Log In as Student'
                      : 'Log In as Instructor'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Switcher link */}
          <div className="pt-2 text-center text-xs text-gray-500">
            {mode === 'LOGIN' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('SIGNUP')}
                  className="font-black text-blue-700 hover:underline cursor-pointer"
                >
                  Sign Up here
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('LOGIN')}
                  className="font-black text-blue-700 hover:underline cursor-pointer"
                >
                  Log In here
                </button>
              </p>
            )}
          </div>

          {/* Privacy & Academic Telemetry Note */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 flex items-start gap-2">
            <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-tight">
              <span className="font-bold text-slate-800">Technological University of the Philippines:</span> Authorized academic telemetry logs lab activity attempts, quiz results, and competency progress.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
