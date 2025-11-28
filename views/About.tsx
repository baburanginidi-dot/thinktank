import React from 'react';
import { BrainCircuit, Shield, Zap, ArrowRight, Layers, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';

/**
 * Props for the About view.
 */
interface AboutProps {
  /** Callback to start a new session (go to home/login). */
  onStart: () => void;
  /** Callback to go back to the previous view. */
  onBack: () => void;
}

/**
 * The About page component.
 * Displays information about the application's purpose, principles, and features.
 *
 * @param {AboutProps} props - The props for the view.
 * @returns {JSX.Element} The rendered About page.
 */
export const About: React.FC<AboutProps> = ({ onStart, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 animate-fade-in-up">
      
      <button 
        onClick={onBack} 
        className="group flex items-center text-stone-400 hover:text-ink mb-12 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Home</span>
      </button>

      {/* Hero Section */}
      <div className="mb-20">
        <h1 className="text-5xl md:text-7xl font-serif text-ink mb-8 leading-[1.1] tracking-tight">
          We believe clear thinking <br/>
          <span className="text-stone-400 italic">is a superpower.</span>
        </h1>
        <p className="text-lg md:text-xl text-stone-600 leading-relaxed max-w-2xl font-light">
          In a world of infinite data and complexity, the ability to structure chaos into clarity is the ultimate competitive advantage. Think Tank blends cognitive science with artificial intelligence to augment your problem-solving capabilities.
        </p>
      </div>

      {/* The Problem / Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
        <div className="space-y-4">
          <h3 className="text-2xl font-serif text-ink">The Cognitive Gap</h3>
          <p className="text-stone-600 leading-relaxed">
            Most modern work tools are designed for <em>documentation</em>, not <em>thinking</em>. We stare at blinking cursors in blank documents, overwhelmed by where to start. The cognitive load of structuring a problem often prevents us from solving it.
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-serif text-ink">The Structured Solution</h3>
          <p className="text-stone-600 leading-relaxed">
            History's greatest minds—from Feynman to Musk—didn't just "think harder." They used mental models. Think Tank creates a digital environment where these proven frameworks are instantly accessible and contextually applied by AI.
          </p>
        </div>
      </div>

      {/* Values / Features */}
      <div className="border-t border-stone-200 pt-16 mb-20">
        <h2 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-12">Our Core Principles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4 group">
            <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-ink group-hover:bg-ink group-hover:text-white transition-colors">
              <BrainCircuit size={24} strokeWidth={1.5} />
            </div>
            <h4 className="text-lg font-serif text-ink">Scientific Rigor</h4>
            <p className="text-sm text-stone-600 leading-relaxed">
              We don't invent processes. We digitize proven frameworks from engineering, psychology, and business strategy that have stood the test of time.
            </p>
          </div>

          <div className="space-y-4 group">
            <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-ink group-hover:bg-ink group-hover:text-white transition-colors">
              <Zap size={24} strokeWidth={1.5} />
            </div>
            <h4 className="text-lg font-serif text-ink">AI as a Partner</h4>
            <p className="text-sm text-stone-600 leading-relaxed">
              AI shouldn't do the thinking for you. It should unblock you. Our models act as a sparring partner, suggesting angles you might have missed.
            </p>
          </div>

          <div className="space-y-4 group">
            <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-ink group-hover:bg-ink group-hover:text-white transition-colors">
              <Layers size={24} strokeWidth={1.5} />
            </div>
            <h4 className="text-lg font-serif text-ink">Design for Flow</h4>
            <p className="text-sm text-stone-600 leading-relaxed">
              Cluttered interfaces lead to cluttered thoughts. Our workspace is obsessively minimal to keep you in a state of deep work.
            </p>
          </div>
        </div>
      </div>

      {/* Team / Footer */}
      <div className="bg-stone-100 rounded-2xl p-8 md:p-12 text-center">
        <h3 className="text-3xl font-serif text-ink mb-4">Ready to solve better?</h3>
        <p className="text-stone-500 mb-8 max-w-md mx-auto">
          Join thousands of product managers, engineers, and founders who use Think Tank to find clarity.
        </p>
        <Button onClick={onStart} className="mx-auto">
          Start a Session <ArrowRight size={18} className="ml-2" />
        </Button>
      </div>
      
      <div className="mt-16 pt-8 border-t border-stone-200 text-center text-xs text-stone-400 uppercase tracking-widest">
        Built with precision &bull; Powered by Gemini &bull; © 2024 Think Tank
      </div>
    </div>
  );
};
