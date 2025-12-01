import React, { useState } from 'react';
import { Layers, Activity, GitGraph, BookOpen } from 'lucide-react';
import FullNetwork from './views/FullNetwork';
import ConvLab from './views/ConvLab';
import LinearLab from './views/LinearLab';

enum View {
  NETWORK = 'network',
  CONV_LAB = 'conv',
  LINEAR_LAB = 'linear',
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.NETWORK);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded text-white">
              <Layers size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">LeNet<span className="text-indigo-600">Lab</span></h1>
          </div>
          
          <nav className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
            <NavButton 
              active={currentView === View.NETWORK} 
              onClick={() => setCurrentView(View.NETWORK)}
              icon={<GitGraph size={16} />}
              label="Full Architecture"
            />
            <NavButton 
              active={currentView === View.CONV_LAB} 
              onClick={() => setCurrentView(View.CONV_LAB)}
              icon={<Activity size={16} />}
              label="Convolution Lab"
            />
            <NavButton 
              active={currentView === View.LINEAR_LAB} 
              onClick={() => setCurrentView(View.LINEAR_LAB)}
              icon={<BookOpen size={16} />}
              label="Flattening & Linear"
            />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full">
        {currentView === View.NETWORK && <FullNetwork />}
        {currentView === View.CONV_LAB && <ConvLab />}
        {currentView === View.LINEAR_LAB && <LinearLab />}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
         <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
            Interactive Computer Vision Education Tool
         </div>
      </footer>
    </div>
  );
};

const NavButton: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
      active 
        ? 'bg-white text-indigo-600 shadow-sm' 
        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default App;