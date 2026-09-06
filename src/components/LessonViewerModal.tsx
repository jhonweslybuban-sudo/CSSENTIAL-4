import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Download,
  Printer,
  Maximize2,
  Minimize2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Play,
  Pause,
  Layers,
  HelpCircle,
  Clock,
  Sparkles,
  ShieldAlert,
  Wrench
} from 'lucide-react';
import { LessonContent } from '../types';
import { api } from '../services/api';
import { buildLessonSlides, downloadPresentationDeck, PresentationSlide } from '../services/presentationService';
import { generateDocxBlob } from '../services/academicDocument';

interface LessonViewerModalProps {
  lesson: LessonContent | null;
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  sessionId: string;
  studentName?: string;
  yearSection?: string;
}

export const LessonViewerModal: React.FC<LessonViewerModalProps> = ({
  lesson,
  isOpen,
  onClose,
  studentId,
  sessionId,
  studentName = 'Registered Student',
  yearSection = 'General Section'
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [showSlideList, setShowSlideList] = useState<boolean>(false);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [startTime] = useState<number>(Date.now());

  const modalRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate slides for this lesson
  const slides: PresentationSlide[] = lesson ? buildLessonSlides(lesson) : [];

  useEffect(() => {
    setCurrentSlideIndex(0);
    setIsAutoPlay(false);
  }, [lesson]);

  // Handle Autoplay timer
  useEffect(() => {
    if (isAutoPlay && slides.length > 0) {
      autoPlayTimerRef.current = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
      }, 7000);
    } else if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlay, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentSlideIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentSlideIndex(slides.length - 1);
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (e.key === 'Escape' && !document.fullscreenElement) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, slides.length]);

  if (!isOpen || !lesson || slides.length === 0) return null;

  const currentSlide = slides[currentSlideIndex];

  const handleClose = async () => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    await api.recordLessonView({
      student_id: studentId,
      session_id: sessionId,
      lesson_title: lesson.title,
      started_at: new Date(startTime).toISOString(),
      finished_at: new Date().toISOString(),
      duration_seconds: duration,
      completed: currentSlideIndex >= slides.length - 2
    });
    onClose();
  };

  const toggleFullscreen = () => {
    if (!modalRef.current) return;
    if (!document.fullscreenElement) {
      modalRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleDownloadSlidesHtml = async () => {
    try {
      await downloadPresentationDeck(lesson, studentId, sessionId, studentName);
      setDownloadNotice(`Downloaded Standalone Presentation Deck (.html) for Topic ${lesson.topicNumber}!`);
      setTimeout(() => setDownloadNotice(null), 3500);
    } catch (err) {
      console.error('Presentation download error:', err);
    }
  };

  const handleDownloadDocxHandout = async () => {
    try {
      const blob = generateDocxBlob(lesson, studentName, studentId, yearSection);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CSSENTIAL_Topic_0${lesson.topicNumber}_${lesson.title.replace(/\s+/g, '_')}_Lecture_Notes.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      await api.recordDownload({
        student_id: studentId,
        session_id: sessionId,
        resource_name: `${lesson.title} Lecture Slide Notes (.doc)`,
        file_type: 'DOCX'
      });

      setDownloadNotice(`Downloaded Slide Notes (.doc) for Topic ${lesson.topicNumber}`);
      setTimeout(() => setDownloadNotice(null), 3500);
    } catch (err) {
      console.error('Docx download error:', err);
    }
  };

  const handlePrintSlideDeck = () => {
    window.print();
  };

  return (
    <div
      ref={modalRef}
      id="lesson-presentation-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-2 sm:p-4 overflow-hidden"
    >
      <div className="w-full max-w-6xl h-[92vh] max-h-[950px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Presentation Bar */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          
          {/* Brand & Topic Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-black text-sm shrink-0">
              0{lesson.topicNumber}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">
                  SLIDE PRESENTATION • CSIC-30{lesson.topicNumber}
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-400">
                  Slide {currentSlideIndex + 1} of {slides.length}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate">
                {lesson.title}
              </h2>
            </div>
          </div>

          {/* Action and Download Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Download Presentation Deck (HTML) */}
            <button
              id="download-presentation-html-btn"
              onClick={handleDownloadSlidesHtml}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
              title="Download Standalone Offline Presentation Slides (.html)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Download Slides (.html)</span>
              <span className="md:hidden">Slides</span>
            </button>

            {/* Print / Save as PDF */}
            <button
              id="print-presentation-slides-btn"
              onClick={handlePrintSlideDeck}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              title="Print or Save Presentation as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Print / PDF</span>
            </button>

            {/* Word Handout */}
            <button
              id="download-handout-btn"
              onClick={handleDownloadDocxHandout}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              title="Download Academic Slide Notes in Word (.doc)"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Notes (.doc)</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              id="close-presentation-btn"
              onClick={handleClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-300 flex items-center justify-center transition-colors cursor-pointer ml-1"
              title="Close Presentation (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Download notification alert banner */}
        {downloadNotice && (
          <div className="bg-emerald-950/80 border-b border-emerald-700/60 px-4 py-2 flex items-center justify-between text-xs text-emerald-200 font-medium animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{downloadNotice}</span>
            </div>
            <button
              onClick={() => setDownloadNotice(null)}
              className="text-emerald-400 hover:text-emerald-200 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main 16:9 Presentation Stage */}
        <div className="flex-1 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-4 sm:p-6 lg:p-8 flex items-center justify-center overflow-hidden relative">
          
          {/* Slide Frame with 16:9 ratio feel */}
          <div className="w-full max-w-5xl aspect-[16/9.2] bg-slate-900/90 border border-slate-700/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative backdrop-blur-md">
            
            {/* Slide Header (Except for title slide) */}
            {currentSlide.type !== 'title' && (
              <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/40 flex items-start justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      {currentSlide.badge}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      {currentSlide.category}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1 leading-tight tracking-tight">
                    {currentSlide.title}
                  </h3>
                  {currentSlide.subtitle && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {currentSlide.subtitle}
                    </p>
                  )}
                </div>

                <div className="px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/50 text-slate-300 font-mono text-xs font-bold shrink-0">
                  {currentSlideIndex + 1} / {slides.length}
                </div>
              </div>
            )}

            {/* Slide Body Content */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto flex flex-col justify-center">
              
              {/* 1. TITLE / COVER SLIDE */}
              {currentSlide.type === 'title' && (
                <div className="flex flex-col justify-center h-full max-w-3xl mx-auto text-left space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-blue-600 text-white shadow-sm">
                      {currentSlide.badge}
                    </span>
                    <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">
                      {currentSlide.category}
                    </span>
                  </div>

                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-blue-300 bg-clip-text text-transparent">
                      {currentSlide.title}
                    </h1>
                    <p className="text-base sm:text-lg text-slate-300 mt-3 leading-relaxed">
                      {currentSlide.subtitle}
                    </p>
                  </div>

                  {/* Metadata Chips Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Course Code</div>
                      <div className="text-xs font-black text-blue-300 mt-0.5">{currentSlide.data.courseCode}</div>
                    </div>
                    <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Standard</div>
                      <div className="text-xs font-black text-slate-200 mt-0.5 truncate" title={currentSlide.data.accreditation}>
                        TESDA NC II
                      </div>
                    </div>
                    <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Lab</div>
                      <div className="text-xs font-black text-slate-200 mt-0.5">{currentSlide.data.duration}</div>
                    </div>
                    <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Curriculum Year</div>
                      <div className="text-xs font-black text-slate-200 mt-0.5">{currentSlide.data.academicYear}</div>
                    </div>
                  </div>

                  {/* Quick Tip for Presenter */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Use keyboard Left/Right arrows or Spacebar to navigate slides. Press F for fullscreen.</span>
                  </div>
                </div>
              )}

              {/* 2. OBJECTIVES SLIDE */}
              {currentSlide.type === 'objectives' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
                  {/* Left Column: Learning Objectives */}
                  <div className="md:col-span-7 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      <span>Demonstrated Behavioral Competencies</span>
                    </h4>
                    <div className="space-y-2.5">
                      {currentSlide.data.objectives.map((obj: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl">
                          <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                            {obj}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Bloom's Domains */}
                  <div className="md:col-span-5 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>Laboratory Competency Domains</span>
                    </h4>
                    <div className="space-y-2.5">
                      {currentSlide.data.competencies.map((c: any, j: number) => (
                        <div key={j} className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                          <div className="text-xs font-black text-blue-300">{c.label}</div>
                          <div className="text-xs text-slate-300 mt-1">{c.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. TECHNICAL CONCEPTS SLIDE */}
              {currentSlide.type === 'concept' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Main concept statement */}
                  <div className="p-4 sm:p-5 bg-blue-950/40 border border-blue-600/30 rounded-xl">
                    <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
                      {currentSlide.data.body}
                    </p>
                  </div>

                  {/* Key points grid */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
                      <span>Engineering Standards & Critical Rules</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentSlide.data.keyPoints.map((kp: string, k: number) => (
                        <div key={k} className="p-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-start gap-2.5">
                          <span className="text-blue-400 font-black text-sm shrink-0">•</span>
                          <span className="text-xs sm:text-sm text-slate-200 leading-snug">{kp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. PROCEDURE STEP SLIDE */}
              {currentSlide.type === 'procedure_step' && (
                <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
                      {currentSlide.data.stepNumber}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">
                        Action Step {currentSlide.data.stepNumber} of {currentSlide.data.totalSteps}
                      </span>
                      <h4 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                        {currentSlide.data.title}
                      </h4>
                      <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
                        {currentSlide.data.details}
                      </p>
                    </div>
                  </div>

                  {/* Warning Box if present */}
                  {currentSlide.data.warning && (
                    <div className="p-4 bg-red-950/40 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-black text-red-300 uppercase tracking-wider">Critical Caution</div>
                        <div className="text-xs sm:text-sm text-red-200 mt-0.5">{currentSlide.data.warning}</div>
                      </div>
                    </div>
                  )}

                  {/* Technician Pro-Tip */}
                  {currentSlide.data.technicianTip && (
                    <div className="p-4 bg-amber-950/40 border-l-4 border-amber-500 rounded-r-xl flex items-start gap-3">
                      <Wrench className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-black text-amber-300 uppercase tracking-wider">Technician Field Advice</div>
                        <div className="text-xs sm:text-sm text-amber-200 mt-0.5">{currentSlide.data.technicianTip}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 5. SAFETY & ESD SLIDE */}
              {currentSlide.type === 'safety' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Safety Reminders */}
                    <div className="p-4 bg-red-950/30 border border-red-800/40 rounded-xl space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                        <span>Mandatory Safety Directives</span>
                      </h4>
                      <div className="space-y-2">
                        {currentSlide.data.reminders.map((r: string, m: number) => (
                          <div key={m} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                            <span className="text-red-400 font-bold">•</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* PPE Checklist */}
                    <div className="p-4 bg-blue-950/30 border border-blue-800/40 rounded-xl space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                        <span>Personal Protective Equipment (PPE)</span>
                      </h4>
                      <div className="space-y-2">
                        {currentSlide.data.ppeChecklist.map((p: string, n: number) => (
                          <div key={n} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                            <span className="text-blue-400 font-bold">✓</span>
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Hazard Mitigation */}
                  <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>Hazard Warning:</strong> {currentSlide.data.hazardMitigation}</span>
                  </div>
                </div>
              )}

              {/* 6. TROUBLESHOOTING SLIDE */}
              {currentSlide.type === 'troubleshooting' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-2.5">
                    {currentSlide.data.diagnosticFlow.map((flow: any, fIdx: number) => (
                      <div
                        key={fIdx}
                        className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl"
                      >
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-red-400">
                            Observed Symptom
                          </span>
                          <p className="text-xs font-bold text-white mt-0.5">
                            {flow.symptom}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                            Probable Root Cause
                          </span>
                          <p className="text-xs text-slate-300 mt-0.5">
                            {flow.cause}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                            Corrective Action
                          </span>
                          <p className="text-xs text-emerald-200 mt-0.5">
                            {flow.resolution}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Laboratory Tips */}
                  <div className="p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl text-xs text-slate-300 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300">Lab Diagnostic Note: </strong>
                      {currentSlide.data.tips.join(' ')}
                    </div>
                  </div>
                </div>
              )}

              {/* 7. SUMMARY SLIDE */}
              {currentSlide.type === 'summary' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                  <div className="p-5 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      <span>Key Module Takeaways</span>
                    </h4>
                    <div className="space-y-2">
                      {currentSlide.data.takeaways.map((t: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                          <span className="text-blue-400 font-bold">•</span>
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Next Interventions & Practicum</span>
                    </h4>
                    <div className="space-y-2">
                      {currentSlide.data.nextSteps.map((s: string, sIdx: number) => (
                        <div key={sIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-emerald-200">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleDownloadSlidesHtml}
                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Slide Deck for Offline Study</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Presenter Notes Drawer (Collapsible) */}
        {showNotes && (
          <div className="bg-slate-950 border-t border-slate-800 px-6 py-3 text-xs text-slate-300 flex items-start gap-2 animate-in slide-in-from-bottom-2 duration-150 shrink-0">
            <BookOpen className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-blue-300 uppercase tracking-wider mr-1">Presenter Lecturing Notes:</span>
              <span className="text-slate-300">{currentSlide.presenterNotes}</span>
            </div>
          </div>
        )}

        {/* Slide Selector Quick Drawer (Collapsible) */}
        {showSlideList && (
          <div className="bg-slate-950/95 border-t border-slate-800 px-4 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 animate-in slide-in-from-bottom-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Jump To:</span>
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentSlideIndex(idx);
                  setShowSlideList(false);
                }}
                className={`px-2.5 py-1 rounded text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  idx === currentSlideIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {idx + 1}. {s.title.substring(0, 24)}...
              </button>
            ))}
          </div>
        )}

        {/* Bottom Slide Controller Bar */}
        <div className="bg-slate-950 border-t border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          
          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              id="prev-slide-btn"
              disabled={currentSlideIndex === 0}
              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentSlideIndex === 0
                  ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95'
              }`}
              title="Previous Slide (←)"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <span className="text-xs font-mono font-bold text-slate-300 px-2">
              {currentSlideIndex + 1} / {slides.length}
            </span>

            <button
              id="next-slide-btn"
              disabled={currentSlideIndex === slides.length - 1}
              onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentSlideIndex === slides.length - 1
                  ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-95 shadow-sm'
              }`}
              title="Next Slide (→)"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="hidden sm:flex flex-1 max-w-xs mx-4 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
              style={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }}
            />
          </div>

          {/* Quick Slide Tools */}
          <div className="flex items-center gap-2">
            {/* Slide List Drawer Toggle */}
            <button
              onClick={() => setShowSlideList((prev) => !prev)}
              className={`p-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                showSlideList
                  ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="All Slides Thumbnails"
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Presenter Notes Toggle */}
            <button
              onClick={() => setShowNotes((prev) => !prev)}
              className={`p-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                showNotes
                  ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Presenter Notes"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Autoplay Toggle */}
            <button
              onClick={() => setIsAutoPlay((prev) => !prev)}
              className={`p-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                isAutoPlay
                  ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title={isAutoPlay ? 'Pause Slideshow' : 'Autoplay Slideshow (7s)'}
            >
              {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
