import React, { useState } from 'react';
import ChallengeHeader from '../components/challenge/ChallengeHeader';
import ChallengeInstructions from '../components/challenge/ChallengeInstructions';
import ChallengeLanguageSelector from '../components/challenge/ChallengeLanguageSelector';
import QRScanner from '../components/qr/QRScanner';
import AssemblyBoard from '../components/assembly/AssemblyBoard';
import CodeEditor from '../components/editor/CodeEditor';
import EditorToolbar from '../components/editor/EditorToolbar';
import EditorStatus from '../components/editor/EditorStatus';
import RunButton from '../components/execution/RunButton';
import SubmitButton from '../components/execution/SubmitButton';
import OutputPanel from '../components/execution/OutputPanel';
import Timer from '../components/timer/Timer';
import { useExecution } from '../hooks/useExecution';

export default function Challenge() {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState('# Scan QR fragments to begin assembly\n');
  const [blocks, setBlocks] = useState([]);
  const [activeTab, setActiveTab] = useState('assembly'); // 'assembly' | 'editor' | 'scanner'

  const { isRunning, isSubmitting, output, compileError, runtimeError, testResults, runCode, submitSolution } = useExecution();

  const handleScan = (decodedText) => {
    const newBlock = { id: Date.now(), code: decodedText, orderHint: blocks.length + 1 };
    setBlocks((prev) => [...prev, newBlock]);
    setCode((prev) => prev + '\n' + decodedText);
  };

  const handleMoveBlock = (from, to) => {
    if (to < 0 || to >= blocks.length) return;
    const reordered = Array.from(blocks);
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setBlocks(reordered);
    setCode(reordered.map((b) => b.code).join('\n'));
  };

  const handleRemoveBlock = (idx) => {
    const updated = blocks.filter((_, i) => i !== idx);
    setBlocks(updated);
    setCode(updated.map((b) => b.code).join('\n'));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <ChallengeHeader title="Challenge 01: The Matrix Cipher" difficulty="Medium" points={150} category="Algorithms" />
      </div>

      <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <ChallengeLanguageSelector selectedLanguage={selectedLanguage} onChange={setSelectedLanguage} />
        <Timer secondsRemaining={1800} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl">
            <ChallengeInstructions
              description="Construct an algorithm that decodes a stream of encrypted character blocks using an interleaved permutation key."
              inputFormat="First line contains integer N. Second line contains encrypted string S."
              outputFormat="Print the decrypted plain text string."
              constraints={"1 <= N <= 10^5\nS contains lowercase English letters"}
            />
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Live QR Scanner</h4>
            <QRScanner onScanSuccess={handleScan} />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="flex border-b border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('assembly')}
              className={`px-4 py-2 border-b-2 ${activeTab === 'assembly' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400'}`}
            >
              Assembly Canvas ({blocks.length})
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 border-b-2 ${activeTab === 'editor' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400'}`}
            >
              Code Editor
            </button>
          </div>

          {activeTab === 'assembly' ? (
            <AssemblyBoard blocks={blocks} onMoveBlock={handleMoveBlock} onRemoveBlock={handleRemoveBlock} />
          ) : (
            <div className="space-y-0">
              <EditorToolbar language={selectedLanguage} onLanguageChange={setSelectedLanguage} />
              <CodeEditor value={code} onChange={setCode} language={selectedLanguage} />
              <EditorStatus lineCount={code.split('\n').length} charCount={code.length} isSaved={true} />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <RunButton onClick={() => runCode({ code, language: selectedLanguage, input: '5\nabcde' })} isLoading={isRunning} />
            <SubmitButton onClick={() => submitSolution({ code, language: selectedLanguage, challengeId: 'c1' })} isLoading={isSubmitting} />
          </div>

          <OutputPanel output={output} compileError={compileError} runtimeError={runtimeError} testResults={testResults} />
        </div>
      </div>
    </div>
  );
}
