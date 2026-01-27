import React, { useState } from 'react';
import { X, Scroll, User, Users, Swords, Flag, Loader2 } from 'lucide-react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useBattleStore } from '../../store/useBattleStore';
import { zoneApi } from '../../services/api';

interface SewersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SewersModal: React.FC<SewersModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const character = useCharacterStore(state => state.character);
  const socket = useBattleStore(state => state.socket);

  const handleSoloClick = async () => {
    if (!character || !socket || isLoading) return;
    setIsLoading(true);
    try {
      // Search in 'sewers_solo' zone
      const res = await zoneApi.searchMonster('sewers_solo', character.level);
      const monster = res.data.monster;
      
      // Start battle
      socket.emit('battle_start_pve', { 
        characterId: character.id, 
        monsterId: monster.id,
        monsterLevel: monster.level
      });
      
      // Close modal (App will switch screen automatically)
      onClose();
    } catch (err) {
      console.error('Failed to start sewers battle:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-2xl flex flex-col">
        
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/assets/maps/sewers/bg.jpg" 
            alt="Sewers" 
            className="w-full h-full object-cover opacity-60"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('bg-zinc-800');
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        </div>

        {/* Header / Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-red-900/50 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
        >
          <X size={24} />
        </button>

        {/* Top Left: Quests Button */}
        <div className="absolute top-8 left-8 z-20">
          <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-900/80 to-amber-950/80 border border-amber-600/50 rounded-lg hover:border-amber-500 hover:from-amber-800 hover:to-amber-900 transition-all group backdrop-blur-md shadow-lg">
            <Scroll className="text-amber-400 group-hover:text-amber-200" size={24} />
            <span className="text-xl font-bold text-amber-100 uppercase tracking-wide">Задания</span>
          </button>
        </div>

        {/* Content Area (Middle) - Decorative Title */}
        <div className="flex-1 relative z-10 flex items-center justify-center pointer-events-none">
           <h1 className="text-6xl font-black text-white/10 uppercase tracking-[1em] select-none">Стоки</h1>
        </div>

        {/* Bottom: 5 Buttons */}
        <div className="relative z-20 p-6 bg-gradient-to-t from-black/90 to-transparent">
          <div className="flex gap-4 w-full h-24">
            
            {/* 1. Solo */}
            <button 
              onClick={handleSoloClick}
              disabled={isLoading}
              className="flex-1 flex flex-col items-center justify-center gap-2 bg-zinc-900/80 border border-zinc-600 hover:border-zinc-400 hover:bg-zinc-800 rounded-lg transition-all group backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin text-zinc-400" size={28} />
              ) : (
                <User className="text-zinc-400 group-hover:text-white mb-1" size={28} />
              )}
              <span className="font-bold text-zinc-300 group-hover:text-white uppercase text-sm">Соло</span>
            </button>

            {/* 2. Solo Conquest */}
            <button className="flex-1 flex flex-col items-center justify-center gap-2 bg-red-950/80 border border-red-800 hover:border-red-500 hover:bg-red-900 rounded-lg transition-all group backdrop-blur-sm">
              <div className="flex gap-1">
                 <User className="text-red-400 group-hover:text-red-200" size={20} />
                 <Swords className="text-red-500 group-hover:text-red-300" size={20} />
              </div>
              <span className="font-bold text-red-200 group-hover:text-white uppercase text-sm text-center leading-tight">Соло<br/>Завоевание</span>
            </button>

            {/* 3. Party */}
            <button className="flex-1 flex flex-col items-center justify-center gap-2 bg-blue-950/80 border border-blue-800 hover:border-blue-500 hover:bg-blue-900 rounded-lg transition-all group backdrop-blur-sm">
              <Users className="text-blue-400 group-hover:text-blue-200 mb-1" size={28} />
              <span className="font-bold text-blue-200 group-hover:text-white uppercase text-sm">Пати</span>
            </button>

            {/* 4. Party Conquest */}
            <button className="flex-1 flex flex-col items-center justify-center gap-2 bg-purple-950/80 border border-purple-800 hover:border-purple-500 hover:bg-purple-900 rounded-lg transition-all group backdrop-blur-sm">
              <div className="flex gap-1">
                 <Users className="text-purple-400 group-hover:text-purple-200" size={20} />
                 <Swords className="text-purple-500 group-hover:text-purple-300" size={20} />
              </div>
              <span className="font-bold text-purple-200 group-hover:text-white uppercase text-sm text-center leading-tight">Пати<br/>Завоевание</span>
            </button>

            {/* 5. Clan Conquest */}
            <button className="flex-1 flex flex-col items-center justify-center gap-2 bg-yellow-950/80 border border-yellow-800 hover:border-yellow-500 hover:bg-yellow-900 rounded-lg transition-all group backdrop-blur-sm">
              <Flag className="text-yellow-500 group-hover:text-yellow-200 mb-1" size={28} />
              <span className="font-bold text-yellow-200 group-hover:text-white uppercase text-sm text-center leading-tight">Клан<br/>Завоевание</span>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};
