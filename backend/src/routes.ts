import { Router } from 'express';
import { suggestFrameworks, initializeBoard, generateSectionIdeas } from './controllers/aiController';

/**
 * Express router to handle API routes.
 */
const router = Router();

/**
 * Route to suggest frameworks based on a problem statement.
 * @route POST /api/suggest-frameworks
 */
router.post('/suggest-frameworks', suggestFrameworks);

/**
 * Route to initialize a board with a selected framework.
 * @route POST /api/initialize-board
 */
router.post('/initialize-board', initializeBoard);

/**
 * Route to generate ideas for a specific section of the board.
 * @route POST /api/generate-ideas
 */
router.post('/generate-ideas', generateSectionIdeas);

export default router;
