import { Test, TestingModule } from '@nestjs/testing';
import { SinonSandbox, createSandbox, SinonStubbedInstance, createStubInstance } from 'sinon';
import { PlayService } from './play.service';
import { MovementService } from '@app/services/movement/movement.service';
import { CombatService } from '@app/services/combat/combat.service';
import { Match } from '@app/classes/match/match';
import { MatchState } from '@common/interfaces/match-data';
import { TileType } from '@common/interfaces/tile-type.enum';
import { MOCK_MATCH_DATAS } from '@common/test-consts/mock-matches';
import { MOCK_PLAYER_DATAS } from '@common/test-consts/mock-players';
import { GameMode } from '@common/interfaces/map-data';

describe('PlayService', () => {
    let service: PlayService;
    let sandbox: SinonSandbox;
    let mockMovementService: SinonStubbedInstance<MovementService>;
    let mockCombatService: SinonStubbedInstance<CombatService>;
    let mockMatch: SinonStubbedInstance<Match>;

    beforeAll(async () => {
        sandbox = createSandbox();
        mockMovementService = createStubInstance(MovementService);
        mockCombatService = createStubInstance(CombatService);
        mockMatch = createStubInstance(Match);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayService,
                { provide: MovementService, useValue: mockMovementService },
                { provide: CombatService, useValue: mockCombatService },
            ],
        }).compile();

        service = module.get<PlayService>(PlayService);
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

    it('end turn should start next turn if conditions met', () => {
        mockMatch.isActivePlayer.returns(true);
        mockMatch.isState.withArgs([MatchState.TurnWait]).returns(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startNextTurnStub = sandbox.stub(service as any, 'startNextTurn');

        service.endTurn(mockMatch, 'player1');

        expect(startNextTurnStub.calledWith(mockMatch)).toBe(true);
    });

    it('move should update position and state if valid', () => {
        mockMatch.isActivePlayer.returns(true);
        mockMatch.isState.withArgs([MatchState.TurnWait]).returns(true);
        mockMovementService.getShortestPath.returns({ moveCost: 2, path: [{ x: 1, y: 1 }] });
        mockMatch.data.playData.movementLeft = 3;
        mockMatch.getPlayer.returns({ ...structuredClone(MOCK_PLAYER_DATAS[0]), position: { x: 0, y: 0 } });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'setTimeLeft');

        service.move(mockMatch, 'player1', { x: 1, y: 1 });

        expect(mockMatch.data.playData.movementLeft).toBe(1);
        expect(mockMatch.data.state).toBe(MatchState.MovementAnimation);
        expect(mockMatch.sendUpdate.called).toBe(true);
    });

    it('action should execute action if valid', () => {
        mockMatch.data.playData.hasAction = true;
        mockMatch.isActivePlayer.returns(true);
        mockMatch.isState.withArgs([MatchState.TurnWait]).returns(true);
        mockMovementService.getActions.returns([{ x: 1, y: 1 }]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const executeActionStub = sandbox.stub(service as any, 'executeAction');

        service.action(mockMatch, 'player1', { x: 1, y: 1 });

        expect(mockMatch.data.playData.hasAction).toBe(false);
        expect(executeActionStub.calledWith(mockMatch, 'player1', { x: 1, y: 1 })).toBe(true);
    });

    it('debug move should update position if valid', () => {
        const position = { x: 1, y: 1 };
        mockMatch.data.playData.isDebugMode = true;
        mockMatch.isActivePlayer.returns(true);
        mockMatch.isState.returns(true);
        mockMovementService.getPossibleMovesDebug.returns([position]);
        mockMatch.getPlayer.returns({ ...structuredClone(MOCK_PLAYER_DATAS[0]), position: { x: 0, y: 0 } });

        service.debugMove(mockMatch, 'player1', position);

        expect(mockMatch.sendUpdate.called).toBe(true);
    });

    it('change debug mode should toggle debug mode', () => {
        mockMatch.isHost.returns(true);
        mockMatch.isActivePlayer.returns(true);

        service.changeDebugMode(mockMatch, 'player1', true);
        expect(mockMatch.data.playData.isDebugMode).toBe(true);
        service.changeDebugMode(mockMatch, 'player1', false);
        expect(mockMatch.data.playData.isDebugMode).toBe(false);
    });

    it('start next turn should update state and check win', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'checkWinCondition').returns(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'getNextPlayerIndex').returns(1);

        service.startNextTurn(mockMatch);

        expect(mockMatch.data.state).toBe(MatchState.TurnStart);
        expect(mockMatch.setTimeout.called).toBe(true);
    });

    it('start next turn should check win condition', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'checkWinCondition').returns(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'getNextPlayerIndex').returns(1);

        service.startNextTurn(mockMatch);

        expect(mockMatch.data.state).toBe(MatchState.TurnStart);
        expect(mockMatch.setTimeout.called).toBe(true);
    });

    it('continue turn should proceed to next turn if no actions', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'checkWinCondition').returns(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'canPlayerAct').returns(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startNextTurnStub = sandbox.stub(service as any, 'startNextTurn');

        service.continueTurn(mockMatch);

        expect(startNextTurnStub.calledWith(mockMatch)).toBe(true);
    });

    it('continue turn should check win condition', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'checkWinCondition').returns(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'canPlayerAct').returns(false);

        service.continueTurn(mockMatch);

        expect(mockMatch.setTimeout.called).toBe(true);
    });

    it('can player act should return true if actions available', () => {
        mockMovementService.getActions.returns([{ x: 1, y: 1 }]);
        mockMatch.data.playData.hasAction = false;
        mockMovementService.getPossibleMoves.returns([{ x: 1, y: 1 }]);

        const result = service['canPlayerAct'](mockMatch);

        expect(result).toBe(true);
    });

    it('check win condition should call check ffa win', () => {
        mockMatch.data.gameData.mapData.gameMode = GameMode.FFA;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const checkWinConditionFfaStub = sandbox.stub(service as any, 'checkWinConditionFfa').returns(false);

        service['checkWinCondition'](mockMatch);

        expect(checkWinConditionFfaStub.calledWith(mockMatch)).toBe(true);
    });

    it('check win condition should call check ffa win', () => {
        mockMatch.data.gameData.mapData.gameMode = GameMode.CTF;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const checkWinConditionCtfStub = sandbox.stub(service as any, 'checkWinConditionCtf').returns(false);

        service['checkWinCondition'](mockMatch);

        expect(checkWinConditionCtfStub.calledWith(mockMatch)).toBe(true);
    });

    it('check win condition ffa should return true if winner found', () => {
        mockMatch.data.players[0].combatsWon = 3; // Assuming MINIMUM_COMBATS_TO_WIN <= 3

        const result = service['checkWinConditionFfa'](mockMatch);

        expect(result).toBe(true);
        expect(mockMatch.data.state).toBe(MatchState.MatchEnd);
    });

    it('end match should update state', () => {
        service['endMatch'](mockMatch);

        expect(mockMatch.data.state).toBe(MatchState.Statistics);
        expect(mockMatch.clearTimeout.called).toBe(true);
    });

    it('check win condition ctf should set state if true', () => {
        sandbox.stub(Math, 'random').returns(0);

        service['checkWinConditionCtf'](mockMatch);

        expect(mockMatch.data.state).toBe(MatchState.MatchEnd);
    });

    it('set time left should update time', () => {
        const timeNumber = 1000;
        mockMatch.lastTimeoutStart = new Date();
        mockMatch.data.playData.timeLeft = timeNumber;

        service['setTimeLeft'](mockMatch);

        expect(mockMatch.data.playData.timeLeft).toBeLessThanOrEqual(timeNumber);
    });

    it('start turn wait should update state and movement', () => {
        const movement = 5;
        mockMatch.data.players[0].speed = movement;
        mockMatch.data.playData.activePlayerIndex = 0;

        service['startTurnWait'](mockMatch);

        expect(mockMatch.data.state).toBe(MatchState.TurnWait);
        expect(mockMatch.data.playData.movementLeft).toBe(movement);
        expect(mockMatch.setTimeout.called).toBe(true);
    });

    it('execute action should start combat if player at position', () => {
        mockMatch.data.players[1].position = { x: 1, y: 1 };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'setTimeLeft');

        service['executeAction'](mockMatch, 'player1', { x: 1, y: 1 });

        expect(mockCombatService.startCombat.called).toBe(true);
    });

    it('execute action should toggle bridge if no player', () => {
        mockMatch.data.gameData.mapData.tiles[1][1] = TileType.Bridge;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const toggleBridgeTileStub = sandbox.stub(service as any, 'toggleBridgeTile');

        service['executeAction'](mockMatch, 'player1', { x: -3, y: 3 });

        expect(toggleBridgeTileStub.called).toBe(true);
    });

    it('toggle bridge tile should switch bridge state', () => {
        mockMatch.data.gameData.mapData.tiles[0][0] = TileType.Bridge;
        service['toggleBridgeTile'](mockMatch, { x: 0, y: 0 });
        expect(mockMatch.data.gameData.mapData.tiles[0][0]).toBe(TileType.BrokenBridge);

        mockMatch.data.gameData.mapData.tiles[1][1] = TileType.BrokenBridge;
        service['toggleBridgeTile'](mockMatch, { x: 1, y: 1 });
        expect(mockMatch.data.gameData.mapData.tiles[1][1]).toBe(TileType.Bridge);
    });

    it('get next player index should skip disconnected players', () => {
        mockMatch.data.players = [
            { ...structuredClone(MOCK_PLAYER_DATAS[0]), isConnected: false },
            { ...structuredClone(MOCK_PLAYER_DATAS[1]), isConnected: false },
            { ...structuredClone(MOCK_PLAYER_DATAS[2]), isConnected: true },
        ];
        mockMatch.data.playData.activePlayerIndex = 0;

        const result = service['getNextPlayerIndex'](mockMatch);

        expect(result).toBe(2);
    });
});
