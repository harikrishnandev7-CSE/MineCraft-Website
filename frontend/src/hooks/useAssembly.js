import { useSelector, useDispatch } from 'react-redux';
import {
  setOrderedBlocks,
  reorderBlocks,
  updateCombinedCode,
  clearAssembly,
} from '../store/slices/assemblySlice';

export function useAssembly() {
  const dispatch = useDispatch();
  const assemblyState = useSelector((state) => state.assembly);

  return {
    ...assemblyState,
    setBlocks: (blocks) => dispatch(setOrderedBlocks(blocks)),
    moveBlock: (sourceIndex, destinationIndex) =>
      dispatch(reorderBlocks({ sourceIndex, destinationIndex })),
    updateCode: (code) => dispatch(updateCombinedCode(code)),
    reset: () => dispatch(clearAssembly()),
  };
}
