import React from 'react';
import { useChatStore } from '../../store/useChatStore';
import { Users, Sword, Coffee, Moon } from 'lucide-react';

export const PlayerListWidget: React.FC = () => {
  const { players } = useChatStore();

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'battle': return <Sword size={12} className="text-red-500" />;
      case 'afk': return <Moon size={12} className="text-blue-400" />;
      default: return <Coffee size={12} className="text-green-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-terra-dark">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-black/40 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
        <Users size={14} />
        <span>В локации ({players.length})</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-1">
        {players.map(player => (
          <div 
            key={player.id} 
            className="flex items-center justify-between p-1.5 hover:bg-white/5 rounded cursor-pointer group transition-colors"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {/* Status Icon */}
              <div title={player.status}>{getStatusIcon(player.status)}</div>
              
              {/* Name & Level */}
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-terra-text truncate group-hover:text-terra-gold transition-colors">
                  {player.name}
                </span>
                <span className="text-[10px] text-gray-500">
                  [{player.level}]
                </span>
              </div>
            </div>

            {/* Actions (appear on hover) */}
            <div className="opacity-0 group-hover:opacity-100 text-[10px] text-gray-400 flex gap-1">
               <button className="hover:text-white">i</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
