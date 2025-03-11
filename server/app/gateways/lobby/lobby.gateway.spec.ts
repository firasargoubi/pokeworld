import { Test, TestingModule } from '@nestjs/testing';
import { SinonStub, SinonStubbedInstance, createStubInstance, match, spy, stub } from 'sinon';
import { Server, Socket, BroadcastOperator } from 'socket.io';
import { LobbyGateway } from './lobby.gateway';
import { LobbyEvents } from '@common/lobby-events.enum';
import { Player } from '@common/player';
import { Avatars } from '@common/avatars.enum';
import { CODE_LENGTH } from './lobby.gateway.constants';

describe('LobbyGateway', () => {
    let gateway: LobbyGateway;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let emitPlayersInRoomStub: SinonStub;

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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        emitPlayersInRoomStub = stub(gateway as any, 'emitPlayersInRoom').callsFake(() => undefined);
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

    it('debug should emit message to all clients', () => {
        gateway.debug('Hello World!');
        expect(server.emit.calledWith(LobbyEvents.Debug, 'Hello World!')).toBeTruthy();
    });

    it('createMatchAndJoin should create a new game and add the admin player', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const addPlayerToRoomSpy = spy(gateway, 'addPlayerToRoom' as any);

        const gameCode = gateway.createMatchAndJoin(socket);

        expect(gateway['matches'].has(gameCode)).toBeTruthy();
        const players = gateway['matches'].get(gameCode);
        expect(players.length).toBe(1);
        expect(players[0].isAdmin).toBeTruthy();

        expect(addPlayerToRoomSpy.calledWith(players[0], gameCode, socket)).toBeTruthy();
        expect(emitPlayersInRoomStub.calledWith(gameCode)).toBeTruthy();
        addPlayerToRoomSpy.restore();
    });

    it('joinMatch should return false if game code does not exist', () => {
        const debugSpy = spy(gateway, 'debug');
        const result = gateway.joinMatch(socket, 'non-existent-code');

        expect(debugSpy.calledWith("La partie n'existe pas")).toBeTruthy();
        expect(result).toBeFalsy();
        debugSpy.restore();
    });

    it('joinMatch should return false when player is already in the requested game', () => {
        const gameCode = gateway.createMatchAndJoin(socket);
        const debugSpy = spy(gateway, 'debug');

        const result = gateway.joinMatch(socket, gameCode);

        expect(result).toBeFalsy();
        expect(debugSpy.calledWith('Vous êtes déjà dans cette partie')).toBeTruthy();
        debugSpy.restore();
    });

    it('joinMatch should return true and add player to existing game', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const addPlayerToRoomSpy = spy(gateway, 'addPlayerToRoom' as any);

        Object.defineProperty(socket, 'id', { value: 'admin-socket-id' });
        const gameCode = gateway.createMatchAndJoin(socket);
        const playerSocket = createStubInstance<Socket>(Socket);
        Object.defineProperty(playerSocket, 'id', { value: 'player-socket-id' });

        const result = gateway.joinMatch(playerSocket, gameCode);

        expect(result).toBeTruthy();
        expect(addPlayerToRoomSpy.calledWith(match.any, gameCode, socket)).toBeTruthy();
        expect(emitPlayersInRoomStub.calledWith(gameCode)).toBeTruthy();
        addPlayerToRoomSpy.restore();
    });

    it('leaveGame should return false if player is not in any game', () => {
        const result = gateway.leaveGame(socket);
        expect(result).toBeFalsy();
    });

    it('leaveGame should remove non-admin player and emit updated player list', () => {
        const adminSocket = createStubInstance<Socket>(Socket);
        Object.defineProperty(adminSocket, 'id', { value: 'admin-socket-id' });
        const gameCode = gateway.createMatchAndJoin(adminSocket);

        gateway.joinMatch(socket, gameCode);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const removePlayerStub = stub(gateway, 'removePlayerFromRoom' as any).callsFake(() => undefined);

        const result = gateway.leaveGame(socket);

        expect(result).toBeTruthy();
        expect(removePlayerStub.calledWith(socket, gameCode)).toBeTruthy();
        expect(emitPlayersInRoomStub.calledWith(gameCode)).toBeTruthy();
        removePlayerStub.restore();
    });

    it('leaveGame should destroy room if admin leaves', () => {
        const gameCode = gateway.createMatchAndJoin(socket);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const destroyRoomStub = stub(gateway, 'destroyRoom' as any).callsFake(() => undefined);

        const result = gateway.leaveGame(socket);

        expect(result).toBeTruthy();
        expect(destroyRoomStub.calledWith(gameCode)).toBeTruthy();
        destroyRoomStub.restore();
    });

    it('leaveGame should handle case where gameCode exists but players list is undefined', () => {
        gateway['playerToMatch'].set(socket.id, 'invalid-game');
        const result = gateway.leaveGame(socket);
        expect(result).toBeTruthy();
    });

    it('updatePlayer should handle case where gameCode exists but player not found', () => {
        const gameCode = 'empty-game';
        gateway['matches'].set(gameCode, []);
        gateway['playerToMatch'].set(socket.id, gameCode);

        const result = gateway.updatePlayer(socket, { name: 'New Name' });
        expect(result).toBeFalsy();
    });

    it('updatePlayer should return false if player is not in any game', () => {
        const result = gateway.updatePlayer(socket, { name: 'New Name' });
        expect(result).toBeFalsy();
    });

    it('updatePlayer should update player fields and emit updated list', () => {
        const gameCode = gateway.createMatchAndJoin(socket);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const generateUniqueNameStub = stub(gateway, 'generateUniqueName' as any).returns('NewName');

        const updateData: Partial<Player> = {
            name: 'NewName',
            avatar: Avatars.Avatar1,
        };
        gateway.updatePlayer(socket, updateData);

        const players = gateway['matches'].get(gameCode);
        expect(players[0].name).toBe('NewName');
        expect(players[0].avatar).toBe(Avatars.Avatar1);

        expect(generateUniqueNameStub.calledWith(players, 'NewName', socket.id)).toBeTruthy();
        expect(emitPlayersInRoomStub.calledWith(gameCode)).toBeTruthy();
        generateUniqueNameStub.restore();
    });

    it('removePlayerFromRoom should remove player from room and update maps', () => {
        const gameCode = gateway.createMatchAndJoin(socket);
        const socketPlayer2 = createStubInstance<Socket>(Socket);
        Object.defineProperty(socketPlayer2, 'id', { value: 'player-2' });
        gateway.joinMatch(socketPlayer2, gameCode);

        gateway['removePlayerFromRoom'](socket, gameCode);

        expect(gateway['matches'].get(gameCode).some((p) => p.id === socket.id)).toBeFalsy();
        expect(gateway['playerToMatch'].has(socket.id)).toBeFalsy();
    });

    it('removePlayerFromRoom should call destroyRoom if room becomes empty', () => {
        const gameCode = gateway.createMatchAndJoin(socket);
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
        const gameCode = 'test-game-123';
        const players = [
            { id: 'player1', name: 'Player 1', isAdmin: true },
            { id: 'player2', name: 'Player 2', isAdmin: false },
        ] as Player[];

        gateway['matches'].set(gameCode, players);
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
        const gameCode = gateway.createMatchAndJoin(socket);
        const player = { id: 'player-id', name: 'Player', isAdmin: false } as Player;

        gateway['addPlayerToRoom'](player, gameCode, socket);
        const players = gateway['matches'].get(gameCode);

        expect(leaveGameStub.calledWith(socket)).toBeTruthy();
        expect(players.some((p) => p.id === player.id)).toBeTruthy();
        expect(gateway['playerToMatch'].get(player.id)).toBe(gameCode);
        expect(socket.join.calledWith(gameCode)).toBeTruthy();
        leaveGameStub.restore();
    });

    it('emitPlayersInRoom should send player list to room if room exists', () => {
        emitPlayersInRoomStub.restore();

        const gameCode = 'test-room';
        const testPlayers = [{ id: 'player1', name: 'Player 1', isAdmin: true }] as Player[];
        gateway['matches'].set(gameCode, testPlayers);

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
});
