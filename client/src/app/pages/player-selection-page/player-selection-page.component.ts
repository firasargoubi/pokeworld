import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '@app/components/header/header.component';
import { BONUS_POINTS, DEFAULT_ESCAPE_POINTS, DEFAULT_STAT_POINTS, MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@app/consts/default-player.const';
import { BonusDice, DiceType } from '@app/consts/dice.const';
import { StatType } from '@app/interfaces/player-stats.enum';
import { AvatarSelectionService } from '@app/services/avatar-selection/avatar-selection.service';
import { PopupService } from '@app/services/popup/popup.service';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { Avatars } from '@common/avatars.enum';
import { Player } from '@common/player';

@Component({
    selector: 'app-player-selection-page',
    imports: [ReactiveFormsModule, HeaderComponent, CommonModule],
    templateUrl: './player-selection-page.component.html',
    styleUrl: './player-selection-page.component.scss',
})
export class PlayerSelectionPageComponent implements OnInit {
    nameForm: FormControl = new FormControl('', [Validators.required, Validators.minLength(MIN_NAME_LENGTH), Validators.maxLength(MAX_NAME_LENGTH)]);
    bonusPointsForm: FormControl = new FormControl(StatType.Life, [Validators.required]);
    bonusDice: BonusDice = { attack: DiceType.D4, defense: DiceType.D6 };

    maxNameLength = MAX_NAME_LENGTH;
    statType = StatType;

    private router: Router = inject(Router);
    private lobbySocketService: LobbySocketsService = inject(LobbySocketsService);
    private avatarSelectionService: AvatarSelectionService = inject(AvatarSelectionService);
    private popupService: PopupService = inject(PopupService);

    get avatarData() {
        return this.avatarSelectionService.avatarData;
    }

    get avatarList() {
        return this.avatarSelectionService.avatarList;
    }

    get selectedAvatar() {
        return this.avatarSelectionService.selectedAvatar;
    }

    ngOnInit(): void {
        this.avatarSelectionService.resetAvatar();
    }

    isBonusPoint(statCategory: StatType) {
        return this.bonusPointsForm?.value === statCategory;
    }

    toggleBonusDice(): void {
        [this.bonusDice.attack, this.bonusDice.defense] = [this.bonusDice.defense, this.bonusDice.attack];
    }

    getAvatarBtnStyle(avatar: Avatars) {
        const avatarStatus = this.avatarSelectionService.getAvatarStatus(avatar);
        return { class: avatarStatus };
    }

    handleAvatarSelection(avatar: Avatars) {
        const isAvatarAvailable = this.avatarSelectionService.isAvatarAvailable(avatar);
        if (isAvatarAvailable) {
            this.avatarSelectionService.updatePlayerAvatar(avatar);
            this.avatarSelectionService.selectedAvatar = avatar;
        }
    }

    goToLobby() {
        const warnings = this.getWarnings();
        const haveWarnings = warnings.length > 0;
        if (haveWarnings) {
            this.popupService.showPopup(warnings.join('\n'));
        } else {
            this.lobbySocketService.updatePlayer(this.getPlayerData());
            this.router.navigate(['/lobby']);
        }
    }

    goToMenu() {
        this.lobbySocketService.leaveMatch();
        this.avatarSelectionService.resetAvatar();
    }

    isFormValid() {
        return this.getWarnings().length === 0;
    }

    private getPlayerData() {
        const playerUpdates: Partial<Player> = {
            name: this.nameForm.value,
            avatar: this.selectedAvatar,
            playerStats: {
                health: this.getBonusStat(StatType.Life),
                speed: this.getBonusStat(StatType.Speed),
                attack: DEFAULT_STAT_POINTS,
                defense: DEFAULT_STAT_POINTS,
                attackDice: this.bonusDice.attack,
                defenseDice: this.bonusDice.defense,
                escapes: DEFAULT_ESCAPE_POINTS,
            },
            isConnected: true,
        };

        return playerUpdates;
    }

    private getBonusStat(statCategory: StatType) {
        return this.isBonusPoint(statCategory) ? DEFAULT_STAT_POINTS + BONUS_POINTS : DEFAULT_STAT_POINTS;
    }

    private getWarnings() {
        const nameErrorMessage = 'Le nom doit contenir entre 3 et 15 caractères';
        const avatarErrorMessage = 'Veuillez choisir un avatar';
        const warningList = [];

        if (!this.nameForm.valid) {
            warningList.push(nameErrorMessage);
        }
        if (!this.isAvatarChosen()) {
            warningList.push(avatarErrorMessage);
        }
        return warningList;
    }

    private isAvatarChosen() {
        return this.avatarSelectionService.selectedAvatar !== Avatars.Default;
    }
}
