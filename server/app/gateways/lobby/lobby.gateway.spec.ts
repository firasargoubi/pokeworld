import { Test, TestingModule } from '@nestjs/testing';
import { SinonSpy, SinonStub, SinonStubbedInstance, createStubInstance, match, spy, stub } from 'sinon';
import { Server, Socket, BroadcastOperator } from 'socket.io';
import { LobbyGateway } from './lobby.gateway';
import { LobbyEvents } from '@common/lobby-events.enum';
import { Player } from '@common/player';
import { GameData } from '@common/game-data';
import { Match } from '@common/match';
import { MapSize } from '@common/map-size.enum';
import { TileType } from '@common/tile-type.enum';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { Position } from '@common/position';
import { Avatars } from '@common/avatars.enum';
import { MAX_PLAYERS, CODE_LENGTH } from './lobby.gateway.constants';

describe('LobbyGateway', () => {
    let gateway: LobbyGateway;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let emitPlayersInRoomSpy: SinonSpy;
    let emitStub: SinonStub;
    let debugStub: SinonStub;
    let mockGameData: GameData;

    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        const module: TestingModule = await Test.createTestingModule({
            providers: [LobbyGateway],
        }).compile();

        gateway = module.get<LobbyGateway>(LobbyGateway);
        gateway['server'] = server;
        gateway['matches'] = new Map();
        gateway['playerToMatch'] = new Map();

        mockGameData = {
            _id: 'test-game-id',
            name: 'Test Game',
            description: 'A test game for unit tests',
            lastEdited: new Date(),
            isVisible: true,
            mapData: {
                tiles: Array.from({ length: MapSize.Small }, () => Array(MapSize.Medium).fill(TileType.Grass)),
                items: {} as Record<ItemType, Position[]>,
                size: MapSize.Small,
                gameMode: GameMode.FFA,
            },
        };

        emitStub = stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        server.to.returns({ emit: emitStub } as any);
        debugStub = stub(gateway, 'debug').callsFake(() => undefined);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        emitPlayersInRoomSpy = spy(gateway, 'emitPlayersInRoom' as any);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('hello message should be sent on connection', () => {
        gateway.handleConnection(socket);
        expect(socket.emit.calledWith(LobbyEvents.Debug, match.any)).toBeTruthy();
    });

    it('handleDisconnect should send goodbye message and call leaveGame', () => {
        const leaveGameSpy = spy(gateway, 'leaveGame');
        gateway.handleDisconnect(socket);

        expect(socket.emit.calledWith(LobbyEvents.Debug, 'Goodbye World!')).toBeTruthy();
        expect(leaveGameSpy.calledWith(socket)).toBeTruthy();
        leaveGameSpy.restore();
    });

    it('debug should emit message to client', () => {
        debugStub.restore();
        gateway.debug(socket, 'Hello World!');
        expect(socket.emit.calledWith(LobbyEvents.Debug, 'Hello World!')).toBeTruthy();
    });

    it('createMatchAndJoin should create a new game and add the admin player', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const addPlayerToRoomSpy = spy(gateway, 'addPlayerToRoom' as any);

        const gameCode = gateway.createMatchAndJoin(socket, mockGameData);

        expect(gateway['matches'].has(gameCode)).toBeTruthy();
        const currentMatch = gateway['matches'].get(gameCode);
        expect(currentMatch.matchData.players.length).toBe(1);
        expect(currentMatch.matchData.players[0].isAdmin).toBeTruthy();

        expect(addPlayerToRoomSpy.calledWith(currentMatch.matchData.players[0], gameCode, socket)).toBeTruthy();
        expect(emitPlayersInRoomSpy.calledWith(gameCode)).toBeTruthy();
        addPlayerToRoomSpy.restore();
    });

    it('joinMatch should return false if game code does not exist', () => {
        const result = gateway.joinMatch(socket, 'non-existent-code');

        expect(result).toBeFalsy();
        expect(debugStub.calledWith(socket, "La partie n'existe pas")).toBeTruthy();
    });

    it('joinMatch should return false if room is locked', () => {
        const gameCode = gateway.createMatchAndJoin(socket, mockGameData);
        gateway.toggleLockRoom(socket, true);

        const newPlayer = createStubInstance<Socket>(Socket);
        Object.defineProperty(newPlayer, 'id', { value: 'new-player' });

        const result = gateway.joinMatch(newPlayer, gameCode);

        expect(result).toBeFalsy();
        expect(debugStub.calledWith(newPlayer, 'Cette partie est verrouillée ou pleine')).toBeTruthy();
    });

    it('joinMatch should return false when player is already in the requested game', () => {
        const gameCode = gateway.createMatchAndJoin(socket, mockGameData);

        const result = gateway.joinMatch(socket, gameCode);

        expect(result).toBeFalsy();
        expect(debugStub.calledWith(socket, 'Vous êtes déjà dans cette partie')).toBeTruthy();
    });

    it('joinMatch should return true and add player to existing game', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const addPlayerToRoomSpy = spy(gateway, 'addPlayerToRoom' as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const updateRoomLockStatusSpy = spy(gateway, 'updateRoomLockStatus' as any);

        Object.defineProperty(socket, 'id', { value: 'admin-socket-id' });
        const gameCode = gateway.createMatchAndJoin(socket, mockGameData);
        const playerSocket = createStubInstance<Socket>(Socket);
        Object.defineProperty(playerSocket, 'id', { value: 'player-socket-id' });

        const result = gateway.joinMatch(playerSocket, gameCode);

        expect(result).toBeTruthy();
        expect(addPlayerToRoomSpy.calledWith(match.any, gameCode, socket)).toBeTruthy();
        expect(updateRoomLockStatusSpy.calledWith(match.any, gameCode)).toBeTruthy();
        expect(emitPlayersInRoomSpy.calledWith(gameCode)).toBeTruthy();
        addPlayerToRoomSpy.restore();
    });

    it('leaveGame should return false if player is not in any game', () => {
        const result = gateway.leaveGame(socket);
        expect(result).toBeFalsy();
    });

    it('leaveGame should remove non-admin player and emit updated player list', () => {
        const adminSocket = createStubInstance<Socket>(Socket);
        Object.defineProperty(adminSocket, 'id', { value: 'admin-socket-id' });
        const gameCode = gateway.createMatchAndJoin(adminSocket, mockGameData);

        gateway.joinMatch(socket, gameCode);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const removePlayerStub = stub(gateway, 'removePlayerFromRoom' as any).callsFake(() => undefined);

        const result = gateway.leaveGame(socket);

        expect(result).toBeTruthy();
        expect(removePlayerStub.calledWith(socket, gameCode)).toBeTruthy();
        expect(emitPlayersInRoomSpy.calledWith(gameCode)).toBeTruthy();
        removePlayerStub.restore();
    });

    it('leaveGame should destroy room if admin leaves', () => {
        const gameCode = gateway.createMatchAndJoin(socket, mockGameData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const destroyRoomStub = stub(gateway, 'destroyRoom' as any).callsFake(() => undefined);

        const result = gateway.leaveGame(socket);

        expect(result).toBeTruthy();
        expect(destroyRoomStub.calledWith(gameCode)).toBeTruthy();
        destroyRoomStub.restore();
    });

    it('leaveGame should auto-unlock room when player count drops below maximum', () => {
        const gameCode = gateway.createMatchAndJoin(socket, mockGameData);

        const playerSocket = createStubInstance<Socket>(Socket);
        Object.defineProperty(playerSocket, 'id', { value: 'player-2' });
        gateway.joinMatch(playerSocket, gameCode);

        let currentMatch = gateway['matches'].get(gameCode);
        expect(currentMatch.matchData.isLocked).toBeTruthy();

        server.to.resetHistory();
        emitStub.resetHistory();

        gateway.leaveGame(playerSocket);

        currentMatch = gateway['matches'].get(gameCode);
        expect(currentMatch.matchData.isLocked).toBeFalsy();
        expect(emitStub.calledWith(LobbyEvents.RoomLockChanged, false)).toBeTruthy();
    });

    it('updatePlayer should handle case where gameCode exists but player not found', () => {
        const gameCode = 'empty-game';
        const emptyMatch: Match = {
            gameData: mockGameData,
            matchData: { gameCode, players: [], isLocked: false },
        };

        gateway['matches'].set(gameCode, emptyMatch);
        gateway['playerToMatch'].set(socket.id, gameCode);

        const result = gateway.updatePlayer(socket, { name: 'New Name' });
        expect(result).toBeFalsy();
    });

    it('updatePlayer should return false if player is not in any game', () => {
        const result = gateway.updatePlayer(socket, { name: 'New Name' });
        expect(result).toBeFalsy();
    });

    it('updatePlayer should update player fields and emit updated list', () => {
        const gameCode = gateway.createMatchAndJoin(socket, mockGameData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const generateUniqueNameStub = stub(gateway, 'generateUniqueName' as any).returns('NewName');

        const updateData: Partial<Player> = {
            name: 'NewName',
            avatar: Avatars.Avatar1,
        };
        gateway.updatePlayer(socket, updateData);

        const player = gateway['matches'].get(gameCode).matchData.players[0];
        expect(player.name).toBe('NewName');
        expect(player.avatar).toBe(Avatars.Avatar1);

        expect(generateUniqueNameStub.calledWith(gateway['matches'].get(gameCode).matchData.players, 'NewName', socket.id)).toBeTruthy();
        expect(emitPlayersInRoomSpy.calledWith(gameCode)).toBeTruthy();
        generateUniqueNameStub.restore();
    });

    it('toggleLockRoom should return false if player is not in any game', () => {
        const result = gateway.toggleLockRoom(socket, true);
        expect(result).toBeFalsy();
    });

    it('toggleLockRoom should return false if player is not an admin', () => {
        const adminSocket = createStubInstance<Socket>(Socket);
        Object.defineProperty(adminSocket, 'id', { value: 'admin-id' });
        const gameCode = gateway.createMatchAndJoin(adminSocket, mockGameData);

        Object.defineProperty(socket, 'id', { value: 'player-id' });
        gateway.joinMatch(socket, gameCode);

        const result = gateway.toggleLockRoom(socket, true);
        expect(result).toBeFalsy();
    });

    it('toggleLockRoom should prevent unlocking when max players reached', () => {
        const gameCode = gateway.createMatchAndJoin(socket, mockGameData);

        const playerSocket = createStubInstance<Socket>(Socket);
        Object.defineProperty(playerSocket, 'id', { value: 'player-2' });
        gateway.joinMatch(playerSocket, gameCode);

        const currentMatch = gateway['matches'].get(gameCode);
        expect(currentMatch.matchData.isLocked).toBeTruthy();

        emitStub.resetHistory();
        const result = gateway.toggleLockRoom(socket, false);

        expect(result).toBeFalsy();
        expect(currentMatch.matchData.isLocked).toBeTruthy();
        const maxPlayers = MAX_PLAYERS[MapSize.Small];
        expect(debugStub.calledWith(socket, `Impossible de déverrouiller: nombre maximum de joueurs atteint (${maxPlayers})`)).toBeTruthy();
        expect(emitStub.calledWith(LobbyEvents.RoomLockChanged)).toBeFalsy();
    });

    it('toggleLockRoom should update isLocked based on shouldLock parameter', () => {
        const gameCode = gateway.createMatchAndJoin(socket, mockGameData);

        let result = gateway.toggleLockRoom(socket, true);
        expect(result).toBeTruthy();
        let currentMatch = gateway['matches'].get(gameCode);
        expect(currentMatch.matchData.isLocked).toBeTruthy();

        result = gateway.toggleLockRoom(socket, false);
        expect(result).toBeTruthy();
        currentMatch = gateway['matches'].get(gameCode);
        expect(currentMatch.matchData.isLocked).toBeFalsy();
    });

    it('toggleLockRoom should emit RoomLockChanged event with lock status', () => {
        const gameCode = gateway.createMatchAndJoin(socket, mockGameData);

        server.to.returns({
            emit: (event: string, lockStatus: boolean) => {
                expect(event).toEqual(LobbyEvents.RoomLockChanged);
                expect(lockStatus).toBeTruthy();
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.toggleLockRoom(socket, true);
        expect(server.to.calledWith(gameCode)).toBeTruthy();
    });

    it('removePlayerFromRoom should remove player from room and update maps', () => {
        const gameCode = gateway.createMatchAndJoin(socket, mockGameData);
        const socketPlayer2 = createStubInstance<Socket>(Socket);
        Object.defineProperty(socketPlayer2, 'id', { value: 'player-2' });
        gateway.joinMatch(socketPlayer2, gameCode);

        gateway['removePlayerFromRoom'](socket, gameCode);
        const currentMatch = gateway['matches'].get(gameCode);

        expect(currentMatch.matchData.players.some((p) => p.id === socket.id)).toBeFalsy();
        expect(gateway['playerToMatch'].has(socket.id)).toBeFalsy();
    });

    it('removePlayerFromRoom should call destroyRoom if room becomes empty', () => {
        const gameCode = gateway.createMatchAndJoin(socket, mockGameData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const destroyRoomStub = stub(gateway, 'destroyRoom' as any).callsFake(() => undefined);

        gateway['removePlayerFromRoom'](socket, gameCode);

        expect(destroyRoomStub.calledWith(gameCode)).toBeTruthy();
        destroyRoomStub.restore();
    });

    it('removePlayerFromRoom should handle non-existent players list', () => {
        const gameCode = 'non-existent-players';
        expect(() => gateway['removePlayerFromRoom'](socket, gameCode)).not.toThrow();
    });

    it('destroyRoom should notify all players and remove room data', () => {
        const gameCode = gateway.createMatchAndJoin(socket, mockGameData);
        const players = [
            { id: 'player1', name: 'Player 1', isAdmin: true },
            { id: 'player2', name: 'Player 2', isAdmin: false },
        ] as Player[];

        const currentMatch = gateway['matches'].get(gameCode);
        currentMatch.matchData.players = players;
        gateway['matches'].set(gameCode, currentMatch);

        const socket1 = createStubInstance<Socket>(Socket);
        Object.defineProperty(socket1, 'id', { value: 'player1' });
        const socket2 = createStubInstance<Socket>(Socket);
        Object.defineProperty(socket2, 'id', { value: 'player2' });

        Object.defineProperty(server, 'sockets', {
            value: {
                sockets: new Map([
                    ['player1', socket1],
                    ['player2', socket2],
                ]),
            },
        });

        server.to.returns({
            emit: (event: string, code: string) => {
                expect(event).toEqual(LobbyEvents.GameDestroyed);
                expect(code).toEqual({ gameCode });
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway['destroyRoom'](gameCode);

        expect(server.to.calledWith(gameCode)).toBeTruthy();
        expect(socket1.leave.calledWith(gameCode)).toBeTruthy();
        expect(socket2.leave.calledWith(gameCode)).toBeTruthy();
        expect(gateway['matches'].has(gameCode)).toBeFalsy();
    });

    it('addPlayerToRoom should add player to room and update maps', () => {
        const leaveGameStub = stub(gateway, 'leaveGame').returns(true);
        const gameCode = gateway.createMatchAndJoin(socket, mockGameData);
        const player = { id: 'player-id', name: 'Player', isAdmin: false } as Player;

        gateway['addPlayerToRoom'](player, gameCode, socket);
        const currentMatch = gateway['matches'].get(gameCode);

        expect(leaveGameStub.calledWith(socket)).toBeTruthy();
        expect(currentMatch.matchData.players.some((p) => p.id === player.id)).toBeTruthy();
        expect(gateway['playerToMatch'].get(player.id)).toBe(gameCode);
        expect(socket.join.calledWith(gameCode)).toBeTruthy();
        leaveGameStub.restore();
    });

    it('emitPlayersInRoom should send player list to room if room exists', () => {
        emitPlayersInRoomSpy.restore();
        const gameCode = gateway.createMatchAndJoin(socket, mockGameData);
        const testPlayers = [{ id: 'player1', name: 'Player 1', isAdmin: true }] as Player[];

        const currentMatch = gateway['matches'].get(gameCode);
        currentMatch.matchData.players = testPlayers;
        gateway['matches'].set(gameCode, currentMatch);

        server.to.returns({
            emit: (event: string, players: Player[]) => {
                expect(event).toEqual(LobbyEvents.UpdatePlayersLists);
                expect(players).toEqual(testPlayers);
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway['emitPlayersInRoom'](gameCode);
        expect(server.to.calledWith(gameCode)).toBeTruthy();
    });

    it('generateUniqueGameCode should generate unique game code', () => {
        const code = gateway['generateUniqueGameCode']();

        expect(code).toMatch(/^[0-9]{4}$/);
        expect(code.length).toBe(CODE_LENGTH);
        expect(gateway['matches'].has(code)).toBeFalsy();
    });

    it('generateUniqueName should generate unique name', () => {
        const players = [{ name: 'FirstPlayer', id: 'player-1' }] as Player[];

        const currentPlayerId = 'player-2';
        const name = gateway['generateUniqueName'](players, 'FirstPlayer', currentPlayerId);

        expect(name).toBe('FirstPlayer-2');
    });

    it('updateRoomLockStatus should lock room when max players reached', () => {
        const gameCode = gateway.createMatchAndJoin(socket, mockGameData);
        const currentMatch = gateway['matches'].get(gameCode);

        gateway['updateRoomLockStatus'](currentMatch, gameCode);
        expect(currentMatch.matchData.isLocked).toBeFalsy();
        expect(emitStub.calledWith(LobbyEvents.RoomLockChanged, false)).toBeFalsy();
    });
});
