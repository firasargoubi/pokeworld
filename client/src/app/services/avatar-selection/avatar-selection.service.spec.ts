import { TestBed } from '@angular/core/testing';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { AvatarStatus } from '@common/avatar-status.enum';
import { Avatars } from '@common/avatars.enum';
import { Player } from '@common/player';
import { of } from 'rxjs';
import { AvatarSelectionService } from './avatar-selection.service';

describe('AvatarSelectionService', () => {
    let service: AvatarSelectionService;
    let lobbySocketServiceSpy: jasmine.SpyObj<LobbySocketsService>;

    beforeEach(() => {
        lobbySocketServiceSpy = jasmine.createSpyObj('LobbySocketsService', ['updatePlayer'], {
            players$: of([] as Player[]),
        });

        TestBed.configureTestingModule({
            providers: [AvatarSelectionService, { provide: LobbySocketsService, useValue: lobbySocketServiceSpy }],
        });
        service = TestBed.inject(AvatarSelectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should reset avatar to default', () => {
        service.resetAvatar();
        expect(service.selectedAvatar).toBe(Avatars.Default);
    });

    it('should update player avatar', () => {
        service.updatePlayerAvatar(Avatars.Avatar1);
        expect(lobbySocketServiceSpy.updatePlayer).toHaveBeenCalledWith({ avatar: Avatars.Avatar1 });
    });

    it('should return correct avatar status', () => {
        service.selectedAvatar = Avatars.Avatar1;
        expect(service.getAvatarStatus(Avatars.Avatar1)).toBe(AvatarStatus.SELECTED);

        service['playerList'] = [{ avatar: Avatars.Avatar2 } as Player];
        expect(service.getAvatarStatus(Avatars.Avatar2)).toBe(AvatarStatus.LOCKED);

        expect(service.getAvatarStatus(Avatars.Avatar3)).toBe(AvatarStatus.UNSELECTED);
    });

    it('should check if avatar is available', () => {
        service.selectedAvatar = Avatars.Avatar1;
        expect(service.isAvatarAvailable(Avatars.Avatar1)).toBeFalse();

        service['playerList'] = [{ avatar: Avatars.Avatar2 } as Player];
        expect(service.isAvatarAvailable(Avatars.Avatar2)).toBeFalse();

        expect(service.isAvatarAvailable(Avatars.Avatar3)).toBeTrue();
    });

    it('should have correct avatar data and list', () => {
        expect(service.avatarData).toBeDefined();
        expect(service.avatarList).toEqual(Object.keys(service.avatarData).slice(1) as Avatars[]);
    });
});
