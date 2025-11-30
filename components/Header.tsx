import React, { useState } from 'react';
import { BrainCircuit, LogOut, History, User as UserIcon, Shield, Menu, X, LogIn } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="w-full py-4 px-4 md:px-8 flex justify-between items-center border-b border-stone-200 bg-paper sticky top-0 z-50">
        <button 
          onClick={user ? onHomeClick : onMethodologyClick} 
          className="flex items-center gap-2 group focus:outline-none"
        >
          <div className="bg-ink text-white p-1.5 md:p-2 rounded-md group-hover:bg-stone-800 transition-colors">
            <BrainCircuit size={20} md:size={24} strokeWidth={1.5} />
          </div>
          <span className="text-lg md:text-xl font-serif font-semibold tracking-tight text-ink">Think Tank.</span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
           <nav className="flex items-center gap-6 text-sm font-medium text-stone-500">
              {user && (
                <>
                  <button onClick={onHomeClick} className="hover:text-ink transition-colors">New Session</button>
                  <button onClick={onHistoryClick} className="hover:text-ink transition-colors">History</button>
                </>
              )}
              <button onClick={onMethodologyClick} className="hover:text-ink transition-colors">Methodology</button>
              <button onClick={onAboutClick} className="hover:text-ink transition-colors">About</button>
              {user?.isAdmin && <button onClick={onAdminClick} className="text-purple-600 hover:text-purple-800">Admin</button>}
           </nav>

           <div className="h-6 w-px bg-stone-200"></div>

           {user ? (
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-ink font-bold text-xs border border-stone-300">
                     {user.name.substring(0, 2).toUpperCase()}
                   </div>
                   <span className="text-sm font-medium text-ink">{user.name}</span>
                </div>
                <button onClick={onLogout} className="text-stone-400 hover:text-red-600 transition-colors" title="Sign Out">
                   <LogOut size={18} />
                </button>
             </div>
           ) : (
             <Button onClick={onLoginClick} className="py-2 px-5 text-sm h-auto">Sign In</Button>
           )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-3">
           {user && (
             <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-ink font-bold text-[10px] border border-stone-300">
               {user.name.substring(0, 2).toUpperCase()}
             </div>
           )}
           <button 
             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             className="p-2 text-stone-600 hover:bg-stone-100 rounded-md"
           >
             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[65px] bg-paper z-40 flex flex-col p-6 animate-fade-in-up overflow-y-auto md:hidden">
          <nav className="flex flex-col gap-4 text-lg font-medium text-stone-600">
            {user && (
               <button 
                onClick={() => handleNavClick(onHomeClick)}
                className="flex items-center gap-3 py-4 border-b border-stone-100 active:bg-stone-50 transition-colors"
              >
                <BrainCircuit size={20} /> New Session
              </button>
            )}
            
            {user && (
              <button 
                onClick={() => handleNavClick(onHistoryClick)}
                className="flex items-center gap-3 py-4 border-b border-stone-100 active:bg-stone-50 transition-colors"
              >
                <History size={20} /> History
              </button>
            )}
            
            <button 
              onClick={() => handleNavClick(onMethodologyClick)}
              className="flex items-center gap-3 py-4 border-b border-stone-100 active:bg-stone-50 transition-colors"
            >
              <BrainCircuit size={20} /> Methodology Library
            </button>
            
            <button 
              onClick={() => handleNavClick(onAboutClick)}
              className="flex items-center gap-3 py-4 border-b border-stone-100 active:bg-stone-50 transition-colors"
            >
              <UserIcon size={20} /> About Think Tank
            </button>

            {user?.isAdmin && onAdminClick && (
               <button 
                onClick={() => handleNavClick(onAdminClick)}
                className="flex items-center gap-3 py-4 border-b border-stone-100 text-purple-600 active:bg-purple-50 transition-colors"
              >
                <Shield size={20} /> Admin Dashboard
              </button>
            )}

            <div className="mt-6">
              {user ? (
                <button 
                  onClick={() => handleNavClick(onLogout)}
                  className="w-full py-4 flex items-center justify-center gap-2 bg-stone-100 text-red-600 rounded-xl font-semibold active:bg-stone-200"
                >
                  <LogOut size={20} /> Sign Out
                </button>
              ) : (
                <Button 
                  onClick={() => handleNavClick(onLoginClick)}
                  className="w-full py-4 justify-center text-base"
                >
                  Sign In
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
};