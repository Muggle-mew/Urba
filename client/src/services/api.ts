import axios from 'axios';

const API_URL = '/api';

export const api = axios.create({
  baseURL: API_URL,
});

export const characterApi = {
  getCharacter: (id: string) => api.get(`/character/${id}`),
  createCharacter: (nickname: string, faction: string = 'neutral', userId?: string) => 
    api.post('/character', { nickname, faction, userId }),
  changeAlignment: (id: string, newAlignment: string) => api.post(`/character/${id}/alignment`, { newAlignment }),
  equipItem: (id: string, itemId: string, slotId?: string) => api.post(`/character/${id}/equip`, { itemId, slotId }),
  unequipItem: (id: string, slotId: string) => api.post(`/character/${id}/unequip`, { slotId }),
};

export const shopApi = {
  getDailyItems: (characterId: string) => api.get(`/shop/daily`, { params: { characterId } }),
  buyItem: (characterId: string, itemId: string) => api.post('/shop/buy', { characterId, itemId }),
};
