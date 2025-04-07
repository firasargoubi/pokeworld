import { Test, TestingModule } from '@nestjs/testing';
import { SinonSandbox, SinonStubbedInstance, createSandbox, createStubInstance } from 'sinon';
import { BotService } from './bot.service';
import { MapService } from '@app/services/map/map.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { CombatGateway } from '@app/gateways/combat/combat.gateway';
import { PlayGateway } from '@app/gateways/play/play.gateway';
import { MOCK_MATCH_DATAS } from '@common/test-consts/mock-matches';
import { Match } from '@app/classes/match/match';
import { PlayerData, PlayerType } from '@common/interfaces/player-data';
import { MOCK_PLAYER_DATAS } from '@common/test-consts/mock-players';
import { MatchData, MatchState } from '@common/interfaces/match-data';
import { TileType } from '@common/interfaces/tile-type.enum';
import { ItemType } from '@common/interfaces/item-type.enum';
import { Position } from '@common/interfaces/position';
import { BOT_CODE_LENGTH } from './bot.service.const';

describe('BotService', () => {
    let service: BotService;
    let sandbox: SinonSandbox;
    let mockMapService: SinonStubbedInstance<MapService>;
    let mockLobbyService: SinonStubbedInstance<LobbyService>;
    let mockCombatGateway: SinonStubbedInstance<CombatGateway>;
    let mockPlayGateway: SinonStubbedInstance<PlayGateway>;
    let mockMatch: SinonStubbedInstance<Match>;
    let mockBotPlayer: PlayerData;

    beforeAll(async () => {
        sandbox = createSandbox();
        mockMapService = createStubInstance<MapService>(MapService);
        mockLobbyService = createStubInstance<LobbyService>(LobbyService);
        mockCombatGateway = createStubInstance<CombatGateway>(CombatGateway);
        mockPlayGateway = createStubInstance<PlayGateway>(PlayGateway);
        mockMatch = createStubInstance<Match>(Match);
        mockMapService.getShortestPath.callsFake((_matchData: MatchData, position: Position) => {
            return { moveCost: position.x, path: [position] };
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BotService,
                { provide: MapService, useValue: mockMapService },
                { provide: LobbyService, useValue: mockLobbyService },
                { provide: CombatGateway, useValue: mockCombatGateway },
                { provide: PlayGateway, useValue: mockPlayGateway },
            ],
        }).compile();

        service = module.get<BotService>(BotService);
    });

    beforeEach(() => {
        mockMatch.data = structuredClone(MOCK_MATCH_DATAS[0]);
        mockBotPlayer = { ...structuredClone(MOCK_PLAYER_DATAS[0]), type: PlayerType.BotAggressive };
        mockMatch.data.players[0] = mockBotPlayer;
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('on match update should call correct bot function', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const onTurnWaitStub = sandbox.stub(service as any, 'onTurnWait');
        mockMatch.data.state = MatchState.TurnWait;
        service.onMatchUpdate(mockMatch);
        expect(onTurnWaitStub.calledWith(mockMatch)).toBeTruthy();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const onItemWaitStub = sandbox.stub(service as any, 'onItemWait');
        mockMatch.data.state = MatchState.ItemDropSelection;
        service.onMatchUpdate(mockMatch);
        expect(onItemWaitStub.calledWith(mockMatch)).toBeTruthy();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const onCombatWaitStub = sandbox.stub(service as any, 'onCombatWait');
        mockMatch.data.state = MatchState.CombatWait;
        service.onMatchUpdate(mockMatch);
        expect(onCombatWaitStub.calledWith(mockMatch)).toBeTruthy();
    });

    it('get bot data should return bot data with strong attack', () => {
        const randomNumber = 0.1;
        sandbox.stub(Math, 'random').returns(randomNumber);
        mockLobbyService.getUniqueName.returns('BotName1');
        const result1 = service.getBotData(mockMatch);
        expect(result1).toBeDefined();
    });

    it('get bot data should return bot data with strong defense', () => {
        const randomNumber = 0.9;
        sandbox.stub(Math, 'random').returns(randomNumber);
        mockLobbyService.getUniqueName.returns('BotName2');
        const result2 = service.getBotData(mockMatch);
        expect(result2).toBeDefined();
    });

    it('on turn wait should call set bot timeout', () => {
        service['onTurnWait'](mockMatch);
        expect(mockMatch.setBotTimeout.called).toBeTruthy();
    });

    it('get random number should return random number', () => {
        const result = service['getRandomNumber'](1, 2);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(2);
    });

    it('bot action should execute bot action', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        sandbox.stub(service as any, 'getBestAttack').returns({ x: 6, y: 7 });
        service['botAction'](mockBotPlayer, mockMatch);
        expect(mockPlayGateway.action.called).toBeTruthy();
    });

    it('bot action should execute end turn', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        sandbox.stub(service as any, 'getBestAttack').returns(null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        sandbox.stub(service as any, 'getBestMoveToPlayer').returns(null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        sandbox.stub(service as any, 'getBestMoveToItem').returns(null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        sandbox.stub(service as any, 'getBestBridgeAction').returns(null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        sandbox.stub(service as any, 'getBestMoveToBridge').returns(null);

        service['botAction'](mockBotPlayer, mockMatch);
        expect(mockPlayGateway.endTurn.called).toBeTruthy();
    });

    it('bot action should execute end turn on player position', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        sandbox.stub(service as any, 'getBestAttack').returns(mockBotPlayer.position);
        service['botAction'](mockBotPlayer, mockMatch);
        expect(mockPlayGateway.endTurn.called).toBeTruthy();
    });

    it('get best move to bridge should return correct position', () => {
        mockMatch.data.gameData.mapData.tiles[2][0] = TileType.BrokenBridge;
        mockMapService.getPossibleMoves.returns([{ x: 1, y: 1 }]);
        const result = service['getBestMoveToBridge'](mockMatch);
        expect(result).toBeDefined();
    });

    it('get best bridge action should return correct position', () => {
        mockMatch.data.playData.hasAction = true;
        const bridgePosition = { x: 1, y: 7 };
        mockMatch.data.gameData.mapData.tiles[bridgePosition.x][bridgePosition.y] = TileType.BrokenBridge;
        mockMapService.getActions.returns([bridgePosition]);
        const result = service['getBestBridgeAction'](mockMatch);
        expect(result).toEqual(bridgePosition);
    });

    it('get best bridge action should return self position', () => {
        mockMatch.data.playData.hasAction = false;
        const bridgePosition = { x: 1, y: 7 };
        mockMatch.data.gameData.mapData.tiles[bridgePosition.x][bridgePosition.y] = TileType.BrokenBridge;
        mockMapService.getActions.returns([bridgePosition]);
        const result = service['getBestBridgeAction'](mockMatch);
        expect(result).not.toEqual(bridgePosition);
    });

    it('get best move to player should return correct position', () => {
        mockMapService.getPossibleMoves.returns([{ x: 1, y: 1 }]);
        const result = service['getBestMoveToPlayer'](mockMatch);
        expect(result).toBeDefined();
    });

    it('get best move to item should return correct position', () => {
        mockMapService.getPossibleMoves.returns([{ x: 1, y: 1 }]);
        const result = service['getBestMoveToItem'](mockMatch);
        expect(result).toBeDefined();
    });

    it('get best move should return correct position', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        sandbox.stub(service as any, 'getBestPath').returns({ moveCost: 1, path: [{ x: 0, y: 2 }] });
        mockMapService.getPossibleMoves.returns([{ x: 0, y: 2 }]);
        const result = service['getBestMove']([{ x: 0, y: 2 }], mockMatch);
        expect(result).toEqual({ x: 0, y: 2 });
    });

    it('get best move should return self position', () => {
        mockMapService.getPossibleMoves.returns([{ x: 1, y: 1 }]);
        const result = service['getBestMove']([{ x: 1, y: 1 }], mockMatch);
        expect(result).toEqual({ x: 1, y: 1 });
    });

    it('get best path should return path with lowest moveCost', () => {
        const targetPositions = [
            { x: 2, y: 2 },
            { x: 1, y: 1 },
            { x: 3, y: 3 },
        ];
        const result = service['getBestPath'](targetPositions, mockMatch);
        expect(result.moveCost).toBe(1);
    });

    it('get best attack should return correct position', () => {
        mockMatch.data.playData.hasAction = true;
        mockMapService.getActions.returns([{ x: 1, y: 1 }]);
        const result = service['getBestAttack'](mockMatch);
        expect(result).toEqual({ x: 1, y: 1 });
    });

    it('get best attack should return self position', () => {
        mockMatch.data.playData.hasAction = false;
        const action = { x: 2, y: 2 };
        mockMapService.getActions.returns([action]);
        const result = service['getBestAttack'](mockMatch);
        expect(result).not.toEqual(action);
    });

    it('on item wait should call set bot timeout', () => {
        service['onItemWait'](mockMatch);
        expect(mockMatch.setBotTimeout.called).toBeTruthy();
    });

    it('item action should drop correct item', () => {
        mockBotPlayer.items = [ItemType.Item1, ItemType.Item2, ItemType.Item3];
        service['itemAction'](mockBotPlayer);
        expect(mockPlayGateway.dropItem.called).toBeTruthy();
    });

    it('on combat wait should call set bot timeout', () => {
        service['onCombatWait'](mockMatch);
        expect(mockMatch.setBotTimeout.called).toBeTruthy();

        mockMatch.data.combatData.isSecondPlayerTurn = true;
        service['onCombatWait'](mockMatch);
        expect(mockMatch.setBotTimeout.called).toBeTruthy();
    });

    it('bot combat action should execute correct action', () => {
        const mockPlayerCombatData = mockMatch.data.combatData.playersCombatData[0];
        service['botCombatAction'](mockBotPlayer, mockPlayerCombatData);
        expect(mockCombatGateway.attack.called).toBeTruthy();

        mockBotPlayer.type = PlayerType.BotDefensive;
        mockPlayerCombatData.currentHealth = 1;
        mockPlayerCombatData.currentEscapes = 1;
        service['botCombatAction'](mockBotPlayer, mockPlayerCombatData);
        expect(mockCombatGateway.escape.called).toBeTruthy();
    });

    it('get bot avatar should return valid avatar', () => {
        const result = service['getBotAvatar'](mockMatch);
        expect(result).toBeDefined();
    });

    it('get bot id should return random id', () => {
        const result = service['getBotId']();
        expect(result.length).toBe(BOT_CODE_LENGTH);
    });
});
