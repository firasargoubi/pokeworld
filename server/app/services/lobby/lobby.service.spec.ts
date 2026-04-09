import { Match } from '@app/classes/match/match';
import { BotService } from '@app/services/bot/bot.service';
import { MapService } from '@app/services/map/map.service';
import { MatchService } from '@app/services/match/match.service';
import { PlayService } from '@app/services/play/play.service';
import { TrackingService } from '@app/services/tracking/tracking.service';
import { UserService } from '@app/services/user/user.service';
import { REGULAR_ITEMS } from '@common/consts/map-data.const';
import { ItemType } from '@common/interfaces/item-type.enum';
import { GameMode } from '@common/interfaces/map-data';
import { Message } from '@common/interfaces/message.enum';
import { Avatar, PlayerData, PlayerType, Team } from '@common/interfaces/player-data';
import { MOCK_MATCH_DATAS, MOCK_PLAYER_COMBAT_DATAS } from '@common/test-consts/mock-matches';
import { MOCK_PLAYER_DATAS } from '@common/test-consts/mock-players';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonSandbox, SinonStubbedInstance, createSandbox, createStubInstance } from 'sinon';
import { LobbyService } from './lobby.service';

describe('LobbyService', () => {
    let service: LobbyService;
    let sandbox: SinonSandbox;
    let mockPlayService: SinonStubbedInstance<PlayService>;
    let mockMatchService: SinonStubbedInstance<MatchService>;
    let mockBotService: SinonStubbedInstance<BotService>;
    let mockMatch: SinonStubbedInstance<Match>;
    let mocktrackingService: SinonStubbedInstance<TrackingService>;
    let mockMapService: SinonStubbedInstance<MapService>;
    let mockUserService: SinonStubbedInstance<UserService>;

    beforeAll(async () => {
        sandbox = createSandbox();
        mockPlayService = createStubInstance<PlayService>(PlayService);
        mockMatchService = createStubInstance<MatchService>(MatchService);
        mockBotService = createStubInstance<BotService>(BotService);
        mockMatch = createStubInstance<Match>(Match);
        mocktrackingService = createStubInstance<TrackingService>(TrackingService);
        mockMapService = createStubInstance<MapService>(MapService);
        mockUserService = createStubInstance<UserService>(UserService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LobbyService,
                { provide: PlayService, useValue: mockPlayService },
                { provide: MatchService, useValue: mockMatchService },
                { provide: BotService, useValue: mockBotService },
                { provide: TrackingService, useValue: mocktrackingService },
                { provide: MapService, useValue: mockMapService },
                { provide: UserService, useValue: mockUserService },
            ],
        }).compile();

        service = module.get<LobbyService>(LobbyService);
    });

    beforeEach(() => {
        mockMatch = createStubInstance<Match>(Match);
        mockMatch.data = structuredClone(MOCK_MATCH_DATAS[1]);
        mockMatch.isState.returns(true);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        mockUserService.deductBalance.resolves(1000);
        mockMapService.getNearestEmptyTile.resetHistory();
        mockMapService.getNearestEmptyTile.callsFake((_matchData, position) => position);
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

    it('should change is connected on join lobby', async () => {
        const player = structuredClone(MOCK_PLAYER_DATAS[0]);

        await service.joinLobby(mockMatch, player.id, player);

        expect(player.isConnected).toBe(true);
    });

    it('should remove player when drop in disabled mid match', async () => {
        const player = structuredClone(MOCK_PLAYER_DATAS[0]);
        mockMatch.isState.returns(false);
        mockMatch.data.lobbyData.isDropInEnabled = false;

        await service.joinLobby(mockMatch, player.id, player);

        expect(mockMatchService.playerRemovedFromMatch.calledWith(player.id, Message.DropInDisabled)).toBeTruthy();
    });

    it('should remove player when no spawn points are available', async () => {
        const player = structuredClone(MOCK_PLAYER_DATAS[0]);
        mockMatch.isState.returns(false);
        mockMatch.data.lobbyData.isDropInEnabled = true;
        mockMatch.getNextAvailableSpawnPoint.returns(null);

        await service.joinLobby(mockMatch, player.id, player);

        expect(mockMatchService.playerRemovedFromMatch.calledWith(player.id, Message.NoAvailableSpawn)).toBeTruthy();
    });

    it('should handle drop in when enabled', async () => {
        const player = structuredClone(MOCK_PLAYER_DATAS[0]);
        mockMatch.isState.returns(false);
        mockMatch.data.lobbyData.isDropInEnabled = true;
        mockMatch.getNextAvailableSpawnPoint.returns({ x: 2, y: 2 });
        const nearestTile = { x: 3, y: 4 };
        mockMapService.getNearestEmptyTile.returns(nearestTile);

        await service.joinLobby(mockMatch, player.id, player);

        expect(player.spawnPoint).toEqual({ x: 2, y: 2 });
        expect(player.position).toEqual(nearestTile);
        expect(player.combatsWon).toBe(0);
        expect(mockMatch.sendUpdate.calledOnce).toBeTruthy();
    });

    it('should assign drop in team in ctf mode', async () => {
        const player = structuredClone(MOCK_PLAYER_DATAS[2]);
        mockMatch.isState.returns(false);
        mockMatch.data.lobbyData.isDropInEnabled = true;
        mockMatch.data.gameData.mapData.gameMode = GameMode.CTF;
        mockMatch.data.players = [
            { ...structuredClone(MOCK_PLAYER_DATAS[0]), team: Team.Red, isConnected: true },
            { ...structuredClone(MOCK_PLAYER_DATAS[1]), team: Team.Red, isConnected: true },
            { ...structuredClone(MOCK_PLAYER_DATAS[2]), team: Team.Blue, isConnected: true },
        ] as PlayerData[];
        mockMatch.getNextAvailableSpawnPoint.returns({ x: 4, y: 4 });

        await service.joinLobby(mockMatch, player.id, player);

        expect(player.team).toBe(Team.Blue);
    });

    it('should insert drop in player by speed and update indexes', async () => {
        const player = { ...structuredClone(MOCK_PLAYER_DATAS[3]), id: 'dropPlayer', name: 'dropPlayerName', speed: 5 };
        const spawn = { x: 9, y: 9 };
        mockMatch.isState.returns(false);
        mockMatch.data.lobbyData.isDropInEnabled = true;
        mockMatch.getNextAvailableSpawnPoint.returns(spawn);
        mockMatch.data.players = [
            { ...structuredClone(MOCK_PLAYER_DATAS[0]), id: 'hostPlayer', speed: 7 },
            { ...structuredClone(MOCK_PLAYER_DATAS[1]), id: 'midPlayer', speed: 4 },
            { ...structuredClone(MOCK_PLAYER_DATAS[2]), id: 'slowPlayer', speed: 2 },
        ] as PlayerData[];
        mockMatch.data.lobbyData.hostPlayerIndex = 0;
        mockMatch.data.playData.activePlayerIndex = 2;
        mockMatch.data.combatData.playersCombatData = [
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]), playerIndex: 1 },
            { ...structuredClone(MOCK_PLAYER_COMBAT_DATAS[1]), playerIndex: 2 },
        ];

        await service.joinLobby(mockMatch, player.id, player);

        expect(mockMatch.data.players.map((p) => p.id)).toEqual(['hostPlayer', 'dropPlayer', 'midPlayer', 'slowPlayer']);
        expect(player.spawnPoint).toEqual(spawn);
        expect(player.position).toEqual(spawn);
        expect(mockMatch.data.lobbyData.hostPlayerIndex).toBe(0);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(mockMatch.data.playData.activePlayerIndex).toBe(3);
        expect(mockMatch.data.combatData.playersCombatData[0].playerIndex).toBe(2);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(mockMatch.data.combatData.playersCombatData[1].playerIndex).toBe(3);
    });

    it('should change lock status if host', () => {
        const playerId = 'playerId';
        mockMatch.isHost.returns(true);

        service.changeLockStatus(mockMatch, playerId, true);

        expect(mockMatch.changeLockStatus.calledWith(true)).toBeTruthy();
    });

    it('should change match settings if host', () => {
        const playerId = 'playerId';
        mockMatch.isHost.returns(true);

        service.changeMatchSettings(mockMatch, playerId, {
            isElementalMode: true,
            isDropInEnabled: true,
            isRapidElimination: false,
            isFriendOnly: false,
            entryFee: 0,
        });

        expect(
            mockMatch.changeSettings.calledWith({
                isElementalMode: true,
                isDropInEnabled: true,
                isRapidElimination: false,
                isFriendOnly: false,
                entryFee: 0,
            }),
        ).toBeTruthy();
        expect(mockMatch.sendUpdate.calledOnce).toBeTruthy();
    });

    it('should start match if conditions are met', () => {
        const playerId = 'playerId';
        mockMatch.isHost.returns(true);
        mockMatch.isState.returns(true);
        mockMatch.data.lobbyData.isLocked = true;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const startMatchFirstTurnStub = sandbox.stub(service as any, 'startMatchFirstTurn');
        service.startMatch(mockMatch, playerId);

        expect(startMatchFirstTurnStub.called).toBeTruthy();
    });

    it('should noy start match if conditions are noy met', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const startMatchFirstTurnStub = sandbox.stub(service as any, 'startMatchFirstTurn');
        mockMatch.isHost.returns(true);
        mockMatch.isState.returns(true);
        mockMatch.data.lobbyData.isLocked = true;
        mockMatch.data.players.push(structuredClone(MOCK_PLAYER_DATAS[0]));
        mockMatch.data.gameData.mapData.gameMode = GameMode.CTF;

        service.startMatch(mockMatch, 'playerId');
        mockMatch.data.lobbyData.isLocked = false;
        service.startMatch(mockMatch, 'playerId');
        mockMatch.data.players = [structuredClone(MOCK_PLAYER_DATAS[0])];
        service.startMatch(mockMatch, 'playerId');

        expect(startMatchFirstTurnStub.called).toBeFalsy();
    });

    it('start match first turn should call start next turn', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const sortPlayersStub = sandbox.stub(service as any, 'sortPlayers');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const assignSpawnPointsStub = sandbox.stub(service as any, 'assignSpawnPoints');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const setupRandomItemsStub = sandbox.stub(service as any, 'setupRandomItems');
        mockMatch.data.gameData.mapData.gameMode = GameMode.CTF;

        service['startMatchFirstTurn'](mockMatch);

        expect(mocktrackingService.startTrackingMatch.calledWith(mockMatch)).toBeTruthy();
        expect(sortPlayersStub.calledWith(mockMatch)).toBeTruthy();
        expect(assignSpawnPointsStub.calledWith(mockMatch)).toBeTruthy();
        expect(setupRandomItemsStub.calledWith(mockMatch)).toBeTruthy();
        expect(mockMatch.data.playData.activePlayerIndex).toBe(-1);
        expect(mockPlayService.startNextTurn.calledWith(mockMatch)).toBeTruthy();
    });

    it('sort players should sort players by speed', () => {
        mockMatch.data.players = [
            { ...structuredClone(MOCK_PLAYER_DATAS[0]), speed: 1 },
            { ...structuredClone(MOCK_PLAYER_DATAS[1]), speed: 2 },
            { ...structuredClone(MOCK_PLAYER_DATAS[2]), speed: 0 },
            { ...structuredClone(MOCK_PLAYER_DATAS[3]), speed: 0 },
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
        expect(mockMatch.setAvailableSpawnPoints.calledOnce).toBeTruthy();
    });

    it('get unique name should return original name if unique or append suffix', () => {
        mockMatch.data.players = [{ ...structuredClone(MOCK_PLAYER_DATAS[0]), name: 'Alice', id: 'player1' }];

        const uniqueName1 = service['getUniqueName'](mockMatch, 'player2', 'Bob');
        expect(uniqueName1).toBe('Bob');

        const uniqueName2 = service['getUniqueName'](mockMatch, 'player2', 'Alice');
        expect(uniqueName2).toBe('Alice-2');
    });

    it('setupRandomItems should distribute random items to unused item types', () => {
        const randomPosition1 = { x: 3, y: 3 };
        const randomPosition2 = { x: 4, y: 4 };

        mockMatch.data.gameData.mapData.items = {
            [ItemType.Random]: [randomPosition1, randomPosition2],
            [ItemType.Item1]: [],
            [ItemType.Item2]: [{ x: 0, y: 0 }],
            [ItemType.Item3]: [],
            [ItemType.Item4]: [],
            [ItemType.Item5]: [],
            [ItemType.Item6]: [],
            [ItemType.Spawn]: [],
            [ItemType.Flag]: [],
        } as Record<ItemType, { x: number; y: number }[]>;

        service['setupRandomItems'](mockMatch);

        expect(mockMatch.data.gameData.mapData.items[ItemType.Random].length).toBe(0);

        const totalDistributed = Object.values(REGULAR_ITEMS)
            .filter((itemType) => itemType !== ItemType.Random)
            .reduce((count, itemType) => {
                return count + mockMatch.data.gameData.mapData.items[itemType].length;
            }, 0);

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Number of items distributed
        expect(totalDistributed).toBe(3);

        const randomItemsCount = Object.values(REGULAR_ITEMS)
            .filter((itemType) => itemType === ItemType.Random)
            .reduce((count, itemType) => {
                return count + mockMatch.data.gameData.mapData.items[itemType].length;
            }, 0);

        expect(randomItemsCount).toBe(0);
    });

    it('should change lock status to true when adding a bot makes the match full', () => {
        mockMatch.isFull.onCall(0).returns(false);
        mockMatch.isFull.onCall(1).returns(true);
        mockBotService.getBotData.returns(structuredClone(MOCK_PLAYER_DATAS[0]));

        service.addBot(mockMatch, PlayerType.BotAggressive);
        expect(mockMatchService.addPlayerToMatchCode.called).toBeTruthy();
        expect(mockMatch.changeLockStatus.calledWith(true)).toBeTruthy();
        expect(mockMatch.sendUpdate.called).toBeTruthy();
    });
});
