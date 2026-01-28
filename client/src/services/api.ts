import axios from 'axios';

const API_URL = '/api';

export const api = axios.create({
  baseURL: API_URL,
});

export const characterApi = {
  getCharacter: (id: string) => api.get(`/character/${id}`),
  createCharacter: (nickname: string, faction: string = 'neutral', userId?: string) => 
    api.post('/character', { nickname, faction, userId }),
  move: (id: string, destination: string) => api.post(`/character/${id}/move`, { destination }),
  changeAlignment: (id: string, newAlignment: string) => api.post(`/character/${id}/alignment`, { newAlignment }),
  equipItem: (id: string, itemId: string, slotId?: string) => api.post(`/character/${id}/equip`, { itemId, slotId }),
  unequipItem: (id: string, slotId: string) => api.post(`/character/${id}/unequip`, { slotId }),
};

export const shopApi = {
  getDailyItems: (characterId: string) => api.get(`/shop/daily`, { params: { characterId } }),
  buyItem: (characterId: string, itemId: string) => api.post('/shop/buy', { characterId, itemId }),
};

export const zoneApi = {
  searchMonster: (zoneId: string, playerLevel: number) => api.get(`/zones/${zoneId}/search`, { params: { playerLevel } }),
  getZoneInfo: (zoneId: string) => api.get(`/zones/${zoneId}`),
};

export const questApi = {
  getQuests: (characterId: string) => api.get(`/quest/${characterId}/quests`),
  getAchievements: (characterId: string) => api.get(`/quest/${characterId}/achievements`),
};
