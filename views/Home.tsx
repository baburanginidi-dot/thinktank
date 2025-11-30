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
    <main className="flex flex-col items-center w-full min-h-[calc(100vh-65px)] px-4 md:px-8 py-8 md:py-16 transition-all duration-500 overflow-x-hidden max-w-5xl mx-auto">
      
      {/* Content Section */}
      <div className="w-full text-center flex flex-col justify-center flex-1 space-y-6 mb-8 md:mb-12 animate-fade-in-up">
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium text-ink leading-[1.1] tracking-tight">
          Structure your chaos.<br />
          <span className="text-stone-400 italic">Solve with science.</span>
        </h1>
        
        <p className="text-base md:text-xl leading-relaxed text-stone-600 max-w-xl mx-auto font-light">
          Enter a problem statement. We’ll surface the right frameworks to move you from chaos to clarity.
        </p>
      </div>

      {/* Input Section */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-8 md:mb-16">
        
        <div className="relative flex flex-col">
          {/* Input Field */}
          <div className={`relative bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${isFocused ? 'ring-2 ring-stone-800 border-transparent shadow-lg scale-[1.01]' : 'border-stone-200 hover:border-stone-300'}`}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={input.length > 0 ? '' : placeholder}
              className="w-full p-6 text-base md:text-lg bg-transparent text-ink placeholder:text-stone-300 focus:outline-none resize-none min-h-[160px] md:min-h-[200px]"
              disabled={isLoading}
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Button (Full Width Mobile, Centered Desktop) */}
          <div className="mt-6 flex justify-center">
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading} 
              isLoading={isLoading}
              className="w-full md:w-auto px-10 py-4 rounded-xl text-base md:text-lg font-semibold shadow-md bg-ink text-white active:scale-[0.98] transition-transform"
            >
              {isLoading ? 'Analyzing...' : <>Analyze <ArrowRight size={20} className="ml-2" /></>}
            </Button>
          </div>
        </div>
      </form>
      
      {/* Footer */}
      <div className="mt-auto flex justify-center items-center gap-2 text-xs text-stone-400 uppercase tracking-widest opacity-80 pb-4">
        <span className="flex items-center gap-2">
           <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
           <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 font-bold">Powered by Gemini</span>
        </span>
      </div>
    </main>
  );
};