import { PrismaClient, PassiveActivity } from '@prisma/client';
import { EconomyService } from './EconomyService';

const prisma = new PrismaClient();
const economyService = new EconomyService();

const ACTIVITIES = {
  HUNT: { duration: 120, reward: 300, name: 'Hunting' }, // 120 mins
  SCOUT: { duration: 120, reward: 200, name: 'Scouting' },
  GUARD: { duration: 120, reward: 250, name: 'Guarding' }
};

export class PassiveActivityService {
  
  async startActivity(characterId: string, type: 'HUNT' | 'SCOUT' | 'GUARD'): Promise<{ success: boolean; message: string }> {
    // Check if already has active activity
    const existing = await prisma.passiveActivity.findFirst({
        where: {
            characterId,
            status: 'STARTED'
        }
    });

    if (existing) {
        return { success: false, message: 'Already performing an activity' };
    }

    const config = ACTIVITIES[type];
    if (!config) return { success: false, message: 'Invalid activity type' };

    await prisma.passiveActivity.create({
        data: {
            characterId,
            type,
            duration: config.duration,
            rewardFrg: config.reward,
            status: 'STARTED',
            startTime: new Date()
        }
    });

    return { success: true, message: `Started ${config.name}` };
  }

  async checkStatus(characterId: string): Promise<PassiveActivity | null> {
    const activity = await prisma.passiveActivity.findFirst({
        where: {
            characterId,
            status: 'STARTED'
        }
    });

    if (!activity) return null;

    // Check completion
    const now = new Date();
    const elapsedMinutes = (now.getTime() - activity.startTime.getTime()) / (1000 * 60);

    if (elapsedMinutes >= activity.duration) {
        // Mark as completed
        return await prisma.passiveActivity.update({
            where: { id: activity.id },
            data: { status: 'COMPLETED' }
        });
    }

    return activity;
  }

  async claimReward(characterId: string): Promise<{ success: boolean; message: string; reward?: number }> {
    // First update status if time passed
    await this.checkStatus(characterId);

    const activity = await prisma.passiveActivity.findFirst({
        where: {
            characterId,
            status: 'COMPLETED'
        }
    });

    if (!activity) {
        return { success: false, message: 'No completed activity to claim' };
    }

    await economyService.addFrg(characterId, activity.rewardFrg, `Activity: ${activity.type}`);

    await prisma.passiveActivity.update({
        where: { id: activity.id },
        data: { status: 'CLAIMED' }
    });

    return { success: true, message: `Claimed ${activity.rewardFrg} FRG`, reward: activity.rewardFrg };
  }
}
