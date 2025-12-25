import React from 'react';

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
}

const Barcode: React.FC<BarcodeProps> = ({ value, width = 200, height = 60 }) => {
  // A very simplified barcode-like visual representation using SVG pattern
  // In a real app, use 'react-barcode' or 'jsbarcode'
  // This mimics Code 128 visually for demo purposes
  
  if (!value) return null;

  const bars = value.split('').map((char, i) => {
    const code = char.charCodeAt(0);
    const isEven = code % 2 === 0;
    return (
      <rect
        key={i}
        x={10 + i * 12}
        y="0"
        width={isEven ? 4 : 2}
        height={height - 15}
        fill="black"
      />
    );
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} viewBox={`0 0 ${value.length * 15 + 20} ${height}`}>
        <rect x="0" y="0" width="100%" height="100%" fill="white" />
        {bars}
        <text
          x="50%"
          y={height - 2}
          textAnchor="middle"
          fontSize="12"
          fontFamily="monospace"
        >
          {value}
        </text>
      </svg>
    </div>
  );
};

export default Barcode;