import React from 'react';
import { Framework } from '../types';
import { ArrowLeft, ArrowRight, Cpu, Brain, Layers, Target, Grid2X2, Grid3X3, Trello } from 'lucide-react';
import { Button } from '../components/Button';

interface MethodologyDetailProps {
  framework: Framework;
  onUseTemplate: (framework: Framework) => void;
  onBack: () => void;
}

export const MethodologyDetail: React.FC<MethodologyDetailProps> = ({ framework, onUseTemplate, onBack }) => {
  
  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'Technical': return <Cpu size={24} />;
      case 'Mental Model': return <Brain size={24} />;
      case 'Product': return <Layers size={24} />;
      case 'Strategic': return <Target size={24} />;
      default: return <Layers size={24} />;
    }
  };

  const getLayoutIcon = (layout: string) => {
    switch(layout) {
      case 'matrix_2x2': return <Grid2X2 size={16} className="mr-2" />;
      case 'six_hats': return <Grid3X3 size={16} className="mr-2" />;
      default: return <Trello size={16} className="mr-2" />;
    }
  };

  return (
    <div className="w-full px-4 md:px-12 lg:px-20 py-6 md:py-12 min-h-[85vh] animate-fade-in-up pb-safe max-w-7xl mx-auto">
      
      {/* Navigation */}
      <button 
        onClick={onBack} 
        className="group flex items-center text-stone-400 hover:text-ink mb-8 transition-colors p-2 -ml-2"
      >
        <div className="p-1 rounded-full group-hover:bg-stone-100 transition-colors mr-2">
           <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </div>
        <span className="font-medium text-sm">Back to Library</span>
      </button>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-16 border-b border-stone-200 pb-16">
        
        {/* Left Column: Hero Content */}
        <div className="w-full lg:w-2/3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wider mb-6">
            {getIconForCategory(framework.category)}
            {framework.category}
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-ink mb-6 leading-tight">
            {framework.name}
          </h1>
          
          <p className="text-lg md:text-xl text-stone-600 leading-relaxed font-light mb-10 max-w-2xl">
            {framework.description}
          </p>

          <Button onClick={() => onUseTemplate(framework)} className="w-full md:w-auto px-8 py-4 text-base justify-center rounded-xl">
            Use This Template <ArrowRight size={20} className="ml-2" />
          </Button>
        </div>

        {/* Right Column: Sidebar Info */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 h-full">
             <div className="mb-8">
               <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Best Used For</h4>
               <p className="text-base text-stone-800 font-medium italic leading-relaxed">
                 "{framework.relevance}"
               </p>
             </div>
             
             <div>
               <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Workspace Layout</h4>
               <div className="flex items-center text-sm font-semibold text-stone-700 bg-white border border-stone-200 rounded-lg p-4">
                 {getLayoutIcon(framework.layout)}
                 <span className="capitalize">{framework.layout.replace('_', ' ')}</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="w-full">
        <h2 className="text-3xl font-serif text-ink mb-8">How it works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {framework.steps.map((step, idx) => (
            <div key={idx} className="relative group bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all">
              
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 text-stone-500 font-bold text-sm mb-4 group-hover:bg-ink group-hover:text-white transition-colors">
                {idx + 1}
              </div>
              
              <h3 className="font-bold text-stone-800 text-lg mb-2">{step}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                 Step {idx + 1} of the {framework.name} process.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-20 pt-10 border-t border-stone-200 flex flex-col items-center gap-6 text-center">
        <div className="text-stone-400 text-sm uppercase tracking-widest font-bold">
          Ready to apply this framework?
        </div>
        <Button onClick={() => onUseTemplate(framework)} variant="secondary" className="w-full md:w-auto px-12 py-3">
          Start Session
        </Button>
      </div>
    </div>
  );
};