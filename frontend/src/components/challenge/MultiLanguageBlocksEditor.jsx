import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  FileCode,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

const PRESET_LANGUAGES = [
  { id: 'python', name: 'Python 3', ext: 'py' },
  { id: 'java', name: 'Java 17', ext: 'java' },
  { id: 'cpp', name: 'C++ 17', ext: 'cpp' },
  { id: 'c', name: 'C (GCC)', ext: 'c' },
  { id: 'javascript', name: 'JavaScript (Node)', ext: 'js' },
];

const BLOCK_ROLES = [
  { value: 'INPUT', label: 'Input / Reading', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'LOGIC', label: 'Core Logic / Computation', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { value: 'LOOP', label: 'Loop / Iteration', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { value: 'OUTPUT', label: 'Output / Printing', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { value: 'DECLARATION', label: 'Variable / State Declaration', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'MAIN_WRAPPER', label: 'Class / Main Boilerplate', color: 'bg-slate-500/20 text-slate-700 border-slate-500/30' },
];

export default function MultiLanguageBlocksEditor({
  languageConfigs = [],
  onChange,
}) {
  const [activeLang, setActiveLang] = useState(languageConfigs[0]?.language || 'python');
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [splitCode, setSplitCode] = useState('');
  const [splitMode, setSplitMode] = useState('statement'); // 'statement' | 'empty_line' | 'line'

  // Current language config
  const currentConfig = languageConfigs.find((lc) => lc.language === activeLang) || languageConfigs[0] || null;

  // Block count analysis across all languages
  const blockCounts = languageConfigs.map((lc) => ({
    lang: lc.language,
    name: lc.languageName || lc.language,
    count: lc.blocks?.length || 0,
  }));
  const targetBlockCount = blockCounts[0]?.count || 0;
  const hasMismatch = blockCounts.some((b) => b.count !== targetBlockCount);
  const maxBlockCount = Math.max(...blockCounts.map((b) => b.count), 1);

  // Equalize all languages to target block count (synchronizes block count across all languages)
  const handleEqualizeBlocks = (desiredCount) => {
    const updated = languageConfigs.map((lc) => {
      const currentBlocks = [...(lc.blocks || [])];
      let newBlocks = [];

      if (currentBlocks.length >= desiredCount) {
        newBlocks = currentBlocks.slice(0, desiredCount);
      } else {
        newBlocks = [...currentBlocks];
        for (let i = currentBlocks.length + 1; i <= desiredCount; i++) {
          newBlocks.push({
            blockId: `${lc.language}-f${i}`,
            code: `// ${lc.languageName || lc.language} block ${i}`,
            role: i === desiredCount ? 'OUTPUT' : 'LOGIC',
            order: i,
          });
        }
      }

      const normalized = newBlocks.map((b, idx) => ({ ...b, order: idx + 1 }));
      return {
        ...lc,
        blocks: normalized,
        revealOrder: normalized.map((b) => b.blockId),
      };
    });

    onChange(updated);
  };

  // Add new language to configs with exact same number of blocks as existing languages
  const handleAddLanguage = (langId) => {
    if (languageConfigs.some((lc) => lc.language === langId)) {
      setActiveLang(langId);
      return;
    }
    const preset = PRESET_LANGUAGES.find((p) => p.id === langId) || { id: langId, name: langId };
    const requiredCount = languageConfigs[0]?.blocks?.length || 1;

    const initialBlocks = [];
    for (let i = 1; i <= requiredCount; i++) {
      initialBlocks.push({
        blockId: `${preset.id}-f${i}`,
        code: `// ${preset.name} block ${i}`,
        role: i === 1 ? 'INPUT' : i === requiredCount ? 'OUTPUT' : 'LOGIC',
        order: i,
      });
    }

    const newConfig = {
      language: preset.id,
      languageName: preset.name,
      blocks: initialBlocks,
      revealOrder: initialBlocks.map((b) => b.blockId),
      acceptedOrders: [],
    };
    const updated = [...languageConfigs, newConfig];
    onChange(updated);
    setActiveLang(preset.id);
  };

  // Remove language from configs
  const handleRemoveLanguage = (langId) => {
    if (languageConfigs.length <= 1) {
      alert('A challenge must support at least one programming language.');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove ${langId.toUpperCase()} block configurations?`)) {
      return;
    }
    const updated = languageConfigs.filter((lc) => lc.language !== langId);
    onChange(updated);
    if (activeLang === langId) {
      setActiveLang(updated[0]?.language || 'python');
    }
  };

  // Add block SYNCHRONIZED across ALL languages
  const handleAddBlock = () => {
    const nextOrder = (currentConfig?.blocks?.length || 0) + 1;

    const updated = languageConfigs.map((lc) => {
      const existing = lc.blocks || [];
      const newBlock = {
        blockId: `${lc.language}-f${nextOrder}`,
        code: `// ${lc.languageName || lc.language} block ${nextOrder}`,
        role: 'LOGIC',
        order: nextOrder,
      };
      const newBlocks = [...existing, newBlock].map((b, idx) => ({ ...b, order: idx + 1 }));
      return {
        ...lc,
        blocks: newBlocks,
        revealOrder: newBlocks.map((b) => b.blockId),
      };
    });

    onChange(updated);
  };

  // Delete block SYNCHRONIZED across ALL languages
  const handleDeleteBlock = (idx) => {
    const currentLength = currentConfig?.blocks?.length || 0;
    if (currentLength <= 1) {
      alert('A challenge must have at least 1 code block per language.');
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete Block #${idx + 1} across ALL ${languageConfigs.length} programming languages? This ensures all languages maintain the exact same number of blocks.`
      )
    ) {
      return;
    }

    const updated = languageConfigs.map((lc) => {
      const remaining = (lc.blocks || []).filter((_, i) => i !== idx);
      const normalized = remaining.map((b, i) => ({ ...b, order: i + 1 }));
      return {
        ...lc,
        blocks: normalized,
        revealOrder: normalized.map((b) => b.blockId),
      };
    });

    onChange(updated);
  };

  // Move block up / down for current language
  const handleMoveBlock = (idx, direction) => {
    if (!currentConfig) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= currentConfig.blocks.length) return;

    const updatedBlocks = [...currentConfig.blocks];
    const [moved] = updatedBlocks.splice(idx, 1);
    updatedBlocks.splice(targetIdx, 0, moved);

    const normalized = updatedBlocks.map((b, i) => ({ ...b, order: i + 1 }));

    const updated = languageConfigs.map((lc) => {
      if (lc.language === currentConfig.language) {
        return {
          ...lc,
          blocks: normalized,
          revealOrder: normalized.map((b) => b.blockId),
        };
      }
      return lc;
    });

    onChange(updated);
  };

  // Edit block field for current language
  const handleBlockChange = (idx, field, value) => {
    if (!currentConfig) return;
    const updatedBlocks = currentConfig.blocks.map((b, i) => {
      if (i === idx) {
        return { ...b, [field]: value };
      }
      return b;
    });

    const updated = languageConfigs.map((lc) => {
      if (lc.language === currentConfig.language) {
        return {
          ...lc,
          blocks: updatedBlocks,
          revealOrder: updatedBlocks.map((b) => b.blockId),
        };
      }
      return lc;
    });

    onChange(updated);
  };

  // Quick split full code into blocks for the current language
  const handleExecuteSplit = () => {
    if (!splitCode.trim()) return;
    let parts = [];
    if (splitMode === 'empty_line') {
      parts = splitCode
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
    } else if (splitMode === 'line') {
      parts = splitCode
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean);
    } else {
      // By statement / logical sections
      const lines = splitCode.split('\n');
      let currentChunk = [];
      lines.forEach((line) => {
        currentChunk.push(line);
        const trimmed = line.trim();
        if (
          trimmed.endsWith(';') ||
          trimmed.endsWith(':') ||
          trimmed === '}' ||
          trimmed.startsWith('print(') ||
          trimmed.startsWith('System.out')
        ) {
          if (currentChunk.join('\n').trim()) {
            parts.push(currentChunk.join('\n').trim());
            currentChunk = [];
          }
        }
      });
      if (currentChunk.join('\n').trim()) {
        parts.push(currentChunk.join('\n').trim());
      }
    }

    if (parts.length === 0) {
      parts = [splitCode.trim()];
    }

    const currentBlockCount = currentConfig?.blocks?.length || 0;
    if (languageConfigs.length > 1 && parts.length !== currentBlockCount) {
      if (
        !window.confirm(
          `This code split produced ${parts.length} blocks, but other languages currently have ${currentBlockCount} blocks.\n\nAll languages MUST have the exact same number of blocks. Do you want to update all languages to have ${parts.length} blocks?`
        )
      ) {
        return;
      }

      // Update current language with split blocks, and pad/truncate other languages to parts.length
      const updated = languageConfigs.map((lc) => {
        if (lc.language === currentConfig.language) {
          const newBlocks = parts.map((code, idx) => ({
            blockId: `${lc.language}-f${idx + 1}`,
            code,
            role: idx === 0 ? 'INPUT' : idx === parts.length - 1 ? 'OUTPUT' : 'LOGIC',
            order: idx + 1,
          }));
          return {
            ...lc,
            blocks: newBlocks,
            revealOrder: newBlocks.map((b) => b.blockId),
          };
        } else {
          // Adjust other languages
          const existing = [...(lc.blocks || [])];
          let adjusted = [];
          if (existing.length >= parts.length) {
            adjusted = existing.slice(0, parts.length);
          } else {
            adjusted = [...existing];
            for (let i = existing.length + 1; i <= parts.length; i++) {
              adjusted.push({
                blockId: `${lc.language}-f${i}`,
                code: `// ${lc.languageName || lc.language} block ${i}`,
                role: i === parts.length ? 'OUTPUT' : 'LOGIC',
                order: i,
              });
            }
          }
          const normalized = adjusted.map((b, idx) => ({ ...b, order: idx + 1 }));
          return {
            ...lc,
            blocks: normalized,
            revealOrder: normalized.map((b) => b.blockId),
          };
        }
      });

      onChange(updated);
      setSplitModalOpen(false);
      setSplitCode('');
      return;
    }

    const newBlocks = parts.map((code, idx) => ({
      blockId: `${activeLang}-f${idx + 1}`,
      code,
      role: idx === 0 ? 'INPUT' : idx === parts.length - 1 ? 'OUTPUT' : 'LOGIC',
      order: idx + 1,
    }));

    const updated = languageConfigs.map((lc) => {
      if (lc.language === currentConfig.language) {
        return {
          ...lc,
          blocks: newBlocks,
          revealOrder: newBlocks.map((b) => b.blockId),
        };
      }
      return lc;
    });

    onChange(updated);
    setSplitModalOpen(false);
    setSplitCode('');
  };

  return (
    <div className="space-y-6">
      {/* SYNCHRONIZATION STATUS BAR */}
      <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          {hasMismatch ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 uppercase">
                Synchronized Block Count:
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                hasMismatch ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {hasMismatch ? 'Mismatch Detected' : `${targetBlockCount} Blocks per Language`}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {hasMismatch
                ? 'All programming languages must have the exact same number of blocks.'
                : `Adding or deleting a block is automatically synchronized across all ${languageConfigs.length} configured languages.`}
            </p>
          </div>
        </div>

        {hasMismatch && (
          <button
            type="button"
            onClick={() => handleEqualizeBlocks(maxBlockCount)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-bold transition text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Equalize All to {maxBlockCount} Blocks</span>
          </button>
        )}
      </div>

      {/* LANGUAGE SELECTOR HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white/90 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-orange-400" />
          <span className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
            Supported Languages ({languageConfigs.length})
          </span>
        </div>

        {/* Add Language Dropdown */}
        <div className="flex items-center gap-2">
          <select
            aria-label="Add Language"
            onChange={(e) => {
              if (e.target.value) {
                handleAddLanguage(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="text-xs font-mono bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-3 py-1.5 focus:border-orange-500 focus:outline-none"
          >
            <option value="" disabled>
              + Add Language Config...
            </option>
            {PRESET_LANGUAGES.map((p) => {
              const alreadyHas = languageConfigs.some((lc) => lc.language === p.id);
              return (
                <option key={p.id} value={p.id} disabled={alreadyHas}>
                  {p.name} {alreadyHas ? '(Configured)' : ''}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* LANGUAGE TABS */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {languageConfigs.map((lc) => {
          const isActive = lc.language === activeLang;
          const count = lc.blocks?.length || 0;
          const isCountWrong = hasMismatch && count !== targetBlockCount;

          return (
            <div
              key={lc.language}
              onClick={() => setActiveLang(lc.language)}
              className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all ${
                isActive
                  ? 'bg-orange-500/20 border border-orange-500/50 text-cyan-300 shadow-lg shadow-orange-500/10'
                  : 'bg-white/60 border border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-slate-500'}`} />
              <span>{lc.languageName || lc.language.toUpperCase()}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] border ${
                isCountWrong
                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                  : 'bg-slate-50/60 text-slate-700 border-slate-200'
              }`}>
                {count} blocks
              </span>
              {languageConfigs.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveLanguage(lc.language);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-400 ml-1 p-0.5 transition"
                  title="Remove Language"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ACTIVE LANGUAGE PANEL */}
      {currentConfig ? (
        <div className="bg-white/60 border border-slate-200 rounded-2xl p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-slate-900 font-mono">
                  {currentConfig.languageName || currentConfig.language.toUpperCase()} Code Blocks
                </h4>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  lang ID: {currentConfig.language}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold">
                  {currentConfig.blocks?.length || 0} Blocks
                </span>
              </div>
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                Contestants choosing this language will unlock and assemble these {currentConfig.blocks?.length || 0} code fragments.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSplitModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-xs font-mono font-medium transition"
              >
                <Scissors className="w-3.5 h-3.5 text-indigo-400" />
                <span>Split Solution Code</span>
              </button>

              <button
                type="button"
                onClick={handleAddBlock}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-cyan-300 hover:bg-orange-500/20 text-xs font-mono font-bold transition"
                title="Adds a new block across all configured languages to keep counts equal"
              >
                <Plus className="w-3.5 h-3.5 text-orange-400" />
                <span>+ Add Block (All Languages)</span>
              </button>
            </div>
          </div>

          {/* CODE BLOCKS TABLE / LIST */}
          <div className="space-y-3">
            {(!currentConfig.blocks || currentConfig.blocks.length === 0) ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-200 rounded-xl">
                No code blocks configured. Click "+ Add Block (All Languages)" above.
              </div>
            ) : (
              currentConfig.blocks.map((block, idx) => {
                const roleObj = BLOCK_ROLES.find((r) => r.value === block.role) || BLOCK_ROLES[1];
                return (
                  <div
                    key={block.blockId || idx}
                    className="p-4 bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-xl space-y-3 transition"
                  >
                    {/* Block Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        {/* Order Badge */}
                        <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/40 text-cyan-300 flex items-center justify-center font-bold text-xs">
                          #{idx + 1}
                        </div>

                        {/* Block ID */}
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500">ID:</span>
                          <input
                            type="text"
                            value={block.blockId}
                            onChange={(e) => handleBlockChange(idx, 'blockId', e.target.value)}
                            className="bg-white border border-slate-300 text-orange-400 font-bold px-2 py-1 rounded text-xs focus:border-orange-500 focus:outline-none w-28"
                            placeholder="blockId"
                          />
                        </div>

                        {/* Role Selector */}
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500">Role:</span>
                          <select
                            value={block.role || 'LOGIC'}
                            onChange={(e) => handleBlockChange(idx, 'role', e.target.value)}
                            className={`text-[11px] font-bold px-2 py-1 rounded border bg-white focus:outline-none ${roleObj.color}`}
                          >
                            {BLOCK_ROLES.map((r) => (
                              <option key={r.value} value={r.value} className="bg-white text-slate-800">
                                {r.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Controls: Reorder / Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveBlock(idx, -1)}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600 hover:text-slate-900 transition"
                          title="Move Up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === currentConfig.blocks.length - 1}
                          onClick={() => handleMoveBlock(idx, 1)}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600 hover:text-slate-900 transition"
                          title="Move Down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlock(idx)}
                          className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition ml-2"
                          title="Delete Block across all languages"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Block Code Content */}
                    <div>
                      <textarea
                        rows={Math.max(2, Math.min(8, (block.code || '').split('\n').length))}
                        value={block.code || ''}
                        onChange={(e) => handleBlockChange(idx, 'code', e.target.value)}
                        placeholder={`// Enter ${currentConfig.languageName} code fragment #${idx + 1}...`}
                        className="w-full font-mono text-xs p-3 bg-white/90 border border-slate-200 text-slate-900 rounded-lg focus:border-orange-500 focus:outline-none resize-y leading-relaxed"
                        spellCheck="false"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-200 rounded-xl">
          Select or add a language above to configure its code blocks.
        </div>
      )}

      {/* QUICK SPLIT MODAL */}
      {splitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Split Full Solution into Blocks ({currentConfig?.languageName || activeLang})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSplitModalOpen(false)}
                className="text-slate-600 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">
              Paste the working, complete {currentConfig?.languageName} solution below. Choose a split strategy, and it will automatically generate the ordered fragments for this language.
            </p>

            <div className="space-y-2">
              <label className="block text-slate-700 font-bold uppercase text-[10px]">
                Split Strategy:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'statement', label: 'By Statement / Semicolon / Block' },
                  { id: 'empty_line', label: 'By Blank Lines (Paragraphs)' },
                  { id: 'line', label: 'Line by Line' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSplitMode(s.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition ${
                      splitMode === s.id
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">
                Full Solution Code:
              </label>
              <textarea
                rows={10}
                value={splitCode}
                onChange={(e) => setSplitCode(e.target.value)}
                placeholder={`Paste complete ${currentConfig?.languageName} program here...`}
                className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                spellCheck="false"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSplitModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSplit}
                disabled={!splitCode.trim()}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-slate-900 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Generate Blocks</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
