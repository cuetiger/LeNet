import React, { useRef, useEffect, useState } from 'react';
import { RefreshCw, Check } from 'lucide-react';
import { createMatrix } from '../utils/mathUtils';

interface DrawingPadProps {
  onImageChange: (pixels: number[][]) => void;
  size?: number; // 28
}

const DrawingPad: React.FC<DrawingPadProps> = ({ onImageChange, size = 28 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Scale factor for display (28px is too small to draw on)
  const SCALE = 10;
  const CANVAS_SIZE = size * SCALE;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1.5 * SCALE;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Initial blank state
    exportImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault(); // Prevent scrolling on touch
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      exportImage();
    }
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw to a temp canvas of size 28x28
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Downscale
    tempCtx.drawImage(canvas, 0, 0, size, size);

    // Read pixels
    const imageData = tempCtx.getImageData(0, 0, size, size);
    const pixels = imageData.data;
    const matrix = createMatrix(size, size);

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i]; // Red channel (white drawing on black bg)
      const row = Math.floor((i / 4) / size);
      const col = (i / 4) % size;
      matrix[row][col] = r / 255; // Normalize 0-1
    }

    onImageChange(matrix);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    exportImage();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="cursor-crosshair border-2 border-slate-400 rounded-sm shadow-md touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <div className="flex gap-2">
        <button 
          onClick={clearCanvas}
          className="flex items-center px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded text-sm font-medium transition-colors"
        >
          <RefreshCw size={14} className="mr-1" /> Clear
        </button>
      </div>
    </div>
  );
};

export default DrawingPad;