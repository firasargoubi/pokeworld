import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameData } from '@common/interfaces/game-data';
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
    // .pipe(catchError(this.handleError<GameData[]>('getAllGames'))); // check if this is needed

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
