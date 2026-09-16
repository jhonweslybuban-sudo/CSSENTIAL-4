import 'dotenv/config';
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
  branding?: any;
  researchers?: any[];
  chat_messages?: any[];
  teacher_activities?: any[];
  teacher_materials?: any[];
  collection_videos?: any[];
  users?: any[];
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

  const defaultVideos: any[] = [];

  return {
    students: realStudents,
    sessions: validSessions,
    activity_attempts: validAttempts,
    quiz_results: validQuizzes,
    game_results: validGames,
    lesson_views: validViews,
    ai_usage: validAiUsage,
    activity_logs: validLogs,
    announcements: data.announcements || [],
    branding: data.branding || null,
    researchers: data.researchers || null,
    chat_messages: data.chat_messages || [],
    teacher_activities: data.teacher_activities || [],
    teacher_materials: data.teacher_materials || [],
    collection_videos: (data.collection_videos || []).filter(v => 
      !['vid-1', 'vid-2', 'vid-3'].includes(v.id) && 
      ![2, 4, 6].includes(Number(v.topicNumber))
    ),
    users: data.users || []
  };
}

function loadDatabase(): DatabaseSchema {
  const defaultVideos: any[] = [];

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      students: [],
      sessions: [],
      activity_attempts: [],
      quiz_results: [],
      game_results: [],
      lesson_views: [],
      ai_usage: [],
      activity_logs: [],
      announcements: [],
      branding: null,
      researchers: null,
      chat_messages: [
        {
          id: 'msg_welcome_1',
          student_id: 'inst_faculty_1',
          student_name: 'Engr. Jhon Wesly Buban',
          year_section: 'Faculty / Lead Architect',
          text: 'Welcome to the CSSENTIAL Community Forum! Feel free to ask questions about Computer System Installation and Configuration, share lab discoveries, and assist your fellow classmates.',
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          is_instructor: true,
          report_count: 0
        },
        {
          id: 'msg_welcome_2',
          student_id: 'std_welcome_2',
          student_name: 'Juliana Calapputu',
          year_section: 'BSIT 3-A',
          text: 'Don\'t forget to practice in the Virtual PC Lab Simulator before taking the summative assessment quiz! The dual-channel RAM and standoff placement steps are essential.',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          is_instructor: false,
          report_count: 0
        }
      ],
      teacher_activities: [],
      teacher_materials: [],
      collection_videos: defaultVideos
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

// AUTHENTICATION: SIGN UP & LOG IN (STUDENT & INSTRUCTOR)
app.post('/api/auth/register', (req, res) => {
  const { role, name, tup_id, department, password } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Full name is required' });
  }
  if (!password || typeof password !== 'string' || !password.trim()) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const cleanName = name.trim();
  const cleanRole = role === 'INSTRUCTOR' ? 'INSTRUCTOR' : 'STUDENT';
  const cleanPassword = password.trim();

  const db = loadDatabase();
  db.users = db.users || [];

  const now = new Date().toISOString();

  if (cleanRole === 'STUDENT') {
    if (!tup_id || typeof tup_id !== 'string' || !tup_id.trim()) {
      return res.status(400).json({ error: 'TUP ID is required (e.g. TUPM-21-1234)' });
    }
    const cleanTupId = tup_id.trim().toUpperCase();
    const existing = db.users.find(u => u.role === 'STUDENT' && (u.tup_id === cleanTupId || u.id === cleanTupId));
    if (existing) {
      return res.status(400).json({ error: `An account with TUP ID "${cleanTupId}" already exists. Please log in instead.` });
    }

    const newUser = {
      id: cleanTupId,
      role: 'STUDENT',
      name: cleanName,
      tup_id: cleanTupId,
      password: cleanPassword,
      created_at: now,
      last_active: now
    };
    db.users.push(newUser);

    // Link into students array for telemetry and progress tracking
    let student = db.students.find(s => s.student_id === cleanTupId || s.student_name.toLowerCase() === cleanName.toLowerCase());
    if (!student) {
      student = {
        student_id: cleanTupId,
        student_name: cleanName,
        year_section: 'TUP Student',
        created_at: now,
        last_active: now,
        referral_source: 'Sign Up',
        is_github_referral: false
      };
      db.students.push(student);
    } else {
      student.student_id = cleanTupId;
      student.student_name = cleanName;
      student.last_active = now;
    }
    saveDatabase(db);

    return res.json({
      success: true,
      user: {
        student_id: cleanTupId,
        name: cleanName,
        role: 'STUDENT',
        tup_id: cleanTupId,
        year_section: student.year_section || 'TUP Student',
        created_at: newUser.created_at,
        last_active: newUser.last_active
      }
    });
  } else {
    // INSTRUCTOR REGISTRATION
    if (!department || typeof department !== 'string' || !department.trim()) {
      return res.status(400).json({ error: 'Department is required for instructor sign up' });
    }
    const cleanDept = department.trim();
    const existing = db.users.find(u => u.role === 'INSTRUCTOR' && u.name.toLowerCase() === cleanName.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: `An instructor account for "${cleanName}" already exists. Please log in instead.` });
    }

    const instructorId = `INST-${Date.now().toString().slice(-6)}`;
    const newUser = {
      id: instructorId,
      role: 'INSTRUCTOR',
      name: cleanName,
      department: cleanDept,
      password: cleanPassword,
      created_at: now,
      last_active: now
    };
    db.users.push(newUser);
    saveDatabase(db);

    return res.json({
      success: true,
      user: {
        student_id: instructorId,
        name: cleanName,
        role: 'INSTRUCTOR',
        department: cleanDept,
        year_section: cleanDept,
        created_at: newUser.created_at,
        last_active: newUser.last_active
      }
    });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { role, identifier, password } = req.body;
  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    return res.status(400).json({ error: 'Please enter your TUP ID or Name' });
  }
  if (!password || typeof password !== 'string' || !password.trim()) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const cleanRole = role === 'INSTRUCTOR' ? 'INSTRUCTOR' : 'STUDENT';
  const cleanId = identifier.trim();
  const cleanPassword = password.trim();

  const db = loadDatabase();
  db.users = db.users || [];

  let user;
  if (cleanRole === 'STUDENT') {
    user = db.users.find(u =>
      u.role === 'STUDENT' &&
      ((u.tup_id && u.tup_id.toUpperCase() === cleanId.toUpperCase()) ||
       (u.id && u.id.toUpperCase() === cleanId.toUpperCase()) ||
       (u.name && u.name.toLowerCase() === cleanId.toLowerCase()))
    );
  } else {
    user = db.users.find(u =>
      u.role === 'INSTRUCTOR' &&
      ((u.name && u.name.toLowerCase() === cleanId.toLowerCase()) ||
       (u.department && u.department.toLowerCase() === cleanId.toLowerCase()) ||
       (u.id && u.id === cleanId))
    );
  }

  if (!user) {
    return res.status(401).json({
      error: cleanRole === 'STUDENT'
        ? `No student account found for "${cleanId}". Please check your TUP ID or sign up.`
        : `No instructor account found for "${cleanId}". Please check your name or sign up.`
    });
  }

  if (user.password !== cleanPassword) {
    return res.status(401).json({ error: 'Incorrect password. Please try again.' });
  }

  user.last_active = new Date().toISOString();
  saveDatabase(db);

  return res.json({
    success: true,
    user: {
      student_id: user.tup_id || user.id,
      name: user.name,
      role: user.role,
      tup_id: user.tup_id,
      department: user.department,
      year_section: user.department || 'TUP Student',
      created_at: user.created_at,
      last_active: user.last_active
    }
  });
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

