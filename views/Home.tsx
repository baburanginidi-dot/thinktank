
import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';

interface HomeProps {
  onSubmit: (problem: string) => void;
  isLoading: boolean;
  initialInput?: string;
}

const PLACEHOLDER_EXAMPLES = [
  "Describe your problem...",
  "Technical migration strategy...",
  "Enterprise sales vs PLG...",
  "Team conflict resolution...",
  "Career pivot anxiety..."
];

export const Home: React.FC<HomeProps> = ({ onSubmit, isLoading, initialInput }) => {
  const [input, setInput] = useState(initialInput || '');
  const [isFocused, setIsFocused] = useState(false);

  // Typewriter Effect
  const [placeholder, setPlaceholder] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (input.length > 0) return;
    const currentPhrase = PLACEHOLDER_EXAMPLES[phraseIndex];
    
    const handleType = () => {
      if (isDeleting) {
        setPlaceholder(prev => prev.substring(0, prev.length - 1));
      } else {
        setPlaceholder(currentPhrase.substring(0, placeholder.length + 1));
      }

      if (!isDeleting && placeholder === currentPhrase) {
        setTimeout(() => setIsDeleting(true), 1500); 
      } else if (isDeleting && placeholder === '') {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
      }
    };

    const timer = setTimeout(handleType, isDeleting ? 30 : 60);
    return () => clearTimeout(timer);
  }, [placeholder, isDeleting, phraseIndex, input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) onSubmit(input);
  };

  return (
    <main className="flex flex-col items-center w-full min-h-[calc(100vh-60px)] px-4 pt-6 pb-6 transition-all duration-500 overflow-x-hidden">
      
      {/* Content Section */}
      <div className="w-full text-center flex flex-col justify-center flex-1 space-y-4 mb-6 animate-fade-in-up">
        
        <h1 className="text-4xl font-serif font-medium text-ink leading-[1.15] tracking-tight">
          Structure your chaos.<br />
          <span className="text-stone-400 italic">Solve with science.</span>
        </h1>
        
        <p className="text-[15px] leading-relaxed text-stone-600 max-w-xs mx-auto font-light px-2">
          Enter a problem statement. We’ll surface the right frameworks to move you from chaos to clarity.
        </p>
      </div>

      {/* Input Section */}
      <form onSubmit={handleSubmit} className="w-full mt-auto mb-4">
        
        <div className="relative flex flex-col">
          {/* Input Field */}
          <div className="relative bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden focus-within:ring-2 focus-within:ring-stone-800 focus-within:border-transparent">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={input.length > 0 ? '' : placeholder}
              className="w-full p-4 text-[16px] bg-transparent text-ink placeholder:text-stone-300 focus:outline-none resize-none min-h-[140px]"
              disabled={isLoading}
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Mobile Button (Full Width) */}
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading} 
            isLoading={isLoading}
            className="w-full mt-4 py-4 rounded-xl text-base font-semibold shadow-md bg-ink text-white active:scale-[0.98] transition-transform"
          >
            {isLoading ? 'Analyzing...' : <>Analyze <ArrowRight size={18} className="ml-2" /></>}
          </Button>
        </div>
      </form>
      
      {/* Footer */}
      <div className="mt-6 flex justify-center items-center gap-2 text-[10px] text-stone-400 uppercase tracking-widest opacity-80 pb-4">
        <span className="flex items-center gap-1.5">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
           <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 font-bold">Powered by Gemini</span>
        </span>
      </div>
    </main>
  );
};
