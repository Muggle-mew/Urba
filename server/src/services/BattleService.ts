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

      // Поиск ожидающего боя
      // Для PVE режима сразу создаем бой с ботом
      const battle = this.createBattle();
      this.addPlayerToBattle(socket, battle, character);
      this.addBotToBattle(battle, character);
      this.startBattle(battle);
      
      /* 
      // PVP Logic (Disabled for now)
      let battle = this.findWaitingBattle();
      
      if (!battle) {
        battle = this.createBattle();
      }

      this.addPlayerToBattle(socket, battle, character);
      
      if (Object.keys(battle.players).length === 2) {
        this.startBattle(battle);
      } else {
        socket.emit('battle_join', { battleId: battle.id, state: battle });
      }
      */

    } catch (error) {
      console.error('Join battle error:', error);
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
      stats: {
        strength: character.strength,
        intuition: character.intuition
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
        intuition: playerCharacter.intuition
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
    const roundLog = `Round ${battle.round}: ${p1.name} hits ${p2.name} for ${p1.lastDamage} (${p1.isCrit ? 'CRIT' : ''}). ${p2.name} hits ${p1.name} for ${p2.lastDamage} (${p2.isCrit ? 'CRIT' : ''})`;
    battle.logs.push(roundLog);

    // Результат раунда
    this.io.to(battle.id).emit('battle_result', {
      round: battle.round,
      logs: [roundLog],
      players: {
        [p1.socketId]: { hp: p1.hp, damage: p1.lastDamage, isCrit: p1.isCrit },
        [p2.socketId]: { hp: p2.hp, damage: p2.lastDamage, isCrit: p2.isCrit }
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
    
    // Шанс крита: 10% + intuition * 0.5%
    const critChance = 0.10 + (attacker.stats.intuition * 0.005);
    const isCrit = Math.random() < critChance;
    
    // Проверка блока (если не крит)
    let isBlocked = false;
    if (!isCrit && defender.currentMove) {
       isBlocked = defender.currentMove.block.includes(targetZone);
    }

    if (isBlocked) {
      attacker.lastDamage = 0;
      attacker.isCrit = false;
      return;
    }

    // Базовый урон
    let damage = attacker.stats.strength;

    // Множители зон
    if (targetZone === BodyZone.HEAD) damage *= 2.0;
    if (targetZone === BodyZone.LEGS) damage *= 0.5;

    // Крит множитель (опционально, можно просто игнор блока, но обычно крит еще и x1.5 или x2)
    // В ТЗ: "Крит ... игнорирует блок". Добавим x1.5 для приятности, или оставим просто игнор.
    // ТЗ: "Крит ... -> игнорирует блок". Ок, просто игнор блока.
    // Но если удар в голову и крит - это мощно.

    attacker.lastDamage = Math.floor(damage);
    attacker.isCrit = isCrit;
  }

  private async endBattle(battle: BattleState, p1: BattlePlayer, p2: BattlePlayer) {
    battle.status = 'finished';
    
    let winnerId: string | null = null;
    if (p1.hp > 0 && p2.hp <= 0) winnerId = p1.socketId;
    else if (p2.hp > 0 && p1.hp <= 0) winnerId = p2.socketId;
    
    // Начисление наград
    if (winnerId) {
      const winner = battle.players[winnerId];
      // +10 exp, +5 money (пример)
      await prisma.character.update({
        where: { id: winner.characterId },
        data: { 
          exp: { increment: 10 },
          money: { increment: 5 }
        } 
      });
    }

    // Обновление HP в БД
    await prisma.character.update({ where: { id: p1.characterId }, data: { hp: p1.hp } });
    await prisma.character.update({ where: { id: p2.characterId }, data: { hp: p2.hp } });

    this.io.to(battle.id).emit('battle_end', { 
      winnerId,
      rewards: { exp: 10, money: 5 } 
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
