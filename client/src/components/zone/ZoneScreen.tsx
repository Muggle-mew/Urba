import React, { useEffect, useState } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useZoneStore } from '../../store/useZoneStore';
import type { Monster } from '../../types/location';
import { WorldMapModal } from '../map/WorldMapModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Search, Navigation, AlertTriangle, Skull, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

// Map zone IDs to readable names for navigation
const LOCATION_NAMES: Record<string, string> = {
  'nova-chimera': 'Нова-Химера',
  'rad-city': 'Рад-Сити',
  'echo-quarter': 'Эхо-Квартал',
  'z1': 'Заброшенная ТЭЦ',
  'z2': 'Мутантский лес',
  'z3': 'Радиоактивный каньон',
  'z4': 'Цифровые руины',
  'z5': 'Подземелье данных',
  'z6': 'Пустошь шепотов'
};

interface ZoneScreenProps {
  onNavigateToCombat: (monster: Monster) => void;
}

export const ZoneScreen: React.FC<ZoneScreenProps> = ({ onNavigateToCombat }) => {
  const { character, startTravel, completeTravel } = useCharacterStore();
  const { currentZone, foundMonster, isLoading, error, enterZone, searchMonster, leaveZone } = useZoneStore();
  
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [showTravelModal, setShowTravelModal] = useState(false);

  // Initialize zone
  useEffect(() => {
    if (character?.location.city && character.location.city.startsWith('z')) {
      enterZone(character.location.city);
    }
    return () => leaveZone();
  }, [character?.location.city]);

  // Handle travel timer
  useEffect(() => {
    if (!character?.location.isTraveling || !character.location.travelEndTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const end = character.location.travelEndTime!;
      const diff = end - now;

      if (diff <= 0) {
        completeTravel();
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [character?.location.isTraveling, character?.location.travelEndTime, completeTravel]);


  const handleSearch = () => {
    if (character) {
      searchMonster(character.level);
    }
  };

  const handleStartBattle = () => {
    if (foundMonster) {
      onNavigateToCombat(foundMonster);
    }
  };

  if (!character || !currentZone) return <div className="p-8 text-center text-gray-500">Загрузка локации...</div>;

  const isTraveling = character.location.isTraveling;

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-gray-950">
       {/* Travel Overlay */}
       {isTraveling && (
        <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center">
          <div className="animate-spin text-terra-gold mb-6">
            <Navigation size={64} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Путешествие...</h2>
          <p className="text-gray-400 mb-6 text-xl">
            Направляемся в <span className="text-terra-gold font-bold">{LOCATION_NAMES[character.location.travelDestination || ''] || 'Неизвестность'}</span>
          </p>
          <div className="text-6xl font-mono font-bold text-terra-gold">
            {timeLeft}
          </div>
        </div>
      )}

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={currentZone.imagePath} 
          alt={currentZone.name}
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="min-h-full flex flex-col">
            {/* Header */}
            <div className="mb-8 shrink-0">
              <div className="flex items-center gap-2 text-red-500 mb-2 uppercase tracking-widest text-xs font-bold bg-black/50 px-3 py-1 rounded w-fit backdrop-blur-sm border border-red-900/30">
                <AlertTriangle size={12} />
                <span>Опасная зона</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">{currentZone.name}</h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl drop-shadow-md">{currentZone.description}</p>
            </div>

            {/* Main Interaction Area */}
            <div className="flex-grow flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 pb-48">
              
              {/* Left: Actions */}
              <div className="flex flex-col gap-4 lg:gap-6 w-full lg:w-1/3 shrink-0">
                 {/* Search Button */}
                <button
                  onClick={handleSearch}
                  disabled={isLoading || !!foundMonster}
                  className={clsx(
                    "group relative overflow-hidden p-6 lg:p-8 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center",
                    foundMonster 
                      ? "bg-gray-900/50 border-gray-700 text-gray-500 cursor-not-allowed" 
                      : "bg-black/60 border-yellow-600/50 hover:bg-yellow-900/20 hover:border-yellow-500 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]"
                  )}
                >
                  <div className={clsx("mb-4 p-4 rounded-full transition-all shrink-0", foundMonster ? "bg-gray-800" : "bg-yellow-900/50 group-hover:bg-yellow-600 text-yellow-500 group-hover:text-black")}>
                    <Search className={clsx("w-8 h-8 lg:w-12 lg:h-12", isLoading ? "animate-spin" : "")} />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold mb-2">Поиск противника</h3>
                  <p className="text-sm opacity-70">Исследовать территорию</p>
                </button>

                {/* Travel Button */}
                <button 
                  onClick={() => setShowTravelModal(true)}
                  className="group p-4 lg:p-6 rounded-2xl border-2 border-blue-900/50 bg-black/60 hover:bg-blue-900/20 hover:border-blue-500 transition-all flex items-center justify-between shrink-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-900/30 rounded-full text-blue-400 group-hover:text-blue-200">
                      <Navigation className="w-6 h-6 lg:w-8 lg:h-8" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg text-blue-100">Покинуть зону</h3>
                      <p className="text-xs text-blue-400/70 hidden lg:block">Перемещение в соседнюю локацию</p>
                    </div>
                  </div>
                  <ArrowRight className="text-blue-500 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Right: Found Monster Card */}
              <div className="w-full lg:w-1/3 h-auto min-h-[300px] max-h-[600px] aspect-[3/4] shrink-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {foundMonster ? (
                <motion.div
                  key="monster"
                  initial={{ opacity: 0, scale: 0.9, x: 50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 50 }}
                  className="w-full h-full max-h-[500px] bg-gray-900/90 border border-red-900/50 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col"
                >
                  {/* Monster Image */}
                  <div className="flex-1 bg-black relative overflow-hidden group min-h-0">
                     <img 
                      src={foundMonster.image.includes('/') ? `/assets/maps/${foundMonster.image}` : `/assets/maps/zones/monsters/${foundMonster.image}`} 
                      alt={foundMonster.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => e.currentTarget.src = '/assets/monsters/default.png'} // Fallback
                    />
                    <div className="absolute top-4 right-4 bg-red-600 text-white font-bold px-3 py-1 rounded text-sm shadow-lg">
                      LVL {foundMonster.level}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 lg:p-6 shrink-0">
                    <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 truncate">{foundMonster.name}</h3>
                    <div className="flex items-center gap-4 mb-4 lg:mb-6">
                      <div className="flex items-center gap-2 text-green-400 bg-green-900/20 px-3 py-1 rounded-full">
                        <HeartPulse size={16} />
                        <span className="font-bold">{foundMonster.hp} HP</span>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-400 bg-yellow-900/20 px-3 py-1 rounded-full">
                        <Skull size={16} />
                        <span className="font-bold">Опасность</span>
                      </div>
                    </div>

                    <button
                      onClick={handleStartBattle}
                      className="w-full py-4 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold text-xl rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all flex items-center justify-center gap-3"
                    >
                      <Swords size={24} />
                      <span>ВСТУПИТЬ В БОЙ</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-gray-600 flex flex-col items-center"
                >
                  <Search size={64} className="mb-4 opacity-20" />
                  <p className="text-xl">Здесь пока тихо...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
          </div>
        </div>
      </div>

      {/* Travel Modal */}
      <WorldMapModal 
        isOpen={showTravelModal} 
        onClose={() => setShowTravelModal(false)} 
        restrictTravel={true}
      />
    </div>
  );
};

// Icon component helper
const HeartPulse = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
  </svg>
);
