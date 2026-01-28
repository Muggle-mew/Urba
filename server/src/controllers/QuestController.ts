import { Request, Response } from 'express';
import { QuestService } from '../services/QuestService';

const questService = new QuestService();

export const getCharacterQuests = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quests = await questService.getQuests(String(id));
    res.json(quests);
  } catch (error) {
    console.error('Error fetching quests:', error);
    res.status(500).json({ error: 'Failed to fetch quests' });
  }
};

export const getCharacterAchievements = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const achievements = await questService.getAchievements(String(id));
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
};

export const claimQuest = async (req: Request, res: Response) => {
  try {
    const { id, questId } = req.params;
    const result = await questService.claimQuest(String(id), String(questId));
    res.json(result);
  } catch (error: any) {
    console.error('Error claiming quest:', error);
    res.status(500).json({ error: error.message || 'Failed to claim quest' });
  }
};
