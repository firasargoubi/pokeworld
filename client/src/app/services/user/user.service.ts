import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { ApiEndpoint } from '@common/interfaces/endpoint.enum';
import { UserPreferences } from '@common/interfaces/preferences';
import { UserEvent } from '@common/interfaces/socket-event.enum';
import { UserInfo } from '@common/interfaces/user';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private readonly currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
    // eslint-disable-next-line @typescript-eslint/member-ordering -- private attribute first
    readonly user$ = this.currentUserSubject.asObservable();
    private readonly baseUrl: string = environment.serverUrl;
    private readonly http: HttpClient = inject(HttpClient);
    private readonly socketService: SocketService = inject(SocketService);

    get currentUser(): UserInfo | null {
        return this.currentUserSubject.value;
    }

    getAllUsers(): Observable<UserInfo[]> {
        return this.http.get<UserInfo[]>(`${this.baseUrl}/${ApiEndpoint.User}`);
    }

    login(username: string, password: string): Observable<UserInfo> {
        return this.http.post<UserInfo>(`${this.baseUrl}/${ApiEndpoint.User}/login`, { username, password });
    }

    createAccount(
        fields: { username: string; password: string; email: string; profilePicture: string; fullProfilePicture?: string },
        preferences: Partial<UserPreferences>,
    ): Observable<UserInfo> {
        const payload: Record<string, unknown> = { ...fields, preferences };
        return this.http.post<UserInfo>(`${this.baseUrl}/${ApiEndpoint.User}/register`, payload);
    }

    updatePreferences(userId: string, preferences: Partial<UserPreferences>): Observable<UserPreferences> {
        return this.http.patch<UserPreferences>(`${this.baseUrl}/${ApiEndpoint.User}/${userId}/preferences`, preferences);
    }

    logout(): Observable<void> {
        const userId = this.currentUserSubject.value?.userId;
        return this.http.post<void>(`${this.baseUrl}/${ApiEndpoint.User}/logout/${userId}`, {});
    }

    edit(userId: string, changes: { oldPassword?: string; password?: string; username?: string }): Observable<UserInfo> {
        const body: Record<string, string> = { userId };
        if (changes.oldPassword) body.oldPassword = changes.oldPassword;
        if (changes.password) body.password = changes.password;
        if (changes.username && changes.username.trim()) body.username = changes.username.trim();
        return this.http.put<UserInfo>(`${this.baseUrl}/${ApiEndpoint.User}/edit`, body);
    }

    delete(userId: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${ApiEndpoint.User}/${userId}`);
    }

    isAuthenticated(): boolean {
        return this.currentUserSubject.value !== null;
    }

    setUser(user: UserInfo | null): void {
        this.currentUserSubject.next(user);
        this.socketService.emit(UserEvent.Associate, user);
    }
}
