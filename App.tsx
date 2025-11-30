
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
import { AdminDashboard } from './views/AdminDashboard';
import { AppView, Framework, ProblemStatement, CanvasSection, SectionTemplate, NoteColor, User, SavedSession, Viewport } from './types';
import { suggestFrameworks } from './services/geminiService';
import { api } from './services/api';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';

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
    const initAuth = async () => {
      // Check if token exists
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        api.setToken(storedToken);
        // For now, assume valid token (in production, validate with backend)
        const storedUser = localStorage.getItem('user_data');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          await loadUserData();
          setView(AppView.HOME);
        }
      } else {
        if (![AppView.METHODOLOGY, AppView.METHODOLOGY_DETAIL, AppView.ABOUT, AppView.LOGIN].includes(view)) {
          setView(AppView.METHODOLOGY);
        }
      }
      setIsAuthChecked(true);
    };

    initAuth();
  }, []);

  const loadUserData = async () => {
    try {
      // Load History from API
      const sessions = await api.getSessions();
      setHistory(sessions);

      // Load Templates from API
      const templates = await api.getTemplates();
      setTemplates(templates);
    } catch (e) {
      console.error("Failed to load user data", e);
      addToast("Failed to load your data", "error");
    }
  };

  const handleLogin = async (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('user_data', JSON.stringify(newUser));
    await loadUserData();
    
    addToast(`Welcome back, ${newUser.name}`, 'success');

    // Handle Pending Actions (e.g., started a template while guest)
    if (pendingTemplate) {
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
    localStorage.removeItem('user_data');
    api.clearToken();
    setView(AppView.METHODOLOGY);
    addToast("Signed out successfully", 'info');
  };

  // Helper to save current state to history array
  const saveToHistory = async (
    currentId: string, 
    currentProblem: ProblemStatement, 
    currentFramework: Framework, 
    currentSections: CanvasSection[],
    currentViewport?: Viewport
  ) => {
    if (!user) return;
    try {
      const saved = await api.saveSession({
        id: currentId,
        problemText: currentProblem.text,
        frameworkData: currentFramework,
        sectionsData: currentSections,
        viewportData: currentViewport
      });

      setHistory(prev => {
        const existingIndex = prev.findIndex(s => s.id === currentId);
        if (existingIndex >= 0) {
          const newHistory = [...prev];
          newHistory[existingIndex] = saved;
          return newHistory;
        } else {
          return [saved, ...prev];
        }
      });
    } catch (e) {
      console.error("Failed to save session", e);
    }
  };

  const persistTemplates = async (newTemplates: SectionTemplate[]) => {
    setTemplates(newTemplates);
  };


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

  const handleAdminClick = () => {
    if (user && user.isAdmin) {
      setView(AppView.ADMIN);
    }
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
    } else if (view === AppView.ADMIN) {
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
  const protectedViews = [AppView.HOME, AppView.WORKSPACE, AppView.FRAMEWORK_SELECTION, AppView.HISTORY, AppView.ADMIN];
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
        onAdminClick={handleAdminClick}
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

      {view === AppView.ADMIN && user?.isAdmin && (
        <AdminDashboard 
          user={user}
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
