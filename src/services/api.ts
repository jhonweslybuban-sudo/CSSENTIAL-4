import {
  Student,
  Session,
  ActivityAttempt,
  QuizResult,
  GameResult,
  LessonView,
  StudentProfile,
  ResearcherStats,
  DownloadRecord,
  AnnouncementItem,
  BrandingSettings,
  ResearcherProfile
} from '../types';
import { getPlatformAssistanceResponse } from './aiKnowledge';

export interface LocalDatabaseSchema {
  students: StudentProfile[];
  sessions: Session[];
  activity_attempts: ActivityAttempt[];
  quiz_results: QuizResult[];
  game_results: GameResult[];
  lesson_views: LessonView[];
  ai_usage?: any[];
  downloads: DownloadRecord[];
  activity_logs: any[];
}

const LOCAL_DB_KEY = 'cssential_local_db_v2';

const DUMMY_STUDENT_IDS = new Set([
  "CSS-2024-001",
  "CSS-2024-002",
  "CSS-2024-003",
  "CSS-2024-004",
  "CSS-2024-005",
  "std_demo_1",
  "std_demo_2"
]);

const DUMMY_STUDENT_NAMES = new Set([
  "Aldren Santos",
  "Kaye Andrea Reyes",
  "Mark Jayson Del Rosario",
  "Patricia Mae Alcantara",
  "Christian Dave Bautista"
]);

export function isDummyStudent(s: any): boolean {
  if (!s) return true;
  if (DUMMY_STUDENT_IDS.has(s.student_id)) return true;
  if (s.name && DUMMY_STUDENT_NAMES.has(s.name.trim())) return true;
  if (s.name && s.name.includes("(Sample)")) return true;
  return false;
}

