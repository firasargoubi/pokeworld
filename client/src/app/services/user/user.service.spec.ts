import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SocketService } from '@app/services/socket/socket.service';
import { ApiEndpoint } from '@common/interfaces/endpoint.enum';
import { UserEvent } from '@common/interfaces/socket-event.enum';
import { UserInfo } from '@common/interfaces/user';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';

describe('UserService', () => {
    let httpMock: HttpTestingController;
    let service: UserService;
    let baseUrl: string;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    const mockUser: UserInfo = { username: 'testuser', userId: '1234', email: '', profilePicture: 'defaultPic', balance: 100, createdAt: new Date() };

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['emit']);
        TestBed.configureTestingModule({
            providers: [
                UserService,
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
                { provide: SocketService, useValue: socketServiceSpy },
            ],
        });
        service = TestBed.inject(UserService);
        httpMock = TestBed.inject(HttpTestingController);
        baseUrl = environment.serverUrl;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get all users', () => {
        service.getAllUsers().subscribe({
            next: (users) => {
                expect(users).toEqual([mockUser]);
            },
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/${ApiEndpoint.User}`);
        expect(req.request.method).toBe('GET');
        req.flush([mockUser]);
    });

    it('should login user', () => {
        service.login('testuser', 'password').subscribe({
            next: (user) => {
                expect(user).toEqual(mockUser);
            },
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/${ApiEndpoint.User}/login`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ username: 'testuser', password: 'password' });
        req.flush(mockUser);
    });

    it('should create account', () => {
        service.createAccount('newuser', 'password', 'profile', 'email').subscribe({
            next: (user) => {
                expect(user).toEqual(mockUser);
            },
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/${ApiEndpoint.User}/register`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ username: 'newuser', password: 'password', profilePicture: 'profile', email: 'email' });
        req.flush(mockUser);
    });

    it('should logout user', () => {
        service.setUser(mockUser);
        service.logout().subscribe({
            next: (res) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- empty object not null
                expect(res).toEqual({} as any);
            },
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/${ApiEndpoint.User}/logout/${mockUser.userId}`);
        expect(req.request.method).toBe('POST');
        req.flush({});
    });

    it('should set user and emit user$', (done) => {
        service.setUser(mockUser);
        service.user$.subscribe((user) => {
            expect(user).toEqual(mockUser);
            done();
        });
        expect(socketServiceSpy.emit).toHaveBeenCalledWith(UserEvent.Associate, mockUser);
    });

    it('should emit UserEvent.Associate with null when user is null', () => {
        service.setUser(null);
        expect(socketServiceSpy.emit).toHaveBeenCalledWith(UserEvent.Associate, null);
    });
});
