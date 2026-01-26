import { Router } from 'express';
import { ShopController } from '../controllers/ShopController';

const router = Router();

router.get('/daily', ShopController.getDailyShop);
router.post('/buy', ShopController.buyItem);

export default router;
