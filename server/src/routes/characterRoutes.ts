import { Router } from 'express';
import { createCharacter, getCharacter, changeAlignment, equipItem, unequipItem, moveCharacter } from '../controllers/characterController';

const router = Router();

// POST /api/character - Создать персонажа
router.post('/', createCharacter);

// GET /api/character/:id - Получить персонажа по ID
router.get('/:id', getCharacter);

// POST /api/character/:id/move - Перемещение персонажа
router.post('/:id/move', moveCharacter);

// POST /api/character/:id/alignment - Сменить фракцию
router.post('/:id/alignment', changeAlignment);

// POST /api/character/:id/equip - Надеть предмет
router.post('/:id/equip', equipItem);

// POST /api/character/:id/unequip - Снять предмет
router.post('/:id/unequip', unequipItem);

export default router;