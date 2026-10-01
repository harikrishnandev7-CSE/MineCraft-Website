import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

export default function QRManager() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6">
        <Header title="QR Code Generator & Dispatch" subtitle="Generate printable QR sheets and verify hash signatures." />
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-sm text-slate-400">QR code batch generator utility.</p>
        </div>
      </main>
    </div>
  );
}
