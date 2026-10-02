import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import {
  Code2,
  Sparkles,
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Merge,
  Split,
  Eye,
  CheckCircle,
  Play,
  RotateCcw,
  Layers,
  Settings2,
  FileCheck2,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';

const DEFAULT_JAVA_TEMPLATE = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
    }
}`;

export default function ChallengeCreate() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Section 1: Basic Information
  const [basicInfo, setBasicInfo] = useState({
    title: 'Two Number Adder',
    slug: 'two-number-adder',
    category: 'Algorithms',
    difficulty: 'Easy',
    points: 100,
    description: 'Read two numbers A and B from standard input and output their sum.',
    instructions: 'Unlock the code blocks, arrange them in the proper sequence, and submit your solution.',
    inputFormat: 'Two space-separated integers A and B',
    outputFormat: 'Single integer showing A + B',
    constraints: '-10^5 <= A, B <= 10^5',
    supportedLanguages: ['java', 'python', 'cpp', 'c'],
    timeLimitSeconds: 1200,
    maxAttempts: 5,
    status: 'Published',
  });

  // Section 2: Source Code & Strategy
  const [sourceLanguage, setSourceLanguage] = useState('java');
  const [sourceCode, setSourceCode] = useState(DEFAULT_JAVA_TEMPLATE);
  const [splitStrategy, setSplitStrategy] = useState('statement');
  const [blocks, setBlocks] = useState([]);

  // Section 3: Block Configuration
  const [blockConfig, setBlockConfig] = useState({
    initialVisibleCount: 3,
    revealMode: 'manual',
    revealPenalty: 5,
    wrongSubmissionPenalty: 2,
    maxReveals: 8,
    randomizeOrder: true,
    partialScoring: true,
  });

  // Section 4: Test Cases
  const [testCases, setTestCases] = useState([
    { input: '10 20', expectedOutput: '30', isHidden: false, weight: 20, timeoutSeconds: 5, isEnabled: true, description: 'Basic addition' },
    { input: '5 7', expectedOutput: '12', isHidden: false, weight: 20, timeoutSeconds: 5, isEnabled: true, description: 'Small numbers' },
    { input: '100 -50', expectedOutput: '50', isHidden: true, weight: 20, timeoutSeconds: 5, isEnabled: true, description: 'Negative operand' },
    { input: '-25 -75', expectedOutput: '-100', isHidden: true, weight: 20, timeoutSeconds: 5, isEnabled: true, description: 'Double negatives' },
    { input: '123456 654321', expectedOutput: '777777', isHidden: true, weight: 20, timeoutSeconds: 5, isEnabled: true, description: 'Large integers' },
  ]);

  // Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Auto-generate slug on title change
  const handleTitleChange = (val) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setBasicInfo({ ...basicInfo, title: val, slug });
  };

  // Generate blocks from source code
  const handleGenerateBlocks = async () => {
    if (!sourceCode.trim()) {
      setToast({ message: 'Please enter source code first', type: 'warning' });
      return;
    }
    try {
      setGenerating(true);
      const res = await adminApi.generateBlocks('preview', {
        sourceCode,
        language: sourceLanguage,
        strategy: splitStrategy,
        initialVisibleCount: blockConfig.initialVisibleCount,
        randomize: blockConfig.randomizeOrder,
      });
      if (res.success) {
        setBlocks(res.blocks);
        setToast({ message: `Successfully generated ${res.blocks.length} ordered code blocks!`, type: 'success' });
      }
    } catch (err) {
      setToast({ message: 'Failed to generate code blocks', type: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  // Block manipulations
  const moveBlock = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const updated = [...blocks];
    [updated[idx], updated[targetIdx]] = [updated[targetIdx], updated[idx]];
    // Update display orders
    updated.forEach((b, i) => {
      b.displayOrder = i + 1;
    });
    setBlocks(updated);
  };

  const deleteBlock = (idx) => {
    const updated = blocks.filter((_, i) => i !== idx);
    updated.forEach((b, i) => {
      b.displayOrder = i + 1;
    });
    setBlocks(updated);
  };

  const mergeWithNext = (idx) => {
    if (idx >= blocks.length - 1) return;
    const current = blocks[idx];
    const next = blocks[idx + 1];
    const mergedCode = `${current.codeSnippet}\n${next.codeSnippet}`;
    const mergedBlock = {
      ...current,
      codeSnippet: mergedCode,
      code: mergedCode,
    };
    const updated = [...blocks];
    updated.splice(idx, 2, mergedBlock);
    updated.forEach((b, i) => {
      b.displayOrder = i + 1;
    });
    setBlocks(updated);
    setToast({ message: `Merged block #${current.blockId} with #${next.blockId}`, type: 'info' });
  };

  const splitBlock = (idx) => {
    const target = blocks[idx];
    const lines = target.codeSnippet.split('\n');
    if (lines.length <= 1) {
      setToast({ message: 'Block has only 1 line, cannot split further', type: 'warning' });
      return;
    }
    const mid = Math.ceil(lines.length / 2);
    const firstPart = lines.slice(0, mid).join('\n');
    const secondPart = lines.slice(mid).join('\n');

    const blockA = { ...target, codeSnippet: firstPart, code: firstPart };
    const blockB = {
      ...target,
      blockId: `${target.blockId}b`,
      codeSnippet: secondPart,
      code: secondPart,
      originalOrder: target.originalOrder + 0.5,
    };

    const updated = [...blocks];
    updated.splice(idx, 1, blockA, blockB);
    updated.forEach((b, i) => {
      b.displayOrder = i + 1;
    });
    setBlocks(updated);
    setToast({ message: `Split block into two fragments`, type: 'info' });
  };

  const updateBlockCode = (idx, newCode) => {
    const updated = [...blocks];
    updated[idx].codeSnippet = newCode;
    updated[idx].code = newCode;
    setBlocks(updated);
  };

  // Test Case manipulations
  const addTestCase = () => {
    setTestCases([
      ...testCases,
      { input: '', expectedOutput: '', isHidden: false, weight: 20, timeoutSeconds: 5, isEnabled: true, description: '' },
    ]);
  };

  const updateTestCase = (idx, field, value) => {
    const updated = [...testCases];
    updated[idx][field] = value;
    setTestCases(updated);
  };

  const duplicateTestCase = (idx) => {
    const target = testCases[idx];
    setTestCases([...testCases, { ...target, description: `${target.description || 'Test'} (Copy)` }]);
  };

  const deleteTestCase = (idx) => {
    setTestCases(testCases.filter((_, i) => i !== idx));
  };

  // Submit and create challenge
  const handleSaveChallenge = async (e) => {
    e.preventDefault();
    if (!basicInfo.title.trim()) {
      setToast({ message: 'Challenge Title is required', type: 'error' });
      return;
    }
    if (!sourceCode.trim()) {
      setToast({ message: 'Complete Source Code is required', type: 'error' });
      return;
    }
    if (testCases.length === 0) {
      setToast({ message: 'Please configure at least 1 test case', type: 'warning' });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...basicInfo,
        sourceLanguage,
        sourceCode,
        splitStrategy,
        blockConfig: {
          ...blockConfig,
          totalBlocks: blocks.length,
        },
        blocks,
        testCases,
      };

      const res = await adminApi.createChallenge(payload);
      if (res.success) {
        setToast({ message: 'Challenge created successfully!', type: 'success' });
        setTimeout(() => navigate('/admin/challenges'), 1200);
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to create challenge', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Fast 1-Click: Program -> Challenge Auto-Generator
  const handleAutoGenerateChallenge = async () => {
    if (!basicInfo.title.trim()) {
      setToast({ message: 'Please enter a Program Title', type: 'warning' });
      return;
    }
    if (!sourceCode.trim()) {
      setToast({ message: 'Please enter or paste your Program Code', type: 'warning' });
      return;
    }

    try {
      setGenerating(true);
      // Auto-generate blocks and tasks
      const blockRes = await adminApi.generateBlocks('preview', {
        sourceCode,
        language: sourceLanguage,
        strategy: splitStrategy,
        initialVisibleCount: blockConfig.initialVisibleCount,
        randomize: blockConfig.randomizeOrder,
      });

      const generatedBlocks = blockRes.blocks || [];
      const generatedTasks = blockRes.tasks || [];

      let activeTestCases = testCases;
      if (!activeTestCases || activeTestCases.length === 0 || !activeTestCases[0].input) {
        activeTestCases = [
          { input: '1', expectedOutput: '', isHidden: false, weight: 50, description: 'Sample validation test' },
          { input: '2', expectedOutput: '', isHidden: true, weight: 50, description: 'Hidden boundary test' },
        ];
      }

      const payload = {
        ...basicInfo,
        sourceLanguage,
        sourceCode,
        splitStrategy,
        tasks: generatedTasks,
        blockConfig: {
          ...blockConfig,
          totalBlocks: generatedBlocks.length,
          revealMode: 'task',
        },
        blocks: generatedBlocks,
        testCases: activeTestCases,
      };

      const res = await adminApi.createChallenge(payload);
      if (res.success) {
        setToast({
          message: `✓ Challenge "${basicInfo.title}" generated with ${generatedBlocks.length} code blocks & ${generatedTasks.length} reveal tasks!`,
          type: 'success',
        });
        setTimeout(() => navigate('/admin/challenges'), 1000);
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to auto-generate challenge', type: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 font-mono text-slate-200">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <Link to="/admin/challenges" className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wider flex items-center gap-2">
                <Code2 className="w-6 h-6 text-cyan-400" />
                CREATE CODING CHALLENGE
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Multi-section workflow: Problem Metadata → Source Code → Block Generation → Test Cases
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={Eye}
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              disabled={blocks.length === 0}
            >
              Preview as Participant
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle}
              onClick={handleSaveChallenge}
              disabled={submitting}
            >
              {submitting ? 'Publishing...' : 'Save & Publish Challenge'}
            </Button>
          </div>
        </div>

        {/* FAST 1-STEP PROGRAM GENERATOR: ADMIN ONLY ENTERS THE PROGRAM */}
        <div className="p-6 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/30 border-2 border-cyan-500/50 rounded-2xl space-y-5 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-800/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-400">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-black text-white tracking-wider flex items-center gap-2">
                  CREATE BLIND CODING PROGRAM (1-CLICK AUTO-GENERATE)
                </h2>
                <p className="text-xs text-cyan-300/80 mt-0.5">
                  Admin only enters the program title, language, and code. The system automatically extracts logical code blocks, preserves original order, builds reveal tasks, and configures the challenge!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoGenerateChallenge}
              disabled={generating || submitting}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-950 transition transform hover:scale-[1.02] disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'GENERATING CHALLENGE...' : '⚡ GENERATE CHALLENGE'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">Programming Language</label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-cyan-800/60 rounded-xl text-cyan-300 font-bold focus:outline-none"
              >
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">Program Title *</label>
              <input
                type="text"
                value={basicInfo.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Smart Expense Analyzer"
                className="w-full px-3 py-2.5 bg-slate-950 border border-cyan-800/60 rounded-xl text-white font-semibold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">Difficulty</label>
                <select
                  value={basicInfo.difficulty}
                  onChange={(e) => setBasicInfo({ ...basicInfo, difficulty: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">Points</label>
                <input
                  type="number"
                  value={basicInfo.points}
                  onChange={(e) => setBasicInfo({ ...basicInfo, points: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold">Complete Source Code (Program) *</label>
              <span className="text-[10px] text-cyan-400 font-mono">Paste clean working code</span>
            </div>
            <textarea
              rows={10}
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              className="w-full p-4 bg-slate-950 border border-cyan-900/60 rounded-xl font-mono text-xs text-cyan-200 focus:outline-none focus:border-cyan-400 leading-relaxed resize-y"
              placeholder="// Paste complete Java / Python / C++ program here..."
            />
          </div>
        </div>

        <form onSubmit={handleSaveChallenge} className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              OPTIONAL: FINE-TUNE METADATA, TEST CASES & CUSTOM BLOCKS
            </h3>
          </div>
          {/* SECTION 1: BASIC INFORMATION */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Section 1 — Basic Problem Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Challenge Title *</label>
                <input
                  type="text"
                  value={basicInfo.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Java Two Number Adder"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Slug (URL Identifier) *</label>
                <input
                  type="text"
                  value={basicInfo.slug}
                  onChange={(e) => setBasicInfo({ ...basicInfo, slug: e.target.value })}
                  placeholder="e.g. java-sum-two-numbers"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Category</label>
                <input
                  type="text"
                  value={basicInfo.category}
                  onChange={(e) => setBasicInfo({ ...basicInfo, category: e.target.value })}
                  placeholder="e.g. Algorithms, Math & Accumulation"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold">Difficulty</label>
                  <select
                    value={basicInfo.difficulty}
                    onChange={(e) => setBasicInfo({ ...basicInfo, difficulty: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold">Points</label>
                  <input
                    type="number"
                    value={basicInfo.points}
                    onChange={(e) => setBasicInfo({ ...basicInfo, points: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold">Status</label>
                  <select
                    value={basicInfo.status}
                    onChange={(e) => setBasicInfo({ ...basicInfo, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 font-bold focus:outline-none"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 font-bold">Problem Description *</label>
              <textarea
                rows={3}
                value={basicInfo.description}
                onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                placeholder="Clear explanation of the problem statement..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white leading-relaxed focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 font-bold">Contestant Instructions</label>
              <textarea
                rows={2}
                value={basicInfo.instructions}
                onChange={(e) => setBasicInfo({ ...basicInfo, instructions: e.target.value })}
                placeholder="Tactical hints or assembly instructions for the participant..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Input Format</label>
                <input
                  type="text"
                  value={basicInfo.inputFormat}
                  onChange={(e) => setBasicInfo({ ...basicInfo, inputFormat: e.target.value })}
                  placeholder="e.g. Two space-separated integers A and B"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Output Format</label>
                <input
                  type="text"
                  value={basicInfo.outputFormat}
                  onChange={(e) => setBasicInfo({ ...basicInfo, outputFormat: e.target.value })}
                  placeholder="e.g. Single integer showing A + B"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Constraints</label>
                <input
                  type="text"
                  value={basicInfo.constraints}
                  onChange={(e) => setBasicInfo({ ...basicInfo, constraints: e.target.value })}
                  placeholder="e.g. 1 <= N <= 10^5"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-1">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Time Limit (Seconds)</label>
                <input
                  type="number"
                  value={basicInfo.timeLimitSeconds}
                  onChange={(e) => setBasicInfo({ ...basicInfo, timeLimitSeconds: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Max Attempts</label>
                <input
                  type="number"
                  value={basicInfo.maxAttempts}
                  onChange={(e) => setBasicInfo({ ...basicInfo, maxAttempts: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: SOURCE CODE & BLOCK GENERATOR */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-950 border border-indigo-500/40 text-indigo-400 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Section 2 — Complete Solution & Block Generator
                  </h2>
                  <p className="text-[11px] text-rose-400">
                    Confidential: The complete source code is never exposed to participants.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-bold"
                >
                  <option value="java">Java (OpenJDK)</option>
                  <option value="python">Python 3</option>
                  <option value="cpp">C++ (GCC)</option>
                  <option value="c">C (GCC)</option>
                  <option value="javascript">JavaScript (Node)</option>
                </select>

                <select
                  value={splitStrategy}
                  onChange={(e) => setSplitStrategy(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                >
                  <option value="statement">Statement-Based (Default)</option>
                  <option value="line">Line-by-Line</option>
                  <option value="function">Function/Class Based</option>
                  <option value="custom">Custom Delimiter</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-bold flex items-center justify-between">
                <span>Complete Correct Source Code (Solution Ground Truth)</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Paste the working program below, then click "Generate Code Blocks"
                </span>
              </label>
              <textarea
                rows={10}
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                placeholder="Paste the working solution program here..."
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 leading-relaxed focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="text-xs text-slate-400">
                Splits code into logical fragments while retaining internal ground truth ordering.
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={Sparkles}
                type="button"
                onClick={handleGenerateBlocks}
                disabled={generating}
              >
                {generating ? 'Parsing & Generating...' : 'Generate Code Blocks'}
              </Button>
            </div>

            {/* GENERATED BLOCKS LIST */}
            {blocks.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Generated Code Blocks ({blocks.length} fragments)
                    </h3>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-semibold">
                    Original Order Preserved Internally
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                  {blocks.map((block, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs transition hover:border-slate-700"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                            {block.blockId}
                          </span>
                          <span className="px-2 py-0.5 rounded font-semibold bg-slate-900 text-slate-400 border border-slate-800">
                            {block.blockType}
                          </span>
                          <span className="text-emerald-400 font-bold">
                            Original Order: #{block.originalOrder}
                          </span>
                          {idx < blockConfig.initialVisibleCount && (
                            <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold border border-amber-800/40">
                              Initially Visible
                            </span>
                          )}
                        </div>

                        {/* Block actions */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveBlock(idx, -1)}
                            disabled={idx === 0}
                            title="Move Block Up"
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBlock(idx, 1)}
                            disabled={idx === blocks.length - 1}
                            title="Move Block Down"
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => mergeWithNext(idx)}
                            disabled={idx === blocks.length - 1}
                            title="Merge with Next Block"
                            className="p-1 hover:bg-slate-800 text-cyan-400 rounded disabled:opacity-30"
                          >
                            <Merge className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => splitBlock(idx)}
                            title="Split Block"
                            className="p-1 hover:bg-slate-800 text-indigo-400 rounded"
                          >
                            <Split className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteBlock(idx)}
                            title="Delete Block"
                            className="p-1 hover:bg-slate-800 text-rose-400 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={Math.min(5, (block.codeSnippet.split('\n').length || 1) + 1)}
                        value={block.codeSnippet}
                        onChange={(e) => updateBlockCode(idx, e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-200 leading-snug focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: BLOCK CONFIGURATION */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-bold">
                3
              </span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Section 3 — Block Reveal & Competition Rules
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Initial Visible Blocks</label>
                <input
                  type="number"
                  value={blockConfig.initialVisibleCount}
                  onChange={(e) => setBlockConfig({ ...blockConfig, initialVisibleCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Reveal Mode</label>
                <select
                  value={blockConfig.revealMode}
                  onChange={(e) => setBlockConfig({ ...blockConfig, revealMode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 font-bold"
                >
                  <option value="manual">Manual Button (Direct Reveal)</option>
                  <option value="sequential">Sequential Locked</option>
                  <option value="timer">Timer-Based Release</option>
                  <option value="token">Token / QR Scan Only</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Penalty per Reveal (Points)</label>
                <input
                  type="number"
                  value={blockConfig.revealPenalty}
                  onChange={(e) => setBlockConfig({ ...blockConfig, revealPenalty: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-rose-400 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Wrong Submission Penalty</label>
                <input
                  type="number"
                  value={blockConfig.wrongSubmissionPenalty}
                  onChange={(e) => setBlockConfig({ ...blockConfig, wrongSubmissionPenalty: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-rose-400 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Maximum Reveals Allowed</label>
                <input
                  type="number"
                  value={blockConfig.maxReveals}
                  onChange={(e) => setBlockConfig({ ...blockConfig, maxReveals: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="randomizeOrder"
                  checked={blockConfig.randomizeOrder}
                  onChange={(e) => setBlockConfig({ ...blockConfig, randomizeOrder: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-cyan-500"
                />
                <label htmlFor="randomizeOrder" className="text-slate-300 font-semibold cursor-pointer">
                  Randomize Display Order in Available Pool
                </label>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="partialScoring"
                  checked={blockConfig.partialScoring}
                  onChange={(e) => setBlockConfig({ ...blockConfig, partialScoring: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-cyan-500"
                />
                <label htmlFor="partialScoring" className="text-slate-300 font-semibold cursor-pointer">
                  Allow Partial Test Case Scoring
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 4: TEST CASE MANAGEMENT */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-950 border border-purple-500/40 text-purple-400 flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Section 4 — Test Case Manager ({testCases.length} tests)
                </h2>
              </div>

              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                type="button"
                onClick={addTestCase}
              >
                Add Test Case
              </Button>
            </div>

            <div className="space-y-4">
              {testCases.map((tc, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-cyan-400">Test Case #{idx + 1}</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tc.isHidden}
                          onChange={(e) => updateTestCase(idx, 'isHidden', e.target.checked)}
                          className="rounded bg-slate-900 border-slate-700"
                        />
                        <span className={tc.isHidden ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                          {tc.isHidden ? 'Hidden Test Case' : 'Visible Sample'}
                        </span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tc.isEnabled}
                          onChange={(e) => updateTestCase(idx, 'isEnabled', e.target.checked)}
                          className="rounded bg-slate-900 border-slate-700"
                        />
                        <span className="text-slate-400">Enabled</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Weight:</span>
                        <input
                          type="number"
                          value={tc.weight || 20}
                          onChange={(e) => updateTestCase(idx, 'weight', Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-center text-emerald-400 font-bold"
                        />
                        <span className="text-slate-500">pts</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => duplicateTestCase(idx)}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded"
                        title="Duplicate"
                      >
                        Copy
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteTestCase(idx)}
                        className="p-1 hover:bg-slate-800 text-rose-400 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-500 font-mono">Standard Input (stdin)</label>
                      <textarea
                        rows={2}
                        value={tc.input}
                        onChange={(e) => updateTestCase(idx, 'input', e.target.value)}
                        placeholder="e.g. 10 20"
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg font-mono text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-500 font-mono">Expected Output (stdout)</label>
                      <textarea
                        rows={2}
                        value={tc.expectedOutput}
                        onChange={(e) => updateTestCase(idx, 'expectedOutput', e.target.value)}
                        placeholder="e.g. 30"
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg font-mono text-cyan-300"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM ACTIONS */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
            <Link to="/admin/challenges">
              <Button variant="outline" size="sm" type="button">
                Cancel
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              icon={Eye}
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              disabled={blocks.length === 0}
            >
              Preview as Participant
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle}
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Creating Challenge...' : 'Save & Publish Challenge'}
            </Button>
          </div>
        </form>

        {/* PARTICIPANT PREVIEW MODAL */}
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">
                    PARTICIPANT PREVIEW: {basicInfo.title}
                  </h3>
                </div>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Close
                </button>
              </div>

              {/* Description */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex items-center gap-3 text-cyan-400 font-bold">
                  <span>{basicInfo.category}</span>
                  <span>•</span>
                  <span>{basicInfo.points} PTS</span>
                  <span>•</span>
                  <span className="text-amber-400">{basicInfo.difficulty}</span>
                </div>
                <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                  {basicInfo.description}
                </p>
                {basicInfo.instructions && (
                  <p className="text-slate-400 italic text-[11px] pt-1">
                    Instructions: {basicInfo.instructions}
                  </p>
                )}
              </div>

              {/* Fragment pool preview */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 uppercase">
                  Participant Block Pool ({blocks.length} fragments)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {blocks.map((b, idx) => {
                    const isVisible = idx < blockConfig.initialVisibleCount;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                          isVisible
                            ? 'bg-slate-950 border-slate-800'
                            : 'bg-slate-950/40 border-dashed border-slate-800/80 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-cyan-400">{b.blockId}</span>
                          <span className="text-slate-400">
                            {isVisible ? 'Initial Visible' : 'Locked (Click Reveal to Unlock)'}
                          </span>
                        </div>
                        {isVisible ? (
                          <pre className="text-[11px] font-mono text-slate-200 bg-slate-900 p-2 rounded overflow-x-auto">
                            {b.codeSnippet}
                          </pre>
                        ) : (
                          <div className="p-4 bg-slate-900/50 rounded text-center text-slate-500 font-mono">
                            [ ??? HIDDEN CODE FRAGMENT ??? ]
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Test Cases summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-indigo-400 uppercase">
                  Test Cases Preview ({testCases.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {testCases.map((tc, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-300">Test #{idx + 1}</span>
                        <span className={tc.isHidden ? 'text-amber-400' : 'text-emerald-400'}>
                          {tc.isHidden ? 'Hidden Test' : 'Sample Test'} ({tc.weight || 20} pts)
                        </span>
                      </div>
                      <div className="text-slate-400">Input: <code className="text-white">{tc.input || '(empty)'}</code></div>
                      <div className="text-slate-400">Output: <code className="text-cyan-300">{tc.expectedOutput}</code></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </main>
    </div>
  );
}
