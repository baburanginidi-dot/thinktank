
/**
 * Represents the user's initial problem statement.
 */
export interface ProblemStatement {
  /** The text of the problem. */
  text: string;
  /** The timestamp when the problem was submitted. */
  timestamp: number;
}

/**
 * Defines the possible layouts for a workspace.
 */
export type FrameworkLayout = 'linear' | 'matrix_2x2' | 'six_hats';

/**
 * Represents a problem-solving framework.
 */
export interface Framework {
  id: string;
  name: string;
  category: 'Technical' | 'Product' | 'Mental Model' | 'Strategic' | 'Scientific';
  description: string;
  /** AI-generated explanation of why this framework is relevant. */
  relevance: string;
  /** The steps or stages of the framework. */
  steps: string[];
  layout: FrameworkLayout;
}

/**
 * Represents a chat message (not currently used).
 */
export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

/**
 * Defines the different views or pages in the application.
 */
export enum AppView {
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  FRAMEWORK_SELECTION = 'FRAMEWORK_SELECTION',
  WORKSPACE = 'WORKSPACE',
  METHODOLOGY = 'METHODOLOGY',
  METHODOLOGY_DETAIL = 'METHODOLOGY_DETAIL',
  ABOUT = 'ABOUT',
  HISTORY = 'HISTORY',
}

/**
 * Defines the available colors for sticky notes.
 */
export type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'orange' | 'white';

/**
 * Represents a single sticky note on the canvas.
 */
export interface CanvasNote {
  id: string;
  content: string;
  color: NoteColor;
  isAiGenerated?: boolean;
}

/**
 * Represents a section or column in the workspace.
 */
export interface CanvasSection {
  id: string;
  title: string;
  /** Contextual guidance for this specific problem. */
  description: string;
  notes: CanvasNote[];
}

/**
 * Represents a user-saved template of a section.
 */
export interface SectionTemplate {
  id: string;
  /** User-defined name for the template. */
  name: string;
  createdAt: number;
  data: {
    title: string;
    description: string;
    notes: { content: string; color: NoteColor }[];
  };
}

/**
 * Represents the state of the workspace viewport (pan and zoom).
 */
export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

/**
 * Represents a saved session in the user's history.
 */
export interface SavedSession {
  id: string;
  problem: ProblemStatement;
  framework: Framework;
  sections: CanvasSection[];
  viewport?: Viewport;
  lastModified: number;
}

/**
 * Represents an authenticated user.
 */
export interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * Represents the state of the workspace (not currently used).
 */
export interface WorkspaceState {
  sections: CanvasSection[];
  scale: number;
}
