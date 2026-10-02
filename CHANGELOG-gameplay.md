# CHANGELOG-gameplay.md — Mind Craft: Quiz → Treasure Chest → Fragment → Assembly Redesign

## Summary

Complete redesign of the `/challenge` gameplay from a "Reveal Next Block" model to a
**Quiz → Key → Treasure Chest → Fragment → Assemble → Run** flow.

---

## Files Changed

### Core Data
| File | Change |
|------|--------|
| `src/data/challenges.js` | Full schema refactor: `languages[lang].fragments[]`, `revealOrder[]`, `chests[]`, `quizzes{}`. All 4 challenges (ch-01 → ch-04 ★ new Star Pyramid) authored for Python / C++ / C / Java. |

### Context / State
| File | Change |
|------|--------|
| `src/context/ChallengeContext.jsx` | Full rewrite: phase machine (`SETUP→HUNT→ASSEMBLE→DONE`), chest/quiz/key gating, penalty system, seeded vault shuffle, full localStorage persistence. Legacy aliases kept for unmodified components. |

### Utilities
| File | Change |
|------|--------|
| `src/utils/constants.js` | Added new `STORAGE_KEYS` (see below), `WRONG_ANSWER_PENALTY_SECONDS`, `WRONG_ANSWER_COOLDOWN_SECONDS`, `USE_MOCK_JUDGE`. |
| `src/utils/assembly.js` | Replaced `checkAssemblyAccuracy` (correctOrder ints) with `checkFragmentOrder` (fragment-id arrays). Added `seededShuffle`, `normalizeOutput`. Kept `combineBlocks` alias. |

### Services
| File | Change |
|------|--------|
| `src/services/mockCompiler.js` | Uses `checkFragmentOrder` instead of `checkAssemblyAccuracy`. |
| `src/services/mockJudge.js` | Uses `checkFragmentOrder`. Accepts `assemblyOrder`, `langFragments`, `acceptedOrders`. |

### Pages
| File | Change |
|------|--------|
| `src/pages/Challenge.jsx` | Full rewrite: SETUP/HUNT/ASSEMBLE/DONE phases; QR scanner button removed; Reveal Next Block removed; 3-column layout preserved. |
| `src/pages/Home.jsx` | Feature cards and "How it works" updated to new flow. |
| `src/pages/Rules.jsx` | How-it-works section added; rules updated with quiz/penalty mechanics. |

### New Gameplay Components (`src/components/gameplay/`)
| Component | Purpose |
|-----------|---------|
| `PhaseStepper.jsx` | Hunt → Assemble → Run breadcrumb under header |
| `LanguagePicker.jsx` | Language selector (pre-lock) / locked badge (post-lock) |
| `TreasureChest.jsx` | Single chest card: locked/active/key-earned/opened states |
| `ChestGrid.jsx` | Responsive grid of all TreasureChest cards |
| `QuizPanel.jsx` | MCQ / output / fill quiz UI with feedback, cooldown ticker, Open Chest CTA |
| `FragmentVault.jsx` | Right-column panel: collected chips + locked silhouettes (HUNT); shuffled chips (ASSEMBLE) |
| `ProgressCard.jsx` | Left-column: fragment count, phase, penalty seconds, quiz attempts |

### Updated Assembly Components
| File | Change |
|------|--------|
| `src/components/assembly/SortableCodeBlock.jsx` | Shows role tag, line count, `whitespace-pre` for indentation. Remove button hidden (all fragments always on board). |
| `src/components/assembly/AssemblyBoard.jsx` | Uses `block.id` as key; messaging updated for ASSEMBLE phase. |

### CSS
| File | Change |
|------|--------|
| `src/index.css` | Added: `chestLid`, `fragmentReveal`, `keyGlow`, `chestReady`, `phaseBurst` keyframe animations. `prefers-reduced-motion` block added. |

### Config
| File | Change |
|------|--------|
| `frontend/.env` | Added `VITE_USE_MOCK_JUDGE=false` |

---

## New `STORAGE_KEYS` (prefix `mc_`)

| Key | Value | Description |
|-----|-------|-------------|
| `mc_phase` | `'SETUP'|'HUNT'|'ASSEMBLE'|'DONE'` | Current game phase |
| `mc_language_locked` | boolean | Whether language is locked |
| `mc_chest_states` | object | Per-chest `{ status, currentQuizIdx, attempts, cooldownUntil, keyEarned }` |
| `mc_active_chest_id` | string | ID of the chest whose quiz is displayed |
| `mc_earned_keys` | number | (derived from chestStates, not separately stored) |
| `mc_collected_fragments` | string[] | Fragment IDs in collection order |
| `mc_shuffled_vault` | string[] | Seeded shuffle for ASSEMBLE phase (persisted) |
| `mc_assembly_order` | string[] | Current board fragment-id ordering |
| `mc_penalty_seconds` | number | Accumulated penalty seconds |
| `mc_quiz_attempts` | number | Total quiz submission count |
| `mc_submission_attempts` | number | Code submission count |

---

## Judge Adapter

| Env var | Value | Behaviour |
|---------|-------|-----------|
| `VITE_USE_MOCK_JUDGE` | `false` (default) | Uses real Judge0 backend via `POST /api/submissions/run` and `POST /api/submissions/submit` |
| `VITE_USE_MOCK_JUDGE` | `true` | Uses mock adapter (fragment-id order check, 1.4–1.8 s delay). Shown in UI as "Engine: Mock". |

To switch: set `VITE_USE_MOCK_JUDGE=true` in `frontend/.env` and restart Vite.

---

## How to Add a New Challenge

1. Add an entry to `CHALLENGES` array in `src/data/challenges.js` with:
   - `id`, `title`, `difficulty`, `points`, `category`, `description`, `duration`
   - `sampleInput`, `sampleOutput`, `hiddenTests[]`
   - `languages.{ python | cpp | c | java }` each with:
     - `fragments[]` — in **correct** order, each `{ id, code, role }`
     - `revealOrder[]` — shuffled permutation of fragment ids
     - `chests[]` — one per fragment, each `{ id, quizPool: [quizId1, quizId2] }`
     - `acceptedOrders[]` — optional alternate valid id sequences
   - `quizzes{}` — pool keyed by quiz id, each `{ type, concept, prompt, options?, answer, explain }`

2. Fragment count per language is **automatic** — UI reads `fragments.length`.
3. No code changes needed in components.

## How to Add a New Quiz Question to an Existing Chest

1. Open `src/data/challenges.js`.
2. Add a new entry to the challenge's `quizzes` object:
   ```js
   'q1-sum-10': {
     type: 'mcq', // or 'output' or 'fill'
     concept: 'your-concept',
     prompt: 'Your question here',
     options: ['A', 'B', 'C', 'D'], // mcq only
     answer: 1,   // index for mcq; string/string[] for output/fill
     explain: 'Explanation shown after answering.',
   }
   ```
3. Add `'q1-sum-10'` to the `quizPool` of any chest in the appropriate language.

---

## Removed Features
- "Reveal Next Block" button — removed from `/challenge` entirely.
- "Open Digital QR Scanner" button — removed from `/challenge` (QR backend routes/components untouched).
- Static "LOCKED CODE FRAGMENTS (8)" list — replaced by dynamic `FragmentVault` with locked silhouettes.
- Decoy blocks — schema supports `isDecoy` flag but sample data has none; UI does not render them.
