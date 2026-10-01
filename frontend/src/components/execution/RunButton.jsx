import React from 'react';
import Button from '../common/Button';
import { Play } from 'lucide-react';

export default function RunButton({ onClick, isLoading, disabled }) {
  return (
    <Button
      variant="cyber"
      size="md"
      icon={Play}
      onClick={onClick}
      isLoading={isLoading}
      disabled={disabled}
      className="gap-2"
    >
      ▶ RUN CODE
    </Button>
  );
}
