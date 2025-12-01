import React, { useState, useEffect, useRef } from 'react';
import DrawingPad from '../components/DrawingPad';
import Heatmap from '../components/Heatmap';
import ArchitectureDiagram from '../components/ArchitectureDiagram';
import { LENET_LAYERS, SOBEL_X, SOBEL_Y, EDGE_DETECT, BLUR } from '../constants';
import { convolve2d, maxPool2d, normalizeMatrix, createMatrix } from '../utils/mathUtils';
import { Play, Pause, FastForward, RotateCcw, ChevronRight } from 'lucide-react';

const FullNetwork: React.FC = () => {
  const [inputImage, setInputImage] = useState<number[][]>(createMatrix(28, 28, 0));
  const [activations, setActivations] = useState<Record<string, any>>({});
  
  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLayerId, setActiveLayerId] = useState<string>('input');
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms per step

  // Steps definition for the sequencer
  const steps = ['input', 'conv1', 'pool1', 'conv2', 'pool2', 'flatten', 'fc1', 'fc2', 'output'];

  // 1. Compute all activations upfront (simulated inference)
  useEffect(() => {
    // This runs whenever input changes to prep the "cache"
    const computeActivations = () => {
        const results: Record<string, any> = {};
        
        // Input
        results['input'] = [inputImage];

        // Conv1
        const c1_maps: number[][][] = [];
        const kernels1 = [SOBEL_X, SOBEL_Y, EDGE_DETECT, BLUR, SOBEL_X, EDGE_DETECT];
        for(let i=0; i<6; i++) {
           const out = convolve2d(inputImage, kernels1[i], 1, 0); 
           c1_maps.push(normalizeMatrix(out));
        }
        results['conv1'] = c1_maps;

        // Pool1
        const p1_maps = c1_maps.map(m => maxPool2d(m, 2, 2));
        results['pool1'] = p1_maps;

        // Conv2 (Simulation)
        const c2_maps: number[][][] = [];
        for(let i=0; i<16; i++) {
            const src = p1_maps[i % 6];
            const out = convolve2d(src, EDGE_DETECT, 1, 0);
            c2_maps.push(normalizeMatrix(out));
        }
        results['conv2'] = c2_maps;

        // Pool2
        const p2_maps = c2_maps.map(m => maxPool2d(m, 2, 2));
        results['pool2'] = p2_maps;

        // Flatten (Simulated)
        // Just for viz, we won't show 400 items, maybe a representative subset
        results['flatten'] = { length: 400 };

        // FC Layers (Simulated Values)
        // We generate random activations that look plausible (normalized 0-1)
        results['fc1'] = Array.from({length: 120}, () => Math.random());
        results['fc2'] = Array.from({length: 84}, () => Math.random());

        // Output (Softmax-ish)
        const raw = Array.from({length: 10}, () => Math.random());
        const sum = raw.reduce((a,b)=>a+b,0);
        results['output'] = raw.map(v => v/sum);

        setActivations(results);
    };
    
    computeActivations();
  }, [inputImage]);

  // 2. Playback Sequencer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
        timer = setInterval(() => {
            setActiveLayerId(current => {
                const idx = steps.indexOf(current);
                if (idx >= steps.length - 1) {
                    setIsPlaying(false);
                    return current;
                }
                return steps[idx + 1];
            });
        }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, steps]);

  const handleReset = () => {
      setIsPlaying(false);
      setActiveLayerId('input');
  };

  const handleStep = () => {
      setIsPlaying(false);
      setActiveLayerId(current => {
        const idx = steps.indexOf(current);
        if (idx >= steps.length - 1) return current;
        return steps[idx + 1];
      });
  };

  const handleJumpTo = (id: string) => {
      setIsPlaying(false);
      setActiveLayerId(id);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
       
       {/* Top: Architecture Diagram */}
       <div className="bg-white shadow-sm z-10">
           <ArchitectureDiagram activeLayerId={activeLayerId} />
           
           {/* Playback Controls Bar */}
           <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50/50 backdrop-blur">
               <div className="flex items-center gap-4">
                   <button 
                     onClick={() => setIsPlaying(!isPlaying)}
                     className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-sm transition-all ${isPlaying ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105'}`}
                   >
                       {isPlaying ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}
                       {isPlaying ? "Pause" : "Start Flow"}
                   </button>
                   
                   <button onClick={handleStep} className="p-2 hover:bg-slate-200 rounded-full text-slate-600" title="Step Forward">
                       <ChevronRight size={24} />
                   </button>

                   <button onClick={handleReset} className="p-2 hover:bg-slate-200 rounded-full text-slate-600" title="Reset">
                       <RotateCcw size={20} />
                   </button>
               </div>

               <div className="flex items-center gap-4 text-sm text-slate-500">
                   <span className="font-medium text-indigo-900">
                       Current Step: {LENET_LAYERS.find(l => l.id === activeLayerId)?.name}
                   </span>
                   <div className="h-4 w-[1px] bg-slate-300"></div>
                   <div className="flex items-center gap-2">
                       <span>Speed:</span>
                       <select 
                         value={playbackSpeed} 
                         onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                         className="bg-transparent border-none text-slate-700 font-semibold focus:ring-0 cursor-pointer"
                       >
                           <option value={2000}>Slow</option>
                           <option value={1000}>Normal</option>
                           <option value={500}>Fast</option>
                       </select>
                   </div>
               </div>
           </div>
       </div>

       {/* Main Content: Split View */}
       <div className="flex-1 flex overflow-hidden">
           
           {/* Left: Input & Config */}
           <div className="w-80 bg-white border-r border-slate-200 p-6 overflow-y-auto flex flex-col gap-6">
               <div>
                   <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">1. Input Image</h3>
                   <div className="flex justify-center bg-slate-900 rounded-lg p-2 shadow-inner">
                       <DrawingPad onImageChange={setInputImage} size={28} />
                   </div>
                   <p className="text-xs text-slate-400 mt-2 text-center">Draw a digit (0-9) above</p>
               </div>
               
               <div>
                   <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Network Navigation</h3>
                   <div className="space-y-1">
                       {LENET_LAYERS.map(layer => (
                           <button
                             key={layer.id}
                             onClick={() => handleJumpTo(layer.id)}
                             className={`w-full text-left px-3 py-2 text-xs rounded transition-colors flex justify-between items-center ${activeLayerId === layer.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}
                           >
                               <span>{layer.name.split(':')[0]}</span>
                               <span className="opacity-50 font-normal">{layer.outputShape}</span>
                           </button>
                       ))}
                   </div>
               </div>
           </div>

           {/* Center: Stage Visualization */}
           <div className="flex-1 bg-slate-100 p-8 overflow-y-auto flex items-center justify-center">
               <StageVisualizer 
                 layerId={activeLayerId} 
                 data={activations[activeLayerId] || (activeLayerId === 'input' ? [inputImage] : null)} 
               />
           </div>

           {/* Right: Info Panel */}
           <div className="w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto">
               <InfoPanel layerId={activeLayerId} data={activations['output']} />
           </div>

       </div>
    </div>
  );
};

// Sub-components for cleaner file

const StageVisualizer: React.FC<{layerId: string, data: any}> = ({ layerId, data }) => {
    if (!data) return <div className="text-slate-400">Processing...</div>;

    // Transition effect container
    const containerClass = "animate-fadeIn flex flex-col items-center gap-4";

    if (layerId === 'input') {
        return (
            <div className={containerClass}>
                <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
                    <Heatmap data={data[0]} cellSize={14} title="Input (28x28)" />
                </div>
            </div>
        );
    }

    if (['conv1', 'pool1', 'conv2', 'pool2'].includes(layerId)) {
        const maps = data as number[][][];
        const isSmall = layerId.includes('2');
        return (
            <div className={`${containerClass} max-w-4xl`}>
                <h2 className="text-xl font-bold text-slate-700 mb-4">{maps.length} Feature Maps</h2>
                <div className="flex flex-wrap justify-center gap-4">
                    {maps.map((map, i) => (
                        <div key={i} className="bg-white p-2 rounded shadow-sm hover:scale-105 transition-transform">
                            <Heatmap data={map} cellSize={isSmall ? 20 : 8} title={`Map ${i+1}`} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (layerId === 'flatten') {
        return (
            <div className={containerClass}>
                 <div className="flex flex-col items-center">
                     <div className="text-6xl text-slate-300 mb-4">⬇</div>
                     <div className="w-16 h-[400px] bg-gradient-to-b from-indigo-500 to-purple-600 rounded shadow-lg flex items-center justify-center text-white font-bold tracking-widest vertical-text">
                        VECTOR
                     </div>
                     <div className="mt-4 font-mono text-sm text-slate-500">Size: 400x1</div>
                 </div>
            </div>
        );
    }

    if (layerId === 'fc1' || layerId === 'fc2') {
         const nodes = data as number[];
         // Visualize as a column of neurons (limited count)
         const displayNodes = nodes.slice(0, 20); // Show first 20
         return (
             <div className={containerClass}>
                 <div className="flex flex-col gap-2 p-4 bg-white rounded-xl shadow-lg border border-slate-200">
                     {displayNodes.map((val, i) => (
                         <div key={i} className="flex items-center gap-2">
                             <div 
                               className="w-4 h-4 rounded-full border border-slate-300 transition-colors duration-300"
                               style={{ backgroundColor: `rgba(79, 70, 229, ${val})` }}
                             />
                             <div className="h-1 w-32 bg-slate-100 rounded overflow-hidden">
                                 <div className="h-full bg-indigo-500" style={{ width: `${val*100}%` }}></div>
                             </div>
                         </div>
                     ))}
                     <div className="text-center text-xs text-slate-400 mt-2">... {nodes.length - 20} more neurons</div>
                 </div>
             </div>
         )
    }

    if (layerId === 'output') {
        const nodes = data as number[];
        return (
            <div className={containerClass}>
                <div className="flex gap-4 items-end h-64">
                    {nodes.map((val, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 group">
                            <div className="text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">{(val*100).toFixed(0)}%</div>
                            <div className="w-8 bg-slate-200 rounded-t-md relative overflow-hidden h-48 flex items-end">
                                <div 
                                  className="w-full bg-indigo-600 transition-all duration-700 ease-out" 
                                  style={{ height: `${val * 100}%` }}
                                />
                            </div>
                            <div className="font-bold text-slate-800 text-lg border-t pt-2 w-full text-center">{i}</div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return null;
};

const InfoPanel: React.FC<{layerId: string, data: any}> = ({ layerId, data }) => {
    const layerInfo = LENET_LAYERS.find(l => l.id === layerId);
    
    // Find the winner if output
    let winner = -1;
    if (layerId === 'output' && data) {
        winner = (data as number[]).indexOf(Math.max(...(data as number[])));
    }

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-xl font-bold text-slate-800 mb-2">{layerInfo?.name}</h2>
            <div className="text-sm font-mono text-indigo-600 bg-indigo-50 p-2 rounded mb-4 inline-block self-start">
                Shape: {layerInfo?.outputShape}
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {layerInfo?.description}
            </p>

            {layerId === 'output' && winner !== -1 && (
                <div className="mt-auto bg-green-50 border border-green-200 p-4 rounded-xl text-center animate-bounce">
                    <div className="text-sm text-green-700 uppercase font-bold tracking-wider mb-1">Prediction</div>
                    <div className="text-5xl font-black text-green-600">{winner}</div>
                </div>
            )}
            
            {layerId === 'flatten' && (
                <div className="mt-4 bg-yellow-50 p-4 rounded border border-yellow-200 text-sm text-yellow-800">
                    <strong>Concept:</strong> Flattening destroys spatial information (up/down/left/right relationships) to allow the subsequent "Dense" layers to combine features globally.
                </div>
            )}
        </div>
    );
};

export default FullNetwork;