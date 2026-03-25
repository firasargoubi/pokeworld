import { CombatService } from '@app/services/combat/combat.service';
import { MatchService } from '@app/services/match/match.service';
import { UserService } from '@app/services/user/user.service';
import { CombatEvent } from '@common/interfaces/socket-event.enum';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class CombatGateway {
    @WebSocketServer() private server: Server;
    @Inject(forwardRef(() => MatchService)) private readonly matchService: MatchService;
    @Inject(forwardRef(() => CombatService)) private readonly combatService: CombatService;
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService;

    @SubscribeMessage(CombatEvent.Attack)
    attack(socket: Socket) {
        const playerId = this.userService.resolvePlayerId(socket);
        const match = this.matchService.getMatchFromPlayerId(playerId);
        if (match) {
            this.combatService.attack(match, playerId);
        }
    }

    @SubscribeMessage(CombatEvent.Escape)
    escape(socket: Socket) {
        const playerId = this.userService.resolvePlayerId(socket);
        const match = this.matchService.getMatchFromPlayerId(playerId);
        if (match) {
            this.combatService.escape(match, playerId);
        }
    }
}
