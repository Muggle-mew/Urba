import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding items...');

  // Clear existing items
  await prisma.dailyShop.deleteMany({});
  await prisma.item.deleteMany({});

  const items = [
    // Weapons
    {
      name: 'Ржавый Осколок',
      type: 'weapon',
      levelReq: 1,
      stats: JSON.stringify({ damage: 5, accuracy: 80 }),
      price: 50,
      image: '/assets/shop/rusty-shard.png'
    },
    {
      name: 'Шепчущий Пистолет',
      type: 'weapon',
      levelReq: 3,
      stats: JSON.stringify({ damage: 15, range: 10 }),
      price: 250,
      image: '/assets/shop/whisper-pistol.png'
    },
    {
      name: 'Био-Когти',
      type: 'weapon',
      levelReq: 5,
      stats: JSON.stringify({ damage: 25, speed: 1.2 }),
      price: 600,
      image: '/assets/shop/bio-claws.png'
    },
    {
      name: 'Лазерный Топор',
      type: 'weapon',
      levelReq: 8,
      stats: JSON.stringify({ damage: 45, critical: 0.1 }),
      price: 1200,
      image: '/assets/shop/laser-axe.png'
    },
    {
      name: 'Голо-Клинок',
      type: 'weapon',
      levelReq: 12,
      stats: JSON.stringify({ damage: 60, accuracy: 95 }),
      price: 2500,
      image: '/assets/shop/holo-blade.png'
    },

    // Armor
    {
      name: 'Костюм Хирурга',
      type: 'armor',
      levelReq: 2,
      stats: JSON.stringify({ defense: 8, health: 20 }),
      price: 150,
      image: '/assets/shop/surgeon-suit.png'
    },
    {
      name: 'Пластины Выжившего',
      type: 'armor',
      levelReq: 4,
      stats: JSON.stringify({ defense: 18 }),
      price: 400,
      image: '/assets/shop/survivor-plates.png'
    },
    {
      name: 'Куртка Тени',
      type: 'armor',
      levelReq: 7,
      stats: JSON.stringify({ defense: 25, evasion: 0.1 }),
      price: 900,
      image: '/assets/shop/shadow-jacket.png'
    },
    {
      name: 'Эхо-Плащ',
      type: 'armor',
      levelReq: 10,
      stats: JSON.stringify({ defense: 35, stealth: true }),
      price: 1800,
      image: '/assets/shop/echo-cloak.png'
    },
    {
      name: 'Имплант Синтеза',
      type: 'armor',
      levelReq: 15,
      stats: JSON.stringify({ defense: 50, regeneration: 2 }),
      price: 3500,
      image: '/assets/shop/synthesis-implant.png'
    }
  ];

  for (const item of items) {
    const createdItem = await prisma.item.create({
      data: item
    });
    console.log(`Created item: ${createdItem.name}`);
  }

  console.log('Seeding items done.');

  console.log('Start seeding monsters...');
  await prisma.monster.deleteMany({});

  const monsters = [
    // Zone 1
    { name: 'Крыса-мутант', level: 1, zoneId: 'z1', hp: 30, maxHp: 30, strength: 3, agility: 4, intuition: 2, will: 1, constitution: 3, expReward: 10, moneyReward: 5 },
    { name: 'Бродяга', level: 2, zoneId: 'z1', hp: 45, maxHp: 45, strength: 5, agility: 3, intuition: 3, will: 2, constitution: 4, expReward: 20, moneyReward: 10 },
    
    // Zone 2
    { name: 'Дикий пёс', level: 3, zoneId: 'z2', hp: 60, maxHp: 60, strength: 7, agility: 6, intuition: 4, will: 3, constitution: 5, expReward: 35, moneyReward: 15 },
    { name: 'Мародер', level: 4, zoneId: 'z2', hp: 80, maxHp: 80, strength: 9, agility: 5, intuition: 5, will: 4, constitution: 6, expReward: 50, moneyReward: 25 },

    // Zone 3
    { name: 'Радиоактивный слизень', level: 5, zoneId: 'z3', hp: 100, maxHp: 100, strength: 8, agility: 2, intuition: 1, will: 8, constitution: 10, expReward: 70, moneyReward: 30 },
    { name: 'Изгой', level: 6, zoneId: 'z3', hp: 120, maxHp: 120, strength: 12, agility: 7, intuition: 6, will: 5, constitution: 7, expReward: 90, moneyReward: 40 },

    // Zone 4
    { name: 'Кибер-шакал', level: 7, zoneId: 'z4', hp: 150, maxHp: 150, strength: 15, agility: 10, intuition: 8, will: 6, constitution: 8, expReward: 120, moneyReward: 50 },
    { name: 'Дрон-охранник', level: 8, zoneId: 'z4', hp: 180, maxHp: 180, strength: 18, agility: 12, intuition: 10, will: 10, constitution: 9, expReward: 150, moneyReward: 70 },

    // Zone 5
    { name: 'Глюк', level: 9, zoneId: 'z5', hp: 220, maxHp: 220, strength: 20, agility: 15, intuition: 12, will: 8, constitution: 10, expReward: 190, moneyReward: 90 },
    { name: 'Сборщик данных', level: 10, zoneId: 'z5', hp: 260, maxHp: 260, strength: 25, agility: 8, intuition: 15, will: 12, constitution: 12, expReward: 240, moneyReward: 120 },

    // Zone 6
    { name: 'Тень', level: 11, zoneId: 'z6', hp: 300, maxHp: 300, strength: 30, agility: 20, intuition: 18, will: 15, constitution: 14, expReward: 300, moneyReward: 150 },
    { name: 'Фантом', level: 12, zoneId: 'z6', hp: 350, maxHp: 350, strength: 35, agility: 25, intuition: 20, will: 20, constitution: 16, expReward: 380, moneyReward: 200 },
  ];

  for (const m of monsters) {
    await prisma.monster.create({ data: m });
  }
  console.log('Seeding monsters done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
