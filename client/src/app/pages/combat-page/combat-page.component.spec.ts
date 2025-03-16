import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CombatSocketService } from '@app/services/sockets/combat-socket/combat-socket.service';
import { AttackResult, CombatResult } from '@common/combat-interfaces';
import { Player } from '@common/player';
import { BehaviorSubject } from 'rxjs';
import { CombatPageComponent } from './combat-page.component';

describe('CombatPageComponent', () => {
    let component: CombatPageComponent;
    let fixture: ComponentFixture<CombatPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;

    let selfPlayerSubject: BehaviorSubject<Player | null>;
    let ennemyPlayerSubject: BehaviorSubject<Player | null>;
    let currentTurnSubject: BehaviorSubject<boolean>;
    let currentTimerSubject: BehaviorSubject<number>;
    let attackResultSubject: BehaviorSubject<AttackResult | null>;
    let escapeResultSubject: BehaviorSubject<string | null>;
    let combatResultSubject: BehaviorSubject<CombatResult | null>;

    const ONE_SEC = 1000;
    let combatSocketServiceMock: Partial<CombatSocketService>;

    beforeEach(async () => {
        selfPlayerSubject = new BehaviorSubject<Player | null>(null);
        ennemyPlayerSubject = new BehaviorSubject<Player | null>(null);
        currentTurnSubject = new BehaviorSubject<boolean>(false);
        currentTimerSubject = new BehaviorSubject<number>(0);
        attackResultSubject = new BehaviorSubject<AttackResult | null>(null);
        escapeResultSubject = new BehaviorSubject<string | null>(null);
        combatResultSubject = new BehaviorSubject<CombatResult | null>(null);

        combatSocketServiceMock = {
            selfPlayer$: selfPlayerSubject.asObservable(),
            ennemyPlayer$: ennemyPlayerSubject.asObservable(),
            currentTurn: currentTurnSubject,
            currentTimer: currentTimerSubject,
            attackResult: attackResultSubject,
            escapeResult: escapeResultSubject,
            combatResult: combatResultSubject,
            escapeAttempt: jasmine.createSpy('escapeAttempt'),
            attackAttempt: jasmine.createSpy('attackAttempt'),
        };

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [CommonModule],
            providers: [
                { provide: CombatSocketService, useValue: combatSocketServiceMock },
                { provide: Router, useValue: routerSpy },
            ],
        })
            .overrideTemplate(CombatPageComponent, '')
            .compileComponents();

        fixture = TestBed.createComponent(CombatPageComponent);
        component = fixture.componentInstance;

        component.selfPlayer = {
            id: 'self1',
            name: 'Self Player',
            currentStats: { health: 100 },
        } as Player;
        component.ennemyPlayer = {
            id: 'enemy1',
            name: 'Enemy Player',
            currentStats: { health: 100 },
        } as Player;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update selfPlayer when CombatSocketService emits a selfPlayer', () => {
        const testPlayer: Player = { id: 'self1', currentStats: { health: 100 } } as Player;
        selfPlayerSubject.next(testPlayer);
        expect(component.selfPlayer).toEqual(testPlayer);
    });

    it('should update ennemyPlayer when CombatSocketService emits an ennemyPlayer', () => {
        const testPlayer: Player = { id: 'enemy1', currentStats: { health: 100 } } as Player;
        ennemyPlayerSubject.next(testPlayer);
        expect(component.ennemyPlayer).toEqual(testPlayer);
    });

    it('should update iscurrentTurn when CombatSocketService currentTurn emits a value', () => {
        currentTurnSubject.next(true);
        expect(component.iscurrentTurn).toBe(true);
        currentTurnSubject.next(false);
        expect(component.iscurrentTurn).toBe(false);
    });

    it('should update maxTime and start timer when CombatSocketService currentTimer emits a value', () => {
        jasmine.clock().install();
        const testTime = 5000;

        currentTimerSubject.next(testTime);
        expect(component.maxTime).toBe(testTime / ONE_SEC);
        expect(component['currentTime']).toBe(testTime / ONE_SEC);

        jasmine.clock().tick(ONE_SEC);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component['currentTime']).toBe(4);

        jasmine.clock().uninstall();
    });

    it('should perform attackAnimation when attackResult is emitted with target self', () => {
        jasmine.clock().install();

        const self: Player = { id: 'self1', currentStats: { health: 100 } } as Player;
        const enemy: Player = { id: 'enemy1', currentStats: { health: 100 } } as Player;
        selfPlayerSubject.next(self);
        ennemyPlayerSubject.next(enemy);

        const attackResult: AttackResult = { targetId: 'self1', attackDamage: 10 };
        attackResultSubject.next(attackResult);

        expect(component.animation.selfattack).toBe(false);
        expect(component.animation.ennemyattack).toBe(true);
        expect(component.animation.selfDamage).toBe(true);
        expect(component.animation.ennemyDamage).toBe(false);

        jasmine.clock().tick(ONE_SEC);
        expect(component.animation.selfattack).toBe(false);
        expect(component.animation.ennemyattack).toBe(false);
        expect(component.animation.selfDamage).toBe(false);
        expect(component.animation.ennemyDamage).toBe(false);

        jasmine.clock().uninstall();
    });

    it('should perform attackAnimation when attackResult is emitted with target ennemy', () => {
        jasmine.clock().install();

        const self: Player = { id: 'self1', currentStats: { health: 100 } } as Player;
        const enemy: Player = { id: 'enemy1', currentStats: { health: 100 } } as Player;
        selfPlayerSubject.next(self);
        ennemyPlayerSubject.next(enemy);

        const attackResult: AttackResult = { targetId: 'enemy1', attackDamage: 10 };
        attackResultSubject.next(attackResult);

        expect(component.animation.selfattack).toBe(true);
        expect(component.animation.ennemyattack).toBe(false);
        expect(component.animation.selfDamage).toBe(false);
        expect(component.animation.ennemyDamage).toBe(true);

        jasmine.clock().tick(ONE_SEC);
        expect(component.animation.selfattack).toBe(false);
        expect(component.animation.ennemyattack).toBe(false);
        expect(component.animation.selfDamage).toBe(false);
        expect(component.animation.ennemyDamage).toBe(false);

        jasmine.clock().uninstall();
    });

    it('should perform escapeAnimation when escapeResult is emitted', () => {
        jasmine.clock().install();

        const self: Player = { id: 'self1', currentStats: { health: 100 } } as Player;
        const enemy: Player = { id: 'enemy1', currentStats: { health: 100 } } as Player;
        selfPlayerSubject.next(self);
        ennemyPlayerSubject.next(enemy);

        escapeResultSubject.next('self1');
        expect(component.iscurrentTurn).toBe(false);
        expect(component.animation.selfEscape).toBe(true);

        jasmine.clock().tick(2 * ONE_SEC);
        expect(component.animation.selfEscape).toBe(false);
        expect(component.animation.ennemyEscape).toBe(false);

        escapeResultSubject.next('enemy1');
        expect(component.animation.ennemyEscape).toBe(true);

        jasmine.clock().tick(2 * ONE_SEC);
        expect(component.animation.selfEscape).toBe(false);
        expect(component.animation.ennemyEscape).toBe(false);

        jasmine.clock().uninstall();
    });

    it('should perform deathAnimation when combatResult is emitted', () => {
        jasmine.clock().install();

        const self: Player = { id: 'self1', currentStats: { health: 0 } } as Player;
        const enemy: Player = { id: 'enemy1', currentStats: { health: 100 } } as Player;
        selfPlayerSubject.next(self);
        ennemyPlayerSubject.next(enemy);

        combatResultSubject.next({ winnerId: 'enemy1', loserId: 'self1' });
        expect(component.animation.selfDeath).toBe(true);

        jasmine.clock().tick(2 * ONE_SEC);
        expect(component.animation.selfDeath).toBe(false);

        self.currentStats.health = 100;
        enemy.currentStats.health = 0;
        selfPlayerSubject.next(self);
        ennemyPlayerSubject.next(enemy);
        combatResultSubject.next({ winnerId: 'self1', loserId: 'enemy1' });

        expect(component.animation.ennemyDeath).toBe(true);

        jasmine.clock().tick(2 * ONE_SEC);
        expect(component.animation.ennemyDeath).toBe(false);

        jasmine.clock().uninstall();
    });

    it('should call escapeAttempt on CombatSocketService when escapeAttempt is called', () => {
        component.escapeAttempt();
        expect(combatSocketServiceMock.escapeAttempt).toHaveBeenCalled();
    });

    it('should call attackAttempt on CombatSocketService when attackAttempt is called', () => {
        component.attackAttempt();
        expect(combatSocketServiceMock.attackAttempt).toHaveBeenCalled();
    });

    it('should navigate to "/" on beforeunload event', () => {
        component['handleBeforeUnload']();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should clear interval when timer reaches zero', () => {
        jasmine.clock().install();

        component['currentTime'] = 1;
        const initialInterval = (component['timerInterval'] = window.setInterval(() => void 0, ONE_SEC));
        component['setTimer']();
        expect(component['timerInterval']).not.toBeNull();
        jasmine.clock().tick(ONE_SEC);
        expect(component['currentTime']).toBe(0);
        jasmine.clock().tick(ONE_SEC);
        expect(component['timerInterval']).toBeNull();
        expect(initialInterval).not.toBe(component['timerInterval']);

        jasmine.clock().uninstall();
    });
});
