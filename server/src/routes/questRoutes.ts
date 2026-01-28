import { Router } from 'express';
import { getCharacterQuests, getCharacterAchievements, claimQuest } from '../controllers/QuestController';

const router = Router();

// GET /api/quest/:id/quests
router.get('/:id/quests', getCharacterQuests);

// POST /api/quest/:id/claim/:questId
router.post('/:id/claim/:questId', claimQuest);

// GET /api/quest/:id/achievements
router.get('/:id/achievements', getCharacterAchievements);

export default router;
