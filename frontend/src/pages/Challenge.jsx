import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParticipant } from '../context/ParticipantContext';
import { useChallenge } from '../hooks/useChallenge';
import { useTimer } from '../hooks/useTimer';
import QRGrid from '../components/qr/QRGrid';
import QRScannerModal from '../components/qr/QRScannerModal';
import ScannedCounter from '../components/qr/ScannedCounter';
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
import { User, QrCode } from 'lucide-react';

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
  } = useChallenge();

  const [activeQR, setActiveQR] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');
  const [submissionResult, setSubmissionResult] = useState(null);

  // Redirect if no participant registered
  useEffect(() => {
    if (!participant) {
      navigate('/register');
    } else if (!startTime) {
      startChallenge();
    }
  }, [participant, startTime, navigate]);

  // Navigate to Result page once accepted
  useEffect(() => {
    if (finalResult && finalResult.status === 'ACCEPTED') {
      navigate('/result');
    }
  }, [finalResult, navigate]);

  // Timer hook
  const { secondsRemaining, timerState } = useTimer(
    startTime,
    challenge.duration,
    handleTimeExpired,
    finalResult?.status === 'ACCEPTED'
  );

  const showToast = (msg, type = 'info') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // QR Click
  const handleSelectQR = (item) => {
    if (isTimeExpired) {
      showToast('Challenge time expired! Actions locked.', 'error');
      return;
    }
    if (scannedQRIds.includes(item.qrId)) {
      showToast(`${item.qrId} has already been scanned and unlocked.`, 'warning');
      return;
    }
    setActiveQR(item);
    setIsScannerOpen(true);
  };

  // QR Unlock handler
  const handleUnlockSuccess = (item) => {
    const block = unlockQR(item);
    if (block) {
      showToast(`✓ QR ${item.qrId} verified! Block #${block.blockId} unlocked.`, 'success');
    }
    return block;
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
    if (res.status === 'success' || res.status === 'Accepted' || res.success) {
      showToast('Compilation successful! Program executed.', 'success');
    } else {
      showToast(res.message || 'Compilation error detected in assembly.', 'error');
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
      showToast('❌ WRONG ANSWER. Some test cases failed.', 'error');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6 space-y-5 font-mono">
      {/* ARENA HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold uppercase tracking-wider">
                ACTIVE ARENA
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
            <span className="text-slate-400">Participant:</span>
            <span className="text-slate-100 font-bold">{participant?.name || 'Anthony'}</span>
          </div>

          <Timer secondsRemaining={secondsRemaining} timerState={timerState} />
        </div>
      </div>

      {/* 3-COLUMN DESKTOP LAYOUT (Section 33) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* COLUMN 1: QR HUNT (col-span-3) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-cyan-400" /> QR HUNT MATRIX
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Click any digital QR card to initiate simulated token decryption and unlock logic blocks.
            </p>
            <ScannedCounter current={scannedQRIds.length} total={langConfig.qrTokens.length} />
          </div>

          <QRGrid
            qrTokens={langConfig.qrTokens}
            scannedQRIds={scannedQRIds}
            onSelectQR={handleSelectQR}
          />
        </div>

        {/* COLUMN 2: CODE ASSEMBLY (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <CollectedBlocks
            blocks={unlockedBlocks}
            placedBlockIds={assemblyBlocks.map((b) => b.blockId)}
            onAddToBoard={handleAddToAssembly}
          />

          <AssemblyBoard
            blocks={assemblyBlocks}
            onReorder={reorderAssemblyBlocks}
            onRemove={removeAssemblyBlock}
          />

          <AssemblyPreview combinedCode={assembledCode} />
        </div>

        {/* COLUMN 3: CODE EDITOR & EXECUTION (col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-0">
            <EditorToolbar language={language} onLanguageChange={selectLanguage} />
            <CodeEditor code={assembledCode} language={language} readOnly={true} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
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

          <OutputPanel
            compileOutput={compileOutput}
            submissionResult={submissionResult}
            sampleInput={challenge.sampleInput}
            sampleOutput={challenge.sampleOutput}
          />
        </div>
      </div>

      {/* FOOTER / STATUS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span>Scanned: <strong className="text-cyan-400">{scannedQRIds.length}</strong>/{langConfig.qrTokens.length}</span>
          <span>•</span>
          <span>Blocks Placed: <strong className="text-emerald-400">{assemblyBlocks.length}</strong></span>
          <span>•</span>
          <span>Submission Attempts: <strong className="text-amber-400">{attempts}</strong></span>
        </div>
        <div className="text-slate-500">
          Arena Engine: <span className="text-slate-400">Frontend Sandbox Simulated</span>
        </div>
      </div>

      {/* MODALS */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        qrItem={activeQR}
        onUnlockSuccess={handleUnlockSuccess}
        onAddToAssembly={handleAddToAssembly}
      />

      <TimeExpiredModal
        isOpen={isTimeExpired && (!finalResult || finalResult.status !== 'ACCEPTED')}
        onAcknowledge={() => navigate('/result')}
        onRestart={() => startChallenge()}
      />

      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
    </div>
  );
}
