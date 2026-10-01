import { useSelector, useDispatch } from 'react-redux';
import {
  setExecuting,
  setSubmitting,
  setExecutionResult,
  clearExecution,
} from '../store/slices/executionSlice';
import { submissionApi } from '../services/submissionApi';

export function useExecution() {
  const dispatch = useDispatch();
  const executionState = useSelector((state) => state.execution);

  const runCode = async ({ code, language, input, challengeId }) => {
    dispatch(setExecuting(true));
    try {
      const result = await submissionApi.runCode({ code, language, input, challengeId });
      dispatch(setExecutionResult(result));
      return result;
    } finally {
      dispatch(setExecuting(false));
    }
  };

  const submitSolution = async ({ code, language, challengeId, blocksUsed }) => {
    dispatch(setSubmitting(true));
    try {
      const result = await submissionApi.submitSolution({ code, language, challengeId, blocksUsed });
      dispatch(setExecutionResult(result));
      return result;
    } finally {
      dispatch(setSubmitting(false));
    }
  };

  return {
    ...executionState,
    runCode,
    submitSolution,
    reset: () => dispatch(clearExecution()),
  };
}
