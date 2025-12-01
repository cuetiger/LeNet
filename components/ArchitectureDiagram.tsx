import React from 'react';
import { LENET_LAYERS } from '../constants';

interface ArchitectureDiagramProps {
  activeLayerId: string;
}

const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({ activeLayerId }) => {
  // Simplified map of layer positions for SVG lines
  const layers = LENET_LAYERS.map((l, i) => ({
    ...l,
    x: i * 110 + 50, // simple spacing
    y: 60
  }));

  const activeIndex = LENET_LAYERS.findIndex(l => l.id === activeLayerId);

  return (
    <div className="w-full overflow-x-auto p-4 bg-slate-50 border-b border-slate-200">
      <div className="min-w-[900px] h-[140px] relative select-none">
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
           {/* Connecting Lines */}
           {layers.slice(0, layers.length - 1).map((layer, i) => {
              const next = layers[i+1];
              const isPassed = i < activeIndex;
              return (
                 <g key={i}>
                    <line 
                      x1={layer.x + 40} y1={layer.y} 
                      x2={next.x - 40} y2={next.y} 
                      stroke={isPassed ? "#4f46e5" : "#cbd5e1"} 
                      strokeWidth="2" 
                      markerEnd="url(#arrowhead)"
                      strokeDasharray={isPassed ? "0" : "5,5"}
                      className="transition-colors duration-500"
                    />
                    {isPassed && i === activeIndex - 1 && (
                        <circle r="4" fill="#4f46e5">
                            <animateMotion dur="0.5s" repeatCount="indefinite" path={`M${layer.x+40},${layer.y} L${next.x-40},${next.y}`} />
                        </circle>
                    )}
                 </g>
              )
           })}
           <defs>
             <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
               <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
             </marker>
           </defs>
        </svg>

        {/* Nodes */}
        {layers.map((layer, i) => {
           const isActive = layer.id === activeLayerId;
           const isPassed = i <= activeIndex;
           
           return (
             <div 
               key={layer.id}
               className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-500`}
               style={{ left: layer.x, top: layer.y }}
             >
                <div 
                  className={`
                    w-16 h-16 rounded-lg border-2 flex items-center justify-center shadow-sm z-10 bg-white
                    ${isActive ? 'border-indigo-600 ring-4 ring-indigo-100 scale-110' : isPassed ? 'border-indigo-400 text-indigo-700' : 'border-slate-300 text-slate-400'}
                  `}
                >
                    <div className="text-[10px] font-bold text-center leading-tight">
                        {layer.name.split(':')[0]}
                        <div className="text-[9px] font-normal mt-1 opacity-75">{layer.outputShape.split('x').length > 1 ? layer.outputShape : `${layer.outputShape} units`}</div>
                    </div>
                </div>
                {isActive && (
                    <div className="absolute top-20 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded whitespace-nowrap animate-bounce">
                        Processing...
                    </div>
                )}
             </div>
           );
        })}
      </div>
    </div>
  );
};

export default ArchitectureDiagram;