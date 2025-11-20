import React, { useEffect, useState, useRef } from 'react';
import { Framework, ProblemStatement, CanvasSection, CanvasNote, SectionTemplate } from '../types';
import { initializeBoard, generateSectionIdeas } from '../services/geminiService';
import { StickyNote } from '../components/StickyNote';
import { Plus, Sparkles, ZoomIn, ZoomOut, Layout, Move, Download, Save, Bookmark, Trash2, GripVertical, ArrowLeft } from 'lucide-react';
import { Spinner } from '../components/Spinner';

interface WorkspaceProps {
  problem: ProblemStatement;
  framework: Framework;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onSaveState: (sections: CanvasSection[]) => void;
  initialSections?: CanvasSection[];
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

// Configuration for specific layouts
const getSectionStyle = (frameworkLayout: string, index: number, title: string) => {
  const titleLower = title.toLowerCase();
  
  if (frameworkLayout === 'six_hats') {
    // Color mapping for Six Thinking Hats
    if (titleLower.includes('white') || titleLower.includes('data')) return { borderColor: 'border-stone-300', headerBg: 'bg-stone-100', titleColor: 'text-stone-700', iconColor: 'text-stone-400' };
    if (titleLower.includes('red') || titleLower.includes('emotion')) return { borderColor: 'border-red-200', headerBg: 'bg-red-50', titleColor: 'text-red-700', iconColor: 'text-red-400' };
    if (titleLower.includes('black') || titleLower.includes('caution')) return { borderColor: 'border-stone-700', headerBg: 'bg-stone-800', titleColor: 'text-white', iconColor: 'text-stone-400' };
    if (titleLower.includes('yellow') || titleLower.includes('positive')) return { borderColor: 'border-yellow-300', headerBg: 'bg-yellow-50', titleColor: 'text-yellow-700', iconColor: 'text-yellow-500' };
    if (titleLower.includes('green') || titleLower.includes('create')) return { borderColor: 'border-green-300', headerBg: 'bg-green-50', titleColor: 'text-green-700', iconColor: 'text-green-500' };
    if (titleLower.includes('blue') || titleLower.includes('process')) return { borderColor: 'border-blue-300', headerBg: 'bg-blue-50', titleColor: 'text-blue-700', iconColor: 'text-blue-500' };
    
    // Fallback map based on index
    const map = [
       { borderColor: 'border-stone-300', headerBg: 'bg-stone-100', titleColor: 'text-stone-700' }, // White
       { borderColor: 'border-red-200', headerBg: 'bg-red-50', titleColor: 'text-red-700' }, // Red
       { borderColor: 'border-stone-700', headerBg: 'bg-stone-800', titleColor: 'text-white' }, // Black
       { borderColor: 'border-yellow-300', headerBg: 'bg-yellow-50', titleColor: 'text-yellow-700' }, // Yellow
       { borderColor: 'border-green-300', headerBg: 'bg-green-50', titleColor: 'text-green-700' }, // Green
       { borderColor: 'border-blue-300', headerBg: 'bg-blue-50', titleColor: 'text-blue-700' }, // Blue
    ];
    return map[index % 6];
  }

  if (frameworkLayout === 'matrix_2x2') {
    const map = [
      { borderColor: 'border-emerald-200', headerBg: 'bg-emerald-50', titleColor: 'text-emerald-800' },
      { borderColor: 'border-rose-200', headerBg: 'bg-rose-50', titleColor: 'text-rose-800' },
      { borderColor: 'border-blue-200', headerBg: 'bg-blue-50', titleColor: 'text-blue-800' },
      { borderColor: 'border-amber-200', headerBg: 'bg-amber-50', titleColor: 'text-amber-800' },
    ];
    return map[index % 4];
  }

  // Default Linear
  return { borderColor: 'border-stone-200', headerBg: 'bg-white', titleColor: 'text-ink' };
};

export const Workspace: React.FC<WorkspaceProps> = ({ 
  problem, 
  framework, 
  addToast, 
  onSaveState, 
  initialSections,
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  onBack
}) => {
  const [sections, setSections] = useState<CanvasSection[]>(initialSections || []);
  const [isInitializing, setIsInitializing] = useState(!initialSections || initialSections.length === 0);
  const [isBrainstorming, setIsBrainstorming] = useState<string | null>(null);
  const [showTemplatesMenu, setShowTemplatesMenu] = useState(false);
  
  // Canvas State
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef<{ x: number, y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced Save
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (sections.length > 0) {
        onSaveState(sections);
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [sections, onSaveState]);

  // Initialize the board with AI if no initial sections
  useEffect(() => {
    const init = async () => {
      if (!isInitializing) {
        // Just set initial view position if data already exists
         if (framework.layout === 'six_hats' || framework.layout === 'matrix_2x2') {
            setTransform({ x: window.innerWidth / 2 - 500, y: 100, scale: 0.8 }); 
          } else {
            setTransform({ x: 100, y: 100, scale: 1 });
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

  const handleExport = () => {
    const data = {
      problem: problem.text,
      framework: framework.name,
      date: new Date().toISOString(),
      sections: sections
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
    
    return (
      <div 
        key={section.id} 
        className={`w-[380px] flex flex-col flex-shrink-0 bg-white/50 border rounded-xl shadow-lg backdrop-blur-sm select-text transition-shadow hover:shadow-xl ${style.borderColor}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Section Header */}
        <div className={`p-5 border-b ${style.borderColor} ${style.headerBg} rounded-t-xl relative group/header`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-serif text-xl font-bold ${style.titleColor}`}>{section.title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold opacity-50 uppercase tracking-wider">
                {framework.layout === 'matrix_2x2' ? `Q${index + 1}` : `Step ${index + 1}`}
              </span>
              <button 
                onClick={() => triggerSaveTemplate(section)}
                className={`opacity-0 group-hover/header:opacity-100 transition-opacity p-1 rounded hover:bg-black/5 ${style.titleColor}`}
                title="Save as Template"
              >
                <Bookmark size={14} />
              </button>
            </div>
          </div>
          <p className={`text-sm leading-relaxed opacity-80 ${style.titleColor === 'text-white' ? 'text-gray-300' : 'text-stone-500'}`}>
            {section.description}
          </p>
        </div>

        {/* Notes Container */}
        <div className="flex-1 min-h-[240px] max-h-[600px] overflow-y-auto p-4 space-y-4 custom-scrollbar bg-stone-50/30">
          {section.notes.map(note => (
            <StickyNote 
              key={note.id} 
              note={note} 
              onUpdate={(id, content) => handleUpdateNote(section.id, id, content)}
              onDelete={(id) => handleDeleteNote(section.id, id)}
            />
          ))}
          
          {section.notes.length === 0 && (
            <div className="text-center py-12 opacity-40 border-2 border-dashed border-stone-200 rounded-lg">
              <div className="mb-2 text-sm">Empty Canvas</div>
              <div className="text-xs">Add a note to start</div>
            </div>
          )}
        </div>

        {/* Section Footer */}
        <div className={`p-3 border-t ${style.borderColor} bg-white/50 rounded-b-xl grid grid-cols-2 gap-3`}>
           <button 
             onClick={() => handleAddNote(section.id)}
             className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-md transition-colors"
           >
             <Plus size={16} /> Add Note
           </button>
           <button 
             onClick={() => handleAiBrainstorm(section)}
             disabled={!!isBrainstorming}
             className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-50"
           >
             {isBrainstorming === section.id ? (
               <Spinner className="w-4 h-4 text-indigo-600" />
             ) : (
               <Sparkles size={16} />
             )}
             Generate
           </button>
        </div>
      </div>
    );
  };

  const renderBoardLayout = () => {
    // If user added custom templates beyond strict framework limits, allow wrapping
    if (framework.layout === 'matrix_2x2') {
      return (
        <div className="grid grid-cols-2 gap-8 p-20 min-w-[800px]">
          {sections.map((s, i) => renderSection(s, i))}
        </div>
      );
    }
    
    if (framework.layout === 'six_hats') {
       return (
        <div className="grid grid-cols-3 gap-8 p-20 min-w-[1200px]">
          {sections.map((s, i) => renderSection(s, i))}
        </div>
      );
    }

    // Default Linear
    return (
      <div className="flex gap-16 items-start p-20">
        {sections.map((s, i) => renderSection(s, i))}
      </div>
    );
  };

  if (isInitializing) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-paper">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-stone-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-ink rounded-full animate-spin"></div>
          </div>
          <div>
            <h3 className="text-xl font-serif text-ink">Designing your workspace...</h3>
            <p className="text-stone-500 text-sm mt-2">Applying {framework.name} to your context.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-89px)] bg-[#F4F4F4] overflow-hidden relative select-none">
      
      {/* Floating Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-xl border border-stone-200 rounded-full px-6 py-2 z-50 flex items-center gap-4 animate-fade-in-up">
        
        {/* Back Button (New) */}
        <button 
          onClick={onBack} 
          className="p-2 hover:bg-stone-100 rounded-full text-stone-600 mr-2" 
          title="Exit Session"
        >
          <ArrowLeft size={18} />
        </button>
        
        <div className="w-px h-4 bg-stone-200 mx-1 hidden md:block"></div>

        <div className="flex items-center gap-2 mr-4 border-r border-stone-200 pr-4 hidden md:flex">
          <Layout size={16} className="text-stone-500" />
          <span className="text-sm font-serif font-semibold text-ink">{framework.name}</span>
          {framework.layout !== 'linear' && (
             <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full ml-2 uppercase tracking-wider">
               {framework.layout.replace('_', ' ')} View
             </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
           <button 
             onClick={resetView}
             className="p-2 hover:bg-stone-100 rounded-full text-stone-600"
             title="Reset View"
           >
             <Move size={16} />
           </button>
           <div className="w-px h-4 bg-stone-200 mx-1"></div>
           <button 
             onClick={() => setTransform(t => ({...t, scale: Math.max(0.2, t.scale - 0.2)}))}
             className="p-2 hover:bg-stone-100 rounded-full text-stone-600"
           >
             <ZoomOut size={18} />
           </button>
           <span className="text-xs font-mono w-12 text-center text-stone-500">
             {Math.round(transform.scale * 100)}%
           </span>
           <button 
             onClick={() => setTransform(t => ({...t, scale: Math.min(3, t.scale + 0.2)}))}
             className="p-2 hover:bg-stone-100 rounded-full text-stone-600"
           >
             <ZoomIn size={18} />
           </button>
           
           <div className="w-px h-4 bg-stone-200 mx-1"></div>
           
           {/* Template Menu Trigger */}
           <div className="relative">
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 setShowTemplatesMenu(!showTemplatesMenu);
               }}
               className={`p-2 rounded-full transition-colors ${showTemplatesMenu ? 'bg-ink text-white' : 'hover:bg-stone-100 text-stone-600'}`}
               title="Templates"
             >
               <Bookmark size={18} />
             </button>
             
             {showTemplatesMenu && (
               <div 
                 className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-64 bg-white rounded-lg shadow-xl border border-stone-200 overflow-hidden"
                 onMouseDown={(e) => e.stopPropagation()}
               >
                 <div className="p-3 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                   <span className="text-xs font-bold uppercase text-stone-500">Saved Templates</span>
                   <span className="text-[10px] text-stone-400">{templates.length} saved</span>
                 </div>
                 <div className="max-h-64 overflow-y-auto custom-scrollbar">
                   {templates.length === 0 ? (
                     <div className="p-6 text-center text-xs text-stone-400">
                       No templates saved yet.<br/>
                       Click the bookmark icon on any section header to save it.
                     </div>
                   ) : (
                     <div className="divide-y divide-stone-100">
                       {templates.map(t => (
                         <div key={t.id} className="p-3 hover:bg-stone-50 flex items-center justify-between group">
                           <button 
                             onClick={() => handleAddTemplateToCanvas(t)}
                             className="text-left flex-1"
                           >
                             <div className="text-sm font-medium text-ink truncate w-40">{t.name}</div>
                             <div className="text-[10px] text-stone-400 truncate w-40">{t.data.title}</div>
                           </button>
                           <button 
                             onClick={() => onDeleteTemplate(t.id)}
                             className="p-1.5 text-stone-300 hover:text-red-500 rounded transition-colors"
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
             className="p-2 hover:bg-stone-100 rounded-full text-stone-600"
             title="Export JSON"
           >
             <Download size={18} />
           </button>
        </div>
      </div>
      
      {/* Auto Save Indicator */}
      <div className="absolute bottom-4 right-4 z-40 flex items-center gap-2 text-xs text-stone-400">
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
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'radial-gradient(#A8A29E 1px, transparent 1px)',
            backgroundSize: `${20 * transform.scale}px ${20 * transform.scale}px`,
            backgroundPosition: `${transform.x}px ${transform.y}px`,
          }}
        />

        {/* Transformable World */}
        <div 
          className="absolute origin-top-left transition-transform duration-75 ease-out"
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