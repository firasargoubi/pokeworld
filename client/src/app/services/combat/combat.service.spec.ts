import { TestBed } from '@angular/core/testing';
import { Timer } from '@app/classes/timer/timer';
import { MatchService } from '@app/services/match/match.service';
import { SocketService } from '@app/services/socket/socket.service';
import { CombatAction, CombatData } from '@common/interfaces/match-data';
import { CombatEvent } from '@common/interfaces/socket-event.enum';
import { MOCK_MATCH_DATAS } from '@common/test-consts/mock-matches';
import { CombatService } from './combat.service';

describe('CombatService', () => {
    let service: CombatService;
    let matchServiceSpy: jasmine.SpyObj<MatchService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let timerSpy: jasmine.SpyObj<Timer>;

    beforeEach(() => {
        matchServiceSpy = jasmine.createSpyObj('MatchService', ['isState'], {
            data: { combatData: { turnDuration: 0, playersCombatData: [{ playerIndex: 0, currentHealth: 70 }] } },
            matchUpdate: { pipe: () => ({ subscribe: () => ({}) }) },
        });
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['emit']);
        timerSpy = jasmine.createSpyObj('Timer', ['restartTimer']);

        TestBed.configureTestingModule({
            providers: [CombatService, { provide: MatchService, useValue: matchServiceSpy }, { provide: SocketService, useValue: socketServiceSpy }],
        });
        service = TestBed.inject(CombatService);
        service.timer = timerSpy;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('escape should emit escape event', () => {
        service.escape();
        expect(socketServiceSpy.emit).toHaveBeenCalledWith(CombatEvent.Escape);
    });

    it('attack should emit attack event', () => {
        service.attack();
        expect(socketServiceSpy.emit).toHaveBeenCalledWith(CombatEvent.Attack);
    });

    it('on match update should restart timer', () => {
        const matchData = structuredClone(MOCK_MATCH_DATAS[0]);
        matchServiceSpy.isState.and.returnValue(true);
        service['onMatchUpdate'](matchData);
        expect(timerSpy.restartTimer).toHaveBeenCalled();
    });

    it('should return true when health increased and last action is not None', () => {
        const playerIndex = 0;
        service['lastCombatData'] = {
            playersCombatData: [{ playerIndex, currentHealth: 50 }],
            lastCombatAction: CombatAction.SuccessAttack,
        } as CombatData;

        expect(service.hasPlayerHealed(playerIndex)).toBeTrue();
    });

    it('should return false when lastCombatAction is None', () => {
        const playerIndex = 0;
        service['lastCombatData'] = {
            playersCombatData: [{ playerIndex, currentHealth: 50 }],
            lastCombatAction: CombatAction.None,
        } as CombatData;

        expect(service.hasPlayerHealed(playerIndex)).toBeFalse();
    });
});
