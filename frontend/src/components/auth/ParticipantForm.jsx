import React, { useState } from 'react';
import Button from '../common/Button';

export default function ParticipantForm({ onJoin, isLoading, error }) {
  const [teamName, setTeamName] = useState('');
  const [sessionCode, setSessionCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onJoin({ teamName, sessionCode: sessionCode.toUpperCase().trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
          Team / Participant Name
        </label>
        <input
          type="text"
          required
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-400 text-sm"
          placeholder="ByteBusters"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
          Event Session Code
        </label>
        <input
          type="text"
          required
          value={sessionCode}
          onChange={(e) => setSessionCode(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono tracking-widest uppercase focus:outline-none focus:border-emerald-400 text-sm"
          placeholder="MINDCRAFT-2026"
        />
      </div>
      <Button type="submit" variant="emerald" className="w-full mt-2" isLoading={isLoading}>
        Join Arena
      </Button>
    </form>
  );
}
