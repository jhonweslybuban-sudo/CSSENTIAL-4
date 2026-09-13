import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Clock, Trophy, ArrowLeft, Sparkles, Layers } from 'lucide-react';
import { MEMORY_CARD_SETS } from '../../data/gamesData';
import { api } from '../../services/api';

interface MemoryMatchGameProps {
  studentId: string;
  sessionId: string;
  onBack: () => void;
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  studentId,
  sessionId,
  onBack
}) => {
  // Current set index (0, 1, or 2) - randomized on launch
  const [currentSetIndex, setCurrentSetIndex] = useState(() =>
    Math.floor(Math.random() * MEMORY_CARD_SETS.length)
  );

  // Cards for active set
  const [cards, setCards] = useState(() => {
    const randomSet = Math.floor(Math.random() * MEMORY_CARD_SETS.length);
    return [...MEMORY_CARD_SETS[randomSet]].sort(() => Math.random() - 0.5);
  });
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const activeSet = MEMORY_CARD_SETS[currentSetIndex];

  const handleCardClick = (index: number) => {
    if (
      flippedIndices.length === 2 ||
      flippedIndices.includes(index) ||
      matchedPairs.includes(cards[index].pairId)
    ) {
      return;
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const first = cards[newFlipped[0]];
      const second = cards[newFlipped[1]];

      if (first.pairId === second.pairId) {
        // Match found!
        const newMatches = [...matchedPairs, first.pairId];
        setMatchedPairs(newMatches);
        setFlippedIndices([]);

        if (newMatches.length === activeSet.length / 2) {
          // Completed!
          setIsCompleted(true);
          clearInterval(timerRef.current);
          const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
          api.recordGameResult({
            student_id: studentId,
            session_id: sessionId,
            game_name: 'Memory Match',
            start_time: new Date(startTimeRef.current).toISOString(),
            end_time: new Date().toISOString(),
            duration_seconds: duration,
            score: Math.max(10, 100 - (moves - 6) * 5),
            level: currentSetIndex + 1,
            completed: true
          });
        }
      } else {
        // Not a match, flip back after 900ms
        setTimeout(() => {
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  // When retrying or switching sets, advance to a fresh set of content
  const handleRestart = (newSetIdx?: number) => {
    const nextIdx = newSetIdx !== undefined ? newSetIdx : (currentSetIndex + 1) % MEMORY_CARD_SETS.length;
    setCurrentSetIndex(nextIdx);
    setCards([...MEMORY_CARD_SETS[nextIdx]].sort(() => Math.random() - 0.5));
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMoves(0);
    setIsCompleted(false);
    setElapsedSeconds(0);
    startTimeRef.current = Date.now();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      
      {/* Top Controls */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 shadow-xs">
        <button
          onClick={onBack}
          className="text-xs font-bold text-gray-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO GAMES</span>
        </button>

        <div className="flex items-center gap-3 text-xs font-bold">
          <div className="hidden sm:flex items-center gap-1 text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
            <Layers className="w-3.5 h-3.5" />
            <span>Set {currentSetIndex + 1} of {MEMORY_CARD_SETS.length}</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>
          <div className="text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
            Moves: {moves}
          </div>
          <div className="text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
            Pairs: {matchedPairs.length} / {activeSet.length / 2}
          </div>
        </div>
      </div>

      {!isCompleted ? (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                {currentSetIndex === 0 && 'Set 1: Core Silicon & Peripherals'}
                {currentSetIndex === 1 && 'Set 2: Power, Thermal & Board Buses'}
                {currentSetIndex === 2 && 'Set 3: Firmware, LAN & Diagnostics'}
              </span>
            </div>
            <h2 className="text-xl font-black text-gray-900">MEMORY MATCH LAB</h2>
            <p className="text-xs text-gray-600 max-w-lg mx-auto">
              Flip two cards to match hardware components with their correct diagnostic role or specification. Retrying switches to a different set of content!
            </p>

            {/* Set Selection Buttons */}
            <div className="flex justify-center items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-gray-500">SELECT SET:</span>
              {MEMORY_CARD_SETS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRestart(idx)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    currentSetIndex === idx
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                  }`}
                >
                  Set {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid (3x4 or 4x3) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 select-none">
            {cards.map((card, idx) => {
              const isFlipped = flippedIndices.includes(idx) || matchedPairs.includes(card.pairId);
              const isMatched = matchedPairs.includes(card.pairId);

              return (
                <button
                  key={idx}
                  onClick={() => handleCardClick(idx)}
                  className={`h-28 sm:h-32 rounded-xl p-3 text-center flex flex-col items-center justify-center transition-all duration-300 transform shadow-xs cursor-pointer ${
                    isFlipped
                      ? isMatched
                        ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-950 font-bold'
                        : 'bg-blue-50 border-2 border-blue-500 text-blue-950 font-bold scale-[1.02]'
                      : 'bg-gradient-to-br from-blue-700 to-blue-900 text-white hover:from-blue-800 hover:to-blue-950 border border-blue-800'
                  }`}
                >
                  {isFlipped ? (
                    <div className="space-y-1 animate-in fade-in">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                        {card.isConcept ? 'HARDWARE' : 'FUNCTION'}
                      </span>
                      <p className="text-xs sm:text-sm font-bold leading-tight">
                        {card.content}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-blue-200">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-[11px] font-mono font-bold">CSSENTIAL</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Victory Modal */
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-5 shadow-xs">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto animate-bounce" />
          <h3 className="text-2xl font-black text-gray-900">
            ALL PAIRS MATCHED!
          </h3>
          <p className="text-xs text-gray-600">
            You completed the Memory Match challenge in <strong>{moves} moves</strong> and{' '}
            <strong>{formatTime(elapsedSeconds)}</strong>!
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => handleRestart()}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Next Content Set (Set {((currentSetIndex + 1) % MEMORY_CARD_SETS.length) + 1})</span>
            </button>
            <button
              onClick={onBack}
              className="px-6 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg cursor-pointer"
            >
              Back to Games
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
