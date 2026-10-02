import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Hourglass } from 'lucide-react';

export default function TimeExpiredModal({ isOpen, onAcknowledge, onRestart }) {
  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="TIME EXPIRED // ARENA LOCKED">
      <div className="text-center space-y-4 py-2">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-950/60 border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-950/40">
          <Hourglass className="w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h4 className="text-lg font-bold font-mono text-white">Challenge Locked</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            The 20-minute countdown has elapsed. QR scanning, code assembly, and submission endpoints are now closed.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {onRestart && (
            <Button variant="primary" onClick={onRestart} className="flex-1">
              Restart Challenge
            </Button>
          )}
          <Button variant="danger" onClick={onAcknowledge} className={onRestart ? "flex-1" : "w-full"}>
            View Standings
          </Button>
        </div>
      </div>
    </Modal>
  );
}
