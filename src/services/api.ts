import {
  Student,
  Session,
  ActivityAttempt,
  QuizResult,
  GameResult,
  LessonView,
  StudentProfile,
  ResearcherStats,
  DownloadRecord
} from '../types';

export interface LocalDatabaseSchema {
  students: StudentProfile[];
  sessions: Session[];
  activity_attempts: ActivityAttempt[];
  quiz_results: QuizResult[];
  game_results: GameResult[];
  lesson_views: LessonView[];
  downloads: DownloadRecord[];
  activity_logs: any[];
}

const LOCAL_DB_KEY = 'cssential_local_db_v2';

function getInitialSeedDatabase(): LocalDatabaseSchema {
  const now = new Date();
  const d = (hoursAgo: number, minutesAgo: number = 0) => {
    const date = new Date(now.getTime() - (hoursAgo * 3600 + minutesAgo * 60) * 1000);
    return date.toISOString();
  };

  return {
    students: [
      {
        student_id: 'BTLED-2024-001',
        name: 'Aldren Santos',
        year_section: '3rd-Year BTLED-ICT 3-A',
        created_at: d(48),
        last_active: d(1, 15)
      },
      {
        student_id: 'BTLED-2024-002',
        name: 'Kaye Andrea Reyes',
        year_section: '3rd-Year BTLED-ICT 3-A',
        created_at: d(46),
        last_active: d(2, 30)
      },
      {
        student_id: 'BTLED-2024-003',
        name: 'Mark Jayson Del Rosario',
        year_section: '3rd-Year BTLED-ICT 3-B',
        created_at: d(40),
        last_active: d(3, 45)
      },
      {
        student_id: 'BTLED-2024-004',
        name: 'Patricia Mae Alcantara',
        year_section: '3rd-Year BTLED-ICT 3-B',
        created_at: d(36),
        last_active: d(5, 10)
      },
      {
        student_id: 'BTLED-2024-005',
        name: 'Christian Dave Bautista',
        year_section: '3rd-Year BTLED-ICT 3-A',
        created_at: d(24),
        last_active: d(8, 20)
      }
    ],
    sessions: [
      {
        id: 'sess_1',
        session_id: 'sess_1',
        student_id: 'BTLED-2024-001',
        session_start: d(2),
        session_end: d(1, 15),
        total_session_time: 2700
      },
      {
        id: 'sess_2',
        session_id: 'sess_2',
        student_id: 'BTLED-2024-002',
        session_start: d(3),
        session_end: d(2, 30),
        total_session_time: 1800
      }
    ],
    activity_attempts: [
      {
        id: 'att_101',
        attempt_id: 'att_101',
        student_id: 'BTLED-2024-001',
        session_id: 'sess_1',
        activity_name: 'Troubleshooting Scenarios',
        activity_type: 'Scenario Analysis',
        start_time: d(1, 55),
        end_time: d(1, 49),
        duration_seconds: 360,
        score: 4,
        total_items: 4,
        percentage: 100,
        completed: true,
        created_at: d(1, 49)
      },
      {
        id: 'att_102',
        attempt_id: 'att_102',
        student_id: 'BTLED-2024-001',
        session_id: 'sess_1',
        activity_name: 'Installation Practice',
        activity_type: 'Step Ordering',
        start_time: d(1, 45),
        end_time: d(1, 38),
        duration_seconds: 420,
        score: 3,
        total_items: 3,
        percentage: 100,
        completed: true,
        created_at: d(1, 38)
      },
      {
        id: 'att_103',
        attempt_id: 'att_103',
        student_id: 'BTLED-2024-002',
        session_id: 'sess_2',
        activity_name: 'Fault Diagnosis Exercises',
        activity_type: 'Diagnostic Matrix',
        start_time: d(2, 50),
        end_time: d(2, 42),
        duration_seconds: 480,
        score: 4,
        total_items: 5,
        percentage: 80,
        completed: true,
        created_at: d(2, 42)
      },
      {
        id: 'att_104',
        attempt_id: 'att_104',
        student_id: 'BTLED-2024-003',
        session_id: 'sess_3',
        activity_name: 'Configuration Activities',
        activity_type: 'BIOS Setup',
        start_time: d(3, 40),
        end_time: d(3, 34),
        duration_seconds: 360,
        score: 3,
        total_items: 4,
        percentage: 75,
        completed: true,
        created_at: d(3, 34)
      },
      {
        id: 'att_105',
        attempt_id: 'att_105',
        student_id: 'BTLED-2024-004',
        session_id: 'sess_4',
        activity_name: 'Problem Identification',
        activity_type: 'Symptom Matching',
        start_time: d(5, 0),
        end_time: d(4, 52),
        duration_seconds: 480,
        score: 5,
        total_items: 5,
        percentage: 100,
        completed: true,
        created_at: d(4, 52)
      },
      {
        id: 'att_106',
        attempt_id: 'att_106',
        student_id: 'BTLED-2024-005',
        session_id: 'sess_5',
        activity_name: 'System Testing',
        activity_type: 'Benchmark Check',
        start_time: d(8, 10),
        end_time: d(8, 4),
        duration_seconds: 360,
        score: 3,
        total_items: 4,
        percentage: 75,
        completed: true,
        created_at: d(8, 4)
      }
    ],
    quiz_results: [
      {
        id: 'qz_101',
        quiz_id: 'qz_101',
        student_id: 'BTLED-2024-001',
        session_id: 'sess_1',
        quiz_name: 'Computer System Quiz (20 Items)',
        start_time: d(1, 35),
        end_time: d(1, 26),
        duration_seconds: 540,
        score: 19,
        total_questions: 20,
        percentage: 95,
        completed: true,
        created_at: d(1, 26)
      },
      {
        id: 'qz_102',
        quiz_id: 'qz_102',
        student_id: 'BTLED-2024-002',
        session_id: 'sess_2',
        quiz_name: 'Computer System Quiz (20 Items)',
        start_time: d(2, 40),
        end_time: d(2, 31),
        duration_seconds: 540,
        score: 17,
        total_questions: 20,
        percentage: 85,
        completed: true,
        created_at: d(2, 31)
      },
      {
        id: 'qz_103',
        quiz_id: 'qz_103',
        student_id: 'BTLED-2024-003',
        session_id: 'sess_3',
        quiz_name: 'Computer System Quiz (20 Items)',
        start_time: d(3, 30),
        end_time: d(3, 22),
        duration_seconds: 480,
        score: 18,
        total_questions: 20,
        percentage: 90,
        completed: true,
        created_at: d(3, 22)
      },
      {
        id: 'qz_104',
        quiz_id: 'qz_104',
        student_id: 'BTLED-2024-004',
        session_id: 'sess_4',
        quiz_name: 'Computer System Quiz (20 Items)',
        start_time: d(4, 50),
        end_time: d(4, 40),
        duration_seconds: 600,
        score: 16,
        total_questions: 20,
        percentage: 80,
        completed: true,
        created_at: d(4, 40)
      }
    ],
    game_results: [
      {
        id: 'gm_101',
        game_result_id: 'gm_101',
        student_id: 'BTLED-2024-001',
        session_id: 'sess_1',
        game_name: 'Sort & Configure',
        start_time: d(1, 25),
        end_time: d(1, 20),
        duration_seconds: 300,
        score: 180,
        level: 3,
        completed: true,
        created_at: d(1, 20)
      },
      {
        id: 'gm_102',
        game_result_id: 'gm_102',
        student_id: 'BTLED-2024-002',
        session_id: 'sess_2',
        game_name: 'Code Cracker',
        start_time: d(2, 30),
        end_time: d(2, 26),
        duration_seconds: 240,
        score: 120,
        level: 2,
        completed: true,
        created_at: d(2, 26)
      },
      {
        id: 'gm_103',
        game_result_id: 'gm_103',
        student_id: 'BTLED-2024-003',
        session_id: 'sess_3',
        game_name: 'Installation Sequence',
        start_time: d(3, 20),
        end_time: d(3, 17),
        duration_seconds: 180,
        score: 150,
        level: 2,
        completed: true,
        created_at: d(3, 17)
      },
      {
        id: 'gm_104',
        game_result_id: 'gm_104',
        student_id: 'BTLED-2024-004',
        session_id: 'sess_4',
        game_name: 'Memory Match',
        start_time: d(4, 38),
        end_time: d(4, 35),
        duration_seconds: 180,
        score: 100,
        level: 1,
        completed: true,
        created_at: d(4, 35)
      }
    ],
    lesson_views: [
      {
        id: 'lv_101',
        view_id: 'lv_101',
        student_id: 'BTLED-2024-001',
        session_id: 'sess_1',
        lesson_title: 'Preparing for Installation',
        started_at: d(2),
        finished_at: d(1, 56),
        duration_seconds: 240,
        completed: true
      }
    ],
    downloads: [
      {
        id: 'dl_101',
        student_id: 'BTLED-2024-001',
        session_id: 'sess_1',
        resource_name: 'Preparing for Installation - Handout',
        file_type: 'PDF',
        timestamp: d(1, 55)
      },
      {
        id: 'dl_102',
        student_id: 'BTLED-2024-002',
        session_id: 'sess_2',
        resource_name: 'Hardware Assembly & Mounting Guide',
        file_type: 'DOCX',
        timestamp: d(2, 45)
      }
    ],
    activity_logs: []
  };
}

