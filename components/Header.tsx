
import React from 'react';
import { BrainCircuit, LogOut, History, User as UserIcon, Shield } from 'lucide-react';
import { User } from '../types';
import { Button } from './Button';

interface HeaderProps {
  user: User | null;
  onHomeClick: () => void;
  onMethodologyClick: () => void;
  onHistoryClick: () => void;
  onAboutClick: () => void;
  onLogout: () => void;
  onLoginClick: () => void;
  onAdminClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  onHomeClick, 
  onMethodologyClick, 
  onHistoryClick, 
  onAboutClick, 
  onLogout,
  onLoginClick,
  onAdminClick
}) => {
  return (
    <header className="w-full py-3 px-4 md:py-4 md:px-8 flex justify-between items-center border-b border-stone-200 bg-paper sticky top-0 z-50">
      <button 
        onClick={user ? onHomeClick : onMethodologyClick} 
        className="flex items-center gap-2 md:gap-3 group focus:outline-none"
      >
        <div className="bg-ink text-white p-1.5 md:p-2 rounded-md group-hover:bg-stone-800 transition-colors">
          <BrainCircuit size={20} md:size={24} strokeWidth={1.5} />
        </div>
        <span className="text-lg md:text-xl font-serif font-semibold tracking-tight text-ink">Think Tank.</span>
      </button>

      <div className="flex items-center gap-4 md:gap-6">
        <nav className="hidden md:flex gap-6 text-sm font-medium text-stone-500">
          {user && (
            <button 
              onClick={onHistoryClick}
              className="hover:text-ink transition-colors focus:outline-none flex items-center gap-1.5"
            >
              <History size={16} /> History
            </button>
          )}
          <button 
            onClick={onMethodologyClick}
            className="hover:text-ink transition-colors focus:outline-none"
          >
            Methodology
          </button>
          <button 
            onClick={onAboutClick}
            className="hover:text-ink transition-colors focus:outline-none"
          >
            About
          </button>
        </nav>
        
        <div className="h-6 w-px bg-stone-200 hidden md:block"></div>
        
        {user ? (
          <div className="flex items-center gap-3 md:gap-4">
            
            {/* ADMIN CTA */}
            {user.isAdmin && onAdminClick && (
              <button 
                onClick={onAdminClick}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
                title="Admin Dashboard"
              >
                <Shield size={14} /> Admin
              </button>
            )}

            <div className="flex items-center gap-2 md:gap-3">
               <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-stone-200 flex items-center justify-center text-ink font-bold text-[10px] md:text-xs border border-stone-300">
                 {user.name.substring(0, 2).toUpperCase()}
               </div>
               <span className="text-sm font-medium text-ink hidden sm:block">{user.name}</span>
            </div>
            
            <button 
              onClick={onLogout}
              className="p-1.5 md:p-2 text-stone-400 hover:text-red-500 hover:bg-stone-100 rounded-full transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} md:size={18} />
            </button>
          </div>
        ) : (
          <Button 
            variant="primary" 
            onClick={onLoginClick}
            className="py-2 px-4 text-xs md:text-sm h-auto"
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
};
