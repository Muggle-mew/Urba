import React from 'react';
import clsx from 'clsx';
import { User } from 'lucide-react';

interface CharacterDollProps {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  isRight?: boolean; // If true, mirrors the layout for opponent
  avatarUrl?: string;
}

const Slot = ({ label, className }: { label?: string, className?: string }) => (
  <div className={clsx(
    "w-10 h-10 sm:w-12 sm:h-12 border border-gray-700 bg-black/40 rounded flex items-center justify-center text-[8px] text-gray-500 uppercase tracking-tighter hover:border-gray-500 transition-colors cursor-pointer",
    className
  )}>
    {label}
  </div>
);

export const CharacterDoll: React.FC<CharacterDollProps> = ({ name, level, hp, maxHp, isRight = false, avatarUrl }) => {
  const imageSrc = avatarUrl 
    ? (avatarUrl.startsWith('http') || avatarUrl.startsWith('/') 
        ? avatarUrl 
        : `/assets/maps/${avatarUrl}`)
    : `https://api.dicebear.com/7.x/lorelei/svg?seed=${name}`;

  return (
    <div className="flex flex-col items-center w-full max-w-[300px]">
      {/* Header Info */}
      <div className="w-full mb-2">
        <div className={clsx("flex items-baseline gap-2 mb-1", isRight ? "flex-row-reverse" : "flex-row")}>
          <span className="font-bold text-terra-text text-sm sm:text-base">{name}</span>
          <span className="text-xs text-gray-400">[{level}]</span>
          <User size={14} className="text-gray-500" />
        </div>
        
        {/* HP Bar */}
        <div className="relative w-full h-3 bg-gray-800 rounded-sm overflow-hidden border border-gray-700">
          <div 
            className="absolute top-0 left-0 h-full bg-red-900 transition-all duration-300" 
            style={{ width: `${(hp / maxHp) * 100}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[9px] font-mono z-10 text-white/80 shadow-black drop-shadow-md">
            {hp} / {maxHp}
          </div>
        </div>
      </div>

      {/* Doll & Slots Grid */}
      <div className="relative w-full aspect-[3/4] bg-terra-dark/30 rounded-lg border border-gray-800 p-2 sm:p-4">
        {/* Background Grid Pattern (Optional) */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative h-full flex justify-between">
            {/* Left Column Slots */}
            <div className="flex flex-col justify-between h-full py-2 z-10 gap-1">
                <Slot label="Шлем" />
                <Slot label="Серьги" />
                <Slot label="Амулет" />
                <Slot label="Оружие" />
                <Slot label="Перчатки" />
            </div>

            {/* Avatar Center */}
            <div className="flex-1 flex items-center justify-center relative z-0">
               {/* Silhouette / Avatar Image Placeholder */}
               <div className="h-[80%] w-full max-w-[120px] bg-gradient-to-b from-gray-700 to-transparent opacity-20 rounded-full blur-xl absolute"></div>
               <img 
                 src={imageSrc} 
                 alt="avatar" 
                 className={clsx("h-full object-contain drop-shadow-2xl grayscale hover:grayscale-0 transition-all duration-500", isRight && "scale-x-[-1]")}
               />
            </div>

            {/* Right Column Slots */}
            <div className="flex flex-col justify-between h-full py-2 z-10 gap-1">
                <Slot label="Броня" />
                <Slot label="Пояс" />
                <Slot label="Кольцо" />
                <Slot label="Щит" />
                <Slot label="Обувь" />
            </div>
        </div>
      </div>
    </div>
  );
};
