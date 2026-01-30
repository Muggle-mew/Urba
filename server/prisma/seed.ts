import { PrismaClient } from '@prisma/client';
import { seedMonsters } from './seed_monsters';

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

  await seedMonsters(prisma);
  console.log('Monsters seeded successfully.');

  // Seed default user and character
  const userId = 'user_123';
  const charId = 'char_123';

  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        id: userId,
      }
    });
    console.log('Created default user: ' + userId);
  }

  const existingChar = await prisma.character.findUnique({ where: { id: charId } });
  if (!existingChar) {
    await prisma.character.create({
      data: {
        id: charId,
        userId: userId,
        nickname: 'Survivor',
        faction: 'neutral',
        location: JSON.stringify({ city: 'verdis', isTraveling: false }),
        inventory: "[]",
        equipment: "{}"
      }
    });
    console.log('Created default character: ' + charId);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
