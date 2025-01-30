import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameData } from '@common/game-data';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    getAllGames(): Observable<GameData[]> {
        return this.http.get<GameData[]>(`${this.baseUrl}/games`);
    }
    // .pipe(catchError(this.handleError<GameData[]>('getAllGames'))); // CHECK if this is needed

    getGame(gameId: string): Observable<GameData> {
        return this.http.get<GameData>(`${this.baseUrl}/games/${gameId}`);
    }
    // .pipe(catchError(this.handleError<GameData>('getGame')));

    saveGame(gameData: GameData): Observable<GameData> {
        if (gameData._id) {
            return this.updateGame(gameData._id, gameData);
        } else {
            return this.addGame(gameData);
        }
    }

    addGame(gameData: GameData): Observable<GameData> {
        return this.http.post<GameData>(`${this.baseUrl}/games`, gameData);
    }
    // .pipe(catchError(this.handleError<GameData>('createGame')));

    updateGame(gameId: string, gameData: GameData): Observable<GameData> {
        return this.http.put<GameData>(`${this.baseUrl}/games/${gameId}`, gameData);
    }
    // .pipe(catchError(this.handleError<GameData>('updateGame')));

    toggleVisibility(gameId: string): Observable<GameData> {
        return this.http.patch<GameData>(`${this.baseUrl}/games/${gameId}/toggle`, {});
    }
    // .pipe(catchError(this.handleError<GameData>('toggleVisibility')));

    deleteGame(gameId: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/games/${gameId}`);
    }
    // .pipe(catchError(this.handleError<void>('deleteGame')));

    // private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
    //     return () => of(result as T);
}
