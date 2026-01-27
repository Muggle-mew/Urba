import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ZONES } from '../data/zones';

const prisma = new PrismaClient();

export const searchMonster = async (req: Request, res: Response) => {
  try {
    const zoneId = req.params.id as string;
    const playerLevel = parseInt(req.query.playerLevel as string) || 1;

    // Find ALL monsters in this zone (we scale them dynamically)
    let monsters = await prisma.monster.findMany({
      where: { zoneId: zoneId }
    });

    if (monsters.length === 0) {
       return res.status(404).json({ error: 'No monsters found in this zone' });
    }

    // Pick random
    const baseMonster = monsters[Math.floor(Math.random() * monsters.length)];

    // Calculate target level: playerLevel +/- 3, min 1
    const variation = Math.floor(Math.random() * 7) - 3; // -3 to +3
    const targetLevel = Math.max(1, playerLevel + variation);

    // Scale stats (assuming linear scaling from base level)
    const multiplier = targetLevel / Math.max(1, baseMonster.level);

    const scaledMonster = {
        ...baseMonster,
        level: targetLevel,
        hp: Math.floor(baseMonster.hp * multiplier),
        maxHp: Math.floor(baseMonster.maxHp * multiplier),
        strength: Math.floor(baseMonster.strength * multiplier),
        agility: Math.floor(baseMonster.agility * multiplier),
        intuition: Math.floor(baseMonster.intuition * multiplier),
        will: Math.floor(baseMonster.will * multiplier),
        constitution: Math.floor(baseMonster.constitution * multiplier),
        expReward: Math.floor(baseMonster.expReward * multiplier),
        moneyReward: Math.floor(baseMonster.moneyReward * multiplier),
    };

    res.json({ monster: scaledMonster });
  } catch (error) {
    console.error('Error searching monster:', error);
    res.status(500).json({ error: 'Failed to search monster' });
  }
};

export const getZoneInfo = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const zone = ZONES[id];
        if (!zone) {
            // Minimal fallback
            return res.json({ 
                id, 
                name: `Zone ${id}`, 
                description: 'Unknown Zone',
                imagePath: `/assets/zones/${id}.jpg`
            });
        }
        res.json(zone);
    } catch (error) {
        console.error('Error fetching zone info:', error);
        res.status(500).json({ error: 'Failed to fetch zone info' });
    }
}
