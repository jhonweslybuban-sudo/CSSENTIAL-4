import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, BookOpen, X, Sparkles } from 'lucide-react';
import { StudentProfile } from '../types';
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
  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialStudent) {
      setName(initialStudent.name || '');
      setSection(initialStudent.year_section || '');
    }
  }, [initialStudent]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your full name to proceed.');
      return;
    }

    const trimmedSection = section.trim() || 'General Section';

    setIsSubmitting(true);
    try {
      const studentProfile = await api.registerStudent(trimmedName, trimmedSection);
      await api.logAction(
        studentProfile.student_id,
        'sess_initial',
        `Student signed in: ${studentProfile.name} (${studentProfile.year_section})`
      );
      if (onRegister) {
        onRegister(studentProfile);
      } else if (onSubmit) {
        onSubmit(trimmedName);
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.warn('Student registration fallback:', err);
      const fallback: StudentProfile = {
        student_id: `CSS-${Date.now().toString().slice(-6)}`,
        name: trimmedName,
        year_section: trimmedSection,
        created_at: new Date().toISOString()
      };
      await api.logAction(
        fallback.student_id,
        'sess_initial',
        `Student signed in (offline): ${fallback.name} (${fallback.year_section})`
      );
      if (onRegister) {
        onRegister(fallback);
      } else if (onSubmit) {
        onSubmit(trimmedName);
      }
      if (onClose) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden animate-in zoom-in-95 duration-200 relative">
        
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Top Header Banner */}
        <div className="bg-slate-900 text-white px-6 py-6 text-center relative overflow-hidden">
          <div className="w-14 h-14 mx-auto mb-3 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">CSSENTIAL STUDENT ENTRY</h2>
          <p className="text-xs text-blue-200 mt-1 max-w-sm mx-auto">
            One-Click Multi-Intervention Learning Platform for Computer System Installation &amp; Configuration
          </p>
          <div className="mt-2.5 inline-block px-3 py-1 bg-white/10 backdrop-blur-xs rounded-full text-xs font-semibold text-blue-100">
            Open Learning Platform for All Students, Technicians &amp; Learners
          </div>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="student-name-input" className="block text-xs font-black uppercase tracking-wider text-gray-700">
              Student Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="student-name-input"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g., Juan Dela Cruz"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all text-gray-900 placeholder:text-gray-400 font-medium"
            />
            {error && (
              <p className="text-xs font-bold text-red-600 mt-1">{error}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="student-section-input" className="block text-xs font-black uppercase tracking-wider text-gray-700">
              Year &amp; Section / Course <span className="text-gray-400 font-normal">(Type your section)</span>
            </label>
            <input
              id="student-section-input"
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g., 3rd Year - Section A, Grade 12 - TVL, BSIT 3-B"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all text-gray-900 placeholder:text-gray-400 font-medium"
            />
            <p className="text-[11px] text-gray-500">
              Type your exact grade level, college year, or class section to organize your records.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-950 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Research Telemetry Notice:</span> Your activity scores, completion timestamps, answering duration, and game results are logged for educational analysis.
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              id="submit-student-name-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex-2 flex items-center justify-center gap-2 py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-black text-sm rounded-xl shadow-xs transition-all cursor-pointer active:scale-98"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'SAVING...' : 'START LEARNING SESSION'}</span>
            </button>
          </div>

          <p className="text-center text-[11px] text-gray-400">
            Entering your exact name connects to your existing records and progress timeline.
          </p>
        </form>

      </div>
    </div>
  );
};
