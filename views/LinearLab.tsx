import React, { useState } from 'react';
import { ArrowDown, ArrowRight, Play, RefreshCw } from 'lucide-react';

const LinearLab: React.FC = () => {
  // Demo Data: 5x5 feature map
  const size = 5;
  const total = size * size;
  const [isFlattened, setIsFlattened] = useState(false);
  
  // Create some dummy feature data
  const data = Array.from({length: total}, (_, i) => {
     const r = Math.floor(i/size);
     const c = i%size;
     // Pattern
     const val = (Math.sin(r) * Math.cos(c) + 1) / 2;
     return { id: i, r, c, val };
  });

  const cellSize = 30;
  const gap = 4;

  const toggleFlatten = () => {
      setIsFlattened(!isFlattened);
  };

  const getColor = (value: number) => {
    const intensity = value;
    const r = Math.floor(255 - (255 - 59) * intensity);
    const g = Math.floor(255 - (255 - 130) * intensity);
    const b = Math.floor(255 - (255 - 246) * intensity);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="flex flex-col gap-8 p-6 animate-fadeIn max-w-4xl mx-auto">
       <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Flattening & Linear Layers</h2>
            <p className="text-slate-500">Visualize the critical transition from 2D spatial maps to 1D vectors.</p>
          </div>
          <button 
             onClick={toggleFlatten}
             className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition-all active:scale-95"
          >
             {isFlattened ? <RefreshCw size={18}/> : <Play size={18}/>}
             {isFlattened ? "Reset View" : "Animate Flatten"}
          </button>
       </div>

       <div className="flex flex-col items-center justify-center bg-slate-50 p-12 rounded-xl border border-slate-200 min-h-[400px]">
          
          <div className="relative w-full max-w-3xl h-[300px] flex items-center justify-center">
             
             {/* Container for the animated cells */}
             {/* We center the '2D' view and '1D' view using absolute positioning math */}
             <div className="relative" style={{ width: size * (cellSize+gap), height: size * (cellSize+gap) }}>
                {data.map((item, i) => {
                   // Calculate 2D Position
                   const x2d = item.c * (cellSize + gap);
                   const y2d = item.r * (cellSize + gap);
                   
                   // Calculate 1D Position (Unrolled horizontally for demo, wrapped if too long)
                   // Let's unroll into a single long line, but scale it down or wrap it if needed.
                   // For visual clarity, let's unroll into a single row if space permits, or 2 rows.
                   // Let's do a single row but spread out widely to show the "vector" concept.
                   // Actually, vertical vector is standard in diagrams, horizontal in memory. 
                   // Let's do Horizontal Vector at the bottom.
                   
                   // Target position relative to the CENTER of the container?
                   // Let's just use absolute offsets from the top-left of this relative container.
                   // But we want the 1D vector to be somewhere else. 
                   // Let's adjust the transform logic.
                   
                   const x1d = i * (cellSize + 2); // Tighter packing in 1D
                   const y1d = 200; // Shift down by 200px
                   
                   const style = {
                       transform: isFlattened 
                         ? `translate(${x1d - (total*(cellSize+2))/2 + (size*(cellSize+gap))/2}px, ${y1d}px)` 
                         : `translate(${x2d}px, ${y2d}px)`,
                       backgroundColor: getColor(item.val),
                       width: cellSize,
                       height: cellSize,
                   };

                   return (
                       <div 
                         key={item.id}
                         className="absolute flex items-center justify-center text-[10px] text-white/80 font-mono rounded-sm shadow-sm transition-all duration-1000 ease-in-out border border-white/20"
                         style={style}
                       >
                          {i}
                       </div>
                   );
                })}
             </div>

             {/* Labels */}
             <div className={`absolute transition-opacity duration-500 ${isFlattened ? 'opacity-0' : 'opacity-100'}`} style={{ top: -30 }}>
                 <span className="font-bold text-slate-600">Feature Map (5x5)</span>
             </div>
             
             <div className={`absolute transition-opacity duration-500 ${isFlattened ? 'opacity-100' : 'opacity-0'}`} style={{ bottom: -40 }}>
                 <span className="font-bold text-slate-600">Flattened Vector (1x25)</span>
             </div>
             
             {/* Arrow Indicator */}
             <div className={`absolute transition-opacity duration-500 delay-500 text-indigo-400 ${isFlattened ? 'opacity-100' : 'opacity-0'}`} style={{ top: 130 }}>
                 <ArrowDown size={32} />
             </div>

          </div>

          <div className="mt-8 max-w-lg text-center text-sm text-slate-600 bg-white p-4 rounded border border-slate-200 shadow-sm">
              {isFlattened 
                ? "The spatial structure is lost, but all pixel values are preserved in a specific order (usually row-by-row). This vector is now ready to be multiplied by the weight matrix of the Fully Connected layer."
                : "A Pooling layer outputs a 3D volume (visualized here as a single 2D slice). To perform classification, we must convert this grid into a simple list of numbers."}
          </div>

       </div>
    </div>
  );
};

export default LinearLab;