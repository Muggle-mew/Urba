import React, { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { ChatWidget } from '../chat/ChatWidget';
import { PlayerListWidget } from '../chat/PlayerListWidget';
import { useCharacterStore } from '../../store/useCharacterStore';
import { User, Settings, Map, LogOut } from 'lucide-react';

interface GameLayoutProps {
  children: ReactNode;
}

export const GameLayout: React.FC<GameLayoutProps> = ({ children }) => {
  const { openProfile } = useCharacterStore();
  const [panelHeight, setPanelHeight] = useState(250); // Initial height in px
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef<number>(0);
  const startHeight = useRef<number>(0);

  // Resize constraints
  const MIN_HEIGHT_PCT = 0.1; // 10%
  const MAX_HEIGHT_PCT = 0.5; // 50%

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    startHeight.current = panelHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaY = dragStartY.current - e.clientY; // Moving up increases height
      let newHeight = startHeight.current + deltaY;

      const minHeight = window.innerHeight * MIN_HEIGHT_PCT;
      const maxHeight = window.innerHeight * MAX_HEIGHT_PCT;

      if (newHeight < minHeight) newHeight = minHeight;
      if (newHeight > maxHeight) newHeight = maxHeight;

      setPanelHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-terra-black text-terra-text font-sans">
      
      {/* Top Navigation Bar */}
      <header className="h-12 bg-gradient-to-b from-gray-900 to-terra-dark border-b border-gray-800 flex items-center justify-between px-4 shrink-0 z-40 shadow-md">
        {/* Left: Branding / Location */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-terra-accent rounded-full flex items-center justify-center font-bold text-white shadow-lg border border-red-900">
            U
          </div>
          <div className="text-sm font-bold text-gray-300 hidden sm:block">
            Urba
            <span className="text-gray-600 mx-2">|</span>
            <span className="text-terra-gold">Химер-Сити</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={openProfile}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-700 transition-colors text-sm font-medium group"
          >
            <User size={16} className="text-terra-gold group-hover:text-white transition-colors" />
            <span>Мой персонаж</span>
          </button>
          
          <div className="h-6 w-px bg-gray-700 mx-1" />
          
          <button className="p-2 text-gray-500 hover:text-white transition-colors" title="Карта">
            <Map size={18} />
          </button>
          <button className="p-2 text-gray-500 hover:text-white transition-colors" title="Настройки">
            <Settings size={18} />
          </button>
          <button className="p-2 text-gray-500 hover:text-red-400 transition-colors" title="Выход">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area (Game View) */}
      <main className="flex-1 overflow-hidden relative bg-terra-black">
        {children}
      </main>

      {/* Bottom Panel (Resizable) */}
      <div 
        className="flex border-t border-gray-800 bg-terra-dark shrink-0 z-30 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]"
        style={{ height: panelHeight }}
      >
        {/* Resize Handle */}
        <div 
          className="absolute -top-3 left-0 w-full h-4 cursor-row-resize flex items-center justify-center group z-40 hover:bg-white/5 transition-colors"
          onMouseDown={handleMouseDown}
        >
          <div className="w-16 h-1 bg-gray-600 rounded-full group-hover:bg-terra-gold transition-colors shadow-sm" />
        </div>
        
        {/* Chat Area (3/4 width) */}
        <div className="w-3/4 h-full border-r border-gray-800">
          <ChatWidget />
        </div>

        {/* Player List Area (1/4 width) */}
        <div className="w-1/4 h-full min-w-[150px]">
          <PlayerListWidget />
        </div>

      </div>

      {/* Modals */}
    </div>
  );
};
