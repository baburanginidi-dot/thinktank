import React from 'react';
import { Framework } from '../types';
import { ArrowRight, Layers, Cpu, Brain, Target, Grid2X2, Trello, Grid3X3, ArrowLeft } from 'lucide-react';

/**
 * Props for the FrameworkSelection component.
 */
interface FrameworkSelectionProps {
  /** List of suggested frameworks to display. */
  frameworks: Framework[];
  /** Callback when a framework is selected. */
  onSelect: (framework: Framework) => void;
  /** Callback to go back to the previous screen. */
  onBack: () => void;
  /** The original problem text for context. */
  problem: string;
}

/**
 * Returns the appropriate icon based on the framework category.
 * @param {string} category - The category of the framework.
 * @returns {JSX.Element} The Lucide icon component.
 */
const getIconForCategory = (category: string) => {
  switch (category) {
    case 'Technical': return <Cpu size={20} />;
    case 'Mental Model': return <Brain size={20} />;
    case 'Product': return <Layers size={20} />;
    case 'Strategic': return <Target size={20} />;
    default: return <Layers size={20} />;
  }
};

/**
 * Returns the appropriate icon based on the framework layout.
 * @param {string} layout - The layout type of the framework.
 * @returns {JSX.Element} The Lucide icon component.
 */
const getLayoutIcon = (layout: string) => {
  switch(layout) {
    case 'matrix_2x2': return <Grid2X2 size={14} className="mr-1" />;
    case 'six_hats': return <Grid3X3 size={14} className="mr-1" />;
    default: return <Trello size={14} className="mr-1" />;
  }
};

/**
 * View for selecting a framework from a list of AI-suggested options.
 *
 * @param {FrameworkSelectionProps} props - The props for the view.
 * @returns {JSX.Element} The rendered framework selection view.
 */
export const FrameworkSelection: React.FC<FrameworkSelectionProps> = ({ frameworks, onSelect, onBack, problem }) => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in-up">
      
      <button 
        onClick={onBack} 
        className="group flex items-center text-stone-400 hover:text-ink mb-8 transition-colors"
      >
        <div className="p-2 rounded-full group-hover:bg-stone-100 transition-colors mr-2">
           <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </div>
        <span className="font-medium text-sm">Back to Problem</span>
      </button>

      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-serif text-ink mb-4 leading-tight">Suggested Frameworks</h2>
        <p className="text-stone-500 text-lg">
          We analyzed <span className="italic font-medium text-stone-800">"{problem}"</span> and curated these models for you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {frameworks.map((fw) => (
          <div 
            key={fw.id}
            className="group relative bg-white border border-stone-200 rounded-2xl p-8 hover:shadow-2xl hover:border-stone-300 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
            onClick={() => onSelect(fw)}
          >
            {/* Top Decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stone-200 to-transparent group-hover:from-ink group-hover:to-stone-500 transition-all duration-500" />

            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-stone-50 rounded-xl text-stone-700 group-hover:bg-ink group-hover:text-white transition-colors duration-300 shadow-sm">
                  {getIconForCategory(fw.category)}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase border border-stone-100 px-2 py-1 rounded bg-stone-50/50">
                    {fw.category}
                  </span>
                  <div className="flex items-center text-[10px] text-stone-400 font-medium tracking-wide">
                    {getLayoutIcon(fw.layout)} 
                    <span className="capitalize">{fw.layout?.replace('_', ' ') || 'Linear'}</span>
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-serif text-ink mb-3 group-hover:text-stone-700 leading-tight">
                {fw.name}
              </h3>
              <p className="text-stone-600 mb-8 leading-relaxed text-sm">
                {fw.description}
              </p>
              
              <div className="bg-stone-50/80 p-5 rounded-xl border border-stone-100 mb-8 relative">
                <div className="absolute top-0 left-4 -translate-y-1/2 bg-white px-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  AI Insight
                </div>
                <p className="text-sm text-stone-800 italic leading-relaxed">"{fw.relevance}"</p>
              </div>

              <div className="mb-8">
                <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest mb-3">Workflow</p>
                <div className="flex flex-wrap gap-2">
                  {fw.steps.slice(0, 4).map((step, idx) => (
                     <span key={idx} className="text-xs bg-white border border-stone-200 px-3 py-1.5 rounded-md text-stone-600 shadow-sm">
                       <span className="font-bold text-stone-300 mr-1">{idx + 1}.</span> {step}
                     </span>
                  ))}
                  {fw.steps.length > 4 && (
                    <span className="text-xs text-stone-400 py-1.5 px-2">+{fw.steps.length - 4} more</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center text-ink font-medium text-sm group-hover:translate-x-2 transition-transform duration-300 pt-6 border-t border-stone-100">
              Select Framework <ArrowRight size={16} className="ml-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
