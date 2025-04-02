import { Match } from '@app/classes/match/match';
import { MapService } from '@app/services/map/map.service';
import { PlayService } from '@app/services/play/play.service';
import { ItemType } from '@common/interfaces/item-type.enum';
import { CombatAction, MatchState } from '@common/interfaces/match-data';
import { DiceType } from '@common/interfaces/player-data';
import { TileType } from '@common/interfaces/tile-type.enum';
import { MOCK_MATCH_DATAS, MOCK_PLAYER_COMBAT_DATAS } from '@common/test-consts/mock-matches';
import { MOCK_PLAYER_DATAS } from '@common/test-consts/mock-players';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonSandbox, SinonStubbedInstance, createSandbox, createStubInstance } from 'sinon';
import { CombatService } from './combat.service';

describe('CombatService', () => {
    let service: CombatService;
    let sandbox: SinonSandbox;
    let mockMapService: SinonStubbedInstance<MapService>;
    let mockPlayService: SinonStubbedInstance<PlayService>;
    let mockMatch: SinonStubbedInstance<Match>;

    beforeAll(async () => {
        sandbox = createSandbox();
        mockMapService = createStubInstance(MapService);
        mockPlayService = createStubInstance(PlayService);
        mockMatch = createStubInstance(Match);

        const module: TestingModule = await Test.createTestingModule({
            providers: [CombatService, { provide: MapService, useValue: mockMapService }, { provide: PlayService, useValue: mockPlayService }],
        }).compile();

        service = module.get<CombatService>(CombatService);
    });

    beforeEach(() => {
        mockMatch.data = structuredClone(MOCK_MATCH_DATAS[0]);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('attack should start animation if player can act', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'canPlayerAct').returns(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startAttackAnimationStub = sandbox.stub(service as any, 'startAttackAnimation');

        service.attack(mockMatch, 'player1');

        expect(startAttackAnimationStub.calledWith(mockMatch)).toBe(true);
    });

    it('escape should start animation if player can act', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'canPlayerAct').returns(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startEscapeAnimationStub = sandbox.stub(service as any, 'startEscapeAnimation');

        service.escape(mockMatch, 'player1');

        expect(startEscapeAnimationStub.calledWith(mockMatch)).toBe(true);
    });

    it('start combat should initialize combat data', () => {
        mockMatch.getPlayer.withArgs('player1').returns({ ...structuredClone(MOCK_PLAYER_DATAS[0]), speed: 5 });
        mockMatch.getPlayer.withArgs('player2').returns({ ...structuredClone(MOCK_PLAYER_DATAS[1]), speed: 6 });
        mockMatch.getPlayerIndex.withArgs('player1').returns(0);
        mockMatch.getPlayerIndex.withArgs('player2').returns(1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startCombatWaitStub = sandbox.stub(service as any, 'startCombatWait');

        service.startCombat(mockMatch, 'player1', 'player2');

        expect(mockMatch.data.combatData.playersCombatData.length).toBe(2);
        expect(mockMatch.data.combatData.isSecondPlayerTurn).toBe(true);
        expect(startCombatWaitStub.calledWith(mockMatch)).toBe(true);
    });

    it('start combat end death should continue turn', () => {
        mockMatch.data.combatData.playersCombatData = [
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]), playerIndex: 0 },
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[1]), playerIndex: 1 },
        ];
        mockMatch.data.combatData.isSecondPlayerTurn = true;
        mockMatch.data.playData.activePlayerIndex = 0;

        service.startCombatEndDeath(mockMatch);

        expect(mockMatch.data.state).toBe(MatchState.CombatEnd);
        expect(mockMatch.setTimeout.called).toBe(true);
    });

    it('start combat end death should handle active player death', () => {
        mockMatch.data.combatData.playersCombatData = [
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]), playerIndex: 0 },
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[1]), playerIndex: 1 },
        ];
        mockMatch.data.combatData.isSecondPlayerTurn = true;
        mockMatch.data.playData.activePlayerIndex = 1;

        service.startCombatEndDeath(mockMatch);

        expect(mockMatch.data.state).toBe(MatchState.CombatEnd);
        expect(mockMatch.setTimeout.called).toBe(true);
    });

    it('can player act should return false when not in combat', () => {
        mockMatch.getPlayerIndex.returns(0);
        mockMatch.data.combatData.isSecondPlayerTurn = false;
        mockMatch.data.combatData.playersCombatData = [
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]), playerIndex: 0 },
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[1]), playerIndex: 1 },
        ];
        mockMatch.isState.withArgs([MatchState.CombatWait]).returns(true);

        const result = service['canPlayerAct'](mockMatch, 'player1');

        expect(result).toBe(true);
    });

    it('can player act should return true for active second player', () => {
        mockMatch.getPlayerIndex.returns(1);
        mockMatch.data.combatData.isSecondPlayerTurn = true;
        mockMatch.data.combatData.playersCombatData = [
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]), playerIndex: 0 },
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[1]), playerIndex: 1 },
        ];
        mockMatch.isState.withArgs([MatchState.CombatWait]).returns(false);

        const result = service['canPlayerAct'](mockMatch, 'player1');

        expect(result).toBe(false);
    });

    it('start combat wait should set state and timeout', () => {
        mockMatch.data.combatData.playersCombatData = [
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]), currentEscapes: 1 },
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[1]), currentEscapes: 0 },
        ];
        mockMatch.data.combatData.isSecondPlayerTurn = false;

        service['startCombatWait'](mockMatch);

        expect(mockMatch.data.state).toBe(MatchState.CombatWait);
        expect(mockMatch.sendUpdate.called).toBe(true);
        expect(mockMatch.setTimeout.called).toBe(true);
    });

    it('start combat wait should have reduced time when no escape', () => {
        mockMatch.data.combatData.playersCombatData = [
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]), currentEscapes: 1 },
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[1]), currentEscapes: 0 },
        ];
        mockMatch.data.combatData.isSecondPlayerTurn = true;

        service['startCombatWait'](mockMatch);

        expect(mockMatch.data.state).toBe(MatchState.CombatWait);
        expect(mockMatch.sendUpdate.called).toBe(true);
        expect(mockMatch.setTimeout.called).toBe(true);
    });

    it('start attack animation should execute attack', () => {
        mockMatch.data.combatData.playersCombatData = [
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]), currentHealth: 10 },
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[1]), currentHealth: 5 },
        ];
        mockMatch.data.combatData.isSecondPlayerTurn = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'executeAttack');

        service['startAttackAnimation'](mockMatch);

        expect(mockMatch.data.state).toBe(MatchState.CombatAnimation);
        expect(mockMatch.data.combatData.isSecondPlayerTurn).toBe(true);
        expect(mockMatch.setTimeout.called).toBe(true);
    });

    it('start attack animation should kill player', () => {
        mockMatch.data.combatData.playersCombatData = [
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]), currentHealth: 10 },
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[1]), currentHealth: 5 },
        ];
        mockMatch.data.combatData.isSecondPlayerTurn = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'executeAttack');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'getActivePlayerData').returns({ ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]), currentHealth: -2 });

        service['startAttackAnimation'](mockMatch);

        expect(mockMatch.data.state).toBe(MatchState.CombatAnimation);
        expect(mockMatch.data.combatData.isSecondPlayerTurn).toBe(true);
        expect(mockMatch.setTimeout.called).toBe(true);
    });

    it('start escape animation should execute escape success', () => {
        mockMatch.data.combatData.playersCombatData = [
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]), currentEscapes: 1 },
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[1]), currentEscapes: 0 },
        ];
        mockMatch.data.combatData.isSecondPlayerTurn = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'executeEscape').returns(true);

        service['startEscapeAnimation'](mockMatch);

        expect(mockMatch.data.state).toBe(MatchState.CombatAnimation);
        expect(mockMatch.data.combatData.lastCombatAction).toBe(CombatAction.SuccessEscape);
        expect(mockMatch.setTimeout.called).toBe(true);
    });

    it('start escape animation should handle escape failure', () => {
        mockMatch.data.combatData.playersCombatData = [
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]), currentEscapes: 1 },
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[1]), currentEscapes: 0 },
        ];
        mockMatch.data.combatData.isSecondPlayerTurn = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'executeEscape').returns(false);

        service['startEscapeAnimation'](mockMatch);

        expect(mockMatch.data.combatData.lastCombatAction).toBe(CombatAction.FailEscape);
        expect(mockMatch.setTimeout.called).toBe(true);
    });

    it('start combat end escape should set state', () => {
        service['startCombatEndEscape'](mockMatch);

        expect(mockMatch.data.state).toBe(MatchState.CombatEnd);
    });

    it('execute escape should succeed if conditions met', () => {
        mockMatch.data.combatData.playersCombatData = [
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]), currentEscapes: 1 },
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[1]), currentEscapes: 0 },
        ];
        mockMatch.data.combatData.isSecondPlayerTurn = false;
        const randomNumber = 0.1;
        sandbox.stub(Math, 'random').returns(randomNumber);

        const result = service['executeEscape'](mockMatch);

        expect(result).toBe(true);
        expect(mockMatch.data.combatData.playersCombatData[0].currentEscapes).toBe(0);
    });

    it('execute attack should update health', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const computeAttackResultStub = sandbox.stub(service as any, 'computeAttackResult');

        const attackResult1 = 3;
        computeAttackResultStub.returns(attackResult1);
        service['executeAttack'](mockMatch);
        expect(mockMatch.data.combatData.lastCombatAction).toBe(CombatAction.SuccessAttack);

        const attackResult2 = 0;
        computeAttackResultStub.returns(attackResult2);
        service['executeAttack'](mockMatch);
        expect(mockMatch.data.combatData.lastCombatAction).toBe(CombatAction.FailAttack);
    });

    it('compute attack result should calculate damage', () => {
        mockMatch.data.combatData.playersCombatData = [
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]), attack: 2 },
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[1]), defense: 1 },
        ];
        mockMatch.data.combatData.isSecondPlayerTurn = false;
        const attackRoll = 4;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'rollAttack').returns(attackRoll);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'rollDefense').returns(2);

        const result = service['computeAttackResult'](mockMatch);

        const expectedResult = 3; // 4 + 2 - 2 - 1
        expect(result).toBe(expectedResult);
        expect(mockMatch.data.combatData.lastRolledAttack).toBe(attackRoll);
    });

    it('roll attack should roll random if not debug', () => {
        mockMatch.data.playData.isDebugMode = false;
        mockMatch.data.combatData.playersCombatData = [
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]), playerIndex: 0 },
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[1]), playerIndex: 1 },
        ];
        mockMatch.data.combatData.isSecondPlayerTurn = false;
        mockMatch.data.players[1].attackDice = DiceType.D6;
        const randomNumber = 0.5;
        sandbox.stub(Math, 'random').returns(randomNumber);

        const result = service['rollAttack'](mockMatch);

        const expectedResult = 4;
        expect(result).toBe(expectedResult);
    });

    it('roll defense should roll random if not debug', () => {
        mockMatch.data.playData.isDebugMode = false;
        mockMatch.data.combatData.playersCombatData = [
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]), playerIndex: 0 },
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[1]), playerIndex: 1 },
        ];
        mockMatch.data.combatData.isSecondPlayerTurn = false;
        mockMatch.data.players[1].attackDice = DiceType.D6;
        const randomNumber = 0.5;
        sandbox.stub(Math, 'random').returns(randomNumber);

        const result = service['rollDefense'](mockMatch);

        const expectedResult = 3;
        expect(result).toBe(expectedResult);
    });

    it('get active player data should return correct player', () => {
        mockMatch.data.combatData.playersCombatData = [
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]), playerIndex: 0 },
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[1]), playerIndex: 1 },
        ];
        mockMatch.data.combatData.isSecondPlayerTurn = true;

        const result = service['getActivePlayerData'](mockMatch);

        expect(result.playerIndex).toBe(1);
    });

    it('get inactive player data should return correct player', () => {
        mockMatch.data.combatData.playersCombatData = [
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]), playerIndex: 0 },
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[1]), playerIndex: 1 },
        ];
        mockMatch.data.combatData.isSecondPlayerTurn = true;

        const result = service['getInactivePlayerData'](mockMatch);

        expect(result.playerIndex).toBe(0);
    });

    it('compute player data should initialize combat data', () => {
        mockMatch.getPlayer.returns({ ...structuredClone(MOCK_PLAYER_DATAS[0]), position: { x: 0, y: 0 } });
        mockMatch.getPlayerIndex.returns(0);
        mockMatch.data.gameData.mapData.tiles[0][0] = TileType.Grass;

        const result = service['computePlayerData'](mockMatch, 'player1');

        expect(result.playerIndex).toBe(0);
        expect(result.currentHealth).toBe(MOCK_PLAYER_DATAS[0].health);
    });

    it('apply combat buffs should modify stats for path', () => {
        const playerCombatData = { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]), standingTile: TileType.Path, playerIndex: 0 };
        mockMatch.data.players[0].items = [ItemType.Item1];
        const result = service['applyCombatBuffs'](mockMatch, playerCombatData);

        expect(result.attack).toBeLessThanOrEqual(playerCombatData.attack);
        expect(result.defense).toBeLessThanOrEqual(playerCombatData.defense);
    });

    it('respawn player should move to empty tile if needed', () => {
        const player = { ...structuredClone(MOCK_PLAYER_DATAS[0]), spawnPoint: { x: 1, y: 1 }, position: { x: 0, y: 0 } };
        mockMapService.getNearestEmptyTile.returns({ x: 1, y: 1 });

        service['respawnPlayer'](mockMatch, player);

        expect(player.position).toEqual({ x: 1, y: 1 });
    });
});
