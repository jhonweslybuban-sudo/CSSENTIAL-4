import React from 'react';
import {
  ChevronRight,
  Sparkles,
  Gamepad2,
  BookOpen,
  HelpCircle,
  Wrench,
  Bot,
  Bell,
  Cpu,
  ShieldAlert,
  Info
} from 'lucide-react';
import { LESSONS } from '../data/curriculum';
import { PageView } from '../types';
import { AnnouncementSlider } from './AnnouncementSlider';
import { InteractiveHardwareSlider } from './InteractiveHardwareSlider';

interface HomeWebWallProps {
  onNavigate: (page: PageView) => void;
  onSelectTopic?: (topicId: string) => void;
  onOpenGames?: () => void;
  onOpenAI?: () => void;
}

export const HomeWebWall: React.FC<HomeWebWallProps> = ({
  onNavigate,
  onSelectTopic,
  onOpenGames,
  onOpenAI
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Three-Column Web Wall Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* LEFT PANEL: FEATURED TOPICS */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 shadow-xs flex flex-col p-4">
          <div className="border-b border-gray-100 pb-3 mb-3">
            <h2 className="text-base font-extrabold text-blue-900 uppercase tracking-wide flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-700" />
              <span>FEATURED TOPICS</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Core curriculum units in Computer System Installation &amp; Configuration
            </p>
          </div>

          <div className="space-y-2 flex-1">
            {LESSONS.map((lesson) => (
              <button
                key={lesson.id}
                id={`featured-topic-${lesson.topicNumber}`}
                onClick={() => {
                  if (onSelectTopic) {
                    onSelectTopic(lesson.id);
                  }
                  onNavigate('COLLECTION');
                }}
                className="w-full text-left p-2.5 rounded-md border border-gray-200 hover:border-blue-400 hover:bg-blue-50/70 transition-all group flex items-start justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center shrink-0">
                      {lesson.topicNumber}
                    </span>
                    <h3 className="text-xs font-bold text-gray-900 group-hover:text-blue-800 line-clamp-1">
                      {lesson.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 pl-7 leading-tight">
                    {lesson.shortDesc}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
              </button>
            ))}
          </div>

          <button
            id="browse-all-topics-btn"
            onClick={() => onNavigate('COLLECTION')}
            className="w-full mt-3 py-2 px-3 text-xs font-bold text-center text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            VIEW ALL LESSON MODULES →
          </button>
        </div>

        {/* CENTER PANEL: INTERACTIVE HARDWARE OVERVIEW (SLIDABLE & UPLOADABLE) */}
        <div className="lg:col-span-6 flex flex-col">
          <InteractiveHardwareSlider onOpenDashboard={() => onNavigate('RESEARCHER')} />
        </div>

        {/* RIGHT PANEL: QUICK LINKS */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 shadow-xs p-4 flex flex-col">
          <div className="border-b border-gray-100 pb-3 mb-3">
            <h2 className="text-base font-extrabold text-blue-900 uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-700" />
              <span>QUICK LINKS</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Direct access to interactive learning tools
            </p>
          </div>

          <div className="space-y-2.5 flex-1">
            
            {/* Quick Quiz */}
            <button
              id="quick-link-quiz"
              onClick={() => {
                onNavigate('ACTIVITIES');
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 hover:border-blue-400 transition-all text-left group"
            >
              <div className="w-9 h-9 bg-blue-700 text-white rounded-md flex items-center justify-center shrink-0 shadow-xs">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900 group-hover:text-blue-900">
                  Quick Quiz Assessment
                </div>
                <div className="text-[11px] text-gray-500">
                  Test your hardware knowledge
                </div>
              </div>
            </button>

            {/* Games Hub */}
            <button
              id="quick-link-games"
              onClick={() => onNavigate('GAMES_HUB')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 hover:border-purple-400 transition-all text-left group"
            >
              <div className="w-9 h-9 bg-purple-700 text-white rounded-md flex items-center justify-center shrink-0 shadow-xs">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900 group-hover:text-purple-900">
                  Interactive Games Hub
                </div>
                <div className="text-[11px] text-gray-500">
                  13 educational games &amp; simulators
                </div>
              </div>
            </button>

            {/* Collection */}
            <button
              id="quick-link-collection"
              onClick={() => onNavigate('COLLECTION')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 hover:border-emerald-400 transition-all text-left group"
            >
              <div className="w-9 h-9 bg-emerald-700 text-white rounded-md flex items-center justify-center shrink-0 shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900 group-hover:text-emerald-900">
                  Learning Collection
                </div>
                <div className="text-[11px] text-gray-500">
                  Presentations, downloads &amp; videos
                </div>
              </div>
            </button>

            {/* Troubleshooting Guide */}
            <button
              id="quick-link-troubleshooting"
              onClick={() => onNavigate('ACTIVITIES')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 hover:border-amber-400 transition-all text-left group"
            >
              <div className="w-9 h-9 bg-amber-600 text-white rounded-md flex items-center justify-center shrink-0 shadow-xs">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900 group-hover:text-amber-900">
                  Troubleshooting Scenarios
                </div>
                <div className="text-[11px] text-gray-500">
                  Black screens, beeps, power cuts
                </div>
              </div>
            </button>

            {/* AI Learning Assistant */}
            <button
              id="quick-link-ai-assistant"
              onClick={() => {
                if (onOpenAI) {
                  onOpenAI();
                } else {
                  window.dispatchEvent(new CustomEvent('open-cssential-ai'));
                }
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-sky-200 bg-sky-50/50 hover:bg-sky-100/60 hover:border-sky-400 transition-all text-left group"
            >
              <div className="w-9 h-9 bg-sky-600 text-white rounded-md flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900 group-hover:text-sky-900">
                  CSSENTIAL AI Assistant
                </div>
                <div className="text-[11px] text-gray-500">
                  Smart explanations &amp; hints
                </div>
              </div>
            </button>

          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <span className="text-[11px] text-gray-400 font-medium">
              Interactive Hardware Learning Platform
            </span>
          </div>
        </div>

      </div>

      {/* BOTTOM PANEL: 3-SECOND AUTO-SLIDING ANNOUNCEMENTS & LAB NOTICES */}
      <AnnouncementSlider />

    </div>
  );
};
