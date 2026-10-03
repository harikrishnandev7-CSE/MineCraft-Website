import React, { useState } from 'react';
import Button from '../common/Button';

export default function LoginForm({ onSubmit, isLoading, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password });
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
          Email Address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-orange-400 text-sm"
          placeholder="hacker@mindcraft.io"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-orange-400 text-sm"
          placeholder="••••••••"
        />
      </div>
      <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
        Sign In
      </Button>
    </form>
  );
}
