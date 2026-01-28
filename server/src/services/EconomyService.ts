import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EconomyService {
  
  // Get balance
  async getBalance(characterId: string): Promise<number> {
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      select: { frg: true }
    });
    return character?.frg || 0;
  }

  // Add FRG (Quest rewards, loot)
  async addFrg(characterId: string, amount: number, source: string): Promise<number> {
    if (amount <= 0) throw new Error('Amount must be positive');

    const character = await prisma.character.update({
      where: { id: characterId },
      data: { frg: { increment: amount } },
      select: { frg: true }
    });

    // TODO: Log transaction if we had a Transaction table
    console.log(`[Economy] Added ${amount} FRG to ${characterId} from ${source}. New Balance: ${character.frg}`);
    
    return character.frg;
  }

  // Spend FRG (Buy, Repair, Craft)
  async spendFrg(characterId: string, amount: number, reason: string): Promise<boolean> {
    if (amount <= 0) throw new Error('Amount must be positive');

    // Use transaction to ensure atomicity
    return await prisma.$transaction(async (tx) => {
        const character = await tx.character.findUnique({
            where: { id: characterId },
            select: { frg: true }
        });

        if (!character || character.frg < amount) {
            return false;
        }

        await tx.character.update({
            where: { id: characterId },
            data: { frg: { decrement: amount } }
        });

        console.log(`[Economy] Spent ${amount} FRG by ${characterId} for ${reason}.`);
        return true;
    });
  }

  // Repair cost calculation
  calculateRepairCost(weaponPrice: number): number {
      // "repairCost = basePrice * 0.15"
      return Math.ceil(weaponPrice * 0.15);
  }
}
