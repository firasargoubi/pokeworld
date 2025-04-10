import { Match } from '@app/classes/match/match';
import { MatchService } from '@app/services/match/match.service';
import { ItemType } from '@common/interfaces/item-type.enum';
import { GameMode } from '@common/interfaces/map-data';
import { MatchData } from '@common/interfaces/match-data';
import { Position } from '@common/interfaces/position';
import { TileType } from '@common/interfaces/tile-type.enum';
import { MOCK_MATCH_DATAS, MOCK_PLAYER_COMBAT_DATAS } from '@common/test-consts/mock-matches';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { StatService } from './stat.service';
import { CombatService } from '@app/services/combat/combat.service';

describe('StatService', () => {
    let service: StatService;
    let match: Match;
    let mockMatchService: sinon.SinonStubbedInstance<MatchService>;
    let mockCombatService: sinon.SinonStubbedInstance<CombatService>;
    let matchData: MatchData;

    beforeEach(async () => {
        mockMatchService = sinon.createStubInstance(MatchService);
        mockCombatService = sinon.createStubInstance(CombatService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [StatService, { provide: MatchService, useValue: mockMatchService }, { provide: CombatService, useValue: mockCombatService }],
        }).compile();

        service = module.get<StatService>(StatService);
        matchData = structuredClone(MOCK_MATCH_DATAS[0]);
        match = new Match(matchData, mockMatchService);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should update start and stop tracking times', () => {
        const beforeStartTime = Date.now();
        service.startTrackingMatch(match);
        expect(matchData.trackingData.startTime).toBeGreaterThanOrEqual(beforeStartTime);
        expect(matchData.trackingData.startTime).toBeLessThanOrEqual(Date.now());
        service.stopTrackingMatch(match);
        expect(matchData.trackingData.endTime).toBeGreaterThanOrEqual(matchData.trackingData.startTime);
        expect(matchData.trackingData.startTime).toBeLessThanOrEqual(Date.now());
    });

    it('should update HPs correctly when the attack result is lower than current health', () => {
        const attackerCombat = match.data.combatData.playersCombatData[0];
        const attackedCombat = match.data.combatData.playersCombatData[1];
        const attackerPlayer = match.data.players[attackerCombat.playerIndex];
        const attackedPlayer = match.data.players[attackedCombat.playerIndex];
        const attackResult = attackedCombat.currentHealth - 1;
        const realDamage = attackResult;

        mockCombatService.getActivePlayerData.returns(attackerCombat);
        mockCombatService.getInactivePlayerData.returns(attackedCombat);

        service.updateHps(match, attackResult);
        expect(service['getPlayerStat'](match, attackerPlayer.id).hpInflicted).toEqual(realDamage);
        expect(service['getPlayerStat'](match, attackedPlayer.id).hpLost).toEqual(attackResult);
    });

    it('should update HPs correctly when the attacker is higher than current health', () => {
        const attackerCombat = match.data.combatData.playersCombatData[0];
        const attackedCombat = match.data.combatData.playersCombatData[1];
        const attackerPlayer = match.data.players[attackerCombat.playerIndex];
        const attackedPlayer = match.data.players[attackedCombat.playerIndex];
        const attackResult = attackedCombat.currentHealth + 1;

        mockCombatService.getActivePlayerData.returns(attackerCombat);
        mockCombatService.getInactivePlayerData.returns(attackedCombat);

        expect(match).toBeDefined();
        service.updateHps(match, attackResult);
        const realDamage = attackedCombat.currentHealth;
        expect(service['getPlayerStat'](match, attackerPlayer.id).hpInflicted).toEqual(realDamage);
        expect(service['getPlayerStat'](match, attackedPlayer.id).hpLost).toEqual(realDamage);
    });

    it('should update escapes correctly', () => {
        const playerCombat = structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]);
        service.updateEscapes(match, playerCombat);
        expect(service['getPlayerStat'](match, matchData.players[0].id).escapes).toEqual(1);
    });

    it('should update combats correctly', () => {
        const winner = structuredClone(MOCK_PLAYER_COMBAT_DATAS[0]);
        const loser = structuredClone(MOCK_PLAYER_COMBAT_DATAS[1]);
        service.updateCombats(match, winner, loser);
        expect(service['getPlayerStat'](match, matchData.players[0].id).victories).toEqual(1);
        expect(service['getPlayerStat'](match, matchData.players[1].id).defeats).toEqual(1);
        expect(service['getPlayerStat'](match, matchData.players[0].id).combats).toEqual(1);
        expect(service['getPlayerStat'](match, matchData.players[1].id).combats).toEqual(1);
    });

    it('should update rounds correctly', () => {
        const initialRounds = matchData.trackingData.rounds;
        service.updateRounds(match);
        expect(matchData.trackingData.rounds).toEqual(initialRounds + 1);
    });

    it('should update winner correctly', () => {
        const winnerPlayer = matchData.players[0];
        service.updateWinner(match, winnerPlayer);
        expect(matchData.trackingData.matchWinner).toEqual({
            id: winnerPlayer.id,
            name: winnerPlayer.name || undefined,
            avatar: winnerPlayer.avatar,
            tile: matchData.combatData.playersCombatData[0].standingTile,
        });
    });

    it('should update items and flagHoldersCount correctly', () => {
        matchData.gameData.mapData.gameMode = GameMode.CTF;
        const playerId = matchData.players[0].id;
        const initialPickers = matchData.trackingData.flagHoldersCount;
        service.updateItems(match, ItemType.Flag, playerId);
        expect(service['getPlayerStat'](match, playerId).pickedUpItems).toContain(ItemType.Flag);
        expect(matchData.trackingData.flagHoldersCount).toEqual(initialPickers + 1);
        service.updateItems(match, ItemType.Flag, playerId);
        expect(matchData.trackingData.flagHoldersCount).toEqual(initialPickers + 1);
    });

    it('should update ground tiles correctly when tile is not Bridge', () => {
        const playerId = matchData.players[0].id;
        service.updateGroundTiles(match, { x: 0, y: 0 }, playerId);
        expect(matchData.trackingData.coveredGroundTiles).toContainEqual({ x: 0, y: 0 });
        expect(service['getPlayerStat'](match, playerId).coveredGroundTiles).toContainEqual({ x: 0, y: 0 });
        service.updateGroundTiles(match, { x: 0, y: 0 }, playerId);
        const count = matchData.trackingData.coveredGroundTiles.filter((p: Position) => p.x === 0 && p.y === 0).length;
        expect(count).toEqual(1);
    });

    it('should not update ground tiles if tile is Bridge', () => {
        const playerId = matchData.players[0].id;
        matchData.gameData.mapData.tiles[0][0] = TileType.Bridge;

        service.updateGroundTiles(match, { x: 0, y: 0 }, playerId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const addPosIfNewSpy = jest.spyOn(service as any, 'addPosIfNew');
        expect(addPosIfNewSpy).not.toBeCalled();
        expect(matchData.trackingData.coveredGroundTiles.length).toBe(0);
    });

    it('should update toggled bridges correctly', () => {
        service.updateToggledBridges(match, { x: 1, y: 1 });
        expect(matchData.trackingData.coveredBridges).toContainEqual({ x: 1, y: 1 });
        service.updateToggledBridges(match, { x: 1, y: 1 });
        const count = matchData.trackingData.coveredBridges.filter((p: Position) => p.x === 1 && p.y === 1).length;
        expect(count).toEqual(1);
    });
});
