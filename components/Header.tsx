
import React from 'react';
import { BrainCircuit, LogOut, History, User as UserIcon, Shield } from 'lucide-react';
import { User } from '../types';
import { Button } from './Button';

/**
 * Props for the Header component.
 */
interface HeaderProps {
  /** The currently logged-in user, or null if no user is logged in. */
  user: User | null;
  /** Callback for when the home/logo is clicked. */
  onHomeClick: () => void;
  /** Callback for when the Methodology link is clicked. */
  onMethodologyClick: () => void;
  /** Callback for when the History link is clicked. */
  onHistoryClick: () => void;
  /** Callback for when the About link is clicked. */
  onAboutClick: () => void;
  /** Callback for when the user logs out. */
  onLogout: () => void;
  /** Callback for when the user clicks the login button. */
  onLoginClick: () => void;
  /** Optional callback for when the Admin dashboard link is clicked. */
  onAdminClick?: () => void;
}

/**
 * The main application header component.
 * Displays navigation links and user profile/actions based on authentication state.
 *
 * @param {HeaderProps} props - The props for the header.
 * @returns {JSX.Element} The rendered header element.
 */
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
          <BrainCircuit size={24} strokeWidth={1.5} className="w-5 h-5 md:w-6 md:h-6" />
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
              <LogOut size={16} className="w-4 h-4 md:w-[18px] md:h-[18px]" />
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
