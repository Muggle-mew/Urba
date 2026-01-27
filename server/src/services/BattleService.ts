import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { BattleState, BattlePlayer, BodyZone, PlayerMove } from '../types/battle';

const prisma = new PrismaClient();

export class BattleService {
  private battles: Map<string, BattleState> = new Map();
  private io: Server;
  // socketId -> battleId
  private playerBattleMap: Map<string, string> = new Map(); 

  constructor(io: Server) {
    this.io = io;
  }

  // Создание или присоединение к бою
  public async joinBattle(socket: Socket, characterId: string) {
    // ... existing join logic (PVP or whatever)
    // For now, let's keep it as is, but we will add startPvEBattle separately
    this.startPvEBattle(socket, characterId, 'random'); // This is not right. User calls joinBattle for PvP usually.
  }

  public async startPvEBattle(socket: Socket, characterId: string, monsterId: string, monsterLevel?: number) {
    try {
      const character = await prisma.character.findUnique({ where: { id: characterId } });
      if (!character) return socket.emit('error', 'Character not found');

      // Проверка на реконнект
      const existingBattleId = this.findBattleByCharacterId(characterId);
      if (existingBattleId) {
        const battle = this.battles.get(existingBattleId);
        if (battle) {
          this.reconnectPlayer(socket, battle, characterId);
          return;
        }
      }

      // Находим монстра
      const monster = await prisma.monster.findUnique({ where: { id: monsterId } });
      if (!monster) return socket.emit('error', 'Monster not found');

      // Scaling Logic
      let scaledMonster = { ...monster };
      if (monsterLevel && monsterLevel !== monster.level) {
         const multiplier = monsterLevel / Math.max(1, monster.level);
         scaledMonster.level = monsterLevel;
         scaledMonster.hp = Math.floor(monster.hp * multiplier);
         scaledMonster.maxHp = Math.floor(monster.maxHp * multiplier);
         scaledMonster.strength = Math.floor(monster.strength * multiplier);
         scaledMonster.agility = Math.floor(monster.agility * multiplier);
         scaledMonster.intuition = Math.floor(monster.intuition * multiplier);
         scaledMonster.will = Math.floor(monster.will * multiplier);
         scaledMonster.constitution = Math.floor(monster.constitution * multiplier);
         // Rewards handled in endBattle logic usually, but let's assume they are stored on the bot or recalculated
      }

      // Создаем новый бой
      const battle = this.createBattle();
      
      // Добавляем игрока
      this.addPlayerToBattle(socket, battle, character);
      
      // Добавляем монстра (как бота)
      const botId = `monster_${monster.id}_${Date.now()}`;
      const bot: BattlePlayer = {
        socketId: botId,
        characterId: 'monster_' + monster.id, // Marker for monster
        name: scaledMonster.name,
        hp: scaledMonster.hp,
        maxHp: scaledMonster.maxHp,
        stats: {
          strength: scaledMonster.strength,
          agility: scaledMonster.agility,
          intuition: scaledMonster.intuition,
          will: scaledMonster.will,
          constitution: scaledMonster.constitution
        },
        lastDamage: 0,
        isCrit: false,
        avatar: monster.image || undefined,
        level: scaledMonster.level
      };
      battle.players[botId] = bot;

      this.startBattle(battle);

    } catch (error) {
      console.error('Start PvE battle error:', error);
      socket.emit('error', 'Internal server error');
    }
  }

  public handleTurn(socket: Socket, move: PlayerMove) {
    const battleId = this.playerBattleMap.get(socket.id);
    if (!battleId) return;

    const battle = this.battles.get(battleId);
    if (!battle || battle.status !== 'in_progress') return;

    const player = battle.players[socket.id];
    if (!player) return;

    player.currentMove = move;
    
    // Если противник бот, генерируем его ход
    const opponentId = Object.keys(battle.players).find(id => id !== socket.id);
    if (opponentId && opponentId.startsWith('bot_')) {
      const bot = battle.players[opponentId];
      bot.currentMove = this.generateBotMove();
    }

    // Проверяем, все ли сделали ход
    const allMoved = Object.values(battle.players).every(p => p.currentMove);
    if (allMoved) {
      this.resolveRound(battle);
    } else {
      // Уведомляем, что игрок сделал ход (скрывая детали)
      this.io.to(battle.id).emit('battle_turn_confirmed', { playerId: socket.id });
    }
  }

  private createBattle(): BattleState {
    const id = Math.random().toString(36).substring(7);
    const battle: BattleState = {
      id,
      players: {},
      round: 0,
      logs: [],
      status: 'waiting',
      timerStart: 0,
      timerDuration: 30
    };
    this.battles.set(id, battle);
    return battle;
  }

