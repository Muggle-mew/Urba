import React, { useMemo } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import type { LocationId } from '../../store/useCharacterStore';
import { X, MapPin, Navigation, Lock } from 'lucide-react';
import clsx from 'clsx';

// Map structure definition
interface MapNode {
  id: LocationId;
  name: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  type: 'city' | 'zone';
  connectedTo: LocationId[];
}

const MAP_NODES: MapNode[] = [
  // CITIES
  { id: 'verdis', name: 'ВЕРДИС', x: 50, y: 15, type: 'city', connectedTo: ['z1', 'z6'] },
  { id: 'ash', name: 'АШ', x: 90, y: 80, type: 'city', connectedTo: ['z2', 'z3'] },
  { id: 'nima', name: 'НИМА', x: 10, y: 80, type: 'city', connectedTo: ['z4', 'z5'] },

  // ZONES
  // Path 1: Verdis -> Ash
  { id: 'z1', name: 'Заброшенная ТЭЦ', x: 65, y: 30, type: 'zone', connectedTo: ['verdis', 'z2'] },
  { id: 'z2', name: 'Мутантский лес', x: 80, y: 55, type: 'zone', connectedTo: ['z1', 'ash'] },

  // Path 2: Ash -> Nima
  { id: 'z3', name: 'Радиоактивный каньон', x: 65, y: 80, type: 'zone', connectedTo: ['ash', 'z4'] },
  { id: 'z4', name: 'Цифровые руины', x: 35, y: 80, type: 'zone', connectedTo: ['z3', 'nima'] },

  // Path 3: Nima -> Verdis
  { id: 'z5', name: 'Подземелье данных', x: 20, y: 55, type: 'zone', connectedTo: ['nima', 'z6'] },
  { id: 'z6', name: 'Пустошь шепотов', x: 35, y: 30, type: 'zone', connectedTo: ['z5', 'verdis'] },
];

interface WorldMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  restrictTravel?: boolean;
}

export const WorldMapModal: React.FC<WorldMapModalProps> = ({ isOpen, onClose, restrictTravel = false }) => {
  const { character, startTravel } = useCharacterStore();

  if (!isOpen || !character) return null;

  const currentLocationId = character.location.city;

  const handleTravel = (targetId: LocationId) => {
    startTravel(targetId);
    onClose();
  };

  // Helper to check if a node is reachable
  const isReachable = (targetId: LocationId) => {
    if (!restrictTravel) return true; // Free travel mode
    if (targetId === currentLocationId) return false; // Already here

    const currentNode = MAP_NODES.find(n => n.id === currentLocationId);
    if (!currentNode) return false;

    return currentNode.connectedTo.includes(targetId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start pointer-events-none">
          <div className="bg-black/70 backdrop-blur px-4 py-2 rounded border border-gray-600">
            <h2 className="text-2xl font-bold text-terra-gold flex items-center gap-2">
              <MapPin /> Карта Территории
            </h2>
            <p className="text-gray-400 text-sm">Выберите локацию для перемещения</p>
          </div>
          <button 
            onClick={onClose}
            className="pointer-events-auto bg-black/50 hover:bg-red-900/50 text-white p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Map Container */}
        <div className="absolute inset-0 bg-black">
          {/* Map Image */}
          <img 
            src="/images/world-map.png" 
            alt="World Map" 
            className="w-full h-full object-contain opacity-80"
            onError={(e) => {
              // Fallback if image missing
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('bg-grid-pattern');
            }}
          />
          
          {/* Connections (Lines) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
            {MAP_NODES.map(node => 
              node.connectedTo.map(targetId => {
                const target = MAP_NODES.find(n => n.id === targetId);
                if (!target) return null;
                return (
                  <line 
                    key={`${node.id}-${target.id}`}
                    x1={`${node.x}%`} 
                    y1={`${node.y}%`} 
                    x2={`${target.x}%`} 
                    y2={`${target.y}%`} 
                    stroke="#fbbf24" 
                    strokeWidth="2" 
                    strokeDasharray="5,5"
                  />
                );
              })
            )}
          </svg>

          {/* Nodes */}
          {MAP_NODES.map((node) => {
            const isCurrent = node.id === currentLocationId;
            const accessible = isReachable(node.id);

            return (
              <button
                key={node.id}
                onClick={() => accessible && handleTravel(node.id)}
                disabled={!accessible && !isCurrent}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className={clsx(
                  "absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition-all duration-300",
                  isCurrent ? "z-30 scale-110" : "z-20 hover:scale-110",
                  !accessible && !isCurrent && "opacity-50 grayscale cursor-not-allowed"
                )}
              >
                {/* Icon/Marker */}
                <div className={clsx(
                  "w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-lg transition-all",
                  node.type === 'city' ? "w-16 h-16" : "w-10 h-10",
                  isCurrent 
                    ? "bg-terra-gold border-white shadow-terra-gold/50 animate-pulse" 
                    : accessible 
                      ? "bg-blue-900/80 border-blue-400 hover:bg-blue-800 hover:border-white shadow-blue-500/30 cursor-pointer"
                      : "bg-gray-800/80 border-gray-600"
                )}>
                  {isCurrent ? (
                    <MapPin className="text-black w-1/2 h-1/2" />
                  ) : accessible ? (
                    <Navigation className="text-blue-200 w-1/2 h-1/2" />
                  ) : (
                    <Lock className="text-gray-500 w-1/2 h-1/2" />
                  )}
                </div>

                {/* Label */}
                <div className={clsx(
                  "mt-2 px-2 py-1 rounded text-xs font-bold backdrop-blur-md transition-colors whitespace-nowrap",
                  isCurrent 
                    ? "bg-terra-gold text-black" 
                    : accessible 
                      ? "bg-black/70 text-blue-200 border border-blue-500/30"
                      : "bg-black/50 text-gray-500"
                )}>
                  {node.name}
                </div>
                
                {/* Distance/Time hint */}
                {accessible && (
                  <div className="absolute -bottom-8 bg-blue-900/90 text-white text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    10 сек
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
