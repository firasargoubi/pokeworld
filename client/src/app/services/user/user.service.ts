import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiEndpoint } from '@common/interfaces/endpoint.enum';
import { UserInfo } from '@common/interfaces/user';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    readonly currentUserSubject = new BehaviorSubject<UserInfo | null>(this.loadUser());
    readonly user$ = this.currentUserSubject.asObservable();
    private readonly baseUrl: string = environment.serverUrl;
    private readonly http: HttpClient = inject(HttpClient);

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
        if (user === null) {
            localStorage.removeItem('user');
            this.currentUserSubject.next(null);
        } else {
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSubject.next(user);
        }
    }

    private loadUser(): UserInfo | null {
        try {
            const raw = localStorage.getItem('user');
            return raw ? (JSON.parse(raw) as UserInfo) : null;
        } catch (error) {
            return null;
        }
    }
}
