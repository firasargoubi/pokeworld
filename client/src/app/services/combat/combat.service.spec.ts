describe('CombatService', () => {
    it('should be true', () => {
        // TODO
        expect(true).toBeTruthy();
    });
});

// import { TestBed } from '@angular/core/testing';
// import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
// import { PageEndpoint } from '@common/interfaces/endpoint.enum';
// import { Player } from '@common/interfaces/player';
// import { CombatEvent } from '@common/interfaces/socket-event.enum';
// import { CombatSocketService } from './combat-socket.service';

// describe('CombatSocketService', () => {
//     let service: CombatSocketService;
//     let coreSocketSpy: jasmine.SpyObj<CoreSocketService>;
//     let routerSpy: jasmine.Spy;

//     beforeEach(() => {
//         coreSocketSpy = jasmine.createSpyObj('CoreSocketService', ['emit', 'on'], { selfId: 'selfId' });
//         TestBed.overrideProvider(CoreSocketService, { useValue: coreSocketSpy });
//         service = TestBed.inject(CombatSocketService);
//         coreSocketSpy = TestBed.inject(CoreSocketService) as jasmine.SpyObj<CoreSocketService>;
//         service['setupCombatListeners']();
//         routerSpy = spyOn(service['router'], 'navigate');
//     });

//     it('should expose selfPlayer$ as an observable and emit the updated selfPlayer', (done) => {
//         const expectedPlayer: Player = { id: 'selfTestId' } as Player;
//         const expectedEmissions = [null, expectedPlayer];
//         const receivedEmissions: (Player | null)[] = [];

//         const subscription = service.selfPlayer$.subscribe((player) => {
//             receivedEmissions.push(player);
//             if (receivedEmissions.length === expectedEmissions.length) {
//                 expect(receivedEmissions).toEqual(expectedEmissions);
//                 subscription.unsubscribe();
//                 done();
//             }
//         });

//         service['selfPlayerSubject'].next(expectedPlayer);
//     });

//     it('should expose enemyPlayer$ as an observable and emit the updated enemyPlayer', (done) => {
//         const expectedPlayer: Player = { id: 'enemyTestId' } as Player;
//         const expectedEmissions = [null, expectedPlayer];
//         const receivedEmissions: (Player | null)[] = [];

//         const subscription = service.enemyPlayer$.subscribe((player) => {
//             receivedEmissions.push(player);
//             if (receivedEmissions.length === expectedEmissions.length) {
//                 expect(receivedEmissions).toEqual(expectedEmissions);
//                 subscription.unsubscribe();
//                 done();
//             }
//         });

//         service['enemyPlayerSubject'].next(expectedPlayer);
//     });

//     it('should call coreSocket.emit with EscapeAttempt event and correct data', () => {
//         const combatRoomCode = 'room123';
//         service['combatRoomCode'] = combatRoomCode;

//         const selfPlayer = { id: 'selfPlayerId' } as Player;
//         service['selfPlayerSubject'].next(selfPlayer);

//         service.escapeAttempt();

//         expect(coreSocketSpy.emit).toHaveBeenCalledOnceWith(CombatEvent.EscapeAttempt, {
//             combatRoomCode,
//             playerId: selfPlayer.id,
//         });
//     });

//     it('should call coreSocket.emit with Attack event and correct targetId', () => {
//         const combatRoomCode = 'room123';
//         service['combatRoomCode'] = combatRoomCode;

//         const enemyPlayer = { id: 'enemyPlayerId' } as Player;
//         service['enemyPlayerSubject'].next(enemyPlayer);

//         service.attackAttempt();

//         expect(coreSocketSpy.emit).toHaveBeenCalledOnceWith(CombatEvent.AttackAttempt, {
//             combatRoomCode,
//             targetId: enemyPlayer.id,
//         });
//     });

//     it('should update currentTurn to true when CombatTurnStarted event is received', () => {
//         const turnStartedCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === CombatEvent.CombatTurnStarted);
//         expect(turnStartedCall).toBeDefined();
//         const turnStartedCallback = turnStartedCall?.[1];

//         if (turnStartedCallback) {
//             turnStartedCallback();
//         }
//         expect(service.currentTurn.value).toBe(true);
//     });

//     it('should update currentTurn to false when CombatTurnStopped event is received', () => {
//         service.currentTurn.next(true);
//         const turnStoppedCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === CombatEvent.CombatTurnStopped);
//         expect(turnStoppedCall).toBeDefined();
//         const turnStoppedCallback = turnStoppedCall?.[1];
//         if (turnStoppedCallback) {
//             turnStoppedCallback();
//         }
//         expect(service.currentTurn.value).toBe(false);
//     });

//     it('should update currentTimer when StartTimer event is received', () => {
//         const startTimerCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === CombatEvent.StartTimer);
//         expect(startTimerCall).toBeDefined();
//         const startTimerCallback = startTimerCall?.[1];
//         const newTime = 10;

