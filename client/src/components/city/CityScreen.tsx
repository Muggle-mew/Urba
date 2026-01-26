import React, { useState, useEffect } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import type { CityId } from '../../store/useCharacterStore';
import { useShopStore } from '../../store/useShopStore';
import { ShopModal } from '../shop/ShopModal';
import { MapPin, Navigation, Clock, Swords, FlaskConical, ShoppingBag, Beer, HeartPulse, Skull } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

// Prompts for city generation:
// Nova-Hymera: Nova-Hymera cityscape at night: towering buildings overgrown with glowing green bioluminescent moss, pulsating core in the center emitting soft light, wet asphalt reflecting neon signs, broken drones floating in fog, vines crawling up concrete walls, cyberpunk urban realism, cinematic mood, game environment concept, transparent background, 512x512 --v 6.0 --style raw cyberpunk urban realism, game asset, transparent background.
// Rad-City: Rad-City flooded district: rusted skyscrapers half-submerged in green radioactive water, mutated trees growing through collapsed bridges, eerie mist glowing with toxic light, abandoned cars covered in algae, survival horror atmosphere, post-apocalyptic urban decay, game asset, transparent background, 512x512 --v 6.0 --style raw cyberpunk urban realism, game asset, transparent background.
// Echo-Quarter: Echo Quarter: surreal city zone made of glitching holograms and floating data fragments, ghostly translucent figures walking between shattered billboards, ambient blue-purple light, digital static in the air, cyber-noir aesthetic, dreamlike urban labyrinth, game environment concept, transparent background, 512x512 --v 6.0 --style raw cyberpunk urban realism, game asset, transparent background.

const CITIES: Record<CityId, { name: string; description: string; color: string; image: string }> = {
  'nova-chimera': {
    name: 'Нова-Химера',
    description: 'Город-организм. Высокие здания, покрытые светящимся мхом, пульсирующее Ядро в центре.',
    color: 'text-green-500',
    image: '/images/cities/nova-chimera.png'
  },
  'rad-city': {
    name: 'Рад-Сити',
    description: 'Затопленный радиацией постапокалиптический район. Ржавые небоскребы, зеленая дымка.',
    color: 'text-yellow-500',
    image: '/images/cities/rad-city.png'
  },
  'echo-quarter': {
    name: 'Эхо-Квартал',
    description: 'Скрытый цифровой район из глитч-голограмм и потоков данных.',
    color: 'text-blue-500',
    image: '/images/cities/echo-quarter.png'
  }
};

interface CityScreenProps {
  onNavigateToCombat: () => void;
}

