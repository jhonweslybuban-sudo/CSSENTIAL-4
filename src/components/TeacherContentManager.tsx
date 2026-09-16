import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Trash2,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  FileText,
  Upload,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { TeacherActivity, TeacherMaterial, TeacherActivityQuestion } from '../types';

interface TeacherContentManagerProps {
  initialTab?: 'ACTIVITIES' | 'MATERIALS';
  onClose?: () => void;
  isModal?: boolean;
}

export const TeacherContentManager: React.FC<TeacherContentManagerProps> = ({
  initialTab = 'ACTIVITIES',
  onClose,
  isModal = false
}) => {
  const [subTab, setSubTab] = useState<'ACTIVITIES' | 'MATERIALS'>(initialTab);
  
  // Activities state
  const [activities, setActivities] = useState<TeacherActivity[]>([]);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityDesc, setNewActivityDesc] = useState('');
  const [newActivityCategory, setNewActivityCategory] = useState('Hardware Diagnostics');
  const [newActivityDifficulty, setNewActivityDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [questions, setQuestions] = useState<TeacherActivityQuestion[]>([
    {
      question: '',
      options: ['', '', '', ''],
      correct: 0,
      explanation: ''
    }
  ]);

  // Materials state
  const [materials, setMaterials] = useState<TeacherMaterial[]>([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatTopic, setNewMatTopic] = useState(1);
  const [newMatDesc, setNewMatDesc] = useState('');
  const [newMatContent, setNewMatContent] = useState('');
  const [newMatFileUrl, setNewMatFileUrl] = useState('');

  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [acts, mats] = await Promise.all([
        api.getTeacherActivities(),
        api.getTeacherMaterials()
      ]);
      setActivities(acts);
      setMaterials(mats);
    } catch (err) {
      console.error('Error loading teacher content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (initialTab) {
      setSubTab(initialTab);
    }
  }, [initialTab]);

  const showFeedback = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // Question helpers
  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      { question: '', options: ['', '', '', ''], correct: 0, explanation: '' }
    ]);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const updateQuestionText = (idx: number, val: string) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[idx].question = val;
      return copy;
    });
  };

  const updateQuestionOption = (qIdx: number, optIdx: number, val: string) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIdx].options[optIdx] = val;
      return copy;
    });
  };

  const updateQuestionCorrect = (qIdx: number, optIdx: number) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIdx].correct = optIdx;
      return copy;
    });
  };

  const updateQuestionExplanation = (qIdx: number, val: string) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIdx].explanation = val;
      return copy;
    });
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityTitle.trim()) return;

    // Filter valid questions
    const validQuestions = questions.filter(q => q.question.trim().length > 0);
    if (validQuestions.length === 0) {
      alert('Please add at least one complete question with options.');
      return;
    }

    try {
      const created = await api.saveTeacherActivity({
        title: newActivityTitle.trim(),
        description: newActivityDesc.trim(),
        category: newActivityCategory,
        difficulty: newActivityDifficulty,
        questions: validQuestions,
        is_published: true
      });

      setActivities(prev => [created, ...prev]);
      setShowActivityModal(false);
      setNewActivityTitle('');
      setNewActivityDesc('');
      setQuestions([{ question: '', options: ['', '', '', ''], correct: 0, explanation: '' }]);
      showFeedback(`Custom Instructor Activity "${created.title}" successfully created and published.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Are you sure you want to remove this activity?')) return;
    await api.deleteTeacherActivity(id);
    setActivities(prev => prev.filter(a => a.id !== id));
    showFeedback('Activity removed successfully.');
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatTitle.trim()) return;

    try {
      const created = await api.saveTeacherMaterial({
        title: newMatTitle.trim(),
        topicNumber: Number(newMatTopic),
        description: newMatDesc.trim(),
        content: newMatContent.trim(),
        file_url: newMatFileUrl.trim() || undefined,
        is_published: true
      });

      setMaterials(prev => [created, ...prev]);
      setShowMaterialModal(false);
      setNewMatTitle('');
      setNewMatDesc('');
      setNewMatContent('');
      setNewMatFileUrl('');
      showFeedback(`Teacher Reference Material "${created.title}" uploaded and published.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Are you sure you want to remove this material?')) return;
    await api.deleteTeacherMaterial(id);
    setMaterials(prev => prev.filter(m => m.id !== id));
    showFeedback('Course material deleted.');
  };

  const content = (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-xs">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">
              Professor &amp; Teacher Content Management System
            </h3>
            <p className="text-xs text-indigo-200">
              Author custom diagnostic activities, author interactive quizzes, and upload curriculum study materials
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {subTab === 'ACTIVITIES' ? (
            <button
              onClick={() => setShowActivityModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Quiz / Activity</span>
            </button>
          ) : (
            <button
              onClick={() => setShowMaterialModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Course Material</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Close Teacher CMS"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
        <button
          onClick={() => setSubTab('ACTIVITIES')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'ACTIVITIES'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Author Activities &amp; Quizzes ({activities.length})</span>
        </button>

        <button
          onClick={() => setSubTab('MATERIALS')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'MATERIALS'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Author Curriculum Materials ({materials.length})</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* SUB-TAB 1: ACTIVITIES */}
      {subTab === 'ACTIVITIES' && (
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl text-gray-500 space-y-3">
              <Layers className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-xs font-bold">No custom instructor activities created yet.</p>
              <button
                onClick={() => setShowActivityModal(true)}
                className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800 cursor-pointer"
              >
                Create Your First Activity
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:border-blue-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                          {act.category}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500">
                          Level: {act.difficulty || 'Intermediate'}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-gray-900">{act.title}</h4>
                    </div>

                    <button
                      onClick={() => handleDeleteActivity(act.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2">
                    {act.description || 'Custom teacher assessment activity.'}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">
                      {act.questions.length} Questions Configured
                    </span>
                    <span className="text-[11px] text-emerald-600 font-bold">
                      ✓ Published to Students
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: MATERIALS */}
      {subTab === 'MATERIALS' && (
        <div className="space-y-4">
          {materials.length === 0 ? (
            <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl text-gray-500 space-y-3">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-xs font-bold">No course materials uploaded yet.</p>
              <button
                onClick={() => setShowMaterialModal(true)}
                className="px-4 py-2 bg-indigo-700 text-white rounded-xl text-xs font-bold hover:bg-indigo-800 cursor-pointer"
              >
                Upload New Handout / Lesson Notes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                        Topic {mat.topicNumber || 1} Material
                      </span>
                      <h4 className="text-base font-black text-gray-900">{mat.title}</h4>
                    </div>

                    <button
                      onClick={() => handleDeleteMaterial(mat.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete material"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-3">
                    {mat.description || mat.content}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">
                      Instructor: {mat.instructor || 'Faculty Member'}
                    </span>
                    {mat.file_url ? (
                      <a
                        href={mat.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 font-bold hover:underline"
                      >
                        View Attachment ↗
                      </a>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-bold">
                        ✓ In-App Content
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CREATE ACTIVITY */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 my-auto animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-black flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <span>Author Custom Diagnostic Activity / Quiz</span>
              </h3>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700">Activity Title *</label>
                  <input
                    type="text"
                    required
                    value={newActivityTitle}
                    onChange={(e) => setNewActivityTitle(e.target.value)}
                    placeholder="e.g., Motherboard Pinout &amp; Power Harness Exam"
                    className="w-full px-3.5 py-2 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Category</label>
                  <select
                    value={newActivityCategory}
                    onChange={(e) => setNewActivityCategory(e.target.value)}
                    className="w-full px-3.5 py-2 border rounded-xl text-xs font-semibold"
                  >
                    <option value="Hardware Diagnostics">Hardware Diagnostics</option>
                    <option value="BIOS & UEFI Setup">BIOS &amp; UEFI Setup</option>
                    <option value="Cable Identification">Cable Identification</option>
                    <option value="Assembly Safety Protocols">Assembly Safety Protocols</option>
                    <option value="OS Configuration">OS Configuration</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Difficulty Level</label>
                  <select
                    value={newActivityDifficulty}
                    onChange={(e) => setNewActivityDifficulty(e.target.value as any)}
                    className="w-full px-3.5 py-2 border rounded-xl text-xs font-semibold"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700">Description / Instructions</label>
                  <textarea
                    rows={2}
                    value={newActivityDesc}
                    onChange={(e) => setNewActivityDesc(e.target.value)}
                    placeholder="Brief guide or directions for students completing this evaluation."
                    className="w-full px-3.5 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Questions Builder */}
              <div className="space-y-4 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-gray-800 tracking-wider">
                    Questions &amp; Solutions ({questions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center gap-1 text-xs font-black text-blue-700 hover:text-blue-900 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                {questions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-gray-700">Question #{qIdx + 1}</span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIdx)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      value={q.question}
                      onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                      placeholder="Enter the technical question..."
                      className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 font-semibold"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-gray-200">
                          <input
                            type="radio"
                            name={`correct_${qIdx}`}
                            checked={q.correct === optIdx}
                            onChange={() => updateQuestionCorrect(qIdx, optIdx)}
                            className="text-blue-600"
                            title="Mark as correct answer"
                          />
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => updateQuestionOption(qIdx, optIdx, e.target.value)}
                            placeholder={`Option ${optIdx + 1}`}
                            className="flex-1 text-xs bg-transparent focus:outline-hidden"
                          />
                        </div>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) => updateQuestionExplanation(qIdx, e.target.value)}
                      placeholder="Technical explanation / rationale for why the answer is correct..."
                      className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-gray-600 italic"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs"
                >
                  Publish Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE MATERIAL */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 my-auto animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-black flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                <span>Upload / Publish Course Material</span>
              </h3>
              <button
                onClick={() => setShowMaterialModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Material Title *</label>
                <input
                  type="text"
                  required
                  value={newMatTitle}
                  onChange={(e) => setNewMatTitle(e.target.value)}
                  placeholder="e.g., POST Diagnostic LED Codes Handout"
                  className="w-full px-3.5 py-2 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Aligned Curriculum Topic</label>
                <select
                  value={newMatTopic}
                  onChange={(e) => setNewMatTopic(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border rounded-xl text-xs font-semibold"
                >
                  <option value={1}>Lesson 1: Planning and Preparing for Installation</option>
                  <option value={2}>Lesson 2: Installing Computer Systems (Hardware)</option>
                  <option value={3}>Lesson 3: Operating System Installation &amp; Drivers</option>
                  <option value={4}>Lesson 4: Applications &amp; Security Tools</option>
                  <option value={5}>Lesson 5: Testing Computer Systems &amp; Burn-In</option>
                  <option value={6}>Lesson 6: Hardware Diagnostics &amp; Troubleshooting</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Short Summary</label>
                <input
                  type="text"
                  value={newMatDesc}
                  onChange={(e) => setNewMatDesc(e.target.value)}
                  placeholder="Summary of what this handout or guide covers..."
                  className="w-full px-3.5 py-2 border rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Detailed Content / Notes</label>
                <textarea
                  rows={4}
                  value={newMatContent}
                  onChange={(e) => setNewMatContent(e.target.value)}
                  placeholder="Comprehensive technical notes, steps, formulas, pinout tables, or study pointers..."
                  className="w-full px-3.5 py-2 border rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Attachment / External Document URL (Optional)</label>
                <input
                  type="url"
                  value={newMatFileUrl}
                  onChange={(e) => setNewMatFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or https://.../handout.pdf"
                  className="w-full px-3.5 py-2 border rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs"
                >
                  Publish Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
        <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 my-auto max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
