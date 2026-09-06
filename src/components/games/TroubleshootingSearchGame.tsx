import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  ArrowLeft,
  Trophy,
  BookOpen,
  Lightbulb,
  Info,
  Sparkles,
  Check
} from 'lucide-react';
import { WORKSPACE_OBJECTS, SearchTarget } from '../../data/gamesData';
import { api } from '../../services/api';
import { HardwareVisualArt, VisualFieldGuideModal } from './HardwareVisualAssets';

interface TroubleshootingSearchGameProps {
  studentId: string;
  sessionId: string;
  onBack: () => void;
}

export const TroubleshootingSearchGame: React.FC<TroubleshootingSearchGameProps> = ({
  studentId,
  sessionId,
  onBack
}) => {
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintCount, setHintCount] = useState(0);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Determine current unfound target
  const unfoundTargets = WORKSPACE_OBJECTS.filter(obj => !foundIds.includes(obj.id));
  const currentTarget = unfoundTargets[currentTargetIndex % (unfoundTargets.length || 1)] || WORKSPACE_OBJECTS[0];

  const handleSvgClick = async (e: React.MouseEvent<SVGSVGElement>) => {
    if (isCompleted || !currentTarget) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if clicked current target
    const b = currentTarget.bbox;
    const isTargetHit =
      clickX >= b.x &&
      clickX <= b.x + b.width &&
      clickY >= b.y &&
      clickY <= b.y + b.height;

    if (isTargetHit) {
      const nextFound = [...foundIds, currentTarget.id];
      setFoundIds(nextFound);
      setShowHint(false);
      setFeedback({ text: `Correct! You found the ${currentTarget.name}! 🎯` });

      if (nextFound.length === WORKSPACE_OBJECTS.length) {
        setIsCompleted(true);
        clearInterval(timerRef.current);
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

        await api.recordGameResult({
          student_id: studentId,
          session_id: sessionId,
          game_name: 'Troubleshooting Search',
          start_time: new Date(startTimeRef.current).toISOString(),
          end_time: new Date().toISOString(),
          duration_seconds: duration,
          score: 100,
          level: 1,
          completed: true
        });
      } else {
        setTimeout(() => {
          setFeedback(null);
          setCurrentTargetIndex(0); // target advances to next unfound item
        }, 1000);
      }
    } else {
      // Check if they clicked another object by mistake to give educational feedback
      const clickedOther = WORKSPACE_OBJECTS.find(
        o =>
          clickX >= o.bbox.x &&
          clickX <= o.bbox.x + o.bbox.width &&
          clickY >= o.bbox.y &&
          clickY <= o.bbox.y + o.bbox.height
      );

      if (clickedOther && clickedOther.id !== currentTarget.id) {
        setFeedback({
          text: `That is the ${clickedOther.name}! Look for the ${currentTarget.name} instead.`,
          isError: true
        });
      } else {
        setFeedback({
          text: `Not quite! Check the visual traits in the top mission banner and look closely.`,
          isError: true
        });
      }
      setTimeout(() => setFeedback(null), 2200);
    }
  };

  const handleRestart = () => {
    setFoundIds([]);
    setCurrentTargetIndex(0);
    setFeedback(null);
    setIsCompleted(false);
    setElapsedTime(0);
    setShowHint(false);
    setHintCount(0);
    startTimeRef.current = Date.now();
  };

  const toggleHint = () => {
    setShowHint(true);
    setHintCount(prev => prev + 1);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      
      {/* 1. Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-xs gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-xs font-bold text-gray-600 hover:text-blue-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO GAMES</span>
          </button>

          <button
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold transition-colors cursor-pointer border border-indigo-200"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Visual Field Guide</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-mono text-xs bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700 border border-gray-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{formatTime(elapsedTime)}</span>
          </div>

          <div className="text-xs font-bold text-emerald-900 bg-emerald-50 px-3.5 py-1.5 rounded-lg border border-emerald-200">
            Found: <strong className="text-emerald-700 text-sm font-black">{foundIds.length}</strong> / {WORKSPACE_OBJECTS.length}
          </div>

          <button
            onClick={handleRestart}
            className="text-xs font-bold text-gray-500 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Visual Target Mission Card (Prevents wrong answers by showing exact appearance) */}
      {!isCompleted && currentTarget && (
        <div className="bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-blue-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
          
          <div className="flex items-center gap-4">
            {/* Visual Thumbnail of Target */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-2 shrink-0 flex items-center justify-center shadow-lg border-2 border-yellow-400/80">
              <HardwareVisualArt id={currentTarget.id} className="w-14 h-14 sm:w-16 sm:h-16" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                  Target Component to Locate
                </span>
                <span className="text-xs text-blue-300 font-semibold">
                  {currentTarget.category}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>{currentTarget.name}</span>
              </h3>

              <p className="text-xs text-slate-200 max-w-xl leading-relaxed">
                <strong className="text-yellow-300">How to Spot: </strong>
                {currentTarget.visualClue}
              </p>

              {/* Distinctive recognition badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentTarget.keyFeatures.map((feat, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-blue-900/60 border border-blue-700/60 text-blue-200 px-2 py-0.5 rounded-md font-medium"
                  >
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 self-stretch md:self-center shrink-0">
            <button
              onClick={toggleHint}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                showHint
                  ? 'bg-yellow-400 text-yellow-950 shadow-md ring-2 ring-yellow-300'
                  : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-yellow-300" />
              <span>{showHint ? 'Radar Spotlight Active' : 'Highlight Search Sector'}</span>
            </button>

            {feedback && (
              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all text-center sm:text-right ${
                  feedback.isError
                    ? 'bg-red-950/80 text-red-200 border-red-500'
                    : 'bg-emerald-950/80 text-emerald-200 border-emerald-400'
                }`}
              >
                {feedback.text}
              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. High-Definition Technician Workbench Stage */}
      <div className="relative w-full h-[460px] bg-slate-950 border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl select-none">
        
        {/* Completion Screen */}
        {isCompleted && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/90 p-6 text-center text-white space-y-4 animate-in fade-in">
            <div className="w-20 h-20 rounded-2xl bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center">
              <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                WORKBENCH INVESTIGATION COMPLETE!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-1">
                You successfully found all 10 computer parts &amp; diagnostic tools on the technician mat in{' '}
                <strong className="text-yellow-400">{formatTime(elapsedTime)}</strong>!
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleRestart}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
              <button
                onClick={onBack}
                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                Back to Games Hub
              </button>
            </div>
          </div>
        )}

        {/* Clickable Realistic Vector Workbench */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          onClick={handleSvgClick}
          className="w-full h-full cursor-crosshair"
        >
          {/* Defs for gradients & patterns */}
          <defs>
            <linearGradient id="benchMatGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0f172a" />
              <stop offset="1" stopColor="#020617" />
            </linearGradient>

            <linearGradient id="esdMatGrad" x1="5" y1="5" x2="95" y2="95" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1e293b" />
              <stop offset="1" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="cpuIhsGrad" x1="39" y1="23" x2="51" y2="35" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f8fafc" />
              <stop offset="0.5" stopColor="#cbd5e1" />
              <stop offset="1" stopColor="#94a3b8" />
            </linearGradient>

            <linearGradient id="steelShaftGrad" x1="0" y1="0" x2="1" y2="0">
              <stop stopColor="#f1f5f9" />
              <stop offset="0.5" stopColor="#cbd5e1" />
              <stop offset="1" stopColor="#64748b" />
            </linearGradient>
          </defs>

          {/* Workbench Frame */}
          <rect x="0" y="0" width="100" height="100" fill="url(#benchMatGrad)" />
          
          {/* Blue ESD Anti-Static Work Mat */}
          <rect x="4" y="4" width="92" height="92" rx="3" fill="url(#esdMatGrad)" stroke="#1e3a8a" strokeWidth="0.8" />
          
          {/* ESD Grid Lines */}
          <line x1="4" y1="25" x2="96" y2="25" stroke="#1e293b" strokeWidth="0.3" strokeDasharray="1 1" />
          <line x1="4" y1="50" x2="96" y2="50" stroke="#1e293b" strokeWidth="0.3" strokeDasharray="1 1" />
          <line x1="4" y1="75" x2="96" y2="75" stroke="#1e293b" strokeWidth="0.3" strokeDasharray="1 1" />
          <line x1="25" y1="4" x2="25" y2="96" stroke="#1e293b" strokeWidth="0.3" strokeDasharray="1 1" />
          <line x1="50" y1="4" x2="50" y2="96" stroke="#1e293b" strokeWidth="0.3" strokeDasharray="1 1" />
          <line x1="75" y1="4" x2="75" y2="96" stroke="#1e293b" strokeWidth="0.3" strokeDasharray="1 1" />

          {/* ESD Grounding Snap (Top Left) */}
          <circle cx="8" cy="8" r="2" fill="#fbbf24" stroke="#d97706" strokeWidth="0.4" />
          <circle cx="8" cy="8" r="0.8" fill="#18181b" />
          <text x="11" y="9" fill="#94a3b8" fontSize="1.4" fontFamily="monospace">ESD GROUND</text>

          {/* 1. ATX MOTHERBOARD (Center Stage) */}
          <g id="wb-motherboard" className="transition-all hover:opacity-95">
            <rect x="28" y="14" width="44" height="52" rx="2" fill="#064e3b" stroke="#10b981" strokeWidth="0.8" />
            {/* Copper Bus Traces */}
            <path d="M 30 18 L 42 18 L 42 28" stroke="#f59e0b" strokeWidth="0.5" fill="none" opacity="0.6" />
            <path d="M 30 22 L 40 22 L 40 32" stroke="#f59e0b" strokeWidth="0.4" fill="none" opacity="0.6" />
            <path d="M 58 54 L 68 54 L 68 62" stroke="#f59e0b" strokeWidth="0.4" fill="none" opacity="0.6" />
            {/* Aluminum VRM Heatsinks */}
            <rect x="30" y="20" width="6" height="20" rx="0.5" fill="#334155" stroke="#94a3b8" strokeWidth="0.4" />
            <rect x="38" y="15.5" width="16" height="5" rx="0.5" fill="#334155" stroke="#94a3b8" strokeWidth="0.4" />
            {/* Silver Standoff Pads */}
            <circle cx="30" cy="16" r="0.8" fill="#fbbf24" />
            <circle cx="70" cy="16" r="0.8" fill="#fbbf24" />
            <circle cx="30" cy="64" r="0.8" fill="#fbbf24" />
            <circle cx="70" cy="64" r="0.8" fill="#fbbf24" />
            {/* Round Silver CMOS Battery */}
            <circle cx="66" cy="58" r="3" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.5" />
            <text x="66" y="59.2" fill="#0f172a" fontSize="1.8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">3V</text>
            {/* PCIe Slots */}
            <rect x="32" y="48" width="28" height="3" rx="0.4" fill="#18181b" stroke="#818cf8" strokeWidth="0.3" />
            <rect x="32" y="56" width="28" height="2.5" rx="0.4" fill="#18181b" stroke="#64748b" strokeWidth="0.3" />
            {/* Board Title Label */}
            <text x="50" y="19" fill="#34d399" fontSize="1.8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              ATX MOTHERBOARD
            </text>
          </g>

          {/* 2. CPU PROCESSOR (Sitting on Motherboard Socket) */}
          <g id="wb-cpu" className="transition-all hover:scale-105 origin-center">
            {/* Green Silicon Substrate Base */}
            <rect x="39" y="23" width="12" height="14" rx="1" fill="#047857" stroke="#059669" strokeWidth="0.4" />
            {/* Metallic Heatspreader */}
            <rect x="40.5" y="24.5" width="9" height="11" rx="0.8" fill="url(#cpuIhsGrad)" stroke="#64748b" strokeWidth="0.4" />
            {/* Gold Corner Triangle */}
            <polygon points="39.5,23.5 41.5,23.5 39.5,25.5" fill="#fbbf24" />
            {/* Laser Text */}
            <text x="45" y="29" fill="#1e293b" fontSize="1.4" fontWeight="bold" fontFamily="monospace" textAnchor="middle">CPU i7</text>
            <text x="45" y="32.5" fill="#334155" fontSize="1.2" fontWeight="black" fontFamily="monospace" textAnchor="middle">3.8GHz</text>
          </g>

          {/* 3. DUAL DDR4 RAM MEMORY STICKS (Left Upper Mat) */}
          <g id="wb-ram" className="transition-all hover:scale-105">
            {/* Anti-static Foam Pad */}
            <rect x="9.5" y="15.5" width="17" height="27" rx="1.5" fill="#1e293b" stroke="#334155" strokeWidth="0.4" />
            {/* Stick 1 */}
            <rect x="11" y="17" width="5.5" height="24" rx="0.8" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="0.5" />
            <line x1="12" y1="20" x2="15.5" y2="20" stroke="#93c5fd" strokeWidth="0.5" />
            <rect x="11.5" y="24" width="4.5" height="5" fill="#ffffff" />
            <rect x="11.5" y="38" width="4.5" height="2" fill="#fbbf24" />
            {/* Stick 2 */}
            <rect x="19" y="17" width="5.5" height="24" rx="0.8" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="0.5" />
            <line x1="20" y1="20" x2="23.5" y2="20" stroke="#93c5fd" strokeWidth="0.5" />
            <rect x="19.5" y="24" width="4.5" height="5" fill="#ffffff" />
            <rect x="19.5" y="38" width="4.5" height="2" fill="#fbbf24" />
            <text x="18" y="15" fill="#93c5fd" fontSize="1.6" fontWeight="bold" fontFamily="monospace" textAnchor="middle">DDR4 RAM</text>
          </g>

          {/* 4. CPU COOLING FAN & HEATSINK (Center-Left of Motherboard) */}
          <g id="wb-cooler" transform="translate(41, 39)" className="transition-all hover:scale-105">
            {/* Aluminum Fin Block */}
            <rect x="-1" y="-1" width="12" height="12" rx="1" fill="#475569" stroke="#64748b" strokeWidth="0.4" />
            {/* Blue Fan Housing */}
            <circle cx="5" cy="5" r="5" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.5" />
            {/* Fan Blades */}
            <path d="M 5 5 Q 7 2 9 3 Q 7 5 5 5 Z" fill="#e0f2fe" />
            <path d="M 5 5 Q 8 7 7 9 Q 5 7 5 5 Z" fill="#bae6fd" />
            <path d="M 5 5 Q 3 8 1 7 Q 3 5 5 5 Z" fill="#e0f2fe" />
            <path d="M 5 5 Q 2 3 3 1 Q 5 3 5 5 Z" fill="#bae6fd" />
            {/* Center Fan Hub */}
            <circle cx="5" cy="5" r="1.8" fill="#0f172a" stroke="#0ea5e9" strokeWidth="0.3" />
            {/* 4-Pin PWM Wire */}
            <path d="M 8 9 Q 12 11 11 15" stroke="#10b981" strokeWidth="0.6" fill="none" />
          </g>

          {/* 5. SATA DATA CABLE (Red Ribbon with Silver Metal Clips) */}
          <g id="wb-sata" className="transition-all hover:scale-105">
            {/* Snaking Red Ribbon */}
            <path d="M 74 28 C 82 24, 76 38, 86 42" stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <path d="M 74 28 C 82 24, 76 38, 86 42" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            {/* Black Connector 1 */}
            <g transform="translate(73, 27) rotate(-25)">
              <rect x="-1" y="-2" width="4" height="3" rx="0.5" fill="#18181b" stroke="#52525b" strokeWidth="0.3" />
              <rect x="0.5" y="-2.5" width="1.5" height="1" fill="#e2e8f0" />
            </g>
            {/* Black Connector 2 */}
            <g transform="translate(85, 41) rotate(15)">
              <rect x="-1" y="-1" width="4" height="3" rx="0.5" fill="#18181b" stroke="#52525b" strokeWidth="0.3" />
              <rect x="0.5" y="-1.5" width="1.5" height="1" fill="#e2e8f0" />
            </g>
            <text x="81" y="24" fill="#ef4444" fontSize="1.5" fontWeight="bold" fontFamily="monospace">SATA CABLE</text>
          </g>

          {/* 6. 24-PIN ATX MAIN POWER CABLE HARNESS */}
          <g id="wb-power" className="transition-all hover:scale-105">
            {/* Bundled Colorful Wires */}
            <path d="M 71 55 C 75 62, 78 66, 84 72" stroke="#f59e0b" strokeWidth="1.4" fill="none" />
            <path d="M 73 55 C 77 62, 80 66, 86 72" stroke="#ef4444" strokeWidth="1.4" fill="none" />
            <path d="M 75 55 C 79 62, 82 66, 88 72" stroke="#3b82f6" strokeWidth="1.4" fill="none" />
            <path d="M 77 55 C 81 62, 84 66, 90 72" stroke="#18181b" strokeWidth="1.4" fill="none" />
            {/* 24-Pin Keyed White Connector Block */}
            <rect x="69" y="53" width="15" height="5.5" rx="0.8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="70" y1="55.8" x2="83" y2="55.8" stroke="#64748b" strokeWidth="0.3" />
            <text x="76.5" y="52" fill="#facc15" fontSize="1.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">24P ATX</text>
          </g>

          {/* 7. MAGNETIC TECHNICIAN SCREWDRIVER (Lower Left) */}
          <g id="wb-screwdriver" transform="translate(7, 68) rotate(15)" className="transition-all hover:scale-105">
            {/* Red Ribbed Ergonomic Grip */}
            <rect x="0" y="0" width="8" height="3.5" rx="1" fill="#dc2626" stroke="#991b1b" strokeWidth="0.4" />
            <rect x="1.5" y="0.5" width="1" height="2.5" fill="#18181b" />
            <rect x="3.5" y="0.5" width="1" height="2.5" fill="#18181b" />
            <rect x="5.5" y="0.5" width="1" height="2.5" fill="#18181b" />
            {/* Chrome Vanadium Steel Shaft */}
            <rect x="8" y="1" width="8" height="1.5" rx="0.3" fill="url(#steelShaftGrad)" stroke="#64748b" strokeWidth="0.2" />
            {/* Darkened Magnetic Phillips Tip */}
            <polygon points="16,0.8 18.5,1.75 16,2.7" fill="#0f172a" stroke="#334155" strokeWidth="0.3" />
            {/* Magnetic Tip Sparkle */}
            <circle cx="18.5" cy="1.75" r="0.8" fill="#38bdf8" opacity="0.8" />
            <text x="8" y="6" fill="#f87171" fontSize="1.4" fontWeight="bold" fontFamily="monospace">SCREWDRIVER</text>
          </g>

          {/* 8. 2.5" SOLID STATE DRIVE (SSD) (Bottom Center-Left) */}
          <g id="wb-ssd" transform="translate(31, 71)" className="transition-all hover:scale-105">
            {/* Brushed Metal Drive Enclosure */}
            <rect x="0" y="0" width="15" height="18" rx="1.2" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.6" />
            <rect x="1.5" y="1.5" width="12" height="11" rx="0.8" fill="#0f172a" />
            {/* Flash SSD Label */}
            <rect x="3" y="3.5" width="9" height="5" rx="0.5" fill="#0284c7" />
            <text x="7.5" y="7" fill="#ffffff" fontSize="2" fontWeight="black" fontFamily="sans-serif" textAnchor="middle">SSD</text>
            <text x="7.5" y="11" fill="#38bdf8" fontSize="1.3" fontWeight="bold" fontFamily="monospace" textAnchor="middle">1TB FLASH</text>
            {/* Gold SATA Teeth */}
            <rect x="3" y="14" width="5" height="2" fill="#fbbf24" />
            <rect x="9" y="14" width="3" height="2" fill="#fbbf24" />
          </g>

          {/* 9. 3.5" MECHANICAL HARD DISK (HDD) (Bottom Center-Right) */}
          <g id="wb-hdd" transform="translate(50, 71)" className="transition-all hover:scale-105">
            {/* Cast Aluminum Housing */}
            <rect x="0" y="0" width="17" height="20" rx="1.5" fill="#334155" stroke="#94a3b8" strokeWidth="0.6" />
            {/* Recessed Platter Area */}
            <circle cx="8.5" cy="9.5" r="7" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.4" />
            <circle cx="8.5" cy="9.5" r="5.5" fill="#f1f5f9" />
            {/* Center Spindle Hub */}
            <circle cx="8.5" cy="9.5" r="2.2" fill="#475569" />
            <circle cx="8.5" cy="9.5" r="0.8" fill="#e2e8f0" />
            {/* Actuator Head */}
            <line x1="8.5" y1="9.5" x2="13" y2="13" stroke="#0284c7" strokeWidth="0.8" />
            {/* Breather Filter */}
            <circle cx="3" cy="3.5" r="0.8" fill="#18181b" />
            <text x="8.5" y="18.5" fill="#94a3b8" fontSize="1.6" fontWeight="bold" fontFamily="monospace" textAnchor="middle">3.5&quot; HDD</text>
          </g>

          {/* 10. RJ-45 ETHERNET PATCH CABLE (Lower Right Mat) */}
          <g id="wb-network" className="transition-all hover:scale-105">
            <path d="M 78 77 Q 88 88, 92 82" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            {/* Snagless Molded Boot & Clear 8P8C Plug */}
            <g transform="translate(90, 80) rotate(-40)">
              <rect x="0" y="-1.5" width="3" height="3" fill="#1d4ed8" />
              <rect x="3" y="-1.2" width="3.5" height="2.4" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.3" opacity="0.9" />
              <line x1="5.5" y1="-0.8" x2="5.5" y2="0.8" stroke="#fbbf24" strokeWidth="0.4" strokeDasharray="0.3 0.3" />
            </g>
            <text x="85" y="93" fill="#60a5fa" fontSize="1.5" fontWeight="bold" fontFamily="monospace">RJ-45 LAN</text>
          </g>

          {/* RADAR SPOTLIGHT HINT RING (If student requested hint) */}
          {showHint && currentTarget && (
            <g
              transform={`translate(${currentTarget.bbox.x + currentTarget.bbox.width / 2}, ${
                currentTarget.bbox.y + currentTarget.bbox.height / 2
              })`}
            >
              <circle cx="0" cy="0" r="14" fill="#facc15" fillOpacity="0.15" stroke="#facc15" strokeWidth="0.8" strokeDasharray="2 2" className="animate-ping" />
              <circle cx="0" cy="0" r="8" fill="none" stroke="#facc15" strokeWidth="1" className="animate-spin" />
              <text x="0" y="-9" fill="#facc15" fontSize="2.2" fontWeight="black" fontFamily="sans-serif" textAnchor="middle">
                HERE!
              </text>
            </g>
          )}

          {/* FOUND BADGE MARKERS ON WORKBENCH */}
          {foundIds.map((id) => {
            const item = WORKSPACE_OBJECTS.find(o => o.id === id);
            if (!item) return null;
            return (
              <g
                key={id}
                transform={`translate(${item.bbox.x + item.bbox.width / 2}, ${
                  item.bbox.y + item.bbox.height / 2
                })`}
                className="animate-in zoom-in duration-200"
              >
                {/* Glow ring */}
                <circle cx="0" cy="0" r="4.5" fill="#10b981" fillOpacity="0.9" stroke="#ffffff" strokeWidth="0.8" shadow="true" />
                {/* Check icon */}
                <path d="M -2 0 L -0.5 2 L 2 -1.5" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>
            );
          })}
        </svg>

      </div>

      {/* 4. VISUAL CHECKLIST OF ALL 10 ITEMS */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase text-gray-700 tracking-wider flex items-center gap-2">
            <span>Hardware Components Checklist ({foundIds.length} of 10 Discovered)</span>
          </h4>
          <span className="text-[11px] text-gray-400">
            Click any unfound item in the workbench above
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {WORKSPACE_OBJECTS.map((obj) => {
            const isFound = foundIds.includes(obj.id);
            const isCurrentTarget = !isFound && currentTarget?.id === obj.id;

            return (
              <div
                key={obj.id}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all select-none ${
                  isFound
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                    : isCurrentTarget
                    ? 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-400/40 shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 p-0.5 flex items-center justify-center shrink-0">
                  <HardwareVisualArt id={obj.id} className="w-7 h-7" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate font-bold text-[11px]">{obj.name}</span>
                    {isFound ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : isCurrentTarget ? (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping shrink-0" />
                    ) : null}
                  </div>
                  <span className="text-[9px] text-gray-400 block truncate">
                    {isFound ? 'Discovered ✓' : obj.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* VISUAL FIELD GUIDE MODAL */}
      <VisualFieldGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

    </div>
  );
};
