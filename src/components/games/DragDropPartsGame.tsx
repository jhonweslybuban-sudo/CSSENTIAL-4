import React, { useState, useRef } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  Trophy,
  ArrowLeft,
  Move,
  BookOpen,
  Info,
  AlertCircle,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import { DRAG_DROP_PARTS, DragDropPart } from '../../data/gamesData';
import { api } from '../../services/api';
import { HardwareVisualArt, VisualFieldGuideModal } from './HardwareVisualAssets';

interface DragDropPartsGameProps {
  studentId: string;
  sessionId: string;
  onBack: () => void;
}

export const DragDropPartsGame: React.FC<DragDropPartsGameProps> = ({
  studentId,
  sessionId,
  onBack
}) => {
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  // Map targetId -> placedPartId
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [isVerified, setIsVerified] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hoveredTarget, setHoveredTarget] = useState<DragDropPart | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const startTimeRef = useRef<number>(Date.now());

  const availableParts = DRAG_DROP_PARTS.filter(
    p => !Object.values(placements).includes(p.id)
  );

  const selectedPart = DRAG_DROP_PARTS.find(p => p.id === selectedPartId);

  const handleSelectPart = (id: string) => {
    if (isCompleted) return;
    setSelectedPartId(id === selectedPartId ? null : id);
  };

  const handleTargetZoneClick = (targetId: string) => {
    if (!selectedPartId || isCompleted) return;
    setPlacements(prev => ({
      ...prev,
      [targetId]: selectedPartId
    }));
    setSelectedPartId(null);
    setIsVerified(false);
  };

  const handleRemovePlacement = (targetId: string) => {
    if (isCompleted) return;
    setPlacements(prev => {
      const copy = { ...prev };
      delete copy[targetId];
      return copy;
    });
    setIsVerified(false);
  };

  // Drag & Drop event handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setSelectedPartId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const droppedPartId = e.dataTransfer.getData('text/plain') || selectedPartId;
    if (!droppedPartId || isCompleted) return;

    setPlacements(prev => ({
      ...prev,
      [targetId]: droppedPartId
    }));
    setSelectedPartId(null);
    setIsVerified(false);
  };

  const handleVerify = async () => {
    const correctCount = DRAG_DROP_PARTS.filter(
      p => placements[p.id] === p.id
    ).length;

    setIsVerified(true);

    if (correctCount === DRAG_DROP_PARTS.length) {
      setIsCompleted(true);
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      await api.recordGameResult({
        student_id: studentId,
        session_id: sessionId,
        game_name: 'Drag & Drop Computer Parts',
        start_time: new Date(startTimeRef.current).toISOString(),
        end_time: new Date().toISOString(),
        duration_seconds: duration,
        score: 100,
        level: 1,
        completed: true
      });
    }
  };

  const handleReset = () => {
    setPlacements({});
    setSelectedPartId(null);
    setIsVerified(false);
    setIsCompleted(false);
    startTimeRef.current = Date.now();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      
      {/* Top Controls Bar */}
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

        <div className="flex items-center gap-2">
          <div className="text-xs font-bold text-blue-900 bg-blue-50 px-3.5 py-1.5 rounded-lg border border-blue-200 flex items-center gap-2">
            <span>Parts Placed:</span>
            <strong className="text-sm font-black text-blue-700">
              {Object.keys(placements).length} / {DRAG_DROP_PARTS.length}
            </strong>
          </div>

          <button
            onClick={handleReset}
            className="text-xs font-bold text-gray-500 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            title="Reset All"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Part Guidance Banner */}
      {selectedPart && !isCompleted && (
        <div className="bg-linear-to-r from-blue-700 to-indigo-800 text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center shadow-xs">
              <HardwareVisualArt id={selectedPart.id} className="w-10 h-10" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                Selected Component • Ready to Place
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {selectedPart.label} ({selectedPart.category})
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                {selectedPart.visualCue}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-[11px] font-bold text-yellow-300 bg-blue-900/60 border border-yellow-400/40 px-3 py-1.5 rounded-lg">
              Click the highlighted radar circle on the case below ⬇️
            </span>
            <button
              onClick={() => setSelectedPartId(null)}
              className="text-xs text-white/70 hover:text-white px-2 py-1 bg-white/10 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 1. VISUAL INVENTORY TRAY */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Step 1: Inspect &amp; Select a Visual Hardware Component ({availableParts.length} available)
            </span>
          </div>
          <span className="text-[11px] text-gray-400">
            Tip: You can either click to select or drag directly onto the computer chassis
          </span>
        </div>

        {availableParts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {availableParts.map(part => {
              const isSelected = selectedPartId === part.id;
              return (
                <div
                  key={part.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, part.id)}
                  onClick={() => handleSelectPart(part.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between select-none group relative ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500 shadow-md scale-[1.02]'
                      : 'bg-gray-50/80 hover:bg-white border-gray-200 hover:border-blue-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-11 h-11 rounded-lg bg-white border border-gray-200 p-1 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      <HardwareVisualArt id={part.id} className="w-9 h-9" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wider block truncate">
                        {part.category}
                      </span>
                      <h4 className="text-xs font-black text-gray-900 leading-tight">
                        {part.label}
                      </h4>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-200/60 text-[10px] text-gray-600 leading-snug line-clamp-2">
                    <strong className="text-gray-900 font-semibold">Look for: </strong>
                    {part.visualCue}
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-800 font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All 8 computer parts have been placed into the computer tower!</span>
            </div>
            <button
              onClick={handleVerify}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-black cursor-pointer shadow-xs"
            >
              Verify Placements Now
            </button>
          </div>
        )}
      </div>

      {/* 2. REALISTIC DESKTOP TOWER & MOTHERBOARD STAGE */}
      <div className="relative w-full h-[460px] bg-slate-950 border-2 border-slate-800 rounded-2xl overflow-hidden shadow-xl select-none">
        
        {/* High-Fidelity SVG Computer Chassis Stage */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Outer PC Tower Chassis Frame */}
          <rect x="3" y="3" width="94" height="94" rx="4" fill="#090d16" stroke="#1e293b" strokeWidth="0.8" />
          
          {/* Top Chassis Dust Filter & Exhaust Fan Bays */}
          <rect x="18" y="4.5" width="64" height="4" rx="1" fill="#0f172a" stroke="#334155" strokeWidth="0.4" />
          <circle cx="35" cy="6.5" r="1.5" fill="#38bdf8" opacity="0.6" />
          <circle cx="65" cy="6.5" r="1.5" fill="#38bdf8" opacity="0.6" />
          <text x="50" y="7.5" fill="#64748b" fontSize="1.4" fontFamily="monospace" textAnchor="middle">TOP 240mm RADIATOR / EXHAUST</text>

          {/* Rear I/O Panel & 120mm Exhaust Fan (Upper Left) */}
          <rect x="4.5" y="14" width="7" height="42" rx="1" fill="#1e293b" stroke="#475569" strokeWidth="0.4" />
          <circle cx="15" cy="24" r="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.5" />
          <circle cx="15" cy="24" r="1.5" fill="#0284c7" />
          <line x1="15" y1="19" x2="15" y2="29" stroke="#94a3b8" strokeWidth="0.4" />
          <line x1="10" y1="24" x2="20" y2="24" stroke="#94a3b8" strokeWidth="0.4" />
          <text x="15" y="32" fill="#64748b" fontSize="1.3" fontFamily="monospace" textAnchor="middle">REAR 120mm FAN</text>

          {/* Rear Expansion Slot Brackets (Lower Left, aligning with PCIe) */}
          <g transform="translate(4.5, 58)">
            <rect x="0" y="0" width="7" height="3" fill="#334155" stroke="#475569" strokeWidth="0.2" />
            <rect x="0" y="4" width="7" height="3" fill="#334155" stroke="#475569" strokeWidth="0.2" />
            <rect x="0" y="8" width="7" height="3" fill="#334155" stroke="#475569" strokeWidth="0.2" />
            <rect x="0" y="12" width="7" height="3" fill="#334155" stroke="#475569" strokeWidth="0.2" />
          </g>

          {/* Main ATX Motherboard PCB Tray */}
          <rect x="25" y="12" width="52" height="58" rx="2" fill="#064e3b" stroke="#10b981" strokeWidth="0.8" />
          {/* Motherboard Grounding Traces */}
          <path d="M 27 16 L 40 16 L 40 24" stroke="#059669" strokeWidth="0.4" fill="none" opacity="0.6" />
          <path d="M 68 50 L 74 50 L 74 66" stroke="#059669" strokeWidth="0.4" fill="none" opacity="0.6" />
          {/* Standoff Screws (4 corners) */}
          <circle cx="27" cy="14" r="0.8" fill="#fbbf24" stroke="#b45309" strokeWidth="0.2" />
          <circle cx="75" cy="14" r="0.8" fill="#fbbf24" stroke="#b45309" strokeWidth="0.2" />
          <circle cx="27" cy="68" r="0.8" fill="#fbbf24" stroke="#b45309" strokeWidth="0.2" />
          <circle cx="75" cy="68" r="0.8" fill="#fbbf24" stroke="#b45309" strokeWidth="0.2" />

          {/* Motherboard Name Header Label */}
          <text x="32" y="15" fill="#34d399" fontSize="1.8" fontWeight="bold" fontFamily="monospace">
            ATX MOTHERBOARD PCB
          </text>

          {/* CPU Socket Silhouette Area (Upper Center) */}
          <rect x="42" y="22" width="12" height="15" rx="0.8" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.5" />
          <rect x="44" y="24" width="8" height="11" fill="#475569" stroke="#cbd5e1" strokeWidth="0.3" strokeDasharray="0.8 0.8" />
          {/* Metal Load Lever */}
          <line x1="41.5" y1="23" x2="41.5" y2="36" stroke="#e2e8f0" strokeWidth="0.6" strokeLinecap="round" />

          {/* RAM DIMM Slots Silhouette (Right of CPU) */}
          <g transform="translate(63, 21)">
            <rect x="0" y="0" width="2" height="18" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="0.3" />
            <rect x="3.5" y="0" width="2" height="18" fill="#1e40af" stroke="#3b82f6" strokeWidth="0.3" />
            <rect x="7" y="0" width="2" height="18" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="0.3" />
            {/* Top & Bottom Latches */}
            <rect x="-0.5" y="-1" width="10" height="1" fill="#ffffff" />
            <rect x="-0.5" y="18" width="10" height="1" fill="#ffffff" />
          </g>

          {/* CPU Cooler Silhouette Bracket Mounts */}
          <circle cx="41" cy="40" r="0.8" fill="#94a3b8" />
          <circle cx="55" cy="40" r="0.8" fill="#94a3b8" />
          <circle cx="41" cy="51" r="0.8" fill="#94a3b8" />
          <circle cx="55" cy="51" r="0.8" fill="#94a3b8" />

          {/* PCIe x16 Expansion Slot Silhouette (Lower Motherboard) */}
          <g transform="translate(28, 60)">
            <rect x="0" y="0" width="40" height="4" rx="0.5" fill="#18181b" stroke="#818cf8" strokeWidth="0.4" />
            <rect x="37" y="-0.5" width="2.5" height="5" rx="0.5" fill="#6366f1" />
            <line x1="2" y1="2" x2="36" y2="2" stroke="#fbbf24" strokeWidth="0.4" strokeDasharray="1 1" />
          </g>

          {/* SATA Ports Cluster (Lower Right Edge) */}
          <g transform="translate(67, 50)">
            <rect x="0" y="0" width="6" height="4" rx="0.4" fill="#18181b" stroke="#ef4444" strokeWidth="0.3" />
            <path d="M 1 1 L 4 1 L 4 3 L 5 3" stroke="#f59e0b" strokeWidth="0.4" fill="none" />
            <rect x="0" y="5" width="6" height="4" rx="0.4" fill="#18181b" stroke="#ef4444" strokeWidth="0.3" />
            <path d="M 1 6 L 4 6 L 4 8 L 5 8" stroke="#f59e0b" strokeWidth="0.4" fill="none" />
          </g>

          {/* Isolated PSU Basement Shroud (Bottom Chassis Tunnel) */}
          <rect x="4.5" y="73" width="91" height="23" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.6" />
          {/* Honeycomb Ventilation Cutouts on Shroud */}
          <line x1="5" y1="73" x2="95" y2="73" stroke="#475569" strokeWidth="0.8" />
          
          {/* PSU Bay Window (Bottom Left) */}
          <rect x="7" y="76" width="24" height="17" rx="1.5" fill="#18181b" stroke="#eab308" strokeWidth="0.5" />
          {/* Honeycomb Fan Grill */}
          <circle cx="16" cy="84.5" r="5" fill="#09090b" stroke="#eab308" strokeWidth="0.4" />
          <circle cx="16" cy="84.5" r="3" stroke="#71717a" strokeWidth="0.3" strokeDasharray="1 1" fill="none" />
          <text x="24" y="86" fill="#facc15" fontSize="1.6" fontWeight="bold" fontFamily="monospace">750W</text>

          {/* Storage Drive Bays (Bottom Right) */}
          <g transform="translate(73, 75)">
            {/* Drive Cage Box */}
            <rect x="0" y="0" width="21" height="19" rx="1" fill="#1e293b" stroke="#64748b" strokeWidth="0.5" />
            {/* Slide-out Caddy Trays */}
            <rect x="2" y="2.5" width="17" height="6.5" rx="0.8" fill="#334155" stroke="#94a3b8" strokeWidth="0.4" />
            <text x="10.5" y="6.8" fill="#38bdf8" fontSize="1.4" fontWeight="bold" fontFamily="monospace" textAnchor="middle">SSD 2.5&quot;</text>
            
            <rect x="2" y="10.5" width="17" height="6.5" rx="0.8" fill="#334155" stroke="#94a3b8" strokeWidth="0.4" />
            <text x="10.5" y="14.8" fill="#cbd5e1" fontSize="1.4" fontWeight="bold" fontFamily="monospace" textAnchor="middle">HDD 3.5&quot;</text>
          </g>

          {/* Front Intake Fans (Right Border) */}
          <rect x="94" y="14" width="2" height="55" fill="#0ea5e9" opacity="0.4" />
        </svg>

        {/* INTERACTIVE DROP TARGET ZONES OVERLAY */}
        {DRAG_DROP_PARTS.map(target => {
          const placedPartId = placements[target.id];
          const placedPart = DRAG_DROP_PARTS.find(p => p.id === placedPartId);
          const isCorrect = isVerified && placedPartId === target.id;
          const isWrong = isVerified && placedPartId && placedPartId !== target.id;
          const isSelectedMatch = selectedPartId === target.id;

          return (
            <div
              key={target.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, target.id)}
              onMouseEnter={() => setHoveredTarget(target)}
              onMouseLeave={() => setHoveredTarget(null)}
              onClick={() => {
                if (placedPartId) handleRemovePlacement(target.id);
                else handleTargetZoneClick(target.id);
              }}
              style={{
                top: `${target.targetY}%`,
                left: `${target.targetX}%`
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer flex flex-col items-center group"
            >
              {placedPart ? (
                /* Placed Hardware Seated Card */
                <div
                  className={`px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 transition-all select-none border ${
                    isCorrect
                      ? 'bg-emerald-600 text-white border-emerald-300 ring-4 ring-emerald-500/40 animate-pulse'
                      : isWrong
                      ? 'bg-red-600 text-white border-red-300 ring-4 ring-red-500/40'
                      : 'bg-slate-900/90 hover:bg-slate-800 text-white border-blue-400 ring-2 ring-blue-500/30'
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-white/15 p-0.5 flex items-center justify-center shrink-0">
                    <HardwareVisualArt id={placedPart.id} className="w-5 h-5" />
                  </div>

                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider leading-none">
                      {target.label}
                    </span>
                    <span className="text-xs font-black leading-tight flex items-center gap-1">
                      <span>{placedPart.label}</span>
                      {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-200 inline" />}
                      {isWrong && <X className="w-3.5 h-3.5 text-red-200 inline" />}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePlacement(target.id);
                    }}
                    title="Remove Placement"
                    className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-[10px] font-black ml-1 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                /* Empty Target Socket Indicator with Radar Pulse */
                <div className="flex flex-col items-center">
                  <div
                    className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelectedMatch
                        ? 'border-yellow-400 bg-yellow-400/25 ring-4 ring-yellow-400/50 scale-125 animate-pulse shadow-lg'
                        : selectedPartId
                        ? 'border-white/50 bg-white/10 hover:bg-white/25 hover:scale-110'
                        : 'border-white/30 bg-black/40 hover:border-blue-400 hover:bg-blue-900/30'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center">
                      <HardwareVisualArt id={target.id} className="w-5 h-5 opacity-70" />
                    </div>
                  </div>

                  {/* Target Label Pill */}
                  <span
                    className={`mt-1 text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs whitespace-nowrap transition-all ${
                      isSelectedMatch
                        ? 'bg-yellow-400 text-yellow-950 font-black shadow-sm'
                        : 'bg-slate-900/80 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {target.label}
                  </span>
                </div>
              )}

              {/* Hover Tooltip explaining the exact socket and what to look for */}
              {hoveredTarget?.id === target.id && (
                <div className="absolute top-full mt-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl border border-slate-700 shadow-2xl z-30 pointer-events-none animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold uppercase text-[10px] mb-1">
                    <Info className="w-3 h-3" />
                    <span>Socket: {target.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-snug">
                    {target.socketDescription}
                  </p>
                  <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] text-yellow-300">
                    <strong>Visual Cue: </strong>
                    {target.visualCue}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* VICTORY OVERLAY SCREEN */}
        {isCompleted && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/90 p-6 text-center text-white space-y-4 animate-in fade-in">
            <div className="w-20 h-20 rounded-2xl bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center">
              <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                ALL COMPUTER PARTS ACCURATELY MAPPED!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-1">
                You correctly identified and placed every major desktop chassis &amp; motherboard component into its authentic socket!
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset &amp; Play Again</span>
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

      </div>

      {/* 3. VERIFICATION & ERROR FEEDBACK BAR */}
      {isVerified && !isCompleted && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-start gap-3 text-amber-900 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Check Placements:</span> Some components are in the wrong socket (highlighted in red). Click the red parts to remove them, check their physical cues, and try again!
          </div>
        </div>
      )}

      {/* 4. BOTTOM ACTION CONTROLS */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Placements</span>
        </button>

        <button
          onClick={handleVerify}
          disabled={Object.keys(placements).length === 0}
          className={`px-6 py-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
            Object.keys(placements).length > 0
              ? 'bg-blue-700 hover:bg-blue-800 text-white cursor-pointer shadow-md'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>VERIFY PLACEMENTS ({Object.keys(placements).length} / {DRAG_DROP_PARTS.length})</span>
        </button>
      </div>

      {/* FIELD GUIDE MODAL */}
      <VisualFieldGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

    </div>
  );
};
