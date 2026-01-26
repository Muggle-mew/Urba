import { create } from 'zustand';
import type { Item, CityId } from './useCharacterStore';

export interface ShopItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor';
  levelReq: number;
  damage?: number;
  attackSpeed?: number;
  damageType?: 'physical' | 'energy' | 'sonic';
  defense?: number;
  weight?: number;
  bonusStats?: string;
  price: number;
  image: string;
}

interface ShopStore {
  isOpen: boolean;
  activeCity: CityId | null;
  dailyItems: ShopItem[];
  isLoading: boolean;
  openShop: (cityId: CityId) => void;
  closeShop: () => void;
  fetchDailyItems: () => Promise<void>;
  buyItem: (itemId: string) => Promise<boolean>;
}

// Mock data generator
const generateMockItems = (): ShopItem[] => [
  // Weapons
  {
    id: 'laser-axe',
    name: 'Лазерный топор',
    type: 'weapon',
    levelReq: 12,
    damage: 45,
    attackSpeed: 1.2,
    damageType: 'energy',
    price: 850,
    image: '/assets/shop/laser-axe.png'
  },
  {
    id: 'whisper-pistol',
    name: 'Звуковой пистолет «Шёпот»',
    type: 'weapon',
    levelReq: 15,
    damage: 55,
    attackSpeed: 1.4,
    damageType: 'sonic',
    price: 1100,
    image: '/assets/shop/whisper-pistol.png'
  },
  {
    id: 'bio-claws',
    name: 'Био-когти «Синтез»',
    type: 'weapon',
    levelReq: 18,
    damage: 40,
    attackSpeed: 2.2,
    damageType: 'physical',
    bonusStats: '+15 Ловкость',
    price: 1600,
    image: '/assets/shop/bio-claws.png'
  },
  {
    id: 'rusty-shard',
    name: 'Ржавый обломок «Гнев Рад-Сити»',
    type: 'weapon',
    levelReq: 8,
    damage: 70,
    attackSpeed: 0.6,
    damageType: 'physical',
    bonusStats: '+5 Сила',
    price: 700,
    image: '/assets/shop/rusty-shard.png'
  },
  {
    id: 'holo-blade',
    name: 'Голографический клинок «Эхо»',
    type: 'weapon',
    levelReq: 20,
    damage: 65,
    attackSpeed: 1.5,
    damageType: 'energy',
    bonusStats: '+20 Интуиция',
    price: 2200,
    image: '/assets/shop/holo-blade.png'
  },
  // Armor
  {
    id: 'shadow-jacket',
    name: 'Куртка «Тень»',
    type: 'armor',
    levelReq: 10,
    defense: 35,
    weight: 2.0,
    bonusStats: '+10 Скрытность',
    price: 950,
    image: '/assets/shop/shadow-jacket.png'
  },
  {
    id: 'survivor-plates',
    name: 'Бронепластины «Выживший»',
    type: 'armor',
    levelReq: 14,
    defense: 85,
    weight: 18.0,
    bonusStats: '+15 Живучесть',
    price: 1400,
    image: '/assets/shop/survivor-plates.png'
  },
  {
    id: 'synthesis-implant',
    name: 'Имплант-броня «Синтез»',
    type: 'armor',
    levelReq: 22,
    defense: 60,
    weight: 0.5,
    bonusStats: '+30 Энергия',
    price: 2500,
    image: '/assets/shop/synthesis-implant.png'
  },
  {
    id: 'echo-cloak',
    name: 'Голографический плащ «Эхо»',
    type: 'armor',
    levelReq: 18,
    defense: 45,
    weight: 1.0,
    bonusStats: '+25 Уклонение',
    price: 1800,
    image: '/assets/shop/echo-cloak.png'
  },
  {
    id: 'surgeon-suit',
    name: 'Медицинский комбинезон «Хирург»',
    type: 'armor',
    levelReq: 12,
    defense: 25,
    weight: 1.5,
    bonusStats: '+10 Регенерация',
    price: 1200,
    image: '/assets/shop/surgeon-suit.png'
  }
];

export const useShopStore = create<ShopStore>((set, get) => ({
  isOpen: false,
  activeCity: null,
  dailyItems: [],
  isLoading: false,

  openShop: (cityId) => {
    set({ isOpen: true, activeCity: cityId });
    get().fetchDailyItems();
  },

  closeShop: () => {
    set({ isOpen: false, activeCity: null });
  },

  fetchDailyItems: async () => {
    set({ isLoading: true });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    set({ dailyItems: generateMockItems(), isLoading: false });
  },

  buyItem: async (itemId) => {
    // Simulate purchase
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real app, we would verify funds and add to inventory here
    return true; 
  }
}));
