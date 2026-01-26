import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattleStore } from '../store/useBattleStore';
import type { BodyPart } from '../store/useBattleStore';
import { useCharacterStore } from '../store/useCharacterStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { Sword, Shield, Timer, Skull, Trophy } from 'lucide-react';
import clsx from 'clsx';

const BODY_PARTS: { id: BodyPart; label: string }[] = [
  { id: 'head', label: 'Голова' },
  { id: 'chest', label: 'Грудь' },
  { id: 'stomach', label: 'Живот' },
  { id: 'legs', label: 'Ноги' },
];

export const BattleScreen: React.FC = () => {
  const { 
    player, opponent, round, logs, timeLeft, status, winnerId,
    selectedAttack, selectedBlocks, 
    setAttack, toggleBlock, isReady, setBattleState, sendMove
  } = useBattleStore();
  const { character, fetchCharacter } = useCharacterStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (status === 'finished') {
      if (winnerId === player?.id) {
        addNotification({ type: 'success', message: 'Победа! Получен опыт и фрагменты.', duration: 5000 });
        if (character?.id) fetchCharacter(character.id);
      } else {
        addNotification({ type: 'error', message: 'Поражение. Вы потеряли сознание.', duration: 5000 });
      }
    }
  }, [status, winnerId, player?.id, addNotification, character?.id, fetchCharacter]);

  const handleCommit = () => {
    if (selectedAttack && selectedBlocks.length === 2 && character?.id) {
      sendMove(character.id, selectedAttack, selectedBlocks as [BodyPart, BodyPart]);
    }
  };

  // Auto-scroll logs
  const logsEndRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (status === 'finished') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen bg-black text-white p-8">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          {winnerId === player?.id ? (
            <>
              <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-yellow-500 mb-2">ПОБЕДА!</h2>
              <p className="text-zinc-400">Вы получили опыт и фрагменты.</p>
            </>
          ) : (
            <>
              <Skull className="w-24 h-24 text-red-500 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-red-500 mb-2">ПОРАЖЕНИЕ</h2>
              <p className="text-zinc-400">В следующий раз повезет больше.</p>
            </>
          )}
          <button 
            onClick={() => window.location.reload()} // Simple reload to go back to city for now
            className="mt-8 px-8 py-3 bg-zinc-800 hover:bg-zinc-700 rounded text-white font-mono"
          >
            ВЕРНУТЬСЯ В ГОРОД
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-zinc-950 text-zinc-200 p-4 md:p-8">
      
      {/* Header / Timer */}
      <div className="flex justify-between items-center mb-8">
        <div className="font-mono text-sm text-zinc-500">БОЙ #{useBattleStore.getState().battleId?.slice(0, 8)}</div>
        <div className={clsx(
          "flex items-center gap-2 text-2xl font-mono font-bold transition-colors",
          timeLeft < 10 ? "text-red-500 animate-pulse" : "text-emerald-400"
        )}>
          <Timer className="w-6 h-6" />
          {timeLeft}s
        </div>
        <div className="font-mono text-sm text-zinc-500">РАУНД {round}</div>
      </div>

      {/* Fighters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Player */}
        <FighterCard fighter={player} isPlayer />
        
        {/* Opponent */}
        <FighterCard fighter={opponent} isPlayer={false} />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 flex-1">
        
        {/* Attack Selector */}
        <div className="bg-zinc-900/50 p-6 rounded-lg border border-red-500/20">
          <h3 className="flex items-center gap-2 text-red-400 font-bold mb-4 uppercase tracking-wider">
            <Sword className="w-5 h-5" /> Атака (1)
          </h3>
          <div className="space-y-2">
            {BODY_PARTS.map((part) => (
              <button
                key={part.id}
                onClick={() => !isReady && setAttack(part.id)}
                disabled={isReady}
                className={clsx(
                  "w-full p-3 rounded text-left transition-all flex justify-between items-center",
                  selectedAttack === part.id
                    ? "bg-red-500/20 border border-red-500 text-red-400"
                    : "bg-zinc-800 hover:bg-zinc-700 border border-transparent"
                )}
              >
                {part.label}
                {selectedAttack === part.id && <div className="w-2 h-2 rounded-full bg-red-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col justify-center items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCommit}
            disabled={!selectedAttack || selectedBlocks.length !== 2 || isReady}
            className={clsx(
              "w-full max-w-[200px] py-4 rounded-lg font-bold text-lg uppercase tracking-widest shadow-lg transition-all",
              isReady
                ? "bg-zinc-800 text-zinc-500 cursor-wait"
                : (!selectedAttack || selectedBlocks.length !== 2)
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-red-900/50 hover:shadow-red-900/80"
            )}
          >
            {isReady ? 'Ожидание...' : 'В БОЙ!'}
          </motion.button>
          
          <div className="text-center text-xs text-zinc-500">
            {isReady ? "Ожидаем ход противника" : "Выберите 1 атаку и 2 блока"}
          </div>
        </div>

        {/* Block Selector */}
        <div className="bg-zinc-900/50 p-6 rounded-lg border border-blue-500/20">
          <h3 className="flex items-center gap-2 text-blue-400 font-bold mb-4 uppercase tracking-wider">
            <Shield className="w-5 h-5" /> Блок (2)
          </h3>
          <div className="space-y-2">
            {BODY_PARTS.map((part) => {
              const isSelected = selectedBlocks.includes(part.id);
              return (
                <button
                  key={part.id}
                  onClick={() => !isReady && toggleBlock(part.id)}
                  disabled={isReady || (!isSelected && selectedBlocks.length >= 2)}
                  className={clsx(
                    "w-full p-3 rounded text-left transition-all flex justify-between items-center",
                    isSelected
                      ? "bg-blue-500/20 border border-blue-500 text-blue-400"
                      : "bg-zinc-800 hover:bg-zinc-700 border border-transparent disabled:opacity-50"
                  )}
                >
                  {part.label}
                  {isSelected && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="h-32 bg-zinc-900 rounded p-4 overflow-y-auto font-mono text-sm border border-zinc-800">
        {logs.map((log, i) => (
          <div key={i} className="mb-1 text-zinc-400 border-b border-zinc-800/50 pb-1 last:border-0">
            {log}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

const FighterCard: React.FC<{ fighter: any; isPlayer: boolean }> = ({ fighter, isPlayer }) => {
  if (!fighter) return <div className="h-24 bg-zinc-900 rounded animate-pulse" />;

  const hpPercent = Math.max(0, Math.min(100, (fighter.hp / fighter.maxHp) * 100));
  
  return (
    <div className={clsx(
      "p-4 rounded-lg border bg-zinc-900/80 backdrop-blur",
      isPlayer ? "border-emerald-500/30" : "border-red-500/30"
    )}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className={clsx("font-bold text-lg", isPlayer ? "text-emerald-400" : "text-red-400")}>
            {fighter.name}
          </h3>
          <div className="text-xs text-zinc-500">Level {fighter.level}</div>
        </div>
        {fighter.damage > 0 && (
          <motion.div 
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -20, opacity: 0 }}
            key={fighter.damage + Date.now()} // Force re-render animation
            className={clsx(
              "font-bold text-xl", 
              fighter.isCrit ? "text-yellow-400 scale-125" : "text-red-500"
            )}
          >
            -{fighter.damage}
          </motion.div>
        )}
      </div>

      {/* HP Bar */}
      <div className="relative h-4 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: '100%' }}
          animate={{ width: `${hpPercent}%` }}
          transition={{ duration: 0.5 }}
          className={clsx(
            "absolute inset-y-0 left-0 transition-all",
            hpPercent > 50 ? "bg-emerald-500" : hpPercent > 20 ? "bg-yellow-500" : "bg-red-500"
          )}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-black drop-shadow-md">
          {fighter.hp} / {fighter.maxHp}
        </div>
      </div>
    </div>
  );
};
