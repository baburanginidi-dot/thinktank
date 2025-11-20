export interface ProblemStatement {
  text: string;
  timestamp: number;
}

export type FrameworkLayout = 'linear' | 'matrix_2x2' | 'six_hats';

export interface Framework {
  id: string;
  name: string;
  category: 'Technical' | 'Product' | 'Mental Model' | 'Strategic' | 'Scientific';
  description: string;
  relevance: string;
  steps: string[];
  layout: FrameworkLayout;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export enum AppView {
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  FRAMEWORK_SELECTION = 'FRAMEWORK_SELECTION',
  WORKSPACE = 'WORKSPACE',
  METHODOLOGY = 'METHODOLOGY',
  ABOUT = 'ABOUT',
}

export type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'orange' | 'white';

export interface CanvasNote {
  id: string;
  content: string;
  color: NoteColor;
  isAiGenerated?: boolean;
}

export interface CanvasSection {
  id: string;
  title: string;
  description: string; // Contextual guidance for this specific problem
  notes: CanvasNote[];
}

export interface SectionTemplate {
  id: string;
  name: string; // User defined name
  createdAt: number;
  data: {
    title: string;
    description: string;
    notes: { content: string; color: NoteColor }[];
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface WorkspaceState {
  sections: CanvasSection[];
  scale: number;
}