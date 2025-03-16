import { MOCK_GAMES } from '@app/consts/tests/mock-games';
import { MOCK_MATCHES, MOCK_PLAYERS } from '@app/consts/tests/mock-matches';
import { LobbyGateway } from '@app/gateways/lobby/lobby.gateway';
import { GameService } from '@app/services/game/game.service';
import { MatchService } from '@app/services/match/match.service';
import { DEFAULT_MATCH_DATA } from '@app/services/match/match.service.const';
import { PlayService } from '@app/services/play/play.service';
import { DEFAULT_PLAYER } from '@common/const/default-player.const';
import { Player } from '@common/player';
import { Warning } from '@common/warning.enum';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { SinonSandbox, SinonStubbedInstance, createStubInstance } from 'sinon';
import { LobbyService } from './lobby.service';

describe('LobbyService', () => {
    let service: LobbyService;
    let sandbox: SinonSandbox;
    let mockGameService: SinonStubbedInstance<GameService>;
    let mockMatchService: SinonStubbedInstance<MatchService>;
    let mockLobbyGateway: SinonStubbedInstance<LobbyGateway>;
    let mockPlayService: SinonStubbedInstance<PlayService>;

    beforeAll(async () => {
        mockGameService = createStubInstance<GameService>(GameService);
        mockMatchService = createStubInstance<MatchService>(MatchService);
        mockLobbyGateway = createStubInstance<LobbyGateway>(LobbyGateway);
        mockPlayService = createStubInstance<PlayService>(PlayService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LobbyService,
                { provide: GameService, useValue: mockGameService },
                { provide: MatchService, useValue: mockMatchService },
                { provide: LobbyGateway, useValue: mockLobbyGateway },
                { provide: PlayService, useValue: mockPlayService },
            ],
        }).compile();

        service = module.get<LobbyService>(LobbyService);
    });

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should add player to match and connect them when joining a valid game', () => {
        const playerId = '1122';
        const matchCode = '3344';

        mockMatchService.hasMatchCode.returns(true);
        mockMatchService.getMatch.returns({ gameData: MOCK_GAMES[0], matchData: { ...DEFAULT_MATCH_DATA, players: [] } });
        mockMatchService.isPlayerInMatch.returns(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isMatchFull').returns(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isMatchLocked').returns(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emitUpdatePlayerListStub = sandbox.stub(service as any, 'emitUpdatePlayerList');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emitLockStatusChangedStub = sandbox.stub(service as any, 'emitLockStatusChanged');

        const result = service.joinMatch(playerId, matchCode);

        expect(result).toBeTruthy();
        expect(mockMatchService.addPlayerToMatch.calledWith(playerId, matchCode, false)).toBeTruthy();
        expect(mockLobbyGateway.connectPlayer.calledWith(playerId, matchCode)).toBeTruthy();
        expect(emitUpdatePlayerListStub.calledWith(matchCode)).toBeTruthy();
        expect(emitLockStatusChangedStub.calledWith(matchCode)).toBeTruthy();
    });

    it('should generate match code and add player as admin when creating a new game', () => {
        mockMatchService.isPlayerInMatch.returns(false);
        mockMatchService.createMatch.returns('1234');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-unused-vars
        const emitUpdatePlayerListStub = sandbox.stub(service as any, 'emitUpdatePlayerList');

        const result = service.createMatch('1122', MOCK_GAMES[0]);

        expect(mockMatchService.addPlayerToMatch.calledWith('1122', '1234', true)).toBeTruthy();
        expect(mockLobbyGateway.connectPlayer.calledWith('1122', '1234')).toBeTruthy();
        expect(result).toBe('1234');
    });

    it('should not createMatch if player is in match', () => {
        mockMatchService.isPlayerInMatch.returns(true);
        const result = service.createMatch('1122', MOCK_GAMES[0]);
        expect(result).toBe('');
    });

    it('should remove player from match and update room when player leaves', () => {
        mockMatchService.getMatchCodeFromPlayerId.returns('3344');
        mockMatchService.getIsMatchStarted.returns(false);
        mockMatchService.isPlayerAdmin.returns(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emitUpdatePlayerListStub = sandbox.stub(service as any, 'emitUpdatePlayerList');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emitLockStatusChangedStub = sandbox.stub(service as any, 'emitLockStatusChanged');

        service.leaveMatch('1122');

        expect(mockMatchService.removePlayerFromMatch.calledWith('1122', '3344')).toBeTruthy();
        expect(emitUpdatePlayerListStub.calledWith('3344')).toBeTruthy();
        expect(emitLockStatusChangedStub.calledWith('3344')).toBeTruthy();
    });

    it('should kick everyone when admin leave match', () => {
        mockMatchService.getMatchCodeFromPlayerId.returns('3344');
        mockMatchService.getIsMatchStarted.returns(false);
        mockMatchService.isPlayerAdmin.returns(true);
        mockMatchService.getPlayers.returns([structuredClone(MOCK_PLAYERS[0])]);

        service.leaveMatch('1122');

        expect(mockMatchService.removePlayerFromMatch.calledWith('1122', '3344')).toBeTruthy();
        expect(mockLobbyGateway.disconnectPlayer.calledWith(MOCK_PLAYERS[0].id)).toBeTruthy();
        expect(mockLobbyGateway.warn.calledWith(MOCK_PLAYERS[0].id, Warning.AdminQuit)).toBeTruthy();
    });

    it('should KickPlayer correctly', () => {
        mockMatchService.isPlayerAdmin.returns(true);
        const removePlayerStub = sandbox.stub(service, 'removePlayer');

        service.kickPlayer('admin1', '1122');
        expect(removePlayerStub.calledWith('1122', Warning.Kick)).toBeTruthy();
    });

    it('should remove player correctly', () => {
        mockMatchService.getMatchCodeFromPlayerId.returns('3344');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emitUpdatePlayerListStub = sandbox.stub(service as any, 'emitUpdatePlayerList');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emitLockStatusChangedStub = sandbox.stub(service as any, 'emitLockStatusChanged');

        service.removePlayer('1122', Warning.AdminQuit);

        expect(mockMatchService.removePlayerFromMatch.calledWith('1122', '3344')).toBeTruthy();
        expect(mockLobbyGateway.warn.calledWith('1122', Warning.AdminQuit)).toBeTruthy();
        expect(mockLobbyGateway.disconnectPlayer.calledWith('1122')).toBeTruthy();
        expect(emitUpdatePlayerListStub.calledWith('3344')).toBeTruthy();
        expect(emitLockStatusChangedStub.calledWith('3344')).toBeTruthy();
    });

    it('should update player information and notify all room members', () => {
        mockMatchService.getMatchCodeFromPlayerId.returns('3344');
        mockMatchService.getPlayers.returns(MOCK_PLAYERS);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emitUpdatePlayerListStub = sandbox.stub(service as any, 'emitUpdatePlayerList');
        mockMatchService.getMatch.returns(MOCK_MATCHES[0]);

        service.updatePlayer(structuredClone(MOCK_PLAYERS[0]).id, { name: 'Bob', isConnected: true });
        expect(emitUpdatePlayerListStub.calledWith('3344')).toBeTruthy();

        expect(mockLobbyGateway.emitGameDataToPlayer.calledWith(MOCK_PLAYERS[0].id, MOCK_MATCHES[0].gameData)).toBeTruthy();
    });

    it('should sanitize match data and start game when admin initiates', () => {
        mockMatchService.getMatchCodeFromPlayerId.returns('3344');
        mockMatchService.isPlayerAdmin.returns(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isMatchLocked').returns(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sanitizeMatchStub = sandbox.stub(service as any, 'sanitizeMatch');
        mockMatchService.getMatch.returns(structuredClone(MOCK_MATCHES[0]));

        service.startMatch('1122');
        expect(sanitizeMatchStub.calledWith('3344')).toBeTruthy();
    });

    it('should update room lock status when requested by admin', () => {
        mockMatchService.getMatchCodeFromPlayerId.returns('3344');
        mockMatchService.isPlayerAdmin.returns(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emitLockStatusChangedStub = sandbox.stub(service as any, 'emitLockStatusChanged');

        service.changeLockStatus('1122', true);

        expect(mockMatchService.setMatchLockState.calledWith('3344', true)).toBeTruthy();
        expect(emitLockStatusChangedStub.calledWith('3344')).toBeTruthy();
    });

    it('should broadcast lock status change and handle joining players', () => {
        const matchCode = '3344';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isMatchLocked').returns(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const kickJoiningPlayersStub = sandbox.stub(service as any, 'kickJoiningPlayers');

        service['emitLockStatusChanged'](matchCode);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((service as any).isMatchLocked.calledWith(matchCode)).toBeTruthy();
        expect(kickJoiningPlayersStub.calledWith(matchCode)).toBeTruthy();
        expect(mockLobbyGateway.emitLockStatusChanged.calledWith(matchCode, true)).toBeTruthy();
    });

    it('should remove all non-connected players when room is locked', () => {
        const matchCode = '3344';
        const players: Player[] = [
            { ...DEFAULT_PLAYER, id: '1122', isConnected: true },
            { ...DEFAULT_PLAYER, id: '2233', isConnected: false },
            { ...DEFAULT_PLAYER, id: '3344', isConnected: false },
        ];
        mockMatchService.getPlayers.returns(players);
        const removePlayerStub = sandbox.stub(service, 'removePlayer');

        service['kickJoiningPlayers'](matchCode);

        expect(removePlayerStub.calledWith('2233')).toBeTruthy();
        expect(removePlayerStub.calledWith('3344')).toBeTruthy();
        expect(removePlayerStub.calledWith('1122')).toBeFalsy();
    });

    it('should broadcast updated player list to all room members', () => {
        const matchCode = '3344';
        const players = MOCK_PLAYERS;
        mockMatchService.getPlayers.returns(players);

        service['emitUpdatePlayerList'](matchCode);
        expect(mockLobbyGateway.emitUpdatePlayerList.calledWith(matchCode, players)).toBeTruthy();
    });

    it('should canStartMatch return true when conditions are met', () => {
        const playerId = '1122';
        const matchCode = '3344';
        mockMatchService.getMatchCodeFromPlayerId.returns(matchCode);
        mockMatchService.getMatch.returns({
            gameData: MOCK_GAMES[0],
            matchData: {
                ...DEFAULT_MATCH_DATA,
                players: [
                    { ...DEFAULT_PLAYER, id: '1122', isConnected: true },
                    { ...DEFAULT_PLAYER, id: '2233', isConnected: true },
                ],
            },
        });
        mockMatchService.isPlayerAdmin.returns(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isMatchLocked').returns(true);

        const result = service['canStartMatch'](playerId);
        expect(result).toBe(true);
    });

    it('should isMatchFull return true when match is full', () => {
        const matchCode = '3344';
        mockMatchService.getMatch.returns({
            gameData: MOCK_GAMES[0],
            matchData: {
                ...DEFAULT_MATCH_DATA,
                isLocked: false,
                players: [
                    { ...DEFAULT_PLAYER, id: '1122', isConnected: true },
                    { ...DEFAULT_PLAYER, id: '1133', isConnected: true },
                ],
            },
        });

        const result = service['isMatchFull'](matchCode);
        expect(result).toBe(true);
    });

    it('should sort player by speed on sanitizeMatch', () => {
        const matchCode = '3344';
        const match = {
            gameData: MOCK_GAMES[0],
            matchData: {
                ...DEFAULT_MATCH_DATA,
                players: [
                    { ...DEFAULT_PLAYER, playerStats: { ...DEFAULT_PLAYER.playerStats, speed: 5 } },
                    { ...DEFAULT_PLAYER, playerStats: { ...DEFAULT_PLAYER.playerStats, speed: 3 } },
                    { ...DEFAULT_PLAYER, playerStats: { ...DEFAULT_PLAYER.playerStats, speed: 2 } },
                    { ...DEFAULT_PLAYER, playerStats: { ...DEFAULT_PLAYER.playerStats, speed: 4 } },
                    { ...DEFAULT_PLAYER, playerStats: { ...DEFAULT_PLAYER.playerStats, speed: 1 } },
                    { ...DEFAULT_PLAYER, playerStats: { ...DEFAULT_PLAYER.playerStats, speed: 3 } },
                ],
            },
        };
        mockMatchService.getMatch.returns(match);
        const isSortedDescending = (players: Player[]) => {
            const speeds = players.map((p) => p.playerStats.speed);
            return speeds.every((s, i) => i === 0 || s <= speeds[i - 1]);
        };

        expect(isSortedDescending(match.matchData.players)).toBe(false);
        service['sanitizeMatch'](matchCode);
        expect(isSortedDescending(match.matchData.players)).toBe(true);
    });

    it('should canPlayerJoinMatch call warn on hasMatchCode false', () => {
        mockMatchService.hasMatchCode.returns(false);
        service['canPlayerJoinMatch']('1122', '3344');
        expect(mockLobbyGateway.warn.calledWith('1122', "La partie n'existe pas")).toBeTruthy();
    });

    it('should canPlayerJoinMatch call warn on isMatchFull true', () => {
        mockMatchService.hasMatchCode.returns(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isMatchFull').returns(true);
        service['canPlayerJoinMatch']('1122', '3344');
        expect(mockLobbyGateway.warn.calledWith('1122', 'La partie est pleine')).toBeTruthy();
    });

    it('should canPlayerJoinMatch call warn on isMatchLocked true', () => {
        mockMatchService.hasMatchCode.returns(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isMatchFull').returns(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isMatchLocked').returns(true);
        service['canPlayerJoinMatch']('1122', '3344');
        expect(mockLobbyGateway.warn.calledWith('1122', Warning.RoomLocked)).toBeTruthy();
    });

    it('should canPlayerJoinMatch call warn on isMatchLocked true', () => {
        mockMatchService.hasMatchCode.returns(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isMatchFull').returns(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isMatchLocked').returns(false);
        mockMatchService.isPlayerInMatch.returns(true);
        service['canPlayerJoinMatch']('1122', '3344');
        expect(mockLobbyGateway.warn.calledWith('1122', 'Vous êtes déjà dans une partie')).toBeTruthy();
    });
});
