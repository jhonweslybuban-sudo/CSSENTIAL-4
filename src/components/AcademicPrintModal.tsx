import React, { useState } from 'react';
import { Printer, Download, X, Award, FileText, CheckCircle } from 'lucide-react';
import { LessonContent } from '../types';
import { generateAcademicHTML, generateDocxBlob } from '../services/academicDocument';

interface AcademicPrintModalProps {
  isOpen: boolean;
  lesson: LessonContent | null;
  studentName?: string;
  studentId?: string;
  yearSection?: string;
  onClose: () => void;
  onRecordDownload?: (format: 'PDF' | 'DOCX') => void;
}

export const AcademicPrintModal: React.FC<AcademicPrintModalProps> = ({
  isOpen,
  lesson,
  studentName = 'Registered Student',
  studentId = 'CSS-2024-STD',
  yearSection = 'General Section',
  onClose,
  onRecordDownload
}) => {
  const [currentName, setCurrentName] = useState(studentName);
  const [currentSection, setCurrentSection] = useState(yearSection);
  const [currentId, setCurrentId] = useState(studentId);

  if (!isOpen || !lesson) return null;

  const htmlContent = generateAcademicHTML(lesson, currentName, currentId, currentSection);

  const handlePrint = () => {
    onRecordDownload?.('PDF');
    window.print();
  };

  const handleDownloadDocx = () => {
    onRecordDownload?.('DOCX');
    const blob = generateDocxBlob(lesson, currentName, currentId, currentSection);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CSSENTIAL_Topic_${lesson.topicNumber}_Lab_Manual.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadHTML = () => {
    onRecordDownload?.('PDF');
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>CSSENTIAL_Topic_${lesson.topicNumber}_Laboratory_Manual</title>
        <style>
          @page { size: letter; margin: 20mm; }
          body { font-family: 'Times New Roman', Times, serif; }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CSSENTIAL_Topic_${lesson.topicNumber}_Academic_Manual.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-300 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-blue-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-800 flex items-center justify-center border border-blue-700">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-800 text-blue-200 text-[10px] font-bold uppercase tracking-wider rounded">
                  Official Academic Document
                </span>
                <span className="text-xs text-blue-200">Topic {lesson.topicNumber}</span>
              </div>
              <h3 className="text-base font-bold text-white leading-tight">
                Formal Laboratory Practicum Manual &amp; Competency Guide
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg transition-colors shadow-xs cursor-pointer"
              title="Print directly or save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleDownloadDocx}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors border border-blue-600 cursor-pointer"
              title="Download editable Microsoft Word format"
            >
              <Download className="w-4 h-4" />
              <span>Word (.DOC)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customizable Student Info Bar */}
        <div className="px-6 py-2.5 bg-gray-50 border-b border-gray-200 text-xs flex flex-wrap items-center gap-4 text-gray-600 shrink-0">
          <span className="font-bold text-gray-800">Assignee Details:</span>
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-gray-500">Name:</label>
            <input
              type="text"
              value={currentName}
              onChange={(e) => setCurrentName(e.target.value)}
              className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-900 font-medium focus:ring-1 focus:ring-blue-600"
              placeholder="Student Name"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-gray-500">Year &amp; Section:</label>
            <input
              type="text"
              value={currentSection}
              onChange={(e) => setCurrentSection(e.target.value)}
              className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-900 font-medium focus:ring-1 focus:ring-blue-600"
              placeholder="e.g. 3rd Year - Section A"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-gray-500">ID:</label>
            <input
              type="text"
              value={currentId}
              onChange={(e) => setCurrentId(e.target.value)}
              className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-900 font-mono focus:ring-1 focus:ring-blue-600 w-28"
              placeholder="ID Number"
            />
          </div>
        </div>

        {/* Document Preview Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-100 flex justify-center">
          <div
            id="academic-document-print-area"
            className="bg-white shadow-lg border border-gray-200 rounded-sm p-6 sm:p-10 w-full max-w-[850px] min-h-[1050px]"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

        {/* Modal Bottom Controls */}
        <div className="px-6 py-3 bg-white border-t border-gray-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-gray-500">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Includes OHS checklist, step-by-step procedures, rubrics, and formal sign-off.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadHTML}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Export HTML
            </button>
            <button
              onClick={handleDownloadDocx}
              className="px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 font-bold rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Download DOCX
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Print / Save PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
