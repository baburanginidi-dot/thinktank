import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';

interface HomeProps {
  onSubmit: (problem: string) => void;
  isLoading: boolean;
  initialInput?: string;
}

export const Home: React.FC<HomeProps> = ({ onSubmit, isLoading, initialInput }) => {
  const [input, setInput] = useState(initialInput || '');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input);
    }
  };

  return (
    <main className="flex flex-col items-center w-full min-h-[calc(100vh-65px)] md:min-h-[85vh] px-4 md:px-8 pt-6 md:pt-20 pb-6 max-w-[420px] md:max-w-4xl mx-auto md:justify-center transition-all duration-500">
      
      {/* Content Section */}
      <div className="w-full text-center flex flex-col justify-center flex-1 md:flex-none space-y-4 md:space-y-6 mb-8 animate-fade-in-up">
        
        {/* Mobile Layout: Compact Headline */}
        <h1 className="text-[32px] leading-[1.2] md:text-7xl font-serif font-medium text-ink md:leading-[1.1] tracking-tight">
          Structure your chaos.<br />
          <span className="text-stone-400 italic">Solve with science.</span>
        </h1>
        
        <p className="text-[16px] leading-relaxed md:text-xl text-stone-600 max-w-xl mx-auto font-light">
          Enter a problem statement. We’ll surface the right frameworks to move you from chaos to clarity.
        </p>
      </div>

      {/* Input Section - Natural Flow Bottom Placement */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl relative group mt-auto md:mt-12">
        {/* Desktop Glow Effect */}
        <div className={`hidden md:block absolute -inset-1 bg-gradient-to-r from-stone-200 to-stone-300 rounded-xl blur opacity-25 transition duration-500 ${isFocused ? 'opacity-75' : 'group-hover:opacity-50'}`}></div>
        
        <div className="relative flex flex-col md:block">
          {/* Input Field */}
          <div className="relative bg-white rounded-xl shadow-sm border border-stone-200 md:border-stone-200 md:shadow-lg overflow-hidden transition-shadow duration-200 focus-within:ring-2 focus-within:ring-stone-800 focus-within:border-transparent">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Describe your problem... (e.g., 'User retention dropped by 15%')"
              className="w-full p-4 md:p-6 text-[16px] md:text-lg bg-transparent text-ink placeholder:text-stone-300 focus:outline-none resize-none min-h-[120px] md:min-h-[140px]"
              disabled={isLoading}
              style={{ fontSize: '16px' }} // Prevents iOS zoom on focus
            />
            
            {/* Desktop Button (Inside) */}
            <div className="hidden md:block absolute bottom-4 right-4">
               <Button 
                 type="submit" 
                 disabled={!input.trim() || isLoading} 
                 isLoading={isLoading}
                 className="rounded-md shadow-sm"
               >
                 {!isLoading && <span className="mr-2">Analyze</span>}
                 {!isLoading && <ArrowRight size={16} />}
               </Button>
            </div>
          </div>

          {/* Mobile Button (Full Width, Outside) */}
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading} 
            isLoading={isLoading}
            className="md:hidden w-full mt-4 py-4 rounded-xl text-base font-semibold shadow-md bg-ink text-white active:scale-[0.98] transition-transform"
          >
            {isLoading ? (
               'Analyzing...' 
            ) : (
              <>
                Analyze <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
      
      {/* Power Strip / Footer */}
      <div className="mt-8 md:mt-12 flex flex-wrap justify-center items-center gap-3 md:gap-4 text-[11px] md:text-xs text-stone-400 uppercase tracking-widest opacity-80">
        <span className="flex items-center gap-1.5">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
           <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 font-bold">Powered by Gemini</span>
        </span>
        <span className="w-1 h-1 rounded-full bg-stone-300"></span>
        <span>Scientific Thinking</span>
      </div>
    </main>
  );
};