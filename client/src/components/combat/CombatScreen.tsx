import React from 'react';
import { motion } from 'framer-motion';
import { Sword, Shield } from 'lucide-react';
import { useBattleStore } from '../../store/useBattleStore';
import { CombatMannequin } from './CombatMannequin';
import { CharacterDoll } from './CharacterDoll';
import clsx from 'clsx';

export const CombatScreen: React.FC = () => {
  const { 
    player, opponent, timeLeft, 
    selectedAttack, selectedBlocks, 
    setAttack, toggleBlock, commitTurn, isReady 
  } = useBattleStore();

  return (
    <div className="min-h-full bg-terra-black text-terra-text p-2 sm:p-4 flex flex-col items-center">
      
      {/* Top Status Bar (Mobile-friendly) */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-4 bg-terra-dark p-2 px-4 rounded border border-gray-800">
         <div className="text-xs text-gray-500">Дуэль #12345</div>
         <div className="text-xs text-gray-400">Round 1</div>
      </div>

      {/* Main Grid Layout (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full max-w-6xl flex-1">
        
        {/* Left Column: Player Doll */}
        <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
          {player && (
            <CharacterDoll 
              name={player.name} 
              level={player.level} 
              hp={player.hp} 
              maxHp={player.maxHp} 
            />
          )}
        </div>

        {/* Center Column: Controls & Log */}
        <div className="order-1 lg:order-2 flex flex-col items-center">
          
          {/* Info Panel */}
          <div className="w-full bg-gray-200 text-gray-800 p-2 rounded mb-4 text-center text-xs font-mono shadow-inner">
             <div>Нанесенный урон: 0</div>
             <div>Прогнозируемый опыт: 0</div>
          </div>

          {/* Mannequins & Timer Area */}
          <div className="flex justify-center items-center gap-4 sm:gap-8 mb-6 w-full">
            
            {/* Defense Mannequin */}
            <div className="flex flex-col items-center">
              <CombatMannequin 
                type="defense" 
                selectedParts={selectedBlocks} 
                onToggle={toggleBlock} 
              />
              <span className="text-[10px] text-gray-500 mt-1 uppercase">2 блока</span>
            </div>

            {/* Center Controls */}
            <div className="flex flex-col items-center gap-3 min-w-[120px]">
               <div className="text-center">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Таймаут</div>
                  <div className={clsx("text-2xl font-mono font-bold", timeLeft < 10 ? "text-red-500" : "text-terra-gold")}>
                    0:{timeLeft.toString().padStart(2, '0')}
                  </div>
               </div>

               <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={commitTurn}
                  disabled={!selectedAttack || selectedBlocks.length !== 2 || isReady}
                  className={clsx(
                    "px-6 py-2 rounded font-bold text-sm uppercase tracking-widest shadow-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all",
                    isReady
                      ? "bg-gray-600 border-gray-800 text-gray-400 cursor-not-allowed"
                      : (!selectedAttack || selectedBlocks.length !== 2)
                        ? "bg-gray-700 border-gray-900 text-gray-500 cursor-not-allowed"
                        : "bg-terra-accent border-red-900 text-white hover:bg-red-600"
                  )}
               >
                 {isReady ? 'Ждем...' : 'АТАКА!'}
               </motion.button>

               <div className="text-[10px] text-gray-500 text-center font-bold">
                  {isReady ? "Ждем противника" : "Ваш ход!"}
               </div>
            </div>

            {/* Attack Mannequin */}
            <div className="flex flex-col items-center">
              <CombatMannequin 
                type="attack" 
                selectedParts={selectedAttack ? [selectedAttack] : []} 
                onToggle={setAttack} 
              />
              <span className="text-[10px] text-gray-500 mt-1 uppercase">1 удар</span>
            </div>

          </div>

          {/* Combat Log */}
          <div className="w-full flex-1 bg-white border border-gray-300 min-h-[200px] max-h-[300px] overflow-y-auto p-2 text-xs font-sans text-gray-800 shadow-inner rounded-sm">
             <div className="font-bold text-gray-500 mb-2 border-b border-gray-200 pb-1">История боя</div>
             
             {/* Example Log Entries */}
             <div className="mb-2">
                <span className="text-gray-400 mr-1">[12:39]</span>
                <span className="font-bold text-blue-800">Hero</span> коварно сделал <span className="text-green-700 font-bold">блок ушами</span>, и <span className="font-bold text-red-800">Rat Mutant</span> со звоном стукнул в него.
             </div>
             <div className="mb-2">
                <span className="text-gray-400 mr-1">[12:39]</span>
                <span className="font-bold text-blue-800">Hero</span> пытался нанести удар левой ногой <span className="font-bold text-blue-600">ниже пояса</span> противника, но <span className="font-bold text-red-800">Rat Mutant</span> вовремя распознал гнусные намерения и <span className="font-bold text-blue-600">ушел от удара</span>.
             </div>
          </div>

        </div>

        {/* Right Column: Opponent Doll */}
        <div className="order-3 flex justify-center lg:justify-end">
          {opponent && (
            <CharacterDoll 
              name={opponent.name} 
              level={opponent.level} 
              hp={opponent.hp} 
              maxHp={opponent.maxHp}
              isRight
            />
          )}
        </div>

      </div>

      {/* Bottom Teams Panel (Static Placeholder) */}
      <div className="w-full max-w-6xl mt-4 grid grid-cols-2 gap-4 text-xs font-mono text-gray-400 border-t border-gray-800 pt-4">
          <div>
            <div className="font-bold text-terra-text mb-1">Команда 1</div>
            <div className="flex items-center gap-1"><Sword size={10} className="text-red-500"/> {player?.name} [{player?.hp}/{player?.maxHp}]</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-terra-text mb-1">Команда 2</div>
            <div className="flex items-center justify-end gap-1">{opponent?.name} [{opponent?.hp}/{opponent?.maxHp}] <Shield size={10} className="text-blue-500"/></div>
          </div>
      </div>

    </div>
  );
};
