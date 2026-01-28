import { PrismaClient, Quest } from '@prisma/client';
import { DAILY_QUESTS, WEEKLY_QUESTS } from '../data/quests';

const prisma = new PrismaClient();

export class DailyQuestService {
  
  public async getQuests(characterId: string) {
    const now = new Date();
    
    // Check daily quests
    let dailyQuests = await prisma.quest.findMany({
      where: {
        characterId,
        type: 'DAILY',
        expiresAt: { gt: now }
      }
    });

    if (dailyQuests.length === 0) {
      dailyQuests = await this.generateQuests(characterId, 'DAILY', 5);
    }

    // Check weekly quests
    let weeklyQuests = await prisma.quest.findMany({
      where: {
        characterId,
        type: 'WEEKLY',
        expiresAt: { gt: now }
      }
    });

    if (weeklyQuests.length === 0) {
      weeklyQuests = await this.generateQuests(characterId, 'WEEKLY', 5);
    }

    return {
      daily: dailyQuests,
      weekly: weeklyQuests
    };
  }

  private async generateQuests(characterId: string, type: 'DAILY' | 'WEEKLY', count: number) {
    const sourceList = type === 'DAILY' ? DAILY_QUESTS : WEEKLY_QUESTS;
    
    const shuffled = [...sourceList].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    const now = new Date();
    let expiresAt = new Date();
    
    if (type === 'DAILY') {
      expiresAt.setHours(24, 0, 0, 0);
      if (expiresAt <= now) expiresAt.setDate(expiresAt.getDate() + 1);
    } else {
      expiresAt.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7 || 7); // Next Sunday? Or just +7 days
      expiresAt.setHours(23, 59, 59, 999);
    }

    const createdQuests = [];
    
    for (const content of selected) {
      const match = content.match(/\d+/);
      const target = match ? parseInt(match[0], 10) : 1;

      const quest = await prisma.quest.create({
        data: {
          characterId,
          type,
          content,
          target,
          progress: 0,
          expiresAt
        }
      });
      createdQuests.push(quest);
    }
    return createdQuests;
  }

  public async claimQuest(characterId: string, questId: string) {
    const quest = await prisma.quest.findFirst({
      where: {
        id: questId,
        characterId
      }
    });

    if (!quest) throw new Error('Quest not found');
    if (!quest.isCompleted) throw new Error('Quest not completed');
    if (quest.isClaimed) throw new Error('Quest already claimed');

    await prisma.$transaction(async (tx) => {
      await tx.quest.update({
        where: { id: questId },
        data: { isClaimed: true }
      });

      if (quest.frgReward > 0) {
        // Reuse economy logic but inside transaction if possible, 
        // or just call the service (which has its own transaction, but nested transactions are tricky in some drivers)
        // Since EconomyService uses transaction, we should be careful. 
        // For simplicity, we'll update directly here or call the service outside.
        // Prisma supports nested transactions now.
        await tx.character.update({
            where: { id: characterId },
            data: { frg: { increment: quest.frgReward } }
        });
      }
    });

    return { success: true, reward: quest.frgReward };
  }

  public async updateProgress(characterId: string, eventType: string, amount: number = 1) {
    const now = new Date();
    const quests = await prisma.quest.findMany({
      where: {
        characterId,
        isCompleted: false,
        expiresAt: { gt: now }
      }
    });

    for (const quest of quests) {
      // Very simple matching logic based on content keywords
      // In a real app, quests should have a 'code' or 'type' field.
      // We'll try to match eventType with quest content.
      
      let matches = false;
      if (eventType === 'kill_monster' && quest.content.includes('Убей') && quest.content.includes('монстр')) matches = true;
      if (eventType === 'pvp_win' && quest.content.includes('Победи') && quest.content.includes('игроков')) matches = true;
      if (eventType === 'gather' && quest.content.includes('Собери')) matches = true;
      // ... more matching logic

      if (matches) {
        const newProgress = Math.min(quest.progress + amount, quest.target);
        if (newProgress !== quest.progress) {
          await prisma.quest.update({
            where: { id: quest.id },
            data: { 
              progress: newProgress,
              isCompleted: newProgress >= quest.target
            }
          });
        }
      }
    }
  }
}
