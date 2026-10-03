import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRScanner({ onScanSuccess, onScanError }) {
  const scannerRef = useRef(null);
  const [scanMessage, setScanMessage] = useState('Position QR inside viewfinder');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader-container',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        setScanMessage('QR Decoded Successfully!');
        if (onScanSuccess) onScanSuccess(decodedText);
      },
      (error) => {
        if (onScanError) onScanError(error);
      }
    );

    return () => {
      scanner.clear().catch((err) => console.error("Failed to clear html5-qrcode:", err));
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl">
      <div id="qr-reader-container" className="overflow-hidden rounded-lg" />
      <p className="text-center text-xs text-slate-600 mt-3 font-mono">{scanMessage}</p>
    </div>
  );
}
