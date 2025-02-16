import express from 'express';
import * as aiControllers from '../controllers/ai.controllers.js';

const router = express.Router();

router.post('/', aiControllers.generateAIResponse);

export default router;