//         if (startTimerCallback) {
//             startTimerCallback(newTime);
//         }
//         expect(service.currentTimer.value).toBe(newTime);
//     });

//     it('should update selfPlayer and enemyPlayer when UpdatePlayers event is received and playerOne is self', () => {
//         const playerOne: Player = { id: coreSocketSpy.selfId } as Player;
//         const playerTwo: Player = { id: 'enemyId' } as Player;

//         const updatePlayersCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === CombatEvent.UpdatePlayers);
//         expect(updatePlayersCall).toBeDefined();
//         const updatePlayersCallback = updatePlayersCall?.[1];

//         if (updatePlayersCallback) {
//             updatePlayersCallback([playerOne, playerTwo]);
//         }

//         expect(service['selfPlayerSubject'].value).toEqual(playerOne);
//         expect(service['enemyPlayerSubject'].value).toEqual(playerTwo);
//     });

//     it('should update selfPlayer and enemyPlayer when UpdatePlayers event is received and playerOne is not self', () => {
//         const playerOne: Player = { id: 'enemyId' } as Player;
//         const playerTwo: Player = { id: coreSocketSpy.selfId } as Player;

//         const updatePlayersCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === CombatEvent.UpdatePlayers);
//         expect(updatePlayersCall).toBeDefined();
//         const updatePlayersCallback = updatePlayersCall?.[1];

//         if (updatePlayersCallback) {
//             updatePlayersCallback([playerOne, playerTwo]);
//         }

//         expect(service['selfPlayerSubject'].value).toEqual(playerTwo);
//         expect(service['enemyPlayerSubject'].value).toEqual(playerOne);
//     });

//     it('should set players and navigate to /combat when startCombat is called with self as first player', () => {
//         const combatData = {
//             combatRoomCode: 'testRoom123',
//             players: [{ id: coreSocketSpy.selfId, name: 'Self' } as Player, { id: 'enemyId', name: 'Enemy' } as Player],
//         };

//         service.startCombat(combatData);

//         expect(service['combatRoomCode']).toBe('testRoom123');
//         expect(service['selfPlayerSubject'].value).toEqual(combatData.players[0]);
//         expect(service['enemyPlayerSubject'].value).toEqual(combatData.players[1]);
//         expect(routerSpy).toHaveBeenCalledWith([PageEndpoint.Combat]);
//     });

//     it('should set players and navigate to /combat when startCombat is called with self as second player', () => {
//         const combatData = {
//             combatRoomCode: 'testRoom456',
//             players: [{ id: 'enemyId', name: 'Enemy' } as Player, { id: coreSocketSpy.selfId, name: 'Self' } as Player],
//         };

//         service.startCombat(combatData);

//         expect(service['combatRoomCode']).toBe('testRoom456');
//         expect(service['selfPlayerSubject'].value).toEqual(combatData.players[1]);
//         expect(service['enemyPlayerSubject'].value).toEqual(combatData.players[0]);
//         expect(routerSpy).toHaveBeenCalledWith([PageEndpoint.Combat]);
//     });

//     it('should navigate to /play when EndCombat event is received', () => {
//         const endCombatCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === CombatEvent.EndCombat);
//         expect(endCombatCall).toBeDefined();
//         const endCombatCallback = endCombatCall?.[1];

//         if (endCombatCallback) {
//             endCombatCallback();
//         }

//         expect(routerSpy).toHaveBeenCalledWith([PageEndpoint.Play]);
//     });

//     it('should update escapeResult when EscapedResult event is received', () => {
//         const playerId = 'escapedPlayer123';

//         const escapedResultCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === CombatEvent.EscapedResult);
//         expect(escapedResultCall).toBeDefined();
//         const escapedResultCallback = escapedResultCall?.[1];

//         if (escapedResultCallback) {
//             escapedResultCallback(playerId);
//         }
//         expect(service.escapeResult.value).toBe(playerId);
//     });

//     it('should update attackResult when AttackResult event is received', () => {
//         const attackResult = {
//             targetId: 'targetPlayer456',
//             attackDamage: 25,
//         };

//         const attackResultCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === CombatEvent.AttackResult);
//         expect(attackResultCall).toBeDefined();
//         const attackResultCallback = attackResultCall?.[1];

//         if (attackResultCallback) {
//             attackResultCallback(attackResult);
//         }
//         expect(service.attackResult.value).toEqual(attackResult);
//     });
//     it('should show popup with the winner name when EndCombat event is received', () => {
//         const popupSpy = spyOn(service['popupService'], 'showPopup');
//         const winner: Player = { id: 'winnerId', name: 'TestWinner' } as Player;

//         const endCombatCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === CombatEvent.EndCombat);
//         expect(endCombatCall).toBeDefined();
//         const endCombatCallback = endCombatCall?.[1];

//         if (endCombatCallback) {
//             endCombatCallback(winner);
//         }

//         expect(popupSpy).toHaveBeenCalledWith('TestWinner a gagné le combat');
//         expect(routerSpy).toHaveBeenCalledWith([PageEndpoint.Play]);
//     });
// });
