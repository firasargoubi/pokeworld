import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DebugPageComponent } from './debug-page.component';
import { MatchService } from '@app/services/match/match.service';
import { SocketService } from '@app/services/socket/socket.service';
import { MOCK_MATCH_DATAS } from '@common/test-consts/mock-matches';

describe('DebugPageComponent', () => {
    let component: DebugPageComponent;
    let fixture: ComponentFixture<DebugPageComponent>;
    let mockMatchService: jasmine.SpyObj<MatchService>;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        mockMatchService = jasmine.createSpyObj('MatchService', ['resetMatchData'], { selfIndex: 0 });
        mockSocketService = jasmine.createSpyObj('SocketService', ['emit'], { selfId: 'selfId' });
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [DebugPageComponent, FormsModule],
            providers: [
                { provide: MatchService, useValue: mockMatchService },
                { provide: SocketService, useValue: mockSocketService },
                { provide: Router, useValue: mockRouter },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DebugPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('on key down should call join match', () => {
        component.matchCodeInput = 'test-code';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const joinMatchSpy = spyOn(component as any, 'joinMatch');
        const event = new KeyboardEvent('keydown', { key: 'Return', repeat: false });
        component.onKeyDown(event);
        expect(joinMatchSpy).toHaveBeenCalled();
    });

    it('create match should emit create match and handle callback', () => {
        component.createMatch(0);
        expect(mockSocketService.emit).toHaveBeenCalled();
    });

    it('join match should emit join match and handle callback', () => {
        component['joinMatch']();
        expect(mockSocketService.emit).toHaveBeenCalled();
    });

    it('on join match', () => {
        spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
        component['onJoinMatch'](structuredClone(MOCK_MATCH_DATAS[0]));
        expect(mockRouter.navigate).toHaveBeenCalled();
    });
});
