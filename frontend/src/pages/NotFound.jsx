import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <span className="text-6xl font-black font-mono text-orange-400">404</span>
      <h2 className="text-2xl font-bold text-slate-900">Grid Coordinates Not Found</h2>
      <p className="text-sm text-slate-600 max-w-sm">
        The route or sector you are looking for does not exist in the Mind Craft arena matrix.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-sm border border-slate-300 transition"
      >
        Return to Home
      </Link>
    </div>
  );
}
