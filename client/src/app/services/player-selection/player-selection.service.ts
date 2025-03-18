import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AVATAR_DATA } from '@app/consts/avatar-data.const';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { Avatar, AvatarStatus } from '@common/interfaces/avatar.enum';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { Player } from '@common/interfaces/player';
import { DEFAULT_PARTIAL_PLAYER } from './player-selection.service.const';

@Injectable({
    providedIn: 'root',
})
export class PlayerSelectionService {
    matchCode: string = '';
    playerData: Partial<Player> = DEFAULT_PARTIAL_PLAYER;
    readonly avatarData = AVATAR_DATA;
    readonly avatarList = Object.keys(AVATAR_DATA).slice(1) as Avatar[];
    private lobbySocketService: LobbySocketsService = inject(LobbySocketsService);
    private playerList: Player[];
    private router: Router = inject(Router);

    constructor() {
        this.lobbySocketService.players$.subscribe((players) => {
            this.playerList = players;
        });
        this.resetAvatar();
    }

    get selectedAvatar() {
        return this.playerData.avatar as Avatar;
    }

    handleAvatarSelection(avatar: Avatar) {
        const isAvatarAvailable = this.isAvatarAvailable(avatar);
        if (isAvatarAvailable) {
            this.playerData.avatar = avatar;
        }
        if (this.isPlayerInLobby()) {
            this.updatePlayerAvatar(avatar);
        }
    }

    joinLobby() {
        if (this.isPlayerInLobby()) {
            this.lobbySocketService.updatePlayer(this.playerData);
            this.router.navigate([PageEndpoint.Lobby]);
        } else {
            const matchCode = this.matchCode;
            this.lobbySocketService.joinMatch(matchCode).subscribe((joinStatus: boolean) => {
                if (joinStatus) {
                    this.joinLobby();
                }
            });
        }
    }

    setPlayerData(playerUpdates: Partial<Player>) {
        Object.assign(this.playerData, playerUpdates);
    }

    updatePlayerAvatar(avatar: Avatar) {
        this.lobbySocketService.updatePlayer({ avatar });
    }

    getAvatarStatus(targetAvatar: Avatar): AvatarStatus {
        if (targetAvatar === this.playerData.avatar) {
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
        this.playerData.avatar = Avatar.Default;
    }

    isAvatarAvailable(targetAvatar: Avatar) {
        return this.getAvatarStatus(targetAvatar) === AvatarStatus.UNSELECTED;
    }

    private isPlayerInLobby() {
        return this.lobbySocketService.matchCode !== '';
    }
}
