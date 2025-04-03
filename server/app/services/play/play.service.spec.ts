/* eslint-disable max-lines */
// file exceeds max-lines limit by 10 lines
import { Match } from '@app/classes/match/match';
import { CombatService } from '@app/services/combat/combat.service';
import { MapService } from '@app/services/map/map.service';
import { AVATAR_EVOLVED_SUFFIX, AVATAR_SHINY_SUFFIX, MAX_ITEMS } from '@common/consts/player-data.const';
import { ItemType } from '@common/interfaces/item-type.enum';
import { GameMode } from '@common/interfaces/map-data';
import { MatchState } from '@common/interfaces/match-data';
import { PlayerData } from '@common/interfaces/player-data';
import { Position } from '@common/interfaces/position';
import { TileType } from '@common/interfaces/tile-type.enum';
import { MOCK_MATCH_DATAS } from '@common/test-consts/mock-matches';
import { MOCK_PLAYER_DATAS } from '@common/test-consts/mock-players';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonSandbox, SinonStubbedInstance, createSandbox, createStubInstance } from 'sinon';
import { PlayService } from './play.service';

describe('PlayService', () => {
    let service: PlayService;
    let sandbox: SinonSandbox;
    let mockMapService: SinonStubbedInstance<MapService>;
    let mockCombatService: SinonStubbedInstance<CombatService>;
    let mockMatch: SinonStubbedInstance<Match>;

    beforeAll(async () => {
        sandbox = createSandbox();
        mockMapService = createStubInstance(MapService);
        mockCombatService = createStubInstance(CombatService);
        mockMatch = createStubInstance(Match);

        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayService, { provide: MapService, useValue: mockMapService }, { provide: CombatService, useValue: mockCombatService }],
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
        mockMapService.getShortestPath.returns({ moveCost: 2, path: [{ x: 1, y: 1 }] });
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
        mockMapService.getActions.returns([{ x: 1, y: 1 }]);
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
        mockMapService.getPossibleMovesDebug.returns([position]);
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

    it('can player act should return true if actions available', () => {
        mockMapService.getActions.returns([{ x: 1, y: 1 }]);
        mockMatch.data.playData.hasAction = false;
        mockMapService.getPossibleMoves.returns([{ x: 1, y: 1 }]);

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

    it('dropItems should remove items from player and add them to map', () => {
        const playerId = 'player1';
        const itemToDrop = ItemType.Item3;
        const playerPosition = { x: 5, y: 5 };
        const dropPosition = { x: 6, y: 5 };

        const player = {
            ...structuredClone(MOCK_PLAYER_DATAS[0]),
            id: playerId,
            items: [itemToDrop, ItemType.Item1],
            position: playerPosition,
        };
        mockMatch.getPlayer.withArgs(playerId).returns(player);

        mockMatch.data.gameData.mapData.items = {
            [ItemType.Item1]: [],
            [ItemType.Item2]: [],
            [ItemType.Item3]: [],
        } as Record<ItemType, Position[]>;

        mockMapService.getNearestItemDropSpot.returns(dropPosition);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const computeItemsSpy = sandbox.spy(service as any, 'computeItems');

        service.dropItems(mockMatch, playerId, [itemToDrop]);

        expect(mockMapService.getNearestItemDropSpot.calledWith(mockMatch.data, playerPosition)).toBe(true);
        expect(mockMatch.data.gameData.mapData.items[itemToDrop]).toContain(dropPosition);
        expect(player.items).not.toContain(itemToDrop);
        expect(player.items).toContain(ItemType.Item1);
        expect(computeItemsSpy.calledWith(player)).toBe(true);
        expect(mockMatch.sendUpdate.called).toBe(true);
    });

    it('continueTurn should end match if win condition is met', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'checkWinCondition').returns(true);

        service.continueTurn(mockMatch);
        expect(mockMatch.setTimeout.called).toBe(true);
    });

    it('continueTurn should call checkAndPickupItem when state is MovementAnimation', () => {
        mockMatch.data.state = MatchState.MovementAnimation;
        mockMatch.data.playData.activePlayerIndex = 0;
        mockMatch.data.players = [{ id: 'player1' }] as PlayerData[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'checkWinCondition').returns(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const checkAndPickupItemSpy = sandbox.spy(service as any, 'checkAndPickupItem');

        service.continueTurn(mockMatch);
        expect(checkAndPickupItemSpy.called).toBe(true);
        expect(mockMatch.data.state).toBe(MatchState.TurnStart);
    });

    it('continueTurn should schedule force item drop when state is ItemDropSelection', () => {
        mockMatch.data.state = MatchState.ItemDropSelection;
        mockMatch.data.playData.activePlayerIndex = 0;
        mockMatch.data.players = [{ id: 'player1' }] as PlayerData[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'checkWinCondition').returns(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const scheduleForceItemDropSpy = sandbox.spy(service as any, 'scheduleForceItemDrop');

        service.continueTurn(mockMatch);
        expect(scheduleForceItemDropSpy.calledWith(mockMatch, 'player1')).toBe(true);
    });

    it('continueTurn should handle TurnWait state correctly based on player ability to act', () => {
        mockMatch.data.state = MatchState.TurnWait;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'checkWinCondition').returns(false);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'canPlayerAct').returns(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const scheduleTurnEndSpy = sandbox.spy(service as any, 'scheduleTurnEnd');

        service.continueTurn(mockMatch);

        expect(scheduleTurnEndSpy.calledWith(mockMatch)).toBe(true);

        sandbox.restore();

        mockMatch.data.state = MatchState.TurnWait;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'checkWinCondition').returns(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'canPlayerAct').returns(false);
        const startNextTurnSpy = sandbox.spy(service, 'startNextTurn');

        service.continueTurn(mockMatch);

        expect(startNextTurnSpy.calledWith(mockMatch)).toBe(true);
    });

    it('checkAndPickupItem should pick up item when player is on item position', () => {
        const playerData = {
            ...structuredClone(MOCK_PLAYER_DATAS[0]),
            position: { x: 1, y: 1 },
        };
        const itemType = ItemType.Item3;

        mockMapService.getItemTypeAtPosition.returns(itemType);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleItemAdditionSpy = sandbox.spy(service as any, 'handleItemAddition');

        service['checkAndPickupItem'](mockMatch, playerData);

        expect(mockMapService.getItemTypeAtPosition.calledWith(mockMatch.data, playerData.position)).toBe(true);
        expect(handleItemAdditionSpy.calledWith(mockMatch, playerData, itemType)).toBe(true);
    });

    it('handleItemAddition should add item to player inventory and remove from map', () => {
        const playerData = {
            ...structuredClone(MOCK_PLAYER_DATAS[0]),
            items: [ItemType.Item1],
            position: { x: 2, y: 2 },
        };
        const itemType = ItemType.Item3;
        mockMatch.data.gameData.mapData.items = {
            [ItemType.Item3]: [
                { x: 2, y: 2 },
                { x: 3, y: 3 },
            ],
        } as Record<ItemType, Position[]>;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const computeItemsSpy = sandbox.spy(service as any, 'computeItems');

        service['handleItemAddition'](mockMatch, playerData, itemType);

        expect(playerData.items).toContain(itemType);
        expect(mockMatch.data.gameData.mapData.items[itemType]).toEqual([{ x: 3, y: 3 }]);
        expect(computeItemsSpy.calledWith(playerData)).toBe(true);
        expect(mockMatch.data.state).not.toBe(MatchState.ItemDropSelection);
    });

    it('handleItemAddition should change state to ItemDropSelection when exceeding MAX_ITEMS', () => {
        const playerData = {
            ...structuredClone(MOCK_PLAYER_DATAS[0]),
            items: new Array(MAX_ITEMS).fill(ItemType.Item1),
            position: { x: 2, y: 2 },
        };
        const itemType = ItemType.Item3;
        mockMatch.data.gameData.mapData.items = {
            [ItemType.Item3]: [{ x: 2, y: 2 }],
        } as Record<ItemType, Position[]>;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const computeItemsSpy = sandbox.spy(service as any, 'computeItems');

        service['handleItemAddition'](mockMatch, playerData, itemType);

        expect(playerData.items).toContain(itemType);
        expect(mockMatch.data.gameData.mapData.items[itemType]).toEqual([]);
        expect(computeItemsSpy.called).toBe(false);
        expect(mockMatch.data.state).toBe(MatchState.ItemDropSelection);
    });

    it('forceItemDrop should drop excess item and continue turn', () => {
        const playerId = 'player1';
        const excessItem = ItemType.Item3;

        const playerItems = new Array(MAX_ITEMS + 1).fill(ItemType.Item1);
        playerItems[MAX_ITEMS] = excessItem;

        const player = {
            ...structuredClone(MOCK_PLAYER_DATAS[0]),
            id: playerId,
            items: playerItems,
        };

        mockMatch.getPlayer.withArgs(playerId).returns(player);

        const dropItemsSpy = sandbox.spy(service, 'dropItems');
        const continueTurnSpy = sandbox.spy(service, 'continueTurn');

        service['forceItemDrop'](mockMatch, playerId);

        expect(mockMatch.data.state).toBe(MatchState.TurnWait);
        expect(dropItemsSpy.calledWith(mockMatch, playerId, [excessItem])).toBe(true);
        expect(continueTurnSpy.calledWith(mockMatch)).toBe(true);
        expect(mockMatch.sendUpdate.called).toBe(true);
    });

    it('computeItems should update player avatar based on items', () => {
        const baseAvatar = 'avatar1';

        const player1 = {
            ...structuredClone(MOCK_PLAYER_DATAS[0]),
            avatar: baseAvatar,
            items: [],
        };

        service['computeItems'](player1 as PlayerData);
        expect(player1.avatar).toBe(baseAvatar);

        const player2 = {
            ...structuredClone(MOCK_PLAYER_DATAS[0]),
            avatar: baseAvatar,
            items: [ItemType.Item1],
        };

        service['computeItems'](player2 as PlayerData);
        expect(player2.avatar).toBe(baseAvatar + AVATAR_SHINY_SUFFIX);

        const player3 = {
            ...structuredClone(MOCK_PLAYER_DATAS[0]),
            avatar: baseAvatar,
            items: [ItemType.Item2],
        };

        service['computeItems'](player3 as PlayerData);
        expect(player3.avatar).toBe(baseAvatar + AVATAR_EVOLVED_SUFFIX);

        const player4 = {
            ...structuredClone(MOCK_PLAYER_DATAS[0]),
            avatar: baseAvatar,
            items: [ItemType.Item1, ItemType.Item2],
        };

        service['computeItems'](player4 as PlayerData);
        expect(player4.avatar).toBe(baseAvatar + AVATAR_EVOLVED_SUFFIX + AVATAR_SHINY_SUFFIX);
    });

    it('computeItems should not modify avatar when format is not standard', () => {
        const nonStandardAvatar = 'custom_avatar';

        const player = {
            ...structuredClone(MOCK_PLAYER_DATAS[0]),
            avatar: nonStandardAvatar,
            items: [ItemType.Item1, ItemType.Item2],
        };

        service['computeItems'](player as PlayerData);

        expect(player.avatar).toBe(nonStandardAvatar);
    });
});
