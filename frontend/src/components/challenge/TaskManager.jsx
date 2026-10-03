import React, { useState } from 'react';
import {
  ListChecks,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  Wand2,
  Lock,
} from 'lucide-react';

const QUIZ_TYPES = [
  { value: 'MCQ', label: 'Multiple Choice (MCQ)', desc: 'Contestant picks from a list of options' },
  { value: 'SHORT_ANSWER', label: 'Short Answer', desc: 'Direct text input matched against exact answer' },
  { value: 'FILL_BLANK', label: 'Fill in the Blank', desc: 'Contestant fills missing keyword or token' },
  { value: 'OUTPUT_PREDICTION', label: 'Output Prediction', desc: 'Contestant calculates what the code prints' },
];

export default function TaskManager({
  tasks = [],
  languageConfigs = [],
  onChange,
}) {
  const [expandedTaskId, setExpandedTaskId] = useState(tasks[0]?.taskId || null);

  // Target block count from languages (all languages have equal block counts)
  const targetBlockCount = languageConfigs[0]?.blocks?.length || 0;
  const isCountMatching = tasks.length === targetBlockCount && targetBlockCount > 0;

  // Helper to get reward block for a language from task.rewards
  const getRewardForLang = (task, lang) => {
    if (!task || !task.rewards) return '';
    if (typeof task.rewards.get === 'function') {
      return task.rewards.get(lang) || '';
    }
    return task.rewards[lang] || '';
  };

  // Update task field
  const handleTaskChange = (taskIdx, field, value) => {
    const updated = tasks.map((t, idx) => {
      if (idx === taskIdx) {
        return { ...t, [field]: value };
      }
      return t;
    });
    onChange(updated);
  };

  // Update reward mapping for a specific language
  const handleRewardChange = (taskIdx, lang, blockId) => {
    const updated = tasks.map((t, idx) => {
      if (idx === taskIdx) {
        const currentRewards = t.rewards ? (t.rewards instanceof Map ? Object.fromEntries(t.rewards) : { ...t.rewards }) : {};
        if (blockId) {
          currentRewards[lang] = blockId;
        } else {
          delete currentRewards[lang];
        }
        return { ...t, rewards: currentRewards };
      }
      return t;
    });
    onChange(updated);
  };

  // Add a new task (auto-assigns the first unassigned block for each language)
  const handleAddTask = () => {
    const nextOrder = tasks.length + 1;
    const newTaskId = `task-${nextOrder}`;

    const initialRewards = {};
    languageConfigs.forEach((lc) => {
      // Find the first block that is not already assigned to any other task
      const assignedIds = new Set(tasks.map((t) => getRewardForLang(t, lc.language)).filter(Boolean));
      const availableBlock = (lc.blocks || []).find((b) => !assignedIds.has(b.blockId));
      if (availableBlock) {
        initialRewards[lc.language] = availableBlock.blockId;
      }
    });

    const newTask = {
      taskId: newTaskId,
      title: `Task ${nextOrder}`,
      description: `Complete this task to unlock code block #${nextOrder}`,
      order: nextOrder,
      penalty: 20,
      cooldownSeconds: 3,
      rewards: initialRewards,
      quizPool: [
        {
          quizId: `q${nextOrder}-1`,
          type: 'MCQ',
          prompt: `Task ${nextOrder} Question: What is the purpose of code block #${nextOrder}?`,
          options: ['Executes required logic', 'Alternative option 1', 'Alternative option 2', 'Alternative option 3'],
          answer: 0,
          explain: `Unlocks code block #${nextOrder} upon correct answer.`,
          concept: `concept-${nextOrder}`,
        },
      ],
    };

    const updated = [...tasks, newTask];
    onChange(updated);
    setExpandedTaskId(newTaskId);
  };

  // Move task up / down
  const handleMoveTask = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= tasks.length) return;
    const updated = [...tasks];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);
    const reordered = updated.map((t, i) => ({ ...t, order: i + 1 }));
    onChange(reordered);
  };

  // Delete task
  const handleDeleteTask = (idx) => {
    if (tasks.length <= 1) {
      alert('A challenge must have at least one task.');
      return;
    }
    const updated = tasks.filter((_, i) => i !== idx).map((t, i) => ({ ...t, order: i + 1 }));
    onChange(updated);
  };

  // 1-Click Strict 1:1 Auto-Scaffold: exactly N tasks for N blocks, each unlocking block i
  const handleAutoScaffold1to1 = () => {
    if (targetBlockCount === 0) {
      alert('Please configure code blocks in Section 2 first.');
      return;
    }

    if (
      tasks.length > 0 &&
      !window.confirm(
        `This will synchronize tasks to have exactly ${targetBlockCount} tasks (1:1 mapped to each code block in order). Continue?`
      )
    ) {
      return;
    }

    const newTasks = [];
    for (let i = 1; i <= targetBlockCount; i++) {
      const rewards = {};
      languageConfigs.forEach((lc) => {
        const blk = lc.blocks?.[i - 1];
        if (blk) {
          rewards[lc.language] = blk.blockId;
        }
      });

      // Reuse existing task data if present, otherwise build fresh
      const existingTask = tasks[i - 1];

      newTasks.push({
        taskId: existingTask?.taskId || `task-${i}`,
        title: existingTask?.title || `Task ${i}: Unlock Block #${i}`,
        description: existingTask?.description || `Complete this task to unlock code block #${i}`,
        order: i,
        penalty: existingTask?.penalty ?? 20,
        cooldownSeconds: existingTask?.cooldownSeconds ?? 3,
        rewards,
        quizPool: (existingTask?.quizPool && existingTask.quizPool.length > 0)
          ? existingTask.quizPool
          : [
              {
                quizId: `q${i}-1`,
                type: 'MCQ',
                prompt: `Task ${i} Question: Identify the correct statement about code fragment #${i}:`,
                options: ['Executes correctly in sequence', 'Option B (Distractor)', 'Option C (Distractor)', 'Option D (Distractor)'],
                answer: 0,
                explain: `Correctly solves task ${i} to unlock block #${i}.`,
                concept: `block-${i}`,
              },
            ],
      });
    }

    onChange(newTasks);
    setExpandedTaskId(newTasks[0]?.taskId || null);
  };

  // Quiz Pool handlers
  const handleAddQuiz = (taskIdx) => {
    const task = tasks[taskIdx];
    const pool = task.quizPool || [];
    const nextQuizId = `q${task.order}-${pool.length + 1}`;
    const newQuiz = {
      quizId: nextQuizId,
      type: 'MCQ',
      prompt: 'New quiz question prompt...',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      answer: 0,
      explain: '',
      concept: '',
    };
    handleTaskChange(taskIdx, 'quizPool', [...pool, newQuiz]);
  };

  const handleUpdateQuiz = (taskIdx, quizIdx, field, value) => {
    const task = tasks[taskIdx];
    const updatedPool = (task.quizPool || []).map((q, idx) => {
      if (idx === quizIdx) {
        return { ...q, [field]: value };
      }
      return q;
    });
    handleTaskChange(taskIdx, 'quizPool', updatedPool);
  };

  const handleDeleteQuiz = (taskIdx, quizIdx) => {
    const task = tasks[taskIdx];
    if ((task.quizPool || []).length <= 1) {
      alert('Each task must have at least 1 question in its quiz pool.');
      return;
    }
    const updatedPool = task.quizPool.filter((_, idx) => idx !== quizIdx);
    handleTaskChange(taskIdx, 'quizPool', updatedPool);
  };

  // Option handlers for MCQ
  const handleAddOption = (taskIdx, quizIdx) => {
    const task = tasks[taskIdx];
    const quiz = task.quizPool[quizIdx];
    const options = [...(quiz.options || []), `Option ${(quiz.options || []).length + 1}`];
    handleUpdateQuiz(taskIdx, quizIdx, 'options', options);
  };

  const handleOptionChange = (taskIdx, quizIdx, optIdx, value) => {
    const task = tasks[taskIdx];
    const quiz = task.quizPool[quizIdx];
    const options = (quiz.options || []).map((opt, i) => (i === optIdx ? value : opt));
    handleUpdateQuiz(taskIdx, quizIdx, 'options', options);
  };

  const handleDeleteOption = (taskIdx, quizIdx, optIdx) => {
    const task = tasks[taskIdx];
    const quiz = task.quizPool[quizIdx];
    if ((quiz.options || []).length <= 2) {
      alert('An MCQ must have at least 2 options.');
      return;
    }
    const options = quiz.options.filter((_, i) => i !== optIdx);
    let newAnswer = quiz.answer;
    if (Number(quiz.answer) === optIdx) {
      newAnswer = 0;
    } else if (Number(quiz.answer) > optIdx) {
      newAnswer = Number(quiz.answer) - 1;
    }
    const updatedPool = task.quizPool.map((q, i) => {
      if (i === quizIdx) {
        return { ...q, options, answer: newAnswer };
      }
      return q;
    });
    handleTaskChange(taskIdx, 'quizPool', updatedPool);
  };

  return (
    <div className="space-y-6">
      {/* TASK-TO-BLOCK SYNC STATUS BAR */}
      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          {isCountMatching ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase">
                Task-To-Block 1:1 Requirement:
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  isCountMatching
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {tasks.length} Tasks for {targetBlockCount} Blocks
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isCountMatching
                ? `✓ Perfect 1:1 match. Every code block is unlocked by exactly one task.`
                : `All ${targetBlockCount} code blocks must each have exactly one task. Currently ${tasks.length} tasks configured.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAutoScaffold1to1}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-indigo-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-white font-bold transition text-xs shadow-lg shadow-amber-950/40"
          title="Instantly create or sync exactly 1 task per block with unique assignment"
        >
          <Wand2 className="w-4 h-4 text-amber-400" />
          <span>⚡ Auto-Map 1:1 with Blocks ({targetBlockCount} Tasks)</span>
        </button>
      </div>

      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Sequential Hunt Tasks ({tasks.length})
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
            Target: {targetBlockCount} Tasks
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddTask}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-mono font-bold transition"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* TASKS LIST */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
            No tasks configured yet. Click "⚡ Auto-Map 1:1 with Blocks" above to scaffold all tasks.
          </div>
        ) : (
          tasks.map((task, taskIdx) => {
            const isExpanded = expandedTaskId === task.taskId;
            return (
              <div
                key={task.taskId || taskIdx}
                className={`border rounded-2xl transition overflow-hidden ${
                  isExpanded
                    ? 'bg-slate-900/90 border-amber-500/40 shadow-xl shadow-amber-500/5'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* TASK SUMMARY HEADER / ACCORDION TOGGLE */}
                <div
                  onClick={() => setExpandedTaskId(isExpanded ? null : task.taskId)}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                      #{task.order || taskIdx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-mono">{task.title || `Task ${taskIdx + 1}`}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {task.taskId}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 truncate max-w-md">
                        {task.description || 'No description provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {(task.quizPool || []).length} questions in pool
                    </span>

                    {/* Move Up / Down */}
                    <button
                      type="button"
                      disabled={taskIdx === 0}
                      onClick={() => handleMoveTask(taskIdx, -1)}
                      className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-white"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={taskIdx === tasks.length - 1}
                      onClick={() => handleMoveTask(taskIdx, 1)}
                      className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-white"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(taskIdx)}
                      className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 ml-1"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* EXPANDED TASK DETAILS */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-800/80 space-y-6 font-mono text-xs">
                    {/* Basic Task Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                      <div>
                        <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                          Task Title *
                        </label>
                        <input
                          type="text"
                          value={task.title || ''}
                          onChange={(e) => handleTaskChange(taskIdx, 'title', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
                          placeholder="e.g. Task 1: Unlock Variable Block"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                          Wrong Answer Penalty (Sec)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="300"
                          value={task.penalty ?? 20}
                          onChange={(e) => handleTaskChange(taskIdx, 'penalty', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 text-amber-400 rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                          Wrong Answer Cooldown (Sec)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={task.cooldownSeconds ?? 3}
                          onChange={(e) => handleTaskChange(taskIdx, 'cooldownSeconds', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 text-amber-400 rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                        Task Instructions / Prompt
                      </label>
                      <input
                        type="text"
                        value={task.description || ''}
                        onChange={(e) => handleTaskChange(taskIdx, 'description', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
                        placeholder="e.g. Answer this quiz question to unlock code fragment #1"
                      />
                    </div>

                    {/* REWARD BLOCK MAPPING (PER LANGUAGE) - MUTUALLY EXCLUSIVE */}
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-slate-200 uppercase text-xs">
                            Code Block Unlocked by This Task (1:1 per language)
                          </span>
                        </div>
                        <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                          Blocks assigned to other tasks are hidden from selection
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        When the participant solves this task, exactly this code block is unlocked for their chosen language:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
                        {languageConfigs.map((lc) => {
                          const currentAssignedId = getRewardForLang(task, lc.language);

                          // Find which blocks for this language are already assigned to OTHER tasks
                          const otherTasksAssignedBlockIds = new Set(
                            tasks
                              .filter((_, idx) => idx !== taskIdx)
                              .map((t) => getRewardForLang(t, lc.language))
                              .filter(Boolean)
                          );

                          // Filter: only show unassigned blocks PLUS the block currently assigned to this task
                          const selectableBlocks = (lc.blocks || []).filter(
                            (b) => b.blockId === currentAssignedId || !otherTasksAssignedBlockIds.has(b.blockId)
                          );

                          const currentBlock = (lc.blocks || []).find((b) => b.blockId === currentAssignedId);

                          return (
                            <div
                              key={lc.language}
                              className={`p-3 rounded-lg border space-y-1.5 transition ${
                                currentAssignedId
                                  ? 'bg-slate-900 border-emerald-500/40'
                                  : 'bg-slate-900 border-amber-500/50'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-cyan-400 uppercase">
                                  {lc.languageName || lc.language}
                                </span>
                                {currentAssignedId ? (
                                  <span className="text-emerald-400 font-bold">
                                    Block #{currentBlock?.order || '?'}
                                  </span>
                                ) : (
                                  <span className="text-amber-400 font-bold">Unassigned</span>
                                )}
                              </div>

                              <select
                                aria-label={`Reward block for ${lc.languageName || lc.language}`}
                                value={currentAssignedId}
                                onChange={(e) => handleRewardChange(taskIdx, lc.language, e.target.value)}
                                className={`w-full text-xs font-mono bg-slate-950 border rounded px-2 py-1.5 focus:outline-none ${
                                  currentAssignedId
                                    ? 'border-emerald-500/50 text-emerald-300'
                                    : 'border-amber-500/60 text-amber-300'
                                }`}
                              >
                                <option value="">-- Select Unlocked Block --</option>
                                {selectableBlocks.length === 0 && !currentAssignedId && (
                                  <option value="" disabled>
                                    (All blocks already assigned)
                                  </option>
                                )}
                                {selectableBlocks.map((b) => (
                                  <option key={b.blockId} value={b.blockId}>
                                    Block #{b.order} [{b.blockId}] ({b.role})
                                  </option>
                                ))}
                              </select>

                              {currentBlock ? (
                                <p className="text-[10px] text-slate-400 font-mono truncate">
                                  Role: <span className="text-slate-300 font-semibold">{currentBlock.role}</span>
                                </p>
                              ) : (
                                <p className="text-[10px] text-amber-400 font-mono">
                                  ⚠️ Must select a block
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* QUIZ POOL */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <FileQuestion className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-white uppercase text-xs">
                            Quiz Question Pool ({(task.quizPool || []).length})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddQuiz(taskIdx)}
                          className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Question to Pool</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {(task.quizPool || []).map((quiz, quizIdx) => (
                          <div
                            key={quiz.quizId || quizIdx}
                            className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold">
                                  Q{quizIdx + 1}
                                </span>
                                <select
                                  aria-label="Quiz Type"
                                  value={quiz.type || 'MCQ'}
                                  onChange={(e) => handleUpdateQuiz(taskIdx, quizIdx, 'type', e.target.value)}
                                  className="text-xs bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 font-bold focus:border-amber-500 focus:outline-none"
                                >
                                  {QUIZ_TYPES.map((qt) => (
                                    <option key={qt.value} value={qt.value}>
                                      {qt.label}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={quiz.concept || ''}
                                  onChange={(e) => handleUpdateQuiz(taskIdx, quizIdx, 'concept', e.target.value)}
                                  placeholder="Concept tag (e.g. syntax)"
                                  className="text-[11px] bg-slate-900 border border-slate-800 text-slate-400 rounded px-2 py-1 w-32 focus:outline-none"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteQuiz(taskIdx, quizIdx)}
                                className="text-slate-500 hover:text-rose-400 transition p-1"
                                title="Delete Question"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Prompt Input */}
                            <div>
                              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                                Question Prompt *
                              </label>
                              <textarea
                                rows={2}
                                value={quiz.prompt || ''}
                                onChange={(e) => handleUpdateQuiz(taskIdx, quizIdx, 'prompt', e.target.value)}
                                placeholder="Type the question prompt or problem snippet..."
                                className="w-full font-mono text-xs p-2.5 bg-slate-900 border border-slate-800 text-white rounded-lg focus:border-amber-500 focus:outline-none leading-relaxed"
                              />
                            </div>

                            {/* Type Specific Fields */}
                            {quiz.type === 'MCQ' ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-slate-400 font-bold uppercase text-[10px]">
                                    Options (Select radio button for the correct answer)
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => handleAddOption(taskIdx, quizIdx)}
                                    className="text-[11px] text-cyan-400 hover:text-cyan-300"
                                  >
                                    + Add Option
                                  </button>
                                </div>

                                <div className="space-y-1.5">
                                  {(quiz.options || []).map((opt, optIdx) => (
                                    <div key={optIdx} className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={`mcq_ans_${task.taskId}_${quizIdx}`}
                                        checked={Number(quiz.answer) === optIdx}
                                        onChange={() => handleUpdateQuiz(taskIdx, quizIdx, 'answer', optIdx)}
                                        className="accent-emerald-500 w-4 h-4 cursor-pointer"
                                        title="Mark as correct answer"
                                      />
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => handleOptionChange(taskIdx, quizIdx, optIdx, e.target.value)}
                                        className={`flex-1 bg-slate-900 border text-xs px-2.5 py-1.5 rounded-lg focus:outline-none font-mono ${
                                          Number(quiz.answer) === optIdx
                                            ? 'border-emerald-500/60 text-emerald-300 bg-emerald-950/20'
                                            : 'border-slate-800 text-slate-200 focus:border-slate-700'
                                        }`}
                                        placeholder={`Option ${optIdx + 1}`}
                                      />
                                      {(quiz.options || []).length > 2 && (
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteOption(taskIdx, quizIdx, optIdx)}
                                          className="text-slate-600 hover:text-rose-400 p-1"
                                        >
                                          ✕
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                                  Correct Answer * {quiz.type === 'FILL_BLANK' && '(can be comma-separated for alternates)'}
                                </label>
                                <input
                                  type="text"
                                  value={Array.isArray(quiz.answer) ? quiz.answer.join(', ') : (quiz.answer ?? '')}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (quiz.type === 'FILL_BLANK' && val.includes(',')) {
                                      handleUpdateQuiz(taskIdx, quizIdx, 'answer', val.split(',').map((s) => s.trim()));
                                    } else {
                                      handleUpdateQuiz(taskIdx, quizIdx, 'answer', val);
                                    }
                                  }}
                                  placeholder={quiz.type === 'FILL_BLANK' ? 'e.g. +=, += i' : 'e.g. 42'}
                                  className="w-full bg-slate-900 border border-slate-800 text-emerald-400 font-bold rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none"
                                />
                              </div>
                            )}

                            {/* Explanation */}
                            <div>
                              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                                Explanation (Shown after participant answers)
                              </label>
                              <input
                                type="text"
                                value={quiz.explain || ''}
                                onChange={(e) => handleUpdateQuiz(taskIdx, quizIdx, 'explain', e.target.value)}
                                placeholder="e.g. Option A is correct because the loop terminates at N."
                                className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:border-amber-500 focus:outline-none text-[11px]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
