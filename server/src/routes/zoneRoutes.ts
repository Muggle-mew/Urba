import express from 'express';
import { searchMonster, getZoneInfo } from '../controllers/ZoneController';

const router = express.Router();

router.get('/:id', getZoneInfo);
router.get('/:id/search', searchMonster);

export default router;
