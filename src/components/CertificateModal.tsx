import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, AlertCircle, Printer, Download, X, ShieldCheck, Sparkles, ArrowRight, Check } from 'lucide-react';
import { api } from '../services/api';
import { CertificateInfo } from '../types';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName?: string;
  yearSection?: string;
  onNavigateToActivities?: () => void;
  onNavigateToGames?: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName = 'Registered Student',
  yearSection = 'General Section',
  onNavigateToActivities,
  onNavigateToGames
}) => {
  const [certInfo, setCertInfo] = useState<CertificateInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.getCertificateStatus(studentId)
      .then(info => {
        setCertInfo(info);
      })
      .catch(() => {
        // Fallback
        setCertInfo({
          student_id: studentId,
          student_name: studentName,
          year_section: yearSection,
          isEligible: false,
          stats: {
            activitiesCount: 0,
            quizzesCount: 0,
            gamesCount: 0,
            pcLabPassed: false
          },
          certificate_id: `CERT-CSS-2026-${studentId.slice(-6).toUpperCase()}`
        });
      })
      .finally(() => setLoading(false));
  }, [isOpen, studentId, studentName, yearSection]);

  if (!isOpen) return null;

  const isEligible = certInfo?.isEligible;
  const recipientName = certInfo?.student_name || studentName;
  const recipientSection = certInfo?.year_section || yearSection;
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const generateStandaloneHTML = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Academic Certificate - ${recipientName}</title>
  <style>
    @page {
      size: landscape;
      margin: 8mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #ffffff;
      font-family: Georgia, 'Times New Roman', serif;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cert-frame {
      width: 100%;
      height: 100%;
      max-width: 297mm;
      max-height: 210mm;
      padding: 30px 48px;
      background: #fffdf9;
      border: 8px double #92400e;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
      position: relative;
      box-sizing: border-box;
    }
    .inst-name {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 3px;
      color: #1e3a8a;
      text-transform: uppercase;
      margin: 0;
    }
    .inst-sub {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin: 4px 0 0 0;
    }
    .gold-divider {
      width: 100px;
      height: 2px;
      background: #d97706;
      margin: 12px auto;
    }
    .cert-title {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: 1px;
      color: #0f172a;
      margin: 6px 0 4px 0;
      text-transform: uppercase;
    }
    .cert-sub {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 11px;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #64748b;
      margin: 0;
    }
    .recipient-name {
      font-size: 36px;
      font-weight: 800;
      color: #0f172a;
      margin: 12px 0 2px 0;
      padding: 0 24px 6px 24px;
      border-bottom: 2px solid #f59e0b;
      display: inline-block;
    }
    .recipient-section {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      margin: 6px 0 0 0;
    }
    .citation {
      font-size: 14px;
      color: #334155;
      max-width: 82%;
      margin: 14px auto 0 auto;
      line-height: 1.6;
    }
    .date-row {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 11px;
      color: #64748b;
      margin: 12px 0 6px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .date-row strong {
      color: #1e293b;
      font-family: monospace;
      font-size: 12px;
    }
    .signatures-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      border-top: 1px solid #fde68a;
      padding-top: 14px;
      margin-top: 10px;
    }
    .sig-col {
      text-align: center;
    }
    .sig-line {
      width: 85%;
      border-bottom: 1px solid #475569;
      margin: 0 auto 5px auto;
      height: 18px;
    }
    .sig-name {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 10.5px;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
    }
    .sig-title {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 8.5px;
      color: #64748b;
      margin-top: 2px;
    }
  </style>
</head>
<body>
  <div class="cert-frame">
    <div>
      <p class="inst-name">CSSENTIAL LEARNING PLATFORM</p>
      <p class="inst-sub">Computer System Installation and Configuration</p>
      <div class="gold-divider"></div>
      <h1 class="cert-title">Certificate of Technical Competency</h1>
      <p class="cert-sub">This certificate is proudly awarded to</p>
    </div>

    <div>
      <div>
        <div class="recipient-name">${recipientName}</div>
      </div>
      <p class="recipient-section">${recipientSection}</p>
      <p class="citation">
        For satisfactorily completing the laboratory competencies, diagnostic assessments, and technical practicums in 
        <strong>Computer System Installation and Configuration</strong>.
      </p>
    </div>

    <div>
      <div class="date-row">
        Date Issued: <strong>${currentDate}</strong>
      </div>
      <div class="signatures-grid">
        <div class="sig-col">
          <div class="sig-line"></div>
          <div class="sig-name">J. W. Buban</div>
          <div class="sig-title">Lead Developer &amp; Researcher</div>
        </div>
        <div class="sig-col">
          <div class="sig-line"></div>
          <div class="sig-name">Juliana Marizh B. Calapputu</div>
          <div class="sig-title">Curriculum Lead &amp; Researcher</div>
        </div>
        <div class="sig-col">
          <div class="sig-line"></div>
          <div class="sig-name">Charlotte Mae H. Colon</div>
          <div class="sig-title">Assessment Lead &amp; Researcher</div>
        </div>
        <div class="sig-col">
          <div class="sig-line"></div>
          <div class="sig-name">Precious Lara M. Timoteo</div>
          <div class="sig-title">Usability Lead &amp; Researcher</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const handlePrint = () => {
    // 1. Try printing via an isolated hidden iframe for guaranteed landscape formatting without parent styles interfering
    try {
      let printFrame = document.getElementById('cert-isolated-print-frame') as HTMLIFrameElement;
      if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'cert-isolated-print-frame';
        printFrame.style.position = 'fixed';
        printFrame.style.top = '-9999px';
        printFrame.style.left = '-9999px';
        printFrame.style.width = '1024px';
        printFrame.style.height = '768px';
        printFrame.style.border = 'none';
        document.body.appendChild(printFrame);
      }

      const doc = printFrame.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(generateStandaloneHTML());
        doc.close();
        setTimeout(() => {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        }, 250);
        return;
      }
    } catch (err) {
      console.warn('Iframe print fallback to window.print():', err);
    }

    // 2. Direct browser print fallback (styled via @media print in index.css)
    window.print();
  };

  const handleDownloadHTML = () => {
    const html = generateStandaloneHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = recipientName.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.href = url;
    link.download = `CSSENTIAL_Certificate_${safeName}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Academic Certificate of Competency</span>
              </h3>
              <p className="text-xs text-slate-300">
                Computer System Installation and Configuration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-8 max-h-[82vh] overflow-y-auto">
          {loading ? (
            <div className="py-16 text-center text-gray-500 space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold">Verifying academic records &amp; practical laboratory requirements...</p>
            </div>
          ) : isEligible ? (
            /* ELIGIBLE: LANDSCAPE CERTIFICATE VIEW */
            <div className="space-y-5">
              
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Congratulations! You have satisfied all technical competency criteria.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadHTML}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    title="Download offline certificate document"
                  >
                    {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{downloaded ? 'Downloaded' : 'Download Document'}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-black shadow-xs transition-all cursor-pointer"
                    title="Print or Save PDF in Landscape orientation"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Save PDF (Landscape)</span>
                  </button>
                </div>
              </div>

              {/* Printable Landscape Certificate Frame */}
              <div
                id="printable-certificate"
                className="relative bg-[#fffdf9] p-6 sm:p-10 border-8 border-double border-amber-800/60 rounded-xl shadow-md text-center flex flex-col justify-between mx-auto select-text overflow-hidden"
                style={{
                  aspectRatio: '1.414 / 1', // Standard A4 Landscape
                  maxWidth: '880px',
                  minHeight: '440px'
                }}
              >
                {/* Background Watermark */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
                  <ShieldCheck className="w-80 h-80 text-slate-900" />
                </div>

                {/* Top Section */}
                <div className="space-y-1 relative z-10">
                  <div className="flex items-center justify-center gap-2 text-blue-900 font-black text-xs sm:text-sm tracking-widest uppercase">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <span>CSSENTIAL LEARNING PLATFORM</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">
                    Computer System Installation and Configuration
                  </p>
                  <div className="w-20 h-0.5 bg-amber-500 mx-auto my-2" />
                  <h1 className="text-xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight uppercase">
                    Certificate of Technical Competency
                  </h1>
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest">
                    This certificate is proudly awarded to
                  </p>
                </div>

                {/* Center Recipient Section */}
                <div className="relative z-10 py-3 my-auto">
                  <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-950 inline-block px-6 pb-1 border-b-2 border-amber-400">
                    {recipientName}
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-2">
                    {recipientSection}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed mt-3">
                    For satisfactorily completing the laboratory competencies, diagnostic assessments, and technical practicums in{' '}
                    <strong className="text-slate-900">Computer System Installation and Configuration</strong>.
                  </p>
                </div>

                {/* Footer Section: Date and All 4 Researchers Signatories */}
                <div className="space-y-3 relative z-10 pt-3 border-t border-amber-200/80">
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Date Issued: <span className="font-mono text-gray-800 text-xs font-bold">{currentDate}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2">
                    <div className="text-center space-y-0.5">
                      <div className="w-4/5 max-w-[150px] mx-auto border-b border-gray-400 pb-1">
                        <span className="font-serif italic text-xs text-blue-950 font-bold block truncate">
                          J. W. Buban
                        </span>
                      </div>
                      <p className="text-[10.5px] font-bold text-gray-900 mt-1 truncate">J. W. Buban</p>
                      <p className="text-[9px] text-gray-500 truncate">Lead Developer &amp; Researcher</p>
                    </div>

                    <div className="text-center space-y-0.5">
                      <div className="w-4/5 max-w-[150px] mx-auto border-b border-gray-400 pb-1">
                        <span className="font-serif italic text-xs text-blue-950 font-bold block truncate">
                          Juliana Marizh B. Calapputu
                        </span>
                      </div>
                      <p className="text-[10.5px] font-bold text-gray-900 mt-1 truncate">Juliana Marizh B. Calapputu</p>
                      <p className="text-[9px] text-gray-500 truncate">Curriculum Lead &amp; Researcher</p>
                    </div>

                    <div className="text-center space-y-0.5">
                      <div className="w-4/5 max-w-[150px] mx-auto border-b border-gray-400 pb-1">
                        <span className="font-serif italic text-xs text-blue-950 font-bold block truncate">
                          Charlotte Mae H. Colon
                        </span>
                      </div>
                      <p className="text-[10.5px] font-bold text-gray-900 mt-1 truncate">Charlotte Mae H. Colon</p>
                      <p className="text-[9px] text-gray-500 truncate">Assessment Lead &amp; Researcher</p>
                    </div>

                    <div className="text-center space-y-0.5">
                      <div className="w-4/5 max-w-[150px] mx-auto border-b border-gray-400 pb-1">
                        <span className="font-serif italic text-xs text-blue-950 font-bold block truncate">
                          Precious Lara M. Timoteo
                        </span>
                      </div>
                      <p className="text-[10.5px] font-bold text-gray-900 mt-1 truncate">Precious Lara M. Timoteo</p>
                      <p className="text-[9px] text-gray-500 truncate">Usability Lead &amp; Researcher</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* NOT YET ELIGIBLE: PROGRESS TRACKER */
            <div className="space-y-6">
              
              <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-amber-950 text-sm">
                    Certification in Progress ({certInfo?.student_name})
                  </h4>
                  <p className="text-amber-800 leading-relaxed">
                    To earn your official CSSENTIAL Academic Certificate of Competency, students must achieve <strong>at least half the score (50% and up)</strong> across formative and diagnostic assessments.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1.5">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-950 bg-amber-200/70 px-2.5 py-1 rounded-md text-[11px]">
                      <span>Requirement:</span>
                      <span className="text-emerald-800 font-black">≥ 50% Score</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-gray-800 bg-white border border-amber-200 px-2.5 py-1 rounded-md text-[11px]">
                      <span>Current Score Average:</span>
                      <span className={(certInfo?.stats.averageScore || 0) >= 50 ? 'text-emerald-700 font-black' : 'text-amber-700 font-black'}>
                        {certInfo?.stats.averageScore || 0}%
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Requirements Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Pathway 1: Practical Activities */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-gray-700">Competency Activities (≥50%)</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      (certInfo?.stats.activitiesCount || 0) >= 2
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {certInfo?.stats.activitiesCount || 0} / 2 Passed
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Complete at least two structured exercises with at least half the score (e.g. Disassembly Procedure, Motherboard Identification).
                  </p>
                  {onNavigateToActivities && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToActivities();
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 pt-1 cursor-pointer"
                    >
                      <span>Go to Activities</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Pathway 2: Diagnostic Quizzes */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-gray-700">Diagnostic Quizzes (≥50%)</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      (certInfo?.stats.quizzesCount || 0) >= 1
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {certInfo?.stats.quizzesCount || 0} / 1 Passed
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Pass any module diagnostic quiz or the Comprehensive Computer System Quiz with at least half the score.
                  </p>
                </div>

                {/* Pathway 3: Interactive Games & Challenges */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-gray-700">Educational Games</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      (certInfo?.stats.gamesCount || 0) >= 1
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {certInfo?.stats.gamesCount || 0} / 1 Completed
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Solve any hardware game in the Games Hub (e.g. Cable &amp; Pinout Master, Code Cracker).
                  </p>
                  {onNavigateToGames && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToGames();
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 pt-1 cursor-pointer"
                    >
                      <span>Launch Games Hub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Pathway 4: Virtual PC Lab */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-gray-700">Virtual PC Lab / PC Build</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      certInfo?.stats.pcLabPassed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {certInfo?.stats.pcLabPassed ? 'Passed ✓' : 'Incomplete'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Assemble all stations in the Virtual PC Lab Simulator or complete the PC Build Simulator.
                  </p>
                </div>

              </div>

              {/* Fast-track notice */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1">
                <span className="font-bold flex items-center gap-1 text-blue-800">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Quick Certification Tip
                </span>
                <p className="text-blue-900/80">
                  Completing 1 Quiz and 1 Game immediately triggers full certification eligibility! Your progress is recorded in real time.
                </p>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <span className="text-[11px] text-gray-500 font-mono">
            Student ID: {studentId}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};

