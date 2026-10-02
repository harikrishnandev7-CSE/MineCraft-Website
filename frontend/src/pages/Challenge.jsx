import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParticipant } from '../context/ParticipantContext';
import { useChallenge } from '../hooks/useChallenge';
import { useTimer } from '../hooks/useTimer';
import QRScannerModal from '../components/qr/QRScannerModal';
import CollectedBlocks from '../components/assembly/CollectedBlocks';
import AssemblyBoard from '../components/assembly/AssemblyBoard';
import AssemblyPreview from '../components/assembly/AssemblyPreview';
import EditorToolbar from '../components/editor/EditorToolbar';
import CodeEditor from '../components/editor/CodeEditor';
import RunButton from '../components/execution/RunButton';
import SubmitButton from '../components/execution/SubmitButton';
import OutputPanel from '../components/execution/OutputPanel';
import Timer from '../components/timer/Timer';
import TimeExpiredModal from '../components/timer/TimeExpiredModal';
import Toast from '../components/common/Toast';
import Button from '../components/common/Button';
import {
  User,
  QrCode,
  Sparkles,
  RotateCcw,
  BookOpen,
  Blocks,
  Eye,
  Terminal,
  HelpCircle,
  CheckSquare,
} from 'lucide-react';

export default function Challenge() {
  const { participant } = useParticipant();
  const navigate = useNavigate();

  const {
    challenge,
    language,
    selectLanguage,
    langConfig,
    startTime,
    scannedQRIds,
    unlockedBlocks,
    assemblyBlocks,
    assembledCode,
    unlockQR,
    revealNextBlock,
    addBlockToAssembly,
    reorderAssemblyBlocks,
    removeAssemblyBlock,
    executeCode,
    submitSolution,
    isCompiling,
    isValidating,
    compileOutput,
    attempts,
    finalResult,
    isTimeExpired,
    handleTimeExpired,
    resetAll,
  } = useChallenge();

  const [activeQR, setActiveQR] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');
  const [submissionResult, setSubmissionResult] = useState(null);

  // Auto-unlock initial blocks if none are unlocked yet
  useEffect(() => {
    if (unlockedBlocks.length === 0 && langConfig?.blocks?.length > 0) {
      // First 3 fragments are initially available
      const initial = langConfig.blocks.slice(0, 3);
      initial.forEach((b) => {
        if (unlockQR) {
          // or direct reveal
          revealNextBlock();
        }
      });
    }
  }, [langConfig]);

  // Navigate to Result page once accepted
  useEffect(() => {
    if (finalResult && finalResult.status === 'ACCEPTED') {
      navigate('/result');
    }
  }, [finalResult, navigate]);

  // Timer hook
  const { secondsRemaining, timerState } = useTimer(
    startTime,
    challenge.duration || 1200,
    handleTimeExpired,
    finalResult?.status === 'ACCEPTED'
  );

  const showToast = (msg, type = 'info') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Direct Reveal Next Block
  const handleRevealBlock = async () => {
    if (isTimeExpired) {
      showToast('Challenge time expired! Actions locked.', 'error');
      return;
    }
    const block = await revealNextBlock();
    if (block) {
      showToast(`✓ Block #${block.blockId} revealed into your available fragments pool! (-5 pts penalty)`, 'success');
    } else {
      showToast('All available fragments for this challenge have already been revealed.', 'warning');
    }
  };

  // Task-Based Reveal
  const handleRevealTask = async (task) => {
    if (isTimeExpired) {
      showToast('Challenge time expired! Actions locked.', 'error');
      return;
    }
    const block = await revealNextBlock({ taskId: task.taskId });
    if (block) {
      showToast(`✓ Fragment #${block.blockId} unlocked for ${task.title}! (-${task.penalty || 5} pts penalty)`, 'success');
    } else {
      showToast(`All fragments for ${task.title} are already unlocked.`, 'info');
    }
  };

  // Add block to board
  const handleAddToAssembly = (block) => {
    if (isTimeExpired) return;
    const added = addBlockToAssembly(block);
    if (added) {
      showToast(`Block #${block.blockId} placed on Assembly Canvas.`, 'info');
    } else {
      showToast(`Block #${block.blockId} is already on the board.`, 'warning');
    }
  };

  // Run Code
  const handleRunCode = async () => {
    if (isTimeExpired) {
      showToast('Time expired. Execution locked.', 'error');
      return;
    }
    if (assemblyBlocks.length === 0) {
      showToast('No blocks placed on the assembly canvas to run.', 'warning');
      return;
    }
    const res = await executeCode();
    if (res.status === 'success') {
      showToast('Compilation successful! Program executed against sample input.', 'success');
    } else {
      showToast('Execution diagnostic returned. Check output console.', 'info');
    }
  };

  // Submit Solution
  const handleSubmit = async () => {
    if (isTimeExpired) {
      showToast('Time expired. Submissions closed.', 'error');
      return;
    }
    if (assemblyBlocks.length === 0) {
      showToast('Cannot submit empty assembly.', 'warning');
      return;
    }

    const res = await submitSolution(participant);
    setSubmissionResult(res);

    if (res.status === 'ACCEPTED') {
      showToast('🎉 ACCEPTED! All hidden test cases passed.', 'success');
    } else {
      showToast('❌ WRONG ANSWER. Some test cases failed. Check output panel.', 'error');
    }
  };

  const totalBlocksCount = langConfig?.blocks?.length || 8;
  const lockedBlocksCount = Math.max(0, totalBlocksCount - unlockedBlocks.length);

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-5 space-y-5 font-mono text-slate-200">
      {/* ARENA HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Blocks className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold uppercase tracking-wider">
                BLIND CODING ARENA
              </span>
              <h2 className="text-base font-bold text-white tracking-wide">{challenge.title}</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Category: <span className="text-cyan-400">{challenge.category}</span> // Reward: <span className="text-emerald-400">{challenge.points} PTS</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Contestant:</span>
            <span className="text-slate-100 font-bold">{participant?.name || 'Registered Participant'}</span>
          </div>

          <Timer secondsRemaining={secondsRemaining} timerState={timerState} />
        </div>
      </div>

      {/* 3-COLUMN LAYOUT:
          LEFT: Challenge Description & Task
          CENTER: Code Assembly Board & Live Preview
          RIGHT: Available Revealed Blocks & Unlock Pool
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* COLUMN 1: CHALLENGE DESCRIPTION (col-span-3) */}
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
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Problem Description
              </label>
              <p className="text-slate-300 whitespace-pre-line bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                {challenge.description}
              </p>
            </div>

            {challenge.instructions && (
              <div className="space-y-1 text-xs">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Instructions
                </label>
                <p className="text-slate-400 text-[11px] italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
                  {challenge.instructions}
                </p>
              </div>
            )}

            {/* Input & Output format */}
            <div className="space-y-2 text-xs">
              {challenge.inputFormat && (
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Input: </span>
                  <span className="text-slate-300 text-[11px]">{challenge.inputFormat}</span>
                </div>
              )}
              {challenge.outputFormat && (
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Output: </span>
                  <span className="text-slate-300 text-[11px]">{challenge.outputFormat}</span>
                </div>
              )}
            </div>

            {/* Sample Input & Output */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Sample Test Case
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500">Sample In:</span>
                  <pre className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-[11px]">
                    {challenge.sampleInput || 'N/A'}
                  </pre>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Sample Out:</span>
                  <pre className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 text-[11px]">
                    {challenge.sampleOutput || 'N/A'}
                  </pre>
                </div>
              </div>
            </div>

            {/* QR Scanner trigger if QR mode is preferred */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsScannerOpen(true)}
                className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-xs flex items-center justify-center gap-2 text-slate-300 transition"
              >
                <QrCode className="w-4 h-4 text-cyan-400" />
                <span>Open Digital QR Scanner</span>
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 2: CODE ASSEMBLY AREA (col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <AssemblyBoard
            blocks={assemblyBlocks}
            onReorder={reorderAssemblyBlocks}
            onRemove={removeAssemblyBlock}
            onClear={() => {
              if (window.confirm('Clear all blocks from the canvas?')) {
                // Clear assembly canvas
                reorderAssemblyBlocks(0, 0);
              }
            }}
          />

          <AssemblyPreview combinedCode={assembledCode} />
        </div>

        {/* COLUMN 3: REVEALED BLOCKS & CODE POOL (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* TASK-BASED REVEAL SECTION */}
          {challenge.tasks && challenge.tasks.length > 0 && (
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-cyan-400" /> REVEAL TASKS
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/40">
                  {challenge.tasks.length} TASKS
                </span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {challenge.tasks.map((task, idx) => {
                  const unlockedIds = new Set(unlockedBlocks.map((b) => b.blockId));
                  const isTaskComplete =
                    task.requiredBlockIds &&
                    task.requiredBlockIds.length > 0 &&
                    task.requiredBlockIds.every((id) => unlockedIds.has(id));

                  return (
                    <div
                      key={task.taskId || idx}
                      className={`p-3 rounded-xl border text-xs space-y-2 transition ${
                        isTaskComplete
                          ? 'bg-slate-950/40 border-emerald-900/40 opacity-80'
                          : 'bg-slate-950 border-slate-800 hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-[11px]">
                          {task.title || `TASK ${idx + 1}`}
                        </span>
                        <span className="text-[10px] font-bold text-rose-400">
                          Penalty: -{task.penalty || 5} pts
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {task.description}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <span>Blocks:</span>
                          {(task.requiredBlockIds || []).map((id) => (
                            <span
                              key={id}
                              className={`px-1.5 py-0.5 rounded font-mono ${
                                unlockedIds.has(id)
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                                  : 'bg-slate-900 text-slate-500 border border-slate-800'
                              }`}
                            >
                              {id}
                            </span>
                          ))}
                        </div>

                        {isTaskComplete ? (
                          <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                            ✓ Unlocked
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRevealTask(task)}
                            disabled={isTimeExpired}
                            className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-sm transition disabled:opacity-40"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Reveal Code</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* REVEAL ACTION PANEL */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" /> CODE POOL & REVEAL
              </h3>
              <span className="text-[11px] text-slate-400">
                Unlocked: <strong className="text-cyan-400">{unlockedBlocks.length}</strong>/{totalBlocksCount}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Revealing a block adds it to your available code pool. Drag or click + to place it into the assembly canvas.
            </p>

            <button
              onClick={handleRevealBlock}
              disabled={isTimeExpired || lockedBlocksCount === 0}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {lockedBlocksCount === 0 ? 'All Fragments Revealed' : `REVEAL NEXT BLOCK (${lockedBlocksCount} Remaining)`}
              </span>
            </button>
          </div>

          {/* AVAILABLE UNLOCKED BLOCKS */}
          <CollectedBlocks
            blocks={unlockedBlocks}
            placedBlockIds={assemblyBlocks.map((b) => b.blockId)}
            onAddToBoard={handleAddToAssembly}
          />

          {/* LOCKED BLOCKS PREVIEW (Hidden Fragments) */}
          {lockedBlocksCount > 0 && (
            <div className="p-4 bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl space-y-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Locked Code Fragments ({lockedBlocksCount})
              </span>
              <div className="space-y-1.5">
                {Array.from({ length: Math.min(3, lockedBlocksCount) }).map((_, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-slate-900/40 border border-slate-800/80 rounded-xl text-center text-[11px] text-slate-500 font-mono"
                  >
                    [ ??? CODE FRAGMENT LOCKED — CLICK REVEAL ??? ]
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM UNIFIED ACTION & CONSOLE BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
        {/* ACTION CONTROLS (col-span-4) */}
        <div className="lg:col-span-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" /> EXECUTION CONTROLS
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Verify your assembled sequence by executing against standard input, then submit for official judging.
            </p>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <div className="grid grid-cols-2 gap-3">
              <RunButton
                onClick={handleRunCode}
                isLoading={isCompiling}
                disabled={isTimeExpired || assemblyBlocks.length === 0}
              />
              <SubmitButton
                onClick={handleSubmit}
                isLoading={isValidating}
                disabled={isTimeExpired || assemblyBlocks.length === 0}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                onClick={handleRevealBlock}
                disabled={isTimeExpired || lockedBlocksCount === 0}
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 text-[11px]"
              >
                <Sparkles className="w-3.5 h-3.5" /> Reveal Fragment
              </button>

              <button
                onClick={resetAll}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px]"
              >
                <RotateCcw className="w-3 h-3" /> Reset Session
              </button>
            </div>
          </div>
        </div>

        {/* OUTPUT CONSOLE PANEL (col-span-8) */}
        <div className="lg:col-span-8">
          <OutputPanel
            compileOutput={compileOutput}
            submissionResult={submissionResult}
            sampleInput={challenge.sampleInput}
            sampleOutput={challenge.sampleOutput}
          />
        </div>
      </div>

      {/* QR SCANNER MODAL (Preserving QR functionality!) */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        qrItem={activeQR || { qrId: 'QR-MANUAL', token: 'MANUAL-ENTRY' }}
        onUnlockSuccess={(item) => {
          const block = unlockQR(item) || revealNextBlock();
          if (block) {
            showToast(`✓ QR token verified! Block #${block.blockId} unlocked.`, 'success');
          }
        }}
        onAddToAssembly={handleAddToAssembly}
      />

      {/* TIME EXPIRED MODAL */}
      <TimeExpiredModal
        isOpen={isTimeExpired && (!finalResult || finalResult.status !== 'ACCEPTED')}
        onAcknowledge={() => navigate('/result')}
      />

      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
    </div>
  );
}
