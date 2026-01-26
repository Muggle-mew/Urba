import { api } from './api';
import type { Zone, Monster } from '../types/location';

export const zoneApi = {
  getZone: (id: string) => api.get<Zone>(`/zone/${id}`),
  searchMonster: (zoneId: string, playerLevel: number) => 
    api.get<{ monster: Monster }>(`/zone/${zoneId}/search`, { params: { playerLevel } })
};
