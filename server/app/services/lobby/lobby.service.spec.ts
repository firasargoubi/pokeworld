import { PlayService } from '@app/services/play/play.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonSandbox, SinonStubbedInstance, createSandbox, createStubInstance } from 'sinon';
import { LobbyService } from './lobby.service';
import { Match } from '@app/classes/match/match';
import { Message } from '@common/interfaces/message.enum';
import { MOCK_PLAYER_DATAS } from '@common/test-consts/mock-players';
import { MOCK_MATCH_DATAS } from '@common/test-consts/mock-matches';
import { Avatar } from '@common/interfaces/player-data';

describe('LobbyService', () => {
    let service: LobbyService;
    let sandbox: SinonSandbox;
    let mockPlayService: SinonStubbedInstance<PlayService>;
    let mockMatch: SinonStubbedInstance<Match>;

    beforeAll(async () => {
        sandbox = createSandbox();
        mockPlayService = createStubInstance<PlayService>(PlayService);
        mockMatch = createStubInstance<Match>(Match);

        const module: TestingModule = await Test.createTestingModule({
            providers: [LobbyService, { provide: PlayService, useValue: mockPlayService }],
        }).compile();

        service = module.get<LobbyService>(LobbyService);
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

    it('should kick player if host and not kicking themselves', () => {
        const playerId = 'playerId';
        const targetId = 'targetId';
        mockMatch.isHost.returns(true);

        service.kickPlayer(mockMatch, playerId, targetId);

        expect(mockMatch.kickPlayer.calledWith(targetId, Message.Kick)).toBeTruthy();
        expect(mockMatch.sendUpdate.calledOnce).toBeTruthy();
    });

    it('should change player avatar and send update', () => {
        const player = structuredClone(MOCK_PLAYER_DATAS[0]);
        mockMatch.getPlayer.returns(player);

        service.changeAvatar(mockMatch, player.id, Avatar.Avatar11);

        expect(player.avatar).toBe(Avatar.Avatar11);
    });

    it('should change is connected on join lobby', () => {
        const player = structuredClone(MOCK_PLAYER_DATAS[0]);

        service.joinLobby(mockMatch, player.id, player);

        expect(player.isConnected).toBe(true);
    });

    it('should change lock status if host', () => {
        const playerId = 'playerId';
        mockMatch.isHost.returns(true);

        service.changeLockStatus(mockMatch, playerId, true);

        expect(mockMatch.changeLockStatus.calledWith(true)).toBeTruthy();
    });

    it('should start match if conditions are met', () => {
        const playerId = 'playerId';
        mockMatch.isHost.returns(true);
        mockMatch.isState.returns(true);
        mockMatch.data.lobbyData.isLocked = true;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startMatchFirstTurnStub = sandbox.stub(service as any, 'startMatchFirstTurn');
        service.startMatch(mockMatch, playerId);

        expect(startMatchFirstTurnStub.called).toBeTruthy();
    });

    it('start match first turn should call start next turn', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sortPlayersStub = sandbox.stub(service as any, 'sortPlayers');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const assignSpawnPointsStub = sandbox.stub(service as any, 'assignSpawnPoints');

        service['startMatchFirstTurn'](mockMatch);

        expect(sortPlayersStub.calledWith(mockMatch)).toBeTruthy();
        expect(assignSpawnPointsStub.calledWith(mockMatch)).toBeTruthy();
        expect(mockMatch.data.playData.activePlayerIndex).toBe(-1);
        expect(mockPlayService.startNextTurn.calledWith(mockMatch)).toBeTruthy();
    });

    it('sort players should sort players by speed', () => {
        mockMatch.data.players = [
            { ...MOCK_PLAYER_DATAS[0], speed: 1 },
            { ...MOCK_PLAYER_DATAS[1], speed: 2 },
            { ...MOCK_PLAYER_DATAS[2], speed: 0 },
            { ...MOCK_PLAYER_DATAS[3], speed: 0 },
        ];
        mockMatch.getPlayerIndex.returns(1);

        service['sortPlayers'](mockMatch);

        expect(mockMatch.data.players[0].speed).toBe(2);
        expect(mockMatch.data.players[1].speed).toBe(1);
        expect(mockMatch.data.players[2].speed).toBe(0);
    });

    it('assign spawn points should assign spawn points to players', () => {
        mockMatch.data.players = [structuredClone(MOCK_PLAYER_DATAS[0]), structuredClone(MOCK_PLAYER_DATAS[1])];
        mockMatch.data.gameData.mapData.items.Spawn = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];

        service['assignSpawnPoints'](mockMatch);

        expect(mockMatch.data.players[0].spawnPoint).toBeDefined();
        expect(mockMatch.data.players[0].position).toEqual(mockMatch.data.players[0].spawnPoint);
        expect(mockMatch.data.players[1].spawnPoint).toBeDefined();
        expect(mockMatch.data.players[1].position).toEqual(mockMatch.data.players[1].spawnPoint);
    });

    it('get unique name should return original name if unique or append suffix', () => {
        mockMatch.data.players = [{ ...MOCK_PLAYER_DATAS[0], name: 'Alice', id: 'player1' }];

        const uniqueName1 = service['getUniqueName'](mockMatch, 'player2', 'Bob');
        expect(uniqueName1).toBe('Bob');

        const uniqueName2 = service['getUniqueName'](mockMatch, 'player2', 'Alice');
        expect(uniqueName2).toBe('Alice-2');
    });
});
