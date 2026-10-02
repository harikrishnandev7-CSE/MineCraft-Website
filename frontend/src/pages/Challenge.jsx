import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParticipant } from '../context/ParticipantContext';
import { useChallenge } from '../hooks/useChallenge';
import { useTimer } from '../hooks/useTimer';

// layout / shared
import Timer from '../components/timer/Timer';
import TimeExpiredModal from '../components/timer/TimeExpiredModal';
import Toast from '../components/common/Toast';
import Button from '../components/common/Button';
import AssemblyBoard from '../components/assembly/AssemblyBoard';
import AssemblyPreview from '../components/assembly/AssemblyPreview';
import RunButton from '../components/execution/RunButton';
import SubmitButton from '../components/execution/SubmitButton';
import OutputPanel from '../components/execution/OutputPanel';

// new gameplay components
import PhaseStepper from '../components/gameplay/PhaseStepper';
import LanguagePicker from '../components/gameplay/LanguagePicker';
import ChestGrid from '../components/gameplay/ChestGrid';
import QuizPanel from '../components/gameplay/QuizPanel';
import FragmentVault from '../components/gameplay/FragmentVault';
import ProgressCard from '../components/gameplay/ProgressCard';

import {
  User, Blocks, BookOpen, Terminal, RotateCcw, Shuffle,
} from 'lucide-react';
import { USE_MOCK_JUDGE } from '../utils/constants';

