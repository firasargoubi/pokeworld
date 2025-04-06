import { TestBed } from '@angular/core/testing';
import { AVATAR_DATA } from '@common/consts/avatar-data.const';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { Position } from '@common/interfaces/position';
import { TILE_COST, TileType } from '@common/interfaces/tile-type.enum';
import { MOCK_GAME_DATAS } from '@common/test-consts/mock-games';
import { TileDescriptionService } from './tile-description.service';
import { MOCK_MATCH_DATAS } from '@common/test-consts/mock-matches';
import { MatchService } from '@app/services/match/match.service';
import { PlayerData } from '@common/interfaces/player-data';
import { MOCK_PLAYER_DATAS } from '@common/test-consts/mock-players';
import { MatchData } from '@common/interfaces/match-data';
import { TILE_EFFECT } from '@app/consts/tile-data.const';

describe('TileDescriptionService', () => {
    let service: TileDescriptionService;
    let mockGameDataService: jasmine.SpyObj<GameDataService>;
    let mockMatchService: jasmine.SpyObj<MatchService>;

    let mockPosition: Position = { x: 3, y: 4 };
    let mockPlayer: PlayerData;
    let mockMatchData: MatchData;

    beforeEach(() => {
        mockPosition = { x: 3, y: 4 };
        mockPlayer = { ...structuredClone(MOCK_PLAYER_DATAS[0]), position: mockPosition };
        mockMatchData = { ...structuredClone(MOCK_MATCH_DATAS[0]), players: [mockPlayer] };
        mockGameDataService = jasmine.createSpyObj('GameDataService', ['getTileFromPosition'], { gameData: mockMatchData.gameData });
        mockMatchService = jasmine.createSpyObj('MatchService', ['isActivePlayer', 'canUseDebugMove'], { data: mockMatchData });

        TestBed.configureTestingModule({
            providers: [
                TileDescriptionService,
                { provide: GameDataService, useValue: mockGameDataService },
                { provide: MatchService, useValue: mockMatchService },
            ],
        });
        service = TestBed.inject(TileDescriptionService);

        mockGameDataService.gameData = structuredClone(MOCK_GAME_DATAS[0]);

        mockGameDataService.getTileFromPosition.and.returnValue(TileType.Grass);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should hide tool description', () => {
        service.showTileDescription = true;
        service.hideTileDescription();
        expect(service.showTileDescription).toBeFalse();
    });

    it('should find player at position', () => {
        const result = service['findPlayerAtPosition'](mockPlayer.position);
        expect(result).toEqual(mockPlayer);
    });

    it('should update description with player info', () => {
        const result = service['updateDescription'](mockPlayer.position);
        expect(result).toBeTrue();
        expect(service.tileDescription.playerName).toBe(mockPlayer.name);
        expect(service.tileDescription.avatar).toBe(AVATAR_DATA[mockPlayer.avatar].imageCentered);
    });

    it('should update description with tile info', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        spyOn<any>(service, 'findPlayerAtPosition').and.returnValue(null);
        mockGameDataService.getTileFromPosition.and.returnValue(TileType.Grass);
        const result = service['updateDescription'](mockPosition);
        expect(result).toBeFalse();
        expect(service.tileDescription.cost).toBe(TILE_COST[TileType.Grass]);
        expect(service.tileDescription.effect).toBe(TILE_EFFECT[TileType.Grass]);
    });

    it('should display tool description', () => {
        const mockMapRect = {
            left: 100,
            top: 100,
            width: 800,
            height: 800,
            right: 900,
            bottom: 900,
            x: 100,
            y: 100,
        };
        const mockElement = document.createElement('div');
        Object.defineProperty(mockElement, 'getBoundingClientRect', {
            value: () => mockMapRect,
        });

        const mockEvent = {
            preventDefault: jasmine.createSpy('preventDefault'),
            clientX: 300,
            clientY: 200,
            currentTarget: mockElement,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mock mouse event
        } as any as MouseEvent;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        spyOn<any>(service, 'updateDescription').and.returnValue(false);

        service.displayTileDescription(mockEvent);

        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(service.showTileDescription).toBeTrue();
    });
});
