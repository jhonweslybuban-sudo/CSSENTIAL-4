import React, { useState, useEffect } from 'react';
import {
  Wrench,
  ClipboardCheck,
  Cpu,
  Sliders,
  CheckCircle2,
  Search,
  BookOpen,
  HelpCircle,
  ShieldAlert,
  Gamepad2,
  Play,
  ArrowRight,
  GraduationCap,
  RotateCcw
} from 'lucide-react';
import { ACTIVITIES_DATA, ActivityDefinition } from '../data/curriculum';
import { api } from '../services/api';

interface ActivitiesViewProps {
  onSelectActivity: (activity: ActivityDefinition) => void;
  onOpenGames: () => void;
  studentId?: string;
}

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  onSelectActivity,
  onOpenGames,
  studentId
}) => {
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);

  useEffect(() => {
    const list = api.getCompletedActivities(studentId);
    setCompletedActivities(list);
  }, [studentId]);

  const isActivityCompleted = (actName: string) => {
    return completedActivities.includes(actName);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert':
        return <ShieldAlert className="w-6 h-6 text-blue-700" />;
      case 'Wrench':
        return <Wrench className="w-6 h-6 text-blue-700" />;
      case 'ClipboardCheck':
        return <ClipboardCheck className="w-6 h-6 text-blue-700" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-blue-700" />;
      case 'Sliders':
        return <Sliders className="w-6 h-6 text-blue-700" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-6 h-6 text-blue-700" />;
      case 'Search':
        return <Search className="w-6 h-6 text-blue-700" />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6 text-blue-700" />;
      case 'HelpCircle':
      default:
        return <HelpCircle className="w-6 h-6 text-blue-700" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title & Introduction */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-blue-700 flex items-center justify-center gap-1.5">
          <GraduationCap className="w-4 h-4" />
          <span>Curriculum Formative Assessments</span>
        </span>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-blue-950 uppercase">
          CHOOSE AN ACTIVITY
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          The activities below are the <strong className="text-gray-900 font-semibold">Lesson Activity Quizzes</strong> directly tied to each module in the curriculum. Choose a lesson activity quiz to test your diagnostic and assembly knowledge.
        </p>
      </div>

      {/* 8 Activity Cards Grid (Lesson Quizzes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {ACTIVITIES_DATA.map((act, index) => {
          const completed = isActivityCompleted(act.name);
          return (
            <div
              key={act.id}
              id={`activity-card-${index + 1}`}
              className={`rounded-xl border shadow-xs hover:shadow-md transition-all flex flex-col justify-between p-5 group ${
                completed
                  ? 'bg-emerald-50/20 border-emerald-300 hover:border-emerald-500'
                  : 'bg-white border-gray-200 hover:border-blue-500'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-colors ${
                      completed
                        ? 'bg-emerald-100 border-emerald-200 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white'
                        : 'bg-blue-50 border-blue-100 group-hover:bg-blue-600 group-hover:text-white'
                    }`}
                  >
                    <span className="group-hover:text-white">
                      {completed ? <CheckCircle2 className="w-6 h-6 text-emerald-700 group-hover:text-white" /> : getIcon(act.iconName)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {completed && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wider uppercase text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full shadow-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        COMPLETED
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      {act.lessonBadge}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-gray-900 group-hover:text-blue-900 transition-colors line-clamp-2">
                    {act.name}
                  </h3>
                  <span className="inline-block text-[11px] font-semibold text-blue-700 mb-1.5">
                    {act.type}
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                    {act.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">
                  {act.totalItems} {act.totalItems === 1 ? 'Question' : 'Questions'}
                </span>
                <button
                  id={`start-activity-btn-${act.id}`}
                  onClick={() => onSelectActivity(act)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer shadow-xs active:scale-95 ${
                    completed
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-blue-50 hover:bg-blue-700 text-blue-700 hover:text-white'
                  }`}
                >
                  {completed ? (
                    <>
                      <span>COMPLETED</span>
                      <RotateCcw className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <span>START QUIZ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Wireframe Distinct PLAY Section: Interactive Game Challenges */}
      <div className="text-center pt-6 pb-2">
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-indigo-700 block">
              Interactive Game Challenges
            </span>
            <h3 className="text-xl font-black text-blue-950">
              Looking for Gamified Challenges?
            </h3>
            <p className="text-xs text-gray-600 max-w-lg mx-auto leading-relaxed">
              While the activities above are formative lesson quizzes, clicking the <strong className="text-blue-900 font-bold">PLAY</strong> button below unlocks the 10 interactive game challenges (Arcade Sorting, Code Cracker, Motherboard Search, Sequence Ordering, Cable Pinout Master, and more).
            </p>
          </div>
          <button
            id="activities-play-games-hub-btn"
            onClick={onOpenGames}
            className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-blue-700 hover:bg-blue-800 text-white font-black text-lg rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Gamepad2 className="w-6 h-6" />
            <span>🎮 PLAY</span>
          </button>
        </div>
      </div>

    </div>
  );
};
