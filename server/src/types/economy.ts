import { Weapon } from '@prisma/client';

export interface InventoryItem extends Weapon {
  instanceId: string;
  currentDurability: number;
  equipped?: boolean;
}

export interface QuestConfig {
  id: string;
  type: 'daily' | 'weekly';
  category: string;
  description: string;
  frgReward: number;
  levelRequirement?: number;
}
