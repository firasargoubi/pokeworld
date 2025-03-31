describe('Timer', () => {
    it('should be true', () => {
        // TODO
        expect(true).toBeTruthy();
    });
});

// import { CommonModule } from '@angular/common';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { Router } from '@angular/router';
// import { MatchDataService } from '@app/services/match-data/match-data.service';
// import { PopupService } from '@app/services/popup/popup.service';
// import { CombatSocketService } from '@app/services/sockets/combat-socket/combat-socket.service';
// import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
// import { PlaySocketsService } from '@app/services/sockets/play-socket/play-sockets.service';
// import { AttackResult, CombatResult } from '@common/interfaces/combat';
// import { PageEndpoint } from '@common/interfaces/endpoint.enum';
// import { Player } from '@common/interfaces/player';
// import { BehaviorSubject } from 'rxjs';
// import { CombatPageComponent } from './combat-page.component';

// describe('CombatPageComponent', () => {
//     let component: CombatPageComponent;
//     let fixture: ComponentFixture<CombatPageComponent>;
//     let routerSpy: jasmine.SpyObj<Router>;
//     let mockCoreSocketService: jasmine.SpyObj<CoreSocketService>;
//     let mockMatchDataService: jasmine.SpyObj<MatchDataService>;
//     let mockPopupService: jasmine.SpyObj<PopupService>;
//     let selfPlayerSubject: BehaviorSubject<Player | null>;
//     let enemyPlayerSubject: BehaviorSubject<Player | null>;
//     let currentTurnSubject: BehaviorSubject<boolean>;
//     let currentTimerSubject: BehaviorSubject<number>;
//     let attackResultSubject: BehaviorSubject<AttackResult | null>;
//     let escapeResultSubject: BehaviorSubject<string | null>;
//     let combatResultSubject: BehaviorSubject<CombatResult | null>;
//     let connectionStatusSubject: BehaviorSubject<boolean>;
//     let mockPlaySocketsService: jasmine.SpyObj<PlaySocketsService>;

//     const ONE_SEC = 1000;
//     let combatSocketServiceMock: Partial<CombatSocketService>;

//     beforeEach(async () => {
//         selfPlayerSubject = new BehaviorSubject<Player | null>(null);
//         enemyPlayerSubject = new BehaviorSubject<Player | null>(null);
//         currentTurnSubject = new BehaviorSubject<boolean>(false);
//         currentTimerSubject = new BehaviorSubject<number>(0);
//         attackResultSubject = new BehaviorSubject<AttackResult | null>(null);
//         escapeResultSubject = new BehaviorSubject<string | null>(null);
//         combatResultSubject = new BehaviorSubject<CombatResult | null>(null);
//         connectionStatusSubject = new BehaviorSubject<boolean>(true);
//         mockCoreSocketService = jasmine.createSpyObj('CoreSocketService', ['emit'], {
//             connectionStatus: connectionStatusSubject.asObservable(),
//         });
//         mockMatchDataService = jasmine.createSpyObj('MatchDataService', [], {
//             matchData: { players: [{ id: 'player1' }, { id: 'player2' }] },
//         });
//         mockPopupService = jasmine.createSpyObj('PopupService', ['showPopup', 'clearMessages', 'keepMessages']);
//         combatSocketServiceMock = {
//             selfPlayer$: selfPlayerSubject.asObservable(),
//             enemyPlayer$: enemyPlayerSubject.asObservable(),
//             currentTurn: currentTurnSubject,
//             currentTimer: currentTimerSubject,
//             attackResult: attackResultSubject,
//             escapeResult: escapeResultSubject,
//             combatResult: combatResultSubject,
//             escapeAttempt: jasmine.createSpy('escapeAttempt'),
//             attackAttempt: jasmine.createSpy('attackAttempt'),
//         };
//         mockPlaySocketsService = jasmine.createSpyObj('PlaySocketsService', ['changeDebugMode']);

//         routerSpy = jasmine.createSpyObj('Router', ['navigate']);

//         await TestBed.configureTestingModule({
//             imports: [CommonModule],
//             providers: [
//                 { provide: CombatSocketService, useValue: combatSocketServiceMock },
//                 { provide: Router, useValue: routerSpy },
//                 { provide: PopupService, useValue: mockPopupService },
//                 { provide: CoreSocketService, useValue: mockCoreSocketService },
//                 { provide: MatchDataService, useValue: mockMatchDataService },
//                 { provide: PlaySocketsService, useValue: mockPlaySocketsService },
//             ],
//         })
//             .overrideTemplate(CombatPageComponent, '')
//             .compileComponents();

