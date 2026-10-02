import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, ChevronRight, Send } from 'lucide-react';

/**
 * QuizPanel — renders the current quiz for the active chest.
 *
 * Props:
 *   quiz          – quiz object { type, concept, prompt, options?, answer (hidden) }
 *   onSubmit      – fn(answer) → { correct, explain, penalty?, cooldown? }
 *   cooldown      – seconds remaining in cooldown (0 = none)
 *   keyEarned     – boolean: quiz already solved
 *   onOpenChest   – called when "Open Chest" button clicked
 *   chestIndex    – 1-based chest number for display
 *   disabled      – global lock (time expired)
 */
export default function QuizPanel({
  quiz,
  onSubmit,
  cooldown = 0,
  keyEarned = false,
  onOpenChest,
  chestIndex = 1,
  disabled = false,
}) {
  const [selected, setSelected] = useState(null); // mcq index
  const [textAnswer, setTextAnswer] = useState('');
  const [feedback, setFeedback] = useState(null); // { correct, explain, penalty }
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (disabled || submitting || cooldown > 0) return;
    let answer;
    if (quiz.type === 'mcq') {
      if (selected === null) return;
      answer = selected;
    } else {
      if (!textAnswer.trim()) return;
      answer = textAnswer.trim();
    }

    setSubmitting(true);
    const result = await Promise.resolve(onSubmit(answer));
    setFeedback(result);
    setSubmitting(false);

    if (result?.correct) {
      setSelected(null);
      setTextAnswer('');
    }
  };

  if (!quiz) {
    return (
      <div className="p-4 bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500 font-mono">
        No quiz available for this chest.
      </div>
    );
  }

  if (keyEarned) {
    return (
      <div className="p-4 bg-slate-900/80 border border-yellow-500/40 rounded-2xl space-y-3 animate-fadeIn">
        <div className="flex items-center gap-2 text-yellow-300 font-mono font-bold text-sm">
          <span className="text-xl">🔑</span> Key Earned!
        </div>
        <p className="text-xs text-slate-400">Quiz solved. Click "Open Chest" to collect your fragment.</p>
        <button
          onClick={onOpenChest}
          disabled={disabled}
          className="w-full py-2.5 bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-slate-900 font-mono font-black rounded-xl text-sm shadow-lg shadow-amber-950/40 transition animate-keyGlow disabled:opacity-40"
        >
          📦 Open Chest {chestIndex}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-2xl space-y-3 animate-fadeIn">
      {/* header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
            {quiz.concept}
          </span>
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            {quiz.type === 'mcq' ? 'Multiple Choice' : quiz.type === 'output' ? 'Predict Output' : 'Fill in the Blank'}
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">Chest #{chestIndex}</span>
      </div>

      {/* question */}
      <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
        {quiz.prompt}
      </pre>

      {/* answer UI */}
      {quiz.type === 'mcq' ? (
        <div className="grid grid-cols-1 gap-2">
          {(quiz.options || []).map((opt, idx) => (
            <button
              key={idx}
              disabled={disabled || cooldown > 0}
              onClick={() => setSelected(idx)}
              aria-pressed={selected === idx}
              className={`text-left px-3 py-2 rounded-xl border text-xs font-mono transition ${
                selected === idx
                  ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200'
                  : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500'
              } disabled:opacity-40`}
            >
              <span className="font-bold text-slate-500 mr-2">{String.fromCharCode(65 + idx)}.</span>
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <input
          type="text"
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={disabled || cooldown > 0}
          placeholder={quiz.type === 'output' ? 'Type expected output…' : 'Fill in the blank…'}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 disabled:opacity-40"
          aria-label="Quiz answer input"
        />
      )}

      {/* feedback */}
      {feedback && !cooldown && (
        <div
          className={`flex items-start gap-2 p-3 rounded-xl border text-xs font-mono animate-fadeIn ${
            feedback.correct
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
          }`}
        >
          {feedback.correct ? (
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          )}
          <div className="space-y-0.5">
            {!feedback.correct && feedback.penalty && (
              <p className="font-bold text-rose-400">+{feedback.penalty}s time penalty added</p>
            )}
            <p className="text-slate-300">{feedback.explain}</p>
          </div>
        </div>
      )}

      {/* cooldown */}
      {cooldown > 0 && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Next question in <strong className="text-amber-300">{cooldown}s</strong>…</span>
        </div>
      )}

      {/* submit */}
      {!keyEarned && (
        <button
          onClick={handleSubmit}
          disabled={
            disabled || submitting || cooldown > 0 ||
            (quiz.type === 'mcq' ? selected === null : !textAnswer.trim())
          }
          className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-950/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="animate-pulse">Checking…</span>
          ) : cooldown > 0 ? (
            <><Clock className="w-3.5 h-3.5" /> Cooldown</>
          ) : (
            <><Send className="w-3.5 h-3.5" /> Submit Answer</>
          )}
        </button>
      )}
    </div>
  );
}
