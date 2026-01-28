export interface AchievementData {
  id: string;
  name: string;
  desc: string;
  minLevel: number;
}

export const ACHIEVEMENTS_1_20: AchievementData[] = [
  { id: "first_blood", name: "Первая кровь", desc: "Заверши первый бой", minLevel: 1 },
  { id: "first_win", name: "Первая победа", desc: "Победи врага", minLevel: 1 },
  { id: "explorer", name: "Исследователь", desc: "Посети все 3 города", minLevel: 1 },
  { id: "hunter", name: "Охотник", desc: "Убей 50 монстров", minLevel: 1 },
  { id: "duelist", name: "Дуэлянт", desc: "Победи 10 игроков", minLevel: 1 },
  { id: "gatherer", name: "Сборщик", desc: "Собери 100 ресурсов", minLevel: 1 },
  { id: "craftsman", name: "Ремесленник", desc: "Создай 5 предметов", minLevel: 1 },
  { id: "shopper", name: "Покупатель", desc: "Купи 10 предметов", minLevel: 1 },
  { id: "healer", name: "Целитель", desc: "Восстанови 1000 HP", minLevel: 1 },
  { id: "tank", name: "Танк", desc: "Получи 5000 урона", minLevel: 1 },
  { id: "crit_master", name: "Мастер крита", desc: "Нанеси 20 критов", minLevel: 1 },
  { id: "blocker", name: "Блокировщик", desc: "Заблокируй 50 атак", minLevel: 1 },
  { id: "dodger", name: "Уворот", desc: "Уклонись 20 раз", minLevel: 1 },
  { id: "level_5", name: "Новичок", desc: "Достигни 5 уровня", minLevel: 1 },
  { id: "level_10", name: "Боец", desc: "Достигни 10 уровня", minLevel: 1 },
  { id: "level_15", name: "Ветеран", desc: "Достигни 15 уровня", minLevel: 1 },
  { id: "level_20", name: "Герой", desc: "Достигни 20 уровня", minLevel: 1 },
  { id: "faction_synth", name: "Синтез", desc: "Выбери наклонность Синтез", minLevel: 1 },
  { id: "faction_relic", name: "Реликт", desc: "Выбери наклонность Реликты", minLevel: 1 },
  { id: "faction_shadow", name: "Тень", desc: "Выбери наклонность Тень", minLevel: 1 },
  { id: "faction_pulse", name: "Пульс", desc: "Выбери наклонность Пульс", minLevel: 1 },
  { id: "faction_outcast", name: "Изгой", desc: "Выбери наклонность Изгой", minLevel: 1 },
  { id: "first_boss", name: "Первый босс", desc: "Победи босса локации", minLevel: 1 },
  { id: "full_gear", name: "Полная экипировка", desc: "Экипируй все 12 слотов", minLevel: 1 },
  { id: "chat_user", name: "Болтун", desc: "Отправь 50 сообщений", minLevel: 1 },
];

export const ACHIEVEMENTS_21_40: AchievementData[] = [
  { id: "elite_hunter", name: "Элитный охотник", desc: "Убей 500 монстров", minLevel: 21 },
  { id: "pvp_champion", name: "Чемпион PvP", desc: "Победи 100 игроков", minLevel: 21 },
  { id: "master_crafter", name: "Мастер крафта", desc: "Создай 50 предметов", minLevel: 21 },
  { id: "resource_king", name: "Король ресурсов", desc: "Собери 5000 ресурсов", minLevel: 21 },
  { id: "clan_leader", name: "Лидер клана", desc: "Создай клан и набери 10 игроков", minLevel: 21 },
  { id: "level_25", name: "Эксперт", desc: "Достигни 25 уровня", minLevel: 21 },
  { id: "level_30", name: "Мастер", desc: "Достигни 30 уровня", minLevel: 21 },
  { id: "level_35", name: "Легенда", desc: "Достигни 35 уровня", minLevel: 21 },
  { id: "level_40", name: "Архонт", desc: "Достигни 40 уровня", minLevel: 21 },
  { id: "all_factions", name: "Изменник", desc: "Смени наклонность 5 раз", minLevel: 21 },
  { id: "all_bosses", name: "Покоритель", desc: "Победи всех 6 боссов", minLevel: 21 },
  { id: "undefeated_week", name: "Непобедимый", desc: "Неделя без поражений", minLevel: 21 },
];

export const ACHIEVEMENTS_41_60: AchievementData[] = [
  { id: "god_hunter", name: "Бог охоты", desc: "Убей 5000 монстров", minLevel: 41 },
  { id: "pvp_god", name: "Бог PvP", desc: "Победи 1000 игроков", minLevel: 41 },
  { id: "legend_crafter", name: "Легендарный кузнец", desc: "Создай 500 предметов", minLevel: 41 },
  { id: "max_level", name: "Воплощение Урбы", desc: "Достигни 60 уровня", minLevel: 41 },
  { id: "all_achievements", name: "Легенда Урбы", desc: "Открой все достижения", minLevel: 41 },
  { id: "perfect_week", name: "Идеальная неделя", desc: "Выполни все еженедельные задания", minLevel: 41 },
  { id: "no_death_month", name: "Бессмертный", desc: "Месяц без смертей", minLevel: 41 },
];

export const ALL_ACHIEVEMENTS = [
  ...ACHIEVEMENTS_1_20,
  ...ACHIEVEMENTS_21_40,
  ...ACHIEVEMENTS_41_60,
];
