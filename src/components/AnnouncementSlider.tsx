import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Calendar,
  Sparkles,
  ShieldAlert,
  Cpu,
  Info,
  ExternalLink,
  Layers
} from 'lucide-react';
import { AnnouncementItem } from '../types';
import { api } from '../services/api';

export const AnnouncementSlider: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load announcements from api
  const refreshAnnouncements = () => {
    const list = api.getAnnouncements();
    setAnnouncements(list.length > 0 ? list : []);
  };

  useEffect(() => {
    refreshAnnouncements();

    const handleUpdate = () => {
      refreshAnnouncements();
    };

    window.addEventListener('cssential_announcements_updated', handleUpdate);
    return () => {
      window.removeEventListener('cssential_announcements_updated', handleUpdate);
    };
  }, []);

  // 3-second auto-rotate timer
  useEffect(() => {
    if (announcements.length <= 1 || isPaused || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 3000); // 3 seconds as requested!

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [announcements.length, isPaused, isHovered]);

  const handleNext = () => {
    if (announcements.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const handlePrev = () => {
    if (announcements.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  if (announcements.length === 0) return null;

  const active = announcements[currentIndex] || announcements[0];

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'safety':
        return {
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: ShieldAlert,
          accentColor: '#D97706',
          boxBorder: 'border-amber-200'
        };
      case 'exam':
        return {
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: Cpu,
          accentColor: '#E11D48',
          boxBorder: 'border-rose-200'
        };
      case 'game':
        return {
          badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: Sparkles,
          accentColor: '#9333EA',
          boxBorder: 'border-purple-200'
        };
      default:
        return {
          badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: Info,
          accentColor: '#2563EB',
          boxBorder: 'border-blue-200'
        };
    }
  };

  const currentTheme = getCategoryTheme(active.category);
  const CategoryIcon = currentTheme.icon;

  return (
    <div
      className="relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase text-gray-900 tracking-wider flex items-center gap-2">
              <span>LIVE LABORATORY ANNOUNCEMENTS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-[11px] text-gray-500">
              Auto-rotating updates (slides every 3s • hover to pause)
            </p>
          </div>
        </div>

        {/* Carousel controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono font-bold text-gray-500 px-2 py-0.5 bg-gray-200/80 rounded-md">
            {currentIndex + 1} / {announcements.length}
          </span>
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer ${
              isPaused
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
            title={isPaused ? 'Resume auto-sliding' : 'Pause auto-sliding'}
            aria-label={isPaused ? 'Resume rotation' : 'Pause rotation'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 rounded-md bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 rounded-md bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Next announcement"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar for the 3-second cycle */}
      {!isPaused && !isHovered && announcements.length > 1 && (
        <div className="w-full h-1 bg-gray-100 overflow-hidden">
          <div
            key={currentIndex}
            className="h-full bg-blue-600 animate-[progress_3s_linear]"
            style={{
              animation: 'cssential_progress 3s linear'
            }}
          />
        </div>
      )}

      {/* Main Slide Card */}
      <div className="p-5 transition-all duration-300">
        <div className="flex flex-col md:flex-row gap-5 items-start">
          
          {/* If there is an uploaded image */}
          {active.imageUrl && (
            <div className="w-full md:w-56 lg:w-64 h-36 shrink-0 rounded-lg overflow-hidden border border-gray-200 shadow-inner bg-slate-900 relative group">
              <img
                src={active.imageUrl}
                alt={active.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                <span className="text-[10px] text-white font-medium flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Attached Visual
                </span>
              </div>
            </div>
          )}

          {/* Announcement Text Body */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${currentTheme.badgeBg}`}>
                <CategoryIcon className="w-3 h-3" />
                <span>{active.category}</span>
              </span>

              {active.date && (
                <span className="text-[11px] text-gray-500 flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3" />
                  <span>{active.date}</span>
                </span>
              )}
            </div>

            <h3 className="text-base font-black text-gray-900 tracking-tight">
              {active.title}
            </h3>

            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
              {active.content}
            </p>

            {active.link && (
              <div className="pt-2">
                <a
                  href={active.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <span>Learn more / View resource</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="px-5 py-2.5 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          {announcements.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentIndex === idx
                  ? 'w-6 bg-blue-600'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to announcement slide ${idx + 1}`}
            />
          ))}
        </div>
        <span className="text-[11px] text-gray-400">
          Manage announcements via <strong>Researcher Dashboard</strong>
        </span>
      </div>

      {/* Custom Keyframe Style for progress bar */}
      <style>{`
        @keyframes cssential_progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};
