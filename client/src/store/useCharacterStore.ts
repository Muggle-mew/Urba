import { create } from 'zustand';

export interface Item {
  id: string;
  name: string;
  image?: string;
  type: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'artifact';
  stats?: Record<string, number>;
  description?: string;
}

export interface Equipment {
  helmet?: Item;
  earrings?: Item;
  amulet?: Item;
  weapon?: Item;
  armor?: Item;
  belt?: Item;
  ring1?: Item;
  ring2?: Item;
  gloves?: Item;
  shield?: Item;
  pants?: Item;
  boots?: Item;
}

export interface CharacterStats {
  strength: number;
  agility: number;
  intuition: number;
  constitution: number;
  will: number;
}

export type CityId = 'nova-chimera' | 'rad-city' | 'echo-quarter';

export interface CharacterProfile {
  name: string;
  level: number;
  alignment: {
    side: 'synthesis' | 'relicts' | 'shadow' | 'pulse' | 'outcast' | 'neutral';
    value: number;
  };
  clan?: {
    name: string;
    rank: string;
    icon?: string;
  };
  registrationDate: string;
  citizenship: string;
  hp: { current: number; max: number };
  energy: { current: number; max: number };
  fragments: number;
  stats: CharacterStats;
  equipment: Equipment;
  location: {
    city: CityId;
    isTraveling: boolean;
    travelDestination?: CityId;
    travelEndTime?: number;
  };
}

interface CharacterStore {
  profile: CharacterProfile;
  isOpen: boolean;
  openProfile: () => void;
  closeProfile: () => void;
  startTravel: (destination: CityId) => void;
  completeTravel: () => void;
}

const MOCK_ITEM: Item = {
  id: '1',
  name: 'Меч тысячи истин',
  type: 'weapon',
  rarity: 'artifact',
  stats: {
    'Урон': 150,
    'Сила': 10,
    'Мф. крита': 50
  },
  description: 'Легендарное оружие, предсказанное в пророчестве.'
};

const MOCK_PROFILE: CharacterProfile = {
  name: 'DIKAYA',
  level: 23,
  alignment: { side: 'synthesis', value: 2 },
  clan: {
    name: 'Избранные',
    rank: 'Хранительница ключа Защиты',
  },
  registrationDate: '22 декабря 2004 г.',
  citizenship: 'гражданин',
  hp: { current: 1103, max: 1103 },
  energy: { current: 96, max: 100 },
  fragments: 1500,
  stats: {
    strength: 50,
    agility: 300,
    intuition: 234,
    constitution: 33,
    will: 45
  },
  equipment: {
    helmet: { ...MOCK_ITEM, name: 'Шлем вечности', type: 'helmet' },
    weapon: { ...MOCK_ITEM, name: 'Посох света', type: 'weapon' },
    armor: { ...MOCK_ITEM, name: 'Туника заката', type: 'armor' },
    ring1: { ...MOCK_ITEM, name: 'Кольцо всевластия', type: 'ring' },
    boots: { ...MOCK_ITEM, name: 'Сандалии Гермеса', type: 'boots' },
    pants: { ...MOCK_ITEM, name: 'Поножи теней', type: 'pants' }
  },
  location: {
    city: 'nova-chimera',
    isTraveling: false
  }
};

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  profile: MOCK_PROFILE,
  isOpen: false,
  openProfile: () => set({ isOpen: true }),
  closeProfile: () => set({ isOpen: false }),
  startTravel: (destination: CityId) => {
    const travelTime = 5 * 60 * 1000; // 5 minutes
    set(state => ({
      profile: {
        ...state.profile,
        location: {
          ...state.profile.location,
          isTraveling: true,
          travelDestination: destination,
          travelEndTime: Date.now() + travelTime
        }
      }
    }));
  },
  completeTravel: () => {
    const { profile } = get();
    if (profile.location.isTraveling && profile.location.travelDestination) {
      set(state => ({
        profile: {
          ...state.profile,
          location: {
            city: profile.location.travelDestination!,
            isTraveling: false,
            travelDestination: undefined,
            travelEndTime: undefined
          }
        }
      }));
    }
  }
}));
