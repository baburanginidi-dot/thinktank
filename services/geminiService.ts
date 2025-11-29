import { Framework, CanvasSection, CanvasNote } from "../types";

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Suggests a list of frameworks based on a problem statement.
 *
 * @param {string} problemText - The problem statement to analyze.
 * @returns {Promise<Framework[]>} A promise that resolves to an array of suggested frameworks.
 */
export const suggestFrameworks = async (problemText: string): Promise<Framework[]> => {
  try {
    const response = await fetch(`${API_URL}/suggest-frameworks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ problem: problemText }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching frameworks:", error);
    return [];
  }
};

/**
 * Initializes a board for a selected framework and problem.
 *
 * @param {string} problem - The problem statement.
 * @param {Framework} framework - The selected framework.
 * @returns {Promise<CanvasSection[]>} A promise that resolves to the initialized sections of the board.
 */
export const initializeBoard = async (problem: string, framework: Framework): Promise<CanvasSection[]> => {
  try {
    const response = await fetch(`${API_URL}/initialize-board`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ problem, framework }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error initializing board:", error);
    // Fallback if API fails
    return framework.steps.map(step => ({
      id: Math.random().toString(36).substr(2, 9),
      title: step,
      description: "Add your thoughts here.",
      notes: []
    }));
  }
};

/**
 * Generates specific ideas for a given section of the board.
 *
 * @param {string} problem - The problem statement.
 * @param {Framework} framework - The framework being used.
 * @param {string} sectionTitle - The title of the section to generate ideas for.
 * @param {string[]} currentNotes - A list of existing note contents in the section.
 * @returns {Promise<CanvasNote[]>} A promise that resolves to an array of generated notes.
 */
export const generateSectionIdeas = async (
  problem: string, 
  framework: Framework, 
  sectionTitle: string, 
  currentNotes: string[]
): Promise<CanvasNote[]> => {
  try {
    const response = await fetch(`${API_URL}/generate-ideas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        problem,
        framework,
        sectionTitle,
        currentNotes
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating ideas:", error);
    return [];
  }
};
