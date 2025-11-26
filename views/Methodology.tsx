
import React, { useState } from 'react';
import { LIBRARY_FRAMEWORKS } from '../data/library';
import { Framework } from '../types';
import { ArrowRight, Search, Cpu, Brain, Layers, Target, Grid2X2, Grid3X3, Trello, ArrowLeft, Sparkles, Lock } from 'lucide-react';
import { Button } from '../components/Button';

/**
 * @interface MethodologyProps
 * @property {(framework: Framework) => void} onViewDetails - Callback to view the details of a framework.
 * @property {() => void} onBack - Callback to navigate back.
 * @property {boolean} [showBackButton=true] - Whether to show the back button.
 * @property {() => void} [onLogin] - Optional callback to handle login actions.
 */
interface MethodologyProps {
  onViewDetails: (framework: Framework) => void;
  onBack: () => void;
  showBackButton?: boolean;
  onLogin?: () => void;
}

/**
 * Renders the Methodology library page, displaying a browsable and searchable list of frameworks.
 * This component can also serve as a landing page for guest users.
 *
 * @param {MethodologyProps} props - The props for the Methodology component.
 * @returns {React.ReactElement} The rendered methodology library page.
 */
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
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-[85vh] animate-fade-in-up">
      
      {/* GUEST LANDING HERO - Only shown when not logged in (implied by !showBackButton) */}
      {!showBackButton && (
        <div className="flex flex-col items-center text-center mb-20 pt-8 animate-fade-in-up">
          
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 bg-stone-100 rounded-full text-xs font-bold uppercase tracking-widest text-stone-500">
             <Brain size={14} />
             <span>The Science of Thinking</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif text-ink mb-6 leading-[1.1] tracking-tight max-w-4xl">
            Master your <br/>
            <span className="text-stone-400 italic">mental models.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto font-light mb-10 leading-relaxed">
            Browse our curated library of scientific frameworks below, or sign in to access the AI-powered workspace.
          </p>

          <div className="flex flex-col items-center gap-8">
             {onLogin && (
               <Button 
                 onClick={onLogin} 
                 className="px-10 py-4 text-lg rounded-full shadow-xl shadow-stone-200 hover:shadow-2xl hover:-translate-y-1 transition-all"
               >
                  Get Started <ArrowRight size={20} className="ml-2" />
               </Button>
             )}

             {/* AI Benefit Bar with Glow Effect */}
             <div className="relative group cursor-default max-w-md mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center gap-3 px-6 py-3 bg-white border border-stone-100 rounded-full shadow-sm">
                  <div className="flex-shrink-0 flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                  </div>
                  <div className="flex flex-col items-start text-left">
                     <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Member Benefit</span>
                     <span className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                       Unlocks AI Reasoning & Infinite Canvas
                     </span>
                  </div>
                  <Lock size={14} className="text-stone-300 ml-2" />
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Back Button for Logged In Users */}
      {showBackButton && (
        <button 
          onClick={onBack} 
          className="group flex items-center text-stone-400 hover:text-ink mb-8 transition-colors"
        >
          <div className="p-2 rounded-full group-hover:bg-stone-100 transition-colors mr-2">
             <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="font-medium text-sm">Back to Home</span>
        </button>
      )}

      {/* Library Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-stone-100 pb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif text-ink mb-2">Methodology Library</h2>
          <p className="text-stone-500">Curated thinking tools for structured problem solving.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search frameworks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-200 shadow-sm transition-shadow hover:shadow"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 custom-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-wide whitespace-nowrap transition-all duration-200 ${
              selectedCategory === cat 
                ? 'bg-ink text-white shadow-md' 
                : 'bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-800 border border-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFrameworks.map(fw => (
          <div 
            key={fw.id}
            onClick={() => onViewDetails(fw)}
            className="group bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-xl hover:border-stone-300 transition-all duration-300 cursor-pointer flex flex-col h-full transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-stone-50 rounded-lg text-stone-600 group-hover:bg-ink group-hover:text-white transition-colors">
                {getIconForCategory(fw.category)}
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-400 font-medium">
                 {getLayoutIcon(fw.layout)}
                 <span className="capitalize">{fw.layout.replace('_', ' ')}</span>
              </div>
            </div>
            
            <h3 className="text-xl font-serif text-ink mb-3 group-hover:text-stone-700">{fw.name}</h3>
            
            <div className="mb-4 bg-stone-50/50 p-3 rounded-lg border border-stone-100">
               <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Best Used For</span>
               <p className="text-xs text-stone-700 font-medium leading-relaxed">
                 {fw.relevance}
               </p>
            </div>

            <p className="text-sm text-stone-500 line-clamp-3 mb-6 flex-1 leading-relaxed border-t border-stone-50 pt-3">
              {fw.description}
            </p>
            
            <div className="pt-4 border-t border-stone-100 flex items-center text-sm font-semibold text-ink group-hover:translate-x-1 transition-transform">
              View Details <ArrowRight size={14} className="ml-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
