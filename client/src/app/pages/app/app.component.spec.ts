import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppComponent } from '@app/pages/app/app.component';
import { SocketService } from '@app/services/socket/socket.service';
import { UserService } from '@app/services/user/user.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';

describe('AppComponent', () => {
    let socketServiceMock: SocketService;
    let userServiceMock: UserService;
    let routerMock: Router;

    beforeEach(async () => {
        socketServiceMock = jasmine.createSpyObj('SocketService', ['on']);
        userServiceMock = jasmine.createSpyObj('UserService', ['setUser']);
        routerMock = jasmine.createSpyObj('Router', ['navigate']);
        await TestBed.configureTestingModule({
            imports: [AppComponent],
            providers: [
                { provide: SocketService, useValue: socketServiceMock },
                { provide: UserService, useValue: userServiceMock },
                { provide: Router, useValue: routerMock },
            ],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it('should subscribe to socket disconnect on init', () => {
        const fixture = TestBed.createComponent(AppComponent);

        fixture.detectChanges();

        expect(socketServiceMock.on).toHaveBeenCalledWith('disconnect', jasmine.any(Function));
    });

    it('should clear user and navigate to menu on socket disconnect', () => {
        const fixture = TestBed.createComponent(AppComponent);

        fixture.detectChanges();

        const disconnectHandler = (socketServiceMock.on as jasmine.Spy).calls.mostRecent().args[1] as () => void;
        disconnectHandler();

        expect(userServiceMock.setUser).toHaveBeenCalledOnceWith(null);
        expect(routerMock.navigate).toHaveBeenCalledOnceWith([PageEndpoint.Menu]);
    });
});
