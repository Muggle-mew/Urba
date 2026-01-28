import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WEAPON_TYPES = [
  'Blade', 'Pistol', 'Rifle', 'Shotgun', 'SMG',
  'Heavy', 'Bio', 'Radiation', 'Cyber', 'Relic'
];

async function main() {
  console.log('Seeding economy weapons...');

  // Clear existing weapons
  await prisma.weapon.deleteMany({});

  const weapons = [];

  const levels = [1, 4, 7, 10, 13, 16, 19, 22, 25, 29];
  
  for (const type of WEAPON_TYPES) {
      for (const lvl of levels) {
          // Formulas
          const priceFRG = Math.floor(Math.pow(lvl, 2) * 40);
          const damageMin = Math.floor(lvl * 2.5);
          const damageMax = Math.floor(lvl * 3.2);
          const critChance = 5 + lvl * 0.5; // %
          const critMultiplier = 1.5 + lvl * 0.02;
          const durability = 100 + lvl * 5;
          
          // Name generation
          const tierNames = [
              'Rusty', 'Common', 'Polished', 'Enhanced', 'Military',
              'Prototype', 'Elite', 'Master', 'Legendary', 'Godly'
          ];
          const tierIndex = levels.indexOf(lvl);
          const name = `${tierNames[tierIndex]} ${type}`;
          
          // Accuracy varies by type?
          let accuracy = 90;
          if (type === 'Shotgun') accuracy = 70;
          if (type === 'Sniper' || type === 'Rifle') accuracy = 95;
          if (type === 'Heavy') accuracy = 60;

          weapons.push({
              name,
              type,
              levelRequirement: lvl,
              damageMin,
              damageMax,
              critChance,
              critMultiplier,
              accuracy,
              durability,
              maxDurability: durability,
              priceFRG
          });
      }
  }

  // Insert all
  for (const w of weapons) {
      await prisma.weapon.create({ data: w });
  }

  console.log(`Seeded ${weapons.length} weapons.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
