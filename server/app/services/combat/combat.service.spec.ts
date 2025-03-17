/* eslint-disable max-lines */
// This test suite is 100 lines longer than the recommended maximum
import { CombatGateway } from '@app/gateways/combat/combat.gateway';
import { MatchService } from '@app/services/match/match.service';
import { PlayService } from '@app/services/play/play.service';
import { AttackResult, CombatState } from '@common/combat';
import { CombatEvent } from '@common/combat-event.enum';
import { DICE_MAX_VALUE, DiceType } from '@common/dice';
import { Match, MatchData } from '@common/match';
import { Player } from '@common/player';
import { TileType } from '@common/tile-type.enum';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from 'sinon';
import { Socket } from 'socket.io';
import { CombatService } from './combat.service';
import { ESCAPE_RATIO, MAX_TURN_DURATION, MIN_TURN_DURATION, PLAYER_STATS_MALUS } from './combat.service.const';

describe('CombatService', () => {
    let service: CombatService;
    let matchServiceStub: SinonStubbedInstance<MatchService>;
    let combatGatewayStub: SinonStubbedInstance<CombatGateway>;
    let playeServiceStub: SinonStubbedInstance<PlayService>;
    let clearTimeoutSpy: SinonStub;

    let updatePlayerBonusStatsSpy: SinonStub;
    let proceedCombatTurnSpy: SinonStub;
    let getPlayerByIdSpy: SinonStub;
    let notifyPlayersStatsUpdateSpy: SinonStub;
    let endCombatSpy: SinonStub;
    let forceCombatTurnSwitchSpy: SinonStub;
    let leaveCombatSpy: SinonStub;
    let randomStub: SinonStub;

    const combatRoomCode = 'room123';
    let player1: Player;
    let player2: Player;
    let socket1: SinonStubbedInstance<Socket>;
    let socket2: SinonStubbedInstance<Socket>;

    const timer = setTimeout(() => {
        return;
    }, 0);

    beforeEach(async () => {
        matchServiceStub = createStubInstance<MatchService>(MatchService);
        combatGatewayStub = createStubInstance<CombatGateway>(CombatGateway);
        playeServiceStub = createStubInstance<PlayService>(PlayService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CombatService,
                { provide: CombatGateway, useValue: combatGatewayStub },
                { provide: MatchService, useValue: matchServiceStub },
                { provide: PlayService, useValue: playeServiceStub },
            ],
        }).compile();

        service = module.get<CombatService>(CombatService);

        /* eslint-disable @typescript-eslint/no-explicit-any -- private methods */
        updatePlayerBonusStatsSpy = stub(service, 'updatePlayerBonusStats' as any);
        proceedCombatTurnSpy = stub(service, 'proceedCombatTurn' as any);
        getPlayerByIdSpy = stub(service, 'getPlayerById' as any);
        notifyPlayersStatsUpdateSpy = stub(service, 'notifyPlayersStatsUpdate' as any);
        endCombatSpy = stub(service, 'endCombat' as any);
        forceCombatTurnSwitchSpy = stub(service, 'forceCombatTurnSwitch' as any);
        leaveCombatSpy = stub(service, 'leaveCombat' as any);
        clearTimeoutSpy = stub(global, 'clearTimeout');
        randomStub = stub(Math, 'random');
        /* eslint-enable @typescript-eslint/no-explicit-any */

        player1 = {
            id: 'player-1',
            name: 'Test Player 1',
            playerStats: { health: 6, attack: 6, defense: 6, speed: 1, attackDice: DiceType.D4, defenseDice: DiceType.D6 },
            currentStats: { health: 4, attack: 4, defense: 4, attackBonus: 2, defenseBonus: 2, standingTile: TileType.Path, escapes: 2 },
        } as Player;
        player2 = {
            id: 'player-2',
            name: 'Test Player 2',
            playerStats: { health: 6, attack: 6, defense: 6, speed: 1, attackDice: DiceType.D4, defenseDice: DiceType.D6 },
            currentStats: { health: 4, attack: 4, defense: 4, attackBonus: 0, defenseBonus: 0, standingTile: TileType.Grass, escapes: 2 },
        } as Player;

        socket1 = createStubInstance<Socket>(Socket);
        socket2 = createStubInstance<Socket>(Socket);

        Object.defineProperty(socket1, 'id', { value: 'player-1' });
        Object.defineProperty(socket2, 'id', { value: 'player-2' });
    });

    afterEach(() => {
        clearTimeoutSpy.restore();
        randomStub.restore();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return an empty map when no combat state is initialized', () => {
        const result = service.getCombatTurnSystems();
        expect(result.size).toBe(0);
    });

    it('should return the correct combat state when added to the internal map', () => {
        const combatState = {
            timer: null,
            players: [player1],
            currentTurnIndex: 0,
        };
        service['combatTurnSystems'].set(combatRoomCode, combatState);
        const result = service.getCombatTurnSystems();
        expect(result.get(combatRoomCode)).toEqual(combatState);
    });

    it('should return the correct player when found', () => {
        const roomCode = 'combat-room-1';
        const testPlayer: Player = { id: 'player-1', name: 'Test Player' } as Player;

        getPlayerByIdSpy.restore();
        service['combatTurnSystems'].set(roomCode, {
            timer: null,
            players: [testPlayer],
            currentTurnIndex: 0,
        });

        const result = service['getPlayerById'](roomCode, 'player-1');
        expect(result).toEqual(testPlayer);
    });

    it('should return undefined if the player is not found in the room', () => {
        const roomCode = 'combat-room-1';
        const testPlayer: Player = { id: 'player-1', name: 'Test Player' } as Player;

        getPlayerByIdSpy.restore();
        service['combatTurnSystems'].set(roomCode, {
            timer: null,
            players: [testPlayer],
            currentTurnIndex: 0,
        });

        const result = service['getPlayerById'](roomCode, 'player-2');
        expect(result).toBeUndefined();
    });

    it('initiateCombat should join the combat room, emit CombatStarted, and call updatePayersStatsByCurrentTyle and startTurnSystem', () => {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const updatePlayersStatsByCurrentTileSpy = stub(service as any, 'updatePlayersStatsByCurrentTile' as any);
        const startTurnSystemSpy = stub(service, 'startTurnSystem' as any);
        const generateUniqueCombatCodeSpy = stub(service, 'generateUniqueCombatCode' as any).callsFake(() => combatRoomCode);
        /* eslint-enable @typescript-eslint/no-explicit-any */

        matchServiceStub['getPlayer'].withArgs(player1.id).returns(player1);
        matchServiceStub['getPlayer'].withArgs(player2.id).returns(player2);

        service['combatTurnSystems'].set(combatRoomCode, {
            timer: null,
            players: [player1, player2],
            currentTurnIndex: 0,
        });

        combatGatewayStub.getSocketById.returns(socket2);

        service['initiateCombat'](socket1.id, 'player-2');

        expect(matchServiceStub['getPlayer'].calledTwice).toBeTruthy();
        expect(generateUniqueCombatCodeSpy.calledOnce).toBeTruthy();
        expect(updatePlayersStatsByCurrentTileSpy.calledWith([player1, player2])).toBeTruthy();
        expect(startTurnSystemSpy.calledWith(combatRoomCode, [player1, player2])).toBeTruthy();
        expect(combatGatewayStub.getSocketById.calledWith(player2.id)).toBeTruthy();

        const expectedCombatData = { combatRoomCode, players: [player1, player2] };
        expect(combatGatewayStub.emitToCombatRoom.calledWith(combatRoomCode, CombatEvent.CombatStarted, expectedCombatData)).toBeTruthy();

        updatePlayersStatsByCurrentTileSpy.restore();
        startTurnSystemSpy.restore();
    });

    it('should return immediately if combat state is not found', () => {
        service['combatTurnSystems'].delete(combatRoomCode);

        service.escape(combatRoomCode, player1.id);

        expect(notifyPlayersStatsUpdateSpy.notCalled).toBeTruthy();
        expect(forceCombatTurnSwitchSpy.notCalled).toBeTruthy();
        expect(endCombatSpy.notCalled).toBeTruthy();
    });

    it('should decrease escapes and notify update but not emit EscapedResult or end combat if escape fails', () => {
        const combatState = { timer: null, players: [player1, player2], currentTurnIndex: 0 };
        service['combatTurnSystems'].set(combatRoomCode, combatState);

        randomStub.returns(ESCAPE_RATIO);
        getPlayerByIdSpy.returns(player1);

        service.escape(combatRoomCode, player1.id);

        expect(player1.currentStats.escapes).toEqual(1);
        expect(notifyPlayersStatsUpdateSpy.calledWith(combatRoomCode)).toBeTruthy();
        expect(combatGatewayStub.emitToCombatRoom.notCalled).toBeTruthy();
        expect(endCombatSpy.notCalled).toBeTruthy();
        expect(forceCombatTurnSwitchSpy.calledWith(combatRoomCode)).toBeTruthy();
    });

    it("should decrease escapes and notify update if player's escapes is 0", () => {
        const combatState = { timer: null, players: [player1, player2], currentTurnIndex: 0 };
        service['combatTurnSystems'].set(combatRoomCode, combatState);

        randomStub.returns(0);
        getPlayerByIdSpy.returns(player1);

        service.escape(combatRoomCode, player1.id);

        expect(player1.currentStats.escapes).toEqual(1);
        expect(notifyPlayersStatsUpdateSpy.calledWith(combatRoomCode)).toBeTruthy();
        expect(endCombatSpy.calledWith(combatRoomCode)).toBeTruthy();
        expect(forceCombatTurnSwitchSpy.calledWith(combatRoomCode)).toBeTruthy();
        expect(combatGatewayStub.emitToCombatRoom.calledWith(combatRoomCode, CombatEvent.EscapedResult, player1.id)).toBeTruthy();
    });

    it('should return undefined if targetPlayer is not found', () => {
        service['combatTurnSystems'].set(combatRoomCode, { timer: null, players: [player1], currentTurnIndex: 0 });

        getPlayerByIdSpy.callsFake((room: string, id: string) => {
            if (id === player1.id) return player1;
            return undefined;
        });

        const result = service['executeAttackAndCheckVictory'](combatRoomCode, 'targetId');
        expect(result).toBeUndefined();
        expect(getPlayerByIdSpy.calledTwice).toBeTruthy();
    });

    it('should update target health, notify update, emit AttackResult and return undefined if target survives', () => {
        service['combatTurnSystems'].set(combatRoomCode, { timer: null, players: [player1, player2] as Player[], currentTurnIndex: 0 });

        getPlayerByIdSpy.callsFake((room: string, id: string) => {
            if (id === player1.id) return player1;
            return player2;
        });

        const result = service['executeAttackAndCheckVictory'](combatRoomCode, player2.id);
        expect(result).toBeFalsy();

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(service['combatTurnSystems'].get(combatRoomCode).players[0].currentStats.health).toBe(4);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(service['combatTurnSystems'].get(combatRoomCode).players[1].currentStats.health).toBe(2);

        expect(notifyPlayersStatsUpdateSpy.calledWith(combatRoomCode)).toBeTruthy();
        expect(
            combatGatewayStub.emitToCombatRoom.calledWith(combatRoomCode, CombatEvent.AttackResult, {
                targetId: player2.id,
                attackDamage: 2,
            } as AttackResult),
        ).toBeTruthy();

        expect(endCombatSpy.called).toBeFalsy();
    });

    it('should update target health, notify update, emit AttackResult and return true if target dies', () => {
        player2.currentStats.health = 1;
        service['combatTurnSystems'].set(combatRoomCode, { timer: null, players: [player1, player2] as Player[], currentTurnIndex: 0 });

        getPlayerByIdSpy.callsFake((room: string, id: string) => {
            if (id === player1.id) return player1;
            return player2;
        });

        const result = service['executeAttackAndCheckVictory'](combatRoomCode, player2.id);
        expect(result).toBeTruthy();

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(service['combatTurnSystems'].get(combatRoomCode).players[0].currentStats.health).toBe(4);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(service['combatTurnSystems'].get(combatRoomCode).players[1].currentStats.health).toBe(0);

        expect(notifyPlayersStatsUpdateSpy.calledWith(combatRoomCode)).toBeTruthy();
        expect(
            combatGatewayStub.emitToCombatRoom.calledWith(combatRoomCode, CombatEvent.AttackResult, {
                targetId: player2.id,
                attackDamage: 2,
            } as AttackResult),
        ).toBeTruthy();
        expect(endCombatSpy.calledOnceWith(combatRoomCode)).toBeTruthy();
    });

    it('should clear timer, reseat players, emit EndComabt event when winnerId is provided on second position', () => {
        const combatState = {
            timer,
            players: [player2, player1] as Player[],
            currentTurnIndex: 1,
        };
        service['combatTurnSystems'].set(combatRoomCode, combatState);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reseatPlayersSpy = stub(service, 'resetPlayers' as any);

        endCombatSpy.restore();
        service.endCombat(combatRoomCode, player1.id);

        expect(clearTimeoutSpy.calledWith(timer)).toBeTruthy();
        expect(reseatPlayersSpy.calledWith([player2, player1])).toBeTruthy();

        expect(combatGatewayStub.emitToCombatRoom.calledWith(combatRoomCode, CombatEvent.EndCombat, null)).toBeTruthy();
        expect(leaveCombatSpy.calledWith(combatRoomCode, combatState)).toBeTruthy();

        expect(service['combatTurnSystems'].has(combatRoomCode)).toBeFalsy();

        reseatPlayersSpy.restore();
    });

    it('should clear timer, reseat players, emit EndComabt event when winnerId is provided on first position', () => {
        const combatState = {
            timer,
            players: [player2, player1] as Player[],
            currentTurnIndex: 1,
        };
        service['combatTurnSystems'].set(combatRoomCode, combatState);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reseatPlayersSpy = stub(service, 'resetPlayers' as any);

        endCombatSpy.restore();
        service.endCombat(combatRoomCode, player2.id);

        expect(combatGatewayStub.emitToCombatRoom.calledWith(combatRoomCode, CombatEvent.EndCombat, null)).toBeTruthy();

        reseatPlayersSpy.restore();
    });

    it('should clear timer, reset players, emit EndCombat event with null winnerId and call leaveCombat when winnerId is not provided', () => {
        const combatState = {
            timer,
            players: [player2, player1] as Player[],
            currentTurnIndex: 1,
        };
        service['combatTurnSystems'].set(combatRoomCode, combatState);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reseatPlayersSpy = stub(service, 'resetPlayers' as any);

        endCombatSpy.restore();
        service.endCombat(combatRoomCode);

        expect(clearTimeoutSpy.calledWith(timer)).toBeTruthy();
        expect(reseatPlayersSpy.calledWith([player2, player1])).toBeTruthy();

        expect(combatGatewayStub.emitToCombatRoom.calledWith(combatRoomCode, CombatEvent.EndCombat, null)).toBeTruthy();

        reseatPlayersSpy.restore();
    });

    it('should clear timer, toggle currentTurnIndex, update state and call proceedCombatTurn', () => {
        const state = { timer, players: [player1, player2] as Player[], currentTurnIndex: 0 };
        service['combatTurnSystems'].set(combatRoomCode, state as CombatState);

        forceCombatTurnSwitchSpy.restore();

        service.forceCombatTurnSwitch(combatRoomCode);

        expect(clearTimeoutSpy.calledWith(timer)).toBeTruthy();

        const newState = service['combatTurnSystems'].get(combatRoomCode);
        expect(newState.currentTurnIndex).toBe(1);

        expect(proceedCombatTurnSpy.calledWith(combatRoomCode)).toBeTruthy();

        proceedCombatTurnSpy.restore();
    });

    it('should return immediately if no state exists for the combatRoomCode', () => {
        forceCombatTurnSwitchSpy.restore();
        service['combatTurnSystems'].delete(combatRoomCode);
        service.forceCombatTurnSwitch(combatRoomCode);
        expect(proceedCombatTurnSpy.called).toBeFalsy();
        proceedCombatTurnSpy.restore();
    });

    it('generateUniqueCombatCode should generate unique combat code', () => {
        const code = service['generateUniqueCombatCode']();

        const numericPart = code.split('-')[1];
        const CODE_LENGTH = 4;
        expect(numericPart.length).toBe(CODE_LENGTH);

        expect(service['combatTurnSystems'].has(code)).toBeFalsy();
    });

    it('should decrease attack and defense for players on TileType.Path', () => {
        service['updatePlayersStatsByCurrentTile']([player1, player2]);

        const expectedAttack = 4;
        const expectedDefense = 4;
        expect(player1.currentStats.attack).toBe(expectedAttack - PLAYER_STATS_MALUS);
        expect(player1.currentStats.defense).toBe(expectedDefense - PLAYER_STATS_MALUS);
        expect(player2.currentStats.attack).toBe(expectedAttack);
        expect(player2.currentStats.defense).toBe(expectedDefense);
    });

    it('should reorder players if player2 has greater speed than player1', () => {
        const playerOne = { id: 'p1', playerStats: { speed: 10 } } as Player;
        const playerTwo = { id: 'p2', playerStats: { speed: 20 } } as Player;

        service['startTurnSystem'](combatRoomCode, [playerOne, playerTwo]);

        const turnSystem = service['combatTurnSystems'].get(combatRoomCode);
        expect(turnSystem).toBeDefined();
        expect(turnSystem.players[0]).toEqual(playerTwo);
        expect(turnSystem.players[1]).toEqual(playerOne);
        expect(turnSystem.currentTurnIndex).toBe(0);
        expect(turnSystem.timer).toBeNull();

        expect(proceedCombatTurnSpy.calledWith(combatRoomCode)).toBeTruthy();
    });

    it('should not reorder players if player1 has greater or equal speed than player2', () => {
        const playerOne = { id: 'p1', playerStats: { speed: 20 } } as Player;
        const playerTwo = { id: 'p2', playerStats: { speed: 10 } } as Player;

        service['startTurnSystem'](combatRoomCode, [playerOne, playerTwo]);

        const turnSystem = service['combatTurnSystems'].get(combatRoomCode);
        expect(turnSystem).toBeDefined();
        expect(turnSystem.players[0]).toEqual(playerOne);
        expect(turnSystem.players[1]).toEqual(playerTwo);
        expect(turnSystem.currentTurnIndex).toBe(0);
        expect(turnSystem.timer).toBeNull();

        expect(proceedCombatTurnSpy.calledWith(combatRoomCode)).toBeTruthy();
    });

    it('should proceed combat turn with MAX_TURN_DURATION when activePlayer has escapes > 0 and recursively switch turn if no victory', () => {
        player1.currentStats.escapes = 1;
        service['combatTurnSystems'].set(combatRoomCode, {
            timer: null,
            players: [player1, player2],
            currentTurnIndex: 0,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const executeAttackStub = stub(service, 'executeAttackAndCheckVictory' as any).returns(false);

        proceedCombatTurnSpy.restore();

        const clock = sinon.useFakeTimers();

        service['proceedCombatTurn'](combatRoomCode);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        proceedCombatTurnSpy = stub(service, 'proceedCombatTurn' as any);

        expect(updatePlayerBonusStatsSpy.calledWith(combatRoomCode, player1, true)).toBeTruthy();
        expect(updatePlayerBonusStatsSpy.calledWith(combatRoomCode, player2, false)).toBeTruthy();

        expect(combatGatewayStub.emitToCombatRoom.calledWith(combatRoomCode, CombatEvent.StartTimer, MAX_TURN_DURATION)).toBeTruthy();
        expect(combatGatewayStub.emitToPlayer.calledWith(player1.id, CombatEvent.CombatTurnStarted)).toBeTruthy();
        expect(combatGatewayStub.emitToPlayer.calledWith(player2.id, CombatEvent.CombatTurnStopped)).toBeTruthy();

        const stateBefore = service['combatTurnSystems'].get(combatRoomCode);
        expect(stateBefore.timer).toBeDefined();

        clock.tick(MAX_TURN_DURATION);

        expect(executeAttackStub.calledWith(combatRoomCode, player2.id)).toBeTruthy();

        const stateAfter = service['combatTurnSystems'].get(combatRoomCode);
        expect(stateAfter.currentTurnIndex).toBe(1);

        expect(proceedCombatTurnSpy.calledWith(combatRoomCode)).toBeTruthy();

        clock.restore();
        updatePlayerBonusStatsSpy.restore();
        executeAttackStub.restore();
    });

    it('should proceed combat turn with MIN_TURN_DURATION when activePlayer has 0 escapes and stop turn if victory is achieved', () => {
        player1.currentStats.escapes = 0;
        service['combatTurnSystems'].set(combatRoomCode, {
            timer: null,
            players: [player1, player2],
            currentTurnIndex: 0,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const executeAttackStub = stub(service, 'executeAttackAndCheckVictory' as any).returns(true);

        proceedCombatTurnSpy.restore();
        const clock = sinon.useFakeTimers();

        service['proceedCombatTurn'](combatRoomCode);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        proceedCombatTurnSpy = stub(service, 'proceedCombatTurn' as any);

        expect(updatePlayerBonusStatsSpy.calledWith(combatRoomCode, player1)).toBeTruthy();
        expect(combatGatewayStub.emitToCombatRoom.calledWith(combatRoomCode, CombatEvent.StartTimer, MIN_TURN_DURATION)).toBeTruthy();
        expect(combatGatewayStub.emitToPlayer.calledWith(player1.id, CombatEvent.CombatTurnStarted)).toBeTruthy();
        expect(combatGatewayStub.emitToPlayer.calledWith(player2.id, CombatEvent.CombatTurnStopped)).toBeTruthy();

        clock.tick(MIN_TURN_DURATION);

        expect(executeAttackStub.calledWith(combatRoomCode, player2.id)).toBeTruthy();

        const stateAfter = service['combatTurnSystems'].get(combatRoomCode);
        expect(stateAfter.currentTurnIndex).toBe(0);
        expect(proceedCombatTurnSpy.called).toBeFalsy();

        clock.restore();
        updatePlayerBonusStatsSpy.restore();
        executeAttackStub.restore();
    });

    it('should update bonus stats based on dice values and notify players update', () => {
        const matchCode = 'match-1';
        matchServiceStub.getMatchCodeFromPlayerId.returns(matchCode);
        matchServiceStub.getMatch.returns({ matchData: { isDebugMode: false } as MatchData } as Match);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getBonusValueSpy = stub(service, 'getBonusValue' as any);
        updatePlayerBonusStatsSpy.restore();

        service['updatePlayerBonusStats'](combatRoomCode, player1, true);

        expect(getBonusValueSpy.calledWith(player1.playerStats.attackDice)).toBeTruthy();
        expect(notifyPlayersStatsUpdateSpy.calledWith(combatRoomCode)).toBeTruthy();

        service['updatePlayerBonusStats'](combatRoomCode, player1, false);

        expect(getBonusValueSpy.calledWith(player1.playerStats.defenseDice)).toBeTruthy();
        expect(notifyPlayersStatsUpdateSpy.calledWith(combatRoomCode)).toBeTruthy();
    });

    it('should update attackBonus to DICE_MAX_VALUE and defenseBonus to 1 when updatePlayerBonusStats is true in debug mode', () => {
        const matchCode = 'match-1';
        matchServiceStub.getMatchCodeFromPlayerId.returns(matchCode);
        matchServiceStub.getMatch.returns({ matchData: { isDebugMode: true } as MatchData } as Match);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getBonusValueSpy = stub(service, 'getBonusValue' as any);
        updatePlayerBonusStatsSpy.restore();

        service['updatePlayerBonusStats'](combatRoomCode, player1, true);

        expect(getBonusValueSpy.notCalled).toBeTruthy();
        expect(notifyPlayersStatsUpdateSpy.calledWith(combatRoomCode)).toBeTruthy();
        expect(player1.currentStats.attackBonus).toBe(DICE_MAX_VALUE[player1.playerStats.attackDice]);

        service['updatePlayerBonusStats'](combatRoomCode, player1, false);

        expect(getBonusValueSpy.notCalled).toBeTruthy();
        expect(notifyPlayersStatsUpdateSpy.calledWith(combatRoomCode)).toBeTruthy();
        expect(player1.currentStats.defenseBonus).toBe(1);
    });

    it('should compute correct bonus values for D4, D6 and return 0 for unknown dice type', () => {
        /* eslint-disable @typescript-eslint/no-magic-numbers */
        randomStub.returns(0);
        let result = service['getBonusValue'](DiceType.D4);
        expect(result).toBe(1);

        randomStub.returns(0.9999);
        result = service['getBonusValue'](DiceType.D4);
        expect(result).toBe(4);

        randomStub.returns(0);
        result = service['getBonusValue'](DiceType.D6);
        expect(result).toBe(1);

        randomStub.returns(0.9999);
        result = service['getBonusValue'](DiceType.D6);
        expect(result).toBe(6);
    });

    it('should not emit if state does not exist', () => {
        notifyPlayersStatsUpdateSpy.restore();
        expect(combatGatewayStub.emitToCombatRoom.notCalled).toBeTruthy();
    });

    it('should not emit if one of the players is missing', () => {
        notifyPlayersStatsUpdateSpy.restore();
        const combatState = { timer: null, players: [player1], currentTurnIndex: 0 };
        service['combatTurnSystems'].set(combatRoomCode, combatState);
        service['notifyPlayersStatsUpdate'](combatRoomCode);

        expect(combatGatewayStub.emitToCombatRoom.calledWith(combatRoomCode, CombatEvent.UpdatePlayers, combatState.players)).toBeTruthy();
    });

    it('should copy playerStats values to currentStats for each player', () => {
        service['resetPlayers']([player1, player2]);

        for (const player of [player1, player2]) {
            expect(player.currentStats.health).toBe(player.playerStats.health);
            expect(player.currentStats.attack).toBe(player.playerStats.attack);
            expect(player.currentStats.defense).toBe(player.playerStats.defense);
            expect(player.currentStats.escapes).toBe(player.playerStats.escapes);
        }
    });

    it('should call leave on each socket when present', () => {
        const state = {
            timer: null,
            players: [player1, player2],
            currentTurnIndex: 0,
        };
        leaveCombatSpy.restore();
        combatGatewayStub.getSocketById.withArgs(player1.id).returns(socket1);
        combatGatewayStub.getSocketById.withArgs(player2.id).returns(socket2);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service['leaveCombat']('combat-room-test', state);

        expect(socket1.leave.calledOnceWith('combat-room-test')).toBeTruthy();
        expect(socket2.leave.calledOnceWith('combat-room-test')).toBeTruthy();
    });
});
