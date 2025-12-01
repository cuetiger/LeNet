import React, { useState } from 'react';

interface HeatmapProps {
  data: number[][];
  title?: string;
  cellSize?: number;
  highlightRegion?: { r: number, c: number, h: number, w: number } | null;
  activeCell?: { r: number, c: number } | null;
  onHoverCell?: (r: number, c: number) => void;
  showValues?: boolean;
  className?: string;
}

const Heatmap: React.FC<HeatmapProps> = ({ 
  data, 
  title, 
  cellSize = 20, 
  highlightRegion, 
  activeCell,
  onHoverCell,
  showValues = false,
  className = ""
}) => {
  if (!data || data.length === 0) return null;

  const rows = data.length;
  const cols = data[0].length;

  // Simple blue scale color interpolation
  const getColor = (value: number) => {
    // Expect normalized 0-1 or raw values.
    let intensity = value;
    if (intensity < 0) intensity = 0; 
    if (intensity > 1 && !showValues) intensity = 1;
    
    // White to Blue
    const r = Math.floor(255 - (255 - 59) * intensity);
    const g = Math.floor(255 - (255 - 130) * intensity);
    const b = Math.floor(255 - (255 - 246) * intensity);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {title && <h3 className="text-sm font-medium text-slate-600 mb-2">{title} <span className="text-xs text-slate-400">({rows}x{cols})</span></h3>}
      <div 
        className="relative border border-slate-300 shadow-sm bg-white transition-all duration-300"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gap: '1px',
          padding: '1px',
          backgroundColor: '#e2e8f0'
        }}
        onMouseLeave={() => onHoverCell && onHoverCell(-1, -1)}
      >
        {data.map((row, r) => (
          row.map((val, c) => {
             const isActive = activeCell?.r === r && activeCell?.c === c;
             return (
                <div
                key={`${r}-${c}`}
                className={`relative flex items-center justify-center text-[10px] text-slate-800 select-none transition-colors duration-200 ${isActive ? 'z-20 ring-2 ring-red-500 ring-offset-1' : ''}`}
                style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: getColor(val),
                }}
                onMouseEnter={() => onHoverCell && onHoverCell(r, c)}
                >
                {showValues && Math.abs(val) > 0.01 ? val.toFixed(1) : ''}
                </div>
            )
          })
        ))}

        {/* Highlight Overlay (e.g. for Receptive Field) */}
        {highlightRegion && (
          <div 
            className="absolute border-2 border-yellow-500 pointer-events-none transition-all duration-100 ease-out z-10 bg-yellow-400/20"
            style={{
              top: highlightRegion.r * (cellSize + 1) + 1,
              left: highlightRegion.c * (cellSize + 1) + 1,
              width: highlightRegion.w * (cellSize + 1) - 1,
              height: highlightRegion.h * (cellSize + 1) - 1,
              boxShadow: '0 0 8px rgba(234, 179, 8, 0.5)'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Heatmap;