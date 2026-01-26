import { create } from 'zustand';

export type ChatChannel = 'GENERAL' | 'CLAN' | 'PRIVATE';

export interface ChatMessage {
  id: string;
  sender: string;
  senderId: string;
  text: string;
  channel: ChatChannel;
  timestamp: Date;
  isSystem?: boolean;
}

export interface PlayerInLocation {
  id: string;
  name: string;
  level: number;
  avatar?: string;
  status?: 'idle' | 'battle' | 'afk';
}

interface ChatState {
  messages: ChatMessage[];
  activeChannel: ChatChannel;
  players: PlayerInLocation[];
  
  setActiveChannel: (channel: ChatChannel) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setPlayers: (players: PlayerInLocation[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    {
      id: '1',
      sender: 'System',
      senderId: 'sys',
      text: 'Добро пожаловать в Urba!',
      channel: 'GENERAL',
      timestamp: new Date(),
      isSystem: true
    },
    {
      id: '2',
      sender: 'Nagibator2000',
      senderId: 'p1',
      text: 'Кто в пати на крыс?',
      channel: 'GENERAL',
      timestamp: new Date()
    }
  ],
  activeChannel: 'GENERAL',
  players: [
    { id: '1', name: 'Nagibator2000', level: 5, status: 'idle' },
    { id: '2', name: 'ElvenPrincess', level: 3, status: 'battle' },
    { id: '3', name: 'Trader_Joe', level: 10, status: 'afk' },
    { id: '4', name: 'Killer3000', level: 7, status: 'idle' },
    { id: '5', name: 'Noob123', level: 1, status: 'idle' },
  ],
  
  setActiveChannel: (channel) => set({ activeChannel: channel }),
  
  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, { 
      ...msg, 
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    }]
  })),
  
  setPlayers: (players) => set({ players })
}));
