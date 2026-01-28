import React, { useState, useEffect } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { questApi } from '../../services/api';
import { X, CheckCircle, Lock, Unlock, Calendar, Trophy, Star } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface Quest {
  id: string;
  content: string;
  type: 'DAILY' | 'WEEKLY';
  progress: number;
  target: number;
  isCompleted: boolean;
  expiresAt: string;
}

interface Achievement {
  id: string;
  name: string;
  desc: string;
  unlocked: boolean;
  unlockedAt?: string;
  minLevel: number;
}

export const QuestsModal: React.FC = () => {
  const { character, isQuestsOpen, closeQuests } = useCharacterStore();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'achievements'>('daily');
  const [quests, setQuests] = useState<{ daily: Quest[], weekly: Quest[] }>({ daily: [], weekly: [] });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isQuestsOpen && character) {
      setLoading(true);
      Promise.all([
        questApi.getQuests(character.id),
        questApi.getAchievements(character.id)
      ]).then(([questsRes, achievementsRes]) => {
        setQuests(questsRes.data);
        setAchievements(achievementsRes.data);
      }).catch(err => console.error(err))
      .finally(() => setLoading(false));
    }
  }, [isQuestsOpen, character]);

  if (!isQuestsOpen || !character) return null;

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={clsx(
        "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2",
        activeTab === id 
          ? "border-terra-gold text-terra-gold bg-terra-gold/10" 
          : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"
      )}
    >
      <Icon size={16} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={closeQuests}>
      <div 
        className="bg-terra-dark border border-gray-700 w-full max-w-4xl h-[80vh] flex flex-col rounded shadow-2xl animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-black/20 shrink-0">
          <h2 className="text-xl font-bold text-terra-gold uppercase tracking-widest flex items-center gap-3">
            <Trophy className="text-terra-gold" />
            Задания и Достижения
          </h2>
          <button onClick={closeQuests} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 shrink-0">
          <TabButton id="daily" label="Ежедневные" icon={Calendar} />
          <TabButton id="weekly" label="Еженедельные" icon={Star} />
          <TabButton id="achievements" label="Достижения" icon={Trophy} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-black/20">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="animate-spin mr-3 text-terra-gold">
                 <Trophy size={24} />
              </div>
              Загрузка данных...
            </div>
          ) : (
            <>
              {activeTab === 'daily' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                      Активные задания на сегодня
                    </h3>
                    <div className="text-xs text-gray-500 border border-gray-800 px-3 py-1 rounded-full">
                      Обновление в 00:00
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    {quests.daily.length > 0 ? quests.daily.map(quest => (
                      <QuestCard key={quest.id} quest={quest} />
                    )) : (
                      <EmptyState message="Нет активных ежедневных заданий" />
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'weekly' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                      Задания на эту неделю
                    </h3>
                    <div className="text-xs text-gray-500 border border-gray-800 px-3 py-1 rounded-full">
                      Обновление: Понедельник
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {quests.weekly.length > 0 ? quests.weekly.map(quest => (
                      <QuestCard key={quest.id} quest={quest} color="blue" />
                    )) : (
                      <EmptyState message="Нет активных еженедельных заданий" />
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                   {achievements.map(ach => (
                    <div 
                      key={ach.id} 
                      className={clsx(
                        "relative p-4 rounded border transition-all duration-300 group hover:shadow-lg",
                        ach.unlocked 
                          ? "bg-terra-gold/5 border-terra-gold/30 hover:border-terra-gold/50" 
                          : "bg-white/5 border-gray-800 grayscale opacity-60 hover:opacity-80"
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={clsx(
                          "w-8 h-8 rounded-full flex items-center justify-center border",
                          ach.unlocked 
                            ? "bg-terra-gold/20 border-terra-gold/50 text-terra-gold" 
                            : "bg-black border-gray-700 text-gray-600"
                        )}>
                          {ach.unlocked ? <Unlock size={14} /> : <Lock size={14} />}
                        </div>
                        {ach.unlocked && (
                          <span className="text-[10px] text-terra-gold/70 font-mono bg-terra-gold/10 px-2 py-0.5 rounded">
                            {new Date(ach.unlockedAt!).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h4 className={clsx("font-bold text-sm mb-1 group-hover:text-terra-gold transition-colors", ach.unlocked ? "text-gray-200" : "text-gray-400")}>
                        {ach.name}
                      </h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {ach.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const QuestCard = ({ quest, color = 'gold' }: { quest: Quest, color?: 'gold' | 'blue' }) => {
  const isGold = color === 'gold';
  const progressPercent = Math.min(100, (quest.progress / quest.target) * 100);

  return (
    <div className={clsx(
      "bg-white/5 border p-4 rounded-lg flex items-center justify-between group transition-all",
      isGold 
        ? "border-gray-800 hover:border-terra-gold/50 hover:bg-terra-gold/5" 
        : "border-gray-800 hover:border-blue-500/50 hover:bg-blue-500/5"
    )}>
      <div className="flex-1 pr-6">
        <div className="text-sm font-medium text-gray-200 mb-3 group-hover:text-white transition-colors">{quest.content}</div>
        
        <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden mb-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={clsx(
              "h-full rounded-full transition-all",
              isGold ? "bg-terra-gold" : "bg-blue-500"
            )}
          />
        </div>
        
        <div className="flex justify-between text-[10px] uppercase tracking-wider font-medium">
          <span className="text-gray-500">Прогресс</span>
          <span className={clsx(isGold ? "text-terra-gold" : "text-blue-400")}>
            {quest.progress} / {quest.target}
          </span>
        </div>
      </div>
      
      <div className={clsx(
        "flex items-center justify-center w-12 h-12 rounded-full border-2 shrink-0 transition-all",
        quest.isCompleted
          ? "bg-green-500/10 border-green-500 text-green-500"
          : "bg-black border-gray-800 text-gray-600"
      )}>
        {quest.isCompleted ? (
          <CheckCircle size={24} />
        ) : (
          <span className="text-xs font-mono">{Math.floor(progressPercent)}%</span>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
    <Trophy size={48} className="text-gray-600 mb-4" />
    <p className="text-gray-400">{message}</p>
  </div>
);
