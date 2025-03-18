import { TestBed } from '@angular/core/testing';
import { TILE_EFFECT } from '@app/consts/tile-effect.const';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { MatchDataService } from '@app/services/match-data/match-data.service';
import { TileDescriptionService } from './tile-description.service';
import { MOCK_PLAYERS } from '@common/test-consts/mock-players';
import { AVATAR_DATA } from '@app/consts/avatar-data.const';
import { Player } from '@common/interfaces/player';
import { Position } from '@common/interfaces/position';
import { TileType, TILE_COST } from '@common/interfaces/tile-type.enum';
import { MOCK_GAME_DATAS } from '@common/test-consts/mock-games';

describe('TileDescriptionService', () => {
    let service: TileDescriptionService;
    let mockGameDataService: jasmine.SpyObj<GameDataService>;
    let mockMatchDataService: jasmine.SpyObj<MatchDataService>;

    const mockPosition: Position = { x: 3, y: 4 };
    const mockPlayer: Player = MOCK_PLAYERS[0];

    beforeEach(() => {
        mockGameDataService = jasmine.createSpyObj('GameDataService', ['getTileFromPosition']);
        mockMatchDataService = jasmine.createSpyObj('MatchDataService', [], {
            matchData: {
                players: [mockPlayer],
            },
        });

        TestBed.configureTestingModule({
            providers: [
                TileDescriptionService,
                { provide: GameDataService, useValue: mockGameDataService },
                { provide: MatchDataService, useValue: mockMatchDataService },
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
        const result = service['findPlayerAtPosition'](mockPlayer.currentStats.position);
        expect(result).toEqual(mockPlayer);
    });

    it('should update description with player info', () => {
        const result = service['updateDescription'](mockPlayer.currentStats.position);
        expect(result).toBeTrue();
        expect(service.tileDescription.playerName).toBe(mockPlayer.name);
        expect(service.tileDescription.avatar).toBe(AVATAR_DATA[mockPlayer.avatar].imageCentered);
    });
    it('should update description with tile info', () => {
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        } as any as MouseEvent;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        spyOn<any>(service, 'updateDescription').and.returnValue(false);

        service.displayTileDescription(mockEvent);

        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(service.showTileDescription).toBeTrue();
    });
});
