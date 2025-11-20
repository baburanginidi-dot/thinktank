import React from 'react';
import { Framework } from '../types';
import { ArrowRight, Layers, Cpu, Brain, Target, Grid2X2, Trello, Grid3X3, ArrowLeft } from 'lucide-react';

interface FrameworkSelectionProps {
  frameworks: Framework[];
  onSelect: (framework: Framework) => void;
  onBack: () => void;
  problem: string;
}

const getIconForCategory = (category: string) => {
  switch (category) {
    case 'Technical': return <Cpu size={20} />;
    case 'Mental Model': return <Brain size={20} />;
    case 'Product': return <Layers size={20} />;
    case 'Strategic': return <Target size={20} />;
    default: return <Layers size={20} />;
  }
};

const getLayoutIcon = (layout: string) => {
  switch(layout) {
    case 'matrix_2x2': return <Grid2X2 size={14} className="mr-1" />;
    case 'six_hats': return <Grid3X3 size={14} className="mr-1" />;
    default: return <Trello size={14} className="mr-1" />;
  }
};

export const FrameworkSelection: React.FC<FrameworkSelectionProps> = ({ frameworks, onSelect, onBack, problem }) => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      
      <button 
        onClick={onBack} 
        className="group flex items-center text-stone-400 hover:text-ink mb-8 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Problem</span>
      </button>

      <div className="mb-12 text-center">
        <h2 className="text-3xl font-serif text-ink mb-4">Suggested Frameworks</h2>
        <p className="text-stone-500">Based on: <span className="italic text-stone-800">"{problem}"</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {frameworks.map((fw) => (
          <div 
            key={fw.id}
            className="group bg-white border border-stone-200 rounded-xl p-8 hover:shadow-xl hover:border-stone-300 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            onClick={() => onSelect(fw)}
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-stone-50 rounded-lg text-stone-700 group-hover:bg-ink group-hover:text-white transition-colors duration-300">
                  {getIconForCategory(fw.category)}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs font-bold tracking-wider text-stone-400 uppercase border border-stone-100 px-2 py-1 rounded">
                    {fw.category}
                  </span>
                  <div className="flex items-center text-xs text-stone-400" title={`Visual Layout: ${fw.layout}`}>
                    {getLayoutIcon(fw.layout)} 
                    <span className="capitalize">{fw.layout?.replace('_', ' ') || 'Linear'}</span>
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-serif text-ink mb-3 group-hover:text-stone-700">
                {fw.name}
              </h3>
              <p className="text-stone-600 mb-6 leading-relaxed">
                {fw.description}
              </p>
              
              <div className="bg-stone-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-stone-500 font-medium mb-1">Why this fits:</p>
                <p className="text-sm text-stone-800 italic">"{fw.relevance}"</p>
              </div>

              <div className="mb-6">
                <p className="text-xs font-bold text-stone-400 uppercase mb-3">Process Steps</p>
                <div className="flex flex-wrap gap-2">
                  {fw.steps.slice(0, 4).map((step, idx) => (
                     <span key={idx} className="text-xs bg-white border border-stone-200 px-2 py-1 rounded text-stone-600">
                       {idx + 1}. {step}
                     </span>
                  ))}
                  {fw.steps.length > 4 && (
                    <span className="text-xs text-stone-400 py-1 px-1">+{fw.steps.length - 4} more</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center text-ink font-medium group-hover:translate-x-2 transition-transform duration-300 mt-4">
              Start Session <ArrowRight size={16} className="ml-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};