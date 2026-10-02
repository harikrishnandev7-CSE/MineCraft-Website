import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  RefreshCw,
  Layers,
  Play,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export default function ChallengeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState(null);

  // Section 1: Basic Information
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    slug: '',
    category: '',
    difficulty: 'Medium',
    points: 100,
    description: '',
    instructions: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    supportedLanguages: ['java', 'python', 'cpp', 'c'],
    timeLimitSeconds: 1200,
    maxAttempts: 5,
    status: 'Published',
  });

  // Section 2: Source Code & Strategy
  const [sourceLanguage, setSourceLanguage] = useState('java');
  const [sourceCode, setSourceCode] = useState('');
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
  const [testCases, setTestCases] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    async function loadChallenge() {
      try {
        setLoading(true);
        const res = await adminApi.getChallenge(id);
        if (res.success && res.challenge) {
          const c = res.challenge;
          setBasicInfo({
            title: c.title || '',
            slug: c.slug || '',
            category: c.category || 'Algorithms',
            difficulty: c.difficulty || 'Medium',
            points: c.points || 100,
            description: c.description || '',
            instructions: c.instructions || '',
            inputFormat: c.inputFormat || '',
            outputFormat: c.outputFormat || '',
            constraints: c.constraints || '',
            supportedLanguages: c.supportedLanguages || ['java', 'python', 'cpp', 'c'],
            timeLimitSeconds: c.timeLimitSeconds || 1200,
            maxAttempts: c.maxAttempts || 5,
            status: c.status || 'Published',
          });
          setSourceLanguage(c.sourceLanguage || 'java');
          setSourceCode(c.sourceCode || '');
          setSplitStrategy(c.splitStrategy || 'statement');
          if (c.blockConfig) {
            setBlockConfig({
              initialVisibleCount: c.blockConfig.initialVisibleCount !== undefined ? c.blockConfig.initialVisibleCount : 3,
              revealMode: c.blockConfig.revealMode || 'manual',
              revealPenalty: c.blockConfig.revealPenalty !== undefined ? c.blockConfig.revealPenalty : 5,
              wrongSubmissionPenalty: c.blockConfig.wrongSubmissionPenalty !== undefined ? c.blockConfig.wrongSubmissionPenalty : 2,
              maxReveals: c.blockConfig.maxReveals || 8,
              randomizeOrder: c.blockConfig.randomizeOrder !== false,
              partialScoring: c.blockConfig.partialScoring !== false,
            });
          }
          if (c.blocks) {
            setBlocks(
              c.blocks.map((b) => ({
                ...b,
                codeSnippet: b.codeSnippet || b.code,
              }))
            );
          }
          if (c.testCases) {
            setTestCases(c.testCases);
          }
        }
      } catch (err) {
        setToast({ message: 'Failed to load challenge details', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    loadChallenge();
  }, [id]);

  const handleGenerateBlocks = async () => {
    if (!sourceCode.trim()) {
      setToast({ message: 'Please enter source code first', type: 'warning' });
      return;
    }
    try {
      setGenerating(true);
      const res = await adminApi.generateBlocks(id, {
        sourceCode,
        language: sourceLanguage,
        strategy: splitStrategy,
        initialVisibleCount: blockConfig.initialVisibleCount,
        randomize: blockConfig.randomizeOrder,
      });
      if (res.success) {
        setBlocks(res.blocks);
        setToast({ message: `Generated ${res.blocks.length} code blocks`, type: 'success' });
      }
    } catch (err) {
      setToast({ message: 'Failed to generate code blocks', type: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const moveBlock = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const updated = [...blocks];
    [updated[idx], updated[targetIdx]] = [updated[targetIdx], updated[idx]];
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
  };

  const splitBlock = (idx) => {
    const target = blocks[idx];
    const lines = target.codeSnippet.split('\n');
    if (lines.length <= 1) {
      setToast({ message: 'Cannot split single-line block', type: 'warning' });
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
  };

  const updateBlockCode = (idx, newCode) => {
    const updated = [...blocks];
    updated[idx].codeSnippet = newCode;
    updated[idx].code = newCode;
    setBlocks(updated);
  };

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

  const handleUpdateChallenge = async (e) => {
    e.preventDefault();
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

      const res = await adminApi.updateChallenge(id, payload);
      if (res.success) {
        setToast({ message: 'Challenge updated successfully!', type: 'success' });
        setTimeout(() => navigate('/admin/challenges'), 1000);
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Update failed', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950 font-mono text-slate-200">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center space-y-2 text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
            <p>Loading challenge configuration...</p>
          </div>
        </main>
      </div>
    );
  }

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
                EDIT CHALLENGE: {basicInfo.title}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Refine solution source, code blocks, reveal parameters, and test cases
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
            >
              Preview as Participant
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle}
              onClick={handleUpdateChallenge}
              disabled={submitting}
            >
              {submitting ? 'Saving Changes...' : 'Save Updates'}
            </Button>
          </div>
        </div>

        <form onSubmit={handleUpdateChallenge} className="space-y-8">
          {/* SECTION 1: BASIC INFORMATION */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Section 1 — Basic Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Challenge Title</label>
                <input
                  type="text"
                  value={basicInfo.title}
                  onChange={(e) => setBasicInfo({ ...basicInfo, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Slug</label>
                <input
                  type="text"
                  value={basicInfo.slug}
                  onChange={(e) => setBasicInfo({ ...basicInfo, slug: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 font-mono focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Category</label>
                <input
                  type="text"
                  value={basicInfo.category}
                  onChange={(e) => setBasicInfo({ ...basicInfo, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold">Difficulty</label>
                  <select
                    value={basicInfo.difficulty}
                    onChange={(e) => setBasicInfo({ ...basicInfo, difficulty: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
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
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold">Status</label>
                  <select
                    value={basicInfo.status}
                    onChange={(e) => setBasicInfo({ ...basicInfo, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 font-bold"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 font-bold">Problem Description</label>
              <textarea
                rows={3}
                value={basicInfo.description}
                onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white leading-relaxed"
                required
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 font-bold">Instructions</label>
              <textarea
                rows={2}
                value={basicInfo.instructions}
                onChange={(e) => setBasicInfo({ ...basicInfo, instructions: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300"
              />
            </div>
          </div>

          {/* SECTION 2: SOURCE CODE & BLOCK GENERATOR */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-950 border border-indigo-500/40 text-indigo-400 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Section 2 — Source Code & Code Blocks
                </h2>
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
              <label className="text-xs text-slate-400 font-bold">
                Complete Correct Source Code (Admin Only)
              </label>
              <textarea
                rows={9}
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                You can re-split or manually edit the current blocks below.
              </span>
              <Button
                variant="primary"
                size="sm"
                icon={Sparkles}
                type="button"
                onClick={handleGenerateBlocks}
                disabled={generating}
              >
                {generating ? 'Re-Generating...' : 'Regenerate Code Blocks'}
              </Button>
            </div>

            {/* BLOCKS LIST */}
            <div className="space-y-3 pt-3">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Ordered Code Blocks ({blocks.length} fragments)
              </h3>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {blocks.map((block, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs"
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
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveBlock(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBlock(idx, 1)}
                          disabled={idx === blocks.length - 1}
                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => mergeWithNext(idx)}
                          disabled={idx === blocks.length - 1}
                          className="p-1 hover:bg-slate-800 text-cyan-400 rounded disabled:opacity-30"
                        >
                          <Merge className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => splitBlock(idx)}
                          className="p-1 hover:bg-slate-800 text-indigo-400 rounded"
                        >
                          <Split className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBlock(idx)}
                          className="p-1 hover:bg-slate-800 text-rose-400 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={Math.min(5, (block.codeSnippet?.split('\n').length || 1) + 1)}
                      value={block.codeSnippet || block.code}
                      onChange={(e) => updateBlockCode(idx, e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-200 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: BLOCK CONFIGURATION */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-bold">
                3
              </span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Section 3 — Reveal Rules & Penalties
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
                <label className="text-slate-400 font-bold">Penalty per Reveal</label>
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
          </div>

          {/* SECTION 4: TEST CASES */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-950 border border-purple-500/40 text-purple-400 flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Section 4 — Test Cases Manager ({testCases.length})
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

            <div className="space-y-3">
              {testCases.map((tc, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-cyan-400">Test #{idx + 1}</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tc.isHidden}
                          onChange={(e) => updateTestCase(idx, 'isHidden', e.target.checked)}
                          className="rounded bg-slate-900 border-slate-700"
                        />
                        <span className={tc.isHidden ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                          {tc.isHidden ? 'Hidden' : 'Visible'}
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
                      <span className="text-slate-500">Weight:</span>
                      <input
                        type="number"
                        value={tc.weight || 20}
                        onChange={(e) => updateTestCase(idx, 'weight', Number(e.target.value))}
                        className="w-16 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-center text-emerald-400 font-bold"
                      />
                      <span className="text-slate-500">pts</span>

                      <button
                        type="button"
                        onClick={() => duplicateTestCase(idx)}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded"
                      >
                        Copy
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteTestCase(idx)}
                        className="p-1 hover:bg-slate-800 text-rose-400 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-500 font-mono">Input (stdin)</label>
                      <textarea
                        rows={2}
                        value={tc.input}
                        onChange={(e) => updateTestCase(idx, 'input', e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg font-mono text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-500 font-mono">Expected Output (stdout)</label>
                      <textarea
                        rows={2}
                        value={tc.expectedOutput}
                        onChange={(e) => updateTestCase(idx, 'expectedOutput', e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg font-mono text-cyan-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIONS */}
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
              {submitting ? 'Saving Changes...' : 'Save Updates'}
            </Button>
          </div>
        </form>

        {/* PREVIEW MODAL */}
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
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 uppercase">
                  Participant Fragment Pool Preview ({blocks.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {blocks.map((b, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-cyan-400">{b.blockId}</span>
                        <span className="text-emerald-400">Order #{b.originalOrder}</span>
                      </div>
                      <pre className="text-[11px] font-mono text-slate-200 bg-slate-900 p-2 rounded overflow-x-auto">
                        {b.codeSnippet || b.code}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Link to={`/challenge?id=${id}`} target="_blank">
                  <Button variant="primary" size="sm" icon={Play}>
                    Launch in Arena
                  </Button>
                </Link>
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
