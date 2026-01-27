import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ZONES = ['z1', 'z2', 'z3', 'z4', 'z5', 'z6'];
const SEWERS = 'sewers_solo';

const MONSTER_TEMPLATES = [
  { suffix: 'm1', name: 'Разведчик', role: 'scout' },
  { suffix: 'm2', name: 'Солдат', role: 'soldier' },
  { suffix: 'm3', name: 'Берсерк', role: 'berserk' },
  { suffix: 'm4', name: 'Снайпер', role: 'sniper' },
  { suffix: 'm5', name: 'Громила', role: 'tank' },
  { suffix: 'm6', name: 'Лидер', role: 'boss' },
];

const SEWERS_TEMPLATES = [
  { suffix: 'm1', name: 'Канализационная Крыса' },
  { suffix: 'm2', name: 'Слизень' },
  { suffix: 'm3', name: 'Утопленник' },
  { suffix: 'm4', name: 'Мусорный Голем' },
  { suffix: 'm5', name: 'Токсичный Плевун' },
  { suffix: 'm6', name: 'Болотная Тварь' },
  { suffix: 'm7', name: 'Тень Стоков' },
  { suffix: 'm8', name: 'Король Крыс' },
  { suffix: 'm9', name: 'Древний Ужас' },
];

async function main() {
  console.log('Seeding monsters...');

  // Clear existing monsters
  await prisma.monster.deleteMany({});

  // Seed Zone Monsters
  for (const zone of ZONES) {
    for (const tmpl of MONSTER_TEMPLATES) {
      const imageName = `zones/monsters/${zone}_${tmpl.suffix}.png`;
      // Base stats - low, will be scaled
      const baseStats = {
        hp: 100,
        maxHp: 100,
        strength: 5,
        agility: 5,
        intuition: 5,
        will: 5,
        constitution: 5,
        expReward: 10,
        moneyReward: 5
      };

      await prisma.monster.create({
        data: {
          name: `${tmpl.name} (${zone.toUpperCase()})`,
          level: 1, // Base level, will be scaled dynamically
          zoneId: zone,
          image: imageName,
          ...baseStats
        }
      });
    }
  }

  // Seed Sewers Monsters
  for (const tmpl of SEWERS_TEMPLATES) {
    const imageName = `sewers/monsters/sewers_solo_${tmpl.suffix}.png`;
    const baseStats = {
      hp: 120,
      maxHp: 120,
      strength: 6,
      agility: 6,
      intuition: 6,
      will: 6,
      constitution: 6,
      expReward: 15,
      moneyReward: 8
    };

    await prisma.monster.create({
      data: {
        name: tmpl.name,
        level: 1,
        zoneId: SEWERS,
        image: imageName,
        ...baseStats
      }
    });
  }

  console.log('Monsters seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
