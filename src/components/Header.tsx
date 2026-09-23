import React, { useState, useEffect, useRef } from 'react';
import { Monitor, ArrowLeft, User, ShieldCheck, Palette, Award, GraduationCap, Settings, ChevronDown, Sparkles, LogOut } from 'lucide-react';
import { PageView, BrandingSettings } from '../types';
import { api } from '../services/api';

interface HeaderProps {
  currentPage?: PageView;
  onNavigate?: (page: PageView) => void;
  onReturn: () => void;
  canReturn: boolean;
  studentName?: string;
  onOpenResearcher?: () => void;
  onOpenDashboard?: () => void;
  onOpenTeacherCMS?: (tab?: 'ACTIVITIES' | 'MATERIALS') => void;
  onOpenThemeModal?: () => void;
  onOpenStudentModal?: () => void;
  onOpenCertificate?: () => void;
  onLogout?: () => void;
  sessionTimeFormatted?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onReturn,
  canReturn,
  studentName,
  onOpenResearcher,
  onOpenDashboard,
  onOpenTeacherCMS,
  onOpenThemeModal,
  onOpenStudentModal,
  onOpenCertificate,
  onLogout,
  sessionTimeFormatted = '00:00'
}) => {
  const [branding, setBranding] = useState<BrandingSettings>(() => api.getBranding());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial fetch from server to get persistent database branding
    api.fetchRemoteBranding().then(b => setBranding(b));

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setBranding(e.detail);
      } else {
        setBranding(api.getBranding());
      }
    };

    window.addEventListener('cssential_branding_updated', handleUpdate);
    return () => window.removeEventListener('cssential_branding_updated', handleUpdate);
  }, []);

  // Close Settings dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSettingsOpen(false);
      }
    };

    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSettingsOpen]);

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-xs sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Logo, Title & Subtitle */}
          <div className="flex items-center gap-3.5">
            {branding.logoUrl ? (
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-blue-200 bg-white shadow-xs shrink-0 flex items-center justify-center p-0.5">
                <img
                  src={branding.logoUrl}
                  alt={branding.siteTitle || 'Website Logo'}
                  className="w-full h-full object-contain rounded-md"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0">
                <Monitor className="w-7 h-7" strokeWidth={2.2} />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-blue-900 leading-none">
                  {branding.siteTitle || 'CSSENTIAL'}
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                  Learning Platform
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium line-clamp-1 mt-0.5 max-w-2xl">
                {branding.siteSubtitle || 'A One-Click Multi-Intervention Platform for Troubleshooting Computer System Installation and Configuration'}
              </p>
            </div>
          </div>

          {/* Right Action Controls: Clean & Uncluttered layout */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            
            {/* User Session Info / Switcher & Log Out */}
            {studentName ? (
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  id="header-user-profile-btn"
                  onClick={onOpenStudentModal}
                  title="Click to view profile or switch account"
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-gray-700 hover:bg-blue-100/70 transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-bold text-gray-900 max-w-[150px] truncate">{studentName}</span>
                </button>
                {onLogout && (
                  <button
                    id="header-logout-btn"
                    onClick={onLogout}
                    title="Log Out of CSSENTIAL PORTAL"
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-600 hover:text-red-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                id="header-login-signup-btn"
                onClick={onOpenStudentModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            )}

            {/* UNIFIED SETTINGS DROPDOWN: Houses Color Palettes, CSSENTIAL Portal Certificate, and Telemetry Dashboard */}
            <div className="relative" ref={settingsRef}>
              <button
                id="header-settings-btn"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                title="Platform Settings & Tools"
                aria-haspopup="true"
                aria-expanded={isSettingsOpen}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold rounded-lg border transition-all cursor-pointer shadow-xs ${
                  isSettingsOpen
                    ? 'bg-blue-50 border-blue-400 text-blue-800 ring-2 ring-blue-100'
                    : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900'
                }`}
              >
                <Settings className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isSettingsOpen ? 'rotate-90 text-blue-600' : ''}`} />
                <span>Settings</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isSettingsOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Panel */}
              {isSettingsOpen && (
                <div
                  id="header-settings-menu"
                  role="menu"
                  className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-black/5"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-black uppercase tracking-wider text-gray-500">Platform Settings</p>
                    <p className="text-[11px] text-gray-400">Personalization, Credentials &amp; Telemetry</p>
                  </div>

                  <div className="p-1.5 space-y-1">
                    {/* 1. Color Palettes */}
                    {onOpenThemeModal && (
                      <button
                        id="settings-theme-btn"
                        role="menuitem"
                        onClick={() => {
                          setIsSettingsOpen(false);
                          onOpenThemeModal();
                        }}
                        className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-purple-50/70 text-left transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-purple-200 group-hover:scale-105 transition-all">
                          <Palette className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-800 group-hover:text-purple-900">Color Palettes</span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded">Theme</span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                            Switch between 4 curated colorways or custom colors
                          </p>
                        </div>
                      </button>
                    )}

                    {/* 2. CSSENTIAL Portal Certificate */}
                    {onOpenCertificate && (
                      <button
                        id="settings-certificate-btn"
                        role="menuitem"
                        onClick={() => {
                          setIsSettingsOpen(false);
                          onOpenCertificate();
                        }}
                        className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-amber-50/70 text-left transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-200 group-hover:scale-105 transition-all">
                          <Award className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-800 group-hover:text-amber-900">CSSENTIAL Portal Certificate</span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">Academic</span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                            Academic Certificate of Technical Competency
                          </p>
                        </div>
                      </button>
                    )}

                    {/* 3. Telemetry Dashboard */}
                    <button
                      id="settings-telemetry-btn"
                      role="menuitem"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        if (onOpenDashboard) onOpenDashboard();
                        else if (onOpenResearcher) onOpenResearcher();
                      }}
                      className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-blue-50/70 text-left transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-200 group-hover:scale-105 transition-all">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-800 group-hover:text-blue-900">Telemetry Dashboard</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">Analytics</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                          Student activity tracking &amp; intervention metrics
                        </p>
                      </div>
                    </button>

                    {/* 4. Teacher CMS (if applicable) */}
                    {onOpenTeacherCMS && (
                      <button
                        id="settings-teacher-cms-btn"
                        role="menuitem"
                        onClick={() => {
                          setIsSettingsOpen(false);
                          onOpenTeacherCMS('MATERIALS');
                        }}
                        className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-emerald-50/70 text-left transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-200 group-hover:scale-105 transition-all">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-800 group-hover:text-emerald-900">Teacher Authoring CMS</span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">Instructor</span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                            Curriculum management &amp; assessment editor
                          </p>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Account / User Section Footer */}
                  <div className="mt-1 pt-2 px-3 pb-1 border-t border-gray-100 bg-gray-50/70 rounded-b-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="text-[11px] text-gray-600 truncate">
                        {studentName ? `Active: ${studentName}` : 'Guest Session'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {onOpenStudentModal && (
                        <button
                          onClick={() => {
                            setIsSettingsOpen(false);
                            onOpenStudentModal();
                          }}
                          className="text-[11px] font-bold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer"
                        >
                          {studentName ? 'Profile' : 'Log In / Register'}
                        </button>
                      )}
                      {studentName && onLogout && (
                        <button
                          onClick={() => {
                            setIsSettingsOpen(false);
                            onLogout();
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Log Out</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Return Button */}
            <button
              id="header-return-btn"
              onClick={onReturn}
              disabled={!canReturn}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-black rounded-lg border transition-all ${
                canReturn
                  ? 'bg-white border-blue-600 text-blue-700 hover:bg-blue-50 shadow-xs cursor-pointer active:scale-95'
                  : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

