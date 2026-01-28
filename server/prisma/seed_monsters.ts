import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Data from server/src/data/zones.ts
// Mapped to existing images zX_mY.png
const ZONE_MONSTERS = {
  z1: [
    { name: 'Бетоножил', image: 'z1_m1.png', stats: { hp: 100, strength: 5, agility: 5, intuition: 5, will: 5, constitution: 5, exp: 30, money: 20 } },
    { name: 'Крысоед', image: 'z1_m2.png', stats: { hp: 80, strength: 6, agility: 6, intuition: 4, will: 4, constitution: 4, exp: 40, money: 25 } },
    { name: 'Голос Толпы', image: 'z1_m3.png', stats: { hp: 90, strength: 7, agility: 4, intuition: 6, will: 5, constitution: 5, exp: 50, money: 30 } },
    { name: 'Мусорный Король', image: 'z1_m4.png', stats: { hp: 120, strength: 8, agility: 5, intuition: 7, will: 8, constitution: 8, exp: 70, money: 50 } },
  ],
  z2: [
    { name: 'Шип-Лиана', image: 'z2_m1.png', stats: { hp: 90, strength: 6, agility: 7, intuition: 5, will: 6, constitution: 6, exp: 45, money: 25 } },
    { name: 'Споровое Облако', image: 'z2_m2.png', stats: { hp: 70, strength: 5, agility: 8, intuition: 8, will: 5, constitution: 5, exp: 55, money: 30 } },
    { name: 'Корнеход', image: 'z2_m3.png', stats: { hp: 150, strength: 9, agility: 4, intuition: 6, will: 10, constitution: 9, exp: 80, money: 60 } },
    { name: 'Кислотная Муха', image: 'z2_m4.png', stats: { hp: 60, strength: 7, agility: 10, intuition: 6, will: 4, constitution: 4, exp: 60, money: 35 } },
  ],
  z3: [
    { name: 'Рад-Скорпион', image: 'z3_m1.png', stats: { hp: 180, strength: 25, agility: 20, intuition: 15, will: 10, constitution: 25, exp: 100, money: 80 } },
    { name: 'Светящийся Гуль', image: 'z3_m5.png', stats: { hp: 160, strength: 22, agility: 25, intuition: 12, will: 15, constitution: 20, exp: 110, money: 90 } },
    { name: 'Пылевой Дьявол', image: 'z3_m3.png', stats: { hp: 140, strength: 18, agility: 30, intuition: 20, will: 18, constitution: 15, exp: 120, money: 100 } },
    { name: 'Урановый Голем', image: 'z3_m4.png', stats: { hp: 300, strength: 35, agility: 10, intuition: 10, will: 30, constitution: 40, exp: 200, money: 150 } },
  ],
  z4: [
    { name: 'Глитч-Призрак', image: 'z4_m1.png', stats: { hp: 130, strength: 8, agility: 15, intuition: 12, will: 8, constitution: 8, exp: 130, money: 110 } },
    { name: 'Дата-Пиявка', image: 'z4_m2.png', stats: { hp: 110, strength: 10, agility: 12, intuition: 10, will: 6, constitution: 7, exp: 140, money: 120 } },
    { name: 'Бот-Файрвол', image: 'z4_m3.png', stats: { hp: 200, strength: 14, agility: 6, intuition: 10, will: 12, constitution: 12, exp: 180, money: 140 } },
    { name: 'Логическая Бомба', image: 'z4_m4.png', stats: { hp: 150, strength: 12, agility: 10, intuition: 15, will: 10, constitution: 8, exp: 200, money: 160 } },
  ],
  z5: [
    { name: 'Байт-Паук', image: 'z5_m1.png', stats: { hp: 220, strength: 16, agility: 14, intuition: 12, will: 10, constitution: 12, exp: 220, money: 180 } },
    { name: 'Поврежденный Узел', image: 'z5_m2.png', stats: { hp: 250, strength: 18, agility: 8, intuition: 14, will: 15, constitution: 15, exp: 250, money: 200 } },
    { name: 'Шифратор', image: 'z5_m3.png', stats: { hp: 200, strength: 14, agility: 12, intuition: 18, will: 16, constitution: 10, exp: 280, money: 220 } },
    { name: 'Нулевой Фантом', image: 'z5_m4.png', stats: { hp: 180, strength: 20, agility: 20, intuition: 15, will: 12, constitution: 10, exp: 300, money: 250 } },
  ],
  z6: [
    { name: 'Эхо-Сталкер', image: 'z6_m1.png', stats: { hp: 240, strength: 20, agility: 18, intuition: 16, will: 14, constitution: 14, exp: 320, money: 260 } },
    { name: 'Миражный Зверь', image: 'z6_m2.png', stats: { hp: 280, strength: 22, agility: 16, intuition: 15, will: 16, constitution: 16, exp: 350, money: 280 } },
    { name: 'Идущий в Пустоте', image: 'z6_m3.png', stats: { hp: 300, strength: 24, agility: 14, intuition: 18, will: 18, constitution: 18, exp: 400, money: 320 } },
    { name: 'Повелитель Шепота', image: 'z6_m4.png', stats: { hp: 500, strength: 30, agility: 15, intuition: 25, will: 25, constitution: 25, exp: 600, money: 500 } },
  ]
};

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

export async function seedMonsters(prisma: PrismaClient) {
  console.log('Seeding monsters...');

  // Clear existing monsters
  await prisma.monster.deleteMany({});

  // Seed Zone Monsters
  for (const [zoneId, monsters] of Object.entries(ZONE_MONSTERS)) {
    for (const monster of monsters) {
      await prisma.monster.create({
        data: {
          name: monster.name,
          level: Math.floor(monster.stats.exp / 10), // Approx level derived from exp
          zoneId: zoneId,
          image: `zones/monsters/${monster.image}`,
          hp: monster.stats.hp,
          maxHp: monster.stats.hp,
          strength: monster.stats.strength,
          agility: monster.stats.agility,
          intuition: monster.stats.intuition,
          will: monster.stats.will,
          constitution: monster.stats.constitution,
          expReward: monster.stats.exp,
          moneyReward: monster.stats.money
        }
      });
      console.log(`Created monster: ${monster.name} in ${zoneId}`);
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
        zoneId: 'sewers_solo',
        image: imageName,
        ...baseStats
      }
    });
  }

  console.log('Monsters seeded successfully.');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedMonsters(prisma)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
