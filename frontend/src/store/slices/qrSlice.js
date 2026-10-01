import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  scannedBlocks: [],
  isScanning: false,
  lastScannedBlock: null,
  scanError: null,
};

const qrSlice = createSlice({
  name: 'qr',
  initialState,
  reducers: {
    addScannedBlock: (state, action) => {
      const exists = state.scannedBlocks.some((b) => b.id === action.payload.id);
      if (!exists) {
        state.scannedBlocks.push(action.payload);
      }
      state.lastScannedBlock = action.payload;
      state.scanError = null;
    },
    setScannedBlocks: (state, action) => {
      state.scannedBlocks = action.payload;
    },
    setIsScanning: (state, action) => {
      state.isScanning = action.payload;
    },
    setScanError: (state, action) => {
      state.scanError = action.payload;
    },
    resetQRState: (state) => {
      state.scannedBlocks = [];
      state.lastScannedBlock = null;
      state.scanError = null;
    },
  },
});

export const {
  addScannedBlock,
  setScannedBlocks,
  setIsScanning,
  setScanError,
  resetQRState,
} = qrSlice.actions;

export default qrSlice.reducer;