function loadLocalDatabase(): LocalDatabaseSchema {
  try {
    const raw = localStorage.getItem(LOCAL_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.students)) {
        return parsed;
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
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
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

  async registerStudent(name: string, year_section: string = '3rd-Year BTLED-ICT'): Promise<StudentProfile> {
    const studentId = `BTLED-${Date.now().toString().slice(-6)}`;
    const newStudent: StudentProfile = {
      student_id: studentId,
      name,
      year_section,
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString()
    };

    // Save to local database first
    const db = loadLocalDatabase();
    const existingIndex = db.students.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
    if (existingIndex >= 0) {
      db.students[existingIndex].last_active = new Date().toISOString();
      db.students[existingIndex].year_section = year_section;
      saveLocalDatabase(db);
      this.saveStudent(db.students[existingIndex]);
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
        body: JSON.stringify({ name, year_section })
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
      student_id: attempt.student_id || 'BTLED-GUEST',
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
    const id = `qz_${Date.now()}`;
    const completeQuiz: QuizResult = {
      id,
      quiz_id: id,
      student_id: result.student_id || 'BTLED-GUEST',
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
    const id = `gm_${Date.now()}`;
    const completeGame: GameResult = {
      id,
      game_result_id: id,
      student_id: result.student_id || 'BTLED-GUEST',
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
    const id = `lv_${Date.now()}`;
    const completeView: LessonView = {
      id,
      view_id: id,
      student_id: view.student_id || 'BTLED-GUEST',
      session_id: view.session_id || 'SESS-GUEST',
      lesson_title: view.lesson_title || 'Curriculum Lesson',
      started_at: view.started_at || new Date().toISOString(),
      finished_at: view.finished_at || new Date().toISOString(),
      duration_seconds: view.duration_seconds || 0,
      completed: view.completed ?? true
    };

    const db = loadLocalDatabase();
    db.lesson_views.unshift(completeView);
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
      id: `dl_${Date.now()}`,
      student_id: data.student_id,
      session_id: data.session_id,
      resource_name: data.resource_name,
      file_type: data.file_type,
      timestamp: new Date().toISOString()
    };
    db.downloads.unshift(dlRecord);
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
      log_id: `log_${Date.now()}`,
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
      return {
        reply: 'I am your CSSENTIAL AI Assistant. I can help guide you through troubleshooting Computer System Installation and Configuration issues, diagnosing POST codes, motherboard LEDs, RAM dual-channel placement, and BIOS options.',
        source: 'client-fallback'
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

        return {
          students: mergedStudents,
          sessions: backendData.sessions || localDb.sessions,
          activity_attempts: mergedAttempts,
          quiz_results: mergedQuizzes,
          game_results: mergedGames,
          lesson_views: backendData.lesson_views || localDb.lesson_views,
          downloads: backendData.downloads || localDb.downloads,
          activity_logs: backendData.activity_logs || localDb.activity_logs
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
        year_section: s.year_section || '3rd-Year BTLED-ICT',
        created_at: s.created_at,
        last_active: s.last_active
      })),
      activityAttempts: activityAttempts.map((a: any) => ({
        ...a,
        id: a.id || a.attempt_id
      })),
      quizResults: quizResults.map((q: any) => ({
        ...q,
        id: q.id || q.quiz_id
      })),
      gameResults: gameResults.map((g: any) => ({
        ...g,
        id: g.id || g.game_result_id
      })),
      downloads
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
  }
};
