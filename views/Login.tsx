
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
    setTimeout(() => {
      const isAdmin = formData.email.toLowerCase() === 'admin@thinktank.com';
      const mockUser: User = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        name: isSignUp ? formData.name : (isAdmin ? 'Admin User' : 'Demo User'),
        email: formData.email,
        isAdmin: isAdmin
      };
      onLogin(mockUser);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4 py-8">
      <div className="w-full max-w-sm animate-fade-in-up">
        
        <div className="flex flex-col items-center justify-center gap-3 mb-10 text-ink">
          <div className="bg-ink text-white p-2.5 rounded-lg">
            <BrainCircuit size={28} strokeWidth={1.5} />
          </div>
          <span className="text-2xl font-serif font-semibold tracking-tight">Think Tank.</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl border border-stone-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-serif text-ink mb-2">
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-stone-500">
              {isSignUp ? 'Start structuring thoughts.' : 'Enter details to sign in.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="text"
                  required={isSignUp}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                  placeholder="Full Name"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input 
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                placeholder="Email"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input 
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                placeholder="Password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full justify-center py-3.5 text-sm mt-2 rounded-xl"
              isLoading={isLoading}
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-ink font-semibold hover:underline"
            >
              {isSignUp ? 'Already have an account?' : 'Create an account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