// Branding Endpoints (Logo, Site Title, Subtitle)
app.get('/api/branding', (req, res) => {
  const db = loadDatabase();
  res.json(db.branding || null);
});

app.post('/api/branding', (req, res) => {
  const { logoUrl, siteTitle, siteSubtitle } = req.body;
  const db = loadDatabase();
  db.branding = {
    logoUrl: logoUrl !== undefined ? logoUrl : (db.branding?.logoUrl || null),
    siteTitle: siteTitle !== undefined ? siteTitle : (db.branding?.siteTitle || 'CSSENTIAL'),
    siteSubtitle: siteSubtitle !== undefined ? siteSubtitle : (db.branding?.siteSubtitle || 'A One-Click Multi-Intervention Platform for Troubleshooting Computer System Installation and Configuration')
  };
  saveDatabase(db);
  res.json({ success: true, branding: db.branding });
});

// Researchers Profile Endpoints (Images, descriptions, tags, roles)
app.get('/api/researchers', (req, res) => {
  const db = loadDatabase();
  res.json(db.researchers || null);
});

app.post('/api/researchers', (req, res) => {
  const { researchers } = req.body;
  if (Array.isArray(researchers)) {
    const db = loadDatabase();
    db.researchers = researchers;
    saveDatabase(db);
    return res.json({ success: true, researchers: db.researchers });
  }
  res.status(400).json({ error: 'Array of researchers expected' });
});

