import React, { useState, useEffect } from 'react';
import { Monitor, Download, Play, FileText, CheckCircle2, Film, Award, Printer } from 'lucide-react';
import { LESSONS_DATA } from '../data/curriculum';
import { LessonContent } from '../types';
import { LessonViewerModal } from './LessonViewerModal';
import { VideoModal } from './VideoModal';
import { AcademicPrintModal } from './AcademicPrintModal';
import { generateDocxBlob } from '../services/academicDocument';
import { downloadPresentationDeck } from '../services/presentationService';
import { api } from '../services/api';

interface CollectionViewProps {
  studentId: string;
  sessionId: string;
  studentName?: string;
  yearSection?: string;
  initialTopicId?: string | null;
  onClearInitialTopic?: () => void;
}

export const CollectionView: React.FC<CollectionViewProps> = ({
  studentId,
  sessionId,
  studentName = 'Registered Student',
  yearSection = 'General Section',
  initialTopicId,
  onClearInitialTopic
}) => {
  const [selectedLessonForPresentation, setSelectedLessonForPresentation] = useState<LessonContent | null>(null);
  const [selectedLessonForVideo, setSelectedLessonForVideo] = useState<LessonContent | null>(null);
  const [selectedLessonForPrint, setSelectedLessonForPrint] = useState<LessonContent | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Auto-open or focus topic when navigated with initialTopicId
  useEffect(() => {
    if (initialTopicId) {
      const match = LESSONS_DATA.find((l) => l.id === initialTopicId);
      if (match) {
        setSelectedLessonForPresentation(match);
      }
      onClearInitialTopic?.();
    }
  }, [initialTopicId, onClearInitialTopic]);

  const handleDownloadDocx = async (lesson: LessonContent) => {
    try {
      const blob = generateDocxBlob(lesson, studentName, studentId, yearSection);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CSSENTIAL_Topic_${lesson.topicNumber}_${lesson.title.replace(/\s+/g, '_')}_Manual.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Record in research database
      await api.recordDownload({
        student_id: studentId,
        session_id: sessionId,
        resource_name: `${lesson.title} Formal Laboratory Manual (DOCX)`,
        file_type: 'DOCX'
      });

      setDownloadNotice(`Downloaded Academic DOCX Manual for Topic ${lesson.topicNumber}: "${lesson.title}"`);
      setTimeout(() => setDownloadNotice(null), 3500);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleDownloadSlides = async (lesson: LessonContent) => {
    try {
      await downloadPresentationDeck(lesson, studentId, sessionId, studentName);
      setDownloadNotice(`Downloaded Standalone Presentation Slides (.html) for Topic ${lesson.topicNumber}: "${lesson.title}"`);
      setTimeout(() => setDownloadNotice(null), 3500);
    } catch (err) {
      console.error('Slide download error:', err);
    }
  };

  const handleRecordPdfDownload = async (format: 'PDF' | 'DOCX') => {
    if (selectedLessonForPrint) {
      await api.recordDownload({
        student_id: studentId,
        session_id: sessionId,
        resource_name: `${selectedLessonForPrint.title} Laboratory Practicum Manual (${format})`,
        file_type: format
      });
      setDownloadNotice(`Generated Academic ${format} for Topic ${selectedLessonForPrint.topicNumber}: "${selectedLessonForPrint.title}"`);
      setTimeout(() => setDownloadNotice(null), 3500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Figure 3 Title & Subheading */}
      <div className="text-center max-w-3xl mx-auto space-y-1">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-widest block">
          CURRICULUM COLLECTION
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-950">
          Computer System Installation and Configuration
        </h2>
        <p className="text-xs text-gray-600">
          Comprehensive competency modules containing interactive lecture presentations, formal academic laboratory manuals in PDF/DOCX, and instructional video demonstrations.
        </p>
      </div>

      {/* Download Alert Banner */}
      {downloadNotice && (
        <div className="max-w-xl mx-auto p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Figure 3 Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6">LESSON / TOPIC</th>
                <th className="py-4 px-4 text-center">PRESENTATION</th>
                <th className="py-4 px-4 text-center">ACADEMIC DOWNLOADS</th>
                <th className="py-4 px-4 text-center">VIDEOS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
              {LESSONS_DATA.map((lesson, index) => (
                <tr
                  key={lesson.id}
                  id={`collection-row-${index + 1}`}
                  className="hover:bg-blue-50/40 transition-colors"
                >
                  {/* Topic Name and Description */}
                  <td className="py-4 px-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        0{lesson.topicNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-blue-700 uppercase">
                            Lesson {lesson.topicNumber}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            CSIC-30{lesson.topicNumber}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 sm:line-clamp-2">
                          {lesson.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Presentation Button */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <button
                        id={`present-btn-${lesson.id}`}
                        onClick={() => setSelectedLessonForPresentation(lesson)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
                        title="Launch Interactive Slide Deck Presentation"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                        <span>PRESENT</span>
                      </button>
                      <button
                        id={`download-slides-${lesson.id}`}
                        onClick={() => handleDownloadSlides(lesson)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer mt-1.5"
                        title="Directly Download Standalone Slide Deck (.html)"
                      >
                        <Download className="w-3 h-3 text-blue-600" />
                        <span>Slides (.html)</span>
                      </button>
                    </div>
                  </td>

                  {/* Download Options (PDF & DOCX) - Academically Engaging Design */}
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <button
                        id={`download-pdf-${lesson.id}`}
                        onClick={() => setSelectedLessonForPrint(lesson)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title="View & Print Official Academic PDF Manual"
                      >
                        <FileText className="w-3.5 h-3.5 text-red-600" />
                        <span>PDF Manual</span>
                      </button>
                      <button
                        id={`download-docx-${lesson.id}`}
                        onClick={() => handleDownloadDocx(lesson)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title="Download Academic Microsoft Word (.DOC) Manual"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600" />
                        <span>Word DOCX</span>
                      </button>
                    </div>
                  </td>

                  {/* Watch Video Button */}
                  <td className="py-4 px-4 text-center">
                    <button
                      id={`watch-video-${lesson.id}`}
                      onClick={() => setSelectedLessonForVideo(lesson)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>WATCH</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <LessonViewerModal
        lesson={selectedLessonForPresentation}
        isOpen={!!selectedLessonForPresentation}
        onClose={() => setSelectedLessonForPresentation(null)}
        studentId={studentId}
        sessionId={sessionId}
        studentName={studentName}
        yearSection={yearSection}
      />

      <VideoModal
        lesson={selectedLessonForVideo}
        isOpen={!!selectedLessonForVideo}
        onClose={() => setSelectedLessonForVideo(null)}
      />

      <AcademicPrintModal
        isOpen={!!selectedLessonForPrint}
        lesson={selectedLessonForPrint}
        studentName={studentName}
        studentId={studentId}
        yearSection={yearSection}
        onClose={() => setSelectedLessonForPrint(null)}
        onRecordDownload={handleRecordPdfDownload}
      />

    </div>
  );
};
