import { Request, Response } from 'express';
import { ZONES, MONSTERS } from '../data/zones';
import { Monster } from '../types/location';

export const searchMonster = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const playerLevel = parseInt(req.query.playerLevel as string) || 1;

    const zone = ZONES[id];
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    // Filter monsters by level range [N-1, N+1]
    const minLevel = playerLevel - 1;
    const maxLevel = playerLevel + 1;

    let possibleMonsters = zone.monsters
      .map((mid: string) => MONSTERS[mid])
      .filter((m: Monster) => m.level >= minLevel && m.level <= maxLevel);

    // If no monsters in range, find closest
    if (possibleMonsters.length === 0) {
      const allZoneMonsters = zone.monsters.map((mid: string) => MONSTERS[mid]);
      possibleMonsters = allZoneMonsters.sort((a: Monster, b: Monster) => 
        Math.abs(a.level - playerLevel) - Math.abs(b.level - playerLevel)
      ).slice(0, 1); // Take the single closest one
    }

    // Pick random monster from possible ones
    const randomMonster = possibleMonsters[Math.floor(Math.random() * possibleMonsters.length)];

    res.json({ monster: randomMonster });
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
            return res.status(404).json({ error: 'Zone not found' });
        }
        res.json(zone);
    } catch (error) {
        console.error('Error fetching zone info:', error);
        res.status(500).json({ error: 'Failed to fetch zone info' });
    }
}
