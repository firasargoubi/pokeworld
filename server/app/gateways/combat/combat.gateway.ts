import { CombatService } from '@app/services/combat/combat.service';
import { CombatEvent } from '@common/combat-event.enum';
import { AttackAttempt, EscapeAttempt } from '@common/combat-interfaces';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class CombatGateway implements OnGatewayDisconnect {
    @WebSocketServer() private server: Server;
    @Inject(forwardRef(() => CombatService)) private readonly combatService: CombatService;

    @SubscribeMessage(CombatEvent.EscapeAttempt)
    escapeAttempt(_: Socket, escapeAttempt: EscapeAttempt): void {
        this.combatService.escape(escapeAttempt.combatRoomCode, escapeAttempt.playerId);
    }

    @SubscribeMessage(CombatEvent.AttackAttempt)
    attackAttempt(_: Socket, attackAttempt: AttackAttempt): void {
        this.combatService.executeAttackAndCheckVictory(attackAttempt.combatRoomCode, attackAttempt.targetId);
        this.combatService.forceCombatTurnSwitch(attackAttempt.combatRoomCode);
    }

    handleDisconnect(socket: Socket) {
        for (const [combatRoomCode, state] of this.combatService.getCombatTurnSystems()) {
            if (state.players.some((player) => player.id === socket.id)) {
                this.combatService.endCombat(combatRoomCode);
            }
        }
    }

    getSocketById(socketId: string): Socket | undefined {
        return this.server.sockets.sockets.get(socketId);
    }

    emitToCombatRoom<T>(combatRoomCode: string, event: string, payload: T): void {
        this.server.to(combatRoomCode).emit(event, payload);
    }

    emitToPlayer<T>(playerId: string, event: string, payload?: T): void {
        const socket = this.getSocketById(playerId);
        if (socket) {
            socket.emit(event, payload);
        }
    }
}
