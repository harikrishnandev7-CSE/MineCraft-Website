import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orderedBlocks: [],
  combinedCode: '',
  isDirty: false,
};

const assemblySlice = createSlice({
  name: 'assembly',
  initialState,
  reducers: {
    setOrderedBlocks: (state, action) => {
      state.orderedBlocks = action.payload;
      state.combinedCode = action.payload.map((b) => b.code).join('\n');
      state.isDirty = true;
    },
    reorderBlocks: (state, action) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const result = Array.from(state.orderedBlocks);
      const [removed] = result.splice(sourceIndex, 1);
      result.splice(destinationIndex, 0, removed);
      state.orderedBlocks = result;
      state.combinedCode = result.map((b) => b.code).join('\n');
      state.isDirty = true;
    },
    updateCombinedCode: (state, action) => {
      state.combinedCode = action.payload;
      state.isDirty = true;
    },
    clearAssembly: (state) => {
      state.orderedBlocks = [];
      state.combinedCode = '';
      state.isDirty = false;
    },
  },
});

export const {
  setOrderedBlocks,
  reorderBlocks,
  updateCombinedCode,
  clearAssembly,
} = assemblySlice.actions;

export default assemblySlice.reducer;
