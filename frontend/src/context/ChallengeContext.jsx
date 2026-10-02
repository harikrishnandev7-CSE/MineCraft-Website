import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CHALLENGES } from '../data/challenges';
import { localStorageService } from '../services/localStorageService';
import {
  STORAGE_KEYS,
  WRONG_ANSWER_PENALTY_SECONDS,
  WRONG_ANSWER_COOLDOWN_SECONDS,
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
  return CHALLENGES.find((c) => c.id === id) || CHALLENGES[0];
}

/** Build initial chestStates for a given language config */
function buildInitialChestStates(langConfig) {
  if (!langConfig?.chests) return {};
  const states = {};
  langConfig.chests.forEach((chest, idx) => {
    states[chest.id] = {
      status: idx === 0 ? 'active' : 'locked', // first chest starts active
      currentQuizIdx: 0,
      attempts: 0,
      cooldownUntil: null,
      keyEarned: false,
    };
  });
  return states;
}

/** Pick the next quiz id for a chest, cycling through the pool */
function pickQuizId(chest, chestState) {
  const pool = chest.quizPool || [];
  if (pool.length === 0) return null;
  const idx = (chestState.currentQuizIdx || 0) % pool.length;
  return pool[idx];
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

  // ── phase machine ──
  // "SETUP" | "HUNT" | "ASSEMBLE" | "DONE"
  const [phase, setPhase] = useState(() =>
    localStorageService.get(STORAGE_KEYS.PHASE, 'SETUP')
  );

  // ── language (locked after first chest opens) ──
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

  // ── chest states ──
  const [chestStates, setChestStates] = useState(() =>
    localStorageService.get(STORAGE_KEYS.CHEST_STATES, null)
  );
  const [activeChestId, setActiveChestId] = useState(() =>
    localStorageService.get(STORAGE_KEYS.ACTIVE_CHEST_ID, null)
  );

  // ── fragments ──
  const [collectedFragmentIds, setCollectedFragmentIds] = useState(() =>
    localStorageService.get(STORAGE_KEYS.COLLECTED_FRAGMENTS, [])
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

  // ── cooldown ticker ──
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownRef = useRef(null);

  // double-submit guard
  const submittingRef = useRef(false);
  const openingChestRef = useRef(false);

  // ── derived: current challenge definition ──
  const currentChallenge = useMemo(() => getStaticChallenge(challengeId), [challengeId]);

  // ── derived: language config (fragments, chests, quizzes) ──
  const langConfig = useMemo(() => {
    const langs = currentChallenge.languages || {};
    return langs[language] || langs.python || langs.java || Object.values(langs)[0];
  }, [currentChallenge, language]);

  // ── derived: all fragments for this lang, as a map id→fragment ──
  const fragmentMap = useMemo(() => {
    const map = {};
    (langConfig?.fragments || []).forEach((f) => (map[f.id] = f));
    return map;
  }, [langConfig]);

  // ── derived: collected fragments as objects (in collection order) ──
  const collectedFragments = useMemo(
    () => collectedFragmentIds.map((id) => fragmentMap[id]).filter(Boolean),
    [collectedFragmentIds, fragmentMap]
  );

  // ── derived: assembled fragments as objects (board order) ──
  const assemblyFragments = useMemo(
    () => assemblyOrder.map((id) => fragmentMap[id]).filter(Boolean),
    [assemblyOrder, fragmentMap]
  );

  // ── derived: assembled source code ──
  const assembledCode = useMemo(() => combineFragments(assemblyFragments), [assemblyFragments]);

  // ── init chest states when langConfig changes & no saved state ──
  useEffect(() => {
    if (!langConfig?.chests || phase === 'SETUP') return;
    if (chestStates && Object.keys(chestStates).length > 0) {
      // verify keys match current language (language switch clears)
      const firstKey = Object.keys(chestStates)[0];
      if (langConfig.chests.some((c) => c.id === firstKey)) return; // still valid
    }
    const initial = buildInitialChestStates(langConfig);
    setChestStates(initial);
    setActiveChestId(langConfig.chests[0]?.id || null);
  }, [langConfig, phase]);

  // ── init shuffledVault when entering ASSEMBLE ──
  useEffect(() => {
    if (phase !== 'ASSEMBLE') return;
    if (shuffledVaultOrder.length > 0) return; // already seeded
    const canonicalIds = (langConfig?.fragments || []).map((f) => f.id);
    const seed = startTime ? Number(startTime) % 99991 : 12345;
    const shuffled = seededShuffle(canonicalIds, seed);
    setShuffledVaultOrder(shuffled);
    setAssemblyOrder(shuffled); // start board = shuffled vault
  }, [phase, langConfig, startTime, shuffledVaultOrder.length]);

  // ─── persist all state ──────────────────────────────────────────

  useEffect(() => {
    localStorageService.set(STORAGE_KEYS.PHASE, phase);
  }, [phase]);

  useEffect(() => {
    localStorageService.set(STORAGE_KEYS.CHALLENGE_SESSION, { challengeId, language });
  }, [challengeId, language]);

  useEffect(() => {
    localStorageService.set(STORAGE_KEYS.LANGUAGE_LOCKED, languageLocked);
  }, [languageLocked]);

  useEffect(() => {
    if (chestStates) localStorageService.set(STORAGE_KEYS.CHEST_STATES, chestStates);
  }, [chestStates]);

  useEffect(() => {
    localStorageService.set(STORAGE_KEYS.ACTIVE_CHEST_ID, activeChestId);
  }, [activeChestId]);

  useEffect(() => {
    localStorageService.set(STORAGE_KEYS.COLLECTED_FRAGMENTS, collectedFragmentIds);
  }, [collectedFragmentIds]);

  useEffect(() => {
    localStorageService.set(STORAGE_KEYS.SHUFFLED_VAULT, shuffledVaultOrder);
  }, [shuffledVaultOrder]);

  useEffect(() => {
    localStorageService.set(STORAGE_KEYS.ASSEMBLY_ORDER, assemblyOrder);
  }, [assemblyOrder]);

  useEffect(() => {
    localStorageService.set(STORAGE_KEYS.PENALTY_SECONDS, penaltySeconds);
  }, [penaltySeconds]);

  useEffect(() => {
    localStorageService.set(STORAGE_KEYS.QUIZ_ATTEMPTS, quizAttempts);
  }, [quizAttempts]);

  useEffect(() => {
    localStorageService.set(STORAGE_KEYS.SUBMISSION_ATTEMPTS, submissionAttempts);
  }, [submissionAttempts]);

  useEffect(() => {
    if (finalResult) localStorageService.set(STORAGE_KEYS.FINAL_RESULT, finalResult);
  }, [finalResult]);

  // ─── cooldown ticker ────────────────────────────────────────────

  useEffect(() => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    if (!activeChestId || !chestStates) { setCooldownRemaining(0); return; }
    const cs = chestStates[activeChestId];
    if (!cs?.cooldownUntil) { setCooldownRemaining(0); return; }

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((cs.cooldownUntil - Date.now()) / 1000));
      setCooldownRemaining(remaining);
      if (remaining === 0) {
        clearInterval(cooldownRef.current);
        // advance quiz question
        setChestStates((prev) => {
          if (!prev || !prev[activeChestId]) return prev;
          const chest = langConfig?.chests?.find((c) => c.id === activeChestId);
          const pool = chest?.quizPool || [];
          const nextIdx = ((prev[activeChestId].currentQuizIdx || 0) + 1) % Math.max(pool.length, 1);
          return {
            ...prev,
            [activeChestId]: {
              ...prev[activeChestId],
              cooldownUntil: null,
              currentQuizIdx: nextIdx,
            },
          };
        });
      }
    };
    tick();
    cooldownRef.current = setInterval(tick, 500);
    return () => clearInterval(cooldownRef.current);
  }, [activeChestId, chestStates, langConfig]);

  // ─── actions ────────────────────────────────────────────────────

  /** Pick language (only before first chest opened / language locked) */
  const selectLanguage = useCallback((lang) => {
    if (languageLocked) return;
    setLanguage(lang);
    // Reset chest states for new language
    setChestStates(null);
    setCollectedFragmentIds([]);
    setAssemblyOrder([]);
    setShuffledVaultOrder([]);
  }, [languageLocked]);

  /** Start the hunt (called from Rules page or SETUP phase) */
  const startChallenge = useCallback((selectedChalId) => {
    const targetId = selectedChalId || challengeId;
    const now = Date.now();
    setChallengeId(targetId);
    setStartTime(now);
    localStorageService.set(STORAGE_KEYS.START_TIME, now);
    setPhase('HUNT');
    setLanguageLocked(false);
    setChestStates(null); // will be rebuilt by effect
    setActiveChestId(null);
    setCollectedFragmentIds([]);
    setShuffledVaultOrder([]);
    setAssemblyOrder([]);
    setPenaltySeconds(0);
    setQuizAttempts(0);
    setSubmissionAttempts(0);
    setFinalResult(null);
    setCompileOutput(null);
    setIsTimeExpired(false);
  }, [challengeId]);

  /**
   * Submit a quiz answer for the active chest.
   * Returns { correct: boolean, explain: string, penalty: number }
   */
  const submitQuizAnswer = useCallback((chestId, answer) => {
    if (!chestStates || !langConfig) return { correct: false, explain: '' };
    const cs = chestStates[chestId];
    if (!cs || cs.keyEarned || cs.cooldownUntil) return { correct: false, explain: 'Wait for cooldown.' };

    const chest = langConfig.chests.find((c) => c.id === chestId);
    if (!chest) return { correct: false, explain: '' };

    const quizId = pickQuizId(chest, cs);
    const quiz = currentChallenge.quizzes?.[quizId];
    if (!quiz) return { correct: false, explain: 'Quiz not found.' };

    setQuizAttempts((prev) => prev + 1);

    // ── evaluate answer ──
    let correct = false;
    if (quiz.type === 'mcq') {
      correct = Number(answer) === Number(quiz.answer);
    } else if (quiz.type === 'output') {
      const norm = (s) => String(s).replace(/\r\n/g, '\n').trim();
      correct = norm(answer) === norm(quiz.answer);
    } else if (quiz.type === 'fill') {
      const norm = (s) => String(s).replace(/\r\n/g, '\n').trim().toLowerCase();
      const answers = Array.isArray(quiz.answer) ? quiz.answer : [quiz.answer];
      correct = answers.some((a) => norm(answer) === norm(a));
    }

    if (correct) {
      setChestStates((prev) => ({
        ...prev,
        [chestId]: { ...prev[chestId], keyEarned: true, status: 'key-earned' },
      }));
      // lock language after first correct answer
      if (!languageLocked) setLanguageLocked(true);
      return { correct: true, explain: quiz.explain || '' };
    } else {
      // wrong: add penalty, start cooldown
      setPenaltySeconds((prev) => prev + WRONG_ANSWER_PENALTY_SECONDS);
      const cooldownUntil = Date.now() + WRONG_ANSWER_COOLDOWN_SECONDS * 1000;
      setChestStates((prev) => ({
        ...prev,
        [chestId]: {
          ...prev[chestId],
          attempts: (prev[chestId]?.attempts || 0) + 1,
          cooldownUntil,
        },
      }));
      return {
        correct: false,
        explain: quiz.explain || 'Incorrect.',
        penalty: WRONG_ANSWER_PENALTY_SECONDS,
        cooldown: WRONG_ANSWER_COOLDOWN_SECONDS,
      };
    }
  }, [chestStates, langConfig, currentChallenge, languageLocked]);

  /**
   * Open a chest (only if keyEarned for that chest).
   * Adds the associated fragment to collectedFragmentIds.
   * If last chest opened → automatically transition to ASSEMBLE.
   */
  const openChest = useCallback((chestId) => {
    if (openingChestRef.current) return null;
    if (!chestStates || !langConfig) return null;
    const cs = chestStates[chestId];
    if (!cs || !cs.keyEarned || cs.status === 'opened') return null;

    openingChestRef.current = true;

    // find which fragment this chest reveals
    const chestIdx = langConfig.chests.findIndex((c) => c.id === chestId);
    if (chestIdx < 0) { openingChestRef.current = false; return null; }
    const fragmentId = langConfig.revealOrder[chestIdx];
    const fragment = fragmentMap[fragmentId];
    if (!fragment) { openingChestRef.current = false; return null; }

    // add fragment (deduplicate)
    setCollectedFragmentIds((prev) => {
      if (prev.includes(fragmentId)) return prev;
      return [...prev, fragmentId];
    });

    // find next unopened chest to set as active
    const newStates = {
      ...chestStates,
      [chestId]: { ...cs, status: 'opened', keyEarned: false },
    };
    // mark next locked chest as active
    const nextChest = langConfig.chests.find(
      (c) => c.id !== chestId && newStates[c.id]?.status === 'locked'
    );
    if (nextChest) {
      newStates[nextChest.id] = { ...newStates[nextChest.id], status: 'active' };
      setActiveChestId(nextChest.id);
    } else {
      setActiveChestId(null);
    }
    setChestStates(newStates);

    // check if all chests opened
    const totalChests = langConfig.chests.length;
    const openedCount = Object.values(newStates).filter((s) => s.status === 'opened').length;
    if (openedCount >= totalChests) {
      // transition to ASSEMBLE after brief animation time
      setTimeout(() => setPhase('ASSEMBLE'), 400);
    }

    openingChestRef.current = false;
    return fragment;
  }, [chestStates, langConfig, fragmentMap]);

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

  // ─── execution ──────────────────────────────────────────────────

  const executeCode = useCallback(async (customInput = null) => {
    setIsCompiling(true);
    setCompileOutput(null);
    try {
      const inputToUse = customInput ?? currentChallenge.sampleInput ?? '';

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
        langFragments: langConfig?.fragments || [],
        acceptedOrders: langConfig?.acceptedOrders || [],
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
  }, [language, assembledCode, assemblyFragments, currentChallenge, langConfig]);

  const submitSolution = useCallback(async (participant) => {
    if (submittingRef.current) return null;
    submittingRef.current = true;
    setIsValidating(true);
    setSubmissionAttempts((prev) => prev + 1);

    try {
      let outcome = null;

      if (!USE_MOCK_JUDGE) {
        try {
          const apiRes = await apiSubmitSolution(language, assembledCode, currentChallenge.id);
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
          langFragments: langConfig?.fragments || [],
          acceptedOrders: langConfig?.acceptedOrders || [],
        });
      }

      const elapsedSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      const rankingTime = elapsedSeconds + penaltySeconds;

      const record = {
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
        attempts: submissionAttempts + 1,
        penaltySeconds,
        fragmentCount: langConfig?.fragments?.length || 0,
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
    language, assembledCode, assemblyFragments, currentChallenge, langConfig,
    startTime, penaltySeconds, quizAttempts, submissionAttempts,
  ]);

  const handleTimeExpired = useCallback(() => setIsTimeExpired(true), []);

  const resetAll = useCallback(() => {
    localStorageService.clearAllChallengeData();
    setPhase('SETUP');
    setStartTime(null);
    setLanguageLocked(false);
    setChestStates(null);
    setActiveChestId(null);
    setCollectedFragmentIds([]);
    setShuffledVaultOrder([]);
    setAssemblyOrder([]);
    setPenaltySeconds(0);
    setQuizAttempts(0);
    setSubmissionAttempts(0);
    setFinalResult(null);
    setCompileOutput(null);
    setIsTimeExpired(false);
  }, []);

  // ── expose active chest's current quiz ──
  const activeChestQuizId = useMemo(() => {
    if (!activeChestId || !chestStates || !langConfig) return null;
    const cs = chestStates[activeChestId];
    if (!cs || cs.status === 'opened') return null;
    const chest = langConfig.chests.find((c) => c.id === activeChestId);
    if (!chest) return null;
    return pickQuizId(chest, cs);
  }, [activeChestId, chestStates, langConfig]);

  const activeChestQuiz = useMemo(() => {
    if (!activeChestQuizId) return null;
    return currentChallenge.quizzes?.[activeChestQuizId] || null;
  }, [activeChestQuizId, currentChallenge]);

  return (
    <ChallengeContext.Provider
      value={{
        // challenge
        challenge: currentChallenge,
        challenges: CHALLENGES,
        setChallengeId,

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

        // chest / quiz
        chestStates,
        activeChestId,
        setActiveChestId,
        activeChestQuiz,
        activeChestQuizId,
        submitQuizAnswer,
        openChest,
        cooldownRemaining,

        // fragments
        collectedFragments,
        collectedFragmentIds,
        fragmentMap,
        shuffledVaultOrder,

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
        // compat aliases for timer/result pages
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

        // ── legacy aliases so unmodified components don't break ──
        unlockedBlocks: collectedFragments,
        assemblyBlocks: assemblyFragments,
        reorderAssemblyBlocks: reorderAssembly,
        removeAssemblyBlock: (idx) => {
          // no-op in new model (assembly always shows all fragments)
        },
        addBlockToAssembly: () => false,
        revealNextBlock: async () => null,
        unlockQR: () => null,
        scannedQRIds: [],
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
