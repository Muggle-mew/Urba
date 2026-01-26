import React, { useEffect } from 'react';
import { useCharacterStore } from './store/useCharacterStore';
import { useBattleStore } from './store/useBattleStore';
import { BattleScreen } from './components/BattleScreen';
import { ShopModal } from './components/shop/ShopModal';
import { CharacterPanel } from './components/CharacterPanel';
import { GameLayout } from './components/layout/GameLayout';
import { CityScreen } from './components/city/CityScreen';
import { ZoneScreen } from './components/zone/ZoneScreen';
import { User, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import type { Monster } from './types/location';

import { NotificationContainer } from './components/Notification';

function App() {
  const { character, fetchCharacter, openProfile } = useCharacterStore();
  const { battleId, initSocket, joinBattle } = useBattleStore();
  
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
       // TODO: Pass monster info to battle logic
       joinBattle(character.id);
     }
  };

  if (!character) {
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
      <CharacterPanel />
      <ShopModal />
      
    </div>
  );
}

export default App;
