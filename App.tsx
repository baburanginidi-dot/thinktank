
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Home } from './views/Home';
import { FrameworkSelection } from './views/FrameworkSelection';
import { Workspace } from './views/Workspace';
import { Methodology } from './views/Methodology';
import { MethodologyDetail } from './views/MethodologyDetail';
import { About } from './views/About';
import { History } from './views/History';
import { Login } from './views/Login';
import { AppView, Framework, ProblemStatement, CanvasSection, SectionTemplate, NoteColor, User, SavedSession, Viewport } from './types';
import { suggestFrameworks } from './services/geminiService';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';

const STORAGE_KEY = 'think_tank_session_v1';
const HISTORY_KEY = 'think_tank_history_v1';
const TEMPLATES_KEY = 'think_tank_templates_v1';
const USER_KEY = 'think_tank_user_v1';

export const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // App State
  // Default to Methodology (Landing Page) instead of Login
  const [view, setView] = useState<AppView>(AppView.METHODOLOGY);
  
  // Current Session State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [problem, setProblem] = useState<ProblemStatement | null>(null);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [savedSections, setSavedSections] = useState<CanvasSection[]>([]);
  const [savedViewport, setSavedViewport] = useState<Viewport | undefined>(undefined);
  
  // Global Data
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [templates, setTemplates] = useState<SectionTemplate[]>([]);
  const [history, setHistory] = useState<SavedSession[]>([]);

  // Navigation Data
  const [selectedMethodology, setSelectedMethodology] = useState<Framework | null>(null);
  const [pendingTemplate, setPendingTemplate] = useState<Framework | null>(null);

  // --- Auth & Persistence Logic ---

  useEffect(() => {
    // Check Auth
    const storedUser = localStorage.getItem(USER_KEY);
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Load User Data
      loadUserData();

      // Restore active session if exists
      const savedSession = localStorage.getItem(STORAGE_KEY);
      if (savedSession) {
        try {
          const data = JSON.parse(savedSession);
          if (data.problem && data.framework) {
             setSessionId(data.sessionId || Math.random().toString(36).substr(2, 9));
             setProblem(data.problem);
             setSelectedFramework(data.framework);
             setSavedSections(data.sections || []);
             setSavedViewport(data.viewport);
             setFrameworks(data.frameworks || []);
             
             // If they were on a protected view, restore it. Otherwise default to Home.
             if (data.view && [AppView.WORKSPACE, AppView.FRAMEWORK_SELECTION].includes(data.view)) {
                setView(data.view);
             } else {
                setView(AppView.HOME);
             }
          } else {
            setView(AppView.HOME);
          }
        } catch (e) {
          setView(AppView.HOME);
        }
      } else {
        setView(AppView.HOME);
      }
    } else {
      // GUEST MODE
      // Ensure we are on a public view. If not, default to Methodology (Landing)
      if (![AppView.METHODOLOGY, AppView.METHODOLOGY_DETAIL, AppView.ABOUT, AppView.LOGIN].includes(view)) {
        setView(AppView.METHODOLOGY);
      }
    }
    setIsAuthChecked(true);

  }, []);

  const loadUserData = () => {
    // Load History
    const storedHistory = localStorage.getItem(HISTORY_KEY);
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }

    // Load Templates
    const savedTemplates = localStorage.getItem(TEMPLATES_KEY);
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (e) {
        console.error("Failed to load templates", e);
      }
    }
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    loadUserData();
    
    addToast(`Welcome back, ${newUser.name}`, 'success');

    // Handle Pending Actions (e.g., started a template while guest)
    if (pendingTemplate) {
      // Small delay to allow state update
      setTimeout(() => handleStartFromLibrary(pendingTemplate), 100);
      setPendingTemplate(null);
    } else {
      setView(AppView.HOME);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setProblem(null);
    setSelectedFramework(null);
    setFrameworks([]);
    setSavedSections([]);
    setSavedViewport(undefined);
    setSessionId(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setView(AppView.METHODOLOGY); // Redirect to public landing
    addToast("Signed out successfully", 'info');
  };

  // Helper to save current state to history array
  const saveToHistory = (
    currentId: string, 
    currentProblem: ProblemStatement, 
    currentFramework: Framework, 
    currentSections: CanvasSection[],
    currentViewport?: Viewport
  ) => {
    const sessionEntry: SavedSession = {
      id: currentId,
      problem: currentProblem,
      framework: currentFramework,
      sections: currentSections,
      viewport: currentViewport,
      lastModified: Date.now()
    };

    setHistory(prev => {
      const existingIndex = prev.findIndex(s => s.id === currentId);
      let newHistory;
      if (existingIndex >= 0) {
        newHistory = [...prev];
        newHistory[existingIndex] = sessionEntry;
      } else {
        newHistory = [sessionEntry, ...prev];
      }
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const persistSession = (override?: Partial<any>) => {
    if (!user) return; 
    
    // Don't persist if we are on public pages
    if ([AppView.METHODOLOGY, AppView.METHODOLOGY_DETAIL, AppView.ABOUT].includes(view)) return;

    // Save "Active State"
    const data = {
      sessionId,
      view: view === AppView.LOGIN ? AppView.HOME : view,
      problem,
      framework: selectedFramework,
      sections: savedSections,
      viewport: savedViewport,
      frameworks,
      ...override
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const persistTemplates = (newTemplates: SectionTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(newTemplates));
  };

  // Save session on view change or major state change
  useEffect(() => {
    if (user && view !== AppView.LOGIN) {
      persistSession();
    }
  }, [view, problem, selectedFramework, frameworks, savedSections, savedViewport, user, sessionId]);

  // --- Toast Logic ---

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Handlers ---

  const handleProblemSubmit = async (text: string) => {
    setIsLoading(true);
    setProblem({ text, timestamp: Date.now() });
    
    try {
      const suggestions = await suggestFrameworks(text);
      if (suggestions.length === 0) {
        throw new Error("No frameworks returned");
      }
      setFrameworks(suggestions);
      setView(AppView.FRAMEWORK_SELECTION);
      persistSession({ view: AppView.FRAMEWORK_SELECTION, problem: { text, timestamp: Date.now() }, frameworks: suggestions });
    } catch (e) {
      console.error("Failed to get suggestions", e);
      addToast("Failed to analyze problem. Check connection.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFrameworkSelect = (fw: Framework) => {
    setSelectedFramework(fw);
    setSavedSections([]); 
    setSavedViewport(undefined);
    setSessionId(Math.random().toString(36).substr(2, 9)); // New Session ID
    setView(AppView.WORKSPACE);
  };

  // Triggered from Methodology Detail
  const handleStartFromLibrary = (fw: Framework) => {
    if (!user) {
      setPendingTemplate(fw);
      setView(AppView.LOGIN);
      addToast("Please sign in to start a workspace", "info");
      return;
    }

    const placeholderProblem = "General Project";
    
    const newProblem = { text: placeholderProblem, timestamp: Date.now() };
    const newSessionId = Math.random().toString(36).substr(2, 9);

    setProblem(newProblem);
    setSelectedFramework(fw);
    setSavedSections([]); 
    setSavedViewport(undefined);
    setFrameworks([]); 
    setSessionId(newSessionId);
    setView(AppView.WORKSPACE);
    
    addToast(`Started new ${fw.name} session`, 'success');
  };

  const handleWorkspaceSave = (sections: CanvasSection[], viewport?: Viewport) => {
    setSavedSections(sections);
    if (viewport) {
      setSavedViewport(viewport);
    }
    
    // Auto-save to History
    if (sessionId && problem && selectedFramework) {
      saveToHistory(sessionId, problem, selectedFramework, sections, viewport);
    }
  };

  // History Handlers
  const handleOpenSession = (session: SavedSession) => {
    setSessionId(session.id);
    setProblem(session.problem);
    setSelectedFramework(session.framework);
    setSavedSections(session.sections);
    setSavedViewport(session.viewport);
    setFrameworks([]); // Clear suggestions as we are loading a defined state
    setView(AppView.WORKSPACE);
    addToast("Session loaded", 'success');
  };

  const handleDeleteSession = (id: string) => {
    setHistory(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
    
    // If deleted session is current active one, reset?
    if (sessionId === id) {
       handleHomeClick();
    }
    
    addToast("Session deleted", 'info');
  };

  const handleSaveTemplate = (section: CanvasSection, name: string) => {
    const newTemplate: SectionTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      createdAt: Date.now(),
      data: {
        title: section.title,
        description: section.description,
        notes: section.notes.map(n => ({ content: n.content, color: n.color }))
      }
    };
    const updated = [...templates, newTemplate];
    persistTemplates(updated);
    addToast("Template saved successfully", "success");
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    persistTemplates(updated);
    addToast("Template deleted", "info");
  };

  const handleHomeClick = () => {
    if (user) {
      setView(AppView.HOME);
    } else {
      setView(AppView.METHODOLOGY);
    }
  };
  
  const handleMethodologyClick = () => {
    setView(AppView.METHODOLOGY);
  };
  
  const handleMethodologyDetail = (fw: Framework) => {
    setSelectedMethodology(fw);
    setView(AppView.METHODOLOGY_DETAIL);
  };

  const handleHistoryClick = () => {
    setView(AppView.HISTORY);
  };

  const handleAboutClick = () => {
    setView(AppView.ABOUT);
  };

  const handleBack = () => {
    if (view === AppView.FRAMEWORK_SELECTION) {
      setView(AppView.HOME);
    } else if (view === AppView.METHODOLOGY) {
      setView(user ? AppView.HOME : AppView.METHODOLOGY);
    } else if (view === AppView.METHODOLOGY_DETAIL) {
      setView(AppView.METHODOLOGY);
    } else if (view === AppView.ABOUT) {
      setView(user ? AppView.HOME : AppView.METHODOLOGY);
    } else if (view === AppView.HISTORY) {
      setView(AppView.HOME);
    } else if (view === AppView.WORKSPACE) {
       // Save before exiting
       if (sessionId && problem && selectedFramework) {
          saveToHistory(sessionId, problem, selectedFramework, savedSections, savedViewport);
       }
       setView(AppView.HISTORY); 
    }
  };

  if (!isAuthChecked) return null; 

  // Explicit Login View
  if (view === AppView.LOGIN) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  // Auth Guard: Only block specific protected routes
  const protectedViews = [AppView.HOME, AppView.WORKSPACE, AppView.FRAMEWORK_SELECTION, AppView.HISTORY];
  if (!user && protectedViews.includes(view)) {
    return (
      <>
         <Login onLogin={handleLogin} />
         <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Header 
        user={user}
        onHomeClick={handleHomeClick} 
        onMethodologyClick={handleMethodologyClick}
        onHistoryClick={handleHistoryClick}
        onAboutClick={handleAboutClick}
        onLogout={handleLogout}
        onLoginClick={() => setView(AppView.LOGIN)}
      />
      
      {view === AppView.HOME && (
        <Home 
          onSubmit={handleProblemSubmit} 
          isLoading={isLoading} 
          initialInput={problem?.text}
        />
      )}
      
      {view === AppView.METHODOLOGY && (
        <Methodology 
          onViewDetails={handleMethodologyDetail}
          onBack={handleBack}
          showBackButton={!!user} // Only show 'Back to Home' if logged in
          onLogin={() => setView(AppView.LOGIN)} // Pass Login Handler
        />
      )}
      
      {view === AppView.METHODOLOGY_DETAIL && selectedMethodology && (
        <MethodologyDetail 
          framework={selectedMethodology}
          onUseTemplate={handleStartFromLibrary}
          onBack={handleBack}
        />
      )}

      {view === AppView.HISTORY && (
        <History 
          sessions={history}
          onOpenSession={handleOpenSession}
          onDeleteSession={handleDeleteSession}
          onBack={handleBack}
        />
      )}
      
      {view === AppView.ABOUT && (
        <About 
          onStart={() => {
            if (user) setView(AppView.HOME);
            else setView(AppView.LOGIN);
          }} 
          onBack={handleBack}
        />
      )}

      {view === AppView.FRAMEWORK_SELECTION && problem && (
        <FrameworkSelection 
          frameworks={frameworks} 
          onSelect={handleFrameworkSelect} 
          onBack={handleBack}
          problem={problem.text}
        />
      )}

      {view === AppView.WORKSPACE && problem && selectedFramework && (
        <Workspace 
          problem={problem} 
          framework={selectedFramework}
          addToast={addToast}
          onSaveState={handleWorkspaceSave}
          initialSections={savedSections.length > 0 ? savedSections : undefined}
          initialViewport={savedViewport}
          templates={templates}
          onSaveTemplate={handleSaveTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          onBack={handleBack}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};
