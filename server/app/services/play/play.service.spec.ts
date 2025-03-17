import { MOCK_MATCHES, MOCK_PLAYERS } from '@app/consts/tests/mock-matches';
import { LobbyGateway } from '@app/gateways/lobby/lobby.gateway';
import { PlayGateway } from '@app/gateways/play/play.gateway';
import { CombatService } from '@app/services/combat/combat.service';
import { MatchService } from '@app/services/match/match.service';
import { MovementService } from '@app/services/movement/movement.service';
import { Match, TurnPhase } from '@common/match';
import { Player } from '@common/player';
import { TileType } from '@common/tile-type.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonSandbox, SinonStubbedInstance, createSandbox, createStubInstance } from 'sinon';
import { PlayService } from './play.service';
import { MINIMUM_FIGHTS_TO_WIN, PRE_TURN_DURATION, TURN_DURATION } from './play.service.const';
import { BONUS_POINTS, DEFAULT_STAT_POINTS } from '@common/consts/default-player.const';

describe('PlayService', () => {
    let service: PlayService;
    let sandbox: SinonSandbox;
    let mockPlayGateway: SinonStubbedInstance<PlayGateway>;
    let mockMatchService: SinonStubbedInstance<MatchService>;
    let mockMovementService: SinonStubbedInstance<MovementService>;
    let mockCombatService: SinonStubbedInstance<CombatService>;
    let mockLobbyGateway: SinonStubbedInstance<LobbyGateway>;
    let playerId: string;
    let matchCode: string;
    let players: Player[];
    let match: Match;

    beforeAll(async () => {
        mockPlayGateway = createStubInstance<PlayGateway>(PlayGateway);
        mockMatchService = createStubInstance<MatchService>(MatchService);
        mockMovementService = createStubInstance<MovementService>(MovementService);
        mockCombatService = createStubInstance<CombatService>(CombatService);
        mockLobbyGateway = createStubInstance<LobbyGateway>(LobbyGateway);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayService,
                { provide: PlayGateway, useValue: mockPlayGateway },
                { provide: MatchService, useValue: mockMatchService },
                { provide: MovementService, useValue: mockMovementService },
                { provide: CombatService, useValue: mockCombatService },
                { provide: LobbyGateway, useValue: mockLobbyGateway },
            ],
        }).compile();
        service = module.get<PlayService>(PlayService);
    });

    beforeEach(() => {
        players = structuredClone(MOCK_PLAYERS);
        playerId = MOCK_PLAYERS[0].id;
        match = structuredClone(MOCK_MATCHES[0]);
        matchCode = match.matchData.code;
        sandbox = createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should create', () => {
        expect(service).toBeDefined();
    });

    it('getPossibleMoves should return possible moves for a players', () => {
        const possibleMoves = [{ x: 1, y: 1 }];
        mockMatchService.getMatchCodeFromPlayerId.returns(matchCode);
        mockMovementService.getPossibleMoves.returns(possibleMoves);

        const result = service.getPossibleMoves(playerId);

        expect(result).toEqual(possibleMoves);
        expect(mockMatchService.getMatchCodeFromPlayerId.calledWith(playerId)).toBeTruthy();
        expect(mockMovementService.getPossibleMoves.called).toBeTruthy();
    });

    it('move should move the players to the specified position', () => {
        const position = { x: 1, y: 1 };
        const shortestPath = { moveCost: 1, path: [position] };
        players[0].currentStats.movement = 3;

        mockMatchService.isActivePlayer.returns(true);
        mockMatchService.getMatchCodeFromPlayerId.returns(matchCode);
        mockMatchService.getPlayer.returns(players[0]);
        mockMatchService.getMatch.returns(match);
        mockMovementService.getShortestPath.returns(shortestPath);
        mockMovementService.getActions.returns([position]);

        service.move(playerId, position);

        expect(players[0].currentStats.position).toEqual(position);
        expect(players[0].currentStats.movement).toBe(2);
        expect(mockPlayGateway.emitPlayerMoved.called).toBeTruthy();
    });

    it('action should execute action if the players is active and position is valid', () => {
        const position = { x: 1, y: 1 };
        const actions = [position];
        mockMatchService.isActivePlayer.returns(true);
        mockMatchService.getMatchCodeFromPlayerId.returns(matchCode);
        mockMatchService.getMatch.returns(match);
        mockMovementService.getActions.returns(actions);

        match.matchData.players[0].id = playerId;
        match.matchData.players[0].currentStats.hasAction = true;

        service.action(playerId, position);

        expect(match.matchData.players[0].currentStats.hasAction).toBe(false);
        expect(mockMovementService.getActions.called).toBeTruthy();
    });

    it('getHoverMoves should return hover moves for a valid position', () => {
        const position = { x: 1, y: 1 };
        const shortestPath = { moveCost: 1, path: [position] };
        players[0].currentStats.movement = 3;

        mockMatchService.isActivePlayer.returns(true);
        mockMatchService.getMatchCodeFromPlayerId.returns(matchCode);
        mockMatchService.getPlayer.returns(players[0]);
        mockMovementService.getShortestPath.returns(shortestPath);

        const result = service.getHoverMoves(playerId, position);

        expect(result).toEqual(shortestPath.path);
    });

    it('getActions should return actions for the active players', () => {
        const actions = [{ x: 1, y: 1 }];
        mockMatchService.isActivePlayer.returns(true);
        mockMatchService.getMatchCodeFromPlayerId.returns(matchCode);
        mockMatchService.getMatch.returns(match);
        mockMovementService.getActions.returns(actions);

        const result = service.getActions(playerId);

        expect(result).toEqual(actions);
    });

    it('startMatch should start the match and emit match started event', () => {
        mockMatchService.getMatch.returns(match);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reorganizeMatchStub = sandbox.stub(service as any, 'reorganizeMatch');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nextTurnPhaseStub = sandbox.stub(service as any, 'nextTurnPhase');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'assignSpawnPoints');

        service.startMatch(matchCode);

        expect(reorganizeMatchStub.calledWith(match)).toBeTruthy();
        expect(mockPlayGateway.emitMatchStarted.calledWith(matchCode, match)).toBeTruthy();
        expect(nextTurnPhaseStub.calledWith(matchCode)).toBeTruthy();
    });

    it('endTurn should end the turn if the player can end turn', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'canEndTurn').returns(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nextTurnPhaseStub = sandbox.stub(service as any, 'nextTurnPhase');

        mockMatchService.getMatchCodeFromPlayerId.returns(matchCode);

        service.endTurn(playerId);

        expect(nextTurnPhaseStub.calledWith(matchCode)).toBeTruthy();
    });

    it('changeDebugMode should change debug mode if the players is admin', () => {
        match.matchData.isDebugMode = false;
        mockMatchService.getMatchCodeFromPlayerId.returns(matchCode);
        mockMatchService.isPlayerAdmin.returns(true);
        mockMatchService.getMatch.returns(match);

        service.changeDebugMode(playerId);

        expect(match.matchData.isDebugMode).toBe(true);
        expect(mockPlayGateway.emitDebugModeChanged.calledWith(matchCode, match)).toBeTruthy();
    });

    it('executeAction should start a fight if a players is at the position', () => {
        const position = { x: 0, y: 0 };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startFightStub = sandbox.stub(service as any, 'startFight');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).executeAction(position, match, playerId);

        expect(startFightStub.calledWith(playerId)).toBeTruthy();
    });

    it('executeAction should toggle bridge tile if no players is at the position', () => {
        const position = { x: 1, y: 1 };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const toggleBridgeTileStub = sandbox.stub(service as any, 'toggleBridgeTile');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).executeAction(position, match, playerId);

        expect(toggleBridgeTileStub.calledWith(match, position)).toBeTruthy();
    });

    it('toggleBridgeTile should toggle bridge tile to broken bridge', () => {
        const position = { x: 1, y: 1 };
        match.gameData.mapData.tiles[position.x] = [];
        match.gameData.mapData.tiles[position.x][position.y] = TileType.Bridge;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).toggleBridgeTile(match, position);

        expect(match.gameData.mapData.tiles[position.x][position.y]).toBe(TileType.BrokenBridge);
        expect(mockPlayGateway.emitBridgeChanged.calledWith(matchCode, match)).toBeTruthy();
    });

    it('toggleBridgeTile should toggle broken bridge tile to bridge', () => {
        const position = { x: 1, y: 1 };
        match.gameData.mapData.tiles[position.x] = [];
        match.gameData.mapData.tiles[position.x][position.y] = TileType.BrokenBridge;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).toggleBridgeTile(match, position);

        expect(match.gameData.mapData.tiles[position.x][position.y]).toBe(TileType.Bridge);
        expect(mockPlayGateway.emitBridgeChanged.calledWith(matchCode, match)).toBeTruthy();
    });

    it('canEndTurn should return true if the players can end turn', () => {
        mockMatchService.getMatchCodeFromPlayerId.returns(matchCode);
        mockMatchService.getMatch.returns(match);
        match.matchData.phase = TurnPhase.Turn;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = (service as any).canEndTurn(playerId);

        expect(result).toBe(true);
    });

    it('canEndTurn should return false if the players cannot end turn', () => {
        match.matchData.phase = TurnPhase.PreTurn;
        mockMatchService.getMatchCodeFromPlayerId.returns(matchCode);
        mockMatchService.getMatch.returns(match);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = (service as any).canEndTurn(playerId);

        expect(result).toBe(false);
    });

    it('nextTurnPhase should start turn phase if current phase is PreTurn', () => {
        match.matchData.phase = TurnPhase.PreTurn;
        mockMatchService.getMatch.returns(match);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startTurnStub = sandbox.stub(service as any, 'startTurn');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startTurnTimerStub = sandbox.stub(service as any, 'startTurnTimer');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).nextTurnPhase(matchCode);

        expect(match.matchData.phase).toBe(TurnPhase.Turn);
        expect(startTurnStub.calledWith(match)).toBeTruthy();
        expect(startTurnTimerStub.calledWith(match, TURN_DURATION)).toBeTruthy();
    });

    it('nextTurnPhase should start pre-turn phase if current phase is Turn', () => {
        match.matchData.phase = TurnPhase.Turn;
        mockMatchService.getMatch.returns(match);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startPreTurnStub = sandbox.stub(service as any, 'startPreTurn');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startTurnTimerStub = sandbox.stub(service as any, 'startTurnTimer');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).nextTurnPhase(matchCode);

        expect(match.matchData.phase).toBe(TurnPhase.PreTurn);
        expect(startPreTurnStub.calledWith(match)).toBeTruthy();
        expect(startTurnTimerStub.calledWith(match, PRE_TURN_DURATION)).toBeTruthy();
    });

    it('startTurnTimer should start turn timer and set timeout', () => {
        const turnData = { phaseTimeout: null, lastPhaseStartTime: new Date() };
        mockMatchService.getTurnData.returns(turnData);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).startTurnTimer(match, TURN_DURATION);

        expect(turnData.phaseTimeout).not.toBeNull();
        expect(match.matchData.currentTimer).toBe(TURN_DURATION);
        expect(match.matchData.maxTimer).toBe(TURN_DURATION);
    });

    it('resetCurrentStats should reset players stats', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).resetCurrentStats(players[0]);

        expect(players[0].currentStats.hasAction).toBe(true);
        expect(players[0].currentStats.health).toBe(players[0].playerStats.health);
        expect(players[0].currentStats.movement).toBe(players[0].playerStats.speed);
    });

    it('depleteCurrentStats should deplete players stats', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).depleteCurrentStats(players[0]);

        expect(players[0].currentStats.hasAction).toBe(false);
        expect(players[0].currentStats.movement).toBe(0);
        expect(players[0].currentStats.health).toBe(players[0].playerStats.health);
    });

    it('getNextCurrentIndex should return the next connected players index', () => {
        players[0].isConnected = true;
        players[1].isConnected = false;
        players[2].isConnected = true;
        const currentIndex = 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = (service as any).getNextCurrentIndex(players, currentIndex);

        expect(result).toBe(2);
    });

    it('reorganizeMatch should reorganize match and set active players', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sortPlayersStub = sandbox.stub(service as any, 'sortPlayers');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const assignSpawnPointsStub = sandbox.stub(service as any, 'assignSpawnPoints');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).reorganizeMatch(match);

        expect(match.matchData.activePlayer).toBe(match.matchData.players.length - 1);
        expect(match.matchData.isStarted).toBe(true);
        expect(match.matchData.isLocked).toBe(true);
        expect(sortPlayersStub.calledWith(match)).toBeTruthy();
        expect(assignSpawnPointsStub.calledWith(match)).toBeTruthy();
    });

    it('sortPlayers should sort players by speed', () => {
        players[0].playerStats.speed = DEFAULT_STAT_POINTS;
        players[1].playerStats.speed = DEFAULT_STAT_POINTS + BONUS_POINTS;
        players[2].playerStats.speed = DEFAULT_STAT_POINTS;
        players[3].playerStats.speed = DEFAULT_STAT_POINTS + BONUS_POINTS;
        match.matchData.players = structuredClone(players);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).sortPlayers(match);

        expect(match.matchData.players[0].playerStats.speed).toBe(DEFAULT_STAT_POINTS + BONUS_POINTS);
        expect(match.matchData.players[1].playerStats.speed).toBe(DEFAULT_STAT_POINTS + BONUS_POINTS);
        expect(match.matchData.players[2].playerStats.speed).toBe(DEFAULT_STAT_POINTS);
        expect(match.matchData.players[3].playerStats.speed).toBe(DEFAULT_STAT_POINTS);
    });

    it('assignSpawnPoints should assign spawn points to players', () => {
        const spawnPoints = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        match.gameData.mapData.items.Spawn = spawnPoints;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).assignSpawnPoints(match);

        expect(match.matchData.players[0].spawnPoint).toEqual(spawnPoints[0]);
        expect(match.matchData.players[0].currentStats.position).toEqual(spawnPoints[0]);
        expect(match.matchData.players[1].spawnPoint).toEqual(spawnPoints[1]);
        expect(match.matchData.players[1].currentStats.position).toEqual(spawnPoints[1]);
    });

    it('startPreTurn should deplete current player stats and set next active player', () => {
        const currentPlayer = match.matchData.players[match.matchData.activePlayer];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const depleteCurrentStatsStub = sandbox.stub(service as any, 'depleteCurrentStats');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'getNextCurrentIndex').returns(1);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).startPreTurn(match);

        expect(depleteCurrentStatsStub.calledWith(currentPlayer)).toBeTruthy();
        expect(match.matchData.activePlayer).toBe(1);
        expect(mockPlayGateway.emitPreTurnStarted.calledWith(matchCode, match)).toBeTruthy();
    });

    it('startTurn should reset current player stats and emit turn started', () => {
        const currentPlayer = match.matchData.players[match.matchData.activePlayer];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resetCurrentStatsStub = sandbox.stub(service as any, 'resetCurrentStats');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).startTurn(match);

        expect(resetCurrentStatsStub.calledWith(currentPlayer)).toBeTruthy();
        expect(mockPlayGateway.emitTurnStarted.calledWith(matchCode, match)).toBeTruthy();
    });
    it('endOfCombat should call respawnPlayer and endMatch when winner reaches threshold', () => {
        players[0].currentStats.fightsWon = MINIMUM_FIGHTS_TO_WIN - 1;
        const combatResult = { winnerId: players[0].id, loserId: players[1].id };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const respawnStub = sandbox.stub(service as any, 'respawnPlayer');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const endMatchStub = sandbox.stub(service as any, 'endMatch');
        mockMatchService.getPlayer.returns(players[0]);

        service.endOfCombat(combatResult, players[0].id);

        expect(respawnStub.calledWith(players[1].id, matchCode)).toBeTruthy();
        expect(players[0].currentStats.fightsWon).toBe(MINIMUM_FIGHTS_TO_WIN);
        expect(endMatchStub.calledWith(matchCode)).toBeTruthy();
    });

    it('endOfCombat should emit combat result and call nextTurnPhase when winner has not reached threshold', () => {
        players[0].currentStats.fightsWon = 0;
        const combatResult = { winnerId: players[0].id, loserId: players[1].id };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nextTurnPhaseStub = sandbox.stub(service as any, 'nextTurnPhase');

        mockMatchService.getPlayer.returns(players[0]);
        mockMatchService.getMatchCodeFromPlayerId.returns(matchCode);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'canEndTurn').returns(true);

        service.endOfCombat(combatResult, players[0].id);

        expect(players[0].currentStats.fightsWon).toBe(1);
        expect(mockPlayGateway.emitCombatResultBroadcast.calledWith(matchCode, { match, combatResult })).toBeTruthy();
        expect(nextTurnPhaseStub.calledWith(matchCode)).toBeTruthy();
    });

    it('unfreezeMatch should clear existing timeout and set a new one', () => {
        const fakeTimeout = setTimeout(() => {}, 100);
        const turnData = { phaseTimeout: fakeTimeout, lastPhaseStartTime: new Date() };
        mockMatchService.getTurnData.returns(turnData);
        const clearTimeoutSpy = sandbox.spy(global, 'clearTimeout');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).unfreezeMatch(match);

        expect(clearTimeoutSpy.calledWith(fakeTimeout)).toBeTruthy();
        expect(turnData.phaseTimeout).not.toBeNull();
        clearTimeoutSpy.restore();
    });

    it('respawnPlayer should update player position using movementService.getNearestEmptyTile', () => {
        const player = players[1];
        player.spawnPoint = { x: 2, y: 2 };
        const newPosition = { x: 3, y: 3 };
        mockMovementService.getNearestEmptyTile.returns(newPosition);
        mockMatchService.getMatch.returns(match);
        mockMatchService.getPlayer.returns(player);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).respawnPlayer(player.id, matchCode);

        expect(mockMovementService.getNearestEmptyTile.calledWith(player.spawnPoint, match)).toBeTruthy();
        expect(player.currentStats.position).toEqual(newPosition);
    });

    it('endMatch should emit match ended and remove then disconnect all players', () => {
        mockMatchService.getPlayers.returns(players);
        mockMatchService.getMatch.returns(match);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).endMatch(matchCode);

        expect(mockPlayGateway.emitMatchEnded.calledWith(matchCode, match)).toBeTruthy();
        players.forEach((player) => {
            expect(mockMatchService.removePlayerFromMatch.calledWith(player.id, matchCode)).toBeTruthy();
            expect(mockLobbyGateway.disconnectPlayer.calledWith(player.id)).toBeTruthy();
        });
    });
});
