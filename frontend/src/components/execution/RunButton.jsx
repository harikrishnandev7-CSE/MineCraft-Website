import React from 'react';
import Button from '../common/Button';

export default function RunButton({ onClick, isLoading }) {
  return (
    <Button
      variant="secondary"
      onClick={onClick}
      isLoading={isLoading}
      className="gap-2 border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/30"
    >
      ▶ Run Code
    </Button>
  );
}
