/* eslint-disable max-lines */
import { CombatEvent } from '@common/combat-event.enum';
import { TurnEvent } from '@common/turn-event.enum';
import { Player } from '@common/player';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { createStubInstance, SinonStub, SinonStubbedInstance, spy, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { CombatGateway } from './combat.gateway';
import { MOCK_PLAYERS } from '@app/consts/tests/mock-matches';
import { MatchService } from '@app/services/match/match.service';

describe('CombatGateway', () => {
    let gateway: CombatGateway;
    let mockSocket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let mockMatchService: SinonStubbedInstance<MatchService>;

    let updatePlayerBonusStatsSpy: SinonStub;
    let proceedCombatTurnSpy: SinonStub;
    let notifyPlayersStatsUpdateSpy: SinonStub;
    let endCombatSpy: SinonStub;
    let forceCombatTurnSwitchSpy: SinonStub;
    const emitSpy = spy();

    const combatRoomCode = 'room123';
    let player1: Player;
    let player2: Player;
    let socket1: SinonStubbedInstance<Socket>;
    let socket2: SinonStubbedInstance<Socket>;

    // const timer = setTimeout(() => {
    //     return;
    // }, 0);

    beforeEach(async () => {
        mockSocket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        mockMatchService = createStubInstance<MatchService>(MatchService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [CombatGateway, { provide: MatchService, useValue: mockMatchService }],
        }).compile();
        gateway = module.get<CombatGateway>(CombatGateway);
        gateway['combatTurnSystems'] = new Map();
        gateway['server'] = server;

        socket1 = createStubInstance<Socket>(Socket);
        socket2 = createStubInstance<Socket>(Socket);
        Object.defineProperty(socket1, 'id', { value: 'player1' });
        Object.defineProperty(server, 'sockets', {
            configurable: true,
            value: {
                sockets: new Map([
                    ['player-1', socket1],
                    ['player-2', socket2],
                ]),
            },
        });

        /* eslint-disable @typescript-eslint/no-explicit-any -- private methods */
        updatePlayerBonusStatsSpy = stub(gateway, 'updatePlayerBonusStats' as any);
        proceedCombatTurnSpy = stub(gateway, 'proceedCombatTurn' as any);
        notifyPlayersStatsUpdateSpy = stub(gateway, 'notifyPlayersStatsUpdate' as any);
        endCombatSpy = stub(gateway, 'endCombat' as any);
        forceCombatTurnSwitchSpy = stub(gateway, 'forceCombatTurnSwitch' as any);
        server.to.returns({ emit: emitSpy } as any);
        /* eslint-enable @typescript-eslint/no-explicit-any */

        player1 = structuredClone(MOCK_PLAYERS[0]);
        player2 = structuredClone(MOCK_PLAYERS[1]);
    });

    it('handleDisconnect should call endCombat for the corresponding room', () => {
        Object.defineProperty(mockSocket, 'id', { value: 'test-mockSocket-id' });
        gateway['combatTurnSystems'].set('combat-room-1', {
            timer: null,
            players: [{ id: 'test-mockSocket-id', name: 'Test Player' } as Player],
            currentTurnIndex: 0,
        });

        gateway.handleDisconnect(mockSocket);
        expect(endCombatSpy.calledWith('combat-room-1')).toBeTruthy();

        endCombatSpy.restore();
    });

    // it('startCombat should call initiateCombat with the targetPlayerId from payload', () => {
    //     const targetId = 'player-1';
    //     const dummySocket = createStubInstance(Socket);

    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     const initiateCombatStub = stub(gateway as any, 'initiateCombat');

    //     gateway.startCombat(dummySocket, targetId);
    //     expect(initiateCombatStub.calledWith(dummySocket, targetId)).toBeTruthy();

    //     initiateCombatStub.restore();
    // });

    it('escapeAttempt should call escape with the combatRoomCode and playerId from payload', () => {
        const playerId = 'player-1';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const escapeSpy = spy(gateway as any, 'escape');

        gateway.escapeAttempt(undefined, { combatRoomCode, playerId });
        expect(escapeSpy.calledWith(combatRoomCode, playerId)).toBeTruthy();

        escapeSpy.restore();
    });

    it('attackAttempt should call executeAttackAndCheckVictory and forceCombatTurnSwitch with the given combatRoomCode and targetId', () => {
        const targetId = 'target-1';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const attackSpy = spy(gateway as any, 'executeAttackAndCheckVictory');

        gateway.attackAttempt(undefined, { combatRoomCode, targetId });

        expect(attackSpy.calledWith(combatRoomCode, targetId)).toBeTruthy();
        expect(forceCombatTurnSwitchSpy.calledWith(combatRoomCode)).toBeTruthy();

        attackSpy.restore();
        forceCombatTurnSwitchSpy.restore();
    });

    it('initiateCombat should join the combat room, emit CombatStarted, and call updatePayersStatsByCurrentTyle and startTurnSystem', () => {
        const player: Player = { id: 'player-1', name: 'Test Player 1' } as Player;

        /* eslint-disable @typescript-eslint/no-explicit-any */
        const updatePlayersStatsByCurrentTileSpy = stub(gateway as any, 'updatePlayersStatsByCurrentTile' as any);
        const startTurnSystemSpy = stub(gateway, 'startTurnSystem' as any);
        const generateUniqueCombatCodeSpy = stub(gateway, 'generateUniqueCombatCode' as any).callsFake(() => combatRoomCode);
        /* eslint-enable @typescript-eslint/no-explicit-any */

        mockMatchService['getPlayer'].returns(player);

        gateway['combatTurnSystems'].set(combatRoomCode, {
            timer: null,
            players: [player1, player2],
            currentTurnIndex: 0,
        });

        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(TurnEvent.CombatStarted);
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway['initiateCombat'](mockSocket, 'player-1');

        expect(mockMatchService['getPlayer'].calledWith('player-1')).toBeTruthy();
        expect(generateUniqueCombatCodeSpy.calledOnce).toBeTruthy();
        expect(updatePlayersStatsByCurrentTileSpy.calledWith([player, player])).toBeTruthy();
        expect(startTurnSystemSpy.calledWith(combatRoomCode, [player, player])).toBeTruthy();

        updatePlayersStatsByCurrentTileSpy.restore();
        startTurnSystemSpy.restore();
    });

    it('generateUniqueCombatCode should generate unique combat code', () => {
        const code = gateway['generateUniqueCombatCode']();
        expect(code).toMatch(/^combat-\d+$/);

        const numericPart = code.split('-')[1];
        const CODE_LENGTH = 4;
        expect(numericPart.length).toBe(CODE_LENGTH);

        expect(gateway['combatTurnSystems'].has(code)).toBeFalsy();
    });

    // it('should decrease attack and defense for players on TileType.Path', () => {
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
    //     gateway['updatePlayersStatsByCurrentTile']([player1, player2]);

    //     expect(player1.currentStats.attack).toBe(2);
    //     expect(player1.currentStats.defense).toBe(2);
    //     // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    //     expect(player2.currentStats.attack).toBe(4);
    //     // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    //     expect(player2.currentStats.defense).toBe(4);
    // });

    it('should reorder players if player2 has greater speed than player1', () => {
        const playerOne = { id: 'p1', playerStats: { speed: 10 } } as Player;
        const playerTwo = { id: 'p2', playerStats: { speed: 20 } } as Player;

        gateway['startTurnSystem'](combatRoomCode, [playerOne, playerTwo]);

        const turnSystem = gateway['combatTurnSystems'].get(combatRoomCode);
        expect(turnSystem).toBeDefined();
        expect(turnSystem.players[0]).toEqual(playerTwo);
        expect(turnSystem.players[1]).toEqual(playerOne);
        expect(turnSystem.currentTurnIndex).toBe(0);
        expect(turnSystem.timer).toBeNull();

        expect(updatePlayerBonusStatsSpy.calledWith(combatRoomCode, playerOne)).toBeTruthy();
        expect(proceedCombatTurnSpy.calledWith(combatRoomCode)).toBeTruthy();
    });

    it('should not reorder players if player1 has greater or equal speed than player2', () => {
        const playerOne = { id: 'p1', playerStats: { speed: 20 } } as Player;
        const playerTwo = { id: 'p2', playerStats: { speed: 10 } } as Player;

        gateway['startTurnSystem'](combatRoomCode, [playerOne, playerTwo]);

        const turnSystem = gateway['combatTurnSystems'].get(combatRoomCode);
        expect(turnSystem).toBeDefined();
        expect(turnSystem.players[0]).toEqual(playerOne);
        expect(turnSystem.players[1]).toEqual(playerTwo);
        expect(turnSystem.currentTurnIndex).toBe(0);
        expect(turnSystem.timer).toBeNull();

        expect(updatePlayerBonusStatsSpy.calledWith(combatRoomCode, playerTwo)).toBeTruthy();
        expect(proceedCombatTurnSpy.calledWith(combatRoomCode)).toBeTruthy();
    });

    it('should return immediately if no state exists for the combatRoomCode', () => {
        gateway['combatTurnSystems'] = new Map();
        gateway['escape'](combatRoomCode, player1.id);

        // Aucune méthode ne doit être appelée
        expect(endCombatSpy.called).toBeFalsy();
        expect(forceCombatTurnSwitchSpy.called).toBeFalsy();
    });

    // it('should decrement escapes and notify update when escape attempt fails', () => {
    //     const player = { id: player1.id, currentStats: { escapes: 2 } } as Player;
    //     gateway['combatTurnSystems'].set(combatRoomCode, { timer: null, players: [player], currentTurnIndex: 0 });

    //     // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    //     const mathRandomStub = stub(Math, 'random').returns(0.999);
    //     gateway['escape'](combatRoomCode, player.id);

    //     expect(player.currentStats.escapes).toBe(1);
    //     expect(notifyPlayersStatsUpdateSpy.calledOnceWith(combatRoomCode)).toBeTruthy();
    //     expect(endCombatSpy.called).toBeFalsy();
    //     expect(forceCombatTurnSwitchSpy.calledOnceWith(combatRoomCode)).toBeTruthy();

    //     mathRandomStub.restore();
    // });

    // it('should call endCombat and notify update when escape attempt succeeds', () => {
    //     const player = { id: player1.id, currentStats: { escapes: 2 } } as Player;
    //     gateway['combatTurnSystems'].set(combatRoomCode, { timer: null, players: [player], currentTurnIndex: 0 });

    //     // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    //     const mathRandomStub = stub(Math, 'random').returns(0.001);

    //     gateway['escape'](combatRoomCode, player.id);

    //     expect(player.currentStats.escapes).toBe(1);
    //     expect(notifyPlayersStatsUpdateSpy.calledOnceWith(combatRoomCode)).toBeTruthy();

    //     expect(emitSpy.calledWith(CombatEvent.EscapedResult, player.id)).toBeTruthy();
    //     expect(endCombatSpy.calledOnceWith(combatRoomCode)).toBeTruthy();

    //     mathRandomStub.restore();
    // });

    it('should return true if no state exists for the combatRoomCode', () => {
        const result = gateway['executeAttackAndCheckVictory'](combatRoomCode, 'targetId');
        expect(result).toBeUndefined();
    });

    // it('should compute correct bonus values for D4, D6 and return 0 for unknown dice type', () => {
    //     /* eslint-disable @typescript-eslint/no-magic-numbers */
    //     const mathRandomStub = stub(Math, 'random').returns(0);
    //     let result = gateway['getBonusValue'](DiceType.D4);
    //     expect(result).toBe(1);

    //     mathRandomStub.returns(0.9999);
    //     result = gateway['getBonusValue'](DiceType.D4);
    //     expect(result).toBe(4);

    //     mathRandomStub.returns(0);
    //     result = gateway['getBonusValue'](DiceType.D6);
    //     expect(result).toBe(1);

    //     mathRandomStub.returns(0.9999);
    //     result = gateway['getBonusValue'](DiceType.D6);
    //     expect(result).toBe(6);

    //     mathRandomStub.restore();
    //     /* eslint-enable @typescript-eslint/no-magic-numbers */
    // });

    it('should update bonus stats based on dice values and notify players update', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getBonusValueSpy = stub(gateway, 'getBonusValue' as any);
        updatePlayerBonusStatsSpy.restore();

        gateway['updatePlayerBonusStats'](combatRoomCode, player1);

        expect(getBonusValueSpy.calledTwice).toBeTruthy();
        expect(notifyPlayersStatsUpdateSpy.calledWith(combatRoomCode)).toBeTruthy();
    });
    it('should copy playerStats values to currentStats for each player', () => {
        gateway['resetPlayers']([player1, player2]);

        for (const player of [player1, player2]) {
            expect(player.currentStats.health).toBe(player.playerStats.health);
            expect(player.currentStats.attack).toBe(player.playerStats.attack);
            expect(player.currentStats.defense).toBe(player.playerStats.defense);
            expect(player.currentStats.escapes).toBe(player.playerStats.escapes);
        }
    });

    it('should not emit if state does not exist', () => {
        notifyPlayersStatsUpdateSpy.restore();
        gateway['notifyPlayersStatsUpdate'](combatRoomCode);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        server.to.returns({ emit: emitSpy } as any);
        expect(emitSpy.calledOnce).toBeFalsy();
    });

    // it('should not emit if one of the players is missing', () => {
    //     notifyPlayersStatsUpdateSpy.restore();
    //     gateway['combatTurnSystems'].set(combatRoomCode, { timer: null, players: [player1, player2] as Player[], currentTurnIndex: 0 });
    //     gateway['notifyPlayersStatsUpdate'](combatRoomCode);

    //     expect(emitSpy.calledOnce).toBeFalsy();
    // });

    it('should return immediately if no state exists for the combatRoomCode', () => {
        gateway['combatTurnSystems'].delete(combatRoomCode);
        endCombatSpy.restore();
        gateway['endCombat'](combatRoomCode);
        expect(server.to.called).toBeFalsy();
    });

    // it('should clear timer, reseat players, emit EndComabt event, delete state and make sockets leave when winnerId is provided', () => {
    //     gateway['combatTurnSystems'].set(combatRoomCode, {
    //         timer,
    //         players: [player1, player2] as Player[],
    //         currentTurnIndex: 0,
    //     });
    //     const clearTimeoutSpy = spy(global, 'clearTimeout');
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     const resetPlayersSpy = stub(gateway, 'resetPlayers' as any);

    //     endCombatSpy.restore();
    //     gateway['endCombat'](combatRoomCode, player1.id);

    //     expect(clearTimeoutSpy.calledWith(timer)).toBeTruthy();
    //     expect(resetPlayersSpy.calledWith([player1, player2])).toBeTruthy();

    //     const expectedCombatResult = { winnerId: player1.id, loserId: player2.id };

    //     expect(server.to.calledWith(combatRoomCode)).toBeTruthy();
    //     expect(emitSpy.calledWith(CombatEvent.EndCombat, expectedCombatResult)).toBeTruthy();

    //     expect(gateway['combatTurnSystems'].has(combatRoomCode)).toBeFalsy();
    //     expect(socket1.leave.calledWith(combatRoomCode)).toBeTruthy();
    //     expect(socket2.leave.calledWith(combatRoomCode)).toBeTruthy();

    //     clearTimeoutSpy.restore();
    //     resetPlayersSpy.restore();
    // });

    // it('should clear timer, reseat players, emit EndCombat event with null winner/loser and delete state when winnerId is not provided', () => {
    //     gateway['combatTurnSystems'].set(combatRoomCode, {
    //         timer,
    //         players: [player1, player2] as Player[],
    //         currentTurnIndex: 0,
    //     });
    //     const clearTimeoutSpy = spy(global, 'clearTimeout');
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     const resetPlayersSpy = stub(gateway, 'resetPlayers' as any);

    //     const socket3 = createStubInstance<Socket>(Socket);
    //     Object.defineProperty(socket3, 'id', { value: 'player-1' });
    //     Object.defineProperty(server, 'sockets', {
    //         value: {
    //             sockets: new Map([['player-1', socket3]]),
    //         },
    //     });

    //     endCombatSpy.restore();
    //     gateway['endCombat'](combatRoomCode);

    //     const expectedCombatResult = { winnerId: null, loserId: null };

    //     expect(clearTimeoutSpy.calledWith(timer)).toBeTruthy();
    //     expect(resetPlayersSpy.calledWith([player1, player2])).toBeTruthy();
    //     expect(server.to.calledWith(combatRoomCode)).toBeTruthy();
    //     expect(emitSpy.calledWith(CombatEvent.EndCombat, expectedCombatResult)).toBeTruthy();
    //     expect(gateway['combatTurnSystems'].has(combatRoomCode)).toBeFalsy();
    //     expect(socket3.leave.calledWith(combatRoomCode)).toBeTruthy();

    //     clearTimeoutSpy.restore();
    //     resetPlayersSpy.restore();
    // });

    it('should proceed combat turn with MAX_TURN_DURATION when activePlayer has escapes > 0 and recursively switch turn if no victory', () => {
        player1.currentStats.escapes = 1;
        gateway['combatTurnSystems'].set(combatRoomCode, {
            timer: null,
            players: [player1, player2],
            currentTurnIndex: 0,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const executeAttackStub = stub(gateway, 'executeAttackAndCheckVictory' as any).returns(false);

        proceedCombatTurnSpy.restore();

        const MAX_TURN_DURATION = 5000;

        const clock = sinon.useFakeTimers();

        gateway['proceedCombatTurn'](combatRoomCode);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        proceedCombatTurnSpy = stub(gateway, 'proceedCombatTurn' as any);

        expect(updatePlayerBonusStatsSpy.calledWith(combatRoomCode, player1)).toBeTruthy();
        expect(emitSpy.calledWith(CombatEvent.StartTimer, MAX_TURN_DURATION)).toBeTruthy();
        expect(server.to.calledWith(player1.id)).toBeTruthy();
        expect(server.to.calledWith(player2.id)).toBeTruthy();

        const stateBefore = gateway['combatTurnSystems'].get(combatRoomCode);
        expect(stateBefore.timer).toBeDefined();

        clock.tick(MAX_TURN_DURATION);

        expect(executeAttackStub.calledWith(combatRoomCode, player2.id)).toBeTruthy();

        const stateAfter = gateway['combatTurnSystems'].get(combatRoomCode);
        expect(stateAfter.currentTurnIndex).toBe(1);

        expect(proceedCombatTurnSpy.calledWith(combatRoomCode)).toBeTruthy();

        clock.restore();
        updatePlayerBonusStatsSpy.restore();
        executeAttackStub.restore();
    });

    it('should proceed combat turn with MIN_TURN_DURATION when activePlayer has 0 escapes and stop turn if victory is achieved', () => {
        player1.currentStats.escapes = 0;
        gateway['combatTurnSystems'].set(combatRoomCode, {
            timer: null,
            players: [player1, player2],
            currentTurnIndex: 0,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const executeAttackStub = stub(gateway, 'executeAttackAndCheckVictory' as any).returns(true);

        proceedCombatTurnSpy.restore();
        const MIN_TURN_DURATION = 3000;
        const clock = sinon.useFakeTimers();

        gateway['proceedCombatTurn'](combatRoomCode);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        proceedCombatTurnSpy = stub(gateway, 'proceedCombatTurn' as any);

        expect(updatePlayerBonusStatsSpy.calledWith(combatRoomCode, player1)).toBeTruthy();
        expect(emitSpy.calledWith(CombatEvent.StartTimer, MIN_TURN_DURATION)).toBeTruthy();
        expect(server.to.calledWith(player1.id)).toBeTruthy();
        expect(server.to.calledWith(player2.id)).toBeTruthy();

        clock.tick(MIN_TURN_DURATION);

        expect(executeAttackStub.calledWith(combatRoomCode, player2.id)).toBeTruthy();

        const stateAfter = gateway['combatTurnSystems'].get(combatRoomCode);
        expect(stateAfter.currentTurnIndex).toBe(0);
        expect(proceedCombatTurnSpy.called).toBeFalsy();

        clock.restore();
        updatePlayerBonusStatsSpy.restore();
        executeAttackStub.restore();
    });

    // it('should clear timer, toggle currentTurnIndex, update state and call proceedCombatTurn', () => {
    //     const state = { timer, players: [player1, player2] as Player[], currentTurnIndex: 0 };
    //     gateway['combatTurnSystems'].set(combatRoomCode, state as CombatState);

    //     const clearTimeoutSpy = spy(global, 'clearTimeout');
    //     forceCombatTurnSwitchSpy.restore();

    //     gateway['forceCombatTurnSwitch'](combatRoomCode);

    //     expect(clearTimeoutSpy.calledWith(timer)).toBeTruthy();

    //     const newState = gateway['combatTurnSystems'].get(combatRoomCode);
    //     expect(newState.currentTurnIndex).toBe(1);

    //     expect(proceedCombatTurnSpy.calledWith(combatRoomCode)).toBeTruthy();

    //     clearTimeoutSpy.restore();
    //     proceedCombatTurnSpy.restore();
    // });

    it('should return immediately if no state exists for the combatRoomCode', () => {
        forceCombatTurnSwitchSpy.restore();
        gateway['combatTurnSystems'].delete(combatRoomCode);
        gateway['forceCombatTurnSwitch'](combatRoomCode);
        expect(proceedCombatTurnSpy.called).toBeFalsy();
        proceedCombatTurnSpy.restore();
    });

    // it('should clear timer, reseat players, emit EndComabt event when winnerId is provided on second position', () => {
    //     gateway['combatTurnSystems'].set(combatRoomCode, {
    //         timer,
    //         players: [player2, player1] as Player[],
    //         currentTurnIndex: 1,
    //     });
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     const reseatPlayersSpy = stub(gateway, 'resetPlayers' as any);
    //     const clearTimeoutSpy = spy(global, 'clearTimeout');

    //     endCombatSpy.restore();
    //     gateway['endCombat'](combatRoomCode, player1.id);

    //     expect(clearTimeoutSpy.calledWith(timer)).toBeTruthy();
    //     expect(reseatPlayersSpy.calledWith([player2, player1])).toBeTruthy();

    //     const expectedCombatResult = { winnerId: player1.id, loserId: player2.id };

    //     expect(server.to.calledWith(combatRoomCode)).toBeTruthy();
    //     expect(emitSpy.calledWith(CombatEvent.EndCombat, expectedCombatResult)).toBeTruthy();

    //     expect(gateway['combatTurnSystems'].has(combatRoomCode)).toBeFalsy();
    //     expect(socket1.leave.calledWith(combatRoomCode)).toBeTruthy();
    //     expect(socket2.leave.calledWith(combatRoomCode)).toBeTruthy();

    //     clearTimeoutSpy.restore();
    //     reseatPlayersSpy.restore();
    // });
});
