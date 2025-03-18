import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GameData } from '@common/interfaces/game-data';
import { MOCK_GAME_DATAS } from '@common/test-consts/mock-games';
import { GameSaveService } from './game-save.service';

describe('GameSave', () => {
    let httpMock: HttpTestingController;
    let service: GameSaveService;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
        });
        service = TestBed.inject(GameSaveService);
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
        const expectedGames: GameData[] = MOCK_GAME_DATAS;

        service.getAllGames().subscribe({
            next: (response: GameData[]) => {
                expect(response.length).toBe(MOCK_GAME_DATAS.length);
                expect(response).toEqual(expectedGames);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/games`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedGames);
    });

    it('should return a game by ID', () => {
        const mockGame: GameData = MOCK_GAME_DATAS[0];

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
        const updatedGame = { ...MOCK_GAME_DATAS[0], name: 'Updated Name' };

        service.saveGame(updatedGame).subscribe((game) => {
            expect(game.name).toBe('Updated Name');
        });

        const req = httpMock.expectOne(`${baseUrl}/games`);
        expect(req.request.method).toBe('PUT');
        req.flush(updatedGame);
    });

    it('should add a new game if _id does not exist', () => {
        const newGame: GameData = { ...MOCK_GAME_DATAS[0], _id: '' };

        service.saveGame(newGame).subscribe((game) => {
            expect(game).toEqual(newGame);
        });

        const req = httpMock.expectOne(`${baseUrl}/games`);
        expect(req.request.method).toBe('PUT');
        req.flush(newGame);
    });

    it('should create a new game', () => {
        const newGame: GameData = MOCK_GAME_DATAS[0];

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
        const updatedGame: GameData = MOCK_GAME_DATAS[0];

        service.updateGame(updatedGame._id, updatedGame).subscribe({
            next: (response: GameData) => {
                expect(response).toEqual(updatedGame);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/games/${updatedGame._id}`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual(updatedGame);
        req.flush(updatedGame);
    });

    it('should toggle visibility of a game', () => {
        const toggledGame = { ...MOCK_GAME_DATAS[0], isVisible: !MOCK_GAME_DATAS[0].isVisible };

        service.toggleVisibility(toggledGame._id).subscribe({
            next: (response: GameData) => {
                expect(response.isVisible).toBe(!MOCK_GAME_DATAS[0].isVisible);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/games/${toggledGame._id}/toggle`);
        expect(req.request.method).toBe('PATCH');
        req.flush(toggledGame);
    });

    it('should delete a game', () => {
        const gameId = MOCK_GAME_DATAS[0]._id;

        service.deleteGame(gameId).subscribe({
            next: (response) => expect(response).toBeNull(),
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/games/${gameId}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });

    it('should check if name is unique without an ID', () => {
        const gameName = 'UniqueGame';

        service.isNameUnique(gameName).subscribe((response) => {
            expect(response).toBe(true);
        });

        const req = httpMock.expectOne(`${baseUrl}/games/is-name-unique?name=${gameName}&id=`);
        expect(req.request.method).toBe('GET');
        req.flush(true);
    });

    it('should check if name is unique with an ID', () => {
        service.isNameUnique(MOCK_GAME_DATAS[0].name, MOCK_GAME_DATAS[0]._id).subscribe((response) => {
            expect(response).toBe(false);
        });

        const encodedGameName = encodeURIComponent(MOCK_GAME_DATAS[0].name);
        const req = httpMock.expectOne(`${baseUrl}/games/is-name-unique?name=${encodedGameName}&id=${MOCK_GAME_DATAS[0]._id}`);
        expect(req.request.method).toBe('GET');
        req.flush(false);
    });
});
