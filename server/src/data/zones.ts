import { Zone, Monster } from '../types/location';

// Monsters
export const MONSTERS: Record<string, Monster> = {
  // Zone 1: Abandoned TPP
  'betonozhil': { id: 'betonozhil', name: 'Бетоножил', level: 5, hp: 100, image: 'betonozhil.png', drops: { exp: 30, money: 20 } },
  'krysoed': { id: 'krysoed', name: 'Крысоед', level: 6, hp: 80, image: 'krysoed.png', drops: { exp: 40, money: 25 } },
  'glot-tolpy': { id: 'glot-tolpy', name: 'Голос Толпы', level: 7, hp: 90, image: 'glot-tolpy.png', drops: { exp: 50, money: 30 } },
  'muskorol': { id: 'muskorol', name: 'Мусорный Король', level: 8, hp: 120, image: 'muskorol.png', drops: { exp: 70, money: 50 } },

  // Zone 2: Mutant Forest
  'shyp-liana': { id: 'shyp-liana', name: 'Шип-Лиана', level: 6, hp: 90, image: 'shyp-liana.png', drops: { exp: 45, money: 25 } },
  'spore-cloud': { id: 'spore-cloud', name: 'Споровое Облако', level: 7, hp: 70, image: 'spore-cloud.png', drops: { exp: 55, money: 30 } },
  'root-walker': { id: 'root-walker', name: 'Корнеход', level: 8, hp: 150, image: 'root-walker.png', drops: { exp: 80, money: 60 } },
  'acid-fly': { id: 'acid-fly', name: 'Кислотная Муха', level: 9, hp: 60, image: 'acid-fly.png', drops: { exp: 60, money: 35 } },

  // Zone 3: Radioactive Canyon
  'rad-scorpion': { id: 'rad-scorpion', name: 'Рад-Скорпион', level: 10, hp: 180, image: 'rad-scorpion.png', drops: { exp: 100, money: 80 } },
  'glowing-ghoul': { id: 'glowing-ghoul', name: 'Светящийся Гуль', level: 11, hp: 160, image: 'glowing-ghoul.png', drops: { exp: 110, money: 90 } },
  'dust-devil': { id: 'dust-devil', name: 'Пылевой Дьявол', level: 12, hp: 140, image: 'dust-devil.png', drops: { exp: 120, money: 100 } },
  'uranium-golem': { id: 'uranium-golem', name: 'Урановый Голем', level: 14, hp: 300, image: 'uranium-golem.png', drops: { exp: 200, money: 150 } },

  // Zone 4: Digital Ruins
  'glitch-specter': { id: 'glitch-specter', name: 'Глитч-Призрак', level: 12, hp: 130, image: 'glitch-specter.png', drops: { exp: 130, money: 110 } },
  'data-leech': { id: 'data-leech', name: 'Дата-Пиявка', level: 13, hp: 110, image: 'data-leech.png', drops: { exp: 140, money: 120 } },
  'firewall-bot': { id: 'firewall-bot', name: 'Бот-Файрвол', level: 14, hp: 200, image: 'firewall-bot.png', drops: { exp: 180, money: 140 } },
  'logic-bomb': { id: 'logic-bomb', name: 'Логическая Бомба', level: 15, hp: 150, image: 'logic-bomb.png', drops: { exp: 200, money: 160 } },

  // Zone 5: Data Dungeon
  'byte-spider': { id: 'byte-spider', name: 'Байт-Паук', level: 15, hp: 220, image: 'byte-spider.png', drops: { exp: 220, money: 180 } },
  'corrupted-node': { id: 'corrupted-node', name: 'Поврежденный Узел', level: 16, hp: 250, image: 'corrupted-node.png', drops: { exp: 250, money: 200 } },
  'encryptor': { id: 'encryptor', name: 'Шифратор', level: 17, hp: 200, image: 'encryptor.png', drops: { exp: 280, money: 220 } },
  'zero-phantom': { id: 'zero-phantom', name: 'Нулевой Фантом', level: 18, hp: 180, image: 'zero-phantom.png', drops: { exp: 300, money: 250 } },

  // Zone 6: Wasteland of Whispers
  'echo-stalker': { id: 'echo-stalker', name: 'Эхо-Сталкер', level: 18, hp: 240, image: 'echo-stalker.png', drops: { exp: 320, money: 260 } },
  'mirage-beast': { id: 'mirage-beast', name: 'Миражный Зверь', level: 19, hp: 280, image: 'mirage-beast.png', drops: { exp: 350, money: 280 } },
  'void-walker': { id: 'void-walker', name: 'Идущий в Пустоте', level: 20, hp: 300, image: 'void-walker.png', drops: { exp: 400, money: 320 } },
  'whisper-lord': { id: 'whisper-lord', name: 'Повелитель Шепота', level: 22, hp: 500, image: 'whisper-lord.png', drops: { exp: 600, money: 500 } }
};

export const ZONES: Record<string, Zone> = {
  // Nova-Chimera <-> Rad-City
  'z1': {
    id: 'z1',
    name: 'Заброшенная ТЭЦ',
    description: 'Старая теплоэлектроцентраль, захваченная мутантами и мародерами.',
    imagePath: '/assets/maps/zones/z1.jpg',
    monsters: ['betonozhil', 'krysoed', 'glot-tolpy', 'muskorol'],
    connectedTo: ['nova-chimera', 'z2']
  },
  'z2': {
    id: 'z2',
    name: 'Мутантский лес',
    description: 'Лес, где флора и фауна мутировали под воздействием химикатов.',
    imagePath: '/assets/maps/zones/z2.jpg',
    monsters: ['shyp-liana', 'spore-cloud', 'root-walker', 'acid-fly'],
    connectedTo: ['z1', 'rad-city']
  },

  // Rad-City <-> Echo-Quarter
  'z3': {
    id: 'z3',
    name: 'Радиоактивный каньон',
    description: 'Глубокий разлом, светящийся от радиации. Обитель опасных тварей.',
    imagePath: '/assets/maps/zones/z3.jpg',
    monsters: ['rad-scorpion', 'glowing-ghoul', 'dust-devil', 'uranium-golem'],
    connectedTo: ['rad-city', 'z4']
  },
  'z4': {
    id: 'z4',
    name: 'Цифровые руины',
    description: 'Остатки древних серверов, где реальность смешивается с цифрой.',
    imagePath: '/assets/maps/zones/z4.jpg',
    monsters: ['glitch-specter', 'data-leech', 'firewall-bot', 'logic-bomb'],
    connectedTo: ['z3', 'echo-quarter']
  },

  // Echo-Quarter <-> Nova-Chimera
  'z5': {
    id: 'z5',
    name: 'Подземелье данных',
    description: 'Лабиринт подземных коммуникаций, где хранятся забытые секреты.',
    imagePath: '/assets/maps/zones/z5.jpg',
    monsters: ['byte-spider', 'corrupted-node', 'encryptor', 'zero-phantom'],
    connectedTo: ['echo-quarter', 'z6']
  },
  'z6': {
    id: 'z6',
    name: 'Пустошь шепотов',
    description: 'Пустынная местность, где ветер доносит голоса погибших.',
    imagePath: '/assets/maps/zones/z6.jpg',
    monsters: ['echo-stalker', 'mirage-beast', 'void-walker', 'whisper-lord'],
    connectedTo: ['z5', 'nova-chimera']
  }
};
