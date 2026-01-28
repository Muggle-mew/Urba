import React, { useState } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import type { Item } from '../../store/useCharacterStore';
import { X } from 'lucide-react';
import clsx from 'clsx';

const StatRow: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="flex justify-between items-center text-xs py-0.5 hover:bg-white/5 px-1 rounded transition-colors cursor-help">
    <span className="text-gray-400">{label}:</span>
    <span className="font-bold text-terra-gold font-mono">{value}</span>
  </div>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 border-b border-gray-800 pb-1 mt-4 first:mt-0">
    {title}
  </h3>
);

const ItemTooltip: React.FC<{ item: Item; position: { x: number; y: number } }> = ({ item, position }) => (
  <div 
    className="fixed z-[60] bg-black/95 border border-terra-gold p-3 rounded shadow-2xl pointer-events-none min-w-[200px]"
    style={{ top: position.y + 10, left: position.x + 10 }}
  >
    <div className={clsx("font-bold mb-1", {
      'text-gray-300': item.rarity === 'common',
      'text-blue-400': item.rarity === 'rare',
      'text-purple-400': item.rarity === 'epic',
      'text-orange-400': item.rarity === 'legendary',
      'text-red-500': item.rarity === 'artifact',
    })}>
      {item.name}
    </div>
    <div className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">{item.type}</div>
    {item.stats && (
      <div className="space-y-1 mb-2">
        {Object.entries(item.stats).map(([key, val]) => (
          <div key={key} className="flex justify-between text-xs text-gray-300">
            <span>{key}</span>
            <span className="font-mono text-green-400">+{val}</span>
          </div>
        ))}
      </div>
    )}
    {item.description && (
      <div className="text-xs text-gray-400 italic border-t border-gray-800 pt-2 mt-2">
        {item.description}
      </div>
    )}
  </div>
);

