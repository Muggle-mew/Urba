import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to safely parse JSON
const safeParse = (jsonString: string, fallback: any) => {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('JSON parse error:', e);
    return fallback;
  }
};

// Helper to format character for frontend
const formatCharacter = (char: any) => {
  return {
    id: char.id,
    name: char.nickname,
    level: char.level,
    alignment: {
      side: char.faction,
      value: 0 // TODO: Add value to DB if needed
    },
    registrationDate: char.createdAt,
    citizenship: 'wanderer', // TODO: Add to DB if needed
    hp: { current: char.hp, max: char.maxHp },
    energy: { current: char.energy, max: char.maxEnergy },
    fragments: char.money,
    stats: {
      strength: char.strength,
      agility: char.agility,
      intuition: char.intuition,
      will: char.will,
      constitution: char.constitution
    },
    equipment: safeParse(char.equipment, {}),
    location: safeParse(char.location, { city: 'nova-chimera', isTraveling: false }),
    inventory: safeParse(char.inventory, [])
  };
};

// Создание персонажа
export const createCharacter = async (req: Request, res: Response) => {
  try {
    const { nickname, faction, userId } = req.body;
    
    // Временная заглушка: если userId не передан, используем тестовый или создаем нового юзера
    let targetUserId = userId;

    if (!targetUserId) {
       // Для тестов создадим юзера, если его нет
       // В реальном приложении userId берется из токена авторизации
       const defaultUser = await prisma.user.create({
         data: {}
       });
       targetUserId = defaultUser.id;
    }

    const newCharacter = await prisma.character.create({
      data: {
        userId: targetUserId,
        nickname,
        faction,
        inventory: "[]",
        equipment: "{}",
        location: JSON.stringify({ city: 'nova-chimera', isTraveling: false })
      }
    });

    res.status(201).json(formatCharacter(newCharacter));
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
};

// Получение персонажа
export const getCharacter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const character = await prisma.character.findUnique({
      where: { id: String(id) },
      include: { user: true } // Опционально: включить данные пользователя
    });

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    res.json(formatCharacter(character));
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ error: 'Failed to fetch character' });
  }
};

export const changeAlignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newAlignment } = req.body;

    if (!newAlignment) {
      return res.status(400).json({ error: 'New alignment is required' });
    }

    const character = await prisma.character.findUnique({
      where: { id: String(id) }
    });

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    if (character.faction === newAlignment) {
      return res.status(400).json({ error: 'Character is already in this faction' });
    }

    const ALIGNMENT_CHANGE_COST = 100;

    if (character.money < ALIGNMENT_CHANGE_COST) {
      return res.status(400).json({ error: 'Not enough fragments to change alignment' });
    }

    const updatedCharacter = await prisma.character.update({
      where: { id: String(id) },
      data: {
        faction: newAlignment,
        money: character.money - ALIGNMENT_CHANGE_COST
      }
    });

    res.json(formatCharacter(updatedCharacter));
  } catch (error) {
    console.error('Error changing alignment:', error);
    res.status(500).json({ error: 'Failed to change alignment' });
  }
};

export const equipItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { itemId, slot } = req.body;

    const character = await prisma.character.findUnique({
      where: { id: String(id) }
    });

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const inventory = safeParse(character.inventory, []);
    const equipment = safeParse(character.equipment, {});

    // Find item in inventory
    const itemIndex = inventory.findIndex((i: any) => i.id === itemId);
    if (itemIndex === -1) {
      return res.status(400).json({ error: 'Item not found in inventory' });
    }

    const itemToEquip = inventory[itemIndex];

    // If slot is occupied, move current item to inventory
    if (equipment[slot]) {
      inventory.push(equipment[slot]);
    }

    // Equip new item
    equipment[slot] = itemToEquip;
    
    // Remove from inventory
    inventory.splice(itemIndex, 1);

    const updatedCharacter = await prisma.character.update({
      where: { id: String(id) },
      data: {
        inventory: JSON.stringify(inventory),
        equipment: JSON.stringify(equipment)
      }
    });

    res.json(formatCharacter(updatedCharacter));
  } catch (error) {
    console.error('Error equipping item:', error);
    res.status(500).json({ error: 'Failed to equip item' });
  }
};

export const unequipItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { slot } = req.body;

    const character = await prisma.character.findUnique({
      where: { id: String(id) }
    });

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const inventory = safeParse(character.inventory, []);
    const equipment = safeParse(character.equipment, {});

    if (!equipment[slot]) {
      return res.status(400).json({ error: 'Slot is empty' });
    }

    // Move to inventory
    inventory.push(equipment[slot]);
    
    // Remove from equipment
    delete equipment[slot];

    const updatedCharacter = await prisma.character.update({
      where: { id: String(id) },
      data: {
        inventory: JSON.stringify(inventory),
        equipment: JSON.stringify(equipment)
      }
    });

    res.json(formatCharacter(updatedCharacter));
  } catch (error) {
    console.error('Error unequipping item:', error);
    res.status(500).json({ error: 'Failed to unequip item' });
  }
};
