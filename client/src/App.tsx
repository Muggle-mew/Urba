import React, { useEffect } from 'react';
import { useCharacterStore } from './store/useCharacterStore';
import { useBattleStore } from './store/useBattleStore';
import { BattleScreen } from './components/BattleScreen';
import { ShopModal } from './components/shop/ShopModal';
import { CharacterProfileModal } from './components/profile/CharacterProfileModal';
import { GameLayout } from './components/layout/GameLayout';
import { CityScreen } from './components/city/CityScreen';
import { ZoneScreen } from './components/zone/ZoneScreen';
import { User, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import type { Monster } from './types/location';

import { NotificationContainer } from './components/Notification';

function App() {
  const { character, fetchCharacter, openProfile } = useCharacterStore();
  const { battleId, initSocket, joinBattle, startPvEBattle } = useBattleStore();
  
  // Initialize app
  useEffect(() => {
    // In a real app, this would come from auth
    const storedId = localStorage.getItem('urba_character_id') || 'char_123';
    // Don't set item here, wait until we have a valid character
    fetchCharacter(storedId);
  }, [fetchCharacter]);

  // Save character ID to local storage when it changes
  useEffect(() => {
    if (character?.id) {
      localStorage.setItem('urba_character_id', character.id);
    }
  }, [character?.id]);

  // Initialize socket when character is loaded
  useEffect(() => {
    if (character?.id) {
      initSocket(character.id);
    }
  }, [character?.id, initSocket]);

  // View routing
  const isInBattle = !!battleId;
  const isZone = character?.location?.city?.startsWith('z');

  const handleNavigateToCombat = (monster?: Monster) => {
     if (character?.id) {
       if (monster) {
         startPvEBattle(character.id, monster.id, monster.level);
       } else {
         joinBattle(character.id);
       }
     }
  };

  if (!character) {
     if (useCharacterStore.getState().error) {
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white gap-4">
             <h2 className="text-xl text-red-500">Ошибка подключения</h2>
             <p className="text-zinc-400">{useCharacterStore.getState().error}</p>
             <button 
               onClick={() => fetchCharacter(localStorage.getItem('urba_character_id') || 'char_123')}
               className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 transition"
             >
               Повторить
             </button>
          </div>
        );
     }
     return <div className="flex items-center justify-center h-screen bg-zinc-950 text-white">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      <NotificationContainer />
      
      <GameLayout>
        {isInBattle ? (
          <BattleScreen />
        ) : isZone ? (
          <ZoneScreen onNavigateToCombat={handleNavigateToCombat} />
        ) : (
          <CityScreen onNavigateToCombat={() => handleNavigateToCombat()} />
        )}
      </GameLayout>

      {/* Overlays */}
      <CharacterProfileModal />
      <ShopModal />
      
    </div>
  );
}

export default App;
