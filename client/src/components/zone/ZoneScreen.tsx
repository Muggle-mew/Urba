import React, { useEffect, useState } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useZoneStore } from '../../store/useZoneStore';
import type { Monster } from '../../types/location';
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
      <div className="relative z-10 flex-1 flex flex-col p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-red-500 mb-2 uppercase tracking-widest text-xs font-bold bg-black/50 px-3 py-1 rounded w-fit backdrop-blur-sm border border-red-900/30">
            <AlertTriangle size={12} />
            <span>Опасная зона</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">{currentZone.name}</h1>
          <p className="text-xl text-gray-300 max-w-2xl drop-shadow-md">{currentZone.description}</p>
        </div>

        {/* Main Interaction Area */}
        <div className="flex-1 flex items-center justify-center gap-12">
          
          {/* Left: Actions */}
          <div className="flex flex-col gap-6 w-1/3">
             {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={isLoading || !!foundMonster}
              className={clsx(
                "group relative overflow-hidden p-8 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center",
                foundMonster 
                  ? "bg-gray-900/50 border-gray-700 text-gray-500 cursor-not-allowed" 
                  : "bg-black/60 border-yellow-600/50 hover:bg-yellow-900/20 hover:border-yellow-500 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]"
              )}
            >
              <div className={clsx("mb-4 p-4 rounded-full transition-all", foundMonster ? "bg-gray-800" : "bg-yellow-900/50 group-hover:bg-yellow-600 text-yellow-500 group-hover:text-black")}>
                <Search size={48} className={isLoading ? "animate-spin" : ""} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Поиск противника</h3>
              <p className="text-sm opacity-70">Исследовать территорию в поисках угроз</p>
            </button>

            {/* Travel Button */}
            <button 
              onClick={() => setShowTravelModal(true)}
              className="group p-6 rounded-2xl border-2 border-blue-900/50 bg-black/60 hover:bg-blue-900/20 hover:border-blue-500 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-900/30 rounded-full text-blue-400 group-hover:text-blue-200">
                  <Navigation size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg text-blue-100">Покинуть зону</h3>
                  <p className="text-xs text-blue-400/70">Перемещение в соседнюю локацию</p>
                </div>
              </div>
              <ArrowRight className="text-blue-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right: Found Monster Card */}
          <div className="w-1/3 h-[500px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {foundMonster ? (
                <motion.div
                  key="monster"
                  initial={{ opacity: 0, scale: 0.9, x: 50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 50 }}
                  className="w-full bg-gray-900/90 border border-red-900/50 rounded-2xl overflow-hidden shadow-2xl relative"
                >
                  {/* Monster Image */}
                  <div className="h-64 bg-black relative overflow-hidden group">
                     <img 
                      src={`/assets/maps/zones/monsters/${foundMonster.image}`} 
                      alt={foundMonster.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => e.currentTarget.src = '/assets/monsters/default.png'} // Fallback
                    />
                    <div className="absolute top-4 right-4 bg-red-600 text-white font-bold px-3 py-1 rounded text-sm shadow-lg">
                      LVL {foundMonster.level}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h3 className="text-3xl font-bold text-white mb-2">{foundMonster.name}</h3>
                    <div className="flex items-center gap-4 mb-6">
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

      {/* Travel Modal */}
      {showTravelModal && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-8 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Navigation className="text-blue-500" />
              Куда направимся?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentZone.connectedTo.map((targetId) => (
                <button
                  key={targetId}
                  onClick={() => {
                    startTravel(targetId as any);
                    setShowTravelModal(false);
                  }}
                  className="p-6 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 hover:border-blue-500 transition-all text-left group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                      {LOCATION_NAMES[targetId] || targetId}
                    </span>
                    <ArrowRight className="text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-sm text-gray-400">Время пути: 5 мин.</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowTravelModal(false)}
              className="mt-8 w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
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
