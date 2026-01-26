import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharacterStore } from '../store/useCharacterStore';
import { Shield, Zap, Heart, Brain, Swords, Footprints, X } from 'lucide-react';
import clsx from 'clsx';

export const CharacterPanel: React.FC = () => {
  const { character, isOpen, closeProfile, changeAlignment, fetchCharacter, equipItem, unequipItem } = useCharacterStore();
  const [isAlignmentModalOpen, setIsAlignmentModalOpen] = React.useState(false);

  React.useEffect(() => {
    fetchCharacter();
  }, [fetchCharacter]);

  if (!isOpen || !character) return null;

  const equipmentSlots = [
    { id: 'helmet', label: 'Голова', icon: '🧢' },
    { id: 'amulet', label: 'Шея', icon: '📿' },
    { id: 'weapon', label: 'Оружие', icon: '⚔️' },
    { id: 'armor', label: 'Тело', icon: '👕' },
    { id: 'belt', label: 'Пояс', icon: '🥋' },
    { id: 'pants', label: 'Ноги', icon: '👖' },
    { id: 'boots', label: 'Обувь', icon: '👢' },
    { id: 'gloves', label: 'Перчатки', icon: '🧤' },
    { id: 'ring1', label: 'Кольцо', icon: '💍' },
    { id: 'ring2', label: 'Кольцо', icon: '💍' },
  ];

  const handleAlignmentChange = async (side: string) => {
    const success = await changeAlignment(side);
    if (success) {
      setIsAlignmentModalOpen(false);
    } else {
      // Could show an error notification here if needed
      alert('Не удалось изменить наклонность. Возможно, недостаточно фрагментов (требуется 100).');
    }
  };

  const handleEquip = async (itemId: string) => {
    await equipItem(itemId);
  };

  const handleUnequip = async (slotId: string) => {
    await unequipItem(slotId);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="fixed inset-y-0 right-0 w-full md:w-96 bg-zinc-900 border-l border-zinc-800 shadow-2xl z-50 overflow-y-auto"
      >
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-emerald-400 font-mono">ПРОФИЛЬ</h2>
            <button 
              onClick={closeProfile}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-zinc-400" />
            </button>
          </div>

          {/* Header Info */}
          <div className="flex items-center space-x-4 bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {character.name[0]}
            </div>
            <div>
              <div className="text-xl font-bold text-white">{character.name}</div>
              <div className="text-zinc-400 text-sm">{character.level} Уровень • {character.citizenship}</div>
              <div className="text-emerald-400 text-sm mt-1">{character.fragments} Фрагментов Ядра</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-800/50 p-3 rounded border border-zinc-700">
              <div className="flex items-center text-red-400 mb-1">
                <Heart className="w-4 h-4 mr-2" /> <span className="text-sm">Здоровье</span>
              </div>
              <div className="text-xl font-mono">{character.hp.current} / {character.hp.max}</div>
            </div>
            <div className="bg-zinc-800/50 p-3 rounded border border-zinc-700">
              <div className="flex items-center text-yellow-400 mb-1">
                <Zap className="w-4 h-4 mr-2" /> <span className="text-sm">Энергия</span>
              </div>
              <div className="text-xl font-mono">{character.energy.current} / {character.energy.max}</div>
            </div>
          </div>

          {/* Attributes */}
          <div className="space-y-2">
            <h3 className="text-sm text-zinc-500 font-mono uppercase tracking-wider">Характеристики</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Сила', value: character.stats.strength, icon: Swords },
                { label: 'Ловкость', value: character.stats.agility, icon: Footprints },
                { label: 'Интуиция', value: character.stats.intuition, icon: Brain },
                { label: 'Живучесть', value: character.stats.constitution, icon: Shield },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between p-2 bg-zinc-800/30 rounded border border-zinc-800">
                  <div className="flex items-center text-zinc-300">
                    <stat.icon className="w-4 h-4 mr-2 text-zinc-500" />
                    <span className="text-sm">{stat.label}</span>
                  </div>
                  <span className="font-mono text-emerald-300">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <h3 className="text-sm text-zinc-500 font-mono uppercase tracking-wider mb-3">Экипировка</h3>
            <div className="grid grid-cols-4 gap-2">
              {equipmentSlots.map((slot) => {
                const item = character.equipment[slot.id as keyof typeof character.equipment];
                return (
                  <div 
                    key={slot.id} 
                    className={clsx(
                      "aspect-square rounded border flex items-center justify-center relative group cursor-pointer transition-all",
                      item 
                        ? "bg-zinc-800 border-emerald-500/30 hover:border-emerald-500" 
                        : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                    )}
                    title={slot.label}
                  >
                    {item ? (
                      <img src={item.image} alt={item.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <span className="text-2xl opacity-20 grayscale filter">{slot.icon}</span>
                    )}
                    {item && (
                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-center p-1 pointer-events-none transition-opacity">
                        {item.name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alignment */}
          <div className="p-4 bg-zinc-800/30 rounded border border-zinc-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-zinc-400">Наклонность</span>
              <span className="text-sm font-bold text-purple-400 uppercase">{character.alignment.side}</span>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-purple-500 h-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(0, (character.alignment.value + 100) / 2))}%` }}
              />
            </div>
            <button 
              onClick={() => setIsAlignmentModalOpen(true)}
              className="w-full mt-3 py-2 text-xs border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 rounded transition-colors"
            >
              ИЗМЕНИТЬ НАКЛОННОСТЬ
            </button>
          </div>

        </div>

        {/* Alignment Change Modal */}
        {isAlignmentModalOpen && (
          <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-purple-500/50 p-6 rounded-lg w-full max-w-sm">
              <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Смена наклонности
              </h3>
              <p className="text-zinc-300 text-sm mb-6">
                Вы уверены? При смене наклонности вы потеряете весь накопленный прогресс текущей стороны.
                <br/><br/>
                Выберите новую сторону:
              </p>
              
              <div className="grid grid-cols-2 gap-2 mb-6">
                {['synthesis', 'relicts', 'shadow', 'pulse'].map((side) => (
                  <button
                    key={side}
                    onClick={() => handleAlignmentChange(side)}
                    className="p-2 border border-zinc-700 hover:border-purple-500 rounded text-zinc-400 hover:text-purple-400 uppercase text-xs transition-colors"
                  >
                    {side}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setIsAlignmentModalOpen(false)}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
