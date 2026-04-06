import { useState, useEffect, useMemo, useRef } from 'react';
import { Brain, Zap, Shield, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { TriviaQuestion } from '../types/game';

interface TriviaModalProps {
  question: TriviaQuestion;
  type: 'attack' | 'defend';
  onAnswer: (correct: boolean) => void;
  onTimeout: () => void;
  timeLimit: number;
}

export default function TriviaModal({ question, type, onAnswer, onTimeout, timeLimit }: TriviaModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const timedOut = useRef(false);

  const answers = useMemo(() => {
    const all = [...question.incorrect_answers, question.correct_answer];
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }, [question]);

  useEffect(() => {
    if (revealed) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 0.05;
        if (next <= 0) {
          clearInterval(interval);
          if (!timedOut.current) {
            timedOut.current = true;
            onTimeout();
          }
          return 0;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [revealed, onTimeout]);

  const handleSelect = (answer: string) => {
    if (revealed || timeLeft <= 0) return;
    setSelected(answer);
    setRevealed(true);
    setTimeout(() => {
      onAnswer(answer === question.correct_answer);
    }, 1200);
  };

  const isAttack = type === 'attack';
  const pct = Math.max(0, (timeLeft / timeLimit) * 100);
  const timerColor = pct > 50 ? 'bg-emerald-500' : pct > 25 ? 'bg-amber-500' : 'bg-red-500';
  const timerGlow = pct > 50 ? 'shadow-emerald-500/30' : pct > 25 ? 'shadow-amber-500/30' : 'shadow-red-500/30';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f1629] border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        <div
          className={`px-6 py-4 flex items-center justify-between ${
            isAttack
              ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-b border-amber-500/20'
              : 'bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 border-b border-cyan-500/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isAttack ? 'bg-amber-500/20' : 'bg-cyan-500/20'}`}>
              {isAttack ? <Zap className="w-4 h-4 text-amber-400" /> : <Shield className="w-4 h-4 text-cyan-400" />}
            </div>
            <div>
              <p className={`font-bold text-sm ${isAttack ? 'text-amber-400' : 'text-cyan-400'}`}>
                {isAttack ? 'Knowledge Strike' : 'Brain Shield'}
              </p>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider">
                {isAttack ? 'Correct = Double Damage' : 'Correct = Halve Damage'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${pct > 25 ? 'text-slate-500' : 'text-red-400 animate-pulse'}`} />
            <span className={`text-sm font-mono font-bold ${pct > 25 ? 'text-slate-400' : 'text-red-400'}`}>
              {Math.ceil(timeLeft)}s
            </span>
          </div>
        </div>

        <div className="relative h-1 bg-slate-900">
          <div
            className={`h-full ${timerColor} shadow-lg ${timerGlow} transition-none`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="p-6">
          <div className="flex items-start gap-3 mb-6">
            <Brain className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
            <p className="text-white text-sm leading-relaxed font-medium">{question.question}</p>
          </div>

          <div className="space-y-2">
            {answers.map((answer, i) => {
              const isCorrect = answer === question.correct_answer;
              const isSelected = selected === answer;
              let classes = 'w-full text-left p-3.5 rounded-xl border text-sm transition-all duration-200 ';

              if (revealed) {
                if (isCorrect) {
                  classes += 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400';
                } else if (isSelected) {
                  classes += 'border-red-500/50 bg-red-500/10 text-red-400';
                } else {
                  classes += 'border-slate-800 bg-slate-900/30 text-slate-600';
                }
              } else {
                classes += 'border-slate-700/50 bg-slate-900/50 text-slate-300 hover:bg-slate-800/80 hover:border-slate-600 cursor-pointer';
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(answer)}
                  disabled={revealed || timeLeft <= 0}
                  className={classes}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-mono text-slate-500 shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{answer}</span>
                    {revealed && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {revealed && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-800/50">
            <span className="text-[10px] text-slate-600 uppercase tracking-wider">
              Difficulty: {question.difficulty}
            </span>
            <span className="text-[10px] text-slate-600 uppercase tracking-wider">
              {timeLimit}s time limit
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
