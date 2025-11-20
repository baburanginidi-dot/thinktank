import React, { useState } from 'react';
import { LIBRARY_FRAMEWORKS } from '../data/library';
import { Framework } from '../types';
import { ArrowRight, Search, Cpu, Brain, Layers, Target, Grid2X2, Grid3X3, Trello, X, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';

interface MethodologyProps {
  onSelectFramework: (framework: Framework) => void;
  onBack: () => void;
}

export const Methodology: React.FC<MethodologyProps> = ({ onSelectFramework, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFramework, setActiveFramework] = useState<Framework | null>(null);

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
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-[85vh]">
      
      <button 
        onClick={onBack} 
        className="group flex items-center text-stone-400 hover:text-ink mb-8 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Home</span>
      </button>

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-serif text-ink mb-2">Methodology Library</h2>
          <p className="text-stone-500">Curated thinking tools for structured problem solving.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search frameworks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat 
                ? 'bg-ink text-white' 
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
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
            onClick={() => setActiveFramework(fw)}
            className="group bg-white border border-stone-200 rounded-xl p-6 hover:shadow-lg hover:border-stone-300 transition-all cursor-pointer flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-stone-50 rounded text-stone-600 group-hover:bg-ink group-hover:text-white transition-colors">
                {getIconForCategory(fw.category)}
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                 {getLayoutIcon(fw.layout)}
                 <span className="capitalize">{fw.layout.replace('_', ' ')}</span>
              </div>
            </div>
            
            <h3 className="text-xl font-serif text-ink mb-2 group-hover:text-stone-700">{fw.name}</h3>
            <p className="text-sm text-stone-500 line-clamp-3 mb-4 flex-1">{fw.description}</p>
            
            <div className="pt-4 border-t border-stone-100 flex items-center text-sm font-medium text-ink group-hover:translate-x-1 transition-transform">
              View Details <ArrowRight size={14} className="ml-2" />
            </div>
          </div>
        ))}
      </div>

      {/* Slide-over Modal for Details */}
      {activeFramework && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setActiveFramework(null)} />
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl p-8 overflow-y-auto flex flex-col animate-slide-in-right">
            <button 
              onClick={() => setActiveFramework(null)}
              className="absolute top-6 right-6 p-2 hover:bg-stone-100 rounded-full"
            >
              <X size={20} className="text-stone-500" />
            </button>

            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wider mb-4">
                {getIconForCategory(activeFramework.category)}
                {activeFramework.category}
              </div>
              <h2 className="text-4xl font-serif text-ink mb-4">{activeFramework.name}</h2>
              <p className="text-lg text-stone-600 leading-relaxed">{activeFramework.description}</p>
            </div>

            <div className="mb-8 p-4 bg-stone-50 rounded-lg border border-stone-100">
              <h4 className="text-sm font-bold text-ink uppercase mb-2">Best Used For</h4>
              <p className="text-sm text-stone-600 italic">"{activeFramework.relevance}"</p>
            </div>

            <div className="mb-8">
              <h4 className="text-sm font-bold text-stone-400 uppercase mb-4">Framework Steps</h4>
              <div className="space-y-3">
                {activeFramework.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-200 text-stone-600 text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-stone-700 text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-stone-100">
              <Button 
                onClick={() => onSelectFramework(activeFramework)}
                className="w-full justify-center text-base"
              >
                Use Template
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <p className="text-xs text-center text-stone-400 mt-3">
                Creates a new session with this structure.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};