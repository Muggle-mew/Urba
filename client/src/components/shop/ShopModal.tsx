import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Shield, Swords, Coins, AlertCircle } from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import type { ShopItem } from '../../store/useShopStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import type { CityId } from '../../store/useCharacterStore';
import clsx from 'clsx';

const VENDOR_CONFIG: Record<CityId, { name: string; image: string; greeting: string }> = {
  'verdis': {
    name: 'Био-Торговец',
    image: '/assets/vendors/bio-merchant.png',
    greeting: 'Привет, путник. Сегодня в наличии — только лучшее. Выбирай быстро: завтра всё исчезнет.'
  },
  'ash': {
    name: 'Сталкер',
    image: '/assets/vendors/stalker-merchant.png',
    greeting: 'Не фони. Есть пара чистых стволов и комбезов. Платишь фрагментами, лишних вопросов не задаешь.'
  },
  'nima': {
    name: 'Цифровой Агент',
    image: '/assets/vendors/holo-agent.png',
    greeting: 'Транзакция инициирована. Доступ к закрытому каталогу протоколов защиты и устранения предоставлен.'
  }
};

export const ShopModal: React.FC = () => {
  const { isOpen, closeShop, activeCity, dailyItems, isLoading, buyItem } = useShopStore();
  const { character } = useCharacterStore();
  const [showCatalog, setShowCatalog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);

  // Reset view when closed
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setShowCatalog(false);
        setSelectedItem(null);
      }, 300); // Wait for animation to finish
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !activeCity || !character) return null;

  const vendor = VENDOR_CONFIG[activeCity];
  const userFragments = character.fragments || 0;

  const handleBuy = async (item: ShopItem) => {
    if (userFragments < item.price || character.level < item.levelReq) return;
    
    const success = await buyItem(character.id, item.id);
    if (success) {
      console.log(`Bought ${item.name}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 bg-black/95 flex overflow-hidden"
        >
          {/* Close Button */}
          <button 
            onClick={closeShop}
            className="absolute top-4 right-4 z-50 text-gray-400 hover:text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-all border border-gray-700"
          >
            <X size={24} />
          </button>

          {!showCatalog ? (
            // WELCOME SCREEN
            <div className="w-full h-full relative flex items-center justify-center">
              {/* Background Vendor Image */}
              <div className="absolute inset-0 z-0">
                 <img src={vendor.image} className="w-full h-full object-cover opacity-60" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
                 <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 text-center max-w-2xl p-8 bg-black/70 backdrop-blur-md rounded-2xl border border-gray-700 shadow-2xl"
              >
                <h2 className="text-5xl font-bold text-terra-gold mb-6 drop-shadow-lg">{vendor.name}</h2>
                <div className="w-24 h-1 bg-terra-gold mx-auto mb-6 rounded-full" />
                <p className="text-xl text-gray-300 italic mb-8 leading-relaxed">"{vendor.greeting}"</p>
                <button 
                  onClick={() => setShowCatalog(true)}
                  className="px-10 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold text-xl rounded-xl hover:from-yellow-500 hover:to-yellow-400 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)]"
                >
                  ПОКАЗАТЬ ТОВАРЫ
                </button>
              </motion.div>
            </div>
          ) : (
            // CATALOG SCREEN (Split View)
            <div className="w-full h-full flex">
              {/* LEFT: Vendor (50%) */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-1/2 relative border-r border-gray-800 hidden md:block"
              >
                <img src={vendor.image} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-gray-900/90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                
                <div className="absolute bottom-12 left-12 max-w-lg">
                   <h3 className="text-4xl font-bold text-terra-gold mb-4 drop-shadow-md">{vendor.name}</h3>
                   <div className="p-6 bg-black/60 backdrop-blur-sm rounded-xl border-l-4 border-terra-gold">
                     <p className="text-gray-200 italic text-lg leading-relaxed">"{vendor.greeting}"</p>
                   </div>
                </div>
              </motion.div>

              {/* RIGHT: Items Grid (50%) */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full md:w-1/2 bg-gray-900/95 flex flex-col h-full relative"
              >
                 {/* Header */}
                 <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-black/40 backdrop-blur-md z-20 shadow-lg">
                   <div>
                     <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Ассортимент</h2>
                     <p className="text-gray-400 text-sm">Обновление через: 12:45:00</p>
                   </div>
                   <div className="flex items-center gap-3 bg-gray-800/80 px-4 py-2 rounded-lg border border-gray-700 shadow-inner">
                     <Coins size={24} className="text-yellow-400" />
                     <span className="font-mono font-bold text-xl text-yellow-100">{userFragments}</span>
                   </div>
                 </div>
                 
                 {/* Items Grid */}
                 <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[url('/assets/grid-pattern.png')]">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {dailyItems.map((item, index) => {
                          const canAfford = userFragments >= item.price;
                          const levelMet = character.level >= item.levelReq;
                          const isLocked = !canAfford || !levelMet;

                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={clsx(
                                "group relative bg-gray-800/60 border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col",
                                isLocked ? "border-gray-700 opacity-70" : "border-gray-600 hover:border-yellow-500/50 hover:bg-gray-800"
                              )}
                            >
                              {/* Item Image Area */}
                              <div className="relative h-40 bg-gradient-to-b from-gray-900 to-gray-800 p-4 flex items-center justify-center">
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500"
                                />
                                
                                <div className="absolute top-2 left-2 flex gap-1">
                                  {item.type === 'weapon' ? <Swords size={16} className="text-gray-400" /> : <Shield size={16} className="text-gray-400" />}
                                </div>

                                {!levelMet && (
                                  <div className="absolute top-2 right-2 bg-red-900/80 text-red-200 text-xs font-bold px-2 py-1 rounded border border-red-700">
                                    LVL {item.levelReq}
                                  </div>
                                )}
                              </div>

                              {/* Info Area */}
                              <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-white mb-1 truncate">{item.name}</h3>
                                
                                <div className="text-xs text-gray-400 mb-3 space-y-1">
                                  {item.type === 'weapon' ? (
                                    <div className="flex justify-between">
                                      <span>Урон: <span className="text-red-300">{item.damage}</span></span>
                                      <span className="capitalize text-blue-300">{item.damageType}</span>
                                    </div>
                                  ) : (
                                    <div className="flex justify-between">
                                      <span>Защита: <span className="text-blue-300">{item.defense}</span></span>
                                      <span>Вес: {item.weight}</span>
                                    </div>
                                  )}
                                  {item.bonusStats && <div className="text-green-400 truncate">{item.bonusStats}</div>}
                                </div>

                                <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-700/50">
                                  <div className={clsx("flex items-center gap-1 font-bold", canAfford ? "text-yellow-400" : "text-red-400")}>
                                    <Coins size={16} />
                                    <span>{item.price}</span>
                                  </div>
                                  
                                  <button
                                    onClick={() => handleBuy(item)}
                                    disabled={isLocked}
                                    className={clsx(
                                      "px-4 py-1.5 rounded text-sm font-bold transition-all",
                                      isLocked 
                                        ? "bg-gray-700 text-gray-500 cursor-not-allowed" 
                                        : "bg-yellow-600 hover:bg-yellow-500 text-black shadow-lg hover:shadow-yellow-500/20"
                                    )}
                                  >
                                    Купить
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                 </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
