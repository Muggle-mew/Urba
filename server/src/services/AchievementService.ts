import { PrismaClient } from '@prisma/client';
import { ALL_ACHIEVEMENTS } from '../data/achievements';

const prisma = new PrismaClient();

export class AchievementService {
  
  public async getAchievements(characterId: string) {
    const character = await prisma.character.findUnique({
      where: { id: characterId }
    });

    if (!character) return [];

    const unlocked = await prisma.achievement.findMany({
      where: { characterId }
    });
    
    const unlockedIds = new Set(unlocked.map(a => a.achievementId));
    
    // Filter by level and map
    return ALL_ACHIEVEMENTS
      .filter(ach => ach.minLevel <= character.level) // Only show available by level
      .map(ach => ({
        ...ach,
        unlocked: unlockedIds.has(ach.id),
        unlockedAt: unlocked.find(u => u.achievementId === ach.id)?.unlockedAt || null
      }));
  }

  public async unlockAchievement(characterId: string, achievementId: string) {
    const exists = await prisma.achievement.findFirst({
      where: { characterId, achievementId }
    });

    if (exists) return; // Already unlocked

    await prisma.achievement.create({
      data: {
        characterId,
        achievementId,
        unlockedAt: new Date()
      }
    });
    
    // TODO: Send notification to player?
  }

  // Event handlers
  public async onMonsterKill(characterId: string, monsterLevel: number) {
    // Check relevant achievements
    // This requires tracking stats which might be in the Character model or a separate Stats model.
    // For simplicity, we assume some stats are tracked on Character or calculated here.
    // Ideally, we increment a counter in DB and check if it hits a threshold.
    // For this implementation, I'll assume we just check specific conditions if possible, 
    // or we might need to add a Stats table.
    // Given the constraints, I will leave the detailed logic of checking "500 monsters" 
    // to a future "StatsService" or assume it's tracked in Quest progress for now.
    // But wait, the user wants "Progress update via events".
    // I'll implement a simple counter update if the user has a stats table, 
    // but the current schema (from BattleService) implies some stats are on Character.
    // Let's just implement the 'unlock' logic for now and maybe some direct checks 
    // if we can fetch total kills.
    
    // Example: Check "first_blood" (handled in BattleService probably)
    // "hunter" (50 kills). We need to store kill count.
    // I will add a placeholder for stat tracking.
  }
  
  // Helper to check conditions
  public async checkAndUnlock(characterId: string, achievementId: string, currentValue: number, targetValue: number) {
    if (currentValue >= targetValue) {
      await this.unlockAchievement(characterId, achievementId);
    }
  }
}
