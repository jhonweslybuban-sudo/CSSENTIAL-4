import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Layers,
  Image as ImageIcon,
  ShieldCheck
} from 'lucide-react';
import { HardwareOverviewSlide } from '../types';
import { api } from '../services/api';

interface InteractiveHardwareSliderProps {
  onOpenDashboard?: () => void;
}

export const InteractiveHardwareSlider: React.FC<InteractiveHardwareSliderProps> = ({
  onOpenDashboard
}) => {
  const [slides, setSlides] = useState<HardwareOverviewSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Swipe gesture support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const loadSlides = useCallback(async () => {
    try {
      const data = await api.getHardwareSlides();
      setSlides(data || []);
      if (currentIndex >= (data?.length || 0)) {
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Failed to load hardware slides:', err);
    }
  }, [currentIndex]);

  useEffect(() => {
    loadSlides();
  }, [loadSlides]);

  // Autoplay timer
  useEffect(() => {
    if (!isPlaying || slides.length <= 1 || isZoomOpen) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPlaying, slides.length, isZoomOpen]);

  const handlePrev = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentSlide = slides[currentIndex] || null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 flex flex-col justify-between overflow-hidden relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-3 right-3 z-30 bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-2.5 mb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Interactive Hardware Overview
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-800 rounded-md border border-blue-100">
              Slidable Gallery
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-gray-900 mt-0.5">
            Computer System Assembly &amp; Diagnostics
          </h2>
        </div>

        {onOpenDashboard && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={onOpenDashboard}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              title="Manage in Researcher Dashboard"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Manage Slides</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Slidable Carousel Viewport */}
      <div
        className="relative w-full h-[290px] sm:h-[340px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner group select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Grid Accent */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>

        {currentSlide ? (
          <div className="relative w-full h-full">
            {/* Slide Image */}
            <img
              src={currentSlide.imageUrl}
              alt={currentSlide.title}
              className="w-full h-full object-cover object-center transition-all duration-500 transform group-hover:scale-102"
              referrerPolicy="no-referrer"
            />

            {/* Gradient Overlays for readable text */}
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/35 to-black/30 pointer-events-none"></div>

            {/* Top Bar Badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-auto">
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-blue-600/90 text-white rounded-lg backdrop-blur-xs border border-blue-400/30 shadow-xs">
                  {currentSlide.category || 'Hardware Anatomy'}
                </span>
                {currentSlide.isCustom && (
                  <span className="px-2 py-1 text-[10px] font-bold bg-amber-500/90 text-amber-950 rounded-lg backdrop-blur-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-950" />
                    Custom Upload
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Fullscreen Zoom */}
                <button
                  onClick={() => setIsZoomOpen(true)}
                  className="p-1.5 bg-black/60 hover:bg-black/90 text-white rounded-lg backdrop-blur-xs transition-colors cursor-pointer border border-white/20"
                  title="Zoom / Inspect Details"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                {/* Play/Pause Autoplay */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 bg-black/60 hover:bg-black/90 text-white rounded-lg backdrop-blur-xs transition-colors cursor-pointer border border-white/20"
                  title={isPlaying ? 'Pause auto-slide' : 'Play auto-slide'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                </button>
                {/* Slide Counter */}
                <span className="px-2 py-1 text-[10px] font-mono font-bold bg-black/70 text-gray-200 rounded-lg backdrop-blur-xs border border-white/20">
                  {String(currentIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Bottom Caption Overlay */}
            <div className="absolute bottom-10 left-4 right-4 z-10 text-white pointer-events-none">
              <h3 className="text-base sm:text-lg font-black tracking-tight drop-shadow-md line-clamp-1">
                {currentSlide.title}
              </h3>
              {currentSlide.subtitle && (
                <p className="text-xs sm:text-xs text-blue-300 font-semibold mt-0.5 line-clamp-1 drop-shadow-sm">
                  {currentSlide.subtitle}
                </p>
              )}
              <p className="text-[11px] sm:text-xs text-gray-300 mt-1 line-clamp-2 max-w-2xl leading-relaxed drop-shadow-sm">
                {currentSlide.description}
              </p>
            </div>

            {/* Previous Arrow Button */}
            <button
              onClick={handlePrev}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 shadow-lg cursor-pointer transition-all hover:scale-110 active:scale-95"
              aria-label="Previous hardware slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next Arrow Button */}
            <button
              onClick={handleNext}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 shadow-lg cursor-pointer transition-all hover:scale-110 active:scale-95"
              aria-label="Next hardware slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-xs font-bold text-gray-300">No hardware overview slides found</p>
            <p className="text-[11px] text-gray-500 mt-1">Slides can be configured in the Instructor / Researcher Dashboard</p>
          </div>
        )}

        {/* Carousel Pagination Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 z-20 flex items-center justify-center gap-1.5 pointer-events-auto">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? 'w-6 bg-blue-500' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Navigation Bar */}
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1 text-[11px]">
          <span className="font-semibold text-gray-700">Tip:</span> Use arrow buttons or swipe left/right to browse core hardware components.
        </div>
        {onOpenDashboard && (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDashboard}
              className="text-blue-700 hover:text-blue-800 font-bold hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <Layers className="w-3 h-3" />
              <span>Manage in Dashboard</span>
            </button>
          </div>
        )}
      </div>

      {/* FULLSCREEN LIGHTBOX ZOOM MODAL */}
      {isZoomOpen && currentSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            
            {/* Lightbox Header */}
            <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                  {currentSlide.category || 'Hardware Architecture'}
                </span>
                <h4 className="text-sm sm:text-base font-black truncate max-w-xl">
                  {currentSlide.title}
                </h4>
              </div>
              <button
                onClick={() => setIsZoomOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-res Image Display */}
            <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-black">
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.title}
                className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Description Footer */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 text-gray-300 text-xs">
              {currentSlide.subtitle && (
                <div className="text-xs font-bold text-blue-300 mb-1">
                  {currentSlide.subtitle}
                </div>
              )}
              <p className="leading-relaxed">{currentSlide.description}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
