import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { of, Subject } from 'rxjs';
import { PlayerSelectionService } from './player-selection.service';
import { Player } from '@common/interfaces/player';
import { Avatar, AvatarStatus } from '@common/interfaces/avatar.enum';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { DiceType } from '@common/interfaces/dice';

describe('PlayerSelectionService', () => {
    let service: PlayerSelectionService;
    let lobbySocketServiceSpy: jasmine.SpyObj<LobbySocketsService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        lobbySocketServiceSpy = jasmine.createSpyObj('LobbySocketsService', ['updatePlayer', 'joinMatch'], {
            players$: of([] as Player[]),
            matchCode: '',
        });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                PlayerSelectionService,
                { provide: LobbySocketsService, useValue: lobbySocketServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
        service = TestBed.inject(PlayerSelectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should reset avatar to default', () => {
        service.resetAvatar();
        expect(service.playerData.avatar).toBe(Avatar.Default);
    });

    it('should update player avatar', () => {
        service.updatePlayerAvatar(Avatar.Avatar1);
        expect(lobbySocketServiceSpy.updatePlayer).toHaveBeenCalledWith({ avatar: Avatar.Avatar1 });
    });

    it('should return correct avatar status', () => {
        service.playerData.avatar = Avatar.Avatar1;
        expect(service.getAvatarStatus(Avatar.Avatar1)).toBe(AvatarStatus.SELECTED);

        service['playerList'] = [{ avatar: Avatar.Avatar2 } as Player];
        expect(service.getAvatarStatus(Avatar.Avatar2)).toBe(AvatarStatus.LOCKED);

        expect(service.getAvatarStatus(Avatar.Avatar3)).toBe(AvatarStatus.UNSELECTED);
    });

    it('should check if avatar is available', () => {
        service.playerData.avatar = Avatar.Avatar1;
        expect(service.isAvatarAvailable(Avatar.Avatar1)).toBeFalse();

        service['playerList'] = [{ avatar: Avatar.Avatar2 } as Player];
        expect(service.isAvatarAvailable(Avatar.Avatar2)).toBeFalse();

        expect(service.isAvatarAvailable(Avatar.Avatar3)).toBeTrue();
    });

    it('should have correct avatar data and list', () => {
        expect(service.avatarData).toBeDefined();
        expect(service.avatarList).toEqual(Object.keys(service.avatarData).slice(1) as Avatar[]);
    });

    it('should handle avatar selection correctly', () => {
        const updatePlayerAvatarSpy = spyOn(service, 'updatePlayerAvatar');
        service['isPlayerInLobby'] = () => true;

        service.handleAvatarSelection(Avatar.Avatar1);
        expect(service.playerData.avatar).toBe(Avatar.Avatar1);
        expect(updatePlayerAvatarSpy).toHaveBeenCalledWith(Avatar.Avatar1);

        service['isPlayerInLobby'] = () => false;
        service.handleAvatarSelection(Avatar.Avatar2);
        expect(service.playerData.avatar).toBe(Avatar.Avatar2);
        expect(updatePlayerAvatarSpy).not.toHaveBeenCalledWith(Avatar.Avatar2);
    });

    it('should not select an unavailable avatar', () => {
        spyOn(service, 'isAvatarAvailable').and.returnValue(false);
        service.handleAvatarSelection(Avatar.Avatar1);
        expect(service.playerData.avatar).not.toBe(Avatar.Avatar1);
    });

    it('should join lobby if player is already in lobby', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'isPlayerInLobby').and.returnValue(true);
        service.joinLobby();
        expect(lobbySocketServiceSpy.updatePlayer).toHaveBeenCalledWith(service.playerData);
        expect(routerSpy.navigate).toHaveBeenCalledWith([PageEndpoint.Lobby]);
    });

    it('should join match and then join lobby if player is not in lobby', () => {
        lobbySocketServiceSpy.matchCode = '';
        let isPlayerInLobby = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'isPlayerInLobby').and.callFake(() => isPlayerInLobby);
        const joinMatchSubject = new Subject<boolean>();
        lobbySocketServiceSpy.joinMatch.and.returnValue(joinMatchSubject.asObservable());

        const joinLobbySpy = spyOn(service, 'joinLobby').and.callThrough();

        service.joinLobby();
        isPlayerInLobby = true; // Update the condition to simulate successful join
        joinMatchSubject.next(true);

        expect(lobbySocketServiceSpy.joinMatch).toHaveBeenCalledWith(service.matchCode);
        expect(joinLobbySpy).toHaveBeenCalledTimes(2); // Ensure joinLobby is called again
        expect(lobbySocketServiceSpy.updatePlayer).toHaveBeenCalledWith(service.playerData);
        expect(routerSpy.navigate).toHaveBeenCalledWith([PageEndpoint.Lobby]);
    });

    it('should not join lobby if join match fails', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'isPlayerInLobby').and.returnValue(false);
        const joinMatchSubject = new Subject<boolean>();
        lobbySocketServiceSpy.joinMatch.and.returnValue(joinMatchSubject.asObservable());

        service.joinLobby();
        joinMatchSubject.next(false);

        expect(lobbySocketServiceSpy.joinMatch).toHaveBeenCalledWith(service.matchCode);
        expect(lobbySocketServiceSpy.updatePlayer).not.toHaveBeenCalled();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should set player data correctly', () => {
        const playerUpdates: Partial<Player> = {
            name: 'NewPlayer',
            avatar: Avatar.Avatar2,
            playerStats: {
                health: 10,
                speed: 5,
                attack: 8,
                defense: 6,
                attackDice: DiceType.D4,
                defenseDice: DiceType.D6,
                escapes: 1,
            },
        };
        service.setPlayerData(playerUpdates);
        expect(service.playerData).toEqual(jasmine.objectContaining(playerUpdates));
    });

    it('should return the selected avatar', () => {
        service.playerData.avatar = Avatar.Avatar1;
        expect(service.selectedAvatar).toBe(Avatar.Avatar1);

        service.playerData.avatar = Avatar.Avatar2;
        expect(service.selectedAvatar).toBe(Avatar.Avatar2);
    });
});
