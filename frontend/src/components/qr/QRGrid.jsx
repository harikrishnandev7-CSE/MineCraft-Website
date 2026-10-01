import React from 'react';
import QRCard from './QRCard';

export default function QRGrid({ qrTokens = [], scannedQRIds = [], onSelectQR }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {qrTokens.map((item) => (
        <QRCard
          key={item.qrId}
          qrItem={item}
          isScanned={scannedQRIds.includes(item.qrId)}
          onClick={() => onSelectQR(item)}
        />
      ))}
    </div>
  );
}
