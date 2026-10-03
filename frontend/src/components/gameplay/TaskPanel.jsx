import React, { useState, useCallback, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Clock, Send, AlertTriangle } from 'lucide-react';

/**
 * TaskPanel – renders the current server-sent task quiz.
 * Supports types: MCQ, SHORT_ANSWER, OUTPUT_PREDICTION, FILL_BLANK, CODE_ORDER
 *
 * Props:
 *   task          – { taskId, title, description, order, quiz: { quizId, type, prompt, options, concept } }
 *   onSubmit      – async (answer) => { correct, explain, penalty?, cooldown? }
 *   cooldown      – number (seconds remaining)
 *   taskIndex     – current task index (0-based)
 *   totalTasks    – total number of tasks
 *   disabled      – if true, input is locked
 *   lastResult    – true | false | null (last answer correctness)
 *   lastExplain   – string (explanation from last answer)
 *   isSubmitting   – bool
 */
export default function TaskPanel({
  task,
  onSubmit,
  cooldown = 0,
  taskIndex = 0,
  totalTasks = 0,
  disabled = false,
  lastResult = null,
  lastExplain = '',
  isSubmitting = false,
}) {
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [localFeedback, setLocalFeedback] = useState(null);

  const quiz = task?.quiz;

  // Reset answer when task/quiz changes
  useEffect(() => {
    setAnswer('');
    setSelectedOption(null);
    setLocalFeedback(null);
  }, [task?.taskId, quiz?.quizId]);

  // Show server feedback
  useEffect(() => {
    if (lastResult !== null) {
      setLocalFeedback({
        correct: lastResult,
        explain: lastExplain,
      });
    }
  }, [lastResult, lastExplain]);

  const handleSubmit = useCallback(async () => {
    if (disabled || cooldown > 0 || isSubmitting) return;

    let submittedAnswer;
    if (quiz?.type === 'MCQ') {
      if (selectedOption === null) return;
      submittedAnswer = selectedOption;
    } else {
      if (!answer.trim()) return;
      submittedAnswer = answer.trim();
    }

    const result = await onSubmit(submittedAnswer);
    if (result?.correct) {
      // Clear input on correct
      setAnswer('');
      setSelectedOption(null);
    }
  }, [quiz, selectedOption, answer, onSubmit, disabled, cooldown, isSubmitting]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  if (!task || !quiz) {
    return (
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl text-center text-slate-500 text-xs font-mono">
        No task available
      </div>
    );
  }

  const typeLabel = {
    MCQ: 'Multiple Choice',
    SHORT_ANSWER: 'Short Answer',
    OUTPUT_PREDICTION: 'Predict Output',
    FILL_BLANK: 'Fill in the Blank',
    CODE_ORDER: 'Code Order',
  }[quiz.type] || quiz.type;

  return (
    <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{task.title || `Task ${taskIndex + 1}`}</h3>
            <span className="text-[10px] text-slate-500 font-mono uppercase">{typeLabel}</span>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold font-mono">
          {taskIndex + 1} / {totalTasks}
        </span>
      </div>

      {/* Quiz prompt */}
      <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
        {quiz.prompt}
      </div>

      {/* Concept tag */}
      {quiz.concept && (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-mono">
            {quiz.concept}
          </span>
        </div>
      )}

      {/* Answer input area */}
      <div className="space-y-2">
        {quiz.type === 'MCQ' && quiz.options?.length > 0 && (
          <div className="space-y-2">
            {quiz.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const wasCorrectOption = localFeedback?.correct === true && isSelected;
              const wasWrongOption = localFeedback?.correct === false && isSelected;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (!disabled && cooldown <= 0 && !isSubmitting) {
                      setSelectedOption(idx);
                      setLocalFeedback(null);
                    }
                  }}
                  disabled={disabled || cooldown > 0 || isSubmitting}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-mono transition-all duration-200 flex items-center gap-3 ${
                    wasCorrectOption
                      ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-200'
                      : wasWrongOption
                      ? 'border-rose-500/60 bg-rose-950/30 text-rose-200'
                      : isSelected
                      ? 'border-cyan-500/60 bg-cyan-950/30 text-cyan-200'
                      : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-600 hover:bg-slate-900/60'
                  } ${disabled || cooldown > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isSelected
                        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {(quiz.type === 'SHORT_ANSWER' || quiz.type === 'OUTPUT_PREDICTION' || quiz.type === 'FILL_BLANK') && (
          <div className="relative">
            <input
              type="text"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                setLocalFeedback(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                quiz.type === 'FILL_BLANK'
                  ? 'Type the missing code...'
                  : quiz.type === 'OUTPUT_PREDICTION'
                  ? 'What does the code output?'
                  : 'Type your answer...'
              }
              disabled={disabled || cooldown > 0 || isSubmitting}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 disabled:opacity-50"
            />
          </div>
        )}

        {quiz.type === 'CODE_ORDER' && (
          <textarea
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setLocalFeedback(null);
            }}
            placeholder="Enter the correct order (comma-separated or one per line)"
            disabled={disabled || cooldown > 0 || isSubmitting}
            rows={3}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 disabled:opacity-50 resize-none"
          />
        )}
      </div>

      {/* Feedback */}
      {localFeedback && (
        <div
          className={`p-3 rounded-xl text-xs font-mono flex items-start gap-2 animate-fadeIn ${
            localFeedback.correct
              ? 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/30 border border-rose-500/30 text-rose-300'
          }`}
        >
          {localFeedback.correct ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <span className="font-bold">
              {localFeedback.correct ? '✅ Correct! Code block unlocked.' : '❌ Wrong Answer (Penalty Added)'}
            </span>
            {localFeedback.explain && (
              <p className="text-slate-400 leading-relaxed">{localFeedback.explain}</p>
            )}
          </div>
        </div>
      )}

      {/* Cooldown indicator */}
      {cooldown > 0 && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          <span>Cooldown: {cooldown}s — next question loading...</span>
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={
          disabled ||
          cooldown > 0 ||
          isSubmitting ||
          (quiz.type === 'MCQ' ? selectedOption === null : !answer.trim())
        }
        className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-cyan-600 disabled:hover:to-cyan-500 active:scale-[0.98]"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Validating...
          </>
        ) : cooldown > 0 ? (
          <>
            <Clock className="w-4 h-4" />
            Wait {cooldown}s
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Answer
          </>
        )}
      </button>
    </div>
  );
}
