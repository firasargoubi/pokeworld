import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GameData } from '@common/interfaces/game-data';
import { GameMode } from '@common/interfaces/game-mode.enum';
import { MapSize } from '@common/interfaces/map-size.enum';
import { ItemData } from '@common/interfaces/item-data';
import { GameService } from './game.service';

describe('Service: Game', () => {
    let httpMock: HttpTestingController;
    let service: GameService;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
        });
        service = TestBed.inject(GameService);
        httpMock = TestBed.inject(HttpTestingController);
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return all games', () => {
        const expectedGames: GameData[] = [
            {
                _id: '1',
                name: 'Game 1',
                description: 'Description of Game 1',
                lastEdited: new Date('2023-01-01T00:00:00.000Z'),
                isVisible: true,
                mapData: {
                    tiles: [],
                    itemData: {} as ItemData,
                    size: MapSize.Small,
                    gameMode: GameMode.CTF,
                },
                thumbnail: 'assets/tileset/grass.png',
            },
            {
                _id: '2',
                name: 'Game 2',
                description: 'Description of Game 2',
                lastEdited: new Date('2023-01-02T00:00:00.000Z'),
                isVisible: false,
                mapData: {
                    tiles: [],
                    itemData: {} as ItemData,
                    size: MapSize.Large,
                    gameMode: GameMode.FFA,
                },
                thumbnail: 'assets/tileset/water.png',
            },
        ];

        service.getAllGames().subscribe({
            next: (response: GameData[]) => {
                expect(response).toEqual(expectedGames);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/games`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedGames);
    });

    it('should toggle visibility of a game', () => {
        const mockGame: GameData = {
            _id: '1',
            name: 'Game 1',
            description: 'Description of Game 1',
            lastEdited: new Date('2023-01-01T00:00:00.000Z'),
            isVisible: true,
            mapData: {
                tiles: [],
                itemData: {} as ItemData,
                size: MapSize.Small,
                gameMode: GameMode.CTF,
            },
            thumbnail: 'assets/tileset/grass.png',
        };

        service.toggleVisibility(mockGame._id).subscribe({
            next: (response: GameData) => {
                expect(response.isVisible).toBeFalse();
            },
            error: fail,
        });

        // CHECK if toogleGame is necessary or just expect toequal mockGame
        const toggledGame = { ...mockGame, isVisible: false };
        const req = httpMock.expectOne(`${baseUrl}/games/${mockGame._id}/toggle`);
        expect(req.request.method).toBe('PATCH');
        req.flush(toggledGame);
    });

    it('should delete a game', () => {
        const gameId = '1';

        service.deleteGame(gameId).subscribe({
            next: () => expect(true).toBe(true),
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/games/${gameId}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });

    // CHECK error handling tests are needed
});
