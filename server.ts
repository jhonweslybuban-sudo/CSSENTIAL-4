import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { getPlatformAssistanceResponse } from './src/services/aiKnowledge';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Helper to generate globally unique IDs
function generateUniqueId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Database storage setup
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  students: any[];
  sessions: any[];
  activity_attempts: any[];
  quiz_results: any[];
  game_results: any[];
  lesson_views: any[];
  ai_usage: any[];
  activity_logs: any[];
  announcements?: any[];
}

function deduplicateRecords<T extends Record<string, any>>(items: T[], idKeys: string[]): T[] {
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

function cleanDummyData(data: DatabaseSchema): DatabaseSchema {
  const dummyIds = new Set(['std_demo_1', 'std_demo_2', 'CSS-2024-001', 'CSS-2024-002', 'CSS-2024-003', 'CSS-2024-004', 'CSS-2024-005']);
  const dummyNames = new Set(['Aldren Santos', 'Kaye Andrea Reyes', 'Mark Jayson Del Rosario', 'Patricia Mae Alcantara', 'Christian Dave Bautista']);
  
  const rawStudents = (data.students || []).filter(s => {
    if (!s) return false;
    if (dummyIds.has(s.student_id)) return false;
    if (s.student_name && s.student_name.includes('(Sample)')) return false;
    if (s.student_name && dummyNames.has(s.student_name.trim())) return false;
    return true;
  });
  const realStudents = deduplicateRecords(rawStudents, ['student_id']);
  const realIds = new Set(realStudents.map(s => s.student_id));

  const validSessions = deduplicateRecords((data.sessions || []).filter(s => realIds.has(s.student_id)), ['session_id', 'id']);
  const validAttempts = deduplicateRecords((data.activity_attempts || []).filter(a => realIds.has(a.student_id)), ['attempt_id', 'id']);
  const validQuizzes = deduplicateRecords((data.quiz_results || []).filter(q => realIds.has(q.student_id)), ['quiz_id', 'id']);
  const validGames = deduplicateRecords((data.game_results || []).filter(g => realIds.has(g.student_id)), ['game_result_id', 'id']);
  const validViews = deduplicateRecords((data.lesson_views || []).filter(l => realIds.has(l.student_id)), ['view_id', 'id']);
  const validAiUsage = deduplicateRecords((data.ai_usage || []).filter(u => realIds.has(u.student_id)), ['usage_id', 'id']);
  const validLogs = deduplicateRecords((data.activity_logs || []).filter(l => realIds.has(l.student_id)), ['log_id', 'id']);

  return {
    students: realStudents,
    sessions: validSessions,
    activity_attempts: validAttempts,
    quiz_results: validQuizzes,
    game_results: validGames,
    lesson_views: validViews,
    ai_usage: validAiUsage,
    activity_logs: validLogs,
    announcements: data.announcements || []
  };
}

function loadDatabase(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      students: [],
      sessions: [],
      activity_attempts: [],
      quiz_results: [],
      game_results: [],
      lesson_views: [],
      ai_usage: [],
      activity_logs: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const cleaned = cleanDummyData(parsed);
    if (cleaned.students.length !== (parsed.students || []).length) {
      saveDatabase(cleaned);
    }
    return cleaned;
  } catch (err) {
    console.error('Failed to read database, initializing new:', err);
    return {
      students: [],
      sessions: [],
      activity_attempts: [],
      quiz_results: [],
      game_results: [],
      lesson_views: [],
      ai_usage: [],
      activity_logs: []
    };
  }
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

// REST API ROUTES
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Students: Create or retrieve
app.post('/api/students', (req, res) => {
  const { name, year_section, student_id, referral_source, is_github_referral } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const cleanName = name.trim();
  const db = loadDatabase();
  let student = db.students.find(
    s => (s.student_name && s.student_name.toLowerCase() === cleanName.toLowerCase()) ||
         (student_id && s.student_id === student_id)
  );

  const now = new Date().toISOString();

  if (!student) {
    student = {
      student_id: student_id || `std_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      student_name: cleanName,
      year_section: year_section || 'General Section',
      created_at: now,
      last_active: now,
      referral_source: referral_source || 'Direct',
      is_github_referral: Boolean(is_github_referral)
    };
    db.students.push(student);
  } else {
    student.last_active = now;
    if (year_section) student.year_section = year_section;
    if (referral_source) student.referral_source = referral_source;
    if (is_github_referral !== undefined) student.is_github_referral = Boolean(is_github_referral);
  }

  saveDatabase(db);
  res.json(student);
});

app.get('/api/students', (req, res) => {
  const db = loadDatabase();
  res.json(db.students);
});

// Real-time active status heartbeat
app.post('/api/heartbeat', (req, res) => {
  const { student_id, session_id } = req.body;
  if (!student_id && !session_id) {
    return res.status(400).json({ error: 'student_id or session_id required' });
  }

  const db = loadDatabase();
  const now = new Date().toISOString();

  if (student_id) {
    const student = db.students.find(s => s.student_id === student_id);
    if (student) {
      student.last_active = now;
    }
  }

  if (session_id) {
    const session = db.sessions.find(s => s.session_id === session_id);
    if (session) {
      session.session_end = now;
    }
  }

  saveDatabase(db);
  res.json({ success: true, timestamp: now });
});

// Sessions: Start & Heartbeat
app.post('/api/sessions/start', (req, res) => {
  const { student_id } = req.body;
  if (!student_id) return res.status(400).json({ error: 'student_id required' });

  const db = loadDatabase();
  const now = new Date().toISOString();
  const session = {
    session_id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    student_id,
    session_start: now,
    session_end: now,
    total_session_time: 0
  };

  db.sessions.push(session);

  // Update student last_active
  const student = db.students.find(s => s.student_id === student_id);
  if (student) {
    student.last_active = now;
    db.activity_logs.unshift({
      log_id: generateUniqueId('log'),
      student_id,
      student_name: student.student_name,
      session_id: session.session_id,
      timestamp: now,
      action_text: 'Started learning session'
    });
  }

  saveDatabase(db);
  res.json(session);
});

app.post('/api/sessions/heartbeat', (req, res) => {
  const { session_id, duration_increment } = req.body;
  if (!session_id) return res.status(400).json({ error: 'session_id required' });

  const db = loadDatabase();
  const session = db.sessions.find(s => s.session_id === session_id);
  if (session) {
    session.session_end = new Date().toISOString();
    session.total_session_time = (session.total_session_time || 0) + (duration_increment || 10);
    saveDatabase(db);
    return res.json({ success: true, total_session_time: session.total_session_time });
  }

  res.status(404).json({ error: 'Session not found' });
});

// Activity Attempts
app.post('/api/activity-attempts', (req, res) => {
  const {
    student_id,
    session_id,
    activity_name,
    activity_type,
    start_time,
    end_time,
    duration_seconds,
    score,
    total_items,
    percentage,
    completed
  } = req.body;

  const db = loadDatabase();
  const now = new Date().toISOString();
  const attempt = {
    attempt_id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    student_id,
    session_id,
    activity_name,
    activity_type: activity_type || 'Activity',
    start_time: start_time || now,
    end_time: end_time || now,
    duration_seconds: duration_seconds || 0,
    score: score ?? 0,
    total_items: total_items ?? 0,
    percentage: percentage ?? (total_items ? Math.round((score / total_items) * 100) : 0),
    completed: completed ?? true,
    created_at: now
  };

  db.activity_attempts.push(attempt);

  // Log action
  const student = db.students.find(s => s.student_id === student_id);
  if (student) {
    student.last_active = now;
    db.activity_logs.unshift({
      log_id: generateUniqueId('log'),
      student_id,
      student_name: student.student_name,
      session_id,
      timestamp: now,
      action_text: `Completed activity: ${activity_name} (Score: ${score}/${total_items}, ${attempt.percentage}%)`
    });
  }

  saveDatabase(db);
  res.json(attempt);
});

// Quiz Results
app.post('/api/quiz-results', (req, res) => {
  const {
    student_id,
    session_id,
    quiz_name,
    start_time,
    end_time,
    duration_seconds,
    score,
    total_questions,
    percentage,
    completed
  } = req.body;

  const db = loadDatabase();
  const now = new Date().toISOString();
  const quiz = {
    quiz_id: `qz_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    student_id,
    session_id,
    quiz_name,
    start_time: start_time || now,
    end_time: end_time || now,
    duration_seconds: duration_seconds || 0,
    score: score ?? 0,
    total_questions: total_questions ?? 0,
    percentage: percentage ?? (total_questions ? Math.round((score / total_questions) * 100) : 0),
    completed: completed ?? true,
    created_at: now
  };

  db.quiz_results.push(quiz);

  const student = db.students.find(s => s.student_id === student_id);
  if (student) {
    student.last_active = now;
    db.activity_logs.unshift({
      log_id: generateUniqueId('log'),
      student_id,
      student_name: student.student_name,
      session_id,
      timestamp: now,
      action_text: `Completed Quiz: ${quiz_name} (Score: ${score}/${total_questions}, ${quiz.percentage}%)`
    });
  }

  saveDatabase(db);
  res.json(quiz);
});

// Game Results
app.post('/api/game-results', (req, res) => {
  const {
    student_id,
    session_id,
    game_name,
    start_time,
    end_time,
    duration_seconds,
    score,
    level,
    attempts,
    completed,
    extra_stats
  } = req.body;

  const db = loadDatabase();
  const now = new Date().toISOString();
  const game = {
    game_result_id: `gm_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    student_id,
    session_id,
    game_name,
    start_time: start_time || now,
    end_time: end_time || now,
    duration_seconds: duration_seconds || 0,
    score: score ?? 0,
    level: level ?? 1,
    attempts: attempts ?? 1,
    completed: completed ?? true,
    created_at: now,
    extra_stats: extra_stats || {}
  };

  db.game_results.push(game);

  const student = db.students.find(s => s.student_id === student_id);
  if (student) {
    student.last_active = now;
    db.activity_logs.unshift({
      log_id: generateUniqueId('log'),
      student_id,
      student_name: student.student_name,
      session_id,
      timestamp: now,
      action_text: `Played Game: ${game_name} (Score: ${score}, Level: ${level || 1})`
    });
  }

  saveDatabase(db);
  res.json(game);
});

// Lesson Views
app.post('/api/lesson-views', (req, res) => {
  const {
    student_id,
    session_id,
    lesson_title,
    started_at,
    finished_at,
    duration_seconds,
    completed
  } = req.body;

  const db = loadDatabase();
  const now = new Date().toISOString();
  const view = {
    view_id: `lv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    student_id,
    session_id,
    lesson_title,
    started_at: started_at || now,
    finished_at: finished_at || now,
    duration_seconds: duration_seconds || 0,
    completed: completed ?? true
  };

  db.lesson_views.push(view);

  const student = db.students.find(s => s.student_id === student_id);
  if (student) {
    student.last_active = now;
    db.activity_logs.unshift({
      log_id: generateUniqueId('log'),
      student_id,
      student_name: student.student_name,
      session_id,
      timestamp: now,
      action_text: `Viewed Lesson: ${lesson_title} (${Math.round(duration_seconds || 0)}s)`
    });
  }

  saveDatabase(db);
  res.json(view);
});

// AI Usage Tracking
app.post('/api/ai-usage', (req, res) => {
  const {
    student_id,
    session_id,
    current_page,
    activity_game,
    question
  } = req.body;

  const db = loadDatabase();
  const now = new Date().toISOString();

  let usage = db.ai_usage.find(
    u => u.student_id === student_id && u.session_id === session_id && u.current_page === current_page
  );

  if (usage) {
    usage.question_count = (usage.question_count || 1) + 1;
    usage.last_time = now;
    usage.last_question = question;
  } else {
    usage = {
      usage_id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      student_id,
      session_id,
      current_page: current_page || 'HOME',
      activity_game: activity_game || '',
      question_count: 1,
      first_time: now,
      last_time: now,
      last_question: question
    };
    db.ai_usage.push(usage);
  }

  const student = db.students.find(s => s.student_id === student_id);
  if (student) {
    db.activity_logs.unshift({
      log_id: generateUniqueId('log'),
      student_id,
      student_name: student.student_name,
      session_id,
      timestamp: now,
      action_text: `Asked AI Assistant on [${current_page}]: "${question ? question.slice(0, 45) + '...' : 'Question'}"`
    });
  }

  saveDatabase(db);
  res.json(usage);
});

// Custom Log endpoint
app.post('/api/logs', (req, res) => {
  const { student_id, session_id, action_text } = req.body;
  const db = loadDatabase();
  const student = db.students.find(s => s.student_id === student_id);
  const log = {
    log_id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    student_id,
    student_name: student ? student.student_name : 'Student',
    session_id,
    timestamp: new Date().toISOString(),
    action_text
  };

  db.activity_logs.unshift(log);
  if (db.activity_logs.length > 500) {
    db.activity_logs = db.activity_logs.slice(0, 500);
  }
  saveDatabase(db);
  res.json(log);
});

// Announcements Endpoints
app.get('/api/announcements', (req, res) => {
  const db = loadDatabase();
  res.json(db.announcements || []);
});

app.post('/api/announcements', (req, res) => {
  const { announcements } = req.body;
  if (Array.isArray(announcements)) {
    const db = loadDatabase();
    db.announcements = announcements;
    saveDatabase(db);
    return res.json({ success: true, count: announcements.length });
  }
  res.status(400).json({ error: 'Array of announcements expected' });
});

// Deletion Endpoints
app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDatabase();
  db.students = db.students.filter(s => s.student_id !== id);
  db.sessions = db.sessions.filter(s => s.student_id !== id);
  db.activity_attempts = db.activity_attempts.filter(a => a.student_id !== id);
  db.quiz_results = db.quiz_results.filter(q => q.student_id !== id);
  db.game_results = db.game_results.filter(g => g.student_id !== id);
  db.lesson_views = db.lesson_views.filter(l => l.student_id !== id);
  db.activity_logs = db.activity_logs.filter(l => l.student_id !== id);
  saveDatabase(db);
  res.json({ success: true, deletedStudentId: id });
});

