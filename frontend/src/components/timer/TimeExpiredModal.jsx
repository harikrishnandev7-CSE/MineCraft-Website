import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function TimeExpiredModal({ isOpen, onAcknowledge }) {
  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="Time Expired!">
      <div className="text-center space-y-4">
        <div className="text-5xl">⌛</div>
        <p className="text-sm text-slate-300">
          The session time limit for this challenge has concluded. Your final submitted solution has been recorded for evaluation.
        </p>
        <Button variant="primary" onClick={onAcknowledge} className="w-full">
          View Results
        </Button>
      </div>
    </Modal>
  );
}
