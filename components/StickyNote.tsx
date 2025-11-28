import React, { useState, useEffect, useRef } from 'react';
import { CanvasNote, NoteColor } from '../types';
import { X, Sparkles, Edit2, GripHorizontal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface StickyNoteProps {
  note: CanvasNote;
  sectionId: string;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

const colorClasses: Record<NoteColor, string> = {
  yellow: 'bg-yellow-100 border-yellow-200 text-yellow-900 selection:bg-yellow-200 placeholder:text-yellow-900/30',
  blue: 'bg-blue-100 border-blue-200 text-blue-900 selection:bg-blue-200 placeholder:text-blue-900/30',
  green: 'bg-green-100 border-green-200 text-green-900 selection:bg-green-200 placeholder:text-green-900/30',
  pink: 'bg-pink-100 border-pink-200 text-pink-900 selection:bg-pink-200 placeholder:text-pink-900/30',
  orange: 'bg-orange-100 border-orange-200 text-orange-900 selection:bg-orange-200 placeholder:text-orange-900/30',
  white: 'bg-white border-stone-200 text-stone-900 selection:bg-stone-100 placeholder:text-stone-300',
};

export const StickyNote: React.FC<StickyNoteProps> = ({ note, sectionId, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  // Auto-enter edit mode if content is empty (new note)
  useEffect(() => {
    if (!note.content) {
      setIsEditing(true);
    }
  }, []);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('noteId', note.id);
    e.dataTransfer.setData('sourceSectionId', sectionId);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className={`relative group p-4 w-full min-h-[140px] shadow-sm hover:shadow-lg transition-all duration-200 rounded-sm border-t-4 ${colorClasses[note.color]} flex flex-col ${isEditing ? 'cursor-auto' : 'cursor-grab active:cursor-grabbing'} ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseDown={(e) => e.stopPropagation()} // Crucial: Prevents canvas dragging
      onDoubleClick={() => setIsEditing(true)}
    >
      
      {/* Drag Handle Visual (Optional, appears on hover) */}
      {!isEditing && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <GripHorizontal size={16} />
        </div>
      )}

      {/* AI Badge */}
      {note.isAiGenerated && (
        <div className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity" title="AI Generated Insight">
          <Sparkles size={12} />
        </div>
      )}

      {/* Controls (Hidden unless hovering) */}
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
        {!isEditing && (
          <button 
            onClick={(e) => {
               e.stopPropagation();
               setIsEditing(true);
            }}
            className="p-1 text-black/30 hover:text-black/70 rounded hover:bg-black/5"
          >
            <Edit2 size={12} />
          </button>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          className="p-1 text-black/30 hover:text-red-600 rounded hover:bg-red-50"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={note.content}
          onChange={(e) => onUpdate(note.id, e.target.value)}
          className={`w-full h-full bg-transparent border-none resize-none focus:ring-0 text-sm leading-relaxed font-medium font-sans`}
          placeholder="Write your thought..."
          onBlur={() => setIsEditing(false)}
          onMouseDown={(e) => e.stopPropagation()} 
        />
      ) : (
        <div className="prose prose-sm prose-p:leading-relaxed prose-p:my-0 max-w-none overflow-hidden text-sm pointer-events-none">
           <ReactMarkdown>{note.content || 'Empty note...'}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};