import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CHALLENGES } from '../data/challenges';
import { localStorageService } from '../services/localStorageService';
import { STORAGE_KEYS } from '../utils/constants';
import { combineBlocks } from '../utils/assembly';
import { runCode as mockRunCode } from '../services/mockCompiler';
import { judgeSubmission as mockJudgeSubmission } from '../services/mockJudge';
import { challengeApi } from '../services/challengeApi';
import { submissionApi } from '../services/submissionApi';
import { runCode as apiRunCode, submitSolution as apiSubmitSolution } from '../services/api';

const ChallengeContext = createContext(null);

export function ChallengeProvider({ children }) {
  // Check URL query parameters for dynamic challenge ID
  const searchParams = new URLSearchParams(window.location.search);
  const urlChallengeId = searchParams.get('id') || searchParams.get('challengeId');

  // Dynamic remote challenges loaded from backend
  const [remoteChallenges, setRemoteChallenges] = useState([]);
  const [activeRemoteChallenge, setActiveRemoteChallenge] = useState(null);
  const [remoteBlocks, setRemoteBlocks] = useState([]);

  // Current challenge ID
  const [challengeId, setChallengeId] = useState(() => {
    if (urlChallengeId) return urlChallengeId;
    const session = localStorageService.get(STORAGE_KEYS.CHALLENGE_SESSION, null);
    return session?.challengeId || CHALLENGES[0].id;
  });

  const [language, setLanguage] = useState(() => {
    const session = localStorageService.get(STORAGE_KEYS.CHALLENGE_SESSION, null);
    return session?.language || 'java';
  });

  const [startTime, setStartTime] = useState(() => {
    return localStorageService.get(STORAGE_KEYS.START_TIME, null);
  });

  const [scannedQRIds, setScannedQRIds] = useState(() => {
    return localStorageService.get(STORAGE_KEYS.QR_PROGRESS, []);
  });

  const [unlockedBlocks, setUnlockedBlocks] = useState(() => {
    const raw = localStorageService.get(STORAGE_KEYS.UNLOCKED_BLOCKS, []);
    const seen = new Set();
    return (Array.isArray(raw) ? raw : []).filter((b) => {
      if (!b?.blockId || seen.has(b.blockId)) return false;
      seen.add(b.blockId);
      return true;
    });
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

  // Sync challengeId if URL param changes
  useEffect(() => {
    if (urlChallengeId && urlChallengeId !== challengeId) {
      setChallengeId(urlChallengeId);
    }
  }, [urlChallengeId]);

  // Load challenges from backend API on mount
  useEffect(() => {
    async function loadApiChallenges() {
      try {
        const res = await challengeApi.getAll();
        if (res.success && Array.isArray(res.challenges) && res.challenges.length > 0) {
          setRemoteChallenges(res.challenges);
        }
      } catch (err) {
        // Backend offline or fallback to static
      }
    }
    loadApiChallenges();
  }, []);

  // Fetch active challenge details and blocks if it's a backend challenge
  useEffect(() => {
    async function fetchChallengeDetails() {
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(challengeId);
      const isRemote = isMongoId || remoteChallenges.some((c) => c._id === challengeId || c.slug === challengeId);

      if (isRemote || isMongoId) {
        try {
          const [chalRes, blocksRes] = await Promise.all([
            challengeApi.getById(challengeId),
            challengeApi.getBlocks(challengeId),
          ]);

          if (chalRes.success && chalRes.challenge) {
            setActiveRemoteChallenge(chalRes.challenge);
            if (chalRes.challenge.sourceLanguage) {
              setLanguage(chalRes.challenge.sourceLanguage);
            }
          }

          if (blocksRes.success && Array.isArray(blocksRes.blocks)) {
            setRemoteBlocks(blocksRes.blocks);
            // Automatically initialize initially unlocked blocks
            const unlocked = blocksRes.blocks.filter((b) => b.isUnlocked);
            setUnlockedBlocks(unlocked);
          }
        } catch (err) {
          console.error('Failed to load challenge from API:', err);
        }
      } else {
        setActiveRemoteChallenge(null);
        setRemoteBlocks([]);
      }
    }

    if (challengeId) {
      fetchChallengeDetails();
    }
  }, [challengeId, remoteChallenges]);

  // Active challenge definition (Merged: Backend Challenge OR Static Challenge)
  const currentChallenge = useMemo(() => {
    if (activeRemoteChallenge) {
      return {
        id: activeRemoteChallenge._id,
        _id: activeRemoteChallenge._id,
        title: activeRemoteChallenge.title,
        subtitle: activeRemoteChallenge.category || 'Blind Coding Task',
        difficulty: activeRemoteChallenge.difficulty || 'Medium',
        points: activeRemoteChallenge.points || 100,
        category: activeRemoteChallenge.category || 'Algorithms',
        description: activeRemoteChallenge.description,
        instructions: activeRemoteChallenge.instructions,
        duration: activeRemoteChallenge.timeLimitSeconds || 1200,
        sampleInput: activeRemoteChallenge.sampleInput || '',
        sampleOutput: activeRemoteChallenge.sampleOutput || '',
        inputFormat: activeRemoteChallenge.inputFormat || '',
        outputFormat: activeRemoteChallenge.outputFormat || '',
        constraints: activeRemoteChallenge.constraints || '',
        tasks: activeRemoteChallenge.tasks || [],
        isRemote: true,
      };
    }

    const foundRemote = remoteChallenges.find((c) => c._id === challengeId || c.slug === challengeId);
    if (foundRemote) {
      return {
        id: foundRemote._id,
        _id: foundRemote._id,
        title: foundRemote.title,
        subtitle: foundRemote.category,
        difficulty: foundRemote.difficulty,
        points: foundRemote.points,
        category: foundRemote.category,
        description: foundRemote.description,
        instructions: foundRemote.instructions,
        duration: foundRemote.timeLimitSeconds || 1200,
        sampleInput: foundRemote.sampleInput || '',
        sampleOutput: foundRemote.sampleOutput || '',
        inputFormat: foundRemote.inputFormat || '',
        outputFormat: foundRemote.outputFormat || '',
        constraints: foundRemote.constraints || '',
        tasks: foundRemote.tasks || [],
        isRemote: true,
      };
    }

    const staticChal = CHALLENGES.find((c) => c.id === challengeId) || CHALLENGES[0];
    return {
      ...staticChal,
      tasks: staticChal.tasks || [],
    };
  }, [challengeId, activeRemoteChallenge, remoteChallenges]);

  // Active language config
  const langConfig = useMemo(() => {
    if (currentChallenge.isRemote && remoteBlocks.length > 0) {
      return {
        name: language.toUpperCase(),
        blocks: remoteBlocks.map((b) => ({
          blockId: b.blockId,
          code: b.code || b.codeSnippet,
          codeSnippet: b.code || b.codeSnippet,
          type: b.blockType || 'LOGIC',
          hint: b.hint || '',
          taskId: b.taskId,
          isDecoy: !!b.isDecoy,
          isUnlocked: b.isUnlocked,
          qrTokens: [{ qrId: `QR-${b.blockId}`, blockId: b.blockId, token: b.qrHash }],
        })),
      };
    }

    const staticChal = CHALLENGES.find((c) => c.id === challengeId) || CHALLENGES[0];
    return staticChal.languages[language] || staticChal.languages.python || staticChal.languages.java;
  }, [currentChallenge, remoteBlocks, language, challengeId]);

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
    const seen = new Set();
    const unique = unlockedBlocks.filter((b) => {
      if (!b?.blockId || seen.has(b.blockId)) return false;
      seen.add(b.blockId);
      return true;
    });
    localStorageService.set(STORAGE_KEYS.UNLOCKED_BLOCKS, unique);
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
    if (!currentChallenge.isRemote) {
      const staticChal = CHALLENGES.find((c) => c.id === challengeId) || CHALLENGES[0];
      const newLangConfig = staticChal.languages[newLang];
      if (newLangConfig) {
        const blockMap = new Map(newLangConfig.blocks.map((b) => [b.blockId, b]));
        setUnlockedBlocks((prev) =>
          prev.map((b) => blockMap.get(b.blockId) || b).filter(Boolean)
        );
        setAssemblyBlocks((prev) =>
          prev.map((b) => blockMap.get(b.blockId) || b).filter(Boolean)
        );
      }
    }
  };

  // SCAN QR
  const unlockQR = (qrItem) => {
    if (scannedQRIds.includes(qrItem.qrId)) return false;

    const block = langConfig.blocks.find((b) => b.blockId === qrItem.blockId);
    if (!block) return false;

    setScannedQRIds((prev) => (prev.includes(qrItem.qrId) ? prev : [...prev, qrItem.qrId]));

    setUnlockedBlocks((prev) => {
      if (prev.some((b) => b.blockId === block.blockId)) return prev;
      return [...prev, { ...block, isUnlocked: true }];
    });
    return block;
  };

  // DIRECT REVEAL NEXT BLOCK (Blind Coding Reveal Mechanic, supports task-based reveal)
  const revealNextBlock = async (options = {}) => {
    const payload = typeof options === 'string' ? { taskId: options } : (options || {});
    // If connected to a backend challenge, call backend API
    if (currentChallenge.isRemote) {
      try {
        const res = await challengeApi.revealBlock(currentChallenge.id, payload);
        if (res.success && res.revealedBlock) {
          const revealed = {
            blockId: res.revealedBlock.blockId,
            code: res.revealedBlock.code,
            codeSnippet: res.revealedBlock.code,
            type: res.revealedBlock.blockType || 'LOGIC',
            hint: res.revealedBlock.hint || '',
            taskId: res.revealedBlock.taskId,
            isUnlocked: true,
          };
          setUnlockedBlocks((prev) => {
            if (prev.some((b) => b.blockId === revealed.blockId)) return prev;
            return [...prev, revealed];
          });
          return revealed;
        }
      } catch (err) {
        console.warn('API reveal failed, checking local remote blocks pool:', err);
      }
    }

    // Local / static fallback reveal (uses functional state to avoid batching race conditions)
    const allBlocks = langConfig.blocks || [];
    let unlockedItem = null;
    setUnlockedBlocks((prev) => {
      const currentIds = new Set(prev.map((b) => b.blockId));
      let nextLocked = null;
      if (payload.taskId) {
        nextLocked = allBlocks.find((b) => b.taskId === payload.taskId && !currentIds.has(b.blockId));
      }
      if (!nextLocked) {
        nextLocked = allBlocks.find((b) => !currentIds.has(b.blockId));
      }
      if (nextLocked && !currentIds.has(nextLocked.blockId)) {
        unlockedItem = { ...nextLocked, isUnlocked: true };
        return [...prev, unlockedItem];
      }
      return prev;
    });
    return unlockedItem;
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

  // RUN CODE (Backend API with local mock fallback)
  const executeCode = async (customInput = null) => {
    setIsCompiling(true);
    setCompileOutput(null);
    try {
      const inputToUse = customInput !== null ? customInput : (currentChallenge.sampleInput || '');

      // Try real backend API first
      try {
        const apiRes = await apiRunCode(language, assembledCode, inputToUse);
        if (apiRes && (apiRes.success || apiRes.status)) {
          setCompileOutput(apiRes);
          return apiRes;
        }
      } catch (backendErr) {
        console.warn('Backend run failed, trying local compiler fallback:', backendErr);
      }

      // Fallback to local compiler
      const result = await mockRunCode({
        language,
        sourceCode: assembledCode,
        input: inputToUse,
        challenge: currentChallenge,
        placedBlocks: assemblyBlocks,
        targetBlocks: langConfig.blocks,
      });
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

  // SUBMIT SOLUTION (Official Backend Judge with local fallback)
  const submitSolution = async (participant) => {
    setIsValidating(true);
    setAttempts((prev) => prev + 1);

    try {
      let outcome = null;

      // Try official backend judging first
      try {
        const apiRes = await apiSubmitSolution(language, assembledCode, currentChallenge.id);
        if (apiRes && apiRes.status) {
          outcome = apiRes;
        }
      } catch (backendErr) {
        console.warn('Backend submission failed, falling back to local judge:', backendErr);
      }

      // Fallback to local judge if backend was unreachable
      if (!outcome) {
        outcome = await mockJudgeSubmission({
          language,
          sourceCode: assembledCode,
          challenge: currentChallenge,
          placedBlocks: assemblyBlocks,
          targetBlocks: langConfig.blocks,
        });
      }

      const submissionRecord = {
        ...outcome,
        passed: outcome.status === 'ACCEPTED' || outcome.success,
        finalScore: outcome.score || (outcome.status === 'ACCEPTED' ? (currentChallenge.points || 100) : 0),
        score: outcome.score || (outcome.status === 'ACCEPTED' ? (currentChallenge.points || 100) : 0),
        participantName: participant?.name || 'Participant',
        participantId: participant?.participantId || 'MC-CONTESTANT',
        challengeId: currentChallenge.id,
        challengeTitle: currentChallenge.title,
        language,
        timestamp: new Date().toISOString(),
        attempts: attempts + 1,
      };

      if (submissionRecord.passed) {
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
        challenges: remoteChallenges.length > 0 ? remoteChallenges : CHALLENGES,
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
        revealNextBlock,
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
