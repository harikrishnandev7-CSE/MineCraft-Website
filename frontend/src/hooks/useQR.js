import { useSelector, useDispatch } from 'react-redux';
import { addScannedBlock, setIsScanning, setScanError } from '../store/slices/qrSlice';
import { qrApi } from '../services/qrApi';

export function useQR() {
  const dispatch = useDispatch();
  const qrState = useSelector((state) => state.qr);

  const scanCode = async (qrCode, challengeId) => {
    try {
      const block = await qrApi.scanBlock({ qrCode, challengeId });
      dispatch(addScannedBlock(block));
      return block;
    } catch (err) {
      dispatch(setScanError(err.response?.data?.message || err.message));
      throw err;
    }
  };

  return {
    ...qrState,
    scanCode,
    setScanning: (status) => dispatch(setIsScanning(status)),
  };
}
