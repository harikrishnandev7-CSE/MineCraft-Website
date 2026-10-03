import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import QRDecodeAnimation from './QRDecodeAnimation';
import { getBlockTask } from '../../utils/tasks';
import { QrCode, CheckCircle, Plus, Cpu, HelpCircle, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function QRScannerModal({
  isOpen,
  onClose,
  qrItem,
  onUnlockSuccess,
  onAddToAssembly,
  challenge,
  langConfig,
}) {
  const [step, setStep] = useState('scanning'); // 'scanning' | 'task' | 'unlocked'
  const [selectedOption, setSelectedOption] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [unlockedBlock, setUnlockedBlock] = useState(null);
  const [taskData, setTaskData] = useState(null);

  // Find target block and task
  useEffect(() => {
    if (!isOpen || !qrItem) {
      setStep('scanning');
      setSelectedOption(null);
      setErrorMessage(null);
      setUnlockedBlock(null);
      setTaskData(null);
      return;
    }

    const targetBlock = langConfig?.blocks?.find((b) => b.blockId === qrItem.blockId);
    const task = getBlockTask(targetBlock, challenge, langConfig?.name);
    setTaskData(task);
    setSelectedOption(null);
    setErrorMessage(null);

    // Initial QR detection animation
    setStep('scanning');
    const timer = setTimeout(() => {
      setStep('task');
    }, 1200);

    return () => clearTimeout(timer);
  }, [isOpen, qrItem, langConfig, challenge]);

  if (!qrItem) return null;

  const targetBlock = langConfig?.blocks?.find((b) => b.blockId === qrItem.blockId);

  const handleVerifyTask = () => {
    if (!selectedOption) {
      setErrorMessage('Please select an answer to complete this task.');
      return;
    }

    if (!taskData) {
      // Fallback unlock if no task data
      const block = onUnlockSuccess(qrItem);
      setUnlockedBlock(block || targetBlock);
      setStep('unlocked');
      return;
    }

    // Verify answer
    const isCorrect =
      selectedOption.trim().toLowerCase() === taskData.correctAnswer?.trim().toLowerCase();

    if (isCorrect) {
      setErrorMessage(null);
      const block = onUnlockSuccess(qrItem);
      setUnlockedBlock(block || targetBlock);
      setStep('unlocked');
    } else {
      setErrorMessage('❌ Incorrect answer! Review the logic requirements and try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === 'unlocked'
          ? `BLOCK #${targetBlock?.blockId || qrItem.blockId} // UNLOCKED`
          : step === 'task'
          ? `ASSIGNED TASK // BLOCK #${targetBlock?.blockId || qrItem.blockId}`
          : `DIGITAL SCANNER // ${qrItem.qrId}`
      }
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* STEP 1: SCANNING */}
        {step === 'scanning' && (
          <div className="space-y-4 text-center py-4">
            <QRDecodeAnimation active={true} />
            <div className="font-mono text-xs space-y-1.5 text-slate-700">
              <p className="text-orange-400 font-bold animate-pulse">Scanning QR token matrix...</p>
              <p className="text-slate-600 text-[11px] truncate">Token ID: {qrItem.token}</p>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-300">
                <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-emerald-400 h-full w-full animate-[progress_1.2s_ease-in-out]" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: COMPLETE ASSIGNED TASK */}
        {step === 'task' && taskData && (
          <div className="space-y-4 py-1 font-mono">
            {/* TASK HEADER BANNER */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-orange-400 font-bold flex items-center gap-1.5 uppercase">
                  <ShieldCheck className="w-4 h-4 text-orange-400" /> {taskData.title}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  TASK REQUIRED
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {taskData.description}
              </p>
            </div>

            {/* TASK QUESTION */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <h4 className="text-xs font-bold text-slate-900 leading-relaxed">
                  {taskData.question}
                </h4>
              </div>

              {/* OPTIONS */}
              <div className="space-y-2 pt-1">
                {taskData.options?.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedOption(option);
                        setErrorMessage(null);
                      }}
                      className={`w-full p-2.5 rounded-lg border text-left text-xs transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-950/60 border-orange-500 text-cyan-200 shadow-sm shadow-orange-500/20'
                          : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-slate-100/60 hover:border-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isSelected
                              ? 'bg-orange-500 text-slate-950'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </span>
                      {isSelected && <span className="text-orange-400 text-xs">●</span>}
                    </button>
                  );
                })}
              </div>

              {/* ERROR ALERT */}
              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={ArrowRight}
                onClick={handleVerifyTask}
              >
                Complete Task & Unlock Block
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: UNLOCKED CODE BLOCK */}
        {step === 'unlocked' && (
          <div className="space-y-4 py-1 font-mono">
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-1 text-center">
              <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                <CheckCircle className="w-4 h-4" /> TASK COMPLETED & BLOCK UNLOCKED!
              </div>
              <p className="text-[11px] text-slate-700">
                You can now place this fragment onto the Assembly Canvas.
              </p>
            </div>

            {unlockedBlock && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs border-b border-slate-200/80 pb-2">
                  <span className="font-bold text-orange-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" /> BLOCK #{unlockedBlock.blockId}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                    {unlockedBlock.type || 'LOGIC'}
                  </span>
                </div>
                <pre className="text-xs text-emerald-300 whitespace-pre-wrap p-3 bg-white/60 rounded border border-slate-200/60 max-h-40 overflow-y-auto">
                  {unlockedBlock.code || unlockedBlock.codeSnippet}
                </pre>
                {unlockedBlock.hint && (
                  <p className="text-[11px] text-slate-600 italic">Hint: {unlockedBlock.hint}</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Done
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => {
                  if (unlockedBlock) onAddToAssembly(unlockedBlock);
                  onClose();
                }}
              >
                Add to Assembly Board
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
