import { Request, Response } from 'express';
import { ShopService } from '../services/ShopService';

const shopService = new ShopService();

export class ShopController {
  static async getDailyShop(req: Request, res: Response) {
    try {
      const { characterId } = req.query;
      
      if (!characterId || typeof characterId !== 'string') {
        res.status(400).json({ error: 'characterId is required' });
        return;
      }

      const items = await shopService.getDailyItems(characterId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async buyItem(req: Request, res: Response) {
    try {
      const { characterId, itemId } = req.body;

      if (!characterId || !itemId) {
        res.status(400).json({ error: 'characterId and itemId are required' });
        return;
      }

      const updatedCharacter = await shopService.buyItem(characterId, itemId);
      res.json(updatedCharacter);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
