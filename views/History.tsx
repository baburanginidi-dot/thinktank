import React from 'react';
import { SavedSession } from '../types';
import { ArrowLeft, Trash2, Clock, ArrowRight, Layout, Calendar } from 'lucide-react';
import { Button } from '../components/Button';

/**
 * @interface HistoryProps
 * @property {SavedSession[]} sessions - An array of saved sessions.
 * @property {(session: SavedSession) => void} onOpenSession - Callback to open a saved session.
 * @property {(sessionId: string) => void} onDeleteSession - Callback to delete a session.
 * @property {() => void} onBack - Callback to navigate back to the previous view.
 */
interface HistoryProps {
  sessions: SavedSession[];
  onOpenSession: (session: SavedSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onBack: () => void;
}

/**
 * Renders the session history page, displaying a list of saved sessions.
 * Allows users to resume or delete past sessions.
 *
 * @param {HistoryProps} props - The props for the History component.
 * @returns {React.ReactElement} The rendered history page.
 */
export const History: React.FC<HistoryProps> = ({ sessions, onOpenSession, onDeleteSession, onBack }) => {
  const sortedSessions = [...sessions].sort((a, b) => b.lastModified - a.lastModified);

  /**
   * Formats a Unix timestamp into a readable date string.
   * @param {number} timestamp - The timestamp to format.
   * @returns {string} The formatted date string.
   */
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-[85vh] animate-fade-in-up">
      <button 
        onClick={onBack} 
        className="group flex items-center text-stone-400 hover:text-ink mb-8 transition-colors"
      >
        <div className="p-2 rounded-full group-hover:bg-stone-100 transition-colors mr-2">
           <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </div>
        <span className="font-medium text-sm">Back to Home</span>
      </button>

      <div className="mb-12">
        <h2 className="text-4xl font-serif text-ink mb-2">Session History</h2>
        <p className="text-stone-500">Your past thinking sessions and frameworks.</p>
      </div>

      {sortedSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
          <Clock size={48} className="text-stone-300 mb-4" />
          <h3 className="text-lg font-serif text-stone-600 mb-2">No history yet</h3>
          <p className="text-stone-400 text-sm max-w-md text-center">
            Start a new session to track your problem-solving journey. Your work will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSessions.map((session) => (
            <div 
              key={session.id}
              className="group bg-white border border-stone-200 rounded-xl p-6 hover:shadow-xl hover:border-stone-300 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1 relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-stone-100 rounded-lg text-stone-600">
                    <Layout size={16} />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    {session.framework.name}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this session?')) {
                      onDeleteSession(session.id);
                    }
                  }}
                  className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Session"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <h3 className="text-lg font-serif text-ink mb-2 line-clamp-2 leading-snug">
                {session.problem.text}
              </h3>

              <div className="flex items-center gap-4 text-xs text-stone-400 mt-auto pt-4 border-t border-stone-100">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{formatDate(session.lastModified)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                  <span>{session.sections.length} Sections</span>
                </div>
              </div>

              <Button 
                variant="secondary"
                className="w-full mt-6 justify-center"
                onClick={() => onOpenSession(session)}
              >
                Resume Session
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};