import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CHALLENGES } from '../data/challenges';
import { localStorageService } from '../services/localStorageService';
import { STORAGE_KEYS } from '../utils/constants';
import { combineBlocks } from '../utils/assembly';
import { runCode, submitSolution as apiSubmitSolution } from '../services/api';

const ChallengeContext = createContext(null);

export function ChallengeProvider({ children }) {
  // Current challenge
  const [challengeId, setChallengeId] = useState(() => {
    const session = localStorageService.get(STORAGE_KEYS.CHALLENGE_SESSION, null);
    return session?.challengeId || CHALLENGES[0].id;
  });

  const [language, setLanguage] = useState(() => {
    const session = localStorageService.get(STORAGE_KEYS.CHALLENGE_SESSION, null);
    return session?.language || 'python';
  });

  const [startTime, setStartTime] = useState(() => {
    return localStorageService.get(STORAGE_KEYS.START_TIME, null);
  });

  const [scannedQRIds, setScannedQRIds] = useState(() => {
    return localStorageService.get(STORAGE_KEYS.QR_PROGRESS, []);
  });

  const [unlockedBlocks, setUnlockedBlocks] = useState(() => {
    return localStorageService.get(STORAGE_KEYS.UNLOCKED_BLOCKS, []);
  });

  const [assemblyBlocks, setAssemblyBlocks] = useState(() => {
    return localStorageService.get(STORAGE_KEYS.ASSEMBLY_ORDER, []);
  });

  const [attempts, setAttempts] = useState(() => {
    return localStorageService.get(STORAGE_KEYS.SUBMISSION_ATTEMPTS, 0);
  });

  const [finalResult, setFinalResult] = useState(() => {
    return localStorageService.get(STORAGE_KEYS.FINAL_RESULT, null);
  });

  const [isCompiling, setIsCompiling] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [compileOutput, setCompileOutput] = useState(null);
  const [isTimeExpired, setIsTimeExpired] = useState(false);

  // Active challenge definition
  const currentChallenge = useMemo(() => {
    return CHALLENGES.find((c) => c.id === challengeId) || CHALLENGES[0];
  }, [challengeId]);

  // Active language config
  const langConfig = useMemo(() => {
    return currentChallenge.languages[language] || currentChallenge.languages.python;
  }, [currentChallenge, language]);

  // Derived assembled source code
  const assembledCode = useMemo(() => {
    return combineBlocks(assemblyBlocks);
  }, [assemblyBlocks]);

  // Persist state changes
  useEffect(() => {
    localStorageService.set(STORAGE_KEYS.CHALLENGE_SESSION, { challengeId, language });
  }, [challengeId, language]);

  useEffect(() => {
    localStorageService.set(STORAGE_KEYS.QR_PROGRESS, scannedQRIds);
  }, [scannedQRIds]);

  useEffect(() => {
    localStorageService.set(STORAGE_KEYS.UNLOCKED_BLOCKS, unlockedBlocks);
  }, [unlockedBlocks]);

  useEffect(() => {
    localStorageService.set(STORAGE_KEYS.ASSEMBLY_ORDER, assemblyBlocks);
  }, [assemblyBlocks]);

  useEffect(() => {
    localStorageService.set(STORAGE_KEYS.SUBMISSION_ATTEMPTS, attempts);
  }, [attempts]);

  useEffect(() => {
    if (finalResult) {
      localStorageService.set(STORAGE_KEYS.FINAL_RESULT, finalResult);
    }
  }, [finalResult]);

  // START CHALLENGE
  const startChallenge = (selectedChalId) => {
    const targetId = selectedChalId || challengeId;
    const now = Date.now();
    setChallengeId(targetId);
    setStartTime(now);
    localStorageService.set(STORAGE_KEYS.START_TIME, now);
    setScannedQRIds([]);
    setUnlockedBlocks([]);
    setAssemblyBlocks([]);
    setAttempts(0);
    setFinalResult(null);
    setCompileOutput(null);
    setIsTimeExpired(false);
  };

  // CHANGE LANGUAGE
  const selectLanguage = (newLang) => {
    setLanguage(newLang);
    // When changing language, rebuild unlocked and assembled blocks in the new language corresponding to existing blockIds
    const newLangConfig = currentChallenge.languages[newLang];
    if (newLangConfig) {
      const blockMap = new Map(newLangConfig.blocks.map((b) => [b.blockId, b]));
      setUnlockedBlocks((prev) =>
        prev.map((b) => blockMap.get(b.blockId) || b).filter(Boolean)
      );
      setAssemblyBlocks((prev) =>
        prev.map((b) => blockMap.get(b.blockId) || b).filter(Boolean)
      );
    }
  };

  // SCAN QR
  const unlockQR = (qrItem) => {
    if (scannedQRIds.includes(qrItem.qrId)) return false;

    // Find corresponding block in active language
    const block = langConfig.blocks.find((b) => b.blockId === qrItem.blockId);
    if (!block) return false;

    setScannedQRIds((prev) => [...prev, qrItem.qrId]);

    // Check if block already unlocked
    if (!unlockedBlocks.some((b) => b.blockId === block.blockId)) {
      setUnlockedBlocks((prev) => [...prev, block]);
    }
    return block;
  };

  // ADD BLOCK TO ASSEMBLY
  const addBlockToAssembly = (block) => {
    const exists = assemblyBlocks.some((b) => b.blockId === block.blockId);
    if (!exists) {
      setAssemblyBlocks((prev) => [...prev, block]);
      return true;
    }
    return false;
  };

  // REORDER ASSEMBLY BLOCKS (Drag & Drop or Move)
  const reorderAssemblyBlocks = (sourceIndex, destinationIndex) => {
    if (
      sourceIndex < 0 ||
      sourceIndex >= assemblyBlocks.length ||
      destinationIndex < 0 ||
      destinationIndex >= assemblyBlocks.length
    ) {
      return;
    }
    const result = Array.from(assemblyBlocks);
    const [removed] = result.splice(sourceIndex, 1);
    result.splice(destinationIndex, 0, removed);
    setAssemblyBlocks(result);
  };

  // REMOVE BLOCK FROM ASSEMBLY
  const removeAssemblyBlock = (index) => {
    setAssemblyBlocks((prev) => prev.filter((_, idx) => idx !== index));
  };

  // RUN CODE (REAL BACKEND VIA JUDGE0)
  const executeCode = async (customInput = null) => {
    setIsCompiling(true);
    setCompileOutput(null);
    try {
      const inputToUse = customInput !== null ? customInput : (currentChallenge.sampleInput || '');
      const result = await runCode(language, assembledCode, inputToUse);
      setCompileOutput(result);
      return result;
    } catch (err) {
      const fallbackResult = {
        success: false,
        status: 'Error',
        stdout: '',
        stderr: 'Unable to execute code. Please try again.',
        compileOutput: '',
        message: 'Unable to execute code. Please try again.',
        executionTime: '0.00s',
        memory: '0.0 MB',
      };
      setCompileOutput(fallbackResult);
      return fallbackResult;
    } finally {
      setIsCompiling(false);
    }
  };

  // SUBMIT SOLUTION (OFFICIAL JUDGE VIA BACKEND HIDDEN TESTS)
  const submitSolution = async (participant) => {
    setIsValidating(true);
    setAttempts((prev) => prev + 1);

    try {
      const outcome = await apiSubmitSolution(language, assembledCode, currentChallenge.id);

      const submissionRecord = {
        ...outcome,
        participantName: participant?.name || 'Participant',
        participantId: participant?.participantId || 'MC-DEMO',
        challengeId: currentChallenge.id,
        challengeTitle: currentChallenge.title,
        language,
        timestamp: new Date().toISOString(),
        attempts: attempts + 1,
      };

      if (outcome.status === 'ACCEPTED') {
        setFinalResult(submissionRecord);
      }

      return submissionRecord;
    } catch (err) {
      const fallbackRecord = {
        success: false,
        status: 'WRONG_ANSWER',
        title: '⚠️ EVALUATION ERROR',
        message: 'Unable to evaluate submission. Please try again.',
        passedCount: 0,
        totalCount: 3,
        testResults: [],
        executionTime: '0.00s',
        memory: '0.0 MB',
        participantName: participant?.name || 'Participant',
        participantId: participant?.participantId || 'MC-DEMO',
        challengeId: currentChallenge.id,
        challengeTitle: currentChallenge.title,
        language,
        timestamp: new Date().toISOString(),
        attempts: attempts + 1,
      };
      return fallbackRecord;
    } finally {
      setIsValidating(false);
    }
  };

  const handleTimeExpired = () => {
    setIsTimeExpired(true);
  };

  const resetAll = () => {
    localStorageService.clearAllChallengeData();
    setStartTime(null);
    setScannedQRIds([]);
    setUnlockedBlocks([]);
    setAssemblyBlocks([]);
    setAttempts(0);
    setFinalResult(null);
    setCompileOutput(null);
    setIsTimeExpired(false);
  };

  return (
    <ChallengeContext.Provider
      value={{
        challenge: currentChallenge,
        challenges: CHALLENGES,
        setChallengeId,
        language,
        selectLanguage,
        langConfig,
        startTime,
        startChallenge,
        scannedQRIds,
        unlockedBlocks,
        assemblyBlocks,
        assembledCode,
        unlockQR,
        addBlockToAssembly,
        reorderAssemblyBlocks,
        removeAssemblyBlock,
        executeCode,
        submitSolution,
        isCompiling,
        isValidating,
        compileOutput,
        attempts,
        finalResult,
        isTimeExpired,
        handleTimeExpired,
        resetAll,
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
}

export function useChallengeContext() {
  const context = useContext(ChallengeContext);
  if (!context) {
    throw new Error('useChallengeContext must be used within a ChallengeProvider');
  }
  return context;
}