//         fixture = TestBed.createComponent(CombatPageComponent);
//         component = fixture.componentInstance;

//         component.selfPlayer = {
//             id: 'self1',
//             name: 'Self Player',
//             currentStats: { health: 100 },
//         } as Player;
//         component.enemyPlayer = {
//             id: 'enemy1',
//             name: 'Enemy Player',
//             currentStats: { health: 100 },
//         } as Player;

//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should update selfPlayer when CombatSocketService emits a selfPlayer', () => {
//         const testPlayer: Player = { id: 'self1', currentStats: { health: 100 } } as Player;
//         selfPlayerSubject.next(testPlayer);
//         expect(component.selfPlayer).toEqual(testPlayer);
//     });

//     it('should update enemyPlayer when CombatSocketService emits an enemyPlayer', () => {
//         const testPlayer: Player = { id: 'enemy1', currentStats: { health: 100 } } as Player;
//         enemyPlayerSubject.next(testPlayer);
//         expect(component.enemyPlayer).toEqual(testPlayer);
//     });

//     it('should update iscurrentTurn when CombatSocketService currentTurn emits a value', () => {
//         currentTurnSubject.next(true);
//         expect(component.iscurrentTurn).toBe(true);
//         currentTurnSubject.next(false);
//         expect(component.iscurrentTurn).toBe(false);
//     });

//     it('should update maxTime and start timer when CombatSocketService currentTimer emits a value', () => {
//         jasmine.clock().install();
//         const testTime = 5000;

//         currentTimerSubject.next(testTime);
//         expect(component.maxTime).toBe(testTime / ONE_SEC);
//         expect(component['currentTime']).toBe(testTime / ONE_SEC);

//         jasmine.clock().tick(ONE_SEC);
//         // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- expected result
//         expect(component['currentTime']).toBe(4);

//         jasmine.clock().uninstall();
//     });

//     it('should perform attackAnimation when attackResult is emitted with target self', () => {
//         jasmine.clock().install();

//         const self: Player = { id: 'self1', currentStats: { health: 100 } } as Player;
//         const enemy: Player = { id: 'enemy1', currentStats: { health: 100 } } as Player;
//         selfPlayerSubject.next(self);
//         enemyPlayerSubject.next(enemy);

//         const attackResult: AttackResult = { targetId: 'self1', attackDamage: 10 };
//         attackResultSubject.next(attackResult);

//         expect(component.animation.selfattack).toBe(false);
//         expect(component.animation.enemyattack).toBe(true);
//         expect(component.animation.selfDamage).toBe(true);
//         expect(component.animation.enemyDamage).toBe(false);

//         jasmine.clock().tick(ONE_SEC);
//         expect(component.animation.selfattack).toBe(false);
//         expect(component.animation.enemyattack).toBe(false);
//         expect(component.animation.selfDamage).toBe(false);
//         expect(component.animation.enemyDamage).toBe(false);

//         jasmine.clock().uninstall();
//     });

//     it('should perform attackAnimation when attackResult is emitted with target enemy', () => {
//         jasmine.clock().install();

//         const self: Player = { id: 'self1', currentStats: { health: 100 } } as Player;
//         const enemy: Player = { id: 'enemy1', currentStats: { health: 100 } } as Player;
//         selfPlayerSubject.next(self);
//         enemyPlayerSubject.next(enemy);

//         const attackResult: AttackResult = { targetId: 'enemy1', attackDamage: 10 };
//         attackResultSubject.next(attackResult);

//         expect(component.animation.selfattack).toBe(true);
//         expect(component.animation.enemyattack).toBe(false);
//         expect(component.animation.selfDamage).toBe(false);
//         expect(component.animation.enemyDamage).toBe(true);

//         jasmine.clock().tick(ONE_SEC);
//         expect(component.animation.selfattack).toBe(false);
//         expect(component.animation.enemyattack).toBe(false);
//         expect(component.animation.selfDamage).toBe(false);
//         expect(component.animation.enemyDamage).toBe(false);

//         jasmine.clock().uninstall();
//     });

//     it('should perform escapeAnimation when escapeResult is emitted', () => {
//         jasmine.clock().install();

//         const self: Player = { id: 'self1', currentStats: { health: 100 } } as Player;
//         const enemy: Player = { id: 'enemy1', currentStats: { health: 100 } } as Player;
//         selfPlayerSubject.next(self);
//         enemyPlayerSubject.next(enemy);

