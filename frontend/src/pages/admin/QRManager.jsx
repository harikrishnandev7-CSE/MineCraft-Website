import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

export default function QRManager() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6">
        <Header title="QR Code Generator & Dispatch" subtitle="Generate printable QR sheets and verify hash signatures." />
        <div className="p-6 bg-white border border-slate-200 rounded-xl">
          <p className="text-sm text-slate-600">QR code batch generator utility.</p>
        </div>
      </main>
    </div>
  );
}
