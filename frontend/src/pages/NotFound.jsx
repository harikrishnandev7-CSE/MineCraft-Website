import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <span className="text-6xl font-black font-mono text-cyan-400">404</span>
      <h2 className="text-2xl font-bold text-white">Grid Coordinates Not Found</h2>
      <p className="text-sm text-slate-400 max-w-sm">
        The route or sector you are looking for does not exist in the Mind Craft arena matrix.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm border border-slate-700 transition"
      >
        Return to Home
      </Link>
    </div>
  );
}
