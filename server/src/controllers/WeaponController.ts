
import { Request, Response } from 'express';
import { WeaponService } from '../services/WeaponService';

const weaponService = new WeaponService();

export const getWeapons = async (req: Request, res: Response) => {
  try {
    const { minLevel, maxLevel } = req.query;
    if (minLevel && maxLevel) {
      const weapons = await weaponService.getWeaponsByLevel(Number(minLevel), Number(maxLevel));
      return res.json(weapons);
    }
    const weapons = await weaponService.getCatalog();
    res.json(weapons);
  } catch (error) {
    console.error('Error fetching weapons:', error);
    res.status(500).json({ error: 'Failed to fetch weapons' });
  }
};

export const buyWeapon = async (req: Request, res: Response) => {
  try {
    const { characterId, weaponId } = req.body;
    if (!characterId || !weaponId) {
      return res.status(400).json({ error: 'Missing characterId or weaponId' });
    }
    const result = await weaponService.buyWeapon(characterId, weaponId);
    if (!result.success) {
        return res.status(400).json({ error: result.message });
    }
    res.json(result);
  } catch (error) {
    console.error('Error buying weapon:', error);
    res.status(500).json({ error: 'Failed to buy weapon' });
  }
};

export const repairWeapon = async (req: Request, res: Response) => {
  try {
    const { characterId, instanceId } = req.body;
    if (!characterId || !instanceId) {
      return res.status(400).json({ error: 'Missing characterId or instanceId' });
    }
    const result = await weaponService.repairWeapon(characterId, instanceId);
    if (!result.success) {
        return res.status(400).json({ error: result.message });
    }
    res.json(result);
  } catch (error) {
    console.error('Error repairing weapon:', error);
    res.status(500).json({ error: 'Failed to repair weapon' });
  }
};
