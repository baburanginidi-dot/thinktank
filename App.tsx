import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Home } from './views/Home';
import { FrameworkSelection } from './views/FrameworkSelection';
import { Workspace } from './views/Workspace';
import { Methodology } from './views/Methodology';
import { About } from './views/About';
import { Login } from './views/Login';
import { AppView, Framework, ProblemStatement, CanvasSection, SectionTemplate, NoteColor, User } from './types';
import { suggestFrameworks } from './services/geminiService';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';

const STORAGE_KEY = 'think_tank_session_v1';
const TEMPLATES_KEY = 'think_tank_templates_v1';
const USER_KEY = 'think_tank_user_v1';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // App State
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [problem, setProblem] = useState<ProblemStatement | null>(null);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [savedSections, setSavedSections] = useState<CanvasSection[]>([]);
  const [templates, setTemplates] = useState<SectionTemplate[]>([]);

  // --- Auth & Persistence Logic ---

  useEffect(() => {
    // Check Auth
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      // If user exists, check for session
      const savedSession = localStorage.getItem(STORAGE_KEY);
      if (savedSession) {
        try {
          const data = JSON.parse(savedSession);
          if (data.problem && data.framework) {
             setProblem(data.problem);
             setSelectedFramework(data.framework);
             setSavedSections(data.sections || []);
             setFrameworks(data.frameworks || []);
             setView(data.view || AppView.HOME);
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
      setView(AppView.LOGIN);
    }
    setIsAuthChecked(true);

    // Load Templates
    const savedTemplates = localStorage.getItem(TEMPLATES_KEY);
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (e) {
        console.error("Failed to load templates", e);
      }
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setView(AppView.HOME);
    addToast(`Welcome back, ${newUser.name}`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setProblem(null);
    setSelectedFramework(null);
    setFrameworks([]);
    setSavedSections([]);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setView(AppView.LOGIN);
    addToast("Signed out successfully", 'info');
  };

  const persistSession = (override?: Partial<any>) => {
    if (!user) return; // Don't save session if not logged in
    
    const data = {
      view: view === AppView.LOGIN ? AppView.HOME : view,
      problem,
      framework: selectedFramework,
      sections: savedSections,
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
  }, [view, problem, selectedFramework, frameworks, savedSections, user]);

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
    setSavedSections([]); // Clear previous sections if new framework
    setView(AppView.WORKSPACE);
  };

  const handleStartFromLibrary = (fw: Framework) => {
    const placeholderProblem = "General Project";
    
    setProblem({ text: placeholderProblem, timestamp: Date.now() });
    setSelectedFramework(fw);
    setSavedSections([]); 
    setFrameworks([]); // Clear specific frameworks as we are using library
    setView(AppView.WORKSPACE);
    
    addToast(`Started new ${fw.name} session`, 'success');
  };

  const handleWorkspaceSave = (sections: CanvasSection[]) => {
    setSavedSections(sections);
    // Persistence happens in useEffect
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
    if (problem && window.confirm("Starting over will clear your current session. Are you sure?")) {
      localStorage.removeItem(STORAGE_KEY);
      setProblem(null);
      setFrameworks([]);
      setSelectedFramework(null);
      setSavedSections([]);
    }
    setView(AppView.HOME);
  };
  
  const handleMethodologyClick = () => {
    setView(AppView.METHODOLOGY);
  };

  const handleAboutClick = () => {
    setView(AppView.ABOUT);
  };

  const handleBack = () => {
    if (view === AppView.FRAMEWORK_SELECTION) {
      setView(AppView.HOME);
    } else if (view === AppView.METHODOLOGY) {
      setView(AppView.HOME);
    } else if (view === AppView.ABOUT) {
      setView(AppView.HOME);
    } else if (view === AppView.WORKSPACE) {
       // If we have a list of frameworks (meaning we came from AI flow), go back there
       if (frameworks.length > 0) {
         setView(AppView.FRAMEWORK_SELECTION);
       } else {
         // Otherwise we came from Library or Load
         setView(AppView.METHODOLOGY); 
       }
    }
  };

  if (!isAuthChecked) return null; // Or a loading spinner

  // Render Login View
  if (view === AppView.LOGIN || !user) {
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
        onAboutClick={handleAboutClick}
        onLogout={handleLogout}
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
          onSelectFramework={handleStartFromLibrary} 
          onBack={handleBack}
        />
      )}
      
      {view === AppView.ABOUT && (
        <About 
          onStart={handleHomeClick} 
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

export default App;