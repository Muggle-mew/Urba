import { create } from 'zustand';
import type { Zone, Monster } from '../types/location';
import { zoneApi } from '../services/zoneService';

interface ZoneStore {
  currentZone: Zone | null;
  foundMonster: Monster | null;
  isLoading: boolean;
  error: string | null;
  
  enterZone: (zoneId: string) => Promise<void>;
  searchMonster: (playerLevel: number) => Promise<void>;
  clearMonster: () => void;
  leaveZone: () => void;
}

export const useZoneStore = create<ZoneStore>((set, get) => ({
  currentZone: null,
  foundMonster: null,
  isLoading: false,
  error: null,

  enterZone: async (zoneId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await zoneApi.getZone(zoneId);
      set({ currentZone: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to enter zone:', error);
      set({ error: 'Не удалось загрузить локацию', isLoading: false });
    }
  },

  searchMonster: async (playerLevel: number) => {
    const { currentZone } = get();
    if (!currentZone) return;

    set({ isLoading: true, error: null, foundMonster: null });
    try {
      // Simulate delay for "searching" effect
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await zoneApi.searchMonster(currentZone.id, playerLevel);
      set({ foundMonster: response.data.monster, isLoading: false });
    } catch (error) {
      console.error('Failed to search monster:', error);
      set({ error: 'Никого не нашли...', isLoading: false });
    }
  },

  clearMonster: () => set({ foundMonster: null }),
  
  leaveZone: () => set({ currentZone: null, foundMonster: null })
}));
