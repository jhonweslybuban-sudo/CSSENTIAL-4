import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Clock,
  Award,
  Gamepad2,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Search,
  CheckCircle2,
  BarChart3,
  Calendar,
  Filter,
  ArrowUpDown,
  ChevronRight,
  ExternalLink,
  Eye,
  FileJson,
  Upload,
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  GraduationCap,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { ResearcherStats, StudentProfile, ActivityAttempt, QuizResult, GameResult } from '../types';

interface ResearcherDashboardProps {
  onBackToHome: () => void;
}

export const ResearcherDashboard: React.FC<ResearcherDashboardProps> = ({
  onBackToHome
}) => {
  const [stats, setStats] = useState<ResearcherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STUDENTS' | 'ACTIVITIES' | 'QUIZZES' | 'GAMES'>('OVERVIEW');
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST' | 'SCORE_HIGH' | 'DURATION_HIGH'>('NEWEST');

  // Selected student for detailed drill-down modal
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getResearcherStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load researcher stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format seconds into minutes and seconds
  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    if (s === 0) return `${m}m`;
    return `${m}m ${s}s`;
  };

  // Format ISO timestamp into clean readable presentation
  const formatDateTime = (isoString?: string): string => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  // Student helper lookup
  const getStudentInfo = (studentId: string) => {
    if (!stats) return { name: studentId, section: '3rd-Year BTLED-ICT' };
    const found = stats.students.find(s => s.student_id === studentId);
    return {
      name: found ? found.name : studentId,
      section: found ? found.year_section : '3rd-Year BTLED-ICT'
    };
  };

  // Compute student summary statistics
  const studentMetrics = useMemo(() => {
    if (!stats) return [];
    return stats.students.map(student => {
      const studentAttempts = stats.activityAttempts.filter(a => a.student_id === student.student_id);
      const studentQuizzes = stats.quizResults.filter(q => q.student_id === student.student_id);
      const studentGames = stats.gameResults.filter(g => g.student_id === student.student_id);

      const totalActivities = studentAttempts.length;
      const totalQuizzes = studentQuizzes.length;
      const totalGames = studentGames.length;

      const totalDurationSecs = 
        studentAttempts.reduce((sum, a) => sum + (a.duration_seconds || 0), 0) +
        studentQuizzes.reduce((sum, q) => sum + (q.duration_seconds || 0), 0) +
        studentGames.reduce((sum, g) => sum + (g.duration_seconds || 0), 0);

      const avgAttemptScore = totalActivities > 0
        ? Math.round(studentAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalActivities)
        : 0;

      const avgQuizScore = totalQuizzes > 0
        ? Math.round(studentQuizzes.reduce((sum, q) => sum + (q.percentage || 0), 0) / totalQuizzes)
        : 0;

      const combinedScore = (totalActivities + totalQuizzes) > 0
        ? Math.round(
            (studentAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) +
             studentQuizzes.reduce((sum, q) => sum + (q.percentage || 0), 0)) /
            (totalActivities + totalQuizzes)
          )
        : 0;

      return {
        ...student,
        totalActivities,
        totalQuizzes,
        totalGames,
        totalInterventions: totalActivities + totalQuizzes + totalGames,
        totalDurationSecs,
        avgAttemptScore,
        avgQuizScore,
        combinedScore,
        lastActiveFormatted: student.last_active ? formatDateTime(student.last_active) : 'Recently'
      };
    });
  }, [stats]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return studentMetrics.filter(s => {
      const matchesSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.student_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSection = sectionFilter === 'ALL' || s.year_section.includes(sectionFilter);
      return matchesSearch && matchesSection;
    });
  }, [studentMetrics, searchQuery, sectionFilter]);

  // Filtered & Sorted Activities
  const filteredActivities = useMemo(() => {
    if (!stats) return [];
    let list = stats.activityAttempts.map(a => {
      const s = getStudentInfo(a.student_id);
      return {
        ...a,
        studentName: s.name,
        section: s.section
      };
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => 
        a.studentName.toLowerCase().includes(q) ||
        a.activity_name.toLowerCase().includes(q) ||
        a.student_id.toLowerCase().includes(q)
      );
    }

    if (sectionFilter !== 'ALL') {
      list = list.filter(a => a.section.includes(sectionFilter));
    }

    list.sort((a, b) => {
      if (sortOrder === 'NEWEST') return new Date(b.end_time).getTime() - new Date(a.end_time).getTime();
      if (sortOrder === 'OLDEST') return new Date(a.end_time).getTime() - new Date(b.end_time).getTime();
      if (sortOrder === 'SCORE_HIGH') return b.percentage - a.percentage;
      if (sortOrder === 'DURATION_HIGH') return b.duration_seconds - a.duration_seconds;
      return 0;
    });

    return list;
  }, [stats, searchQuery, sectionFilter, sortOrder]);

  // Selected Student Drilldown Data
  const selectedStudentDossier = useMemo(() => {
    if (!selectedStudentId || !stats) return null;
    const profile = stats.students.find(s => s.student_id === selectedStudentId);
    const attempts = stats.activityAttempts.filter(a => a.student_id === selectedStudentId);
    const quizzes = stats.quizResults.filter(q => q.student_id === selectedStudentId);
    const games = stats.gameResults.filter(g => g.student_id === selectedStudentId);
    const metrics = studentMetrics.find(m => m.student_id === selectedStudentId);

    return {
      profile,
      attempts,
      quizzes,
      games,
      metrics
    };
  }, [selectedStudentId, stats, studentMetrics]);

  // Export Comprehensive Research CSV
  const handleExportCSV = () => {
    if (!stats) return;

    let csv = 'data:text/csv;charset=utf-8,';

    // 1. Title
    csv += 'CSSENTIAL: BTLED-ICT STUDENT INTERVENTION TELEMETRY REPORT\n';
    csv += `Exported On,"${new Date().toLocaleString()}"\n\n`;

    // 2. Students Summary Table
    csv += 'STUDENTS DIRECTORY & SUMMARY\n';
    csv += 'Student ID,Full Name,Year & Section,Total Activities,Total Quizzes,Total Games,Avg Score %,Total Time Spent (Seconds),Last Active\n';
    studentMetrics.forEach(s => {
      csv += `"${s.student_id}","${s.name}","${s.year_section}",${s.totalActivities},${s.totalQuizzes},${s.totalGames},${s.combinedScore}%,${s.totalDurationSecs},"${s.last_active || s.created_at}"\n`;
    });

    // 3. Activity Attempts Detailed
    csv += '\nACTIVITY ATTEMPTS (DURATION & SCORES)\n';
    csv += 'Student ID,Student Name,Year & Section,Activity Name,Activity Type,Score,Total Items,Percentage,Time Spent Answering (Seconds),Time Spent (Formatted),When Completed\n';
    stats.activityAttempts.forEach(a => {
      const s = getStudentInfo(a.student_id);
      csv += `"${a.student_id}","${s.name}","${s.section}","${a.activity_name}","${a.activity_type}",${a.score},${a.total_items},${a.percentage}%,${a.duration_seconds},"${formatDuration(a.duration_seconds)}","${a.end_time}"\n`;
    });

    // 4. Quizzes
    csv += '\nQUIZ SUBMISSIONS\n';
    csv += 'Student ID,Student Name,Quiz Name,Score,Total Questions,Percentage,Duration (Seconds),Duration (Formatted),When Completed\n';
    stats.quizResults.forEach(q => {
      const s = getStudentInfo(q.student_id);
      csv += `"${q.student_id}","${s.name}","${q.quiz_name}",${q.score},${q.total_questions},${q.percentage}%,${q.duration_seconds},"${formatDuration(q.duration_seconds)}","${q.end_time}"\n`;
    });

    // 5. Game Results
    csv += '\nEDUCATIONAL GAMES TELEMETRY\n';
    csv += 'Student ID,Student Name,Game Name,Score,Level,Duration (Seconds),When Completed\n';
    stats.gameResults.forEach(g => {
      const s = getStudentInfo(g.student_id);
      csv += `"${g.student_id}","${s.name}","${g.game_name}",${g.score},${g.level},${g.duration_seconds},"${g.end_time}"\n`;
    });

    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CSSENTIAL_Student_Telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON Database
  const handleExportJSON = () => {
    const jsonStr = api.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CSSENTIAL_Database_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON Database
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = api.importDatabaseJSON(text);
        if (success) {
          setImportNotice('Database imported successfully! Refreshing telemetry...');
          loadData();
          setTimeout(() => setImportNotice(null), 4000);
        } else {
          setImportNotice('Failed to import database: Invalid format.');
          setTimeout(() => setImportNotice(null), 4000);
        }
      } catch {
        setImportNotice('Error parsing JSON file.');
        setTimeout(() => setImportNotice(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset to Seed
  const handleResetSeed = () => {
    if (window.confirm('Reset database to default research sample data? Your local modifications will be replaced.')) {
      api.resetDatabaseToSeed();
      loadData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. TOP EXECUTIVE BANNER */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 rounded-full">
                BTLED-ICT 3RD-YEAR INTERVENTION TELEMETRY
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Live Database Connected
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2 tracking-tight">
              Student Activity &amp; Diagnostics Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-3xl">
              Track real-time student performance, exact completion timestamps, answering duration, quiz scores, and educational game engagement across Computer System Installation &amp; Configuration modules.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={loadData}
              title="Refresh telemetry"
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={!stats}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>EXPORT RESEARCH CSV</span>
            </button>

            <div className="relative inline-block">
              <label className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={handleExportJSON}
              title="Export Full JSON Database Backup"
              className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Backup JSON</span>
            </button>

            <button
              onClick={handleResetSeed}
              title="Reset to default sample dataset"
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notice Bar */}
        {importNotice && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>{importNotice}</span>
            <button onClick={() => setImportNotice(null)} className="text-blue-700 font-bold cursor-pointer">✕</button>
          </div>
        )}
      </div>

      {/* 2. TELEMETRY KPI METRICS GRID */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          
          <div className="bg-white border border-gray-200 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-blue-600 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">ENROLLED</span>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{stats.totalStudents}</div>
              <div className="text-xs font-semibold text-gray-500 mt-0.5">Tracked Students</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-indigo-600 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">PASS RATE</span>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">
                {stats.averageActivityScore}%
              </div>
              <div className="text-xs font-semibold text-gray-500 mt-0.5">Activity Score Avg</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-600 mb-2">
              <BarChart3 className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">QUIZ AVG</span>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">
                {stats.averageQuizScore}%
              </div>
              <div className="text-xs font-semibold text-gray-500 mt-0.5">Assessment Mastery</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-600 mb-2">
              <Clock className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">TOTAL TIME</span>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">
                {Math.round(
                  (stats.activityAttempts.reduce((s, a) => s + (a.duration_seconds || 0), 0) +
                   stats.quizResults.reduce((s, q) => s + (q.duration_seconds || 0), 0) +
                   stats.gameResults.reduce((s, g) => s + (g.duration_seconds || 0), 0)) / 60
                )}m
              </div>
              <div className="text-xs font-semibold text-gray-500 mt-0.5">Answering Time Logged</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <Award className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">ATTEMPTS</span>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">
                {stats.activityAttempts.length + stats.quizResults.length}
              </div>
              <div className="text-xs font-semibold text-gray-500 mt-0.5">Tasks Completed</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-purple-600 mb-2">
              <Gamepad2 className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">GAMES</span>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{stats.totalGameResults}</div>
              <div className="text-xs font-semibold text-gray-500 mt-0.5">Game Hub Rounds</div>
            </div>
          </div>

        </div>
      )}

      {/* 3. FILTERS, SEARCH & NAVIGATION BAR */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { id: 'OVERVIEW', label: 'Overview' },
            { id: 'STUDENTS', label: `Students (${stats?.students.length || 0})` },
            { id: 'ACTIVITIES', label: `Activity Logs (${stats?.activityAttempts.length || 0})` },
            { id: 'QUIZZES', label: `Quizzes (${stats?.quizResults.length || 0})` },
            { id: 'GAMES', label: `Games Telemetry (${stats?.gameResults.length || 0})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Section Filter */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search student or activity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="ALL">All Sections</option>
            <option value="3-A">Section 3-A</option>
            <option value="3-B">Section 3-B</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer hidden md:block"
          >
            <option value="NEWEST">Sort: Newest</option>
            <option value="OLDEST">Sort: Oldest</option>
            <option value="SCORE_HIGH">Sort: Highest Score</option>
            <option value="DURATION_HIGH">Sort: Longest Duration</option>
          </select>
        </div>

      </div>

      {/* 4. TAB CONTENTS */}
      {stats && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="p-6 space-y-6">
              
              {/* Summary Card */}
              <div className="p-5 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
                <h3 className="text-base font-black text-blue-950">
                  Research Telemetry Summary for BTLED-ICT Intervention
                </h3>
                <p className="text-xs text-blue-800/80 mt-1 max-w-3xl leading-relaxed">
                  The dashboard captures empirical evidence regarding the effectiveness of multi-intervention scaffolding (step-by-step videos, interactive troubleshooting simulations, flashcards, diagnostic games, and AI assistance) on 3rd-Year BTLED-ICT students&apos; mastery of Computer System Installation &amp; Configuration.
                </p>
              </div>

              {/* Two Column Grid: Top Students & Recent Submissions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left: Enrolled Students Overview */}
                <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-gray-900">
                        Student Performance Ranking
                      </h4>
                      <p className="text-xs text-gray-500">Based on combined activity and quiz percentages</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('STUDENTS')}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {studentMetrics.slice(0, 5).map((student, idx) => (
                      <div
                        key={student.student_id}
                        onClick={() => setSelectedStudentId(student.student_id)}
                        className="py-2.5 flex items-center justify-between hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-blue-100 text-gray-700 group-hover:text-blue-800 text-xs font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="text-xs font-black text-gray-900 group-hover:text-blue-700 transition-colors">
                              {student.name}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              {student.student_id} • {student.year_section}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs font-black text-emerald-700">
                              {student.combinedScore}%
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              {student.totalActivities} acts • {formatDuration(student.totalDurationSecs)}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Recent Activity Submissions with exact timestamp & duration */}
                <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-gray-900">
                        Latest Activity Completions
                      </h4>
                      <p className="text-xs text-gray-500">Live answer duration and scores</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('ACTIVITIES')}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {stats.activityAttempts.slice(0, 5).map((attempt, idx) => {
                      const student = getStudentInfo(attempt.student_id);
                      return (
                        <div key={idx} className="py-2.5 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-black text-gray-900">
                              {attempt.activity_name}
                            </div>
                            <div className="text-[10px] text-gray-500 font-medium">
                              {student.name} • <span className="font-mono text-gray-400">{formatDateTime(attempt.end_time)}</span>
                            </div>
                          </div>

                          <div className="text-right flex items-center gap-2.5">
                            <div className="text-right">
                              <span className="inline-block px-2 py-0.5 text-xs font-black rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {attempt.percentage}%
                              </span>
                              <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                took {formatDuration(attempt.duration_seconds)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: STUDENTS DIRECTORY & TRANSCRIPTS */}
          {activeTab === 'STUDENTS' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Student ID</th>
                    <th className="py-3.5 px-4">Student Full Name</th>
                    <th className="py-3.5 px-4">Section</th>
                    <th className="py-3.5 px-4 text-center">Activities Completed</th>
                    <th className="py-3.5 px-4 text-center">Average Score</th>
                    <th className="py-3.5 px-4 text-center">Total Answering Time</th>
                    <th className="py-3.5 px-4">Last Active</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((student) => (
                    <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        {student.student_id}
                      </td>
                      <td className="py-3.5 px-4 font-black text-gray-900">
                        {student.name}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-medium">
                        {student.year_section}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-gray-800">
                          {student.totalActivities} / 8
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-black text-xs ${
                          student.combinedScore >= 90
                            ? 'bg-emerald-100 text-emerald-800'
                            : student.combinedScore >= 75
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {student.combinedScore}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-gray-600 font-bold">
                        {formatDuration(student.totalDurationSecs)}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                        {student.lastActiveFormatted}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedStudentId(student.student_id)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black rounded-lg transition-colors cursor-pointer text-xs"
                        >
                          View Transcript
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        No students matching the search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: ACTIVITY ATTEMPTS (SCORES, DURATION, TIMESTAMPS) */}
          {activeTab === 'ACTIVITIES' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Student Name &amp; ID</th>
                    <th className="py-3.5 px-4">Activity Name</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4 text-center">Score</th>
                    <th className="py-3.5 px-4 text-center">Percentage</th>
                    <th className="py-3.5 px-4 text-center">Answering Duration</th>
                    <th className="py-3.5 px-4">When Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredActivities.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{attempt.studentName}</div>
                        <div className="font-mono text-[10px] text-gray-400">
                          {attempt.student_id} • {attempt.section}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-black text-gray-900">
                        {attempt.activity_name}
                      </td>
                      <td className="py-3.5 px-4 text-blue-700 font-semibold">
                        {attempt.activity_type}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        {attempt.score} / {attempt.total_items}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-black text-xs ${
                          attempt.percentage >= 90
                            ? 'bg-emerald-100 text-emerald-800'
                            : attempt.percentage >= 75
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {attempt.percentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-gray-700">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formatDuration(attempt.duration_seconds)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">
                        {formatDateTime(attempt.end_time)}
                      </td>
                    </tr>
                  ))}
                  {filteredActivities.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        No activity attempts recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: QUIZZES */}
          {activeTab === 'QUIZZES' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Quiz Title</th>
                    <th className="py-3.5 px-4 text-center">Score</th>
                    <th className="py-3.5 px-4 text-center">Percentage</th>
                    <th className="py-3.5 px-4 text-center">Answering Duration</th>
                    <th className="py-3.5 px-4">Date &amp; Time Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.quizResults.map((q) => {
                    const student = getStudentInfo(q.student_id);
                    return (
                      <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900">{student.name}</div>
                          <div className="font-mono text-[10px] text-gray-400">{q.student_id}</div>
                        </td>
                        <td className="py-3.5 px-4 font-black text-gray-900">
                          {q.quiz_name}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold">
                          {q.score} / {q.total_questions}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-800 font-black rounded-full text-xs">
                            {q.percentage}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-gray-700">
                          {formatDuration(q.duration_seconds)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">
                          {formatDateTime(q.end_time)}
                        </td>
                      </tr>
                    );
                  })}
                  {stats.quizResults.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No quiz submissions recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: GAMES TELEMETRY */}
          {activeTab === 'GAMES' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Game Name</th>
                    <th className="py-3.5 px-4 text-center">Score</th>
                    <th className="py-3.5 px-4 text-center">Level / Stage</th>
                    <th className="py-3.5 px-4 text-center">Duration</th>
                    <th className="py-3.5 px-4">When Played</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.gameResults.map((g) => {
                    const student = getStudentInfo(g.student_id);
                    return (
                      <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900">{student.name}</div>
                          <div className="font-mono text-[10px] text-gray-400">{g.student_id}</div>
                        </td>
                        <td className="py-3.5 px-4 font-black text-gray-900">
                          {g.game_name}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-purple-700">
                          {g.score} pts
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono">
                          Level {g.level}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-gray-600 font-bold">
                          {formatDuration(g.duration_seconds)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">
                          {formatDateTime(g.end_time)}
                        </td>
                      </tr>
                    );
                  })}
                  {stats.gameResults.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No educational game rounds recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* 5. INDIVIDUAL STUDENT TRANSCRIPT DRILL-DOWN MODAL */}
      {selectedStudentDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                  OFFICIAL STUDENT TRANSCRIPT &amp; TELEMETRY DOSSIER
                </span>
                <h3 className="text-xl font-black mt-1">
                  {selectedStudentDossier.profile?.name}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1 font-mono">
                  <span>ID: {selectedStudentDossier.profile?.student_id}</span>
                  <span>•</span>
                  <span>{selectedStudentDossier.profile?.year_section}</span>
                  <span>•</span>
                  <span>Joined: {formatDateTime(selectedStudentDossier.profile?.created_at)}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentId(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Quick Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="text-[10px] font-bold uppercase text-blue-700">Combined Average</div>
                  <div className="text-xl font-black text-blue-950 mt-0.5">
                    {selectedStudentDossier.metrics?.combinedScore}%
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="text-[10px] font-bold uppercase text-emerald-700">Activities Done</div>
                  <div className="text-xl font-black text-emerald-950 mt-0.5">
                    {selectedStudentDossier.attempts.length}
                  </div>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
                  <div className="text-[10px] font-bold uppercase text-purple-700">Quizzes Taken</div>
                  <div className="text-xl font-black text-purple-950 mt-0.5">
                    {selectedStudentDossier.quizzes.length}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="text-[10px] font-bold uppercase text-amber-700">Time Answering</div>
                  <div className="text-xl font-black text-amber-950 mt-0.5">
                    {formatDuration(selectedStudentDossier.metrics?.totalDurationSecs || 0)}
                  </div>
                </div>
              </div>

              {/* Activity Attempts Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
                  Activity Completions ({selectedStudentDossier.attempts.length})
                </h4>
                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden text-xs">
                  {selectedStudentDossier.attempts.map((attempt, i) => (
                    <div key={i} className="p-3 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <div className="font-black text-gray-900">{attempt.activity_name}</div>
                        <div className="text-[10px] text-gray-500">
                          {attempt.activity_type} • Completed on <span className="font-mono">{formatDateTime(attempt.end_time)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {attempt.score}/{attempt.total_items} ({attempt.percentage}%)
                        </span>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          Duration: {formatDuration(attempt.duration_seconds)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {selectedStudentDossier.attempts.length === 0 && (
                    <div className="p-4 text-center text-gray-400">No activity completions recorded.</div>
                  )}
                </div>
              </div>

              {/* Quiz Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
                  Quiz Results ({selectedStudentDossier.quizzes.length})
                </h4>
                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden text-xs">
                  {selectedStudentDossier.quizzes.map((quiz, i) => (
                    <div key={i} className="p-3 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <div className="font-black text-gray-900">{quiz.quiz_name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          {formatDateTime(quiz.end_time)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {quiz.score}/{quiz.total_questions} ({quiz.percentage}%)
                        </span>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          Duration: {formatDuration(quiz.duration_seconds)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {selectedStudentDossier.quizzes.length === 0 && (
                    <div className="p-4 text-center text-gray-400">No quiz results recorded.</div>
                  )}
                </div>
              </div>

              {/* Games Hub Rounds */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
                  Educational Game Rounds ({selectedStudentDossier.games.length})
                </h4>
                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden text-xs">
                  {selectedStudentDossier.games.map((game, i) => (
                    <div key={i} className="p-3 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <div className="font-black text-gray-900">{game.game_name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          {formatDateTime(game.end_time)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-purple-700 font-mono">
                          {game.score} pts (Lvl {game.level})
                        </span>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {formatDuration(game.duration_seconds)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {selectedStudentDossier.games.length === 0 && (
                    <div className="p-4 text-center text-gray-400">No educational game rounds recorded.</div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                BTLED-ICT Research Telemetry System
              </span>
              <button
                onClick={() => setSelectedStudentId(null)}
                className="px-4 py-2 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-black transition-colors cursor-pointer"
              >
                Close Transcript
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
