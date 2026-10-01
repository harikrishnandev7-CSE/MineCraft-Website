import React from 'react';
import Button from '../common/Button';
import { Send } from 'lucide-react';

export default function SubmitButton({ onClick, isLoading, disabled }) {
  return (
    <Button
      variant="primary"
      size="md"
      icon={Send}
      onClick={onClick}
      isLoading={isLoading}
      disabled={disabled}
      className="gap-2"
    >
      🚀 SUBMIT SOLUTION
    </Button>
  );
}