app.delete('/api/activity-attempts/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDatabase();
  db.activity_attempts = db.activity_attempts.filter(a => a.attempt_id !== id && a.id !== id);
  saveDatabase(db);
  res.json({ success: true, deletedAttemptId: id });
});

app.delete('/api/quiz-results/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDatabase();
  db.quiz_results = db.quiz_results.filter(q => q.quiz_id !== id && q.id !== id);
  saveDatabase(db);
  res.json({ success: true, deletedQuizId: id });
});

app.delete('/api/game-results/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDatabase();
  db.game_results = db.game_results.filter(g => g.game_result_id !== id && g.id !== id);
  saveDatabase(db);
  res.json({ success: true, deletedGameId: id });
});

app.delete('/api/logs/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDatabase();
  db.activity_logs = db.activity_logs.filter(l => l.log_id !== id && l.id !== id);
  saveDatabase(db);
  res.json({ success: true, deletedLogId: id });
});

app.post('/api/researcher/purge', (req, res) => {
  const { olderThanDays, type } = req.body;
  const db = loadDatabase();
  if (type === 'wipe') {
    db.students = [];
    db.sessions = [];
    db.activity_attempts = [];
    db.quiz_results = [];
    db.game_results = [];
    db.lesson_views = [];
    db.activity_logs = [];
    db.ai_usage = [];
    saveDatabase(db);
    return res.json({ success: true, message: 'Database wiped' });
  }

  if (type === 'all') {
    db.activity_attempts = [];
    db.quiz_results = [];
    db.game_results = [];
    db.activity_logs = [];
    db.lesson_views = [];
    db.ai_usage = [];
    saveDatabase(db);
    return res.json({ success: true, message: 'All telemetry purged' });
  }

  if (olderThanDays && typeof olderThanDays === 'number') {
    const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    const filterFn = (iso?: string) => {
      if (!iso) return true;
      return new Date(iso).getTime() >= cutoff;
    };
    db.activity_attempts = db.activity_attempts.filter(a => filterFn(a.created_at || a.end_time));
    db.quiz_results = db.quiz_results.filter(q => filterFn(q.created_at || q.end_time));
    db.game_results = db.game_results.filter(g => filterFn(g.created_at || g.end_time));
    db.activity_logs = db.activity_logs.filter(l => filterFn(l.timestamp));
    db.lesson_views = db.lesson_views.filter(l => filterFn(l.started_at));
    saveDatabase(db);
    return res.json({ success: true, message: `Purged records older than ${olderThanDays} days` });
  }

  res.status(400).json({ error: 'Invalid purge request' });
});

