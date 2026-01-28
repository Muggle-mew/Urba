import { DailyQuestService } from './DailyQuestService';
import { AchievementService } from './AchievementService';

export class QuestService {
  private dailyQuestService: DailyQuestService;
  private achievementService: AchievementService;

  constructor() {
    this.dailyQuestService = new DailyQuestService();
    this.achievementService = new AchievementService();
  }
  
  public async getQuests(characterId: string) {
    return this.dailyQuestService.getQuests(characterId);
  }

  public async claimQuest(characterId: string, questId: string) {
    return this.dailyQuestService.claimQuest(characterId, questId);
  }

  public async getAchievements(characterId: string) {
    return this.achievementService.getAchievements(characterId);
  }
}
