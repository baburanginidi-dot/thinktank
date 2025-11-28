import React, { useEffect, useState, useRef } from 'react';
import { Framework, ProblemStatement, CanvasSection, CanvasNote, SectionTemplate, Viewport } from '../types';
import { initializeBoard, generateSectionIdeas } from '../services/geminiService';
import { StickyNote } from '../components/StickyNote';
import { Plus, Sparkles, ZoomIn, ZoomOut, Layout, Move, Download, Save, Bookmark, Trash2, GripVertical, ArrowLeft, MousePointer2 } from 'lucide-react';
import { Spinner } from '../components/Spinner';

/**
 * Props for the Workspace component.
 */
interface WorkspaceProps {
  /** The problem statement being solved. */
  problem: ProblemStatement;
  /** The framework selected for the session. */
  framework: Framework;
  /** Callback to display toast notifications. */
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  /** Callback to save the current state of the workspace. */
  onSaveState: (sections: CanvasSection[], viewport?: Viewport) => void;
  /** Optional initial sections to load. */
  initialSections?: CanvasSection[];
  /** Optional initial viewport state. */
  initialViewport?: Viewport;
  /** List of available section templates. */
  templates: SectionTemplate[];
  /** Callback to save a section as a template. */
  onSaveTemplate: (section: CanvasSection, name: string) => void;
  /** Callback to delete a template. */
  onDeleteTemplate: (id: string) => void;
  /** Callback to exit the workspace. */
  onBack: () => void;
}

/**
 * Interface for viewport transformation state.
 */
interface Transform {
  x: number;
  y: number;
  scale: number;
}

/**
 * Helper function to determine visual styles for sections based on layout and title.
 * Used for Six Thinking Hats and Matrix layouts specifically.
 *
 * @param {string} frameworkLayout - The layout type.
 * @param {number} index - The index of the section.
 * @param {string} title - The title of the section.
 * @returns {object} Tailwind CSS class strings for styling.
 */