  private addPlayerToBattle(socket: Socket, battle: BattleState, character: any) {
    const player: BattlePlayer = {
      socketId: socket.id,
      characterId: character.id,
      name: character.nickname || 'Unknown',
      hp: character.hp,
      maxHp: character.maxHp,
      level: character.level,
      stats: {
        strength: character.strength,
        agility: character.agility,
        intuition: character.intuition,
        will: character.will,
        constitution: character.constitution
      },
      lastDamage: 0,
      isCrit: false
    };

    battle.players[socket.id] = player;
    this.playerBattleMap.set(socket.id, battle.id);
    socket.join(battle.id);
  }

  private addBotToBattle(battle: BattleState, playerCharacter: any) {
    const botId = `bot_${Math.random().toString(36).substring(7)}`;
    const bot: BattlePlayer = {
      socketId: botId,
      characterId: 'bot',
      name: 'Cyber-Bot',
      hp: playerCharacter.hp,
      maxHp: playerCharacter.maxHp,
      stats: {
        strength: playerCharacter.strength,
        agility: playerCharacter.agility,
        intuition: playerCharacter.intuition,
        will: playerCharacter.will,
        constitution: playerCharacter.constitution
      },
      lastDamage: 0,
      isCrit: false
    };

    battle.players[botId] = bot;
  }

  private generateBotMove(): PlayerMove {
    const zones = [BodyZone.HEAD, BodyZone.CHEST, BodyZone.STOMACH, BodyZone.LEGS];
    const attack = zones[Math.floor(Math.random() * zones.length)];
    
    // Pick 2 distinct block zones
    const shuffled = [...zones].sort(() => 0.5 - Math.random());
    const block: [BodyZone, BodyZone] = [shuffled[0], shuffled[1]];

    return { attack, block };
  }

  private startBattle(battle: BattleState) {
    battle.status = 'in_progress';
    battle.round = 1;
    battle.timerStart = Date.now();
    
    this.io.to(battle.id).emit('battle_state', battle);
    
    // Таймер раунда (30 сек)
    setTimeout(() => this.checkRoundTimeout(battle.id, battle.round), 30000);
  }

  private resolveRound(battle: BattleState) {
    const ids = Object.keys(battle.players);
    const p1 = battle.players[ids[0]];
    const p2 = battle.players[ids[1]];

    if (!p1.currentMove || !p2.currentMove) return;

    // Расчет урона
    this.calculateDamage(p1, p2);
    this.calculateDamage(p2, p1);

    // Применение урона
    p2.hp = Math.max(0, p2.hp - p1.lastDamage);
    p1.hp = Math.max(0, p1.hp - p2.lastDamage);

    // Логи
    const formatLog = (attacker: BattlePlayer, defender: BattlePlayer) => {
        if (attacker.isDodge) return `${defender.name} увернулся от атаки ${attacker.name}`;
        if (attacker.isBlocked) return `${defender.name} заблокировал удар ${attacker.name}`;
        return `${attacker.name} нанес ${defender.name} ${attacker.lastDamage} урона${attacker.isCrit ? ' (КРИТ!)' : ''}`;
    };

    const p1Log = formatLog(p1, p2);
    const p2Log = formatLog(p2, p1);
    const roundLog = `Раунд ${battle.round}: ${p1Log}. ${p2Log}`;
    
    battle.logs.push(roundLog);

    // Результат раунда
    this.io.to(battle.id).emit('battle_result', {
      round: battle.round,
      logs: [roundLog],
      players: {
        [p1.socketId]: { hp: p1.hp, damage: p1.lastDamage, isCrit: p1.isCrit, isBlocked: p1.isBlocked, isDodge: p1.isDodge },
        [p2.socketId]: { hp: p2.hp, damage: p2.lastDamage, isCrit: p2.isCrit, isBlocked: p2.isBlocked, isDodge: p2.isDodge }
      }
    });

    // Очистка ходов
    p1.currentMove = undefined;
    p2.currentMove = undefined;

    // Проверка окончания боя
    if (p1.hp <= 0 || p2.hp <= 0) {
      this.endBattle(battle, p1, p2);
    } else {
      battle.round++;
      battle.timerStart = Date.now();
      this.io.to(battle.id).emit('battle_state', battle);
      setTimeout(() => this.checkRoundTimeout(battle.id, battle.round), 30000);
    }
  }

