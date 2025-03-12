import { inject, Injectable } from '@angular/core';
import { AvatarStatus } from '@common/avatar-status.enum';
import { Avatars } from '@common/avatars.enum';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { AVATAR_DATA } from '@app/consts/avatars.const';
import { Player } from '@common/player';

@Injectable({
    providedIn: 'root',
})
export class AvatarSelectionService {
    selectedAvatar: Avatars;
    readonly avatarData = AVATAR_DATA;
    readonly avatarList = Object.keys(AVATAR_DATA).slice(1) as Avatars[];
    private lobbySocketService: LobbySocketsService = inject(LobbySocketsService);
    private playerList: Player[];

    constructor() {
        this.lobbySocketService.players$.subscribe((players) => {
            this.playerList = players;
        });
        this.resetAvatar();
    }

    updatePlayerAvatar(avatar: Avatars) {
        this.lobbySocketService.updatePlayer({ avatar });
    }

    getAvatarStatus(targetAvatar: Avatars): AvatarStatus {
        if (targetAvatar === this.selectedAvatar) {
            return AvatarStatus.SELECTED;
        }
        for (const player of this.playerList) {
            if (targetAvatar === player.avatar) {
                return AvatarStatus.LOCKED;
            }
        }

        return AvatarStatus.UNSELECTED;
    }

    resetAvatar() {
        this.selectedAvatar = Avatars.Default;
    }

    isAvatarAvailable(targetAvatar: Avatars) {
        return this.getAvatarStatus(targetAvatar) === AvatarStatus.UNSELECTED;
    }
}
