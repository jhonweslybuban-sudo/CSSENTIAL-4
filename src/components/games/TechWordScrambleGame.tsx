import React, { useState, useRef } from 'react';
import { ArrowLeft, CheckCircle2, RotateCcw, HelpCircle, Trophy, Sparkles, Shuffle, RefreshCw } from 'lucide-react';
import { SCRAMBLE_WORDS } from '../../data/gamesData';
import { api } from '../../services/api';

// Fisher-Yates array shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface TechWordScrambleGameProps {
  studentId: string;
  sessionId: string;
  onBack: () => void;
}

export const TechWordScrambleGame: React.FC<TechWordScrambleGameProps> = ({
  studentId,
  sessionId,
  onBack
}) => {
  // Shuffle/randomize questions on mount
  const [shuffledItems, setShuffledItems] = useState(() => shuffleArray(SCRAMBLE_WORDS));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const currentItem = shuffledItems[currentIndex] || shuffledItems[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const cleanInput = inputVal.trim().toUpperCase();
    const isCorrect = cleanInput === currentItem.word.toUpperCase();
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (isCorrect) {
      const earned = Math.max(5, 15 - (nextAttempts - 1) * 3);
      setScore(s => s + earned);
      setFeedback({ isCorrect: true, message: `✓ Correct! The technical word is ${currentItem.word}! (+${earned} pts) 🎉` });
    } else {
      // Allow retry immediately: multiple attempts permitted
      setFeedback({
        isCorrect: false,
        message: `✕ Not quite right! Attempt #${nextAttempts}. You can try again as many times as needed.`
      });
      if (nextAttempts >= 2 && !showHint) {
        setShowHint(true);
      }
      setTimeout(() => {
        inputRef.current?.select();
      }, 50);
    }
  };

  const handleRetryInput = () => {
    setInputVal('');
    setFeedback(null);
    inputRef.current?.focus();
  };

  const handleNext = async () => {
    if (currentIndex < shuffledItems.length - 1) {
      setCurrentIndex(i => i + 1);
      setInputVal('');
      setFeedback(null);
      setShowHint(false);
      setAttempts(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setIsCompleted(true);
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      await api.recordGameResult({
        student_id: studentId,
        session_id: sessionId,
        game_name: 'Tech Word Scramble',
        start_time: new Date(startTimeRef.current).toISOString(),
        end_time: new Date().toISOString(),
        duration_seconds: duration,
        score,
        level: 1,
        completed: true
      });
    }
  };

  const handleRestart = () => {
    // Re-shuffle items with Fisher-Yates on replay
    setShuffledItems(shuffleArray(SCRAMBLE_WORDS));
    setCurrentIndex(0);
    setInputVal('');
    setFeedback(null);
    setShowHint(false);
    setAttempts(0);
    setScore(0);
    setIsCompleted(false);
    startTimeRef.current = Date.now();
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 shadow-xs">
        <button
          onClick={onBack}
          className="text-xs font-bold text-gray-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO GAMES</span>
        </button>

        <div className="flex items-center gap-3 text-xs font-bold">
          <div className="text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
            Score: {score}
          </div>
          <div className="text-gray-500 font-mono">
            {currentIndex + 1} / {SCRAMBLE_WORDS.length}
          </div>
        </div>
      </div>

      {!isCompleted ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              {currentItem.isFillBlank ? 'Technical Sentence Completion' : 'Unscramble Hardware Word'}
            </span>
            <h2 className="text-xl font-black text-gray-900">
              Word Puzzle #{currentIndex + 1}
            </h2>
          </div>

          {/* Puzzle presentation */}
          <div className="p-6 bg-slate-900 text-white rounded-xl text-center space-y-3 shadow-inner">
            {currentItem.isFillBlank ? (
              <p className="text-base sm:text-lg font-medium text-slate-200 leading-relaxed">
                {currentItem.sentence}
              </p>
            ) : (
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 block mb-2">
                  SCRAMBLED LETTERS
                </span>
                <div className="flex items-center justify-center gap-2 flex-wrap font-mono text-3xl sm:text-4xl font-black tracking-widest text-yellow-300">
                  {currentItem.scrambled.split('').map((letter, i) => (
                    <span
                      key={i}
                      className="w-10 h-12 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center shadow-xs"
                    >
                      {letter}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hint button */}
          <div className="text-center">
            {!showHint ? (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Show Technical Definition Hint</span>
              </button>
            ) : (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 inline-block animate-in fade-in">
                <strong>Clue:</strong> {currentItem.hint}
              </div>
            )}
          </div>

          {/* Input Form with Unlimited Retries */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                ref={inputRef}
                type="text"
                autoFocus
                value={inputVal}
                onChange={e => {
                  setInputVal(e.target.value);
                  if (feedback && !feedback.isCorrect) {
                    setFeedback(null);
                  }
                }}
                placeholder="TYPE YOUR ANSWER..."
                disabled={feedback?.isCorrect}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-center font-mono text-lg font-bold tracking-widest uppercase focus:ring-2 focus:ring-blue-600 outline-hidden"
              />
              {!feedback?.isCorrect ? (
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer active:scale-95"
                  >
                    SUBMIT
                  </button>
                  {feedback && !feedback.isCorrect && (
                    <button
                      type="button"
                      onClick={handleRetryInput}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer active:scale-95"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>TRY AGAIN</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>NEXT WORD →</span>
                </button>
              )}
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-lg text-xs font-bold text-center animate-in fade-in ${
                  feedback.isCorrect
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                    : 'bg-red-50 border-2 border-red-300 text-red-900'
                }`}
              >
                {feedback.message}
              </div>
            )}
          </form>

        </div>
      ) : (
        /* Results */
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-5 shadow-xs">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto animate-bounce" />
          <h3 className="text-2xl font-black text-gray-900">Word Scramble Mastered!</h3>
          <p className="text-xs text-gray-600">
            You completed all technical word puzzles with a final score of{' '}
            <strong className="text-blue-700 font-bold">{score} pts</strong>!
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
            <button
              onClick={onBack}
              className="px-6 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg cursor-pointer"
            >
              Back to Games Hub
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
