import React, { useState, useEffect, useRef } from 'react';
import { createMatrix, convolve2d, padMatrix, normalizeMatrix } from '../utils/mathUtils';
import Heatmap from '../components/Heatmap';
import { SOBEL_X, SOBEL_Y, EDGE_DETECT, BLUR } from '../constants';
import { Settings, Info, Play, Pause, RefreshCw } from 'lucide-react';
import { explainConcept } from '../services/geminiService';

const ConvLab: React.FC = () => {
  // Config
  const [inputSize, setInputSize] = useState(7);
  const [kernelSize, setKernelSize] = useState(3);
  const [stride, setStride] = useState(1);
  const [padding, setPadding] = useState(0);

  // Data
  const [inputGrid, setInputGrid] = useState<number[][]>([]);
  const [kernel, setKernel] = useState<number[][]>(SOBEL_X);
  const [outputGrid, setOutputGrid] = useState<number[][]>([]);
  
  // Animation & Interaction
  const [isAnimating, setIsAnimating] = useState(false);
  const [animStep, setAnimStep] = useState(0);
  const [hoveredOutputCell, setHoveredOutputCell] = useState<{r: number, c: number} | null>(null);
  
  // Derived state for highlighting
  const [highlightInput, setHighlightInput] = useState<{r: number, c: number, h: number, w: number} | null>(null);
  const [activeOutputCell, setActiveOutputCell] = useState<{r: number, c: number} | null>(null);

  const [aiTip, setAiTip] = useState<string>("");
  const [loadingTip, setLoadingTip] = useState(false);

  // Initialize Input Grid
  useEffect(() => {
    const grid = createMatrix(inputSize, inputSize, 0);
    const mid = Math.floor(inputSize / 2);
    // Draw a shape
    for(let i=0; i<inputSize; i++) {
      grid[mid][i] = 1;
      grid[i][mid] = 1;
    }
    grid[1][1] = 0.5; grid[1][inputSize-2] = 0.5;
    grid[inputSize-2][1] = 0.5; grid[inputSize-2][inputSize-2] = 0.5;
    setInputGrid(grid);
    setAnimStep(0);
    setIsAnimating(false);
  }, [inputSize]);

  // Recalculate Output
  useEffect(() => {
    if (inputGrid.length > 0 && kernel.length > 0) {
      const out = convolve2d(inputGrid, kernel, stride, padding);
      setOutputGrid(normalizeMatrix(out)); 
    }
  }, [inputGrid, kernel, stride, padding]);

  // Handle Animation Loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAnimating && outputGrid.length > 0) {
       interval = setInterval(() => {
          setAnimStep(prev => {
             const rows = outputGrid.length;
             const cols = outputGrid[0].length;
             const maxSteps = rows * cols;
             
             if (prev >= maxSteps - 1) {
                setIsAnimating(false);
                return prev;
             }
             return prev + 1;
          });
       }, 400); // Speed
    }
    return () => clearInterval(interval);
  }, [isAnimating, outputGrid]);

  // Sync Animation Step to Highlight
  useEffect(() => {
     if (outputGrid.length === 0) return;
     const rows = outputGrid.length;
     const cols = outputGrid[0].length;
     
     // Determine active cell from animation step or hover
     let targetR = -1;
     let targetC = -1;

     if (isAnimating || animStep > 0) {
        targetR = Math.floor(animStep / cols);
        targetC = animStep % cols;
     } 
     
     // Hover overrides animation static state (only if not currently playing)
     if (!isAnimating && hoveredOutputCell) {
        targetR = hoveredOutputCell.r;
        targetC = hoveredOutputCell.c;
     }

     if (targetR >= 0 && targetR < rows && targetC >= 0 && targetC < cols) {
        setActiveOutputCell({ r: targetR, c: targetC });
        
        // Calculate receptive field
        // Note: For visualization simplicity with padding, we treat the grid as the padded space logically
        // or just offset. Here we map to raw input coordinates.
        const rStart = targetR * stride - padding;
        const cStart = targetC * stride - padding;
        
        setHighlightInput({
            r: rStart,
            c: cStart,
            h: kernelSize,
            w: kernelSize
        });
     } else {
        setActiveOutputCell(null);
        setHighlightInput(null);
     }

  }, [animStep, isAnimating, hoveredOutputCell, outputGrid, stride, padding, kernelSize]);

  const toggleAnimation = () => {
     if (isAnimating) {
        setIsAnimating(false);
     } else {
        if (animStep >= (outputGrid.length * outputGrid[0].length) - 1) {
            setAnimStep(0);
        }
        setIsAnimating(true);
     }
  };

  const getAiExplanation = async () => {
    setLoadingTip(true);
    const context = `User is exploring convolution. Input Size: ${inputSize}x${inputSize}. Kernel: ${kernelSize}x${kernelSize}. Stride: ${stride}. Padding: ${padding}.`;
    const tip = await explainConcept("Receptive Field and Dot Product", context);
    setAiTip(tip);
    setLoadingTip(false);
  };

  // Math Visualization Helper
  const getCalculationDetails = () => {
      if (!highlightInput || !activeOutputCell) return null;
      // Show sum of products
      return (
          <div className="text-xs font-mono text-slate-600 bg-slate-100 p-2 rounded border border-slate-300 shadow-inner max-w-xs overflow-hidden">
              <div className="font-bold mb-1 border-b pb-1">Convolution Step</div>
              <div>Pos: ({activeOutputCell.r}, {activeOutputCell.c})</div>
              <div>Calculation: Dot Product</div>
              <div className="opacity-75">Input Region • Kernel</div>
              <div className="text-indigo-600 font-bold mt-1">= {outputGrid[activeOutputCell.r][activeOutputCell.c].toFixed(2)} (normalized)</div>
          </div>
      );
  };

  return (
    <div className="flex flex-col gap-6 p-6 animate-fadeIn max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Convolution Playground</h2>
          <p className="text-slate-500">Visualize how the kernel slides over the input to produce the feature map.</p>
        </div>
        <div className="flex gap-2">
            <button 
            onClick={toggleAnimation}
            className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition-colors ${isAnimating ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
            >
            {isAnimating ? <Pause size={18} /> : <Play size={18} />}
            {isAnimating ? "Pause" : "Animate"}
            </button>
            <button 
            onClick={getAiExplanation}
            disabled={loadingTip}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
            <Info size={16} />
            {loadingTip ? "..." : "Explain"}
            </button>
        </div>
      </div>

      {aiTip && (
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded text-indigo-800 text-sm animate-fadeIn">
          <strong>AI Tutor:</strong> {aiTip}
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded shadow-sm border border-slate-200">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Kernel</label>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setKernel(SOBEL_X)} className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded border">Vert. Edge</button>
            <button onClick={() => setKernel(SOBEL_Y)} className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded border">Horiz. Edge</button>
            <button onClick={() => setKernel(EDGE_DETECT)} className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded border">Outline</button>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Stride: {stride}</label>
          <input type="range" min="1" max="3" value={stride} onChange={(e) => { setStride(Number(e.target.value)); setAnimStep(0); }} className="w-full accent-indigo-600"/>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Padding: {padding}</label>
          <input type="range" min="0" max="2" value={padding} onChange={(e) => { setPadding(Number(e.target.value)); setAnimStep(0); }} className="w-full accent-indigo-600"/>
        </div>
        <div className="flex flex-col justify-end">
            <button onClick={() => { setAnimStep(0); setIsAnimating(false); }} className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-600">
                <RefreshCw size={12}/> Reset Animation
            </button>
        </div>
      </div>

      {/* Visualizer Area */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
        
        {/* Input */}
        <div className="relative">
            <div className="absolute -top-6 left-0 text-sm font-bold text-slate-600">Input Image</div>
            {/* Pseudo-padding visualization border */}
            <div 
              style={{ padding: padding * 30, backgroundColor: padding > 0 ? '#e2e8f0' : 'transparent', transition: 'padding 0.3s' }}
              className="border border-dashed border-slate-300 rounded"
            >
                <Heatmap 
                data={inputGrid} 
                cellSize={30}
                highlightRegion={highlightInput} 
                className="z-10 shadow-sm"
                />
            </div>
            {highlightInput && (
                <div className="absolute top-full left-0 mt-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-200 shadow-sm whitespace-nowrap z-20">
                    Receptive Field
                </div>
            )}
        </div>

        {/* Operation Symbol & Kernel */}
        <div className="flex flex-col items-center gap-4">
            <div className="text-slate-300 font-bold text-3xl">⊗</div>
            <div className="relative bg-white p-2 rounded shadow-sm border border-slate-200">
                 <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-1 text-xs text-slate-400">Kernel</div>
                 <Heatmap 
                    data={kernel} 
                    cellSize={24}
                    showValues={true}
                 />
            </div>
            <div className="text-slate-300 font-bold text-3xl">=</div>
        </div>

        {/* Output */}
        <div className="relative">
            <div className="absolute -top-6 left-0 text-sm font-bold text-slate-600">Feature Map</div>
            <Heatmap 
              data={outputGrid} 
              cellSize={30} 
              activeCell={activeOutputCell}
              onHoverCell={(r, c) => !isAnimating && setHoveredOutputCell(r === -1 ? null : {r, c})}
              className="shadow-sm"
            />
            
            {/* Dynamic Math Overlay */}
            {activeOutputCell && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 z-20">
                    {getCalculationDetails()}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ConvLab;