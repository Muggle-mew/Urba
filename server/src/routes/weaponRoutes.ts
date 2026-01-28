
import { Router } from 'express';
import { getWeapons, buyWeapon, repairWeapon } from '../controllers/WeaponController';

const router = Router();

// GET /api/weapons
router.get('/', getWeapons);

// POST /api/weapons/buy
router.post('/buy', buyWeapon);

// POST /api/weapons/repair
router.post('/repair', repairWeapon);

export default router;