// ==========================================
// 1. VIDEOS FOR COLLECTION MANAGEMENT
// ==========================================
app.get('/api/videos', (req, res) => {
  const db = loadDatabase();
  res.json(db.collection_videos || []);
});

app.post('/api/videos', (req, res) => {
  const { title, description, url, thumbnail, duration, topicNumber, instructor } = req.body;
  if (!title || !url) {
    return res.status(400).json({ error: 'Title and Video URL are required' });
  }
  const db = loadDatabase();
  if (!db.collection_videos) db.collection_videos = [];

  const newVideo = {
    id: req.body.id || `vid_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    title: title.trim(),
    description: (description || '').trim(),
    url: url.trim(),
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80',
    duration: duration || '10:00',
    topicNumber: topicNumber ? Number(topicNumber) : 1,
    instructor: instructor || 'CSSENTIAL Instructor',
    created_at: new Date().toISOString()
  };

  const existingIdx = db.collection_videos.findIndex(v => v.id === newVideo.id);
  if (existingIdx >= 0) {
    db.collection_videos[existingIdx] = { ...db.collection_videos[existingIdx], ...newVideo };
  } else {
    db.collection_videos.push(newVideo);
  }

  saveDatabase(db);
  res.json({ success: true, video: newVideo });
});

app.delete('/api/videos/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDatabase();
  if (db.collection_videos) {
    db.collection_videos = db.collection_videos.filter(v => v.id !== id);
    saveDatabase(db);
  }
  res.json({ success: true, deletedId: id });
});

// ==========================================
// 2. COMMUNITY CHATBOX (STUDENT & MODERATION)
// ==========================================
app.get('/api/chat/messages', (req, res) => {
  const db = loadDatabase();
  res.json(db.chat_messages || []);
});

app.post('/api/chat/messages', (req, res) => {
  const { student_id, student_name, year_section, text, is_instructor } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text cannot be empty' });
  }

  const db = loadDatabase();
  if (!db.chat_messages) db.chat_messages = [];

  const message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    student_id: student_id || 'STU-GUEST',
    student_name: (student_name || 'Anonymous Student').trim(),
    year_section: (year_section || 'General Section').trim(),
    text: text.trim().slice(0, 500),
    timestamp: new Date().toISOString(),
    is_instructor: Boolean(is_instructor),
    report_count: 0
  };

  db.chat_messages.push(message);
  // Keep last 300 messages
  if (db.chat_messages.length > 300) {
    db.chat_messages = db.chat_messages.slice(-300);
  }

  saveDatabase(db);
  res.json(message);
});

app.post('/api/chat/messages/:id/report', (req, res) => {
  const { id } = req.params;
  const db = loadDatabase();
  if (db.chat_messages) {
    const msg = db.chat_messages.find(m => m.id === id);
    if (msg) {
      msg.report_count = (msg.report_count || 0) + 1;
      saveDatabase(db);
      return res.json({ success: true, report_count: msg.report_count });
    }
  }
  res.status(404).json({ error: 'Message not found' });
});

app.delete('/api/chat/messages/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDatabase();
  if (db.chat_messages) {
    db.chat_messages = db.chat_messages.filter(m => m.id !== id);
    saveDatabase(db);
  }
  res.json({ success: true, deletedId: id });
});

// ==========================================
// 3. TEACHER / PROFESSOR CONTENT MANAGEMENT
// ==========================================
app.get('/api/teacher/activities', (req, res) => {
  const db = loadDatabase();
  if (!db.teacher_activities || db.teacher_activities.length === 0) {
    db.teacher_activities = [
      {
        id: 'tact_seed_diagnostic_1',
        title: 'Faculty Diagnostic: Motherboard Power & Short Circuit Analysis',
        description: 'Comprehensive diagnostic evaluation on motherboard standoff isolation, 24-pin ATX voltage tolerances, and short-circuit troubleshooting authored by faculty.',
        category: 'Hardware Diagnostic',
        difficulty: 'Intermediate',
        is_published: true,
        created_by: 'Engr. Jhon Wesly T. Buban (Lead Researcher)',
        created_at: new Date().toISOString(),
        questions: [
          {
            question: 'During a bench assembly, the system turns on for half a second, the CPU fan spins momentarily, and then power cuts off immediately. What is the most likely electrical safety cause?',
            options: [
              'A chassis standoff is making contact with an exposed solder joint on the bottom of the motherboard, triggering PSU short-circuit protection (SCP)',
              'The SATA cable is plugged into SATA port 2 instead of SATA port 1',
              'The monitor HDMI cable is defective',
              'The BIOS battery has run out of charge'
            ],
            correct: 0,
            explanation: 'Modern power supplies feature Short Circuit Protection (SCP). If an extra standoff touches a solder point on the motherboard, it creates a direct dead short to chassis ground, forcing the PSU to cut power instantly to protect components from permanent damage.'
          },
          {
            question: 'When measuring the 24-pin ATX main power connector with a digital multimeter, what is the acceptable voltage tolerance range for the +12V rail according to ATX specifications?',
            options: [
              '+11.40V to +12.60V (±5% tolerance)',
              '+9.00V to +15.00V (±25% tolerance)',
              '+10.00V to +14.00V (±15% tolerance)',
              'Exactly 12.000V with 0% tolerance'
            ],
            correct: 0,
            explanation: 'The standard ATX power specification requires standard voltage rails (+12V, +5V, +3.3V) to remain within ±5% tolerance under both idle and full load.'
          },
          {
            question: 'Which motherboard component stores the hardware configuration settings and date/time when AC power is completely disconnected from the power supply?',
            options: [
              'Non-volatile CMOS chip powered by a 3V CR2032 lithium coin-cell battery',
              'The CPU Level 3 Cache',
              'The primary DDR4/DDR5 system memory module in slot A2',
              'The NVMe M.2 Solid State Drive'
            ],
            correct: 0,
            explanation: 'The complementary metal-oxide-semiconductor (CMOS) chip or NVRAM retains BIOS setup variables and system clock time via a 3-volt CR2032 coin-cell battery.'
          }
        ]
      }
    ];
    saveDatabase(db);
  }
  res.json(db.teacher_activities || []);
});

app.post('/api/teacher/activities', (req, res) => {
  const { id, title, description, category, difficulty, questions, is_published, created_by } = req.body;
  if (!title || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Title and at least one question are required' });
  }

  const db = loadDatabase();
  if (!db.teacher_activities) db.teacher_activities = [];

  const activity = {
    id: id || `tact_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    title: title.trim(),
    description: (description || '').trim(),
    category: category || 'Teacher Assessment',
    difficulty: difficulty || 'Intermediate',
    questions: questions,
    is_published: is_published !== undefined ? Boolean(is_published) : true,
    created_by: created_by || 'Professor / Instructor',
    created_at: new Date().toISOString()
  };

  const existingIdx = db.teacher_activities.findIndex(a => a.id === activity.id);
  if (existingIdx >= 0) {
    db.teacher_activities[existingIdx] = { ...db.teacher_activities[existingIdx], ...activity };
  } else {
    db.teacher_activities.unshift(activity);
  }

  saveDatabase(db);
  res.json({ success: true, activity });
});

