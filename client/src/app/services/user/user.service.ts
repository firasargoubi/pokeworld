import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiEndpoint } from '@common/interfaces/endpoint.enum';
import { UserInfo } from '@common/interfaces/user';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SocketService } from '@app/services/socket/socket.service';
import { UserEvent } from '@common/interfaces/socket-event.enum';

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

    getAllUsers(): Observable<UserInfo[]> {
        return this.http.get<UserInfo[]>(`${this.baseUrl}/${ApiEndpoint.User}`);
    }

    login(username: string, password: string): Observable<UserInfo> {
        return this.http.post<UserInfo>(`${this.baseUrl}/${ApiEndpoint.User}/login`, { username, password });
    }

    createAccount(username: string, password: string): Observable<UserInfo> {
        return this.http.post<UserInfo>(`${this.baseUrl}/${ApiEndpoint.User}/register`, { username, password });
    }

    logout(): Observable<void> {
        const userId = this.currentUserSubject.value?.userId;
        return this.http.post<void>(`${this.baseUrl}/${ApiEndpoint.User}/logout/${userId}`, {});
    }

    setUser(user: UserInfo | null): void {
        this.currentUserSubject.next(user);
        this.socketService.emit(UserEvent.Associate, user);
    }
}
