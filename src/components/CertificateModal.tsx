import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, AlertCircle, Printer, Copy, Check, X, ShieldCheck, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

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

  const handlePrint = () => {
    window.print();
  };

  const handleCopyId = () => {
    if (certInfo?.certificate_id) {
      navigator.clipboard.writeText(certInfo.certificate_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isEligible = certInfo?.isEligible;
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Academic Certificate of Competency</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  CSIC Verification
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Automated Verification &amp; Competency Assessment Tracking
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
        <div className="p-5 sm:p-8 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="py-16 text-center text-gray-500 space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold">Verifying academic records &amp; practical laboratory requirements...</p>
            </div>
          ) : isEligible ? (
            /* ELIGIBLE: CERTIFICATE VIEW */
            <div className="space-y-6">
              
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
                <div className="flex items-center gap-2.5 text-emerald-900 text-xs font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Congratulations! You have satisfied all technical competency criteria.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyId}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied ID' : 'Copy ID'}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-black shadow-xs transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Save PDF</span>
                  </button>
                </div>
              </div>

              {/* Printable Certificate Frame */}
              <div
                id="printable-certificate"
                className="relative bg-amber-50/40 p-8 sm:p-12 border-8 border-double border-amber-800/40 rounded-2xl shadow-inner text-center space-y-6 select-text overflow-hidden"
              >
                {/* Certificate Background Pattern Watermark */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
                  <ShieldCheck className="w-96 h-96 text-slate-900" />
                </div>

                {/* Institution & Platform Headers */}
                <div className="space-y-1 relative z-10">
                  <div className="flex items-center justify-center gap-2 text-blue-900 font-black text-sm tracking-widest uppercase">
                    <ShieldCheck className="w-5 h-5 text-blue-700" />
                    <span>CSSENTIAL LEARNING PLATFORM</span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-semibold tracking-wide uppercase">
                    One-Click Multi-Intervention Platform for Computer System Installation &amp; Configuration
                  </p>
                  <div className="w-24 h-0.5 bg-amber-500 mx-auto my-3" />
                  <h1 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight">
                    CERTIFICATE OF TECHNICAL COMPETENCY
                  </h1>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">
                    This is proudly presented to
                  </p>
                </div>

                {/* Recipient Name */}
                <div className="relative z-10 py-2">
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-blue-950 underline decoration-amber-400 decoration-2 underline-offset-8">
                    {certInfo?.student_name || studentName}
                  </h2>
                  <p className="text-xs font-semibold text-gray-600 mt-2">
                    {certInfo?.year_section || yearSection}
                  </p>
                </div>

                {/* Achievement Citation */}
                <p className="text-xs sm:text-sm text-gray-700 max-w-2xl mx-auto leading-relaxed relative z-10">
                  For successfully demonstrating practical technical proficiency, rigorous safety adherence, and diagnostic competency in{' '}
                  <strong className="text-slate-900">Computer System Installation and Configuration</strong>, including Motherboard Architecture, Component Pinouts, Virtual Laboratory PC Assembly, and UEFI BIOS Setup Diagnostics.
                </p>

                {/* Verification Seal & Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-amber-200/80 relative z-10">
                  <div className="text-left space-y-0.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Issue Date</span>
                    <span className="text-xs font-bold text-gray-800 font-mono">{currentDate}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">✓ System Verified</span>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-2 border-amber-500 bg-amber-100 flex items-center justify-center shadow-xs">
                      <Award className="w-8 h-8 text-amber-700" />
                    </div>
                    <span className="text-[9px] font-black uppercase text-amber-900 tracking-widest mt-1">OFFICIAL SEAL</span>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Verification ID</span>
                    <span className="text-xs font-mono font-black text-blue-900">{certInfo?.certificate_id}</span>
                    <span className="text-[10px] text-gray-500 block">DepEd / TVET Aligned</span>
                  </div>
                </div>

                {/* Researchers & Faculty Signatures */}
                <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-amber-200/60 relative z-10 text-center">
                  <div>
                    <div className="w-28 h-8 mx-auto border-b border-gray-400 flex items-end justify-center pb-1">
                      <span className="font-serif italic text-xs text-blue-900 font-bold">J. W. Buban</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-800 mt-1">Jhon Wesly T. Buban</p>
                    <p className="text-[9px] text-gray-400">Technical Lead</p>
                  </div>
                  <div>
                    <div className="w-28 h-8 mx-auto border-b border-gray-400 flex items-end justify-center pb-1">
                      <span className="font-serif italic text-xs text-indigo-900 font-bold">J. M. Calaputpu</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-800 mt-1">Juliana Marizh B. Calaputpu</p>
                    <p className="text-[9px] text-gray-400">Curriculum Lead</p>
                  </div>
                  <div>
                    <div className="w-28 h-8 mx-auto border-b border-gray-400 flex items-end justify-center pb-1">
                      <span className="font-serif italic text-xs text-cyan-900 font-bold">C. M. Colon</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-800 mt-1">Charlotte Mae H. Colon</p>
                    <p className="text-[9px] text-gray-400">Assessment Lead</p>
                  </div>
                  <div>
                    <div className="w-28 h-8 mx-auto border-b border-gray-400 flex items-end justify-center pb-1">
                      <span className="font-serif italic text-xs text-purple-900 font-bold">P. L. Timoteo</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-800 mt-1">Precious Lara M. Timoteo</p>
                    <p className="text-[9px] text-gray-400">Usability Lead</p>
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
                    To earn your official CSSENTIAL Academic Certificate of Competency, complete any of the standard qualifying pathways below:
                  </p>
                </div>
              </div>

              {/* Requirements Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Pathway 1: Practical Activities */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-gray-700">Competency Activities</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      (certInfo?.stats.activitiesCount || 0) >= 2
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {certInfo?.stats.activitiesCount || 0} / 2 Completed
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Complete at least two structured exercises (e.g. Disassembly Procedure, Motherboard Identification).
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
                    <span className="text-xs font-black uppercase text-gray-700">Diagnostic Quizzes</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      (certInfo?.stats.quizzesCount || 0) >= 1
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {certInfo?.stats.quizzesCount || 0} / 1 Completed
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Pass any module diagnostic quiz or the Comprehensive Computer System Quiz.
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
