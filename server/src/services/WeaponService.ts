import { PrismaClient, Weapon } from '@prisma/client';
import { EconomyService } from './EconomyService';
import { InventoryItem } from '../types/economy';

const prisma = new PrismaClient();
const economyService = new EconomyService();

export class WeaponService {
  
  // Get all weapons (catalog)
  async getCatalog(): Promise<Weapon[]> {
    return await prisma.weapon.findMany({
        orderBy: { levelRequirement: 'asc' }
    });
  }

  // Get weapons by level range
  async getWeaponsByLevel(minLevel: number, maxLevel: number): Promise<Weapon[]> {
    return await prisma.weapon.findMany({
        where: {
            levelRequirement: {
                gte: minLevel,
                lte: maxLevel
            }
        },
        orderBy: { levelRequirement: 'asc' }
    });
  }

  // Buy weapon
  async buyWeapon(characterId: string, weaponId: string): Promise<{ success: boolean; message: string }> {
    const weapon = await prisma.weapon.findUnique({ where: { id: weaponId } });
    if (!weapon) return { success: false, message: 'Weapon not found' };

    const character = await prisma.character.findUnique({ where: { id: characterId } });
    if (!character) return { success: false, message: 'Character not found' };

    if (character.level < weapon.levelRequirement) {
        return { success: false, message: `Level ${weapon.levelRequirement} required` };
    }

    const success = await economyService.spendFrg(characterId, weapon.priceFRG, `Buy ${weapon.name}`);
    if (!success) {
        return { success: false, message: 'Insufficient FRG' };
    }

    // Add to inventory
    const inventory: InventoryItem[] = JSON.parse(character.inventory || '[]');
    
    const newItem: InventoryItem = {
        ...weapon,
        instanceId: `w_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        currentDurability: weapon.durability,
        equipped: false
    };

    inventory.push(newItem);

    await prisma.character.update({
        where: { id: characterId },
        data: { inventory: JSON.stringify(inventory) }
    });

    return { success: true, message: 'Weapon purchased' };
  }

  // Repair weapon
  async repairWeapon(characterId: string, instanceId: string): Promise<{ success: boolean; message: string }> {
    const character = await prisma.character.findUnique({ where: { id: characterId } });
    if (!character) return { success: false, message: 'Character not found' };

    const inventory: InventoryItem[] = JSON.parse(character.inventory || '[]');
    const itemIndex = inventory.findIndex(i => i.instanceId === instanceId);
    
    if (itemIndex === -1) return { success: false, message: 'Item not found' };
    
    const item = inventory[itemIndex];
    if (item.currentDurability >= item.maxDurability) {
        return { success: false, message: 'Weapon already fully repaired' };
    }

    const repairCost = economyService.calculateRepairCost(item.priceFRG);
    
    const success = await economyService.spendFrg(characterId, repairCost, `Repair ${item.name}`);
    if (!success) {
        return { success: false, message: `Need ${repairCost} FRG to repair` };
    }

    item.currentDurability = item.maxDurability;
    inventory[itemIndex] = item;

    await prisma.character.update({
        where: { id: characterId },
        data: { inventory: JSON.stringify(inventory) }
    });

    return { success: true, message: 'Weapon repaired' };
  }

  // Reduce durability (Call this after battle)
  async reduceDurability(characterId: string, instanceId: string, amount: number = 1): Promise<void> {
    const character = await prisma.character.findUnique({ where: { id: characterId } });
    if (!character) return;

    const inventory: InventoryItem[] = JSON.parse(character.inventory || '[]');
    const itemIndex = inventory.findIndex(i => i.instanceId === instanceId);
    
    if (itemIndex === -1) return;

    const item = inventory[itemIndex];
    item.currentDurability = Math.max(0, item.currentDurability - amount);

    // If broken, maybe auto-unequip? 
    // For now just save. Battle logic should check durability > 0.

    await prisma.character.update({
        where: { id: characterId },
        data: { inventory: JSON.stringify(inventory) }
    });
  }
}
