import { TestBed } from '@angular/core/testing';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { CombatEvent } from '@common/combat-event.enum';
import { Player } from '@common/player';
import { CombatSocketService } from './combat-socket.service';

describe('CombatSocketService', () => {
    let service: CombatSocketService;
    let coreSocketSpy: jasmine.SpyObj<CoreSocketService>;

    beforeEach(() => {
        coreSocketSpy = jasmine.createSpyObj('CoreSocketService', ['emit', 'on'], { selfId: 'selfId' });
        TestBed.overrideProvider(CoreSocketService, { useValue: coreSocketSpy });
        service = TestBed.inject(CombatSocketService);
        coreSocketSpy = TestBed.inject(CoreSocketService) as jasmine.SpyObj<CoreSocketService>;
        service['setupCombatListeners']();
    });

    it('should expose selfPlayer$ as an observable and emit the updated selfPlayer', (done) => {
        const expectedPlayer: Player = { id: 'selfTestId' } as Player;
        const expectedEmissions = [null, expectedPlayer];
        const receivedEmissions: (Player | null)[] = [];

        const subscription = service.selfPlayer$.subscribe((player) => {
            receivedEmissions.push(player);
            if (receivedEmissions.length === expectedEmissions.length) {
                expect(receivedEmissions).toEqual(expectedEmissions);
                subscription.unsubscribe();
                done();
            }
        });

        service['selfPlayerSubject'].next(expectedPlayer);
    });

    it('should expose ennemyPlayer$ as an observable and emit the updated ennemyPlayer', (done) => {
        const expectedPlayer: Player = { id: 'ennemyTestId' } as Player;
        const expectedEmissions = [null, expectedPlayer];
        const receivedEmissions: (Player | null)[] = [];

        const subscription = service.ennemyPlayer$.subscribe((player) => {
            receivedEmissions.push(player);
            if (receivedEmissions.length === expectedEmissions.length) {
                expect(receivedEmissions).toEqual(expectedEmissions);
                subscription.unsubscribe();
                done();
            }
        });

        service['ennemyPlayerSubject'].next(expectedPlayer);
    });

    // it('should call coreSocket.emit with the correct event and targetPlayerId', () => {
    //     const targetPlayerId = 'player123';
    //     service.initFight(targetPlayerId);

    //     expect(coreSocketSpy.emit).toHaveBeenCalledOnceWith(CombatEvent.StartCombat, targetPlayerId);
    // });

    it('should call coreSocket.emit with EscapeAttempt event and correct data', () => {
        const combatRoomCode = 'room123';
        service['combatRoomCode'] = combatRoomCode;

        const selfPlayer = { id: 'selfPlayerId' } as Player;
        service['selfPlayerSubject'].next(selfPlayer);

        service.escapeAttempt();

        expect(coreSocketSpy.emit).toHaveBeenCalledOnceWith(CombatEvent.EscapeAttempt, {
            combatRoomCode,
            playerId: selfPlayer.id,
        });
    });

    it('should call coreSocket.emit with Attack event and correct targetId', () => {
        const combatRoomCode = 'room123';
        service['combatRoomCode'] = combatRoomCode;

        const enemyPlayer = { id: 'enemyPlayerId' } as Player;
        service['ennemyPlayerSubject'].next(enemyPlayer);

        service.attackAttempt();

        expect(coreSocketSpy.emit).toHaveBeenCalledOnceWith(CombatEvent.AttackAttempt, {
            combatRoomCode,
            targetId: enemyPlayer.id,
        });
    });

    // it('should set players and navigate to /combat on CombatStarted event when selfPlayer is the first player', () => {
    //     const combatDataSelfFirst: CombatData = {
    //         combatRoomCode: 'room123',
    //         players: [{ id: coreSocketSpy.selfId } as Player, { id: 'enemyId' } as Player],
    //     };

    //     spyOn(service['router'], 'navigate').and.stub();

    //     coreSocketSpy.on.calls.argsFor(0)[1](combatDataSelfFirst);

    //     expect(service['combatRoomCode']).toBe(combatDataSelfFirst.combatRoomCode);
    //     expect(service['selfPlayerSubject'].value?.id).toBe(coreSocketSpy.selfId);
    //     expect(service['ennemyPlayerSubject'].value?.id).toBe('enemyId');
    //     expect(service['router'].navigate).toHaveBeenCalledWith(['/combat']);
    //     expect(coreSocketSpy.on).toHaveBeenCalledWith(PlayEvent.CombatStarted, jasmine.any(Function));
    // });

    // it('should set players and navigate to /combat on CombatStarted event when selfPlayer is the second player', () => {
    //     const combatDataSelfSecond: CombatData = {
    //         combatRoomCode: 'room456',
    //         players: [{ id: 'enemyId' } as Player, { id: coreSocketSpy.selfId } as Player],
    //     };

    //     spyOn(service['router'], 'navigate');

    //     coreSocketSpy.on.calls.argsFor(0)[1](combatDataSelfSecond);

    //     expect(service['combatRoomCode']).toBe(combatDataSelfSecond.combatRoomCode);
    //     expect(service['selfPlayerSubject'].value?.id).toBe(coreSocketSpy.selfId);
    //     expect(service['ennemyPlayerSubject'].value?.id).toBe('enemyId');
    //     expect(service['router'].navigate).toHaveBeenCalledWith(['/combat']);
    //     expect(coreSocketSpy.on).toHaveBeenCalledWith(PlayEvent.CombatStarted, jasmine.any(Function));
    // });

    // it('should update escapeResult on EscapedResult event', () => {
    //     const ESCAPED_RESULT_EVENT_INDEX = 1;
    //     const playerId = 'escapedPlayer';

    //     coreSocketSpy.on.calls.argsFor(ESCAPED_RESULT_EVENT_INDEX)[1](playerId);

    //     expect(service['escapeResult'].value).toBe(playerId);
    //     expect(coreSocketSpy.on).toHaveBeenCalledWith(CombatEvent.EscapedResult, jasmine.any(Function));
    // });

    // it('should update attackResult on AttackResult event', () => {
    //     const ATTACK_RESULT_EVENT_INDEX = 2;
    //     const attackResult: AttackResult = { targetId: 'targetId', attackDamage: 2 };

    //     coreSocketSpy.on.calls.argsFor(ATTACK_RESULT_EVENT_INDEX)[1](attackResult);

    //     expect(service['attackResult'].value).toEqual(attackResult);
    //     expect(coreSocketSpy.on).toHaveBeenCalledWith(CombatEvent.AttackResult, jasmine.any(Function));
    // });

    // it('should update combatResult and navigate to /join on EndCombat event', (done) => {
    //     const END_COMBAT_EVENT_INDEX = 3;
    //     const NAVIGATION_DELAY_MS = 2000;
    //     const combatResult: CombatResult = { winnerId: 'winner123' } as CombatResult;

    //     spyOn(service['router'], 'navigate');

    //     coreSocketSpy.on.calls.argsFor(END_COMBAT_EVENT_INDEX)[1](combatResult);

    //     expect(service['combatResult'].value).toEqual(combatResult);

    //     setTimeout(() => {
    //         expect(service['router'].navigate).toHaveBeenCalled();
    //         done();
    //     }, NAVIGATION_DELAY_MS);
    // });

    it('should update currentTurn to true when CombatTurnStarted event is received', () => {
        const turnStartedCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === CombatEvent.CombatTurnStarted);
        expect(turnStartedCall).toBeDefined();
        const turnStartedCallback = turnStartedCall?.[1];

        if (turnStartedCallback) {
            turnStartedCallback();
        }
        expect(service.currentTurn.value).toBe(true);
    });

    it('should update currentTurn to false when CombatTurnStopped event is received', () => {
        service.currentTurn.next(true);
        const turnStoppedCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === CombatEvent.CombatTurnStopped);
        expect(turnStoppedCall).toBeDefined();
        const turnStoppedCallback = turnStoppedCall?.[1];
        if (turnStoppedCallback) {
            turnStoppedCallback();
        }
        expect(service.currentTurn.value).toBe(false);
    });

    it('should update currentTimer when StartTimer event is received', () => {
        const startTimerCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === CombatEvent.StartTimer);
        expect(startTimerCall).toBeDefined();
        const startTimerCallback = startTimerCall?.[1];
        const newTime = 10;

        if (startTimerCallback) {
            startTimerCallback(newTime);
        }
        expect(service.currentTimer.value).toBe(newTime);
    });

    it('should update selfPlayer and ennemyPlayer when UpdatePlayers event is received and playerOne is self', () => {
        const playerOne: Player = { id: coreSocketSpy.selfId } as Player;
        const playerTwo: Player = { id: 'enemyId' } as Player;

        const updatePlayersCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === CombatEvent.UpdatePlayers);
        expect(updatePlayersCall).toBeDefined();
        const updatePlayersCallback = updatePlayersCall?.[1];

        if (updatePlayersCallback) {
            updatePlayersCallback([playerOne, playerTwo]);
        }

        expect(service['selfPlayerSubject'].value).toEqual(playerOne);
        expect(service['ennemyPlayerSubject'].value).toEqual(playerTwo);
    });

    it('should update selfPlayer and ennemyPlayer when UpdatePlayers event is received and playerOne is not self', () => {
        const playerOne: Player = { id: 'enemyId' } as Player;
        const playerTwo: Player = { id: coreSocketSpy.selfId } as Player;

        const updatePlayersCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === CombatEvent.UpdatePlayers);
        expect(updatePlayersCall).toBeDefined();
        const updatePlayersCallback = updatePlayersCall?.[1];

        if (updatePlayersCallback) {
            updatePlayersCallback([playerOne, playerTwo]);
        }

        expect(service['selfPlayerSubject'].value).toEqual(playerTwo);
        expect(service['ennemyPlayerSubject'].value).toEqual(playerOne);
    });
});
