import { Request, Response } from 'express';
import { GoogleGenAI, Schema, Type } from "@google/genai";
import { Framework, CanvasSection, CanvasNote, NoteColor } from "../types";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma client instance for database operations.
 */
const prisma = new PrismaClient();

/**
 * Generates a simple random ID.
 * @returns {string} A random alphanumeric string.
 */
const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Initializes and returns the Google GenAI client.
 * @throws {Error} If GEMINI_API_KEY environment variable is not set.
 * @returns {GoogleGenAI} The Google GenAI client instance.
 */
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY; // Changed to GEMINI_API_KEY to distinguish
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Suggests frameworks based on a problem statement using AI.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with suggested frameworks or an error.
 */
export const suggestFrameworks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { problem } = req.body;
    if (!problem) {
      res.status(400).json({ error: "Problem statement is required" });
      return;
    }

    const ai = getAiClient();

    const prompt = `
      Analyze the following problem statement: "${problem}".
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
    if (!text) {
      res.json([]);
      return;
    }
    const frameworks = JSON.parse(text) as Framework[];
    res.json(frameworks);

  } catch (error) {
    console.error("Error fetching frameworks:", error);
    res.status(500).json({ error: "Failed to fetch frameworks" });
  }
};

/**
 * Initializes a board with specific sections and starter notes based on a selected framework and problem.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with the initialized sections or an error.
 */
export const initializeBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { problem, framework } = req.body;
    if (!problem || !framework) {
      res.status(400).json({ error: "Problem and framework are required" });
      return;
    }

    const ai = getAiClient();

    const prompt = `
      You are an expert facilitator guiding a high-stakes problem-solving session using the "${framework.name}" framework.

      USER PROBLEM CONTEXT:
      "${problem}"

      TASK:
      Initialize the workspace board. For every step/section in the framework, generate:
      1. A specific guiding question that bridges the framework to the user's specific situation.
      2. 2-3 "Starter Sticky Notes".

      CRITICAL INSTRUCTION FOR NOTES:
      - Do NOT use generic placeholders like "Add risk here" or "List benefits".
      - You MUST extract specific details, actors, and conflicts directly from the USER PROBLEM CONTEXT.
      - Example: If the problem mentions "Sales vs Engineering", the notes must explicitly mention "Sales pressure" or "Engineering risk".
      - The notes should read like actual specific thoughts or quotes from the stakeholders involved in the problem description.
      - If the user input is short, extrapolate logical specific scenarios based on the context.

      FRAMEWORK DETAILS:
      - Layout: ${framework.layout}
      - Steps: ${framework.steps.join(', ')}

      OUTPUT REQUIREMENTS:
      - If layout is 'six_hats', generate exactly 6 sections (White, Red, Black, Yellow, Green, Blue).
      - If layout is 'matrix_2x2', generate exactly 4 sections.
      - Otherwise, generate sections for the provided steps.
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
    if (!text) {
        res.json([]);
        return;
    }

    const rawSections = JSON.parse(text) as { title: string, description: string, initialNotes: string[] }[];

    // Map to internal types
    const sections = rawSections.map(s => ({
      id: generateId(),
      title: s.title,
      description: s.description,
      notes: s.initialNotes.map(content => ({
        id: generateId(),
        content,
        color: 'yellow',
        isAiGenerated: true
      }))
    }));

    // Save to Database
    try {
      const board = await prisma.board.create({
        data: {
          title: `Analysis: ${problem.substring(0, 30)}...`,
          frameworkId: framework.id,
          sections: {
            create: sections.map(s => ({
              title: s.title,
              description: s.description,
              notes: {
                create: s.notes.map(n => ({
                  content: n.content,
                  color: n.color as string,
                  isAiGenerated: n.isAiGenerated
                }))
              }
            }))
          }
        },
        include: {
            sections: {
                include: {
                    notes: true
                }
            }
        }
      });
      console.log(`Board saved with ID: ${board.id}`);
      // Ideally we return the Board ID so the frontend can reference it, but the current frontend expects sections only.
      // For now, we return sections as expected by frontend, but data is persisted.
    } catch (dbError) {
      console.error("Failed to save board to DB:", dbError);
      // Don't fail the response if DB fails, just log it.
    }

    res.json(sections);

  } catch (error) {
    console.error("Error initializing board:", error);
    // Return empty sections based on steps as fallback
    // Note: In backend we can just error out or return fallback.
    // Since we don't have the framework object fully typed with logic here easily without duplication, we'll try to just return error for now or best effort.
    // Actually we have the framework in the body.
    const { framework } = req.body;
    const fallback = framework.steps.map((step: string) => ({
      id: generateId(),
      title: step,
      description: "Add your thoughts here.",
      notes: []
    }));
    res.json(fallback);
  }
};

/**
 * Generates specific ideas for a given section of the board.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with generated notes or an error.
 */
export const generateSectionIdeas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { problem, framework, sectionTitle, currentNotes } = req.body;

    if (!problem || !framework || !sectionTitle) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const ai = getAiClient();

    const prompt = `
      Role: Expert Consultant.
      User Problem: "${problem}"
      Framework: "${framework.name}"
      Current Focus Section: "${sectionTitle}"
      Existing Notes in Section: ${JSON.stringify(currentNotes || [])}

      Task: Generate 3 NEW, highly specific ideas/insights for this section.

      Constraints:
      1. Do not repeat existing notes.
      2. Reference specific entities (people, departments, technologies) mentioned in the User Problem.
      3. Be provocative and actionable.
    `;

    const ideasSchema: Schema = {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    };

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
    if (!text) {
      res.json([]);
      return;
    }
    const ideas = JSON.parse(text) as string[];

    const colors: NoteColor[] = ['blue', 'green', 'pink', 'orange'];

    const notes = ideas.map(idea => ({
      id: generateId(),
      content: idea,
      color: colors[Math.floor(Math.random() * colors.length)],
      isAiGenerated: true
    }));

    // Save generated notes to DB if we knew the section ID (UUID).
    // The frontend currently passes 'sectionTitle', which is not unique.
    // To properly link these to the DB, the frontend would need to track the DB IDs.
    // Given the current scope, we will log that we created them but without a valid section ID we cannot attach them
    // to the persistent store unless we search by title/board context, which is complex.
    // However, if we assume the frontend might have IDs later, we'd do it here.
    // For now, since this is a pilot "proxy" and we just saved the initial board,
    // we will acknowledge this limitation: Dynamic notes are returned but not attached to the historical board
    // unless we update the API to accept sectionId.

    // Attempt to find a recent section with this title (best effort for demo)
    try {
        const section = await prisma.section.findFirst({
            where: { title: sectionTitle },
            orderBy: { board: { createdAt: 'desc' } }
        });

        if (section) {
             await prisma.note.createMany({
                data: notes.map(n => ({
                    content: n.content,
                    color: n.color as string,
                    sectionId: section.id,
                    isAiGenerated: true
                }))
            });
            console.log(`Saved ${notes.length} notes to section ${section.id}`);
        }
    } catch (dbError) {
        console.warn("Could not save new notes to DB (context missing):", dbError);
    }

    res.json(notes);

  } catch (error) {
    console.error("Error generating ideas:", error);
    res.status(500).json({ error: "Failed to generate ideas" });
  }
};
