# Think Tank

Think Tank is an AI-powered problem-solving platform that helps users structure chaotic thoughts using proven scientific frameworks. By leveraging Google's Gemini AI, Think Tank analyzes user problems and suggests appropriate mental models (e.g., Six Thinking Hats, SWOT, First Principles) to guide the ideation process.

## Features

*   **AI Framework Suggestion**: Analyzes your problem statement and recommends the best frameworks (Strategic, Product, Technical, or Mental Models).
*   **Interactive Workspace**: An infinite canvas to brainstorm with sticky notes, organized by the selected framework's layout (Linear, Matrix, or Six Hats).
*   **AI Co-Pilot**: Generate specific, context-aware insights and ideas for any section of your board.
*   **Methodology Library**: Browse a curated list of mental models and learn when to apply them.
*   **Session History**: Auto-saves your sessions so you can pick up where you left off.
*   **Templates**: Save your own custom sections as templates for future use.

## Tech Stack

### Frontend
*   **React 18**: UI Library.
*   **TypeScript**: Type safety.
*   **Vite**: Build tool.
*   **Tailwind CSS**: Styling.
*   **Lucide React**: Icons.

### Backend
*   **Node.js & Express**: API Server.
*   **TypeScript**: Type safety.
*   **Google Gemini API**: AI Model (Gemini 2.5 Flash).
*   **Prisma**: ORM.
*   **PostgreSQL**: Database.

## Prerequisites

*   Node.js (v18 or higher)
*   npm (v9 or higher)
*   PostgreSQL (optional, for local DB persistence, otherwise uses in-memory/mock or SQLite if configured)
*   Google Gemini API Key

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd think-tank
    ```

2.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```

3.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    ```

4.  **Environment Variables:**
    *   Create a `.env` file in the `backend/` directory:
        ```env
        PORT=3000
        GEMINI_API_KEY=your_gemini_api_key_here
        DATABASE_URL="postgresql://user:password@localhost:5432/thinktank?schema=public"
        ```
    *   Create a `.env.local` file in the root directory (Frontend):
        ```env
        Vite_API_URL=http://localhost:3000/api
        ```

5.  **Database Setup (Optional/If using Prisma):**
    If you are running the backend with a real database:
    ```bash
    cd backend
    npx prisma generate
    npx prisma db push
    ```

## Running the Application

### Backend
From the `backend/` directory:
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

### Frontend
From the root directory:
```bash
npm run dev
```
The application will start on `http://localhost:5173`.

## Usage

1.  **Landing Page**: Browse the methodology library or click "Get Started" / "Sign In".
2.  **Home**: Enter a problem statement (e.g., "Our user retention is dropping").
3.  **Framework Selection**: Choose one of the AI-suggested frameworks.
4.  **Workspace**:
    *   **Add Notes**: Click "Add Note" in any section.
    *   **AI Generate**: Click "Generate" to get AI suggestions for a specific section.
    *   **Navigation**: Use the toolbar to zoom, pan, or reset the view.
    *   **Templates**: Save useful sections as templates.
5.  **History**: View and resume past sessions from the History tab.

## Project Structure

*   `src/`: Frontend source code.
    *   `components/`: Reusable UI components.
    *   `views/`: Page-level components.
    *   `services/`: API integration services.
    *   `data/`: Static data (e.g., Framework library).
*   `backend/`: Backend source code.
    *   `src/controllers/`: Request handlers.
    *   `src/routes.ts`: API route definitions.
    *   `prisma/`: Database schema.
