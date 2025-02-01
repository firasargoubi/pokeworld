import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GameData } from '@common/game-data';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapSize } from '@common/map-size.enum';
import { Position } from '@common/position';
import { of } from 'rxjs';
import { GameService } from './game-save.service';

describe('Service: Game', () => {
    let httpMock: HttpTestingController;
    let service: GameService;
    let baseUrl: string;

    const mockGames: GameData[] = [
        {
            _id: '1',
            name: 'Game 1',
            description: 'Description of Game 1',
            lastEdited: new Date('2023-01-01T00:00:00.000Z'),
            isVisible: true,
            mapData: {
                tiles: [],
                items: {} as Record<ItemType, Position[]>,
                size: MapSize.Small,
                gameMode: GameMode.CTF,
            },
            thumbnail: 'assets/tileset/grass.png',
        },
        {
            _id: '',
            name: 'Game 2',
            description: 'Description of Game 2',
            lastEdited: new Date('2023-01-02T00:00:00.000Z'),
            isVisible: false,
            mapData: {
                tiles: [],
                items: {} as Record<ItemType, Position[]>,
                size: MapSize.Large,
                gameMode: GameMode.FFA,
            },
            thumbnail: 'assets/tileset/water.png',
        },
    ];

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
        const expectedGames: GameData[] = mockGames;

        service.getAllGames().subscribe({
            next: (response: GameData[]) => {
                expect(response.length).toBe(2);
                expect(response).toEqual(expectedGames);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/games`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedGames);
    });

    it('should return a game by ID', () => {
        const mockGame: GameData = mockGames[0];

        service.getGame(mockGame._id).subscribe({
            next: (response: GameData) => {
                expect(response).toEqual(mockGame);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/games/${mockGame._id}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockGame);
    });

    it('should update the game if _id exists', () => {
        const updatedGame = { ...mockGames[0], name: 'Updated Name' };
        const updateSpy = spyOn(service, 'updateGame').and.callFake(() => of(updatedGame));

        service.saveGame(updatedGame).subscribe((game) => {
            expect(game.name).toBe('Updated Name');
        });

        expect(updateSpy).toHaveBeenCalledWith(updatedGame._id, updatedGame);
    });

    it('should add a new game if _id does not exist', () => {
        const newGame: GameData = { ...mockGames[0], _id: '' };
        const addSpy = spyOn(service, 'addGame').and.callFake(() => of(newGame));

        service.saveGame(newGame).subscribe((game) => {
            expect(game).toEqual(newGame);
        });

        expect(addSpy).toHaveBeenCalledWith(newGame);
    });

    it('should create a new game', () => {
        const newGame: GameData = mockGames[0];

        service.addGame(newGame).subscribe({
            next: (response: GameData) => {
                expect(response).toEqual(newGame);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/games`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(newGame);
        req.flush(newGame);
    });

    it('should update an existing game', () => {
        const updatedGame: GameData = mockGames[0];

        service.updateGame(updatedGame._id, updatedGame).subscribe({
            next: (response: GameData) => {
                expect(response).toEqual(updatedGame);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/games/${updatedGame._id}`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(updatedGame);
        req.flush(updatedGame);
    });

    it('should toggle visibility of a game', () => {
        const toggledGame = { ...mockGames[0], isVisible: !mockGames[0].isVisible };

        service.toggleVisibility(toggledGame._id).subscribe({
            next: (response: GameData) => {
                expect(response.isVisible).toBe(!mockGames[0].isVisible);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/games/${toggledGame._id}/toggle`);
        expect(req.request.method).toBe('PATCH');
        req.flush(toggledGame);
    });

    it('should delete a game', () => {
        const gameId = mockGames[0]._id;

        service.deleteGame(gameId).subscribe({
            next: (response) => expect(response).toBeNull(),
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/games/${gameId}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });

    // CHECK : test quality overall / error handling tests are needed or not / and is mocking correct
});