// RESEARCHER / ADMIN DASHBOARD ENDPOINTS
app.get('/api/researcher/overview', (req, res) => {
  const db = loadDatabase();
  const totalStudents = db.students.length;
  const activeStudents = db.students.filter(s => {
    const diffHours = (Date.now() - new Date(s.last_active).getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  }).length;
  const completedSessions = db.sessions.length;
  const totalActivitiesCompleted = db.activity_attempts.filter(a => a.completed).length;
  const totalGamesPlayed = db.game_results.length;
  const totalQuizzesCompleted = db.quiz_results.filter(q => q.completed).length;

  res.json({
    totalStudents,
    activeStudents,
    completedSessions,
    totalActivitiesCompleted,
    totalGamesPlayed,
    totalQuizzesCompleted
  });
});

app.get('/api/researcher/records', (req, res) => {
  const db = loadDatabase();
  const records: any[] = [];

  const studentMap = new Map<string, string>();
  db.students.forEach(s => studentMap.set(s.student_id, s.student_name));

  // Activity attempts
  db.activity_attempts.forEach(a => {
    records.push({
      id: a.attempt_id,
      student_id: a.student_id,
      student_name: studentMap.get(a.student_id) || 'Unknown',
      activity: a.activity_name,
      type: 'Activity',
      score: `${a.score}/${a.total_items} (${a.percentage}%)`,
      time_spent: `${Math.round(a.duration_seconds)}s`,
      status: a.completed ? 'Completed' : 'Started',
      date: a.created_at
    });
  });

  // Game results
  db.game_results.forEach(g => {
    records.push({
      id: g.game_result_id,
      student_id: g.student_id,
      student_name: studentMap.get(g.student_id) || 'Unknown',
      activity: g.game_name,
      type: 'Game',
      score: `${g.score} pts (Lvl ${g.level})`,
      time_spent: `${Math.round(g.duration_seconds)}s`,
      status: g.completed ? 'Completed' : 'Finished',
      date: g.created_at
    });
  });

  // Quiz results
  db.quiz_results.forEach(q => {
    records.push({
      id: q.quiz_id,
      student_id: q.student_id,
      student_name: studentMap.get(q.student_id) || 'Unknown',
      activity: q.quiz_name,
      type: 'Quiz',
      score: `${q.score}/${q.total_questions} (${q.percentage}%)`,
      time_spent: `${Math.round(q.duration_seconds)}s`,
      status: q.completed ? 'Completed' : 'Started',
      date: q.created_at
    });
  });

  records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(records);
});

app.get('/api/researcher/students/:id', (req, res) => {
  const db = loadDatabase();
  const student = db.students.find(s => s.student_id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const attempts = db.activity_attempts.filter(a => a.student_id === student.student_id);
  const games = db.game_results.filter(g => g.student_id === student.student_id);
  const quizzes = db.quiz_results.filter(q => q.student_id === student.student_id);
  const views = db.lesson_views.filter(v => v.student_id === student.student_id);
  const sessions = db.sessions.filter(s => s.student_id === student.student_id);

  const totalLearningTime = sessions.reduce((acc, s) => acc + (s.total_session_time || 0), 0) +
    attempts.reduce((acc, a) => acc + (a.duration_seconds || 0), 0) +
    games.reduce((acc, g) => acc + (g.duration_seconds || 0), 0) +
    quizzes.reduce((acc, q) => acc + (q.duration_seconds || 0), 0);

  const avgQuizScore = quizzes.length
    ? Math.round(quizzes.reduce((acc, q) => acc + q.percentage, 0) / quizzes.length)
    : 0;

  res.json({
    student,
    totalActivities: attempts.length,
    activitiesCompleted: attempts.filter(a => a.completed).length,
    gamesPlayed: games.length,
    quizzesCompleted: quizzes.length,
    averageQuizScore: avgQuizScore,
    totalLearningTimeSeconds: totalLearningTime,
    history: {
      attempts,
      games,
      quizzes,
      views
    }
  });
});

app.get('/api/researcher/analytics', (req, res) => {
  const db = loadDatabase();

  // Aggregate by activity
  const activityStats: Record<string, { totalScorePct: number; totalTime: number; count: number }> = {};
  db.activity_attempts.forEach(a => {
    if (!activityStats[a.activity_name]) {
      activityStats[a.activity_name] = { totalScorePct: 0, totalTime: 0, count: 0 };
    }
    activityStats[a.activity_name].totalScorePct += a.percentage || 0;
    activityStats[a.activity_name].totalTime += a.duration_seconds || 0;
    activityStats[a.activity_name].count += 1;
  });

  const activityBreakdown = Object.entries(activityStats).map(([name, stat]) => ({
    name,
    avgScore: Math.round(stat.totalScorePct / stat.count),
    avgTimeMin: +(stat.totalTime / stat.count / 60).toFixed(1),
    attemptsCount: stat.count
  }));

  // Aggregate by game
  const gameStats: Record<string, { totalScore: number; totalTime: number; count: number }> = {};
  db.game_results.forEach(g => {
    if (!gameStats[g.game_name]) {
      gameStats[g.game_name] = { totalScore: 0, totalTime: 0, count: 0 };
    }
    gameStats[g.game_name].totalScore += g.score || 0;
    gameStats[g.game_name].totalTime += g.duration_seconds || 0;
    gameStats[g.game_name].count += 1;
  });

  const gameBreakdown = Object.entries(gameStats).map(([name, stat]) => ({
    name,
    avgScore: Math.round(stat.totalScore / stat.count),
    avgTimeMin: +(stat.totalTime / stat.count / 60).toFixed(1),
    playedCount: stat.count
  }));

  res.json({
    activityBreakdown,
    gameBreakdown,
    recentLogs: db.activity_logs.slice(0, 50)
  });
});

// AI ASSISTANT BACKEND (Server-side Gemini with resilient failover & comprehensive local knowledge engine)
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return geminiClient;
}

// Comprehensive local knowledge engine for Computer System Installation & Configuration
function getLocalKnowledgeReply(message: string, currentPage: string = 'HOME', currentContext: string = ''): string {
  const lower = message.toLowerCase();

  if (lower.includes('what is cssential') || lower.includes('about cssential')) {
    return 'CSSENTIAL is a One-Click Multi-Intervention Learning Platform for Troubleshooting Computer System Installation and Configuration, designed for students, educators, and technicians. It brings together learning modules, step-by-step demonstrations, interactive activities, troubleshooting exercises, quizzes, 9 educational games, and this AI assistant in one platform.';
  }
  
  if (lower.includes('beep') || lower.includes('post code')) {
    return 'POST Beep Codes are diagnostic signals emitted by the motherboard speaker before video output initializes:\n• 1 Short Beep: Normal successful POST.\n• Continuous Rapid Beeps: Power supply failure or motherboard fault.\n• 1 Long, 2 or 3 Short Beeps: Video adapter (GPU) error or monitor cable disconnected.\n• Repeating Long Beeps: Memory (RAM) error or unseated modules.\n• High-Low Siren Beep: CPU overheating or fan failure.\nConsult your specific motherboard manual (e.g., AMI, Award, Phoenix) for exact vendor definitions.';
  }

  if (lower.includes('ez debug') || lower.includes('debug led')) {
    return 'EZ Debug LEDs are four status lights on modern motherboards that indicate POST progress:\n1. CPU LED: Red indicates missing/unseated CPU, bent socket pins, or unattached 8-pin EPS CPU power cable.\n2. DRAM LED: Amber/Yellow indicates unseated RAM, dirty contacts, or incompatible memory frequency.\n3. VGA LED: White indicates GPU not detected, missing PCIe 6/8-pin power, or monitor cable in motherboard port instead of GPU.\n4. BOOT LED: Green indicates no bootable drive (OS) found.';
  }

  if (lower.includes('ram') || lower.includes('memory') || lower.includes('xmp') || lower.includes('ddr')) {
    return 'RAM (Random Access Memory) Installation & Configuration Best Practices:\n1. Slot Arrangement: On motherboards with 4 DIMM slots, install dual-channel kits in slots A2 and B2 (typically the 2nd and 4th slots from the CPU).\n2. Locking Clips: Align the notch on the memory stick with the socket key, insert evenly, and press down until the side latches click automatically.\n3. BIOS Configuration: After installation, enter BIOS (DEL/F2) and enable XMP (Intel Extreme Memory Profile) or DOCP/EXPO (AMD) to run RAM at its rated frequency instead of baseline JEDEC 2133/2400MHz.\n4. Troubleshooting: If the DRAM LED stays lit, test with one RAM stick in slot A2, or clean copper contacts with 99% isopropyl alcohol.';
  }

  if (lower.includes('thermal paste') || lower.includes('paste') || lower.includes('grease') || lower.includes('compound')) {
    return 'Thermal Paste Application Guidelines:\n1. Purpose: Fills microscopic microscopic air pockets between the CPU integrated heat spreader (IHS) and the heatsink baseplate for maximum thermal conductivity.\n2. Amount: Apply a small pea-sized or grain-of-rice dot in the center of the CPU (or an "X" pattern for larger chips like Threadripper).\n3. Mounting: Lower the heatsink straight down without twisting to prevent air bubbles. Tighten mounting screws in an alternating diagonal pattern (X-pattern) for even contact pressure.\n4. Cleaning: Always clean old thermal paste thoroughly using 90%+ isopropyl alcohol and a lint-free microfiber cloth.';
  }

  if (lower.includes('no signal') || lower.includes('black screen') || lower.includes('display') || lower.includes('no video') || lower.includes('no post')) {
    return 'Troubleshooting a "No Display / Black Screen / No POST" Condition:\n1. Monitor Cable: Ensure HDMI or DisplayPort is plugged directly into the dedicated GPU, NOT into the motherboard video ports (unless your CPU has integrated graphics).\n2. Power Connectors: Confirm both the 24-pin ATX motherboard cable and the 8-pin (4+4) CPU EPS cable in the top left are firmly clicked in.\n3. Reseat RAM: Remove RAM sticks and firmly press back into slots A2 and B2 until the clips latch.\n4. EZ Debug LEDs: Check which LED (CPU, DRAM, VGA, BOOT) remains solid on the motherboard.\n5. Clear CMOS: Disconnect AC power, remove the CR2032 coin cell battery for 5 minutes, or bridge the CLR_CMOS jumper with a screwdriver for 10 seconds to restore factory defaults.';
  }

  if (lower.includes('bios') || lower.includes('uefi') || lower.includes('secure boot') || lower.includes('tpm')) {
    return 'UEFI/BIOS Setup & Configuration:\n• How to Enter: Press and tap the DEL or F2 key repeatedly right after pressing the PC power button.\n• Boot Priority: Move your Windows 10/11 USB installation media to Priority #1 in the Boot Options.\n• SATA Controller: Ensure SATA mode is set to AHCI (Advanced Host Controller Interface), not IDE/Legacy.\n• TPM 2.0 & Secure Boot: Enable AMD fTPM or Intel PTT and enable Secure Boot (Standard Mode) for Windows 11 compatibility.\n• Save & Exit: Always press F10 to save changes and reboot.';
  }

  if (lower.includes('standoff') || lower.includes('short') || lower.includes('grounding') || lower.includes('mounting')) {
    return 'Motherboard Standoffs & Grounding:\n1. Brass Standoffs: Must be screwed into the computer chassis matching ONLY the specific mounting hole pattern of your motherboard (ATX, Micro-ATX, or Mini-ITX).\n2. Short Circuit Warning: An extra standoff installed where the motherboard does NOT have a screw hole will touch exposed circuit solder joints on the bottom of the PCB, creating a dead short that prevents startup or permanently damages the board.\n3. I/O Shield: Ensure metal grounding prongs on the rear I/O shield do not get pushed inside the USB or Ethernet ports during motherboard insertion.';
  }

  if (lower.includes('esd') || lower.includes('static') || lower.includes('wrist strap') || lower.includes('ohs') || lower.includes('safety')) {
    return 'Occupational Health and Safety (OHS) & ESD Prevention:\n1. Anti-Static Protection: Wear an ESD wrist strap connected to an unpainted metal chassis ground, or touch unpainted metal regularly.\n2. Work Area: Never assemble computer hardware on carpet, synthetic fabrics, or bedsheets. Use an anti-static ESD mat on a sturdy wooden bench.\n3. Handling: Hold circuit boards and expansion cards strictly by their edges; avoid touching delicate SMD chips or golden pins.\n4. Power Disconnection: Always switch off and physically unplug the power supply from the wall outlet before touching internal components. Press the case power button once while unplugged to discharge lingering PSU capacitor voltage.';
  }

  if (lower.includes('front panel') || lower.includes('f_panel') || lower.includes('pwr_sw') || lower.includes('power button')) {
    return 'Front Panel Header (F_PANEL) Connections:\nLocated at the bottom right of modern motherboards, typically a 9-pin block:\n• POWER SW (PWR_SW): Connects to the case power switch (polarity does not matter; it is a momentary short).\n• RESET SW: Connects to the case reset button (polarity does not matter).\n• HDD LED: Hard drive activity light (polarity matters: positive [+] wire must match pin 1/positive header mark).\n• POWER LED: Power status light (split into + and - pins).\nTip: If the power button does not work, carefully touch the two PWR_SW pins together with the tip of a flathead screwdriver to test if the motherboard turns on.';
  }

  if (lower.includes('test') || lower.includes('memtest') || lower.includes('prime95') || lower.includes('furmark') || lower.includes('benchmark')) {
    return 'Computer System Verification & Diagnostic Tools:\n• MemTest86: Bootable USB memory diagnostic tool that executes rigorous read/write test patterns to detect failing RAM chips without OS interference.\n• Prime95: CPU stress-testing software that calculates Mersenne primes to detect CPU instability, cache errors, and thermal throttling under 100% load.\n• FurMark: GPU stress test and thermal benchmark to verify graphics card stability, fan curve regulation, and power delivery.\n• HWMonitor / Core Temp: Real-time hardware telemetry monitoring temperatures, clock speeds, and voltage rails (+12V, +5V, +3.3V).\n• Windows Device Manager: Check for any yellow exclamation mark (!) icons indicating missing chipset, audio, or network drivers.';
  }

  if (lower.includes('overheat') || lower.includes('thermal throttling') || lower.includes('fan')) {
    return 'CPU Overheating & Thermal Diagnostics:\n• Normal Idle Temps: 30°C to 45°C.\n• Normal Load Temps: 65°C to 80°C.\n• Overheating Symptoms: Loud fan noise, sudden black screen shutdowns under load, or severe FPS drops (thermal throttling at 95°C-105°C).\n• Fixes: Remove the cooler and check if the transparent protective plastic peel was accidentally left on the cooler copper baseplate! Re-apply thermal paste, verify the CPU_FAN header is plugged in, and confirm cooler mounting screws are firmly tightened.';
  }

  if (lower.includes('comptia') || lower.includes('methodology') || lower.includes('steps to troubleshoot')) {
    return 'CompTIA 6-Step Troubleshooting Methodology:\n1. Identify the problem: Gather information from the user, observe symptoms, check error logs, question obvious causes.\n2. Establish a theory of probable cause: Question the obvious (loose cables, power switches), consider multiple causes.\n3. Test the theory to determine cause: Once theory is confirmed, determine next steps; if disproven, establish a new theory.\n4. Establish a plan of action: Determine potential effects, resolve the problem, implement the solution.\n5. Verify full system functionality: Implement preventive measures to prevent recurrence.\n6. Document findings, actions, and outcomes: Record problem history for future reference and technical knowledge bases.';
  }

  if (lower.includes('play') || lower.includes('games hub') || lower.includes('game')) {
    return 'CSSENTIAL features 9 interactive educational games in the Games Hub:\n1. Sort & Configure: Fast-paced category sorting into baskets.\n2. Code Cracker: Answer technical questions to decipher the security code.\n3. Troubleshooting Search: Locate fault clues across motherboard schematics.\n4. Installation Sequence: Order PC assembly steps chronologically.\n5. Flashcards: Master key computer terms, acronyms, and specs.\n6. Memory Match: Pair hardware components with their functions.\n7. Drag & Drop Parts: Assemble a PC by placing components into their sockets.\n8. Computer System Quiz: 10-question timed technical assessment.\n9. Tech Word Scramble: Unscramble computer hardware terminology.\nClick the 🎮 PLAY button in the Activities tab to start!';
  }

  if (lower.includes('collection') || lower.includes('download') || lower.includes('presentation')) {
    return 'The Collection section contains comprehensive curriculum learning units for Computer System Installation and Configuration. You can click 🖥 PRESENT to launch full interactive visual presentations, download complete lesson handouts in PDF or Word DOCX formats, or click ▶ WATCH to view demonstration video lessons.';
  }

  if (lower.includes('author') || lower.includes('researcher') || lower.includes('who made') || lower.includes('developer')) {
    return 'CSSENTIAL was researched and developed by:\n• Jhon Wesly T. Buban (Lead Developer & System Architect)\n• Juliana Marizh B. Calaputpu (Curriculum Researcher)\n• Charlotte Mae H. Colon (Content Researcher)\n• Precious Lara M. Timoteo (Evaluation & Testing Researcher)';
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('good morning') || lower.includes('good afternoon')) {
    return 'Hello! I am CSSENTIAL AI, your interactive learning assistant for Computer System Installation, Configuration, and Troubleshooting. How can I help you today with hardware assembly, BIOS setup, or diagnostic procedures?';
  }

  return `I am here to help you master Computer System Installation and Configuration! You can ask me about hardware assembly procedures (CPU, RAM, GPU, PSU), UEFI/BIOS configuration, POST beep codes, EZ Debug LEDs, troubleshooting black screens, ESD safety standards, or how to navigate CSSENTIAL's activities and games. What technical concept would you like to explore?`;
}

app.post('/api/gemini/chat', async (req, res) => {
  const { message, history, currentPage, currentContext } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Evaluate local knowledge and anti-cheating rules first
  const localResult = getPlatformAssistanceResponse(message, currentPage, currentContext);

  // STRICT RULE: If asking for direct answers, return immediate academic integrity guidance
  if (localResult.isDirectAnswerDenied) {
    return res.json({ reply: localResult.reply, source: localResult.source });
  }

  const systemInstruction = `You are CSSENTIAL AI, the official "Ask for Assistance" Platform Guide & Learning Tutor for CSSENTIAL (A One-Click Multi-Intervention Platform for Troubleshooting Computer System Installation and Configuration).
Your mission is to help users learn, navigate the website, and master computer technician skills.

CORE PLATFORM KNOWLEDGE:
1. WEBPAGES ON CSSENTIAL:
   - HOME (Web Wall): Central portal, 3-second auto-rotating announcement slider with clickable links and pause/resume, course summary, quick links to topics, featured hardware breakdown, system status.
   - ACTIVITIES: 8 interactive modules (Troubleshooting Scenarios, Problem Identification, Installation Practice, Configuration, System Testing, Fault Diagnosis, Case Study, Quick Quiz) + 🎮 PLAY button for Games Hub.
   - COLLECTION: 6 module lessons with Presentations (🖥 PRESENT - includes interactive 16:9 fullscreen slide deck with downloadable offline .html deck, print/PDF, and Word .doc handouts), Academic Lab Manuals in PDF and Word DOCX formats with 100-point rubrics, and watchable HD Video lectures (▶ WATCH) with in-player video upload/embed capabilities.
   - GAMES HUB: 11 educational games (Virtual PC Lab Simulator, Cable & Pinout Master, Sort & Configure, Code Cracker, Troubleshooting Search, Installation Sequence, Flashcards, Memory Match, Drag & Drop Parts, Computer Quiz, Tech Word Scramble) with real-time scoring and transcript logging.
   - QUIZZES: Formative and summative assessments testing CSIC competencies with automated scoring.
   - ABOUT US: Research background, academic study details, developer credits (Jhon Wesly T. Buban, Juliana Marizh B. Calaputpu, Charlotte Mae H. Colon, Precious Lara M. Timoteo). Strictly never mention anyone else.
   - RESEARCHER DASHBOARD: Password-gated admin console (CSSENTIAL2026) for monitoring student metrics, viewing attempt logs, exporting grades, creating/editing/deleting announcements with optional images and links, uploading custom laboratory demonstration videos, and managing automated data retention & cleanup.
   - THEME SELECTOR: Palette customizer offering standard color variations, beautiful gradient presets, and a custom 2-color gradient designer with angle controls.

2. VIRTUAL PC LAB SIMULATOR (10-STAGE HANDS-ON INTERACTIVE LAB):
   - Stage 1: ESD Safety (Equip anti-static wrist strap and grounded ESD mat).
   - Stage 2: CPU Installation (Align gold Pin 1 corner triangle with socket notch, lower ZIF lever).
   - Stage 3: Thermal Interface Material (Apply pea-sized dot of thermal paste to center of CPU IHS).
   - Stage 4: CPU Cooler Installation (Align heatsink, tighten cross pattern, connect 4-pin PWM to CPU_FAN).
   - Stage 5: Dual-Channel RAM Installation (Seat modules firmly into slots A2 and B2 until latches click).
   - Stage 6: Motherboard Mounting (Install brass standoffs to prevent short circuits, screw in ATX board).
   - Stage 7: High-Speed NVMe M.2 SSD Installation (Insert at 30° angle, push down, fasten tiny screw).
   - Stage 8: Power Supply Unit & Wiring (Mount 750W PSU in basement shroud, connect 24-pin ATX, 8-pin EPS, PCIe).
   - Stage 9: Dedicated Graphics Card (GPU) (Seat into primary PCIe 4.0 x16 slot, plug 8-pin PCIe power).
   - Stage 10: UEFI/BIOS Configuration & Boot Setup (Enter BIOS with DEL/F2, enable XMP/DOCP, set SATA to AHCI, verify boot drive).

3. CURRICULUM TOPICS (6 COMPETENCIES):
   - Topic 1: Preparing for Installation (Safety, OHS, ESD precautions, anti-static wrist strap, tools).
   - Topic 2: Hardware Identification & System Assembly (Motherboard, CPU zero-insertion-force, RAM dual-channel slots A2/B2, GPU PCIe x16, brass standoffs to prevent shorts, thermal paste pea-sized dot).
   - Topic 3: Cable Routing & Power Connections (24-pin ATX, 8-pin EPS CPU, PCIe power, SATA, front panel headers PWR_SW/RESET_SW).
   - Topic 4: UEFI/BIOS Configuration & Boot Setup (DEL/F2, boot priority order, AHCI mode, XMP/DOCP profiles, TPM 2.0, Secure Boot).
   - Topic 5: Operating System Deployment & Partitioning (Clean Windows install, GPT vs MBR, UEFI bootable media, driver installation).
   - Topic 6: System Diagnostics, Testing & Troubleshooting (CompTIA 6-step method, POST beep codes, EZ Debug LEDs, MemTest86, Prime95, FurMark, resolving black screen/no POST).

4. HOW TO PLAY THE 11 EDUCATIONAL GAMES:
   - Virtual PC Lab Simulator: Realistic 10-stage physical PC build and UEFI setup simulator.
   - Cable & Pinout Master: Match 24-pin ATX, 8-pin EPS, PCIe, and front panel headers.
   - Sort & Configure: Fast-paced category classification into Input, Output, Storage, Processing, and Safety bins.
   - Code Cracker: Answer technical diagnostic questions to decrypt the terminal passcode.
   - Troubleshooting Search: Inspect a motherboard workbench schematic and click the fault area.
   - Installation Sequence: Arrange PC assembly milestone cards into their exact chronological order.
   - Technical Flashcards: Flip cards to master hardware acronyms, port bandwidths, and specs.
   - Memory Match: Flip cards to pair hardware components with their functions.
   - Drag & Drop PC Parts: Drag components from the bench into their chassis sockets.
   - Computer System Quiz: 10-question timed technical speed challenge.
   - Tech Word Scramble: Unscramble letter tiles to reveal computer terms.

CRITICAL EDUCATIONAL & ACADEMIC INTEGRITY RULES:
- NEVER give direct answers, solution keys, or multiple-choice letters to any quiz, exam, activity, or puzzle!
- If a user asks "what is the answer", decline politely and explain the underlying diagnostic reasoning, technical principle, or procedural concept so the student learns and solves it themselves.
- When explaining navigation or procedures, give clear, numbered steps.
- Current student context: Currently on page "${currentPage || 'HOME'}" with context "${currentContext || 'General'}".
- Maintain an encouraging, friendly, and pedagogically sound tone.`;

  // First try with primary models, then with fallback alias
  const ai = getGeminiClient();
  if (ai) {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-pro'];
    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            { role: 'user', parts: [{ text: message }] }
          ],
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7
          }
        });

        const reply = response.text;
        if (reply && reply.trim()) {
          return res.json({ reply, source: `gemini-${modelName}` });
        }
      } catch (err: any) {
        console.info(`Gemini model ${modelName} unavailable (${err?.status || err?.code || 'demand-spike'}), evaluating alternate...`);
      }
    }
  }

  // Seamless fallback to comprehensive local domain knowledge engine
  return res.json({ reply: localResult.reply, source: localResult.source });
});

// START SERVER WITH VITE INTEGRATION
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CSSENTIAL server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
