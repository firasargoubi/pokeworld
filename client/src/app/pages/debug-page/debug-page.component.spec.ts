import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { MatchService } from '@app/services/match/match.service';
import { SocketService } from '@app/services/socket/socket.service';
import { MOCK_MATCH_DATAS } from '@common/test-consts/mock-matches';
import { of } from 'rxjs';
import { DebugPageComponent } from './debug-page.component';
import { MOCK_GAME_DATAS } from '@common/test-consts/mock-games';

describe('DebugPageComponent', () => {
    let component: DebugPageComponent;
    let fixture: ComponentFixture<DebugPageComponent>;
    let mockMatchService: jasmine.SpyObj<MatchService>;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockGameSaveService: jasmine.SpyObj<GameSaveService>;

    beforeEach(async () => {
        mockMatchService = jasmine.createSpyObj('MatchService', ['resetMatchData'], { selfIndex: 0 });
        mockSocketService = jasmine.createSpyObj('SocketService', ['emit'], { selfId: 'selfId' });
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockGameSaveService = jasmine.createSpyObj('GameSaveService', ['getAllGames']);

        await TestBed.configureTestingModule({
            imports: [DebugPageComponent, FormsModule],
            providers: [
                { provide: MatchService, useValue: mockMatchService },
                { provide: SocketService, useValue: mockSocketService },
                { provide: Router, useValue: mockRouter },
                { provide: GameSaveService, useValue: mockGameSaveService },
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const joinMatchSpy = spyOn(component as any, 'joinMatch');
        const event = new KeyboardEvent('keydown', { key: 'Return', repeat: false });
        component.onKeyDown(event);
        expect(joinMatchSpy).toHaveBeenCalled();
    });

    it('join match should emit join match and handle callback', () => {
        component['joinMatch']();
        expect(mockSocketService.emit).toHaveBeenCalled();
    });

    it('on join match should redirect to game', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        spyOn(component as any, 'joinMatch').and.callThrough();
        component['onJoinMatch'](structuredClone(MOCK_MATCH_DATAS[0]));
        expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('ask copy permission should correct', () => {
        const code = '1234';
        expect(() => {
            component['askCopyPermission'](code);
        }).not.toThrow();
    });

    it('should copy text to clipboard using execCommand when successful', () => {
        const execCommandSpy = spyOn(document, 'execCommand').and.returnValue(true);
        const clipboardWriteSpy = spyOn(navigator.clipboard, 'writeText');
        const testText = 'test-code';

        component['copyToClipboard'](testText);

        expect(execCommandSpy).toHaveBeenCalledWith('copy');
        expect(clipboardWriteSpy).not.toHaveBeenCalled();
    });

    it('should create match when visible game is found', () => {
        const game = structuredClone(MOCK_GAME_DATAS[0]);
        game.isVisible = true;
        const mockGames = [game];
        mockGameSaveService.getAllGames.and.returnValue(of(mockGames));

        component.createMatch(0);

        expect(mockGameSaveService.getAllGames).toHaveBeenCalled();
        expect(mockSocketService.emit).toHaveBeenCalled();
    });

    it('should not create match when no visible game is found', () => {
        const game = structuredClone(MOCK_GAME_DATAS[0]);
        game.isVisible = false;
        const mockGames = [game];
        mockGameSaveService.getAllGames.and.returnValue(of(mockGames));

        component.createMatch(0);

        expect(mockGameSaveService.getAllGames).toHaveBeenCalled();
        expect(mockSocketService.emit).not.toHaveBeenCalled();
    });

    it('should handle empty games list', () => {
        mockGameSaveService.getAllGames.and.returnValue(of([]));

        component.createMatch(0);

        expect(mockGameSaveService.getAllGames).toHaveBeenCalled();
        expect(mockSocketService.emit).not.toHaveBeenCalled();
    });
});
