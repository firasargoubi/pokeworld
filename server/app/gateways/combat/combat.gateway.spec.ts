import { CombatService } from '@app/services/combat/combat.service';
import { CombatEvents } from '@common/combat-event.enum';
import { CombatState } from '@common/combat-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStub, SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { CombatGateway } from './combat.gateway';

describe('CombatGateway', () => {
    let gateway: CombatGateway;
    let mockServer: SinonStubbedInstance<Server>;
    let mockCombatService: SinonStubbedInstance<CombatService>;
    let emitStub: SinonStub;

    let socket1: SinonStubbedInstance<Socket>;
    let socket2: SinonStubbedInstance<Socket>;

    beforeEach(async () => {
        socket1 = createStubInstance<Socket>(Socket);
        socket2 = createStubInstance<Socket>(Socket);
        mockCombatService = createStubInstance<CombatService>(CombatService);
        mockServer = createStubInstance<Server>(Server);
        emitStub = stub();

        const module: TestingModule = await Test.createTestingModule({
            providers: [CombatGateway, { provide: Server, useValue: mockServer }, { provide: CombatService, useValue: mockCombatService }],
        }).compile();

        gateway = module.get<CombatGateway>(CombatGateway);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway['server'] = { to: () => ({ emit: emitStub }), sockets: { sockets: { get: () => socket1 } } } as any;

        socket1 = createStubInstance<Socket>(Socket);
        socket2 = createStubInstance<Socket>(Socket);

        Object.defineProperty(socket1, 'id', { value: 'player-1' });
        Object.defineProperty(socket2, 'id', { value: 'player-2' });
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should call initiateCombat on startCombat event', () => {
        const targetPlayerId = 'player-2';
        gateway.startCombat(socket1, targetPlayerId);
        expect(mockCombatService.initiateCombat.calledWith(socket1, targetPlayerId)).toBeTruthy();
    });

    it('should call escape on escapeAttempt event', () => {
        const payload = { combatRoomCode: 'room123', playerId: 'player-1' };
        gateway.escapeAttempt(null, payload);
        expect(mockCombatService.escape.calledWith(payload.combatRoomCode, payload.playerId)).toBeTruthy();
    });

    it('should call executeAttackAndCheckVictory and forceCombatTurnSwitch on attackAttempt event', () => {
        const payload = { combatRoomCode: 'room123', targetId: 'player-2' };
        gateway.attackAttempt(null, payload);
        expect(mockCombatService.executeAttackAndCheckVictory.calledWith(payload.combatRoomCode, payload.targetId)).toBeTruthy();
        expect(mockCombatService.forceCombatTurnSwitch.calledWith(payload.combatRoomCode)).toBeTruthy();
    });

    it('should call endCombat on handleDisconnect if socket is found in a combat room', () => {
        const combatRoomCode = 'room123';
        const fakeCombatState = { timer: null, players: [{ id: socket1.id || 'test-socket-id' }], currentTurnIndex: 0 } as CombatState;
        mockCombatService.getCombatTurnSystems.returns(new Map([[combatRoomCode, fakeCombatState]]));

        gateway.handleDisconnect(socket1);

        expect(mockCombatService.endCombat.calledWith(combatRoomCode)).toBeTruthy();
    });

    it('should return a socket by id using getSocketById', () => {
        const socket = gateway.getSocketById('test-socket-id');
        expect(socket).toEqual(socket1);
    });

    it('should emit an event to a combat room using emitToCombatRoom', () => {
        const combatRoomCode = 'room123';
        const event = CombatEvents.EscapeAttempt;
        const payload = { test: 'data' };
        gateway.emitToCombatRoom(combatRoomCode, event, payload);
        expect(emitStub.calledWith(event, payload)).toBeTruthy();
    });

    it('should emit an event to a player using emitToPlayer when socket exists', () => {
        socket1.emit = stub();
        gateway.emitToPlayer('test-socket-id', CombatEvents.AttackAttempt, { data: 123 });
        expect(socket1.emit.calledWith(CombatEvents.AttackAttempt, { data: 123 })).toBeTruthy();
    });

    it('should not emit an event in emitToPlayer if socket is not found', () => {
        stub(gateway, 'getSocketById').returns(null);
        gateway.emitToPlayer('non-existent-socket', CombatEvents.AttackAttempt, { data: 123 });
        expect(socket1.emit.notCalled).toBeTruthy();
    });
});
