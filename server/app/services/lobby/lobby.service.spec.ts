import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from '@app/services/game/game.service';
import { createSandbox, createStubInstance, SinonSandbox, SinonStubbedInstance } from 'sinon';
import { LobbyService } from './lobby.service';
import { MatchService } from '@app/services/match/match.service';
import { LobbyGateway } from '@app/gateways/lobby/lobby.gateway';
import { MOCK_GAMES } from '@app/consts/tests/mock-games';
import { MOCK_MATCHES, MOCK_PLAYERS } from '@app/consts/tests/mock-matches';
import { Player } from '@common/player';
import { DEFAULT_MATCH_DATA, DEFAULT_PLAYER } from '@app/services/match/match.service.const';

describe('LobbyService', () => {
    let service: LobbyService;
    let sandbox: SinonSandbox;
    let mockGameService: SinonStubbedInstance<GameService>;
    let mockMatchService: SinonStubbedInstance<MatchService>;
    let mockeLobbyGateway: SinonStubbedInstance<LobbyGateway>;

    beforeAll(async () => {
        mockGameService = createStubInstance<GameService>(GameService);
        mockMatchService = createStubInstance<MatchService>(MatchService);
        mockeLobbyGateway = createStubInstance<LobbyGateway>(LobbyGateway);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LobbyService,
                { provide: GameService, useValue: mockGameService },
                { provide: MatchService, useValue: mockMatchService },
                { provide: LobbyGateway, useValue: mockeLobbyGateway },
            ],
        }).compile();

        service = module.get<LobbyService>(LobbyService);
    });

    beforeEach(() => {
        sandbox = createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should joinMatch correctly', () => {
        const playerId = '1122';
        const matchCode = '3344';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isMatchLocked').returns(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emitUpdatePlayerListStub = sandbox.stub(service as any, 'emitUpdatePlayerList');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emitLockStatusChangedStub = sandbox.stub(service as any, 'emitLockStatusChanged');

        service.joinMatch(playerId, matchCode);
        expect(mockMatchService.addPlayerToMatch.calledWith(playerId, matchCode, false)).toBeTruthy();
        expect(mockeLobbyGateway.connectPlayer.calledWith(playerId, matchCode)).toBeTruthy();
        expect(emitUpdatePlayerListStub.calledWith(matchCode)).toBeTruthy();
        expect(emitLockStatusChangedStub.calledWith(matchCode)).toBeTruthy();
    });

    it('should createMatch correctly', async () => {
        mockGameService.getGameData.resolves(MOCK_GAMES[0]);
        mockMatchService.isPlayerInMatch.returns(false);
        mockMatchService.createMatch.returns('1234');

        const result = await service.createMatch('1122', 'game1');

        expect(mockMatchService.addPlayerToMatch.calledWith('1122', '1234', true)).toBeTruthy();
        expect(mockeLobbyGateway.connectPlayer.calledWith('1122', '1234')).toBeTruthy();
        expect(result).toBe('1234');
    });

    it('should leaveMatch correctly', () => {
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
        mockMatchService.getPlayers.returns([MOCK_PLAYERS[0]]);

        service.leaveMatch('1122');

        expect(mockMatchService.removePlayerFromMatch.calledWith('1122', '3344')).toBeTruthy();
        expect(mockeLobbyGateway.disconnectPlayer.calledWith(MOCK_PLAYERS[0].id)).toBeTruthy();
        expect(mockeLobbyGateway.emitRemovedFromMatch.calledWith(MOCK_PLAYERS[0].id)).toBeTruthy();
    });

    it('should tryKickPlayer correctly', () => {
        mockMatchService.isPlayerAdmin.returns(true);
        const kickPlayerStub = sandbox.stub(service, 'kickPlayer');

        service.tryKickPlayer('admin1', '1122');

        expect(kickPlayerStub.calledWith('1122')).toBeTruthy();
    });

    it('should kickPlayer correctly', () => {
        mockMatchService.getMatchCodeFromPlayerId.returns('3344');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emitUpdatePlayerListStub = sandbox.stub(service as any, 'emitUpdatePlayerList');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emitLockStatusChangedStub = sandbox.stub(service as any, 'emitLockStatusChanged');

        service.kickPlayer('1122');

        expect(mockMatchService.removePlayerFromMatch.calledWith('1122', '3344')).toBeTruthy();
        expect(mockeLobbyGateway.emitRemovedFromMatch.calledWith('1122')).toBeTruthy();
        expect(emitUpdatePlayerListStub.calledWith('3344')).toBeTruthy();
        expect(emitLockStatusChangedStub.calledWith('3344')).toBeTruthy();
    });

    it('should updatePlayer correctly', () => {
        mockMatchService.getMatchCodeFromPlayerId.returns('3344');
        mockMatchService.getPlayers.returns(MOCK_PLAYERS);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emitUpdatePlayerListStub = sandbox.stub(service as any, 'emitUpdatePlayerList');

        service.updatePlayer(MOCK_PLAYERS[0].id, { name: 'Bob', isConnected: true });

        expect(emitUpdatePlayerListStub.calledWith('3344')).toBeTruthy();
    });

    it('should startMatch correctly', () => {
        mockMatchService.getMatchCodeFromPlayerId.returns('3344');
        mockMatchService.isPlayerAdmin.returns(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isMatchLocked').returns(true);
        mockMatchService.getMatch.returns(MOCK_MATCHES[0]);

        service.startMatch('1122');

        expect(mockMatchService.startMatch.calledWith('3344')).toBeTruthy();
    });

    it('should changeLockStatus correctly', () => {
        mockMatchService.getMatchCodeFromPlayerId.returns('3344');
        mockMatchService.isPlayerAdmin.returns(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emitLockStatusChangedStub = sandbox.stub(service as any, 'emitLockStatusChanged');

        service.changeLockStatus('1122', true);

        expect(mockMatchService.setMatchLockState.calledWith('3344', true)).toBeTruthy();
        expect(emitLockStatusChangedStub.calledWith('3344')).toBeTruthy();
    });

    it('should emitLockStatusChanged correctly', () => {
        const matchCode = '3344';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isMatchLocked').returns(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const kickJoiningPlayersStub = sandbox.stub(service as any, 'kickJoiningPlayers');

        service['emitLockStatusChanged'](matchCode);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((service as any).isMatchLocked.calledWith(matchCode)).toBeTruthy();
        expect(kickJoiningPlayersStub.calledWith(matchCode)).toBeTruthy();
        expect(mockeLobbyGateway.emitLockStatusChanged.calledWith(matchCode, true)).toBeTruthy();
    });

    it('should kickJoiningPlayers correctly', () => {
        const matchCode = '3344';
        const players: Player[] = [
            { ...DEFAULT_PLAYER, id: '1122', isConnected: true },
            { ...DEFAULT_PLAYER, id: '2233', isConnected: false },
            { ...DEFAULT_PLAYER, id: '3344', isConnected: false },
        ];
        mockMatchService.getPlayers.returns(players);
        const kickPlayerStub = sandbox.stub(service, 'kickPlayer');

        service['kickJoiningPlayers'](matchCode);

        expect(kickPlayerStub.calledWith('2233')).toBeTruthy();
        expect(kickPlayerStub.calledWith('3344')).toBeTruthy();
        expect(kickPlayerStub.calledWith('1122')).toBeFalsy();
    });

    it('should emitUpdatePlayerList correctly', () => {
        const matchCode = '3344';
        const players = MOCK_PLAYERS;
        mockMatchService.getPlayers.returns(players);

        service['emitUpdatePlayerList'](matchCode);

        expect(mockeLobbyGateway.emitUpdatePlayerList.calledWith(matchCode, players)).toBeTruthy();
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

    it('should isMatchLocked return true when match is full', () => {
        const matchCode = '3344';
        mockMatchService.getMatch.returns({
            gameData: MOCK_GAMES[0],
            matchData: {
                ...DEFAULT_MATCH_DATA,
                isLocked: false,
                players: [
                    { ...DEFAULT_PLAYER, id: '1122', isConnected: true },
                    { ...DEFAULT_PLAYER, id: '1133', isConnected: true },
                    { ...DEFAULT_PLAYER, id: '1144', isConnected: true },
                    { ...DEFAULT_PLAYER, id: '1155', isConnected: true },
                    { ...DEFAULT_PLAYER, id: '1166', isConnected: true },
                    { ...DEFAULT_PLAYER, id: '1177', isConnected: true },
                ],
            },
        });

        const result = service['isMatchLocked'](matchCode);

        expect(result).toBe(true);
    });
});
