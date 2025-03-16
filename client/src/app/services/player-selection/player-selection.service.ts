import { inject, Injectable } from '@angular/core';
import { AvatarStatus } from '@common/avatar-status.enum';
import { Avatars } from '@common/avatars.enum';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { AVATAR_DATA } from '@app/consts/avatars.const';
import { Player } from '@common/player';
import { DiceType } from '@common/dice';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class PlayerSelectionService {
    matchCode: string = '';
    playerData: Partial<Player> = {
        name: '',
        avatar: Avatars.Default,
        playerStats: {
            health: 0,
            speed: 0,
            attack: 0,
            defense: 0,
            attackDice: DiceType.D4,
            defenseDice: DiceType.D6,
            escapes: 0,
        },
        isConnected: true,
    };
    readonly avatarData = AVATAR_DATA;
    readonly avatarList = Object.keys(AVATAR_DATA).slice(1) as Avatars[];
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
        return this.playerData.avatar as Avatars;
    }

    handleAvatarSelection(avatar: Avatars) {
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
            this.router.navigate(['/lobby']);
        } else {
            // if the game has been locked while in player selection
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

    updatePlayerAvatar(avatar: Avatars) {
        this.lobbySocketService.updatePlayer({ avatar });
    }

    getAvatarStatus(targetAvatar: Avatars): AvatarStatus {
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
        this.playerData.avatar = Avatars.Default;
    }

    isAvatarAvailable(targetAvatar: Avatars) {
        return this.getAvatarStatus(targetAvatar) === AvatarStatus.UNSELECTED;
    }

    private isPlayerInLobby() {
        return this.lobbySocketService.matchCode !== '';
    }
}
