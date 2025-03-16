import { TestBed } from '@angular/core/testing';
import { DEFAULT_GAME } from '@app/consts/default-game.const';
import { MOCK_MATCHES } from '@app/consts/tests/mock-matches';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { MapService } from '@app/services/map/map.service';
import { Match } from '@common/match';
import { Position } from '@common/position';
import { MatchDataService } from './match-data.service';
import { DEFAULT_MATCH } from './match-data.service.const';

describe('MatchDataService', () => {
    let service: MatchDataService;
    let mockGameDataService: jasmine.SpyObj<GameDataService>;
    let mockMapService: jasmine.SpyObj<MapService>;
    const mockMatch: Match = structuredClone(MOCK_MATCHES[0]);

    beforeEach(() => {
        mockGameDataService = jasmine.createSpyObj('GameDataService', ['setGameData', 'getMapSize']);
        mockMapService = jasmine.createSpyObj('MapService', ['setPlayers']);

        TestBed.configureTestingModule({
            providers: [
                MatchDataService,
                { provide: GameDataService, useValue: mockGameDataService },
                { provide: MapService, useValue: mockMapService },
            ],
        });
        service = TestBed.inject(MatchDataService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should start match by setting game data, match data, selfIndex, and players', () => {
        const socketId = mockMatch.matchData.players[0].id;

        service.startMatch(mockMatch, socketId);

        expect(mockGameDataService.setGameData).toHaveBeenCalledWith(mockMatch.gameData);
        expect(service.matchData).toEqual(mockMatch.matchData);
        expect(service.selfIndex).toBe(0);
        expect(mockMapService.setPlayers).toHaveBeenCalledWith(mockMatch.matchData.players);
    });

    it('should set selfIndex to -1 if socketId is not found in players', () => {
        const socketId = 'unknownSocketId';

        service.startMatch(mockMatch, socketId);

        expect(mockGameDataService.setGameData).toHaveBeenCalledWith(mockMatch.gameData);
        expect(service.matchData).toEqual(mockMatch.matchData);
        expect(service.selfIndex).toBe(-1);
        expect(mockMapService.setPlayers).toHaveBeenCalledWith(mockMatch.matchData.players);
    });

    it('should reset match to default values', () => {
        service.matchData = structuredClone(mockMatch.matchData);
        service.selfIndex = 1;

        service.resetMatch();

        expect(mockGameDataService.setGameData).toHaveBeenCalledWith(structuredClone(DEFAULT_GAME));
        expect(service.matchData).toEqual(structuredClone(DEFAULT_MATCH));
        expect(service.selfIndex).toBe(1);
    });

    it('should update match and emit matchUpdate event', () => {
        spyOn(service.matchUpdate, 'next');

        service.updateMatch(mockMatch);

        expect(mockGameDataService.setGameData).toHaveBeenCalledWith(mockMatch.gameData);
        expect(service.matchData).toEqual(mockMatch.matchData);
        expect(service.matchUpdate.next).toHaveBeenCalledWith(null);
    });

    it('should return true if selfIndex matches activePlayer', () => {
        service.startMatch(mockMatch, mockMatch.matchData.players[0].id);
        service.matchData.activePlayer = 0;

        expect(service.isActivePlayer()).toBeTrue();

        service.matchData.activePlayer = 1;
        expect(service.isActivePlayer()).toBeFalse();
    });

    it('should return player position for selfIndex', () => {
        const socketId = mockMatch.matchData.players[0].id;
        service.startMatch(mockMatch, socketId);

        const expectedPosition: Position = mockMatch.matchData.players[0].currentStats.position;
        expect(service.getPlayerPosition()).toEqual(expectedPosition);
    });
});
