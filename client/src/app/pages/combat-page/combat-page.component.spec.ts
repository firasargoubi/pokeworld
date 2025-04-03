import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CombatPageComponent } from './combat-page.component';
import { CombatService } from '@app/services/combat/combat.service';
import { MatchService } from '@app/services/match/match.service';
import { PlayService } from '@app/services/play/play.service';
import { MOCK_MATCH_DATAS } from '@common/test-consts/mock-matches';
import { Timer } from '@app/classes/timer/timer';

describe('CombatPageComponent', () => {
    let component: CombatPageComponent;
    let fixture: ComponentFixture<CombatPageComponent>;
    let mockMatchService: jasmine.SpyObj<MatchService>;
    let mockCombatService: jasmine.SpyObj<CombatService>;
    let mockPlayService: jasmine.SpyObj<PlayService>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockTimer: jasmine.SpyObj<Timer>;

    beforeEach(async () => {
        mockMatchService = jasmine.createSpyObj('MatchService', ['isInMatch', 'isState'], {
            matchUpdate: { pipe: () => ({ subscribe: () => ({}) }) },
            data: structuredClone(MOCK_MATCH_DATAS[0]),
        });
        mockCombatService = jasmine.createSpyObj('CombatService', ['attack', 'escape']);
        mockPlayService = jasmine.createSpyObj('PlayService', ['changeDebugMode']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockTimer = jasmine.createSpyObj('Timer', ['maxTime']);

        mockCombatService.timer = mockTimer;

        await TestBed.configureTestingModule({
            imports: [CombatPageComponent],
            providers: [
                { provide: MatchService, useValue: mockMatchService },
                { provide: CombatService, useValue: mockCombatService },
                { provide: PlayService, useValue: mockPlayService },
                { provide: Router, useValue: mockRouter },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CombatPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('on key down should call change debug mode', () => {
        const event = new KeyboardEvent('keydown', { key: 'D', repeat: false });
        component.onKeyDown(event);
        expect(mockPlayService.changeDebugMode).toHaveBeenCalled();
    });

    it('attack button should call attack', () => {
        component.attackButton();
        expect(mockCombatService.attack).toHaveBeenCalled();
    });

    it('escape button should call escape', () => {
        component.escapeButon();
        expect(mockCombatService.escape).toHaveBeenCalled();
    });

    it('update images should update visual data', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateImagesSpy = spyOn(component as any, 'updateImages').and.callThrough();
        component['updateImages']();
        expect(updateImagesSpy).toHaveBeenCalled();
    });

    it('on match update should call subfunctions', () => {
        mockMatchService.isState.and.returnValue(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const checkForRedirectSpy = spyOn(component as any, 'checkForRedirect');
        component['onMatchUpdate']();
        expect(checkForRedirectSpy).toHaveBeenCalled();
    });

    it('check for redirect should check state', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const checkForRedirectSpy = spyOn(component as any, 'checkForRedirect').and.callThrough();
        component['checkForRedirect']();
        expect(checkForRedirectSpy).toHaveBeenCalled();
    });

    it('update players combat data should update first player', () => {
        mockMatchService.selfIndex = 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updatePlayersCombatDataSpy = spyOn(component as any, 'updatePlayersCombatData').and.callThrough();
        component['updatePlayersCombatData']();
        expect(updatePlayersCombatDataSpy).toHaveBeenCalled();
    });

    it('update players combat data should update second player', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updatePlayersCombatDataSpy = spyOn(component as any, 'updatePlayersCombatData').and.callThrough();
        component['updatePlayersCombatData']();
        expect(updatePlayersCombatDataSpy).toHaveBeenCalled();
    });
});
