import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameData } from '@common/game-data';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameSaveService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    getAllGames(): Observable<GameData[]> {
        return this.http.get<GameData[]>(`${this.baseUrl}/games`);
    }

    getGame(gameId: string): Observable<GameData> {
        return this.http.get<GameData>(`${this.baseUrl}/games/${gameId}`);
    }

    saveGame(gameData: GameData): Observable<GameData> {
        return this.http.put<GameData>(`${this.baseUrl}/games`, gameData);
    }

    addGame(gameData: GameData): Observable<GameData> {
        return this.http.post<GameData>(`${this.baseUrl}/games`, gameData);
    }

    updateGame(gameId: string, gameData: GameData): Observable<GameData> {
        return this.http.patch<GameData>(`${this.baseUrl}/games/${gameId}`, gameData);
    }

    toggleVisibility(gameId: string): Observable<GameData> {
        return this.http.patch<GameData>(`${this.baseUrl}/games/${gameId}/toggle`, {});
    }

    deleteGame(gameId: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/games/${gameId}`);
    }

    isNameUnique(name: string, id?: string): Observable<{ isUnique: boolean }> {
        const url = id ? `${this.baseUrl}/games/isNameUnique/${name}/${id}` : `${this.baseUrl}/games/isNameUnique/${name}`;
        return this.http.get<{ isUnique: boolean }>(url);
    }
}