function deduplicateLocalItems<T extends Record<string, any>>(items: T[], idKeys: string[]): T[] {
  const seen = new Set<string>();
  return (items || []).filter(item => {
    if (!item) return false;
    let key = '';
    for (const k of idKeys) {
      if (item[k]) {
        key = `${k}:${item[k]}`;
        break;
      }
    }
    if (!key) {
      key = JSON.stringify(item);
    }
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function generateClientUniqueId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function cleanLocalDatabase(db: LocalDatabaseSchema): LocalDatabaseSchema {
  const rawStudents = (db.students || []).filter(s => !isDummyStudent(s));
  const realStudents = deduplicateLocalItems(rawStudents, ['student_id', 'id']);
  const realIds = new Set(realStudents.map(s => s.student_id));
  return {
    students: realStudents,
    sessions: deduplicateLocalItems((db.sessions || []).filter(s => realIds.has(s.student_id)), ['session_id', 'id']),
    activity_attempts: deduplicateLocalItems((db.activity_attempts || []).filter(a => realIds.has(a.student_id)), ['attempt_id', 'id']),
    quiz_results: deduplicateLocalItems((db.quiz_results || []).filter(q => realIds.has(q.student_id)), ['quiz_id', 'id']),
    game_results: deduplicateLocalItems((db.game_results || []).filter(g => realIds.has(g.student_id)), ['game_result_id', 'id']),
    lesson_views: deduplicateLocalItems((db.lesson_views || []).filter(l => realIds.has(l.student_id)), ['view_id', 'id']),
    ai_usage: deduplicateLocalItems((db.ai_usage || []).filter(u => realIds.has(u.student_id)), ['usage_id', 'id']),
    downloads: deduplicateLocalItems((db.downloads || []).filter(d => realIds.has(d.student_id)), ['id', 'download_id']),
    activity_logs: deduplicateLocalItems((db.activity_logs || []).filter(l => realIds.has(l.student_id)), ['log_id', 'id'])
  };
}

function getInitialSeedDatabase(): LocalDatabaseSchema {
  return {
    students: [],
    sessions: [],
    activity_attempts: [],
    quiz_results: [],
    game_results: [],
    lesson_views: [],
    ai_usage: [],
    downloads: [],
    activity_logs: []
  };
}

function loadLocalDatabase(): LocalDatabaseSchema {
  try {
    const raw = localStorage.getItem(LOCAL_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.students)) {
        const cleaned = cleanLocalDatabase(parsed);
        const hasChanges =
          cleaned.students.length !== (parsed.students || []).length ||
          cleaned.activity_logs.length !== (parsed.activity_logs || []).length ||
          cleaned.game_results.length !== (parsed.game_results || []).length ||
          cleaned.quiz_results.length !== (parsed.quiz_results || []).length ||
          cleaned.activity_attempts.length !== (parsed.activity_attempts || []).length;

        if (hasChanges) {
          saveLocalDatabase(cleaned);
        }
        return cleaned;
      }
    }
  } catch (err) {
    console.warn('Error reading local database, reinitializing:', err);
  }

  const seed = getInitialSeedDatabase();
  saveLocalDatabase(seed);
  return seed;
}

function saveLocalDatabase(db: LocalDatabaseSchema): void {
  try {
    localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
  } catch (err) {
    console.warn('Unable to write to localStorage:', err);
  }
}

export const api = {
  getSavedStudent(): StudentProfile | null {
    try {
      const data = localStorage.getItem('cssential_student');
      if (!data) return null;
      const student = JSON.parse(data);
      if (isDummyStudent(student)) {
        localStorage.removeItem('cssential_student');
        return null;
      }
      return student;
    } catch {
      return null;
    }
  },

  async heartbeat(studentId: string, sessionId?: string): Promise<void> {
    if (!studentId) return;
    const db = loadLocalDatabase();
    const student = db.students.find(s => s.student_id === studentId);
    const now = new Date().toISOString();
    if (student) {
      student.last_active = now;
      saveLocalDatabase(db);
    }
    try {
      await fetch('/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, session_id: sessionId })
      });
    } catch {
      // Offline fallback
    }
  },

  getCompletedActivities(studentId?: string): string[] {
    const db = loadLocalDatabase();
    let attempts = db.activity_attempts || [];
    if (studentId) {
      attempts = attempts.filter(a => a.student_id === studentId);
    }
    const completedNames = attempts
      .filter(a => a.completed)
      .map(a => a.activity_name);
    return Array.from(new Set(completedNames));
  },

  saveStudent(student: StudentProfile): void {
    try {
      localStorage.setItem('cssential_student', JSON.stringify(student));
    } catch {
      // Ignore
    }
  },

  clearSavedStudent(): void {
    try {
      localStorage.removeItem('cssential_student');
    } catch {
      // Ignore
    }
  },

  async registerStudent(name: string, year_section: string = 'General Section'): Promise<StudentProfile> {
    const studentId = `CSS-${Date.now().toString().slice(-6)}`;
    
    // Detect referral source
    let referralSource = 'Direct';
    let isGitHub = false;
    if (typeof window !== 'undefined') {
      const ref = (document.referrer || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();
      const host = (window.location.hostname || '').toLowerCase();
      if (ref.includes('github.com') || ref.includes('github.io') || search.includes('github') || search.includes('ref=gh') || host.includes('github.io')) {
        referralSource = 'GitHub Link';
        isGitHub = true;
      } else if (ref) {
        try {
          referralSource = new URL(ref).hostname;
        } catch {
          referralSource = ref.slice(0, 30);
        }
      }
    }

    const newStudent: StudentProfile = {
      student_id: studentId,
      name,
      year_section,
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
      referral_source: referralSource,
      is_github_referral: isGitHub
    };

    // Save to local database first
    const db = loadLocalDatabase();
    const existingIndex = db.students.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
    if (existingIndex >= 0) {
      db.students[existingIndex].last_active = new Date().toISOString();
      db.students[existingIndex].year_section = year_section;
      if (isGitHub) {
        db.students[existingIndex].is_github_referral = true;
        db.students[existingIndex].referral_source = referralSource;
      }
      saveLocalDatabase(db);
      this.saveStudent(db.students[existingIndex]);
      
      try {
        await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            year_section,
            student_id: db.students[existingIndex].student_id,
            referral_source: db.students[existingIndex].referral_source || referralSource,
            is_github_referral: db.students[existingIndex].is_github_referral ?? isGitHub
          })
        });
      } catch {
        // Offline / fallback
      }

      return db.students[existingIndex];
    } else {
      db.students.unshift(newStudent);
      saveLocalDatabase(db);
      this.saveStudent(newStudent);
    }

    // Attempt backend sync
    try {
      await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          year_section,
          student_id: newStudent.student_id,
          referral_source: referralSource,
          is_github_referral: isGitHub
        })
      });
    } catch (err) {
      // Offline / GitHub Pages fallback is active
    }

    return newStudent;
  },

  async startSession(student_id: string): Promise<Session> {
    const sid = `sess_${Date.now()}`;
    const newSession: Session = {
      id: sid,
      session_id: sid,
      student_id,
      session_start: new Date().toISOString(),
      total_session_time: 0
    };

    const db = loadLocalDatabase();
    db.sessions.unshift(newSession);
    const sIdx = db.students.findIndex(s => s.student_id === student_id);
    if (sIdx >= 0) {
      db.students[sIdx].last_active = new Date().toISOString();
    }
    saveLocalDatabase(db);

    try {
      await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id })
      });
    } catch {
      // Offline fallback
    }

    return newSession;
  },

  async createSession(student_id: string): Promise<Session> {
    return this.startSession(student_id);
  },

  async sendHeartbeat(session_id: string, duration_increment: number = 10): Promise<void> {
    const db = loadLocalDatabase();
    const sess = db.sessions.find(s => s.session_id === session_id || s.id === session_id);
    if (sess) {
      sess.total_session_time = (sess.total_session_time || 0) + duration_increment;
      saveLocalDatabase(db);
    }

    try {
      await fetch('/api/sessions/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id, duration_increment })
      });
    } catch {
      // Silent
    }
  },

  async recordActivityAttempt(attempt: Partial<ActivityAttempt>): Promise<ActivityAttempt> {
    const id = `att_${Date.now()}`;
    const completeAttempt: ActivityAttempt = {
      id,
      attempt_id: id,
      student_id: attempt.student_id || 'CSS-GUEST',
      session_id: attempt.session_id || 'SESS-GUEST',
      activity_name: attempt.activity_name || 'Activity Task',
      activity_type: attempt.activity_type || 'Exercise',
      start_time: attempt.start_time || new Date().toISOString(),
      end_time: attempt.end_time || new Date().toISOString(),
      duration_seconds: attempt.duration_seconds || 0,
      score: attempt.score || 0,
      total_items: attempt.total_items || 1,
      percentage: attempt.percentage || 0,
      completed: attempt.completed ?? true,
      created_at: attempt.end_time || new Date().toISOString()
    };

    const db = loadLocalDatabase();
    db.activity_attempts.unshift(completeAttempt);
    // Update student last active
    const sIdx = db.students.findIndex(s => s.student_id === completeAttempt.student_id);
    if (sIdx >= 0) {
      db.students[sIdx].last_active = completeAttempt.end_time;
    }
    // Also log this explicit action in activity_logs
    db.activity_logs.unshift({
      log_id: generateClientUniqueId('log_act'),
      student_id: completeAttempt.student_id,
      session_id: completeAttempt.session_id,
      timestamp: completeAttempt.end_time,
      action_text: `Completed Activity: "${completeAttempt.activity_name}" — Score: ${completeAttempt.score}/${completeAttempt.total_items} (${completeAttempt.percentage}%) in ${completeAttempt.duration_seconds}s`
    });
    if (db.activity_logs.length > 500) db.activity_logs.pop();
    saveLocalDatabase(db);

    try {
      await fetch('/api/activity-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeAttempt)
      });
    } catch {
      // Local db is already saved
    }

    return completeAttempt;
  },

  async recordQuizResult(result: Partial<QuizResult>): Promise<QuizResult> {
    const id = generateClientUniqueId('qz');
    const completeQuiz: QuizResult = {
      id,
      quiz_id: id,
      student_id: result.student_id || 'CSS-GUEST',
      session_id: result.session_id || 'SESS-GUEST',
      quiz_name: result.quiz_name || 'Computer System Quiz',
      start_time: result.start_time || new Date().toISOString(),
      end_time: result.end_time || new Date().toISOString(),
      duration_seconds: result.duration_seconds || 0,
      score: result.score || 0,
      total_questions: result.total_questions || 10,
      percentage: result.percentage || 0,
      completed: result.completed ?? true,
      created_at: result.end_time || new Date().toISOString()
    };

    const db = loadLocalDatabase();
    db.quiz_results.unshift(completeQuiz);
    const sIdx = db.students.findIndex(s => s.student_id === completeQuiz.student_id);
    if (sIdx >= 0) {
      db.students[sIdx].last_active = completeQuiz.end_time;
    }
    db.activity_logs.unshift({
      log_id: generateClientUniqueId('log_qz'),
      student_id: completeQuiz.student_id,
      session_id: completeQuiz.session_id,
      timestamp: completeQuiz.end_time,
      action_text: `Submitted Quiz: "${completeQuiz.quiz_name}" — Score: ${completeQuiz.score}/${completeQuiz.total_questions} (${completeQuiz.percentage}%) in ${completeQuiz.duration_seconds}s`
    });
    if (db.activity_logs.length > 500) db.activity_logs.pop();
    saveLocalDatabase(db);

    try {
      await fetch('/api/quiz-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeQuiz)
      });
    } catch {
      // Local db is saved
    }

    return completeQuiz;
  },

  async recordGameResult(result: Partial<GameResult>): Promise<GameResult> {
    const id = generateClientUniqueId('gm');
    const completeGame: GameResult = {
      id,
      game_result_id: id,
      student_id: result.student_id || 'CSS-GUEST',
      session_id: result.session_id || 'SESS-GUEST',
      game_name: result.game_name || 'Game Hub Module',
      start_time: result.start_time || new Date().toISOString(),
      end_time: result.end_time || new Date().toISOString(),
      duration_seconds: result.duration_seconds || 0,
      score: result.score || 0,
      level: result.level || 1,
      attempts: result.attempts || 1,
      completed: result.completed ?? true,
      created_at: result.end_time || new Date().toISOString()
    };

    const db = loadLocalDatabase();
    db.game_results.unshift(completeGame);
    const sIdx = db.students.findIndex(s => s.student_id === completeGame.student_id);
    if (sIdx >= 0) {
      db.students[sIdx].last_active = completeGame.end_time;
    }
    db.activity_logs.unshift({
      log_id: generateClientUniqueId('log_gm'),
      student_id: completeGame.student_id,
      session_id: completeGame.session_id,
      timestamp: completeGame.end_time,
      action_text: `Completed Educational Game: "${completeGame.game_name}" — Score: ${completeGame.score} (Level ${completeGame.level}) in ${completeGame.duration_seconds}s`
    });
    if (db.activity_logs.length > 500) db.activity_logs.pop();
    saveLocalDatabase(db);

    try {
      await fetch('/api/game-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeGame)
      });
    } catch {
      // Local db is saved
    }

    return completeGame;
  },

  async recordLessonView(view: Partial<LessonView>): Promise<LessonView> {
    const id = generateClientUniqueId('lv');
    const completeView: LessonView = {
      id,
      view_id: id,
      student_id: view.student_id || 'CSS-GUEST',
      session_id: view.session_id || 'SESS-GUEST',
      lesson_title: view.lesson_title || 'Curriculum Lesson',
      started_at: view.started_at || new Date().toISOString(),
      finished_at: view.finished_at || new Date().toISOString(),
      duration_seconds: view.duration_seconds || 0,
      completed: view.completed ?? true
    };

    const db = loadLocalDatabase();
    db.lesson_views.unshift(completeView);
    db.activity_logs.unshift({
      log_id: generateClientUniqueId('log_lv'),
      student_id: completeView.student_id,
      session_id: completeView.session_id,
      timestamp: completeView.finished_at,
      action_text: `Completed Lesson Presentation: "${completeView.lesson_title}" (${completeView.duration_seconds}s)`
    });
    if (db.activity_logs.length > 500) db.activity_logs.pop();
    saveLocalDatabase(db);

    try {
      await fetch('/api/lesson-views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeView)
      });
    } catch {
      // Fallback
    }

    return completeView;
  },

  async recordDownload(data: { student_id: string; session_id: string; resource_name: string; file_type: string }): Promise<void> {
    const db = loadLocalDatabase();
    const dlRecord: DownloadRecord = {
      id: generateClientUniqueId('dl'),
      student_id: data.student_id,
      session_id: data.session_id,
      resource_name: data.resource_name,
      file_type: data.file_type,
      timestamp: new Date().toISOString()
    };
    db.downloads.unshift(dlRecord);
    db.activity_logs.unshift({
      log_id: generateClientUniqueId('log_dl'),
      student_id: data.student_id,
      session_id: data.session_id,
      timestamp: dlRecord.timestamp,
      action_text: `Downloaded Resource: "${data.resource_name}" (${data.file_type})`
    });
    if (db.activity_logs.length > 500) db.activity_logs.pop();
    saveLocalDatabase(db);

    try {
      await fetch('/api/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      // Fallback
    }
  },

  async logAction(student_id: string, session_id: string, action_text: string): Promise<void> {
    const db = loadLocalDatabase();
    db.activity_logs.unshift({
      log_id: generateClientUniqueId('log'),
      student_id,
      session_id,
      timestamp: new Date().toISOString(),
      action_text
    });
    if (db.activity_logs.length > 200) db.activity_logs.pop();
    saveLocalDatabase(db);

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id, session_id, action_text })
      });
    } catch {
      // Silent
    }
  },

  async trackAIUsage(student_id: string, session_id: string, current_page: string, activity_game?: string, question?: string): Promise<void> {
    try {
      await fetch('/api/ai-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id, session_id, current_page, activity_game, question })
      });
    } catch {
      // Silent
    }
  },

  async askAI(message: string, currentContext: string = '', history: any[] = [], currentPage: string = 'dashboard'): Promise<{ reply: string; source: string }> {
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, currentPage, currentContext })
      });
      if (!res.ok) throw new Error('AI service response error');
      return await res.json();
    } catch (err) {
      console.warn('AI call network fallback:', err);
      const localResponse = getPlatformAssistanceResponse(message, currentPage, currentContext);
      return {
        reply: localResponse.reply,
        source: localResponse.source || 'client-knowledge-engine'
      };
    }
  },

  async getResearcherRecords(): Promise<LocalDatabaseSchema> {
    try {
      const res = await fetch('/api/researcher/records');
      if (res.ok) {
        const backendData = await res.json();
        // Merge with local database so that any local client activities are retained
        const localDb = loadLocalDatabase();
        
        // Merge students
        const mergedStudents = [...(backendData.students || [])];
        localDb.students.forEach(ls => {
          if (!mergedStudents.find(bs => bs.student_id === ls.student_id)) {
            mergedStudents.push(ls);
          }
        });

        // Merge attempts
        const mergedAttempts = [...(backendData.activity_attempts || [])];
        localDb.activity_attempts.forEach(la => {
          if (!mergedAttempts.find(ba => (ba.id || ba.attempt_id) === (la.id || la.attempt_id))) {
            mergedAttempts.push(la);
          }
        });

        // Merge quizzes
        const mergedQuizzes = [...(backendData.quiz_results || [])];
        localDb.quiz_results.forEach(lq => {
          if (!mergedQuizzes.find(bq => (bq.id || bq.quiz_id) === (lq.id || lq.quiz_id))) {
            mergedQuizzes.push(lq);
          }
        });

        // Merge games
        const mergedGames = [...(backendData.game_results || [])];
        localDb.game_results.forEach(lg => {
          if (!mergedGames.find(bg => (bg.id || bg.game_result_id) === (lg.id || lg.game_result_id))) {
            mergedGames.push(lg);
          }
        });

        const mergedSessions = deduplicateLocalItems([...(backendData.sessions || []), ...(localDb.sessions || [])], ['session_id', 'id']);
        const mergedViews = deduplicateLocalItems([...(backendData.lesson_views || []), ...(localDb.lesson_views || [])], ['view_id', 'id']);
        const mergedDownloads = deduplicateLocalItems([...(backendData.downloads || []), ...(localDb.downloads || [])], ['download_id', 'id']);
        const mergedLogs = deduplicateLocalItems([...(backendData.activity_logs || []), ...(localDb.activity_logs || [])], ['log_id', 'id']);

        return {
          students: mergedStudents,
          sessions: mergedSessions,
          activity_attempts: mergedAttempts,
          quiz_results: mergedQuizzes,
          game_results: mergedGames,
          lesson_views: mergedViews,
          downloads: mergedDownloads,
          activity_logs: mergedLogs
        };
      }
    } catch (err) {
      console.info('Backend unavailable (running in static / GitHub Pages mode), reading from local database:', err);
    }

    // Default to local database
    return loadLocalDatabase();
  },

  async getResearcherStats(): Promise<ResearcherStats> {
    const records = await this.getResearcherRecords();
    const students = records.students || [];
    const activityAttempts = records.activity_attempts || [];
    const quizResults = records.quiz_results || [];
    const gameResults = records.game_results || [];
    const sessions = records.sessions || [];
    const downloads = records.downloads || [];

    const avgActScore = activityAttempts.length
      ? Math.round(activityAttempts.reduce((acc, cur) => acc + (cur.percentage || 0), 0) / activityAttempts.length)
      : 0;

    const avgQuizScore = quizResults.length
      ? Math.round(quizResults.reduce((acc, cur) => acc + (cur.percentage || 0), 0) / quizResults.length)
      : 0;

    return {
      totalStudents: students.length,
      totalSessions: Math.max(sessions.length, students.length),
      averageActivityScore: avgActScore,
      averageQuizScore: avgQuizScore,
      totalGameResults: gameResults.length,
      totalDownloads: downloads.length,
      students: students.map((s: any) => ({
        student_id: s.student_id,
        name: s.student_name || s.name,
        year_section: s.year_section || 'General Section',
        created_at: s.created_at,
        last_active: s.last_active
      })),
      activityAttempts: deduplicateLocalItems(activityAttempts, ['id', 'attempt_id']).map((a: any) => ({
        ...a,
        id: a.id || a.attempt_id
      })),
      quizResults: deduplicateLocalItems(quizResults, ['id', 'quiz_id']).map((q: any) => ({
        ...q,
        id: q.id || q.quiz_id
      })),
      gameResults: deduplicateLocalItems(gameResults, ['id', 'game_result_id']).map((g: any) => ({
        ...g,
        id: g.id || g.game_result_id
      })),
      downloads: deduplicateLocalItems(downloads, ['id', 'download_id']),
      activityLogs: deduplicateLocalItems(records.activity_logs || [], ['log_id', 'id']),
      lessonViews: deduplicateLocalItems(records.lesson_views || [], ['view_id', 'id'])
    };
  },

  exportDatabaseJSON(): string {
    const db = loadLocalDatabase();
    return JSON.stringify(db, null, 2);
  },

  importDatabaseJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.students)) {
        saveLocalDatabase(parsed);
        return true;
      }
    } catch {
      // Invalid
    }
    return false;
  },

  resetDatabaseToSeed(): void {
    const seed = getInitialSeedDatabase();
    saveLocalDatabase(seed);
  },

  async deleteStudent(studentId: string): Promise<boolean> {
    const db = loadLocalDatabase();
    db.students = db.students.filter(s => s.student_id !== studentId);
    db.sessions = db.sessions.filter(s => s.student_id !== studentId);
    db.activity_attempts = db.activity_attempts.filter(a => a.student_id !== studentId);
    db.quiz_results = db.quiz_results.filter(q => q.student_id !== studentId);
    db.game_results = db.game_results.filter(g => g.student_id !== studentId);
    db.lesson_views = db.lesson_views.filter(l => l.student_id !== studentId);
    db.downloads = db.downloads.filter(d => d.student_id !== studentId);
    db.activity_logs = db.activity_logs.filter(log => log.student_id !== studentId);
    saveLocalDatabase(db);

    try {
      await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
    } catch (e) {
      // Backend optional
    }
    return true;
  },

  async deleteActivityAttempt(attemptId: string): Promise<boolean> {
    const db = loadLocalDatabase();
    db.activity_attempts = db.activity_attempts.filter(a => (a.id || a.attempt_id) !== attemptId);
    saveLocalDatabase(db);

    try {
      await fetch(`/api/activity-attempts/${attemptId}`, { method: 'DELETE' });
    } catch (e) {
      // Backend optional
    }
    return true;
  },

  async deleteQuizResult(quizId: string): Promise<boolean> {
    const db = loadLocalDatabase();
    db.quiz_results = db.quiz_results.filter(q => (q.id || q.quiz_id) !== quizId);
    saveLocalDatabase(db);

    try {
      await fetch(`/api/quiz-results/${quizId}`, { method: 'DELETE' });
    } catch (e) {
      // Backend optional
    }
    return true;
  },

  async deleteGameResult(gameId: string): Promise<boolean> {
    const db = loadLocalDatabase();
    db.game_results = db.game_results.filter(g => (g.id || g.game_result_id) !== gameId);
    saveLocalDatabase(db);

    try {
      await fetch(`/api/game-results/${gameId}`, { method: 'DELETE' });
    } catch (e) {
      // Backend optional
    }
    return true;
  },

  async deleteLog(logId: string): Promise<boolean> {
    const db = loadLocalDatabase();
    db.activity_logs = db.activity_logs.filter(l => (l.id || l.log_id) !== logId);
    saveLocalDatabase(db);

    try {
      await fetch(`/api/logs/${logId}`, { method: 'DELETE' });
    } catch (e) {
      // Backend optional
    }
    return true;
  },

  async deleteRecordsOlderThan(days: number): Promise<{ deletedCount: number }> {
    const db = loadLocalDatabase();
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    const filterDate = (itemDate?: string) => {
      if (!itemDate) return true;
      const t = new Date(itemDate).getTime();
      if (t < cutoffTime) {
        deletedCount++;
        return false;
      }
      return true;
    };

    db.activity_attempts = db.activity_attempts.filter(a => filterDate(a.created_at || a.end_time));
    db.quiz_results = db.quiz_results.filter(q => filterDate(q.created_at || q.end_time));
    db.game_results = db.game_results.filter(g => filterDate(g.created_at || g.end_time));
    db.activity_logs = db.activity_logs.filter(l => filterDate(l.timestamp));
    db.lesson_views = db.lesson_views.filter(v => filterDate(v.started_at));
    saveLocalDatabase(db);

    try {
      await fetch('/api/researcher/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ olderThanDays: days })
      });
    } catch (e) {
      // Backend optional
    }

    return { deletedCount };
  },

  async clearAllRecords(): Promise<boolean> {
    const db = loadLocalDatabase();
    db.activity_attempts = [];
    db.quiz_results = [];
    db.game_results = [];
    db.activity_logs = [];
    db.lesson_views = [];
    db.downloads = [];
    saveLocalDatabase(db);

    try {
      await fetch('/api/researcher/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'all' })
      });
    } catch (e) {
      // Backend optional
    }
    return true;
  },

  async purgeAllData(): Promise<boolean> {
    const emptyDb: LocalDatabaseSchema = {
      students: [],
      sessions: [],
      activity_attempts: [],
      quiz_results: [],
      game_results: [],
      lesson_views: [],
      downloads: [],
      activity_logs: []
    };
    saveLocalDatabase(emptyDb);

    try {
      await fetch('/api/researcher/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'wipe' })
      });
    } catch (e) {
      // Backend optional
    }
    return true;
  },

  // Custom Video Configuration
  getCustomVideos(): Record<string, { url: string; title?: string; type: 'video' | 'embed' }> {
    try {
      const raw = localStorage.getItem('cssential_custom_videos');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  saveCustomVideo(topicId: string, videoData: { url: string; title?: string; type: 'video' | 'embed' }): void {
    try {
      const videos = this.getCustomVideos();
      videos[topicId] = videoData;
      localStorage.setItem('cssential_custom_videos', JSON.stringify(videos));
    } catch (err) {
      console.error('Failed to save custom video:', err);
    }
  },

  deleteCustomVideo(topicId: string): void {
    try {
      const videos = this.getCustomVideos();
      delete videos[topicId];
      localStorage.setItem('cssential_custom_videos', JSON.stringify(videos));
    } catch (err) {
      console.error('Failed to delete custom video:', err);
    }
  },

  // Announcement Management (Home Web Wall Slider & Dashboard Manager)
  getAnnouncements(): AnnouncementItem[] {
    try {
      const raw = localStorage.getItem('cssential_announcements');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to load announcements from storage:', err);
    }
    return DEFAULT_ANNOUNCEMENTS;
  },

  saveAnnouncements(list: AnnouncementItem[]): void {
    try {
      localStorage.setItem('cssential_announcements', JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('cssential_announcements_updated', { detail: list }));
    } catch (err) {
      console.error('Failed to save announcements:', err);
    }

    try {
      fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcements: list })
      }).catch(() => {});
    } catch {}
  },

  addAnnouncement(item: Omit<AnnouncementItem, 'id' | 'date'> & { id?: string; date?: string; link?: string }): AnnouncementItem {
    const list = this.getAnnouncements();
    const newItem: AnnouncementItem = {
      id: item.id || `ann_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: item.title,
      content: item.content,
      category: item.category || 'General Notice',
      badgeColor: item.badgeColor || 'blue',
      date: item.date || new Date().toISOString().split('T')[0],
      imageUrl: item.imageUrl,
      author: item.author || 'Instructor / Researcher',
      linkAction: item.linkAction,
      link: item.link
    };
    list.unshift(newItem);
    this.saveAnnouncements(list);
    return newItem;
  },

  updateAnnouncement(idOrItem: string | AnnouncementItem, updates?: Partial<AnnouncementItem>): void {
    const list = this.getAnnouncements();
    const targetId = typeof idOrItem === 'string' ? idOrItem : idOrItem.id;
    const index = list.findIndex(a => a.id === targetId);
    if (index !== -1) {
      if (typeof idOrItem === 'string' && updates) {
        list[index] = { ...list[index], ...updates };
      } else if (typeof idOrItem !== 'string') {
        list[index] = idOrItem;
      }
      this.saveAnnouncements(list);
    }
  },

  deleteAnnouncement(id: string): void {
    const list = this.getAnnouncements().filter(a => a.id !== id);
    this.saveAnnouncements(list);
  },

  resetAnnouncementsToDefault(): AnnouncementItem[] {
    this.saveAnnouncements(DEFAULT_ANNOUNCEMENTS);
    return DEFAULT_ANNOUNCEMENTS;
  },

  // Branding Management (Logo, Site Title, Subtitle)
  getBranding(): BrandingSettings {
    try {
      const raw = localStorage.getItem('cssential_branding_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            logoUrl: parsed.logoUrl || undefined,
            siteTitle: parsed.siteTitle || 'CSSENTIAL',
            siteSubtitle: parsed.siteSubtitle || 'A One-Click Multi-Intervention Platform for Troubleshooting Computer System Installation and Configuration'
          };
        }
      }
    } catch (err) {
      console.error('Failed to load branding from storage:', err);
    }
    return DEFAULT_BRANDING;
  },

  async fetchRemoteBranding(): Promise<BrandingSettings> {
    try {
      const res = await fetch('/api/branding');
      if (res.ok) {
        const remote = await res.json();
        if (remote && typeof remote === 'object') {
          const current = this.getBranding();
          const merged: BrandingSettings = {
            logoUrl: remote.logoUrl !== undefined ? remote.logoUrl : current.logoUrl,
            siteTitle: remote.siteTitle || current.siteTitle || 'CSSENTIAL',
            siteSubtitle: remote.siteSubtitle || current.siteSubtitle
          };
          localStorage.setItem('cssential_branding_settings', JSON.stringify(merged));
          window.dispatchEvent(new CustomEvent('cssential_branding_updated', { detail: merged }));
          return merged;
        }
      }
    } catch {}
    return this.getBranding();
  },

  saveBranding(settings: BrandingSettings): void {
    try {
      localStorage.setItem('cssential_branding_settings', JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent('cssential_branding_updated', { detail: settings }));
    } catch (err) {
      console.error('Failed to save branding locally:', err);
    }

    try {
      fetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      }).catch(() => {});
    } catch {}
  },

  resetBrandingToDefault(): BrandingSettings {
    this.saveBranding(DEFAULT_BRANDING);
    return DEFAULT_BRANDING;
  },

  // Researchers Management (Photos, Bios, Roles, Descriptions)
  getResearchers(): ResearcherProfile[] {
    try {
      const raw = localStorage.getItem('cssential_researchers_profiles');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to load researchers from storage:', err);
    }
    return DEFAULT_RESEARCHERS;
  },

  async fetchRemoteResearchers(): Promise<ResearcherProfile[]> {
    try {
      const res = await fetch('/api/researchers');
      if (res.ok) {
        const remote = await res.json();
        if (Array.isArray(remote) && remote.length > 0) {
          localStorage.setItem('cssential_researchers_profiles', JSON.stringify(remote));
          window.dispatchEvent(new CustomEvent('cssential_researchers_updated', { detail: remote }));
          return remote;
        }
      }
    } catch {}
    return this.getResearchers();
  },

  saveResearchers(list: ResearcherProfile[]): void {
    try {
      localStorage.setItem('cssential_researchers_profiles', JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('cssential_researchers_updated', { detail: list }));
    } catch (err) {
      console.error('Failed to save researchers locally:', err);
    }

    try {
      fetch('/api/researchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ researchers: list })
      }).catch(() => {});
    } catch {}
  },

  updateResearcher(id: string, updates: Partial<ResearcherProfile>): ResearcherProfile[] {
    const list = this.getResearchers();
    const idx = list.findIndex(r => r.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.saveResearchers(list);
    }
    return list;
  },

  resetResearchersToDefault(): ResearcherProfile[] {
    this.saveResearchers(DEFAULT_RESEARCHERS);
    return DEFAULT_RESEARCHERS;
  }
};

export const DEFAULT_BRANDING: BrandingSettings = {
  logoUrl: undefined,
  siteTitle: 'CSSENTIAL',
  siteSubtitle: 'A One-Click Multi-Intervention Platform for Troubleshooting Computer System Installation and Configuration'
};

export const DEFAULT_RESEARCHERS: ResearcherProfile[] = [
  {
    id: 'buban',
    name: 'Jhon Wesly T. Buban',
    role: 'Developer / Researcher',
    tag: 'Full-Stack Development & AI Integration',
    bio: 'Led the technical architecture, interactive game engines, local database telemetry, and AI Assistant integration for the CSSENTIAL web application.',
    initials: 'JB',
    color: 'bg-blue-600',
    avatarUrl: ''
  },
  {
    id: 'calaputpu',
    name: 'Juliana Marizh B. Calaputpu',
    role: 'Researcher',
    tag: 'Curriculum & Instructional Design',
    bio: 'Spearheaded curriculum alignment, educational lesson structuring, and instructional material synthesis for computer system installation and configuration.',
    initials: 'JC',
    color: 'bg-indigo-600',
    avatarUrl: ''
  },
  {
    id: 'colon',
    name: 'Charlotte Mae H. Colon',
    role: 'Researcher',
    tag: 'Intervention Activities & Assessment',
    bio: 'Formulated diagnostic troubleshooting scenarios, technical laboratory rubrics, and comprehensive evaluation quizzes for computer hardware students and technicians.',
    initials: 'CC',
    color: 'bg-cyan-600',
    avatarUrl: ''
  },
  {
    id: 'timoteo',
    name: 'Precious Lara M. Timoteo',
    role: 'Researcher',
    tag: 'Educational Usability & Media Development',
    bio: 'Directed instructional media curation, usability testing frameworks, and pedagogical interface optimization for multi-intervention learning.',
    initials: 'PT',
    color: 'bg-purple-600',
    avatarUrl: ''
  }
];

export const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann_1',
    title: 'Unit 2 Physical Assembly Assessment',
    category: 'Lab Assessment',
    badgeColor: 'blue',
    date: '2026-03-01',
    content: 'Review Lesson 2 (Installing Computer Systems). Remember that brass standoffs must be mounted only where corresponding motherboard holes exist. Extra standoffs create catastrophic short circuits on bottom traces!',
    author: 'Jhon Wesly T. Buban'
  },
  {
    id: 'ann_2',
    title: 'ESD Safety Standard Compliance',
    category: 'Safety Directive',
    badgeColor: 'amber',
    date: '2026-03-02',
    content: 'Every student must wear an anti-static wrist strap clipped to bare chassis metal before handling CPU chips and dual-channel RAM sticks. Maintain work area relative humidity between 40% and 60%.',
    author: 'Laboratory Safety Officer'
  },
  {
    id: 'ann_3',
    title: 'Hands-On Virtual PC Lab Simulator Active',
    category: 'Interactive Lab',
    badgeColor: 'emerald',
    date: '2026-03-03',
    content: 'Practice realistic computer hardware assembly, cable connections, and UEFI BIOS configuration at home before entering the physical hardware laboratory! Complete all 10 assembly stations & POST diagnostics.',
    author: 'CSSENTIAL Curriculum Team'
  },
  {
    id: 'ann_4',
    title: 'Interactive Games Hub: 11 Educational Games',
    category: 'Gamified Learning',
    badgeColor: 'purple',
    date: '2026-03-04',
    content: 'Master hardware identification, cable pinouts, and troubleshooting methodology through our 11 educational games under ACTIVITIES > 🎮 PLAY. Real-time scores and progress sync directly to the Researcher Dashboard.',
    author: 'CSSENTIAL Development Team'
  },
  {
    id: 'ann_5',
    title: 'Curriculum Presentations & Offline Decks',
    category: 'Study Resources',
    badgeColor: 'blue',
    date: '2026-03-05',
    content: 'All 6 competency units now feature full 16:9 interactive visual presentations with one-click offline HTML downloads and official academic laboratory manuals in PDF and Word (.docx) formats.',
    author: 'Juliana Marizh B. Calaputpu'
  }
];
