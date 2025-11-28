import React from 'react';
import { Framework } from '../types';
import { ArrowLeft, ArrowRight, CheckCircle, Brain, Cpu, Layers, Target, Grid2X2, Grid3X3, Trello } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto px-6 py-12 min-h-[85vh] animate-fade-in-up">
      
      {/* Navigation */}
      <button 
        onClick={onBack} 
        className="group flex items-center text-stone-400 hover:text-ink mb-12 transition-colors"
      >
        <div className="p-2 rounded-full group-hover:bg-stone-100 transition-colors mr-2">
           <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </div>
        <span className="font-medium text-sm">Back to Library</span>
      </button>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-12 items-start mb-20 border-b border-stone-200 pb-16">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wider mb-6">
            {getIconForCategory(framework.category)}
            {framework.category}
          </div>
          
          <h1 className="text-5xl md:text-6xl font-serif text-ink mb-6 leading-tight">
            {framework.name}
          </h1>
          
          <p className="text-xl text-stone-600 leading-relaxed font-light mb-8 max-w-2xl">
            {framework.description}
          </p>

          <div className="flex items-center gap-4">
             <Button onClick={() => onUseTemplate(framework)} className="px-8 py-4 text-lg">
                Use This Template <ArrowRight size={20} className="ml-2" />
             </Button>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-full md:w-80 bg-stone-50 rounded-2xl p-8 border border-stone-100">
           <div className="mb-6">
             <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Best Used For</h4>
             <p className="text-sm text-stone-800 font-medium italic leading-relaxed">
               "{framework.relevance}"
             </p>
           </div>
           
           <div>
             <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Workspace Layout</h4>
             <div className="flex items-center text-sm font-semibold text-stone-700 bg-white border border-stone-200 rounded-lg p-3">
               {getLayoutIcon(framework.layout)}
               <span className="capitalize">{framework.layout.replace('_', ' ')}</span>
             </div>
           </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="max-w-3xl">
        <h2 className="text-3xl font-serif text-ink mb-8">How it works</h2>
        
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-200 before:to-transparent">
          {framework.steps.map((step, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              {/* Icon / Number */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-stone-200 text-stone-500 font-bold text-sm shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 group-hover:bg-ink group-hover:text-white transition-colors">
                {idx + 1}
              </div>
              
              {/* Content Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl border border-stone-100 shadow-sm group-hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-stone-800 text-lg">{step}</h3>
                  <CheckCircle size={16} className="text-stone-300" />
                </div>
                <p className="text-stone-500 text-sm">
                   Step {idx + 1} of the {framework.name} process.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-20 pt-10 border-t border-stone-200 flex justify-between items-center">
        <div className="text-stone-400 text-sm">
          Ready to apply this framework to your problem?
        </div>
        <Button onClick={() => onUseTemplate(framework)} variant="secondary">
          Start Session
        </Button>
      </div>
    </div>
  );
};