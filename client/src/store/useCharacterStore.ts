import { create } from 'zustand';
import { characterApi } from '../services/api';

export interface Item {
  id: string;
  name: string;
  image?: string;
  type: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'artifact';
  stats?: Record<string, number>;
  description?: string;
  price?: number;
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

export type CityId = 'verdis' | 'ash' | 'nima';
export type ZoneId = 'z1' | 'z2' | 'z3' | 'z4' | 'z5' | 'z6';
export type LocationId = CityId | ZoneId;

export interface CharacterProfile {
  id: string; // Added ID
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
  fragments: number; // money
  stats: CharacterStats;
  equipment: Equipment;
  location: {
    city: LocationId; // Renamed concept but kept key for compatibility, now accepts ZoneId too
    isTraveling: boolean;
    travelDestination?: LocationId;
    travelEndTime?: number;
  };
  inventory?: Item[]; // Added inventory
}

interface CharacterStore {
  character: CharacterProfile | null; // Renamed/Aliased
  isLoading: boolean;
  isOpen: boolean;
  isQuestsOpen: boolean;
  openProfile: () => void;
  closeProfile: () => void;
  openQuests: () => void;
  closeQuests: () => void;
  startTravel: (destination: LocationId) => void;
  completeTravel: () => void;
  fetchCharacter: (id: string) => Promise<void>;
  updateCharacter: (updates: Partial<CharacterProfile>) => void;
  changeAlignment: (newSide: string) => Promise<boolean>;
}

const DEFAULT_PROFILE: CharacterProfile = {
  id: 'temp-id',
  name: 'Loading...',
  level: 1,
  alignment: { side: 'neutral', value: 0 },
  registrationDate: new Date().toLocaleDateString(),
  citizenship: 'wanderer',
  hp: { current: 100, max: 100 },
  energy: { current: 100, max: 100 },
  fragments: 0,
  stats: { strength: 10, agility: 10, intuition: 10, constitution: 10, will: 10 },
  equipment: {},
  location: { city: 'verdis', isTraveling: false },
  inventory: []
};

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  character: null,
  isLoading: false,
  isOpen: false,
  isQuestsOpen: false,
  
  openProfile: () => set({ isOpen: true }),
  closeProfile: () => set({ isOpen: false }),
  openQuests: () => set({ isQuestsOpen: true }),
  closeQuests: () => set({ isQuestsOpen: false }),
  
  startTravel: (destination) => set((state) => {
    if (!state.character) return {};
    return {
      character: {
        ...state.character,
        location: {
          city: state.character.location.city,
          isTraveling: true,
          travelDestination: destination,
          // travelEndTime: Date.now() + 5 * 60 * 1000 // 5 minutes (Production)
          travelEndTime: Date.now() + 10 * 1000 // 10 seconds (Dev/Test)
        }
      }
    };
  }),
  
  completeTravel: async () => {
    const state = get();
    if (!state.character?.location.travelDestination) return;
    
    const destination = state.character.location.travelDestination;
    const characterId = state.character.id;

    // Optimistic update
    set((state) => ({
      character: state.character ? {
        ...state.character,
        location: {
          city: destination,
          isTraveling: false,
          travelDestination: undefined,
          travelEndTime: undefined
        }
      } : null
    }));

    try {
      await characterApi.move(characterId, destination);
    } catch (error) {
      console.error('Failed to sync move with server:', error);
    }
  },

  fetchCharacter: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000);
      });

      let data;
      try {
        const response: any = await Promise.race([
          characterApi.getCharacter(id),
          timeoutPromise
        ]);
        data = response.data;
      } catch (err: any) {
        if (err.message === 'Timeout') {
          throw new Error('Сервер не отвечает. Попробуйте позже.');
        }
        if (err.response && err.response.status === 404) {
          console.log('Character not found, creating new one...');
          // Creating user if not found - pass hardcoded ID for now or random
          // In real app, we need auth logic here
          const createResponse = await characterApi.createCharacter('Player', 'neutral', id); // Pass ID as userId
          data = createResponse.data;
        } else {
          throw err;
        }
      }
      
      // Map backend data to frontend structure
      // Backend already returns data in CharacterProfile format thanks to formatCharacter
      const mappedProfile: CharacterProfile = {
        ...DEFAULT_PROFILE, // Fallback for missing fields
        ...data,
        // Ensure nested objects are merged/copied correctly if needed, 
        // but backend response should be authoritative.
        // Special handling if backend returns 'money' instead of 'fragments' (it shouldn't, but just in case)
        fragments: data.fragments ?? data.money ?? 0,
      };
      
      set({ character: mappedProfile, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch character:', error);
      set({ 
        isLoading: false, 
        error: error.message || 'Ошибка загрузки персонажа' 
      });
    }
  },

  updateCharacter: (updates) => set((state) => ({
    character: state.character ? { ...state.character, ...updates } : null
  })),

  changeAlignment: async (newSide) => {
    set({ isLoading: true });
    try {
      // @ts-ignore - access state inside async function
      const characterId = useCharacterStore.getState().character?.id;
      if (!characterId) return false;

      const response = await characterApi.changeAlignment(characterId, newSide);
      const data = response.data;

      // Update local state with new data
      set((state) => {
        if (!state.character) return {};
        return {
          character: {
            ...state.character,
            alignment: {
              side: data.faction as any,
              value: 0
            },
            fragments: data.money
          },
          isLoading: false
        };
      });
      return true;
    } catch (error) {
      console.error('Failed to change alignment:', error);
      set({ isLoading: false });
      return false;
    }
  },

  equipItem: async (itemId, slotId) => {
    set({ isLoading: true });
    try {
      // @ts-ignore
      const characterId = useCharacterStore.getState().character?.id;
      if (!characterId) return false;

      const response = await characterApi.equipItem(characterId, itemId, slotId);
      const data = response.data;

      set((state) => {
        if (!state.character) return {};
        return {
          character: {
            ...state.character,
            inventory: data.inventory,
            equipment: data.equipment
          },
          isLoading: false
        };
      });
      return true;
    } catch (error) {
      console.error('Failed to equip item:', error);
      set({ isLoading: false });
      return false;
    }
  },

  unequipItem: async (slotId) => {
    set({ isLoading: true });
    try {
      // @ts-ignore
      const characterId = useCharacterStore.getState().character?.id;
      if (!characterId) return false;

      const response = await characterApi.unequipItem(characterId, slotId);
      const data = response.data;

      set((state) => {
        if (!state.character) return {};
        return {
          character: {
            ...state.character,
            inventory: data.inventory,
            equipment: data.equipment
          },
          isLoading: false
        };
      });
      return true;
    } catch (error) {
      console.error('Failed to unequip item:', error);
      set({ isLoading: false });
      return false;
    }
  }
}));