app.delete('/api/teacher/activities/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDatabase();
  if (db.teacher_activities) {
    db.teacher_activities = db.teacher_activities.filter(a => a.id !== id);
    saveDatabase(db);
  }
  res.json({ success: true, deletedId: id });
});

app.get('/api/teacher/materials', (req, res) => {
  const db = loadDatabase();
  if (!db.teacher_materials || db.teacher_materials.length === 0) {
    db.teacher_materials = [
      {
        id: 'mat_seed_curriculum_1',
        title: 'Laboratory Protocol: Safe Component Handling and ESD Protocols',
        topicNumber: 1,
        description: 'Faculty guide covering Occupational Health and Safety (OHS), static dissipation, and personal protective equipment.',
        content: 'Comprehensive laboratory handout detailing proper wrist strap connection to bare chassis metal, avoiding carpeted floors, handling expansion cards strictly by PCB edges, and testing PSU voltages.',
        is_published: true,
        instructor: 'CSSENTIAL Faculty Research Team',
        created_at: new Date().toISOString()
      }
    ];
    saveDatabase(db);
  }
  res.json(db.teacher_materials || []);
});

app.post('/api/teacher/materials', (req, res) => {
  const { id, title, topicNumber, description, content, file_url, is_published, instructor } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const db = loadDatabase();
  if (!db.teacher_materials) db.teacher_materials = [];

  const material = {
    id: id || `mat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    title: title.trim(),
    topicNumber: topicNumber ? Number(topicNumber) : 1,
    description: description.trim(),
    content: (content || '').trim(),
    file_url: file_url || null,
    is_published: is_published !== undefined ? Boolean(is_published) : true,
    instructor: instructor || 'Faculty Member',
    created_at: new Date().toISOString()
  };

  const existingIdx = db.teacher_materials.findIndex(m => m.id === material.id);
  if (existingIdx >= 0) {
    db.teacher_materials[existingIdx] = { ...db.teacher_materials[existingIdx], ...material };
  } else {
    db.teacher_materials.unshift(material);
  }

  saveDatabase(db);
  res.json({ success: true, material });
});

app.delete('/api/teacher/materials/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDatabase();
  if (db.teacher_materials) {
    db.teacher_materials = db.teacher_materials.filter(m => m.id !== id);
    saveDatabase(db);
  }
  res.json({ success: true, deletedId: id });
});

// ==========================================
// 4. AUTOMATIC CERTIFICATION STATUS
// ==========================================
app.get('/api/certificate/status/:studentId', (req, res) => {
  const { studentId } = req.params;
  const db = loadDatabase();
  const student = db.students.find(s => s.student_id === studentId);

  const allAttempts = (db.activity_attempts || []).filter(a => a.student_id === studentId && a.completed);
  const allQuizzes = (db.quiz_results || []).filter(q => q.student_id === studentId && q.completed);
  const allGames = (db.game_results || []).filter(g => g.student_id === studentId && g.completed);

  // Filter only attempts, quizzes, and games where the student scored at least half (50% or higher)
  const passedAttempts = allAttempts.filter(a => {
    const pct = a.percentage ?? (a.total_items ? (a.score / a.total_items) * 100 : 0);
    return pct >= 50;
  });

  const passedQuizzes = allQuizzes.filter(q => {
    const pct = q.percentage ?? (q.total_questions ? (q.score / q.total_questions) * 100 : 0);
    return pct >= 50;
  });

  const passedGames = allGames.filter(g => {
    if (g.extra_stats?.percentage !== undefined) return g.extra_stats.percentage >= 50;
    return (g.score || 0) > 0;
  });

  const pcLabPassed = allAttempts.some(a => {
    const isLab = a.activity_name?.toLowerCase().includes('virtual pc lab') || a.activity_name?.toLowerCase().includes('pc build');
    const pct = a.percentage ?? (a.total_items ? (a.score / a.total_items) * 100 : 0);
    return isLab && (pct >= 50 || a.score > 0);
  });

  // Calculate scores
  const allScores = [
    ...allAttempts.map(a => a.percentage ?? (a.total_items ? Math.round((a.score / a.total_items) * 100) : 0)),
    ...allQuizzes.map(q => q.percentage ?? (q.total_questions ? Math.round((q.score / q.total_questions) * 100) : 0))
  ];

  const averageScore = allScores.length > 0
    ? Math.round(allScores.reduce((acc, curr) => acc + curr, 0) / allScores.length)
    : 0;

  const highestScore = allScores.length > 0 ? Math.max(...allScores) : 0;
  const hasPassingScore = (passedAttempts.length > 0 || passedQuizzes.length > 0) && (averageScore >= 50 || highestScore >= 50);

  // Qualification Rule: Must have achieved at least half the score (50% and up) on assessments
  // AND met at least one completion pathway:
  // - 2 activities passed with >=50%
  // - 1 quiz passed with >=50%
  // - 1 activity passed with >=50% AND 1 game completed
  // - Virtual PC Lab passed with >=50%
  const isEligible = hasPassingScore && (
    (passedAttempts.length >= 2) ||
    (passedQuizzes.length >= 1) ||
    (passedAttempts.length >= 1 && passedGames.length >= 1) ||
    pcLabPassed ||
    (passedQuizzes.length >= 1 && passedGames.length >= 1)
  );

  res.json({
    student_id: studentId,
    student_name: student ? student.student_name : 'Student',
    year_section: student ? student.year_section : 'General Section',
    isEligible,
    stats: {
      activitiesCount: passedAttempts.length,
      quizzesCount: passedQuizzes.length,
      gamesCount: passedGames.length,
      pcLabPassed,
      averageScore,
      highestScore,
      hasPassingScore,
      minScoreRequired: 50
    },
    certificate_id: `CERT-CSS-2026-${(studentId || 'GEN').slice(-6).toUpperCase()}`
  });
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
    return 'CSSENTIAL was researched and developed by:\n• Jhon Wesly T. Buban (Lead Developer & System Architect)\n• Juliana Marizh B. Calapputu (Curriculum Researcher)\n• Charlotte Mae H. Colon (Content Researcher)\n• Precious Lara M. Timoteo (Evaluation & Testing Researcher)';
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('good morning') || lower.includes('good afternoon')) {
    return 'Hello! I am CSSENTIAL AI, your interactive learning assistant for Computer System Installation, Configuration, and Troubleshooting. How can I help you today with hardware assembly, BIOS setup, or diagnostic procedures?';
  }

  return `Here is helpful technical advice on "${message}":
Computer systems require systematic diagnosis and precise configuration. Whether dealing with processor sockets, memory architecture (such as dual-channel A2/B2 placement), UEFI firmware, power rails, or OS deployment, always verify power delivery and physical seating first.
• Diagnostic tip: Check POST codes and motherboard EZ Debug LEDs (CPU, DRAM, VGA, BOOT) to quickly isolate hardware faults.
• Safety precaution: Always unplug AC power from the wall and wear an ESD grounding wrist strap before servicing internal components.
What specific hardware component or diagnostic symptom would you like to explore in detail?`;
}

app.post('/api/gemini/chat', async (req, res) => {
  const { message, history, currentPage, currentContext } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const systemInstruction = `You are ASK CSSENTIAL, an expert technical assistant, learning mentor, and guide for Computer Systems, PC Hardware, Installation, Configuration, Diagnostics, Troubleshooting, and the CSSENTIAL platform.

PRIMARY DIRECTIVES:
1. ANSWER EVERY QUESTION THOROUGHLY:
   - Answer every single question asked by the student across all domains: computer hardware, PC assembly, CPU, GPU, RAM, Motherboard, PSU, Storage, BIOS/UEFI, operating systems, networking, electronics, diagnostic tools, safety protocols, troubleshooting methodology, computing concepts, and CSSENTIAL platform features.
   - Never give a blank refusal, unhelpful repetition, or say you cannot answer general knowledge questions.

2. PRESERVE ACADEMIC INTEGRITY (QUIZZES, EXAMS & GRADED ACTIVITIES):
   - When a student asks for direct answers, answer keys, solution keys, or multiple-choice letters (e.g., "What is the answer to question 3?", "Is it A or B?", "Give me the answer to the quiz"):
     - DO NOT provide the direct multiple-choice letter (e.g. "Choose option B") or verbatim answer key!
     - INSTEAD: Explicitly remind them that you cannot provide direct answer keys to preserve academic integrity, BUT THEN IMMEDIATELY provide a comprehensive pedagogical explanation of the underlying hardware concept, technical principles, diagnostic clues, or procedure so the student understands the topic and can deduce the correct answer on their own.
   - For ANY general question or troubleshooting scenario that is NOT a direct quiz answer request (e.g., "Why won't my PC turn on?", "What is thermal paste?", "How do I configure BIOS?"), answer directly, thoroughly, and helpfully.

3. COMMUNICATION STYLE:
   - Friendly, clear, encouraging, and technically rigorous.
   - Use structured formatting, bullet points, and numbered steps for clarity.
   - Always mention relevant safety precautions (e.g., disconnecting power, grounding against ESD) when discussing physical hardware tasks.

4. PLATFORM CONTEXT:
   - CSSENTIAL Webpages: HOME (announcements slider), ACTIVITIES (diagnostic modules), COLLECTION (presentations, lab manuals in PDF/DOCX, videos), GAMES HUB (11 interactive games including Virtual PC Lab Simulator, Cable & Pinout Master, Code Cracker, etc.), QUIZZES, ABOUT US (Developers: Jhon Wesly T. Buban, Juliana Marizh B. Calapputu, Charlotte Mae H. Colon, Precious Lara M. Timoteo), and RESEARCHER DASHBOARD.
   - Current student view: "${currentPage || 'HOME'}" with context "${currentContext || 'General'}".`;

  // Try calling Gemini models with a healthy 25-second timeout
  const ai = getGeminiClient();
  if (ai) {
    const modelsToTry = [
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-flash-lite-latest',
      'gemini-3.6-flash'
    ];
    
    // Format conversation history for Gemini
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-6)) {
        const role = (h.sender === 'bot' || h.role === 'model' || h.role === 'assistant') ? 'model' : 'user';
        const txt = h.text || (Array.isArray(h.parts) ? h.parts[0]?.text : '');
        if (txt) {
          contents.push({ role, parts: [{ text: String(txt) }] });
        }
      }
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    for (const modelName of modelsToTry) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI response timeout')), 25000)
        );

        const apiPromise = ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7
          }
        });

        const response: any = await Promise.race([apiPromise, timeoutPromise]);

        const reply = response?.text;
        if (reply && reply.trim()) {
          return res.json({ reply, source: 'CSSENTIAL Assistant' });
        }
      } catch (err: any) {
        console.info(`Model ${modelName} call issue or timeout:`, err?.status || err?.code || err?.message || 'switch-to-next');
      }
    }
  }

  // Resilient fallback to dynamic local knowledge engine
  const dynamicReply = getLocalKnowledgeReply(message, currentPage, currentContext);
  return res.json({ reply: dynamicReply, source: 'CSSENTIAL Assistant' });
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
