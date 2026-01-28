import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { BodyPart } from '../../store/useBattleStore';

interface CombatMannequinProps {
  type: 'attack' | 'defense';
  selectedParts: BodyPart[];
  onToggle: (part: BodyPart) => void;
}

export const CombatMannequin: React.FC<CombatMannequinProps> = ({ type, selectedParts, onToggle }) => {
  const isSelected = (part: BodyPart) => (selectedParts || []).includes(part);

  const getFillColor = (part: BodyPart) => {
    if (isSelected(part)) {
      return type === 'attack' ? '#c0392b' : '#2980b9'; // Red for attack, Blue for defense
    }
    return 'transparent';
  };

  const getStrokeColor = (part: BodyPart) => {
    if (isSelected(part)) {
      return type === 'attack' ? '#e74c3c' : '#3498db';
    }
    return '#4a4a4a';
  };

  return (
    <div className="flex flex-col items-center">
      <div className={clsx("text-xs font-bold uppercase tracking-widest mb-2", type === 'attack' ? "text-red-500" : "text-blue-500")}>
        {type === 'attack' ? 'Атака' : 'Защита'}
      </div>
      <svg width="100" height="200" viewBox="0 0 100 200" className="cursor-pointer drop-shadow-lg">
        {/* Head */}
        <motion.path
          d="M35,10 Q35,0 50,0 Q65,0 65,10 L65,25 Q65,35 50,35 Q35,35 35,25 Z"
          fill={getFillColor('HEAD')}
          stroke={getStrokeColor('HEAD')}
          strokeWidth="2"
          whileHover={{ scale: 1.05, fill: type === 'attack' ? 'rgba(192, 57, 43, 0.3)' : 'rgba(41, 128, 185, 0.3)' }}
          onClick={() => onToggle('HEAD')}
          className="transition-colors duration-200"
        />
        
        {/* Chest */}
        <motion.path
          d="M20,35 L80,35 L75,80 L25,80 Z"
          fill={getFillColor('CHEST')}
          stroke={getStrokeColor('CHEST')}
          strokeWidth="2"
          whileHover={{ scale: 1.05, fill: type === 'attack' ? 'rgba(192, 57, 43, 0.3)' : 'rgba(41, 128, 185, 0.3)' }}
          onClick={() => onToggle('CHEST')}
          className="transition-colors duration-200"
        />

        {/* Stomach */}
        <motion.path
          d="M25,80 L75,80 L70,110 L30,110 Z"
          fill={getFillColor('STOMACH')}
          stroke={getStrokeColor('STOMACH')}
          strokeWidth="2"
          whileHover={{ scale: 1.05, fill: type === 'attack' ? 'rgba(192, 57, 43, 0.3)' : 'rgba(41, 128, 185, 0.3)' }}
          onClick={() => onToggle('STOMACH')}
          className="transition-colors duration-200"
        />

        {/* Legs */}
        <motion.path
          d="M30,110 L70,110 L70,180 L52,180 L50,130 L48,180 L30,180 Z"
          fill={getFillColor('LEGS')}
          stroke={getStrokeColor('LEGS')}
          strokeWidth="2"
          whileHover={{ scale: 1.05, fill: type === 'attack' ? 'rgba(192, 57, 43, 0.3)' : 'rgba(41, 128, 185, 0.3)' }}
          onClick={() => onToggle('LEGS')}
          className="transition-colors duration-200"
        />
      </svg>
    </div>
  );
};
