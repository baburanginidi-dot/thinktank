import React, { useState } from 'react';
import { BrainCircuit, ArrowRight, Mail, Lock, User as UserIcon } from 'lucide-react';
import { Button } from '../components/Button';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const mockUser: User = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        name: isSignUp ? formData.name : 'Demo User',
        email: formData.email
      };
      onLogin(mockUser);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-paper">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-ink text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white text-ink p-2 rounded-md">
            <BrainCircuit size={24} strokeWidth={1.5} />
          </div>
          <span className="text-xl font-serif font-semibold tracking-tight">Think Tank.</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-serif font-medium mb-6 leading-tight">
            Clarity in a <br/> complex world.
          </h1>
          <p className="text-stone-400 text-lg font-light leading-relaxed">
            Access a curated library of mental models and AI-driven frameworks designed to structure your problem-solving process.
          </p>
        </div>

        <div className="relative z-10 text-xs text-stone-500 uppercase tracking-widest">
          © 2024 Think Tank Inc.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center lg:text-left mb-10">
             {/* Mobile Logo */}
            <div className="flex lg:hidden items-center justify-center gap-2 mb-8 text-ink">
              <div className="bg-ink text-white p-2 rounded-md">
                <BrainCircuit size={24} strokeWidth={1.5} />
              </div>
              <span className="text-xl font-serif font-semibold tracking-tight">Think Tank.</span>
            </div>

            <h2 className="text-3xl font-serif text-ink mb-2">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="text-stone-500">
              {isSignUp ? 'Start structuring your thoughts today.' : 'Please enter your details to sign in.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-stone-500 ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input 
                    type="text"
                    required={isSignUp}
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 transition-shadow"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-stone-500 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 transition-shadow"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-stone-500 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 transition-shadow"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full justify-center py-4 text-base mt-4"
              isLoading={isLoading}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
              {!isLoading && <ArrowRight size={18} className="ml-2" />}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-stone-500">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-ink font-semibold hover:underline focus:outline-none"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};