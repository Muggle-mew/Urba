import { PrismaClient, Item, Character } from '@prisma/client';

const prisma = new PrismaClient();

export class ShopService {
  
  async getDailyItems(characterId: string): Promise<Item[]> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Check if daily shop exists
    const dailyShop = await prisma.dailyShop.findUnique({
      where: {
        characterId_date: {
          characterId,
          date: today
        }
      }
    });

    if (dailyShop) {
      const itemIds = JSON.parse(dailyShop.itemIds) as string[];
      const items = await prisma.item.findMany({
        where: { id: { in: itemIds } }
      });
      // Parse stats for client
      return items.map(item => ({
        ...item,
        stats: JSON.parse(item.stats)
      }));
    }

    // Generate new daily shop
    const character = await prisma.character.findUnique({ where: { id: characterId } });
    if (!character) throw new Error('Character not found');

    const level = character.level;
    const minLevel = Math.max(1, level - 3);
    const maxLevel = level + 3;

    // Find candidate items
    const candidateItems = await prisma.item.findMany({});

    // Pick 10 random
    // If not enough items, take all
    const shuffled = candidateItems.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);
    const selectedIds = selected.map(i => i.id);

    // Save
    await prisma.dailyShop.create({
      data: {
        characterId,
        date: today,
        itemIds: JSON.stringify(selectedIds)
      }
    });

    return selected.map(item => ({
        ...item,
        stats: JSON.parse(item.stats)
    }));
  }

  async buyItem(characterId: string, itemId: string): Promise<Character> {
    const character = await prisma.character.findUnique({ where: { id: characterId } });
    const item = await prisma.item.findUnique({ where: { id: itemId } });

    if (!character || !item) throw new Error('Character or Item not found');

    if (character.level < item.levelReq) {
      throw new Error(`Level too low (Required: ${item.levelReq})`);
    }

    if (character.money < item.price) {
      throw new Error(`Not enough money (Required: ${item.price}, Have: ${character.money})`);
    }

    // Deduct money
    const newMoney = character.money - item.price;

    // Add to inventory
    const inventory = JSON.parse(character.inventory) as any[];
    
    // Add item with unique instance ID
    const newItemInstance = {
      instanceId: Math.random().toString(36).substring(7),
      itemId: item.id,
      name: item.name,
      type: item.type,
      stats: JSON.parse(item.stats),
      image: item.image
    };
    inventory.push(newItemInstance);

    const updatedCharacter = await prisma.character.update({
      where: { id: characterId },
      data: {
        money: newMoney,
        inventory: JSON.stringify(inventory)
      }
    });

    return updatedCharacter;
  }
}