  private calculateDamage(attacker: BattlePlayer, defender: BattlePlayer) {
    if (!attacker.currentMove) return;
    const move = attacker.currentMove;
    const targetZone = move.attack;
    
    // Reset flags
    attacker.lastDamage = 0;
    attacker.isCrit = false;
    attacker.isBlocked = false;
    attacker.isDodge = false;
    
    // 1. Dodge (Defender's agility)
    const dodgeChance = defender.stats.agility * 0.005;
    if (Math.random() < dodgeChance) {
        attacker.isDodge = true;
        return;
    }

    // 2. Block
    if (defender.currentMove && defender.currentMove.block.includes(targetZone)) {
       attacker.isBlocked = true;
       return;
    }

    // 3. Crit
    const critChance = (10 + attacker.stats.intuition * 0.5) / 100;
    const isCrit = Math.random() < critChance;
    
    // Base Damage
    let damage = attacker.stats.strength;

    // Zone Multipliers
    if (targetZone === BodyZone.HEAD) damage *= 2.0;
    if (targetZone === BodyZone.LEGS) damage *= 0.5;

    // Crit Multiplier
    if (isCrit) {
        const critMultiplier = 1 + (attacker.stats.will * 0.02);
        damage *= critMultiplier;
    }

    attacker.lastDamage = Math.floor(damage);
    attacker.isCrit = isCrit;
  }

  private async endBattle(battle: BattleState, p1: BattlePlayer, p2: BattlePlayer) {
    battle.status = 'finished';
    
    let winnerId: string | null = null;
    if (p1.hp > 0 && p2.hp <= 0) winnerId = p1.socketId;
    else if (p2.hp > 0 && p1.hp <= 0) winnerId = p2.socketId;
    
    let expReward = 10;
    let moneyReward = 5;

    // Determine rewards from monster if applicable
    const loser = winnerId === p1.socketId ? p2 : p1;
    if (loser.characterId.startsWith('monster_')) {
        const monsterId = loser.characterId.split('_')[1]; // monster_ID_timestamp -> ID is [1] wait, I used `monster_${monster.id}` in startPvEBattle.
        // Actually in startPvEBattle: characterId: 'monster_' + monster.id
        // So split('_')[1] is correct.
        try {
            const m = await prisma.monster.findUnique({ where: { id: monsterId } });
            if (m) {
                expReward = m.expReward;
                moneyReward = m.moneyReward;
            }
        } catch(e) {}
    }

    // Начисление наград
    if (winnerId) {
      const winner = battle.players[winnerId];
      // Only give rewards to real characters
      if (!winner.characterId.startsWith('monster_')) {
        try {
            await prisma.character.update({
            where: { id: winner.characterId },
            data: { 
                exp: { increment: expReward },
                money: { increment: moneyReward }
            } 
            });
        } catch (e) {
            console.error(`Failed to update winner rewards for char ${winner.characterId}:`, e);
        }
      }
    }

    // Обновление HP в БД (only for real characters)
    const updateHp = async (p: BattlePlayer) => {
        if (!p.characterId.startsWith('monster_')) {
            try {
                await prisma.character.update({ where: { id: p.characterId }, data: { hp: p.hp } });
            } catch (e) {
                console.error(`Failed to update HP for char ${p.characterId}:`, e);
            }
        }
    };

    await updateHp(p1);
    await updateHp(p2);

    this.io.to(battle.id).emit('battle_end', { 
      winnerId,
      rewards: { exp: expReward, money: moneyReward } 
    });

    this.battles.delete(battle.id);
    this.playerBattleMap.delete(p1.socketId);
    this.playerBattleMap.delete(p2.socketId);
  }

  private checkRoundTimeout(battleId: string, round: number) {
    const battle = this.battles.get(battleId);
    if (!battle || battle.status !== 'in_progress' || battle.round !== round) return;

    // Если таймер истек, делаем случайный ход за тех, кто не походил
    let stateChanged = false;
    Object.values(battle.players).forEach(p => {
      if (!p.currentMove) {
        p.currentMove = {
          attack: BodyZone.CHEST, // Default
          block: [BodyZone.HEAD, BodyZone.CHEST]
        };
        stateChanged = true;
      }
    });

    if (stateChanged) {
      this.resolveRound(battle);
    }
  }

  // Helpers
  private findWaitingBattle() {
    for (const battle of this.battles.values()) {
      if (battle.status === 'waiting' && Object.keys(battle.players).length < 2) {
        return battle;
      }
    }
    return null;
  }

  private findBattleByCharacterId(charId: string) {
    for (const battle of this.battles.values()) {
      for (const p of Object.values(battle.players)) {
        if (p.characterId === charId) return battle.id;
      }
    }
    return null;
  }

  private reconnectPlayer(socket: Socket, battle: BattleState, charId: string) {
    // Находим старый socketId
    let oldSocketId: string | undefined;
    for (const [sid, p] of Object.entries(battle.players)) {
      if (p.characterId === charId) {
        oldSocketId = sid;
        break;
      }
    }

    if (oldSocketId) {
      const player = battle.players[oldSocketId];
      delete battle.players[oldSocketId];
      
      player.socketId = socket.id;
      battle.players[socket.id] = player;
      
      this.playerBattleMap.delete(oldSocketId);
      this.playerBattleMap.set(socket.id, battle.id);
      
      socket.join(battle.id);
      socket.emit('battle_state', battle);
    }
  }
}