const EquipmentSlot: React.FC<{ 
  item?: Item; 
  placeholder?: string;
  className?: string;
}> = ({ item, placeholder, className }) => {
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  return (
    <>
      <div 
        className={clsx(
          "w-10 h-10 sm:w-12 sm:h-12 border rounded bg-black/40 flex items-center justify-center relative group transition-all duration-200",
          item ? "border-terra-gold/50 hover:border-terra-gold bg-terra-gold/5" : "border-gray-800 hover:border-gray-600",
          className
        )}
        onMouseMove={(e) => item && setHoverPos({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setHoverPos(null)}
      >
        {item ? (
          <img 
            src={`https://placehold.co/48x48/1a1a1a/gold?text=${item.name[0]}`} 
            alt={item.name}
            className="w-full h-full object-cover p-1"
          />
        ) : (
          <span className="text-[9px] text-gray-700 uppercase font-bold text-center leading-none">{placeholder}</span>
        )}
      </div>
      {hoverPos && item && <ItemTooltip item={item} position={hoverPos} />}
    </>
  );
};

export const CharacterProfileModal: React.FC = () => {
  const { character, isOpen, closeProfile } = useCharacterStore();

  if (!isOpen || !character) return null;

  // Safe access helpers
  const stats = character.stats || { strength: 0, agility: 0, intuition: 0, will: 0, constitution: 0 };
  const hp = character.hp || { current: 0, max: 100 };
  const energy = character.energy || { current: 0, max: 100 };
  const alignment = character.alignment || { side: 'neutral' };
  const equipment = character.equipment || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={closeProfile}>
      <div 
        className="bg-terra-dark border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-gray-800 bg-black/20 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-terra-text font-bold text-lg">
              {alignment.side === 'synthesis' && <span className="text-green-500">☣</span>}
              {alignment.side === 'relicts' && <span className="text-yellow-500">🏺</span>}
              {alignment.side === 'shadow' && <span className="text-gray-500">👤</span>}
              {alignment.side === 'pulse' && <span className="text-red-500">⚡</span>}
              {alignment.side === 'outcast' && <span className="text-orange-500">🚫</span>}
              <span>{character.name}</span>
              <span className="text-gray-500 text-sm font-normal">[{character.level}]</span>
            </div>
            
            {/* Tabs - Removed, only Stats now */}
            <div className="flex gap-2 ml-4">
               <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-terra-gold text-black border border-terra-gold rounded">
                 Характеристики
               </span>
            </div>
          </div>
          <button onClick={closeProfile} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Stats (3 cols) */}
            <div className="md:col-span-3 space-y-6">
              <div>
                <SectionHeader title="Параметры" />
                <div className="space-y-1">
                  <StatRow label="Сила" value={stats.strength} />
                  <StatRow label="Ловкость" value={stats.agility} />
                  <StatRow label="Интуиция" value={stats.intuition} />
                  <StatRow label="Воля" value={stats.will} />
                  <StatRow label="Конституция" value={stats.constitution} />
                </div>
              </div>
            </div>

            {/* Center Column: Doll (6 cols) */}
            <div className="md:col-span-6 flex flex-col items-center">
              {/* HP/Energy Bars */}
              <div className="w-full max-w-xs mb-4 space-y-1">
                <div className="relative h-4 bg-gray-900 rounded border border-gray-700 overflow-hidden group cursor-help">
                  <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-900 to-red-700 transition-all duration-500" style={{ width: `${(hp.current / hp.max) * 100}%` }} />
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white/90 drop-shadow-md">
                    {hp.current} / {hp.max}
                  </div>
                </div>
                <div className="relative h-2 bg-gray-900 rounded border border-gray-700 overflow-hidden" title="Энергия">
                  <div className="absolute top-0 left-0 h-full bg-yellow-500/80 transition-all duration-500" style={{ width: `${(energy.current / energy.max) * 100}%` }} />
                </div>
              </div>

              {/* Doll Grid Layout */}
              <div className="relative w-full max-w-[400px] aspect-[4/5] bg-gradient-to-b from-gray-900/50 to-transparent rounded-2xl border border-gray-800/50 p-4">
                {/* Background decorative elements */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <div className="w-64 h-64 border-2 border-terra-gold rounded-full" />
                  <div className="absolute w-48 h-48 border border-terra-gold rounded-full rotate-45" />
                </div>

                <div className="flex h-full gap-2 relative z-10">
                  {/* Left Slots */}
                  <div className="flex flex-col justify-between py-4 w-12 sm:w-16 items-center">
                    <EquipmentSlot item={equipment.helmet} placeholder="Шлем" />
                    <EquipmentSlot item={equipment.earrings} placeholder="Серьги" />
                    <EquipmentSlot item={equipment.amulet} placeholder="Амулет" />
                    <EquipmentSlot item={equipment.weapon} placeholder="Оружие" />
                    <EquipmentSlot item={equipment.ring1} placeholder="Кольцо" />
                    <EquipmentSlot item={equipment.pants} placeholder="Штаны" />
                  </div>

                  {/* Avatar Center */}
                  <div className="flex-1 flex items-center justify-center">
                    <img 
                      src="https://api.dicebear.com/7.x/lorelei/svg?seed=Felix" 
                      alt="Character" 
                      className="max-h-full max-w-full object-contain drop-shadow-2xl filter contrast-110"
                    />
                  </div>

                  {/* Right Slots */}
                  <div className="flex flex-col justify-between py-4 w-12 sm:w-16 items-center">
                      <EquipmentSlot item={equipment.shoulders} placeholder="Плечи" />
                      <EquipmentSlot item={equipment.bracers} placeholder="Наручи" />
                      <EquipmentSlot item={equipment.gloves} placeholder="Перчатки" />
                      <EquipmentSlot item={equipment.offhand} placeholder="Щит" />
                      <EquipmentSlot item={equipment.ring2} placeholder="Кольцо" />
                      <EquipmentSlot item={equipment.boots} placeholder="Сапоги" />
                  </div>
                </div>
              </div>
            </div>

              {/* Right Column: Combat Stats (3 cols) */}
              <div className="md:col-span-3 space-y-6">
              <div>
                <SectionHeader title="Боевые" />
                <div className="space-y-1">
                  <StatRow label="Урон" value={stats.strength * 2} />
                  <StatRow label="Защита" value={stats.constitution * 1.5} />
                  <StatRow label="Крит" value={stats.intuition * 0.5} />
                  <StatRow label="Уворот" value={stats.agility * 0.5} />
                  <StatRow label="Скорость" value={100 + stats.agility} />
                </div>
              </div>
              
              <div className="bg-white/5 p-3 rounded border border-gray-800 mt-4">
                  <div className="text-[10px] uppercase text-gray-500 mb-2 tracking-wider">Информация</div>
                  <div className="space-y-2 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Создан:</span>
                      <span className="text-gray-200">2026-01-27</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Боев:</span>
                      <span className="text-gray-200">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Побед:</span>
                      <span className="text-terra-gold">0</span>
                    </div>
                  </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
