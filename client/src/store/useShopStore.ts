import { create } from 'zustand';
import type { CityId } from './useCharacterStore';
import { shopApi } from '../services/api';
import { useCharacterStore } from './useCharacterStore';

export interface ShopItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor';
  levelReq: number;
  stats?: any; // To store parsed JSON stats
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
  fetchDailyItems: (characterId: string) => Promise<void>;
  buyItem: (characterId: string, itemId: string) => Promise<boolean>;
}

export const useShopStore = create<ShopStore>((set, get) => ({
  isOpen: false,
  activeCity: null,
  dailyItems: [],
  isLoading: false,

  openShop: (cityId) => {
    set({ isOpen: true, activeCity: cityId });
    const { character } = useCharacterStore.getState();
    if (character?.id) {
      get().fetchDailyItems(character.id);
    }
  },

  closeShop: () => set({ isOpen: false }),

  fetchDailyItems: async (characterId) => {
    set({ isLoading: true });
    try {
      const response = await shopApi.getDailyItems(characterId);
      const items = response.data.map((item: any) => {
        const stats = typeof item.stats === 'string' ? JSON.parse(item.stats) : item.stats || {};
        return {
          ...item,
          ...stats, // Spread stats to root level for easier access
          stats,
          image: item.image || '/assets/shop/default.png'
        };
      });
      set({ dailyItems: items, isLoading: false, error: null });
    } catch (error) {
      console.error('Failed to fetch shop items:', error);
      set({ isLoading: false, error: 'Не удалось загрузить товары' });
    }
  },

  buyItem: async (characterId, itemId) => {
    set({ error: null });
    try {
      const response = await shopApi.buyItem(characterId, itemId);
      // Update character in store
      const updatedCharacter = response.data;
      // We might need to map it back or just update fields
      useCharacterStore.getState().fetchCharacter(characterId);
      return true;
    } catch (error: any) {
      console.error('Failed to buy item:', error);
      const msg = error.response?.data?.error || 'Ошибка покупки';
      set({ error: msg });
      return false;
    }
  },

  clearError: () => set({ error: null })
}));
