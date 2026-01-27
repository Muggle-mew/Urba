import { Server, Socket } from 'socket.io';
import { BattleService } from '../services/BattleService';
import { PlayerMove } from '../types/battle';

export const setupBattleHandlers = (io: Server, battleService: BattleService) => {
  io.on('connection', (socket: Socket) => {
    
    socket.on('battle_join', (data: { characterId: string }) => {
      if (!data.characterId) return;
      battleService.joinBattle(socket, data.characterId);
    });

    socket.on('battle_start_pve', (data: { characterId: string, monsterId: string, monsterLevel?: number }) => {
      if (!data.characterId || !data.monsterId) return;
      battleService.startPvEBattle(socket, data.characterId, data.monsterId, data.monsterLevel);
    });

    socket.on('battle_turn', (data: { move: PlayerMove }) => {
      battleService.handleTurn(socket, data.move);
    });

  });
};
