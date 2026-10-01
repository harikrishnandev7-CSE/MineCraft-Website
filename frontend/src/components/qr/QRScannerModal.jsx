import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import QRDecodeAnimation from './QRDecodeAnimation';
import { QrCode, CheckCircle, Plus, Cpu } from 'lucide-react';

export default function QRScannerModal({ isOpen, onClose, qrItem, onUnlockSuccess, onAddToAssembly }) {
  const [step, setStep] = useState('scanning'); // 'scanning' | 'unlocked'
  const [unlockedBlock, setUnlockedBlock] = useState(null);

  useEffect(() => {
    if (!isOpen || !qrItem) {
      setStep('scanning');
      setUnlockedBlock(null);
      return;
    }

    setStep('scanning');

    // Simulate multi-stage digital scan progression
    const timer = setTimeout(() => {
      const block = onUnlockSuccess(qrItem);
      setUnlockedBlock(block);
      setStep('unlocked');
    }, 1800);

    return () => clearTimeout(timer);
  }, [isOpen, qrItem]);

  if (!qrItem) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`DIGITAL SCANNER // ${qrItem.qrId}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {step === 'scanning' ? (
          <div className="space-y-4 text-center py-2">
            <QRDecodeAnimation active={true} />
            <div className="font-mono text-xs space-y-1.5 text-slate-300">
              <p className="text-cyan-400 font-bold animate-pulse">Detecting QR payload...</p>
              <p className="text-slate-400 text-[11px] truncate">Token: {qrItem.token}</p>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 h-full w-full animate-[progress_1.8s_ease-in-out]" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-1">
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-1 text-center">
              <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-bold">
                <CheckCircle className="w-4 h-4" /> TOKEN VERIFIED & DECODED
              </div>
              <p className="text-[11px] text-slate-300">Code block unlocked into workbench.</p>
            </div>

            {unlockedBlock && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800/80 pb-2">
                  <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" /> BLOCK #{unlockedBlock.blockId}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                    {unlockedBlock.type || 'SNIPPET'}
                  </span>
                </div>
                <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap p-2.5 bg-slate-900/60 rounded border border-slate-800/60 max-h-36 overflow-y-auto">
                  {unlockedBlock.code}
                </pre>
                {unlockedBlock.hint && (
                  <p className="text-[11px] text-slate-400 italic">Hint: {unlockedBlock.hint}</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Close
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
                Add to Assembly
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