const getSectionStyle = (frameworkLayout: string, index: number, title: string) => {
  const titleLower = title.toLowerCase();
  
  if (frameworkLayout === 'six_hats') {
    // Color mapping for Six Thinking Hats
    if (titleLower.includes('white') || titleLower.includes('data')) return { borderColor: 'border-stone-300', headerBg: 'bg-stone-50/90', titleColor: 'text-stone-700', badge: 'bg-stone-200 text-stone-600' };
    if (titleLower.includes('red') || titleLower.includes('emotion')) return { borderColor: 'border-red-200', headerBg: 'bg-red-50/90', titleColor: 'text-red-800', badge: 'bg-red-200 text-red-700' };
    if (titleLower.includes('black') || titleLower.includes('caution')) return { borderColor: 'border-stone-700', headerBg: 'bg-stone-800/90', titleColor: 'text-white', badge: 'bg-stone-600 text-stone-100' };
    if (titleLower.includes('yellow') || titleLower.includes('positive')) return { borderColor: 'border-yellow-300', headerBg: 'bg-yellow-50/90', titleColor: 'text-yellow-800', badge: 'bg-yellow-200 text-yellow-800' };
    if (titleLower.includes('green') || titleLower.includes('create')) return { borderColor: 'border-green-300', headerBg: 'bg-green-50/90', titleColor: 'text-green-800', badge: 'bg-green-200 text-green-800' };
    if (titleLower.includes('blue') || titleLower.includes('process')) return { borderColor: 'border-blue-300', headerBg: 'bg-blue-50/90', titleColor: 'text-blue-800', badge: 'bg-blue-200 text-blue-800' };
    
    // Fallback map
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

  // Default Linear
  return { borderColor: 'border-stone-200', headerBg: 'bg-white/90', titleColor: 'text-ink', badge: 'bg-stone-100 text-stone-600' };
};

/**
 * The main Workspace component.
 * Provides an infinite canvas for working on the problem using the selected framework.
 * Supports panning, zooming, drag-and-drop notes, AI generation, and saving/loading.
 *
 * @param {WorkspaceProps} props - The props for the workspace.
 * @returns {JSX.Element} The rendered workspace.
 */
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
  
  // Canvas State
  const [transform, setTransform] = useState<Transform>(initialViewport || { x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef<{ x: number, y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced Save (includes Viewport)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (sections.length > 0) {
        onSaveState(sections, transform);
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [sections, transform, onSaveState]);

  // Initialize the board with AI if no initial sections
  useEffect(() => {
    const init = async () => {
      if (!isInitializing) {
        // Just set initial view position if data already exists and NO viewport was saved
         if (!initialViewport) {
           if (framework.layout === 'six_hats' || framework.layout === 'matrix_2x2') {
              setTransform({ x: window.innerWidth / 2 - 500, y: 100, scale: 0.8 }); 
            } else {
              setTransform({ x: 100, y: 100, scale: 1 });
            }
         }
        return;
      }

      try {
        const initialSections = await initializeBoard(problem.text, framework);
        setSections(initialSections);
        addToast("Workspace generated successfully", 'success');
        
        // Initial positioning based on layout
        if (framework.layout === 'six_hats' || framework.layout === 'matrix_2x2') {
          setTransform({ x: window.innerWidth / 2 - 500, y: 100, scale: 0.8 }); 
        } else {
          setTransform({ x: 100, y: 100, scale: 1 });
        }
      } catch (error) {
        addToast("Failed to generate workspace. Please try again.", 'error');
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, [problem.text, framework]);

  // --- Canvas Interaction Logic ---

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
    }

    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    const newScale = Math.min(Math.max(0.2, transform.scale + delta), 3);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldX = (mouseX - transform.x) / transform.scale;
      const worldY = (mouseY - transform.y) / transform.scale;

      const newX = mouseX - worldX * newScale;
      const newY = mouseY - worldY * newScale;

      setTransform({
        x: newX,
        y: newY,
        scale: newScale
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      setIsDragging(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      document.body.style.cursor = 'grabbing';
    }
    setShowTemplatesMenu(false); // Close menu on canvas click
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && lastMousePos.current) {
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;

      setTransform(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));

      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    lastMousePos.current = null;
    document.body.style.cursor = 'default';
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      lastMousePos.current = null;
      document.body.style.cursor = 'default';
    }
  };

  const resetView = () => {
    if (framework.layout === 'six_hats' || framework.layout === 'matrix_2x2') {
       setTransform({ x: window.innerWidth / 2 - 500, y: 100, scale: 0.8 });
    } else {
       setTransform({ x: 100, y: 100, scale: 1 });
    }
  };
  
  const handleManualSave = () => {
    onSaveState(sections, transform);
    addToast("Layout and content saved", 'success');
  };

  const handleExport = () => {
    const data = {
      problem: problem.text,
      framework: framework.name,
      date: new Date().toISOString(),
      sections: sections,
      viewport: transform
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `think-tank-session-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Session exported successfully", 'success');
  };

  // --- Template Logic ---

  const triggerSaveTemplate = (section: CanvasSection) => {
    const name = window.prompt("Enter a name for this template:", section.title);
    if (name) {
      onSaveTemplate(section, name);
    }
  };

  const handleAddTemplateToCanvas = (template: SectionTemplate) => {
    const newSection: CanvasSection = {
      id: Math.random().toString(36).substr(2, 9),
      title: template.data.title,
      description: template.data.description,
      notes: template.data.notes.map(n => ({
        id: Math.random().toString(36).substr(2, 9),
        content: n.content,
        color: n.color,
        isAiGenerated: false
      }))
    };
    
    setSections(prev => [...prev, newSection]);
    setShowTemplatesMenu(false);
    addToast(`Added "${template.name}" to canvas`, 'success');
  };

  // --- Note Logic ---

  const handleAddNote = (sectionId: string) => {
    const newNote: CanvasNote = {
      id: Math.random().toString(36).substr(2, 9),
      content: '',
      color: 'white',
      isAiGenerated: false
    };
    
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, notes: [...s.notes, newNote] } : s
    ));
  };

  const handleUpdateNote = (sectionId: string, noteId: string, content: string) => {
    setSections(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        notes: section.notes.map(note => 
          note.id === noteId ? { ...note, content } : note
        )
      };
    }));
  };

  const handleDeleteNote = (sectionId: string, noteId: string) => {
    setSections(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        notes: section.notes.filter(n => n.id !== noteId)
      };
    }));
    addToast("Note deleted", 'info');
  };

  const handleMoveNote = (noteId: string, sourceSectionId: string, destSectionId: string) => {
    if (sourceSectionId === destSectionId) return;

    let noteToMove: CanvasNote | undefined;
    
    // Remove from source
    const newSections = sections.map(section => {
      if (section.id === sourceSectionId) {
        noteToMove = section.notes.find(n => n.id === noteId);
        return {
          ...section,
          notes: section.notes.filter(n => n.id !== noteId)
        };
      }
      return section;
    });

    // Add to destination
    if (noteToMove) {
      setSections(newSections.map(section => {
        if (section.id === destSectionId) {
          return {
            ...section,
            notes: [...section.notes, noteToMove!]
          };
        }
        return section;
      }));
    }
  };

  // --- Drag and Drop Handlers ---

  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault(); // Necessary to allow dropping
    if (dragOverSectionId !== sectionId) {
      setDragOverSectionId(sectionId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    setDragOverSectionId(null);
  };

  const handleDrop = (e: React.DragEvent, destSectionId: string) => {
    e.preventDefault();
    setDragOverSectionId(null);
    const noteId = e.dataTransfer.getData('noteId');
    const sourceSectionId = e.dataTransfer.getData('sourceSectionId');
    
    if (noteId && sourceSectionId) {
      handleMoveNote(noteId, sourceSectionId, destSectionId);
    }
  };

  const handleAiBrainstorm = async (section: CanvasSection) => {
    setIsBrainstorming(section.id);
    try {
      const existingContent = section.notes.map(n => n.content);
      const newNotes = await generateSectionIdeas(problem.text, framework, section.title, existingContent);
      
      setSections(prev => prev.map(s => 
        s.id === section.id ? { ...s, notes: [...s.notes, ...newNotes] } : s
      ));
      addToast("Added 3 new insights", 'success');
    } catch (e) {
      addToast("Failed to generate ideas", 'error');
    } finally {
      setIsBrainstorming(null);
    }
  };

  const renderSection = (section: CanvasSection, index: number) => {
    const style = getSectionStyle(framework.layout, index, section.title);
    const isDragTarget = dragOverSectionId === section.id;
    
    return (
      <div 
        key={section.id} 
        className={`w-[400px] flex flex-col flex-shrink-0 bg-white/40 border rounded-2xl shadow-xl backdrop-blur-sm select-text transition-all duration-300 hover:shadow-2xl ${style.borderColor} ${isDragTarget ? 'ring-2 ring-indigo-500 scale-[1.02]' : 'hover:-translate-y-1'}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Section Header */}
        <div className={`p-6 border-b ${style.borderColor} ${style.headerBg} backdrop-blur-md rounded-t-2xl relative group/header`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-serif text-2xl font-bold ${style.titleColor}`}>{section.title}</h3>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${style.badge}`}>
                {framework.layout === 'matrix_2x2' ? `Q${index + 1}` : `0${index + 1}`}
              </span>
              <button 
                onClick={() => triggerSaveTemplate(section)}
                className={`opacity-0 group-hover/header:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-black/10 ${style.titleColor}`}
                title="Save as Template"
              >
                <Bookmark size={14} />
              </button>
            </div>
          </div>
          <p className={`text-sm leading-relaxed opacity-90 font-medium ${style.titleColor === 'text-white' ? 'text-gray-200' : 'text-stone-500'}`}>
            {section.description}
          </p>
        </div>

        {/* Notes Container - Drop Zone */}
        <div 
          className={`flex-1 min-h-[300px] max-h-[700px] overflow-y-auto p-5 space-y-4 custom-scrollbar bg-stone-50/20 transition-colors ${isDragTarget ? 'bg-indigo-50/30' : ''}`}
          onDragOver={(e) => handleDragOver(e, section.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, section.id)}
        >
          {section.notes.map(note => (
            <StickyNote 
              key={note.id} 
              note={note} 
              sectionId={section.id}
              onUpdate={(id, content) => handleUpdateNote(section.id, id, content)}
              onDelete={(id) => handleDeleteNote(section.id, id)}
            />
          ))}
          
          {section.notes.length === 0 && !isDragTarget && (
            <div className="flex flex-col items-center justify-center py-16 opacity-40 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50 pointer-events-none">
              <Layout size={32} className="mb-3 text-stone-400" />
              <div className="mb-1 text-sm font-medium text-stone-500">Empty Section</div>
              <div className="text-xs text-stone-400">Add a note or ask AI</div>
            </div>
          )}

          {isDragTarget && section.notes.length === 0 && (
             <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-indigo-300 rounded-xl bg-indigo-50/50">
               <div className="text-sm font-bold text-indigo-400">Drop here</div>
             </div>
          )}
        </div>

        {/* Section Footer */}
        <div className={`p-4 border-t ${style.borderColor} bg-white/60 backdrop-blur-md rounded-b-2xl grid grid-cols-2 gap-4`}>
           <button 
             onClick={() => handleAddNote(section.id)}
             className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-100 hover:text-ink rounded-lg transition-colors"
           >
             <Plus size={16} /> Add Note
           </button>
           <button 
             onClick={() => handleAiBrainstorm(section)}
             disabled={!!isBrainstorming}
             className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
           >
             {isBrainstorming === section.id ? (
               <Spinner className="w-4 h-4 text-indigo-600" />
             ) : (
               <>
                <Sparkles size={16} /> Generate
               </>
             )}
           </button>
        </div>
      </div>
    );
  };

  const renderBoardLayout = () => {
    // If user added custom templates beyond strict framework limits, allow wrapping
    if (framework.layout === 'matrix_2x2') {
      return (
        <div className="grid grid-cols-2 gap-12 p-24 min-w-[900px]">
          {sections.map((s, i) => renderSection(s, i))}
        </div>
      );
    }
    
    if (framework.layout === 'six_hats') {
       return (
        <div className="grid grid-cols-3 gap-12 p-24 min-w-[1300px]">
          {sections.map((s, i) => renderSection(s, i))}
        </div>
      );
    }

    // Default Linear
    return (
      <div className="flex gap-12 items-start p-24">
        {sections.map((s, i) => renderSection(s, i))}
      </div>
    );
  };

  if (isInitializing) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-paper">
        <div className="text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-stone-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-ink rounded-full animate-spin"></div>
          </div>
          <div>
            <h3 className="text-2xl font-serif text-ink">Designing workspace...</h3>
            <p className="text-stone-500 text-base mt-2">Applying {framework.name} architecture</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-89px)] bg-[#F4F4F4] overflow-hidden relative select-none">
      
      {/* Floating Toolbar - Glassmorphism */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-md shadow-2xl border border-stone-200/50 rounded-full px-6 py-2.5 z-50 flex items-center gap-4 animate-fade-in-up hover:shadow-3xl transition-shadow">
        
        {/* Back Button */}
        <button 
          onClick={onBack} 
          className="p-2 hover:bg-stone-100/80 rounded-full text-stone-500 hover:text-ink transition-colors mr-1" 
          title="Exit Session"
        >
          <ArrowLeft size={18} />
        </button>
        
        <div className="w-px h-5 bg-stone-200 mx-1 hidden md:block"></div>

        <div className="flex items-center gap-3 mr-4 border-r border-stone-200 pr-4 hidden md:flex">
          <Layout size={18} className="text-stone-400" />
          <span className="text-sm font-serif font-bold text-ink">{framework.name}</span>
          {framework.layout !== 'linear' && (
             <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
               {framework.layout.replace('_', ' ')}
             </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
           <button 
             onClick={handleManualSave}
             className="p-2 hover:bg-stone-100/80 rounded-full text-stone-500 hover:text-ink transition-colors"
             title="Save View Layout"
           >
             <Save size={18} />
           </button>

           <div className="w-px h-5 bg-stone-200 mx-1"></div>

           <button 
             onClick={resetView}
             className="p-2 hover:bg-stone-100/80 rounded-full text-stone-500 hover:text-ink transition-colors"
             title="Reset View"
           >
             <Move size={18} />
           </button>
           <div className="w-px h-5 bg-stone-200 mx-1"></div>
           <button 
             onClick={() => setTransform(t => ({...t, scale: Math.max(0.2, t.scale - 0.2)}))}
             className="p-2 hover:bg-stone-100/80 rounded-full text-stone-500 hover:text-ink transition-colors"
           >
             <ZoomOut size={18} />
           </button>
           <span className="text-xs font-mono w-10 text-center text-stone-400 font-medium">
             {Math.round(transform.scale * 100)}%
           </span>
           <button 
             onClick={() => setTransform(t => ({...t, scale: Math.min(3, t.scale + 0.2)}))}
             className="p-2 hover:bg-stone-100/80 rounded-full text-stone-500 hover:text-ink transition-colors"
           >
             <ZoomIn size={18} />
           </button>
           
           <div className="w-px h-5 bg-stone-200 mx-1"></div>
           
           {/* Template Menu Trigger */}
           <div className="relative">
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 setShowTemplatesMenu(!showTemplatesMenu);
               }}
               className={`p-2 rounded-full transition-colors ${showTemplatesMenu ? 'bg-ink text-white' : 'hover:bg-stone-100/80 text-stone-500 hover:text-ink'}`}
               title="Templates"
             >
               <Bookmark size={18} />
             </button>
             
             {showTemplatesMenu && (
               <div 
                 className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-72 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-stone-200/50 overflow-hidden ring-1 ring-black/5"
                 onMouseDown={(e) => e.stopPropagation()}
               >
                 <div className="p-3 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                   <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider">Saved Templates</span>
                   <span className="text-[10px] text-stone-400 font-mono">{templates.length}</span>
                 </div>
                 <div className="max-h-64 overflow-y-auto custom-scrollbar">
                   {templates.length === 0 ? (
                     <div className="p-8 text-center text-xs text-stone-400 leading-relaxed">
                       No templates saved yet.<br/>
                       <span className="opacity-70">Bookmark a section to reuse it later.</span>
                     </div>
                   ) : (
                     <div className="divide-y divide-stone-100">
                       {templates.map(t => (
                         <div key={t.id} className="p-3 hover:bg-stone-50/80 flex items-center justify-between group transition-colors">
                           <button 
                             onClick={() => handleAddTemplateToCanvas(t)}
                             className="text-left flex-1"
                           >
                             <div className="text-sm font-semibold text-ink truncate w-48">{t.name}</div>
                             <div className="text-[10px] text-stone-400 truncate w-48 mt-0.5">{t.data.title}</div>
                           </button>
                           <button 
                             onClick={() => onDeleteTemplate(t.id)}
                             className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                             title="Delete Template"
                           >
                             <Trash2 size={14} />
                           </button>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </div>
             )}
           </div>

           <button 
             onClick={handleExport}
             className="p-2 hover:bg-stone-100/80 rounded-full text-stone-500 hover:text-ink transition-colors"
             title="Export JSON"
           >
             <Download size={18} />
           </button>
        </div>
      </div>
      
      {/* Auto Save Indicator */}
      <div className="absolute bottom-6 right-6 z-40 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-300 pointer-events-none">
         <Save size={12} />
         <span>Auto-saving</span>
      </div>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden relative"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          backgroundColor: '#F4F4F4',
        }}
      >
        {/* Dot Grid Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(#78716C 1.5px, transparent 1.5px)',
            backgroundSize: `${24 * transform.scale}px ${24 * transform.scale}px`,
            backgroundPosition: `${transform.x}px ${transform.y}px`,
          }}
        />

        {/* Transformable World */}
        <div 
          className="absolute origin-top-left transition-transform duration-75 ease-out will-change-transform"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          }}
        >
          {renderBoardLayout()}
        </div>
      </div>
    </div>
  );
};
