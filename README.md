<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Think Tank: AI-Powered Mind Mapping

**Think Tank** is a web application that helps you structure your thoughts and solve complex problems using a curated library of mental models and AI-driven frameworks. It's designed to move you from chaos to clarity by blending cognitive science with artificial intelligence.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)

## Features

- **AI-Powered Framework Suggestions:** Describe your problem, and the app will suggest relevant frameworks to help you solve it.
- **Interactive Workspace:** A dynamic, zoomable, and pannable canvas to organize your thoughts.
- **Curated Library of Mental Models:** Explore a collection of proven frameworks from various fields like engineering, psychology, and business strategy.
- **Session History:** Save your sessions and revisit them later.
- **Custom Templates:** Save your own templates to reuse in future sessions.

## Project Structure

The project is organized into the following directories:

- **`src/components`**: Reusable React components used throughout the application.
- **`src/data`**: Contains the library of predefined frameworks.
- **`src/services`**: Handles communication with the Gemini API.
- **`src/views`**: Contains the main application views, such as the home page, workspace, and methodology library.
- **`src/types.ts`**: Defines the TypeScript types and interfaces used in the application.

## Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or later)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/your-username/think-tank.git
   cd think-tank
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```
3. **Set up your environment variables:**

   Create a `.env` file in the root of the project and add your Gemini API key:

   ```env
   GEMINI_API_KEY=your_api_key
   ```
4. **Run the development server:**

   ```sh
   npm run dev
   ```
This will start the application on `http://localhost:3000`.

## Usage
1. **Enter a problem statement:** On the home page, describe the problem you're trying to solve.
2. **Select a framework:** The application will suggest a list of frameworks based on your problem. Choose one to start a new session.
3. **Use the workspace:** The workspace is an infinite canvas where you can add, edit, and move sticky notes. Use the AI-powered "Generate" feature to get new ideas for each section.
4. **Save and export:** Your session is automatically saved to your history. You can also export your session as a JSON file.

## Technologies Used
- **React:** A JavaScript library for building user interfaces.
- **TypeScript:** A typed superset of JavaScript.
- **Vite:** A fast build tool and development server.
- **Tailwind CSS:** A utility-first CSS framework.
- **Gemini API:** Powers the AI features of the application.