export default function Challenge() {
  const { participant } = useParticipant();
  const navigate = useNavigate();

  const {
    challenge,
    language,
    selectLanguage,
    languageLocked,
    langConfig,
    startTime,
    startChallenge,
    phase,

    // chest / quiz
    chestStates,
    activeChestId,
    setActiveChestId,
    activeChestQuiz,
    submitQuizAnswer,
    openChest,
    cooldownRemaining,

    // fragments
    collectedFragments,
    collectedFragmentIds,
    fragmentMap,
    shuffledVaultOrder,

    // assembly
    assemblyOrder,
    assemblyFragments,
    assembledCode,
    reorderAssembly,
    resetAssemblyOrder,

    // scoring
    penaltySeconds,
    quizAttempts,
    submissionAttempts,

    // execution
    executeCode,
    submitSolution,
    isCompiling,
    isValidating,
    compileOutput,

    // result
    finalResult,
    isTimeExpired,
    handleTimeExpired,
    resetAll,
  } = useChallenge();

  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');
  const [submissionResult, setSubmissionResult] = useState(null);

  const showToast = useCallback((msg, type = 'info') => {
    setToastMessage(msg);
    setToastType(type);
  }, []);

  // redirect if not registered
  useEffect(() => {
    if (!participant) navigate('/register');
  }, [participant, navigate]);

  // redirect to result on ACCEPTED
  useEffect(() => {
    if (finalResult?.status === 'ACCEPTED') navigate('/result');
  }, [finalResult, navigate]);

  // start challenge if no startTime (e.g. came from /rules)
  useEffect(() => {
    if (participant && !startTime && phase === 'SETUP') {
      // Don't auto-start; let the SETUP UI handle it
    } else if (participant && !startTime && phase !== 'SETUP') {
      startChallenge();
    }
  }, [participant, startTime, phase]);

  const { secondsRemaining, timerState } = useTimer(
    startTime,
    challenge.duration || 1200,
    handleTimeExpired,
    finalResult?.status === 'ACCEPTED'
  );

  // ── chest click handler ──
  const handleChestClick = useCallback((chestId) => {
    if (isTimeExpired) return;
    const cs = chestStates?.[chestId];
    if (!cs) return;
    if (cs.status === 'opened') return;
    setActiveChestId(chestId);
  }, [chestStates, isTimeExpired, setActiveChestId]);

  // ── quiz answer ──
  const handleQuizAnswer = useCallback((answer) => {
    if (!activeChestId || isTimeExpired) return { correct: false, explain: '' };
    const result = submitQuizAnswer(activeChestId, answer);
    if (result?.correct) {
      showToast('✅ Correct! Key earned — open the chest to claim your fragment.', 'success');
    } else if (result?.penalty) {
      showToast(`❌ Wrong answer. +${result.penalty}s penalty. Cooldown ${result.cooldown}s…`, 'error');
    }
    return result;
  }, [activeChestId, submitQuizAnswer, isTimeExpired, showToast]);

  // ── open chest ──
  const handleOpenChest = useCallback(() => {
    if (!activeChestId || isTimeExpired) return;
    const fragment = openChest(activeChestId);
    if (fragment) {
      showToast(`📦 Fragment collected! Role: ${fragment.role}`, 'success');
    }
  }, [activeChestId, openChest, isTimeExpired, showToast]);

  // ── run code ──
  const handleRunCode = useCallback(async () => {
    if (isTimeExpired) { showToast('Time expired. Execution locked.', 'error'); return; }
    if (!assembledCode.trim()) { showToast('No code assembled yet. Arrange fragments first.', 'warning'); return; }
    const res = await executeCode();
    if (res.status === 'success' || res.status === 'Accepted' || res.success) {
      showToast('✅ Compilation successful! Check output.', 'success');
    } else {
      showToast(res.message || 'Execution returned an error. Check output panel.', 'info');
    }
  }, [isTimeExpired, assembledCode, executeCode, showToast]);

  // ── submit ──
  const handleSubmit = useCallback(async () => {
    if (isTimeExpired) { showToast('Time expired. Submissions closed.', 'error'); return; }
    if (!assembledCode.trim()) { showToast('Cannot submit empty assembly.', 'warning'); return; }
    const res = await submitSolution(participant);
    setSubmissionResult(res);
    if (res?.status === 'ACCEPTED') {
      showToast('🎉 ACCEPTED! All hidden test cases passed.', 'success');
    } else {
      showToast('❌ Wrong answer. Some test cases failed. Check output panel.', 'error');
    }
  }, [isTimeExpired, assembledCode, submitSolution, participant, showToast]);

  // ── derived ──
  const totalFragments  = langConfig?.fragments?.length || 0;
  const allChests       = langConfig?.chests || [];
  const activeChestState = chestStates?.[activeChestId] || null;
  const activeChestIdx   = allChests.findIndex((c) => c.id === activeChestId);

  // ─── SETUP phase UI ─────────────────────────────────────────────────────
  if (phase === 'SETUP') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 space-y-6 font-mono text-slate-200">
        <div className="text-center space-y-2">
          <span className="text-[10px] px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold uppercase tracking-wider border border-cyan-500/30">
            MIND CRAFT ARENA
          </span>
          <h1 className="text-3xl font-black text-white mt-3">{challenge.title}</h1>
          <p className="text-xs text-slate-400">{challenge.description}</p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
          <LanguagePicker
            language={language}
            onSelect={selectLanguage}
            locked={languageLocked}
          />

          <Button
            variant="primary"
            size="lg"
            className="w-full font-black"
            onClick={() => {
              startChallenge();
              showToast('⏱ Timer started! Good luck.', 'info');
            }}
          >
            ▶ START HUNT
          </Button>

          <p className="text-[11px] text-slate-500 text-center">
            You can change language until the first chest opens.
          </p>
        </div>

        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
      </div>
    );
  }

  // ─── HUNT + ASSEMBLE + DONE layout ───────────────────────────────────────
  return (
    <div className="max-w-[1700px] mx-auto px-4 py-5 space-y-4 font-mono text-slate-200">

      {/* ── ARENA HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Blocks className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold uppercase tracking-wider">
                MIND CRAFT ARENA
              </span>
              <h2 className="text-base font-bold text-white tracking-wide">{challenge.title}</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Category: <span className="text-cyan-400">{challenge.category}</span>
              {' '}// Reward: <span className="text-emerald-400">{challenge.points} PTS</span>
              {' '}// Engine: <span className={USE_MOCK_JUDGE ? 'text-amber-400' : 'text-emerald-400'}>
                {USE_MOCK_JUDGE ? 'Mock' : 'Judge0'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LanguagePicker language={language} onSelect={selectLanguage} locked={languageLocked} />

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Contestant:</span>
            <span className="text-slate-100 font-bold">{participant?.name || 'Registered Participant'}</span>
          </div>

          <Timer secondsRemaining={secondsRemaining} timerState={timerState} />
        </div>
      </div>

      {/* ── PHASE STEPPER ── */}
      <PhaseStepper
        phase={phase}
        collectedCount={collectedFragmentIds.length}
        totalCount={totalFragments}
      />

      {/* ── 3-COLUMN MAIN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── COLUMN 1: Challenge Brief + Progress (col-span-3) ── */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" /> CHALLENGE BRIEF
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800/40">
                {challenge.difficulty}
              </span>
            </div>

            <div className="space-y-2 text-xs leading-relaxed">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Problem</label>
              <p className="text-slate-300 whitespace-pre-line bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                {challenge.description}
              </p>
            </div>

            {/* Sample I/O */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sample Test</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500">Input:</span>
                  <pre className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-[11px]">
                    {challenge.sampleInput || 'N/A'}
                  </pre>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Output:</span>
                  <pre className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 text-[11px]">
                    {challenge.sampleOutput || 'N/A'}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <ProgressCard
            collectedCount={collectedFragmentIds.length}
            totalCount={totalFragments}
            penaltySeconds={penaltySeconds}
            quizAttempts={quizAttempts}
            phase={phase}
          />
        </div>

        {/* ── COLUMN 2: HUNT or ASSEMBLE (col-span-5) ── */}
        <div className="lg:col-span-5 space-y-4">

          {/* HUNT phase: chests + active quiz */}
          {phase === 'HUNT' && (
            <>
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 shadow-lg">
                <ChestGrid
                  chests={allChests}
                  chestStates={chestStates || {}}
                  fragmentMap={fragmentMap}
                  revealOrder={langConfig?.revealOrder || []}
                  activeChestId={activeChestId}
                  onChestClick={handleChestClick}
                />
              </div>

              {/* Quiz panel for active chest */}
              {activeChestId && (
                <div className="space-y-2">
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider px-1">
                    Active: Chest #{activeChestIdx + 1}
                  </div>
                  <QuizPanel
                    quiz={activeChestQuiz}
                    onSubmit={handleQuizAnswer}
                    cooldown={cooldownRemaining}
                    keyEarned={activeChestState?.keyEarned || false}
                    onOpenChest={handleOpenChest}
                    chestIndex={activeChestIdx + 1}
                    disabled={isTimeExpired}
                  />
                </div>
              )}

              {!activeChestId && collectedFragmentIds.length < totalFragments && (
                <div className="p-4 bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500 font-mono">
                  Click a chest above to start the quiz for that fragment.
                </div>
              )}
            </>
          )}

          {/* ASSEMBLE phase: assembly board + preview */}
          {(phase === 'ASSEMBLE' || phase === 'DONE') && (
            <>
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl text-xs font-mono text-emerald-300 flex items-center gap-2 animate-fadeIn">
                <span className="text-lg">🎉</span>
                <span>All fragments collected! Arrange them in the correct order, then run and submit.</span>
              </div>

              <AssemblyBoard
                blocks={assemblyFragments}
                onReorder={reorderAssembly}
                onRemove={() => {}}
                onClear={resetAssemblyOrder}
              />

              <AssemblyPreview combinedCode={assembledCode} />

              {/* Shuffle / Reset buttons */}
              <div className="flex gap-2">
                <button
                  onClick={resetAssemblyOrder}
                  className="flex-1 py-1.5 text-[11px] font-mono text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-600 rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <Shuffle className="w-3.5 h-3.5" /> Reset Order
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── COLUMN 3: Fragment Vault (col-span-4) ── */}
        <div className="lg:col-span-4 space-y-4">
          <FragmentVault
            fragments={langConfig?.fragments || []}
            collectedIds={collectedFragmentIds}
            shuffledOrder={shuffledVaultOrder}
            phase={phase}
          />
        </div>
      </div>

      {/* ── BOTTOM: Execution Controls + Output Panel ── */}
      {(phase === 'ASSEMBLE' || phase === 'DONE') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
          {/* Execution controls */}
          <div className="lg:col-span-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" /> EXECUTION CONTROLS
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Run against sample input to verify, then submit for official hidden test scoring.
              </p>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <RunButton
                  onClick={handleRunCode}
                  isLoading={isCompiling}
                  disabled={isTimeExpired || !assembledCode.trim()}
                />
                <SubmitButton
                  onClick={handleSubmit}
                  isLoading={isValidating}
                  disabled={isTimeExpired || !assembledCode.trim()}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[11px] font-mono text-slate-500">
                  Fragments on board: {assemblyFragments.length}/{totalFragments}
                </span>
                <button
                  onClick={resetAll}
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px]"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Session
                </button>
              </div>
            </div>
          </div>

          {/* Output panel */}
          <div className="lg:col-span-8">
            <OutputPanel
              compileOutput={compileOutput}
              submissionResult={submissionResult}
              sampleInput={challenge.sampleInput}
              sampleOutput={challenge.sampleOutput}
            />
          </div>
        </div>
      )}

      {/* ── MODALS & TOAST ── */}
      <TimeExpiredModal
        isOpen={isTimeExpired && (!finalResult || finalResult.status !== 'ACCEPTED')}
        onAcknowledge={() => navigate('/result')}
        onRestart={() => startChallenge()}
      />
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
    </div>
  );
}
