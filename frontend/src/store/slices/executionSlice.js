import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isRunning: false,
  isSubmitting: false,
  output: '',
  testResults: [],
  compileError: null,
  runtimeError: null,
  status: null,
};

const executionSlice = createSlice({
  name: 'execution',
  initialState,
  reducers: {
    setExecuting: (state, action) => {
      state.isRunning = action.payload;
      if (action.payload) {
        state.compileError = null;
        state.runtimeError = null;
      }
    },
    setSubmitting: (state, action) => {
      state.isSubmitting = action.payload;
    },
    setExecutionResult: (state, action) => {
      state.output = action.payload.output || '';
      state.compileError = action.payload.compileError || null;
      state.runtimeError = action.payload.runtimeError || null;
      state.testResults = action.payload.testResults || [];
      state.status = action.payload.status || 'FINISHED';
    },
    clearExecution: (state) => {
      state.output = '';
      state.testResults = [];
      state.compileError = null;
      state.runtimeError = null;
      state.status = null;
    },
  },
});

export const {
  setExecuting,
  setSubmitting,
  setExecutionResult,
  clearExecution,
} = executionSlice.actions;

export default executionSlice.reducer;
