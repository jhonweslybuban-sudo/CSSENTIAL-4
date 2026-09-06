import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
  Zap,
  HelpCircle,
  ShieldAlert,
  Cpu,
  Tv,
  HardDrive,
  Sliders,
  Check,
  Award
} from 'lucide-react';
import { CABLE_CHALLENGES, CABLE_OPTIONS, CableChallenge, CableOption } from '../../data/gamesData';
import { api } from '../../services/api';

interface CablePinoutMasterGameProps {
  studentId: string;
  sessionId: string;
  onBack: () => void;
}

export const CablePinoutMasterGame: React.FC<CablePinoutMasterGameProps> = ({
  studentId,
  sessionId,
  onBack
}) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedCableId, setSelectedCableId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Power' | 'Data' | 'Front Panel' | 'Display'>('All');
  const [showHint, setShowHint] = useState(false);
  const [polarityReversed, setPolarityReversed] = useState(false);
  const [roundResult, setRoundResult] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [shuffledChallenges, setShuffledChallenges] = useState<CableChallenge[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const startTimeRef = useRef<number>(Date.now());

  // Shuffle questions on initial load
  useEffect(() => {
    const shuffled = [...CABLE_CHALLENGES].sort(() => Math.random() - 0.5);
    setShuffledChallenges(shuffled);
    startTimeRef.current = Date.now();

    api.logAction(
      studentId,
      sessionId,
      'Started Game: Cable & Pinout Master (10th Game - Hardware Connector Alignment)'
    );
  }, [studentId, sessionId]);

  // Elapsed timer
  useEffect(() => {
    if (isCompleted) return;
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  const activeChallenge = shuffledChallenges[currentRound];

  const filteredCables = activeCategory === 'All'
    ? CABLE_OPTIONS
    : CABLE_OPTIONS.filter(c => c.category === activeCategory);

  const handleSelectCable = (cableId: string) => {
    if (roundResult !== null) return;
    setSelectedCableId(cableId);
  };

  const handleTestPlugIn = () => {
    if (!selectedCableId || !activeChallenge || roundResult !== null) return;

    let isCorrect = selectedCableId === activeChallenge.correctCableId;

    // Check polarity if sensitive
    if (activeChallenge.polaritySensitive && polarityReversed) {
      isCorrect = false;
    }

    if (isCorrect) {
      setRoundResult('correct');
      setScore(prev => prev + 1);
      api.logAction(
        studentId,
        sessionId,
        `Cable Master Round ${currentRound + 1}: CONNECTED CORRECTLY to ${activeChallenge.socketName}`
      );
    } else {
      setRoundResult('incorrect');
      api.logAction(
        studentId,
        sessionId,
        `Cable Master Round ${currentRound + 1}: MISWIRED ${selectedCableId} into ${activeChallenge.socketName}`
      );
    }
  };

  const handleNextRound = async () => {
    if (currentRound < shuffledChallenges.length - 1) {
      setCurrentRound(prev => prev + 1);
      setSelectedCableId(null);
      setRoundResult(null);
      setShowHint(false);
      setPolarityReversed(false);
    } else {
      // Completed game
      setIsCompleted(true);
      const total = shuffledChallenges.length;
      const finalScore = score + (roundResult === 'correct' ? 0 : 0); // score already incremented
      const pct = Math.round((finalScore / total) * 100);

      await api.recordActivityAttempt({
        student_id: studentId,
        session_id: sessionId,
        activity_name: 'Cable & Pinout Master',
        activity_type: 'Interactive Connector Lab',
        start_time: new Date(startTimeRef.current).toISOString(),
        end_time: new Date().toISOString(),
        duration_seconds: elapsedSeconds,
        score: finalScore,
        total_items: total,
        percentage: pct,
        completed: true
      });
    }
  };

  const handleRestart = () => {
    const shuffled = [...CABLE_CHALLENGES].sort(() => Math.random() - 0.5);
    setShuffledChallenges(shuffled);
    setCurrentRound(0);
    setSelectedCableId(null);
    setRoundResult(null);
    setShowHint(false);
    setPolarityReversed(false);
    setScore(0);
    setIsCompleted(false);
    startTimeRef.current = Date.now();
    setElapsedSeconds(0);
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!activeChallenge) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Loading Cable & Pinout Lab...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            title="Back to Games Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                Game 10 / 10 • Physical Hardware Lab
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-gray-900">
              Cable & Pinout Master
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] font-bold text-gray-500 block">TIME</span>
            <span className="text-sm font-black text-gray-800">{formatTime(elapsedSeconds)}</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-gray-500 block">SCORE</span>
            <span className="text-sm font-black text-blue-700">{score} / {shuffledChallenges.length}</span>
          </div>
          <button
            onClick={handleRestart}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Restart Challenge"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Game Screen */}
      {!isCompleted ? (
        <div className="space-y-6">
          
          {/* Progress Tracker */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <span className="text-xs font-black text-gray-700 uppercase tracking-wider">
              Diagnostic Case {currentRound + 1} of {shuffledChallenges.length}
            </span>
            <div className="flex gap-1.5">
              {shuffledChallenges.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-5 h-2 rounded-full transition-all ${
                    idx === currentRound
                      ? 'bg-blue-600 w-8'
                      : idx < currentRound
                      ? 'bg-emerald-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Diagnostic Scenario & Motherboard Socket Workbench */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Motherboard Inspection Port */}
            <div className="lg:col-span-6 bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Zap className="w-3.5 h-3.5" />
                    Target Motherboard Socket
                  </span>
                  {activeChallenge.polaritySensitive && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      ⚠️ Polarity Sensitive
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-black text-white tracking-wide">
                  {activeChallenge.socketName}
                </h2>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                  {activeChallenge.scenario}
                </p>

                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 text-xs space-y-1">
                  <span className="font-bold text-slate-400 block uppercase text-[10px] tracking-wider">
                    Physical Socket Spec
                  </span>
                  <p className="text-slate-200 font-medium">
                    {activeChallenge.socketDescription}
                  </p>
                </div>
              </div>

              {/* Polarity Switcher for LED Headers */}
              {activeChallenge.polaritySensitive && (
                <div className="bg-slate-800 p-4 rounded-xl border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">
                      Pin Orientation (Anode + / Cathode -)
                    </span>
                    <button
                      type="button"
                      onClick={() => setPolarityReversed(prev => !prev)}
                      className={`text-xs px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        polarityReversed
                          ? 'bg-red-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {polarityReversed ? 'Reversed: (- / +)' : 'Standard: (+ / -)'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {polarityReversed
                      ? 'Reversed orientation: Diode will not illuminate during disk activity.'
                      : 'Standard alignment: Positive pin (+) connected to Pin 1 anode.'}
                  </p>
                </div>
              )}

              {/* Hint Box */}
              <div>
                {!showHint && (
                  <button
                    onClick={() => setShowHint(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Need a technician hint?</span>
                  </button>
                )}
                {showHint && (
                  <div className="p-3 bg-blue-950/80 border border-blue-800 text-blue-200 rounded-xl text-xs space-y-1 animate-in fade-in">
                    <span className="font-bold text-blue-300">Lab Diagnostic Clue:</span>
                    <p>{activeChallenge.clue}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Cable Toolbag & Connector Rack */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {(['All', 'Power', 'Data', 'Front Panel', 'Display'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeCategory === cat
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Cable Selection Rack */}
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {filteredCables.map(cable => {
                  const isSelected = selectedCableId === cable.id;
                  return (
                    <div
                      key={cable.id}
                      onClick={() => handleSelectCable(cable.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-600/30'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${cable.visualColor}`} />
                          <h4 className="text-xs font-black text-gray-900">
                            {cable.name}
                          </h4>
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {cable.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-600 flex flex-wrap gap-x-3">
                          <span><strong>Pins:</strong> {cable.pinCount}</span>
                          <span><strong>Rating:</strong> {cable.voltageOrSpeed}</span>
                        </div>
                        <p className="text-[10px] text-gray-500">
                          {cable.formFactor}
                        </p>
                      </div>

                      <div className="shrink-0 ml-3">
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-gray-300 bg-white text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                {roundResult === null ? (
                  <button
                    onClick={handleTestPlugIn}
                    disabled={!selectedCableId}
                    className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                      selectedCableId
                        ? 'bg-blue-700 hover:bg-blue-800 text-white active:scale-98'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>PLUG IN & TEST CONNECTOR</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNextRound}
                    className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-md"
                  >
                    <span>{currentRound < shuffledChallenges.length - 1 ? 'NEXT DIAGNOSTIC CASE' : 'VIEW FINAL RESULTS'}</span>
                  </button>
                )}
              </div>

              {/* Feedback Rationale Box */}
              {roundResult !== null && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-1.5 animate-in fade-in duration-200 ${
                    roundResult === 'correct'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-red-50 border-red-300 text-red-950'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-sm">
                    {roundResult === 'correct' ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>PERFECT HARDWARE ALIGNMENT!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span>INCORRECT CONNECTOR / POLARITY</span>
                      </>
                    )}
                  </div>
                  <p className="leading-relaxed">
                    {activeChallenge.technicalNote}
                  </p>
                </div>
              )}

            </div>

          </div>

        </div>
      ) : (
        /* Game Over / Results Screen */
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-xl mx-auto shadow-md space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-700">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full">
              ✓ COMPLETED
            </span>
            <h2 className="text-2xl font-black text-gray-900 mt-2">
              Cable & Pinout Master Completed!
            </h2>
            <p className="text-xs text-gray-600 max-w-md mx-auto">
              You successfully audited and seated internal power harnesses, front panel pinouts, and high-speed data cables across all motherboard diagnostic cases.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <span className="text-[11px] font-bold text-gray-500 block uppercase">Score</span>
              <span className="text-xl font-black text-blue-700">{score} / {shuffledChallenges.length}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 block uppercase">Accuracy</span>
              <span className="text-xl font-black text-gray-800">
                {Math.round((score / shuffledChallenges.length) * 100)}%
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 block uppercase">Time</span>
              <span className="text-xl font-black text-gray-800">{formatTime(elapsedSeconds)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>REPLAY LAB</span>
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs"
            >
              <span>BACK TO GAMES HUB</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
