import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Framework, CanvasSection, CanvasNote, NoteColor } from "../types";
import { v4 as uuidv4 } from 'uuid'; // Note: We'll simulate uuid if package not available or use random string

const generateId = () => Math.random().toString(36).substr(2, 9);

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey });
};

export const suggestFrameworks = async (problemText: string): Promise<Framework[]> => {
  const ai = getAiClient();
  
  const prompt = `
    Analyze the following problem statement: "${problemText}".
    Suggest 4 distinct, rigorous, and scientific frameworks or mental models that would best help solve this problem.
    
    IMPORTANT: Determine the best visual layout for each framework:
    - 'six_hats': EXCLUSIVELY for "Six Thinking Hats".
    - 'matrix_2x2': For frameworks with 4 quadrants (e.g., SWOT, Eisenhower Matrix, Ansoff Matrix).
    - 'linear': For sequential processes (e.g., Design Thinking, JTBD, DMAIC, Double Diamond).

    Consider technical architectures, product discovery frameworks, strategic models, or cognitive mental models.
    Ensure the steps provided are actionable and sequential.
  `;

  const frameworkSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        category: { type: Type.STRING, enum: ['Technical', 'Product', 'Mental Model', 'Strategic', 'Scientific'] },
        description: { type: Type.STRING },
        relevance: { type: Type.STRING, description: "Why this specific framework fits the problem" },
        layout: { type: Type.STRING, enum: ['linear', 'matrix_2x2', 'six_hats'] },
        steps: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "A list of distinct steps. If layout is 'six_hats', must provide 6 steps. If 'matrix_2x2', must provide 4 steps."
        }
      },
      required: ["id", "name", "category", "description", "relevance", "steps", "layout"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: frameworkSchema,
        temperature: 0.4, 
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as Framework[];
  } catch (error) {
    console.error("Error fetching frameworks:", error);
    return [];
  }
};

export const initializeBoard = async (problem: string, framework: Framework): Promise<CanvasSection[]> => {
  const ai = getAiClient();

  const prompt = `
    Context: The user has a problem: "${problem}".
    Framework selected: "${framework.name}".
    Layout Type: "${framework.layout}".
    Framework Steps: ${framework.steps.join(', ')}.

    Task: Create a canvas board layout. 
    For EACH step of the framework, provide:
    1. A contextual description/question specifically related to the user's problem (not generic).
    2. 2-3 initial "sticky note" insights or starting points to help the user overcome the blank canvas syndrome.
    
    IMPORTANT: 
    - If layout is 'six_hats', strictly generate 6 sections corresponding to White, Red, Black, Yellow, Green, Blue hats.
    - If layout is 'matrix_2x2', strictly generate 4 sections.
  `;

  const boardSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "The step name or quadrant title" },
        description: { type: Type.STRING, description: "Specific guidance question for this problem context" },
        initialNotes: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ["title", "description", "initialNotes"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: boardSchema,
        temperature: 0.5,
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const rawSections = JSON.parse(text) as { title: string, description: string, initialNotes: string[] }[];
    
    // Map to internal types
    return rawSections.map(s => ({
      id: generateId(),
      title: s.title,
      description: s.description,
      notes: s.initialNotes.map(content => ({
        id: generateId(),
        content,
        color: 'yellow', // Default starting color, layout renderer will override if needed
        isAiGenerated: true
      }))
    }));

  } catch (error) {
    console.error("Error initializing board:", error);
    // Fallback if AI fails: return empty sections based on steps
    return framework.steps.map(step => ({
      id: generateId(),
      title: step,
      description: "Add your thoughts here.",
      notes: []
    }));
  }
};

export const generateSectionIdeas = async (
  problem: string, 
  framework: Framework, 
  sectionTitle: string, 
  currentNotes: string[]
): Promise<CanvasNote[]> => {
  const ai = getAiClient();

  const prompt = `
    Problem: "${problem}"
    Framework: "${framework.name}"
    Current Focus Section: "${sectionTitle}"
    Existing Notes: ${JSON.stringify(currentNotes)}

    Task: Generate 3 NEW, creative, and distinct ideas/insights for this section. 
    Do not repeat existing notes. Be specific and actionable.
  `;

  const ideasSchema: Schema = {
    type: Type.ARRAY,
    items: { type: Type.STRING }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: ideasSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) return [];
    const ideas = JSON.parse(text) as string[];

    const colors: NoteColor[] = ['blue', 'green', 'pink', 'orange'];
    
    return ideas.map(idea => ({
      id: generateId(),
      content: idea,
      color: colors[Math.floor(Math.random() * colors.length)],
      isAiGenerated: true
    }));

  } catch (error) {
    console.error("Error generating ideas:", error);
    return [];
  }
};