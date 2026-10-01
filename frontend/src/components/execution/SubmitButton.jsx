import React from 'react';
import Button from '../common/Button';

export default function SubmitButton({ onClick, isLoading, disabled }) {
  return (
    <Button
      variant="primary"
      onClick={onClick}
      isLoading={isLoading}
      disabled={disabled}
      className="gap-2"
    >
      🚀 Submit Solution
    </Button>
  );
}
