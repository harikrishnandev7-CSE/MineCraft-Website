import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CHALLENGES } from '../data/challenges';
import { localStorageService } from '../services/localStorageService';
import {
  STORAGE_KEYS,
  USE_MOCK_JUDGE,
} from '../utils/constants';
import { combineFragments, seededShuffle } from '../utils/assembly';
import { runCode as mockRunCode } from '../services/mockCompiler';
import { judgeSubmission as mockJudgeSubmission } from '../services/mockJudge';
import { challengeApi } from '../services/challengeApi';
import { runCode as apiRunCode, submitSolution as apiSubmitSolution } from '../services/api';

const ChallengeContext = createContext(null);

// ─── helpers ───────────────────────────────────────────────────────────────

function getStaticChallenge(id) {
  return CHALLENGES.find((c) => c.id === id || c.slug === id) || CHALLENGES[0];
}

// ─── Provider ──────────────────────────────────────────────────────────────

export function ChallengeProvider({ children }) {
  const searchParams = new URLSearchParams(window.location.search);
  const urlChallengeId = searchParams.get('id') || searchParams.get('challengeId');

  // ── challenge selection ──
  const [challengeId, setChallengeId] = useState(() => {
    if (urlChallengeId) return urlChallengeId;
    const session = localStorageService.get(STORAGE_KEYS.CHALLENGE_SESSION, null);
    return session?.challengeId || CHALLENGES[0].id;
  });

  const [activeChallengeInfo, setActiveChallengeInfo] = useState(null);

  // Sync challenge info if not found or custom
  useEffect(() => {
    let cancelled = false;
    const fetchChallengeInfo = async () => {
      try {
        const res = await challengeApi.getById(challengeId);
        if (cancelled) return;
        if (res.success && res.challenge) {
          setActiveChallengeInfo(res.challenge);
        }
      } catch (e) {
        // Fallback to static
      }
    };
    if (challengeId) {
      fetchChallengeInfo();
    }
    return () => {
      cancelled = true;
    };
  }, [challengeId]);

  // ── phase machine ──
  // "SETUP" | "HUNT" | "ASSEMBLE" | "DONE"
  const [phase, setPhase] = useState(() =>
    localStorageService.get(STORAGE_KEYS.PHASE, 'SETUP')
  );

  // ── language ──
  const [language, setLanguage] = useState(() => {
    const session = localStorageService.get(STORAGE_KEYS.CHALLENGE_SESSION, null);
    return session?.language || 'python';
  });
  const [languageLocked, setLanguageLocked] = useState(() =>
    localStorageService.get(STORAGE_KEYS.LANGUAGE_LOCKED, false)
  );

  // ── timer ──
  const [startTime, setStartTime] = useState(() =>
    localStorageService.get(STORAGE_KEYS.START_TIME, null)
  );

  // ── SERVER-DRIVEN TASK STATE ──
  const [serverSession, setServerSession] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [allTasksCompleted, setAllTasksCompleted] = useState(false);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTaskIds, setCompletedTaskIds] = useState(() =>
    localStorageService.get('mc_completed_task_ids', [])
  );
  const [currentTaskIndex, setCurrentTaskIndex] = useState(() =>
    localStorageService.get('mc_current_task_index', 0)
  );

  // ── collected blocks (from server) ──
  const [collectedFragments, setCollectedFragments] = useState(() =>
    localStorageService.get(STORAGE_KEYS.COLLECTED_FRAGMENTS, [])
  );
  const [collectedFragmentIds, setCollectedFragmentIds] = useState(() =>
    localStorageService.get('mc_collected_fragment_ids', [])
  );

  // ── assembly (ASSEMBLE phase) ──
  const [shuffledVaultOrder, setShuffledVaultOrder] = useState(() =>
    localStorageService.get(STORAGE_KEYS.SHUFFLED_VAULT, [])
  );
  const [assemblyOrder, setAssemblyOrder] = useState(() =>
    localStorageService.get(STORAGE_KEYS.ASSEMBLY_ORDER, [])
  );

  // ── scoring ──
  const [penaltySeconds, setPenaltySeconds] = useState(() =>
    localStorageService.get(STORAGE_KEYS.PENALTY_SECONDS, 0)
  );
  const [quizAttempts, setQuizAttempts] = useState(() =>
    localStorageService.get(STORAGE_KEYS.QUIZ_ATTEMPTS, 0)
  );
  const [submissionAttempts, setSubmissionAttempts] = useState(() =>
    localStorageService.get(STORAGE_KEYS.SUBMISSION_ATTEMPTS, 0)
  );

  // ── result ──
  const [finalResult, setFinalResult] = useState(() =>
    localStorageService.get(STORAGE_KEYS.FINAL_RESULT, null)
  );

  // ── execution state ──
  const [isCompiling, setIsCompiling] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [compileOutput, setCompileOutput] = useState(null);
  const [isTimeExpired, setIsTimeExpired] = useState(false);

  // ── task quiz state ──
  const [taskCooldownRemaining, setTaskCooldownRemaining] = useState(0);
  const [lastQuizExplain, setLastQuizExplain] = useState('');
  const [lastQuizCorrect, setLastQuizCorrect] = useState(null);
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  // ── refs ──
  const submittingRef = useRef(false);
  const cooldownTimerRef = useRef(null);

  // ── derived: current static challenge definition (for sampleInput/Output, title, etc.) ──
  const currentChallenge = useMemo(() => getStaticChallenge(challengeId), [challengeId]);

  // ── derived: challenge info (merged static + server) ──
  const challenge = useMemo(() => {
    const base = currentChallenge;
    const server = serverSession?.challenge || activeChallengeInfo;
    const supportedLangs = server?.supportedLanguages?.length
      ? server.supportedLanguages
      : server?.languageConfigs?.map((lc) => lc.language) || Object.keys(base?.languages || {});
    return {
      ...base,
      id: challengeId,
      slug: server?.slug || base?.id || challengeId,
      title: server?.title || base?.title || 'Coding Challenge',
      description: server?.description || base?.description || '',
      difficulty: server?.difficulty || base?.difficulty || 'Medium',
      points: server?.points ?? base?.points ?? 100,
      category: server?.category || base?.category || 'Algorithms',
      sampleInput: server?.sampleInput || base?.sampleInput || '',
      sampleOutput: server?.sampleOutput || base?.sampleOutput || '',
      duration: serverSession?.session?.durationSeconds || server?.timeLimitSeconds || base?.duration || 1200,
      supportedLanguages: supportedLangs,
      tasks: server?.tasks || [],
    };
  }, [currentChallenge, serverSession, activeChallengeInfo, challengeId]);

  // ── derived: fragment map from collected blocks ──
  const fragmentMap = useMemo(() => {
    const map = {};
    collectedFragments.forEach((f) => {
      if (f && f.blockId) {
        map[f.blockId] = { id: f.blockId, code: f.code, role: f.role };
      }
    });
    return map;
  }, [collectedFragments]);

  // ── derived: assembled fragments ──
  const assemblyFragments = useMemo(
    () => assemblyOrder.map((id) => fragmentMap[id]).filter(Boolean),
    [assemblyOrder, fragmentMap]
  );

  // ── derived: assembled source code ──
  const assembledCode = useMemo(() => combineFragments(assemblyFragments), [assemblyFragments]);

  // ── derived: total fragment count ──
  const totalFragments = useMemo(() => {
    if (serverSession?.challenge?.supportedLanguages) {
      const langInfo = serverSession.challenge.supportedLanguages.find(
        (l) => l.id === language
      );
      return langInfo?.blockCount || totalTasks;
    }
    return totalTasks;
  }, [serverSession, language, totalTasks]);

  // ── init shuffled vault when entering ASSEMBLE ──
  useEffect(() => {
    if (phase !== 'ASSEMBLE') return;
    const canonicalIds = collectedFragmentIds;
    if (canonicalIds.length === 0) return;
    if (shuffledVaultOrder.length === canonicalIds.length && assemblyOrder.length === canonicalIds.length) {
      return; // already matching
    }
    const seed = startTime ? Number(startTime) % 99991 : 12345;
    const shuffled = seededShuffle([...canonicalIds], seed);
    setShuffledVaultOrder(shuffled);
    setAssemblyOrder(shuffled);
  }, [phase, collectedFragmentIds, startTime, shuffledVaultOrder.length, assemblyOrder.length]);

  // ─── persist state ──────────────────────────────────────────────────

  useEffect(() => { localStorageService.set(STORAGE_KEYS.PHASE, phase); }, [phase]);
  useEffect(() => { localStorageService.set(STORAGE_KEYS.CHALLENGE_SESSION, { challengeId, language }); }, [challengeId, language]);
  useEffect(() => { localStorageService.set(STORAGE_KEYS.LANGUAGE_LOCKED, languageLocked); }, [languageLocked]);
  useEffect(() => { localStorageService.set(STORAGE_KEYS.COLLECTED_FRAGMENTS, collectedFragments); }, [collectedFragments]);
  useEffect(() => { localStorageService.set('mc_collected_fragment_ids', collectedFragmentIds); }, [collectedFragmentIds]);
  useEffect(() => { localStorageService.set(STORAGE_KEYS.SHUFFLED_VAULT, shuffledVaultOrder); }, [shuffledVaultOrder]);
  useEffect(() => { localStorageService.set(STORAGE_KEYS.ASSEMBLY_ORDER, assemblyOrder); }, [assemblyOrder]);
  useEffect(() => { localStorageService.set(STORAGE_KEYS.PENALTY_SECONDS, penaltySeconds); }, [penaltySeconds]);
  useEffect(() => { localStorageService.set(STORAGE_KEYS.QUIZ_ATTEMPTS, quizAttempts); }, [quizAttempts]);
  useEffect(() => { localStorageService.set(STORAGE_KEYS.SUBMISSION_ATTEMPTS, submissionAttempts); }, [submissionAttempts]);
  useEffect(() => { if (finalResult) localStorageService.set(STORAGE_KEYS.FINAL_RESULT, finalResult); }, [finalResult]);
  useEffect(() => { localStorageService.set('mc_completed_task_ids', completedTaskIds); }, [completedTaskIds]);
  useEffect(() => { localStorageService.set('mc_current_task_index', currentTaskIndex); }, [currentTaskIndex]);

  // ── cooldown ticker ──
  useEffect(() => {
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    if (taskCooldownRemaining <= 0) return;
    cooldownTimerRef.current = setInterval(() => {
      setTaskCooldownRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(cooldownTimerRef.current);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(cooldownTimerRef.current);
  }, [taskCooldownRemaining]);

  // ─── actions ────────────────────────────────────────────────────────

  /** Pick language (only before first task answered) */
  const selectLanguage = useCallback((lang) => {
    if (languageLocked) return;
    setLanguage(lang);
  }, [languageLocked]);

  /**
   * Start the challenge: call server to start session, get first task.
   * This replaces the old client-side startChallenge.
   */
  const startChallenge = useCallback(async (selectedChalId) => {
    const targetId = selectedChalId || challengeId;
    const now = Date.now();

    try {
      const res = await challengeApi.startSession(targetId, language);
      if (res.success) {
        setChallengeId(targetId);
        setStartTime(now);
        localStorageService.set(STORAGE_KEYS.START_TIME, now);
        setPhase('HUNT');
        setLanguageLocked(false);
        setCollectedFragments([]);
        setCollectedFragmentIds([]);
        setShuffledVaultOrder([]);
        setAssemblyOrder([]);
        setPenaltySeconds(res.session?.totalPenaltySeconds || 0);
        setQuizAttempts(0);
        setSubmissionAttempts(0);
        setFinalResult(null);
        setCompileOutput(null);
        setIsTimeExpired(false);
        setAllTasksCompleted(false);
        setLastQuizExplain('');
        setLastQuizCorrect(null);
        setTaskCooldownRemaining(0);

        // Set server state
        setServerSession(res);
        setCurrentTask(res.currentTask);
        setTotalTasks(res.totalTasks || 0);
        setCompletedTaskIds(res.session?.completedTaskIds || []);
        setCurrentTaskIndex(res.session?.currentTaskIndex || 0);

        // If session already has unlocked blocks (resume), load them
        if (res.session?.unlockedBlocks?.length > 0) {
          setCollectedFragments(res.session.unlockedBlocks);
          setCollectedFragmentIds(res.session.unlockedBlocks.map((b) => b.blockId));
          setLanguageLocked(true);
        }
      }
    } catch (err) {
      console.error('[ChallengeContext] startChallenge error:', err);
      // Fallback: start locally
      setChallengeId(targetId);
      setStartTime(now);
      localStorageService.set(STORAGE_KEYS.START_TIME, now);
      setPhase('HUNT');
    }
  }, [challengeId, language]);

  /**
   * Try to recover session on mount (if phase is HUNT and we have a challengeId)
   */
  useEffect(() => {
    if (phase !== 'HUNT' && phase !== 'ASSEMBLE') return;
    if (!challengeId) return;

    let cancelled = false;

    const recover = async () => {
      try {
        const res = await challengeApi.getProgress(challengeId);
        if (cancelled) return;
        if (res.success && res.hasSession) {
          setServerSession(res);
          setCurrentTask(res.currentTask);
          setTotalTasks(res.session?.totalTasks || res.challenge?.totalTasks || 0);
          setCompletedTaskIds(res.session?.completedTaskIds || []);
          setCurrentTaskIndex(res.session?.currentTaskIndex || 0);
          setAllTasksCompleted(res.allTasksCompleted || false);
          setPenaltySeconds(res.session?.totalPenaltySeconds || 0);

          if (res.unlockedBlocks?.length > 0) {
            setCollectedFragments(res.unlockedBlocks);
            setCollectedFragmentIds(res.unlockedBlocks.map((b) => b.blockId));
            if (res.unlockedBlocks.length > 0) setLanguageLocked(true);
          }

          if (res.cooldownRemaining > 0) {
            setTaskCooldownRemaining(res.cooldownRemaining);
          }

          // Auto-transition to ASSEMBLE if all tasks done
          if (res.allTasksCompleted && phase === 'HUNT') {
            setPhase('ASSEMBLE');
          }
        }
      } catch (err) {
        console.warn('[ChallengeContext] Session recovery skipped:', err.message);
      }
    };

    recover();
    return () => { cancelled = true; };
  }, []); // Only on mount

  /**
   * Submit quiz answer to server.
   * Returns { correct, explain, penalty?, cooldown?, unlockedBlock? }
   */
  const submitQuizAnswer = useCallback(async (answer) => {
    if (taskSubmitting || taskCooldownRemaining > 0) {
      return { correct: false, explain: 'Please wait...' };
    }

    setTaskSubmitting(true);
    setLastQuizCorrect(null);
    setLastQuizExplain('');

    try {
      const res = await challengeApi.submitTaskAnswer(challengeId, answer);
      setQuizAttempts((prev) => prev + 1);

      if (res.correct) {
        // Lock language after first correct answer
        if (!languageLocked) setLanguageLocked(true);

        setLastQuizCorrect(true);
        setLastQuizExplain(res.explain || '');

        // Add unlocked block
        if (res.unlockedBlock) {
          setCollectedFragments((prev) => {
            if (prev.find((f) => f.blockId === res.unlockedBlock.blockId)) return prev;
            return [...prev, res.unlockedBlock];
          });
          setCollectedFragmentIds((prev) => {
            if (prev.includes(res.unlockedBlock.blockId)) return prev;
            return [...prev, res.unlockedBlock.blockId];
          });
        }

        // Update task state
        setCompletedTaskIds(res.completedTaskIds || []);
        setCurrentTaskIndex(res.currentTaskIndex || 0);
        setCurrentTask(res.nextTask || null);
        setAllTasksCompleted(res.allTasksCompleted || false);
        setPenaltySeconds(res.totalPenaltySeconds || 0);

        // Transition to ASSEMBLE if all tasks done
        if (res.allTasksCompleted) {
          // Also set all unlocked blocks from server
          if (res.unlockedBlocks) {
            setCollectedFragments(res.unlockedBlocks);
            setCollectedFragmentIds(res.unlockedBlocks.map((b) => b.blockId));
          }
          setTimeout(() => setPhase('ASSEMBLE'), 600);
        }

        return { correct: true, explain: res.explain || '', unlockedBlock: res.unlockedBlock };
      } else {
        // Wrong answer: keep current task and question, apply only -penalty (no cooldown)
        setLastQuizCorrect(false);
        setLastQuizExplain(res.explain || 'Incorrect. Please try again!');
        setPenaltySeconds(res.totalPenaltySeconds ?? (penaltySeconds + (res.penalty || 20)));
        setTaskCooldownRemaining(0);

        return {
          correct: false,
          explain: res.explain || 'Incorrect. Please try again!',
          penalty: res.penalty || 20,
          cooldown: 0,
        };
      }
    } catch (err) {
      console.error('[ChallengeContext] submitQuizAnswer error:', err);
      // Handle cooldown errors
      if (err.response?.status === 429) {
        const cooldown = err.response?.data?.cooldownRemaining || 3;
        setTaskCooldownRemaining(cooldown);
        return { correct: false, explain: 'Cooldown active. Please wait.', cooldown };
      }
      return { correct: false, explain: 'Server error. Please try again.' };
    } finally {
      setTaskSubmitting(false);
    }
  }, [challengeId, taskSubmitting, taskCooldownRemaining, languageLocked, penaltySeconds]);

  /** Reorder assembly board by swapping two indices */
  const reorderAssembly = useCallback((sourceIdx, destIdx) => {
    setAssemblyOrder((prev) => {
      if (
        sourceIdx < 0 || sourceIdx >= prev.length ||
        destIdx < 0   || destIdx   >= prev.length
      ) return prev;
      const result = [...prev];
      const [removed] = result.splice(sourceIdx, 1);
      result.splice(destIdx, 0, removed);
      return result;
    });
  }, []);

  /** Reset assembly board to the seeded shuffle */
  const resetAssemblyOrder = useCallback(() => {
    setAssemblyOrder([...shuffledVaultOrder]);
  }, [shuffledVaultOrder]);

  // ─── execution ──────────────────────────────────────────────────────

  const executeCode = useCallback(async (customInput = null) => {
    setIsCompiling(true);
    setCompileOutput(null);
    try {
      const inputToUse = customInput ?? challenge.sampleInput ?? '';

      if (!USE_MOCK_JUDGE) {
        try {
          const apiRes = await apiRunCode(language, assembledCode, inputToUse);
          if (apiRes && (apiRes.success || apiRes.status)) {
            setCompileOutput(apiRes);
            return apiRes;
          }
        } catch (_) {
          // fall through to mock
        }
      }

      const result = await mockRunCode({
        language,
        sourceCode: assembledCode,
        input: inputToUse,
        challenge: currentChallenge,
        assemblyOrder: assemblyFragments,
        langFragments: currentChallenge.languages?.[language]?.fragments || [],
        acceptedOrders: currentChallenge.languages?.[language]?.acceptedOrders || [],
      });
      setCompileOutput(result);
      return result;
    } catch (err) {
      const fallback = {
        success: false, status: 'Error',
        stdout: '', stderr: 'Unable to execute. Please try again.',
        compileOutput: '', executionTime: '0.00s', memory: '0.0 MB',
      };
      setCompileOutput(fallback);
      return fallback;
    } finally {
      setIsCompiling(false);
    }
  }, [language, assembledCode, assemblyFragments, currentChallenge, challenge]);

  const submitSolution = useCallback(async (participant) => {
    if (submittingRef.current) return null;
    submittingRef.current = true;
    setIsValidating(true);
    setSubmissionAttempts((prev) => prev + 1);

    try {
      let outcome = null;

      if (!USE_MOCK_JUDGE) {
        try {
          const apiRes = await apiSubmitSolution(language, assembledCode, challengeId);
          if (apiRes && apiRes.status) outcome = apiRes;
        } catch (_) {
          // fall through to mock
        }
      }

      if (!outcome) {
        outcome = await mockJudgeSubmission({
          language,
          sourceCode: assembledCode,
          challenge: currentChallenge,
          assemblyOrder: assemblyFragments,
          langFragments: currentChallenge.languages?.[language]?.fragments || [],
          acceptedOrders: currentChallenge.languages?.[language]?.acceptedOrders || [],
        });
      }

      const elapsedSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      const rankingTime = elapsedSeconds + penaltySeconds;

      const record = {
        ...outcome,
        passed: outcome.status === 'ACCEPTED' || outcome.success,
        finalScore: outcome.score || (outcome.status === 'ACCEPTED' ? (challenge.points || 100) : 0),
        score: outcome.score || (outcome.status === 'ACCEPTED' ? (challenge.points || 100) : 0),
        participantName: participant?.name || 'Participant',
        participantId: participant?.participantId || 'MC-CONTESTANT',
        challengeId: challengeId,
        challengeTitle: challenge.title,
        language,
        timestamp: new Date().toISOString(),
        attempts: submissionAttempts + 1,
        penaltySeconds,
        fragmentCount: collectedFragments.length,
        quizAttempts,
        rankingTime,
      };

      if (record.passed) {
        setFinalResult(record);
        setPhase('DONE');
      }
      return record;
    } catch (err) {
      return {
        success: false, status: 'WRONG_ANSWER',
        title: '⚠️ EVALUATION ERROR',
        message: 'Unable to evaluate submission. Please try again.',
        passedCount: 0, totalCount: 3, testResults: [],
        executionTime: '0.00s', memory: '0.0 MB',
      };
    } finally {
      setIsValidating(false);
      submittingRef.current = false;
    }
  }, [
    language, assembledCode, assemblyFragments, currentChallenge, challenge,
    challengeId, startTime, penaltySeconds, quizAttempts, submissionAttempts,
    collectedFragments,
  ]);

  const handleTimeExpired = useCallback(() => setIsTimeExpired(true), []);

  const resetAll = useCallback(() => {
    localStorageService.clearAllChallengeData();
    localStorageService.remove('mc_completed_task_ids');
    localStorageService.remove('mc_current_task_index');
    localStorageService.remove('mc_collected_fragment_ids');
    setPhase('SETUP');
    setStartTime(null);
    setLanguageLocked(false);
    setCollectedFragments([]);
    setCollectedFragmentIds([]);
    setShuffledVaultOrder([]);
    setAssemblyOrder([]);
    setPenaltySeconds(0);
    setQuizAttempts(0);
    setSubmissionAttempts(0);
    setFinalResult(null);
    setCompileOutput(null);
    setIsTimeExpired(false);
    setServerSession(null);
    setCurrentTask(null);
    setAllTasksCompleted(false);
    setTotalTasks(0);
    setCompletedTaskIds([]);
    setCurrentTaskIndex(0);
    setLastQuizCorrect(null);
    setLastQuizExplain('');
    setTaskCooldownRemaining(0);
  }, []);

  /**
   * Select a challenge to solve: resets prior session state and prepares new challenge
   */
  const selectChallenge = useCallback((newId) => {
    if (!newId) return;
    setChallengeId(newId);
    setPhase('SETUP');
    setStartTime(null);
    setServerSession(null);
    setCurrentTask(null);
    setAllTasksCompleted(false);
    setTotalTasks(0);
    setCompletedTaskIds([]);
    setCurrentTaskIndex(0);
    setCollectedFragments([]);
    setCollectedFragmentIds([]);
    setShuffledVaultOrder([]);
    setAssemblyOrder([]);
    setPenaltySeconds(0);
    setQuizAttempts(0);
    setSubmissionAttempts(0);
    setFinalResult(null);
    setCompileOutput(null);
    setIsTimeExpired(false);
    setTaskCooldownRemaining(0);
    setLastQuizExplain('');
    setLastQuizCorrect(null);
    setLanguageLocked(false);

    localStorageService.clearAllChallengeData();
    localStorageService.remove('mc_completed_task_ids');
    localStorageService.remove('mc_current_task_index');
    localStorageService.remove('mc_collected_fragment_ids');
    localStorageService.set(STORAGE_KEYS.PHASE, 'SETUP');
    localStorageService.set(STORAGE_KEYS.CHALLENGE_SESSION, { challengeId: newId, language });
  }, [language]);

  // ── langConfig compat layer ──
  const langConfig = useMemo(() => {
    // Build a compat structure for components that still reference langConfig
    return {
      fragments: collectedFragments.map((f) => ({
        id: f.blockId,
        code: f.code,
        role: f.role,
      })),
    };
  }, [collectedFragments]);

  return (
    <ChallengeContext.Provider
      value={{
        // challenge
        challenge,
        challenges: CHALLENGES,
        setChallengeId,
        selectChallenge,

        // language
        language,
        selectLanguage,
        languageLocked,
        langConfig,

        // timer
        startTime,
        startChallenge,

        // phase
        phase,

        // ── SERVER-DRIVEN TASK STATE ──
        currentTask,
        allTasksCompleted,
        totalTasks,
        completedTaskIds,
        currentTaskIndex,
        submitQuizAnswer,
        taskCooldownRemaining,
        lastQuizExplain,
        lastQuizCorrect,
        taskSubmitting,

        // fragments (blocks)
        collectedFragments,
        collectedFragmentIds,
        fragmentMap,
        shuffledVaultOrder,
        totalFragments,

        // assembly
        assemblyOrder,
        assemblyFragments,
        assembledCode,
        reorderAssembly,
        resetAssemblyOrder,
        setAssemblyOrder,

        // scoring
        penaltySeconds,
        quizAttempts,
        submissionAttempts,
        // compat aliases
        attempts: submissionAttempts,

        // execution
        executeCode,
        submitSolution,
        isCompiling,
        isValidating,
        compileOutput,

        // result
        finalResult,
        isTimeExpired,
        handleTimeExpired,
        resetAll,

        // ── legacy aliases ──
        unlockedBlocks: collectedFragments.map((f) => ({
          id: f.blockId,
          code: f.code,
          role: f.role,
          blockId: f.blockId,
        })),
        assemblyBlocks: assemblyFragments,
        reorderAssemblyBlocks: reorderAssembly,
        removeAssemblyBlock: () => {},
        addBlockToAssembly: () => false,
        revealNextBlock: async () => null,
        unlockQR: () => null,
        scannedQRIds: [],

        // legacy chest compat (no-op)
        chestStates: {},
        activeChestId: null,
        setActiveChestId: () => {},
        activeChestQuiz: null,
        openChest: () => null,
        cooldownRemaining: taskCooldownRemaining,
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
}

export function useChallengeContext() {
  const context = useContext(ChallengeContext);
  if (!context) throw new Error('useChallengeContext must be used within a ChallengeProvider');
  return context;
}
