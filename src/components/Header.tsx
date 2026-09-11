import React, { useState, useEffect } from 'react';
import { Monitor, ArrowLeft, User, ShieldCheck, Palette } from 'lucide-react';
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
  onOpenThemeModal?: () => void;
  onOpenStudentModal?: () => void;
  sessionTimeFormatted?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onReturn,
  canReturn,
  studentName,
  onOpenResearcher,
  onOpenDashboard,
  onOpenThemeModal,
  onOpenStudentModal,
  sessionTimeFormatted = '00:00'
}) => {
  const [branding, setBranding] = useState<BrandingSettings>(() => api.getBranding());

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

          {/* Right Action Controls: Return Button, Theme Picker, Student Badge, Researcher link */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            
            {/* Color Palette Switcher */}
            {onOpenThemeModal && (
              <button
                id="header-theme-btn"
                onClick={onOpenThemeModal}
                title="Choose from 4 Custom Color Palettes"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                <Palette className="w-4 h-4 text-purple-600" />
                <span className="hidden md:inline">Color Palettes</span>
              </button>
            )}

            {/* Student Session Info / Switcher */}
            {studentName ? (
              <button
                onClick={onOpenStudentModal}
                title="Click to view or switch student profile"
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-blue-50/60 border border-blue-200/80 rounded-lg text-xs text-gray-700 hover:bg-blue-100/60 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-bold text-gray-900 max-w-[120px] truncate">{studentName}</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500 font-mono">{sessionTimeFormatted}</span>
              </button>
            ) : (
              <button
                onClick={onOpenStudentModal}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Student Login</span>
              </button>
            )}

            {/* Telemetry Dashboard Access */}
            <button
              id="header-researcher-btn"
              onClick={onOpenDashboard || onOpenResearcher}
              title="Student Activity & Telemetry Dashboard"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span className="hidden sm:inline">Telemetry Dashboard</span>
            </button>

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