export const CityScreen: React.FC<CityScreenProps> = ({ onNavigateToCombat }) => {
  const { profile, startTravel, completeTravel } = useCharacterStore();
  const { openShop } = useShopStore();
  const [showTravelModal, setShowTravelModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  const currentCity = CITIES[profile.location.city];
  const isTraveling = profile.location.isTraveling;

  useEffect(() => {
    if (!isTraveling || !profile.location.travelEndTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const end = profile.location.travelEndTime!;
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
  }, [isTraveling, profile.location.travelEndTime, completeTravel]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-gray-900">
      {/* Travel Overlay */}
      {isTraveling && (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
          <div className="animate-spin text-terra-gold mb-6">
            <Navigation size={64} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Путешествие...</h2>
          <p className="text-gray-400 mb-6 text-xl">
            Направляемся в <span className="text-terra-gold font-bold">{CITIES[profile.location.travelDestination!].name}</span>
          </p>
          <div className="text-6xl font-mono font-bold text-terra-gold">
            {timeLeft}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex h-full">
        
        {/* LEFT: City Interactive Image (3/4 width) */}
        <div className="w-3/4 relative h-full bg-black border-r border-gray-800 overflow-hidden group">
          {/* Background Image */}
          <div className="absolute inset-0">
             <img 
              src={currentCity.image} 
              alt={currentCity.name} 
              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
          </div>

          {/* City Header Overlay */}
          <div className="absolute top-6 left-6 z-10">
            <div className="flex items-center gap-2 text-terra-gold mb-1 uppercase tracking-widest text-xs font-bold bg-black/50 px-2 py-1 rounded w-fit backdrop-blur-sm">
              <MapPin size={12} />
              <span>Текущая локация</span>
            </div>
            <h1 className={clsx("text-4xl font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]", currentCity.color)}>
              {currentCity.name}
            </h1>
          </div>

          {/* Interactive Buildings (Absolute Positioning) */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {/* Shop (Top Left) */}
          <button 
            onClick={() => openShop(profile.location.city)}
            className="absolute top-[35%] left-[12%] pointer-events-auto flex flex-col items-center group/bldg transform transition-transform hover:scale-110"
          >
            <div className="w-16 h-16 bg-yellow-900/80 border-2 border-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.5)] group-hover/bldg:shadow-[0_0_40px_rgba(234,179,8,0.8)] transition-all">
              <ShoppingBag className="text-yellow-200 w-8 h-8" />
            </div>
            <span className="mt-2 text-yellow-200 font-bold text-sm bg-black/70 px-2 py-1 rounded backdrop-blur-md border border-yellow-900/50">Магазин</span>
          </button>

            {/* Arena (Center) */}
            <button 
              onClick={onNavigateToCombat}
              className="absolute top-[40%] left-[50%] -translate-x-1/2 pointer-events-auto flex flex-col items-center group/bldg transform transition-transform hover:scale-110"
            >
              <div className="w-24 h-24 bg-red-900/80 border-2 border-red-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)] group-hover/bldg:shadow-[0_0_60px_rgba(239,68,68,0.8)] transition-all animate-pulse-slow">
                <Swords className="text-red-200 w-12 h-12" />
              </div>
              <span className="mt-2 text-red-200 font-bold text-lg bg-black/70 px-3 py-1 rounded backdrop-blur-md border border-red-900/50">АРЕНА</span>
            </button>

            {/* Bar (Bottom Left) */}
            <button className="absolute bottom-[20%] left-[15%] pointer-events-auto flex flex-col items-center group/bldg transform transition-transform hover:scale-110">
              <div className="w-16 h-16 bg-purple-900/80 border-2 border-purple-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)] group-hover/bldg:shadow-[0_0_40px_rgba(168,85,247,0.8)] transition-all">
                <Beer className="text-purple-200 w-8 h-8" />
              </div>
              <span className="mt-2 text-purple-200 font-bold text-sm bg-black/70 px-2 py-1 rounded backdrop-blur-md border border-purple-900/50">Бар</span>
            </button>

             {/* Surgeon (Top Right) */}
             <button className="absolute top-[35%] right-[12%] pointer-events-auto flex flex-col items-center group/bldg transform transition-transform hover:scale-110">
              <div className="w-14 h-14 bg-green-900/80 border-2 border-green-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)] group-hover/bldg:shadow-[0_0_40px_rgba(34,197,94,0.8)] transition-all">
                <HeartPulse className="text-green-200 w-7 h-7" />
              </div>
              <span className="mt-2 text-green-200 font-bold text-sm bg-black/70 px-2 py-1 rounded backdrop-blur-md border border-green-900/50">Хирург</span>
            </button>

            {/* Sewers (Bottom Right) */}
            <button 
              onClick={() => alert('PvE и Квесты в разработке!')}
              className="absolute bottom-[20%] right-[15%] pointer-events-auto flex flex-col items-center group/bldg transform transition-transform hover:scale-110"
            >
              <div className="w-16 h-16 bg-zinc-800/80 border-2 border-zinc-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(113,113,122,0.5)] group-hover/bldg:shadow-[0_0_40px_rgba(113,113,122,0.8)] transition-all">
                <Skull className="text-zinc-200 w-8 h-8" />
              </div>
              <span className="mt-2 text-zinc-200 font-bold text-sm bg-black/70 px-2 py-1 rounded backdrop-blur-md border border-zinc-900/50">Стоки</span>
            </button>
          </div>

          {/* Modals */}
          <ShopModal />
        </div>

        {/* RIGHT: Action Buttons (1/4 width) */}
        <div className="w-1/4 bg-gray-900 flex flex-col gap-4 p-4 border-l border-gray-800 shadow-2xl z-20">
          
          {/* 1. To Battle */}
          <button 
            onClick={onNavigateToCombat}
            className="flex-1 bg-gradient-to-br from-red-900 to-red-950 border-2 border-red-700 rounded-xl flex flex-col items-center justify-center gap-4 group hover:border-red-500 hover:from-red-800 hover:to-red-900 transition-all shadow-lg hover:shadow-red-900/20"
          >
            <Swords className="w-16 h-16 text-red-500 group-hover:text-red-300 transition-colors group-hover:scale-110 duration-300" />
            <span className="text-2xl font-bold text-red-100 uppercase tracking-wider group-hover:text-white">В БОЙ</span>
          </button>

          {/* 2. Travel */}
          <button 
             onClick={() => setShowTravelModal(true)}
             className="flex-1 bg-gradient-to-br from-blue-900 to-blue-950 border-2 border-blue-700 rounded-xl flex flex-col items-center justify-center gap-4 group hover:border-blue-500 hover:from-blue-800 hover:to-blue-900 transition-all shadow-lg hover:shadow-blue-900/20"
          >
            <Navigation className="w-16 h-16 text-blue-500 group-hover:text-blue-300 transition-colors group-hover:scale-110 duration-300" />
            <span className="text-2xl font-bold text-blue-100 uppercase tracking-wider group-hover:text-white">Перемещение</span>
          </button>

          {/* 3. Laboratory */}
          <button 
             className="flex-1 bg-gradient-to-br from-green-900 to-green-950 border-2 border-green-700 rounded-xl flex flex-col items-center justify-center gap-4 group hover:border-green-500 hover:from-green-800 hover:to-green-900 transition-all shadow-lg hover:shadow-green-900/20"
          >
            <FlaskConical className="w-16 h-16 text-green-500 group-hover:text-green-300 transition-colors group-hover:scale-110 duration-300" />
            <span className="text-2xl font-bold text-green-100 uppercase tracking-wider group-hover:text-white">Лаборатория</span>
          </button>

        </div>
      </div>

      {/* Travel Modal */}
      <AnimatePresence>
        {showTravelModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowTravelModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-6xl bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowTravelModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
              >
                ✕
              </button>
              
              <h2 className="text-3xl font-bold mb-8 text-center text-terra-gold uppercase tracking-widest">Выберите пункт назначения</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(Object.keys(CITIES) as CityId[]).map(cityId => {
                  const city = CITIES[cityId];
                  const isCurrent = cityId === profile.location.city;
                  
                  return (
                    <button
                      key={cityId}
                      disabled={isCurrent}
                      onClick={() => {
                        startTravel(cityId);
                        setShowTravelModal(false);
                      }}
                      className={clsx(
                        "relative group overflow-hidden rounded-xl border-2 transition-all h-64 flex flex-col justify-end text-left p-6",
                        isCurrent 
                          ? "border-gray-700 opacity-50 cursor-default" 
                          : "border-gray-600 hover:border-white cursor-pointer hover:shadow-xl hover:scale-[1.02]"
                      )}
                    >
                      {/* Background Image */}
                      <div className="absolute inset-0 z-0">
                        <img src={city.image} alt={city.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className={clsx("absolute inset-0 bg-gradient-to-t", isCurrent ? "from-black via-black/50" : "from-black via-transparent")} />
                      </div>

                      <div className="relative z-10">
                        <div className={clsx("text-2xl font-bold mb-1", city.color)}>{city.name}</div>
                        {isCurrent ? (
                          <div className="text-gray-400 text-sm font-medium flex items-center gap-2">
                             <MapPin size={14} /> Вы здесь
                          </div>
                        ) : (
                          <div className="text-gray-300 text-sm font-medium flex items-center gap-2">
                            <Clock size={14} className="text-terra-gold" /> 5 минут
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
