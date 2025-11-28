import { Router } from 'express';
import { suggestFrameworks, initializeBoard, generateSectionIdeas } from './controllers/aiController';

const router = Router();

router.post('/suggest-frameworks', suggestFrameworks);
router.post('/initialize-board', initializeBoard);
router.post('/generate-ideas', generateSectionIdeas);

export default router;
