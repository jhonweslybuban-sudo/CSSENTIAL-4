import React, { useState, useRef } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Trophy, RotateCcw, Clock, Award, ChevronRight } from 'lucide-react';
import { COMPREHENSIVE_QUIZ_QUESTIONS } from '../../data/gamesData';
import { api } from '../../services/api';

interface ComputerSystemQuizGameProps {
  studentId: string;
  sessionId: string;
  onBack: () => void;
}

export const ComputerSystemQuizGame: React.FC<ComputerSystemQuizGameProps> = ({
  studentId,
  sessionId,
  onBack
}) => {
  const [questions] = useState(() =>
    [...COMPREHENSIVE_QUIZ_QUESTIONS].sort(() => Math.random() - 0.5)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);
  const autoAdvanceTimeoutRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  React.useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => {
      clearInterval(timerRef.current);
      if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const currentQ = questions[currentIndex];

  const handleSelect = (idx: number) => {
    if (isChecked) return;
    setSelectedAnswer(idx);
  };

  const handleCheck = () => {
    if (selectedAnswer === null || isChecked) return;
    setIsChecked(true);
    if (selectedAnswer === currentQ.correct) {
      setScore(s => s + 1);
    }

    if (autoAdvance) {
      setCountdown(2);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => (prev && prev > 1 ? prev - 1 : null));
      }, 1000);

      autoAdvanceTimeoutRef.current = setTimeout(() => {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        handleNext();
      }, 2000);
    }
  };

  const handleNext = async () => {
    if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setCountdown(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setIsChecked(false);
    } else {
      setIsCompleted(true);
      clearInterval(timerRef.current);
      const finalScore = selectedAnswer === currentQ.correct ? score + 1 : score;
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

      await api.recordQuizResult({
        student_id: studentId,
        session_id: sessionId,
        quiz_name: 'Computer System Quiz (20 Items)',
        start_time: new Date(startTimeRef.current).toISOString(),
        end_time: new Date().toISOString(),
        duration_seconds: duration,
        score: finalScore,
        total_questions: questions.length,
        percentage: Math.round((finalScore / questions.length) * 100),
        completed: true
      });
    }
  };

  const handlePrimaryButtonClick = () => {
    if (!isChecked) {
      handleCheck();
    } else {
      handleNext();
    }
  };

  const handleRestart = () => {
    if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setCountdown(null);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsChecked(false);
    setScore(0);
    setIsCompleted(false);
    setElapsedSeconds(0);
    startTimeRef.current = Date.now();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const r = secs % 60;
    return `${mins}:${r < 10 ? '0' : ''}${r}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      
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
          <div className="flex items-center gap-1 font-mono text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>
          <div className="text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
            Score: {score} / {questions.length}
          </div>
        </div>
      </div>

      {!isCompleted ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
          
          {/* Progress Header */}
          <div className="bg-slate-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                Comprehensive Assessment
              </span>
              <h2 className="text-base font-black text-gray-900">
                Question {currentIndex + 1} of {questions.length}
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-gray-400">
              {Math.round(((currentIndex + 1) / questions.length) * 100)}%
            </span>
          </div>

          <div className="w-full bg-gray-100 h-1.5">
            <div
              className="bg-blue-600 h-1.5 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-gray-900 leading-snug">
              {currentQ.question}
            </h3>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, idx) => {
                let btnStyle = 'border-gray-200 hover:border-blue-400 bg-white text-gray-800';
                if (selectedAnswer === idx && !isChecked) {
                  btnStyle = 'border-blue-600 bg-blue-50 text-blue-950 ring-1 ring-blue-600';
                } else if (isChecked) {
                  if (idx === currentQ.correct) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                  } else if (selectedAnswer === idx) {
                    btnStyle = 'border-red-400 bg-red-50 text-red-900 line-through';
                  } else {
                    btnStyle = 'border-gray-200 opacity-60 bg-gray-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={isChecked}
                    className={`w-full text-left p-3.5 rounded-lg border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-full bg-gray-100 border border-gray-300 text-xs font-bold flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 mt-0.5">{opt}</span>
                    {isChecked && idx === currentQ.correct && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    {isChecked && selectedAnswer === idx && idx !== currentQ.correct && (
                      <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            {isChecked && (
              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg text-xs text-blue-950 leading-relaxed animate-in fade-in">
                <strong>Pedagogical Rationale:</strong> {currentQ.explanation}
              </div>
            )}

            {/* Controls & Unified Single Action Button */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoAdvance}
                  onChange={(e) => setAutoAdvance(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-medium">Auto-advance after feedback (2s)</span>
              </label>

              <div className="flex items-center gap-2">
                {!isChecked ? (
                  <button
                    id="quiz-primary-action-btn"
                    onClick={handlePrimaryButtonClick}
                    disabled={selectedAnswer === null}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                      selectedAnswer !== null
                        ? 'bg-blue-700 hover:bg-blue-800 text-white cursor-pointer active:scale-95'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span>SUBMIT ANSWER</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    id="quiz-primary-action-btn"
                    onClick={handlePrimaryButtonClick}
                    className={`flex items-center gap-2 px-6 py-2.5 text-white text-xs font-black rounded-lg shadow-md transition-all cursor-pointer active:scale-95 animate-in zoom-in-95 duration-150 ${
                      selectedAnswer === currentQ.correct
                        ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-300'
                        : 'bg-red-600 hover:bg-red-700 ring-2 ring-red-300'
                    }`}
                  >
                    {selectedAnswer === currentQ.correct ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>
                      {selectedAnswer === currentQ.correct ? 'CORRECT!' : 'INCORRECT'} —{' '}
                      {currentIndex < questions.length - 1 ? 'NEXT QUESTION' : 'VIEW SCORE REPORT'}
                      {countdown !== null ? ` (${countdown}s)` : ''}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Results screen */
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-6 shadow-xs">
          <Award className="w-16 h-16 text-blue-700 mx-auto" />
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Quiz Completed
            </span>
            <h3 className="text-2xl font-black text-gray-900 mt-1">
              Computer System Assessment Report
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto py-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <div className="text-2xl font-black text-blue-700">{score}</div>
              <div className="text-[11px] text-gray-500 font-semibold">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">
                {Math.round((score / questions.length) * 100)}%
              </div>
              <div className="text-[11px] text-gray-500 font-semibold">Percentage</div>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900 font-mono">
                {formatTime(elapsedSeconds)}
              </div>
              <div className="text-[11px] text-gray-500 font-semibold">Time</div>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-6 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Quiz</span>
            </button>
            <button
              onClick={onBack}
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Back to Games
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