//         escapeResultSubject.next('self1');
//         expect(component.iscurrentTurn).toBe(false);
//         expect(component.animation.selfEscape).toBe(true);

//         jasmine.clock().tick(2 * ONE_SEC);
//         expect(component.animation.selfEscape).toBe(false);
//         expect(component.animation.enemyEscape).toBe(false);

//         escapeResultSubject.next('enemy1');
//         expect(component.animation.enemyEscape).toBe(true);

//         jasmine.clock().tick(2 * ONE_SEC);
//         expect(component.animation.selfEscape).toBe(false);
//         expect(component.animation.enemyEscape).toBe(false);

//         jasmine.clock().uninstall();
//     });

//     it('should perform deathAnimation when combatResult is emitted', () => {
//         jasmine.clock().install();

//         const self: Player = { id: 'self1', currentStats: { health: 0 } } as Player;
//         const enemy: Player = { id: 'enemy1', currentStats: { health: 100 } } as Player;
//         selfPlayerSubject.next(self);
//         enemyPlayerSubject.next(enemy);

//         combatResultSubject.next({ winnerId: 'enemy1', loserId: 'self1' });
//         expect(component.animation.selfDeath).toBe(true);

//         jasmine.clock().tick(2 * ONE_SEC);
//         expect(component.animation.selfDeath).toBe(false);

//         self.currentStats.health = 100;
//         enemy.currentStats.health = 0;
//         selfPlayerSubject.next(self);
//         enemyPlayerSubject.next(enemy);
//         combatResultSubject.next({ winnerId: 'self1', loserId: 'enemy1' });

//         expect(component.animation.enemyDeath).toBe(true);

//         jasmine.clock().tick(2 * ONE_SEC);
//         expect(component.animation.enemyDeath).toBe(false);

//         jasmine.clock().uninstall();
//     });

//     it('should call escapeAttempt on CombatSocketService when escapeAttempt is called', () => {
//         component.escapeAttempt();
//         expect(combatSocketServiceMock.escapeAttempt).toHaveBeenCalled();
//     });

//     it('should call attackAttempt on CombatSocketService when attackAttempt is called', () => {
//         component.attackAttempt();
//         expect(combatSocketServiceMock.attackAttempt).toHaveBeenCalled();
//     });

//     it('should clear interval when timer reaches zero', () => {
//         jasmine.clock().install();

//         component['currentTime'] = 1;
//         const initialInterval = (component['timerInterval'] = window.setInterval(() => void 0, ONE_SEC));
//         component['setTimer']();
//         expect(component['timerInterval']).not.toBeNull();
//         jasmine.clock().tick(ONE_SEC);
//         expect(component['currentTime']).toBe(0);
//         jasmine.clock().tick(ONE_SEC);
//         expect(component['timerInterval']).toBeNull();
//         expect(initialInterval).not.toBe(component['timerInterval']);

//         jasmine.clock().uninstall();
//     });

//     it('should verify socket connection and do nothing if connected', () => {
//         connectionStatusSubject.next(true);
//         expect(mockPopupService.clearMessages).not.toHaveBeenCalled();
//         expect(mockPopupService.showPopup).not.toHaveBeenCalled();
//         expect(mockPopupService.keepMessages).not.toHaveBeenCalled();
//         expect(routerSpy.navigate).not.toHaveBeenCalled();
//     });

//     it('should show popup, keep messages, and navigate if socket disconnects', () => {
//         connectionStatusSubject.next(false);
//         expect(mockPopupService.keepMessages).not.toHaveBeenCalled();
//         expect(routerSpy.navigate).toHaveBeenCalledWith([PageEndpoint.Menu]);
//     });

//     it('should toggle debug mode on "d" or "D" key press', () => {
//         const debugSpy = mockPlaySocketsService.changeDebugMode;

//         const eventD = new KeyboardEvent('keydown', { key: 'd' });
//         component.onKeyDown(eventD);
//         expect(debugSpy).toHaveBeenCalledTimes(1);

//         const eventUpperD = new KeyboardEvent('keydown', { key: 'D' });
//         component.onKeyDown(eventUpperD);
//         expect(debugSpy).toHaveBeenCalledTimes(2);

//         const eventX = new KeyboardEvent('keydown', { key: 'x' });
//         component.onKeyDown(eventX);
//         expect(debugSpy).toHaveBeenCalledTimes(2);

//         const eventRepeat = new KeyboardEvent('keydown', { key: 'd', repeat: true });
//         component.onKeyDown(eventRepeat);
//         expect(debugSpy).toHaveBeenCalledTimes(2);
//     });
// });
