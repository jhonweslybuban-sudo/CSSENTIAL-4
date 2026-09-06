import React, { useState } from 'react';
import {
  Trash2,
  AlertTriangle,
  Clock,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Users,
  Award,
  Database,
  ShieldAlert,
  Archive,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { ResearcherStats } from '../types';

interface ResearcherRecordManagerProps {
  stats: ResearcherStats | null;
  onDataChanged: () => void;
}

export const ResearcherRecordManager: React.FC<ResearcherRecordManagerProps> = ({
  stats,
  onDataChanged
}) => {
  const [retentionDays, setRetentionDays] = useState<number>(30);
  const [actionNotice, setActionNotice] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    description: string;
    action: () => Promise<void>;
    buttonLabel: string;
  } | null>(null);

  const showNotification = (text: string, isError = false) => {
    setActionNotice({ text, isError });
    setTimeout(() => setActionNotice(null), 4500);
  };

  // 1. Auto-Delete Records Older than X Days
  const handleAutoDeleteOlderThan = async () => {
    setIsProcessing(true);
    try {
      const res = await api.deleteRecordsOlderThan(retentionDays);
      showNotification(`Auto-retention complete: Deleted ${res.deletedCount} records older than ${retentionDays} days.`);
      onDataChanged();
    } catch (err) {
      showNotification('Failed to auto-prune records.', true);
    } finally {
      setIsProcessing(false);
      setConfirmModal(null);
    }
  };

  // 2. Clear Inactive Students (students who have 0 activities, 0 quizzes, 0 games)
  const handleClearInactiveStudents = async () => {
    if (!stats) return;
    setIsProcessing(true);
    try {
      const activeIds = new Set([
        ...stats.activityAttempts.map(a => a.student_id),
        ...stats.quizResults.map(q => q.student_id),
        ...stats.gameResults.map(g => g.student_id)
      ]);

      const inactive = stats.students.filter(s => !activeIds.has(s.student_id));
      for (const s of inactive) {
        await api.deleteStudent(s.student_id);
      }

      showNotification(`Cleaned up ${inactive.length} inactive student registrations.`);
      onDataChanged();
    } catch (err) {
      showNotification('Failed to clean inactive students.', true);
    } finally {
      setIsProcessing(false);
      setConfirmModal(null);
    }
  };

  // 3. Clear All Activity/Quiz Submissions (Keep Student Directory)
  const handleClearActivitySubmissions = async () => {
    setIsProcessing(true);
    try {
      await api.clearAllRecords();
      showNotification('Successfully cleared all student submissions and logs. Registered students retained.');
      onDataChanged();
    } catch (err) {
      showNotification('Failed to clear activity submissions.', true);
    } finally {
      setIsProcessing(false);
      setConfirmModal(null);
    }
  };

  // 4. Wipe Entire Database (Students + Submissions)
  const handleWipeDatabase = async () => {
    setIsProcessing(true);
    try {
      await api.purgeAllData();
      showNotification('Entire database wiped. Platform is in clean state.');
      onDataChanged();
    } catch (err) {
      showNotification('Failed to wipe database.', true);
    } finally {
      setIsProcessing(false);
      setConfirmModal(null);
    }
  };

  // 5. Reset to Default Seed Data
  const handleResetSeed = async () => {
    setIsProcessing(true);
    try {
      api.resetDatabaseToSeed();
      showNotification('Database restored to default academic sample dataset.');
      onDataChanged();
    } catch (err) {
      showNotification('Failed to reset sample dataset.', true);
    } finally {
      setIsProcessing(false);
      setConfirmModal(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-5 bg-linear-to-r from-red-950 via-slate-900 to-slate-950 text-white rounded-2xl shadow-xs border border-red-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">
              Telemetry Retention &amp; Record Maintenance Controls
            </h3>
            <p className="text-xs text-gray-300 mt-0.5">
              Manage telemetry lifecycle, prune expired records automatically based on retention policies, or manually purge test records.
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {actionNotice && (
        <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
          actionNotice.isError
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
        }`}>
          {actionNotice.isError ? (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h4 className="text-base font-black text-gray-900">{confirmModal.title}</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {confirmModal.description}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                disabled={isProcessing}
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isProcessing}
                onClick={() => confirmModal.action()}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                {isProcessing ? 'Processing...' : confirmModal.buttonLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Operational Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PANEL A: AUTOMATIC RETENTION POLICIES */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-blue-700">
            <Clock className="w-4 h-4" />
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              Automatic Deletion &amp; Retention Rules
            </h4>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Automatically prune older activity attempts, quiz results, and student telemetry logs based on a scheduled retention timeframe.
          </p>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <label className="block text-xs font-bold text-gray-700">
              Retention Window (Delete records older than):
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[7, 14, 30, 60, 90].map(days => (
                <button
                  key={days}
                  onClick={() => setRetentionDays(days)}
                  className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer border ${
                    retentionDays === days
                      ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setConfirmModal({
                    title: `Prune Records Older Than ${retentionDays} Days?`,
                    description: `This will automatically scan and delete all activity attempts, quiz submissions, and action logs created more than ${retentionDays} days ago. Registered student profiles will be retained.`,
                    buttonLabel: `Delete Records > ${retentionDays} Days`,
                    action: handleAutoDeleteOlderThan
                  });
                }}
                className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Execute Auto-Deletion ({retentionDays} Days Retention)</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">Clear Inactive Student Accounts</span>
              <span className="text-[10px] text-gray-400 font-mono">0 submissions</span>
            </div>
            <p className="text-[11px] text-gray-500">
              Removes student accounts that registered on the site but never submitted any activities or quizzes.
            </p>
            <button
              onClick={() => {
                setConfirmModal({
                  title: 'Clean Inactive Student Registrations?',
                  description: 'This will identify all student accounts with 0 activity attempts, 0 quizzes, and 0 game completions, and delete them from the directory.',
                  buttonLabel: 'Purge Inactive Students',
                  action: handleClearInactiveStudents
                });
              }}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Scan &amp; Purge Inactive Students
            </button>
          </div>

        </div>

        {/* PANEL B: MANUAL PURGE & DATABASE LIFECYCLE */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-red-700">
            <Database className="w-4 h-4" />
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              Manual Purge &amp; Semester Reset
            </h4>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Use these controls at the end of a semester, when moving to a new research cohort, or when clearing dummy test data.
          </p>

          <div className="space-y-3">
            
            {/* Clear All Submissions Only */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">
                  Wipe All Scores &amp; Action Logs (Keep Students)
                </span>
                <Archive className="w-4 h-4 text-amber-700" />
              </div>
              <p className="text-[11px] text-amber-800/80">
                Removes all scores, answering durations, quiz submissions, and activity action logs, but retains the enrolled student directory.
              </p>
              <button
                onClick={() => {
                  setConfirmModal({
                    title: 'Wipe All Submissions & Action Logs?',
                    description: 'This will reset all activity attempts, quiz scores, game metrics, and activity logs to 0. Enrolled student accounts will remain registered.',
                    buttonLabel: 'Wipe All Submissions',
                    action: handleClearActivitySubmissions
                  });
                }}
                className="w-full py-2 px-3 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Clear All Student Submissions
              </button>
            </div>

            {/* Wipe Entire Database */}
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-900">
                  Full Database Wipe (Fresh Clean State)
                </span>
                <Trash2 className="w-4 h-4 text-red-700" />
              </div>
              <p className="text-[11px] text-red-800/80">
                Wipes all students, sessions, activities, quizzes, and logs. Leaves an empty database ready for a brand new cohort.
              </p>
              <button
                onClick={() => {
                  setConfirmModal({
                    title: 'Permanently Wipe All Telemetry Data?',
                    description: 'This is an irreversible action. All registered students, attempt records, answering timestamps, and audit logs will be permanently deleted.',
                    buttonLabel: 'Confirm Full Database Wipe',
                    action: handleWipeDatabase
                  });
                }}
                className="w-full py-2 px-3 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Wipe Entire Database
              </button>
            </div>

            {/* Reset to Seed Dataset */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">
                  Restore Academic Seed Dataset
                </span>
                <RotateCcw className="w-4 h-4 text-gray-600" />
              </div>
              <p className="text-[11px] text-gray-500">
                Restores the standard 4 sample students with benchmark activity attempts, quiz results, and logged actions.
              </p>
              <button
                onClick={() => {
                  setConfirmModal({
                    title: 'Restore Default Research Sample Dataset?',
                    description: 'This will replace the current database with the default curriculum benchmark sample dataset.',
                    buttonLabel: 'Restore Seed Data',
                    action: handleResetSeed
                  });
                }}
                className="w-full py-2 px-3 bg-gray-700 hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Reset to Sample Dataset
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
