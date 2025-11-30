
import React, { useEffect, useState, useRef } from 'react';
import { Framework, ProblemStatement, CanvasSection, CanvasNote, SectionTemplate, Viewport } from '../types';
import { initializeBoard, generateSectionIdeas } from '../services/geminiService';
import { StickyNote } from '../components/StickyNote';
import { Plus, Sparkles, ZoomIn, ZoomOut, Layout, Move, Download, Save, Bookmark, Trash2, GripVertical, ArrowLeft, MousePointer2 } from 'lucide-react';
import { Spinner } from '../components/Spinner';

interface WorkspaceProps {
  problem: ProblemStatement;
  framework: Framework;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onSaveState: (sections: CanvasSection[], viewport?: Viewport) => void;
  initialSections?: CanvasSection[];
  initialViewport?: Viewport;
  templates: SectionTemplate[];
  onSaveTemplate: (section: CanvasSection, name: string) => void;
  onDeleteTemplate: (id: string) => void;
  onBack: () => void;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

const getSectionStyle = (frameworkLayout: string, index: number, title: string) => {
  const titleLower = title.toLowerCase();
  
  if (frameworkLayout === 'six_hats') {
    if (titleLower.includes('white') || titleLower.includes('data')) return { borderColor: 'border-stone-300', headerBg: 'bg-stone-50/90', titleColor: 'text-stone-700', badge: 'bg-stone-200 text-stone-600' };
    if (titleLower.includes('red') || titleLower.includes('emotion')) return { borderColor: 'border-red-200', headerBg: 'bg-red-50/90', titleColor: 'text-red-800', badge: 'bg-red-200 text-red-700' };
    if (titleLower.includes('black') || titleLower.includes('caution')) return { borderColor: 'border-stone-700', headerBg: 'bg-stone-800/90', titleColor: 'text-white', badge: 'bg-stone-600 text-stone-100' };
    if (titleLower.includes('yellow') || titleLower.includes('positive')) return { borderColor: 'border-yellow-300', headerBg: 'bg-yellow-50/90', titleColor: 'text-yellow-800', badge: 'bg-yellow-200 text-yellow-800' };
    if (titleLower.includes('green') || titleLower.includes('create')) return { borderColor: 'border-green-300', headerBg: 'bg-green-50/90', titleColor: 'text-green-800', badge: 'bg-green-200 text-green-800' };
    if (titleLower.includes('blue') || titleLower.includes('process')) return { borderColor: 'border-blue-300', headerBg: 'bg-blue-50/90', titleColor: 'text-blue-800', badge: 'bg-blue-200 text-blue-800' };
    
    const map = [
       { borderColor: 'border-stone-300', headerBg: 'bg-stone-50/90', titleColor: 'text-stone-700', badge: 'bg-stone-200 text-stone-600' }, 
       { borderColor: 'border-red-200', headerBg: 'bg-red-50/90', titleColor: 'text-red-800', badge: 'bg-red-200 text-red-700' }, 
       { borderColor: 'border-stone-700', headerBg: 'bg-stone-800/90', titleColor: 'text-white', badge: 'bg-stone-600 text-stone-100' }, 
       { borderColor: 'border-yellow-300', headerBg: 'bg-yellow-50/90', titleColor: 'text-yellow-800', badge: 'bg-yellow-200 text-yellow-800' }, 
       { borderColor: 'border-green-300', headerBg: 'bg-green-50/90', titleColor: 'text-green-800', badge: 'bg-green-200 text-green-800' }, 
       { borderColor: 'border-blue-300', headerBg: 'bg-blue-50/90', titleColor: 'text-blue-800', badge: 'bg-blue-200 text-blue-800' }, 
    ];
    return map[index % 6];
  }

  if (frameworkLayout === 'matrix_2x2') {
    const map = [
      { borderColor: 'border-emerald-200', headerBg: 'bg-emerald-50/90', titleColor: 'text-emerald-900', badge: 'bg-emerald-200 text-emerald-800' },
      { borderColor: 'border-rose-200', headerBg: 'bg-rose-50/90', titleColor: 'text-rose-900', badge: 'bg-rose-200 text-rose-800' },
      { borderColor: 'border-blue-200', headerBg: 'bg-blue-50/90', titleColor: 'text-blue-900', badge: 'bg-blue-200 text-blue-800' },
      { borderColor: 'border-amber-200', headerBg: 'bg-amber-50/90', titleColor: 'text-amber-900', badge: 'bg-amber-200 text-amber-800' },
    ];
    return map[index % 4];
  }

  return { borderColor: 'border-stone-200', headerBg: 'bg-white/90', titleColor: 'text-ink', badge: 'bg-stone-100 text-stone-600' };
};

export const Workspace: React.FC<WorkspaceProps> = ({ 
  problem, 
  framework, 
  addToast, 
  onSaveState, 
  initialSections,
  initialViewport,
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  onBack
}) => {
  const [sections, setSections] = useState<CanvasSection[]>(initialSections || []);
  const [isInitializing, setIsInitializing] = useState(!initialSections || initialSections.length === 0);
  const [isBrainstorming, setIsBrainstorming] = useState<string | null>(null);
  const [showTemplatesMenu, setShowTemplatesMenu] = useState(false);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  
  const [transform, setTransform] = useState<Transform>(initialViewport || { x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef<{ x: number, y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (sections.length > 0) {
        onSaveState(sections, transform);
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [sections, transform, onSaveState]);

  useEffect(() => {
    const init = async () => {
      if (!isInitializing) {
         if (!initialViewport) {
            // Force mobile defaults
            setTransform({ x: 20, y: 80, scale: 0.8 });
         }
        return;
      }

      try {
        const initialSections = await initializeBoard(problem.text, framework);
        setSections(initialSections);
        addToast("Workspace generated successfully", 'success');
        setTransform({ x: 20, y: 80, scale: 0.8 });
      } catch (error) {
        addToast("Failed to generate workspace. Please try again.", 'error');
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, [problem.text, framework]);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) e.preventDefault();
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    const newScale = Math.min(Math.max(0.2, transform.scale + delta), 3);
    
    // Simple zoom to center for mobile
    setTransform(prev => ({ ...prev, scale: newScale }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      setIsDragging(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
    setShowTemplatesMenu(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && lastMousePos.current) {
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      setTransform(prev => ({ ...prev, x: prev.x + deltaX, y: prev.y + deltaY }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => { setIsDragging(false); lastMousePos.current = null; };
  const handleMouseLeave = () => { setIsDragging(false); lastMousePos.current = null; };

  const resetView = () => setTransform({ x: 20, y: 80, scale: 0.8 });
  
  const handleManualSave = () => { onSaveState(sections, transform); addToast("Layout saved", 'success'); };

  const handleExport = () => {
    const data = { problem: problem.text, framework: framework.name, date: new Date().toISOString(), sections, viewport: transform };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `think-tank-mobile-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Exported", 'success');
  };

  const triggerSaveTemplate = (section: CanvasSection) => {
    const name = window.prompt("Template name:", section.title);
    if (name) onSaveTemplate(section, name);
  };

  const handleAddTemplateToCanvas = (template: SectionTemplate) => {
    const newSection: CanvasSection = {
      id: Math.random().toString(36).substr(2, 9),
      title: template.data.title,
      description: template.data.description,
      notes: template.data.notes.map(n => ({ id: Math.random().toString(36).substr(2, 9), content: n.content, color: n.color, isAiGenerated: false }))
    };
    setSections(prev => [...prev, newSection]);
    setShowTemplatesMenu(false);
    addToast("Template added", 'success');
  };

  const handleAddNote = (sectionId: string) => {
    const newNote: CanvasNote = { id: Math.random().toString(36).substr(2, 9), content: '', color: 'white', isAiGenerated: false };
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, notes: [...s.notes, newNote] } : s));
  };

  const handleUpdateNote = (sectionId: string, noteId: string, content: string) => {
    setSections(prev => prev.map(s => s.id !== sectionId ? s : { ...s, notes: s.notes.map(n => n.id === noteId ? { ...n, content } : n) }));
  };

  const handleDeleteNote = (sectionId: string, noteId: string) => {
    setSections(prev => prev.map(s => s.id !== sectionId ? s : { ...s, notes: s.notes.filter(n => n.id !== noteId) }));
  };

  const handleMoveNote = (noteId: string, sourceSectionId: string, destSectionId: string) => {
    if (sourceSectionId === destSectionId) return;
    let noteToMove: CanvasNote | undefined;
    const newSections = sections.map(section => {
      if (section.id === sourceSectionId) {
        noteToMove = section.notes.find(n => n.id === noteId);
        return { ...section, notes: section.notes.filter(n => n.id !== noteId) };
      }
      return section;
    });
    if (noteToMove) {
      setSections(newSections.map(section => {
        if (section.id === destSectionId) return { ...section, notes: [...section.notes, noteToMove!] };
        return section;
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent, sectionId: string) => { e.preventDefault(); if (dragOverSectionId !== sectionId) setDragOverSectionId(sectionId); };
  const handleDragLeave = () => setDragOverSectionId(null);
  const handleDrop = (e: React.DragEvent, destSectionId: string) => {
    e.preventDefault();
    setDragOverSectionId(null);
    const noteId = e.dataTransfer.getData('noteId');
    const sourceSectionId = e.dataTransfer.getData('sourceSectionId');
    if (noteId && sourceSectionId) handleMoveNote(noteId, sourceSectionId, destSectionId);
  };

  const handleAiBrainstorm = async (section: CanvasSection) => {
    setIsBrainstorming(section.id);
    try {
      const existingContent = section.notes.map(n => n.content);
      const newNotes = await generateSectionIdeas(problem.text, framework, section.title, existingContent);
      setSections(prev => prev.map(s => s.id === section.id ? { ...s, notes: [...s.notes, ...newNotes] } : s));
      addToast("Insights added", 'success');
    } catch (e) { addToast("Failed", 'error'); } finally { setIsBrainstorming(null); }
  };

  const renderSection = (section: CanvasSection, index: number) => {
    const style = getSectionStyle(framework.layout, index, section.title);
    const isDragTarget = dragOverSectionId === section.id;
    
    return (
      <div 
        key={section.id} 
        className={`w-[320px] flex flex-col flex-shrink-0 bg-white/40 border rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300 ${style.borderColor} ${isDragTarget ? 'ring-2 ring-indigo-500 scale-[1.02]' : ''}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={`p-5 border-b ${style.borderColor} ${style.headerBg} backdrop-blur-md rounded-t-2xl relative group/header`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-serif text-xl font-bold ${style.titleColor}`}>{section.title}</h3>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${style.badge}`}>
                {framework.layout === 'matrix_2x2' ? `Q${index + 1}` : `0${index + 1}`}
              </span>
              <button onClick={() => triggerSaveTemplate(section)} className="p-1.5 rounded-full hover:bg-black/10"><Bookmark size={14} /></button>
            </div>
          </div>
          <p className={`text-xs leading-relaxed opacity-90 font-medium ${style.titleColor === 'text-white' ? 'text-gray-200' : 'text-stone-500'}`}>
            {section.description}
          </p>
        </div>

        <div 
          className="flex-1 min-h-[250px] max-h-[500px] overflow-y-auto p-4 space-y-4 custom-scrollbar bg-stone-50/20"
          onDragOver={(e) => handleDragOver(e, section.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, section.id)}
        >
          {section.notes.map(note => (
            <StickyNote key={note.id} note={note} sectionId={section.id} onUpdate={(id, c) => handleUpdateNote(section.id, id, c)} onDelete={(id) => handleDeleteNote(section.id, id)} />
          ))}
          {section.notes.length === 0 && !isDragTarget && (
            <div className="flex flex-col items-center justify-center py-10 opacity-40 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
              <Layout size={24} className="mb-2 text-stone-400" />
              <div className="text-xs text-stone-400">Empty</div>
            </div>
          )}
        </div>

        <div className={`p-4 border-t ${style.borderColor} bg-white/60 backdrop-blur-md rounded-b-2xl grid grid-cols-2 gap-3`}>
           <button onClick={() => handleAddNote(section.id)} className="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg">
             <Plus size={16} /> Note
           </button>
           <button onClick={() => handleAiBrainstorm(section)} disabled={!!isBrainstorming} className="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg">
             {isBrainstorming === section.id ? <Spinner className="w-4 h-4" /> : <><Sparkles size={16} /> AI</>}
           </button>
        </div>
      </div>
    );
  };

  const renderBoardLayout = () => {
    // FORCE LINEAR STACKING FOR MOBILE CANVAS
    return (
      <div className="flex flex-col gap-6 p-4">
        {sections.map((s, i) => renderSection(s, i))}
      </div>
    );
  };

  if (isInitializing) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-paper">
        <Spinner className="w-8 h-8 text-ink mb-4" />
        <h3 className="text-lg font-serif text-ink">Building workspace...</h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-[#F4F4F4] overflow-hidden relative select-none">
      
      {/* Mobile Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-50 animate-fade-in-up">
        <div className="bg-white/90 backdrop-blur-md shadow-xl border border-stone-200/50 rounded-xl p-2 flex items-center justify-between gap-1 overflow-x-auto custom-scrollbar">
          
          <button onClick={onBack} className="p-2.5 rounded-full text-stone-500 hover:text-ink"><ArrowLeft size={20} /></button>
          <div className="w-px h-6 bg-stone-200"></div>
          
          <button onClick={handleManualSave} className="p-2.5 rounded-full text-stone-500"><Save size={20} /></button>
          <button onClick={resetView} className="p-2.5 rounded-full text-stone-500"><Move size={20} /></button>
          <button onClick={() => setTransform(t => ({...t, scale: Math.max(0.2, t.scale - 0.2)}))} className="p-2.5 rounded-full text-stone-500"><ZoomOut size={20} /></button>
          <button onClick={() => setTransform(t => ({...t, scale: Math.min(3, t.scale + 0.2)}))} className="p-2.5 rounded-full text-stone-500"><ZoomIn size={20} /></button>
          
          <div className="w-px h-6 bg-stone-200"></div>
          <button onClick={handleExport} className="p-2.5 rounded-full text-stone-500"><Download size={20} /></button>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden relative touch-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#78716C 1.5px, transparent 1.5px)', backgroundSize: `${24 * transform.scale}px ${24 * transform.scale}px`, backgroundPosition: `${transform.x}px ${transform.y}px` }} />
        <div className="absolute origin-top-left transition-transform duration-75" style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}>
          {renderBoardLayout()}
        </div>
      </div>
    </div>
  );
};
