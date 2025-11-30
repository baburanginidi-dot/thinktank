# Think Tank

## Overview
Think Tank is an AI-powered problem-solving workspace that helps users apply scientific frameworks and mental models to tackle complex challenges. The app provides a curated library of methodologies (SWOT, Design Thinking, Six Thinking Hats, etc.) and uses Google Gemini AI to suggest relevant frameworks and generate starter ideas.

## Tech Stack
- **Frontend Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **AI Integration**: Google Gemini API (@google/genai)
- **Styling**: Tailwind CSS (CDN)
- **UI Icons**: Lucide React
- **Markdown Rendering**: react-markdown

## Project Structure
```
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Header.tsx
│   ├── Spinner.tsx
│   ├── StickyNote.tsx
│   └── Toast.tsx
├── views/              # Main application views
│   ├── Home.tsx
│   ├── FrameworkSelection.tsx
│   ├── Workspace.tsx
│   ├── Methodology.tsx
│   ├── MethodologyDetail.tsx
│   ├── About.tsx
│   ├── History.tsx
│   ├── Login.tsx
│   └── AdminDashboard.tsx
├── services/           # API integration layer
│   └── geminiService.ts
├── data/              # Static data
│   └── library.ts
├── App.tsx            # Main application component
├── index.tsx          # Application entry point
├── types.ts           # TypeScript type definitions
└── vite.config.ts     # Vite configuration
```

## Configuration

### Environment Variables
- `GEMINI_API_KEY`: Required for AI-powered framework suggestions (stored in Replit Secrets)

### Vite Configuration
The app is configured to run on port 5000 for Replit deployment with:
- Host: 0.0.0.0 (allows external connections)
- HMR configured for Replit's proxy environment
- Environment variables injected at build time

### Workflows
- **Start application**: Runs `npm run dev` on port 5000 with webview output

## Recent Changes
- **2024-11-30**: Initial Replit setup
  - Configured Vite to use port 5000 instead of 3000
  - Removed importmap from index.html (conflicted with Vite bundling)
  - Added module script tag to load index.tsx entry point
  - Configured HMR for Replit proxy environment
  - Set up Gemini API key integration
  - Configured deployment settings for autoscale

## Features
- **Framework Library**: Browse curated collection of problem-solving frameworks
- **AI Suggestions**: Get framework recommendations based on your problem
- **Interactive Workspace**: Visual canvas with sticky notes for brainstorming
- **Session History**: Save and restore previous sessions
- **Templates**: Create and reuse section templates
- **User Authentication**: Login system with guest/member modes

## Development
Run `npm run dev` to start the development server on port 5000.
The app will be available at your Replit webview URL.

## Deployment
The project is configured for Replit's autoscale deployment:
- Build command: `npm run build`
- Run command: `npm run preview`
- The built files will be served from the `dist` directory
