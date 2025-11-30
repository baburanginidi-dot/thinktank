
import React, { useState } from 'react';
import { LIBRARY_FRAMEWORKS } from '../data/library';
import { Framework } from '../types';
import { ArrowRight, Search, Cpu, Brain, Layers, Target, Grid2X2, Grid3X3, Trello, ArrowLeft, Sparkles, Lock } from 'lucide-react';
import { Button } from '../components/Button';

interface MethodologyProps {
  onViewDetails: (framework: Framework) => void;
  onBack: () => void;
  showBackButton?: boolean;
  onLogin?: () => void;
}

export const Methodology: React.FC<MethodologyProps> = ({ onViewDetails, onBack, showBackButton = true, onLogin }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Mental Model', 'Product', 'Strategic', 'Technical'];

  const filteredFrameworks = LIBRARY_FRAMEWORKS.filter(fw => {
    const matchesCategory = selectedCategory === 'All' || fw.category === selectedCategory;
    const matchesSearch = fw.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          fw.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'Technical': return <Cpu size={18} />;
      case 'Mental Model': return <Brain size={18} />;
      case 'Product': return <Layers size={18} />;
      case 'Strategic': return <Target size={18} />;
      default: return <Layers size={18} />;
    }
  };

  const getLayoutIcon = (layout: string) => {
    switch(layout) {
      case 'matrix_2x2': return <Grid2X2 size={14} />;
      case 'six_hats': return <Grid3X3 size={14} />;
      default: return <Trello size={14} />;
    }
  };

  return (
    <div className="w-full px-4 py-6 min-h-[85vh] animate-fade-in-up pb-safe overflow-x-hidden">
      
      {/* GUEST LANDING HERO */}
      {!showBackButton && (
        <div className="flex flex-col items-center text-center mb-12 pt-4 animate-fade-in-up">
          
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 bg-stone-100 rounded-full text-xs font-bold uppercase tracking-widest text-stone-500">
             <Brain size={14} />
             <span>The Science of Thinking</span>
          </div>

          <h1 className="text-4xl font-serif text-ink mb-6 leading-[1.15] tracking-tight max-w-sm mx-auto">
            Master your <br/>
            <span className="text-stone-400 italic">mental models.</span>
          </h1>
          
          <p className="text-base text-stone-600 max-w-xs mx-auto font-light mb-8 leading-relaxed px-2">
            Browse our curated library of scientific frameworks below, or sign in to access the AI-powered workspace.
          </p>

          <div className="flex flex-col items-center gap-6 w-full">
             {onLogin && (
               <Button 
                 onClick={onLogin} 
                 className="w-full px-8 py-4 text-base rounded-xl shadow-xl shadow-stone-200 justify-center"
               >
                  Get Started <ArrowRight size={20} className="ml-2" />
               </Button>
             )}

             {/* AI Benefit Bar */}
             <div className="relative group cursor-default w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center justify-center gap-3 px-4 py-3 bg-white border border-stone-100 rounded-xl shadow-sm">
                  <div className="flex-shrink-0 flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                  </div>
                  <div className="flex flex-col items-start text-left">
                     <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Member Benefit</span>
                     <span className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 leading-tight">
                       Unlocks AI Reasoning
                     </span>
                  </div>
                  <Lock size={14} className="text-stone-300 ml-auto" />
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      {showBackButton && (
        <button 
          onClick={onBack} 
          className="group flex items-center text-stone-400 hover:text-ink mb-6 transition-colors p-2 -ml-2"
        >
          <div className="p-1 rounded-full group-hover:bg-stone-100 transition-colors mr-2">
             <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="font-medium text-sm">Back to Home</span>
        </button>
      )}

      {/* Library Header & Search */}
      <div className="flex flex-col gap-6 mb-8 border-b border-stone-100 pb-8">
        <div>
          <h2 className="text-3xl font-serif text-ink mb-2">Methodology Library</h2>
          <p className="text-stone-500 text-sm">Curated thinking tools for structured problem solving.</p>
        </div>
        
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input 
            type="text" 
            placeholder="Search frameworks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-200 shadow-sm transition-shadow hover:shadow text-base appearance-none"
          />
        </div>
      </div>

      {/* Tabs - Scrollable */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-4 custom-scrollbar -mx-4 px-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-3 rounded-full text-sm font-bold tracking-wide whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
              selectedCategory === cat 
                ? 'bg-ink text-white shadow-md' 
                : 'bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-800 border border-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Mobile Stacked List */}
      <div className="flex flex-col gap-4 pb-8">
        {filteredFrameworks.map(fw => (
          <div 
            key={fw.id}
            onClick={() => onViewDetails(fw)}
            className="group bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-xl hover:border-stone-300 transition-all duration-300 cursor-pointer flex flex-col active:scale-[0.98]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-stone-50 rounded-lg text-stone-600">
                {getIconForCategory(fw.category)}
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-400 font-medium">
                 {getLayoutIcon(fw.layout)}
                 <span className="capitalize">{fw.layout.replace('_', ' ')}</span>
              </div>
            </div>
            
            <h3 className="text-xl font-serif text-ink mb-3">{fw.name}</h3>
            
            <div className="mb-4 bg-stone-50/50 p-3 rounded-lg border border-stone-100">
               <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Best Used For</span>
               <p className="text-xs text-stone-700 font-medium leading-relaxed">
                 {fw.relevance}
               </p>
            </div>

            <p className="text-sm text-stone-500 line-clamp-3 mb-4 leading-relaxed border-t border-stone-50 pt-3">
              {fw.description}
            </p>
            
            <div className="pt-4 border-t border-stone-100 flex items-center text-sm font-semibold text-ink mt-auto">
              View Details <ArrowRight size={16} className="ml-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
