import { CommonModule } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '@app/components/header/header.component';
import { WarningConfirmationPopupComponent } from '@app/components/warning-confirmation-popup/warning-confirmation-popup.component';
import { AVATAR_DATA } from '@app/consts/avatars.const';
import { BONUS_POINTS, DEFAULT_STAT_POINTS, MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@app/consts/default-player';
import { BonusDice, DiceType } from '@app/consts/dice';
import { StatType } from '@app/consts/player-stats.enum';
import { Avatars } from '@app/interfaces/avatars.enum';
import { PopupMessage } from '@app/interfaces/popup-message';

@Component({
    selector: 'app-player-selection-page',
    imports: [ReactiveFormsModule, HeaderComponent, CommonModule, WarningConfirmationPopupComponent],
    templateUrl: './player-selection-page.component.html',
    styleUrl: './player-selection-page.component.scss',
})
export class PlayerSelectionPageComponent {
    messages: PopupMessage[] = [];
    nameForm: FormControl = new FormControl('', [Validators.required, Validators.minLength(MIN_NAME_LENGTH), Validators.maxLength(MAX_NAME_LENGTH)]);
    bonusPointsForm: FormControl = new FormControl(StatType.Life, [Validators.required]);
    maxNameLength = MAX_NAME_LENGTH;

    diceType = DiceType;
    statType = StatType;
    bonusDice: BonusDice = { attack: DiceType.D4, defense: DiceType.D6 };

    avatarData = AVATAR_DATA;
    avatarList = Object.keys(AVATAR_DATA).slice(1) as Avatars[];
    selectedAvatar: Avatars = Avatars.Default;

    private isStartClicked: WritableSignal<boolean> = signal(false);
    private router: Router = inject(Router);

    getScore(statCategory: StatType) {
        return this.isBonusPoint(statCategory) ? DEFAULT_STAT_POINTS + BONUS_POINTS : DEFAULT_STAT_POINTS;
    }

    isBonusPoint(statCategory: StatType) {
        return this.bonusPointsForm?.value === statCategory;
    }

    toggleBonusDice(): void {
        [this.bonusDice.attack, this.bonusDice.defense] = [this.bonusDice.defense, this.bonusDice.attack];
    }

    getAvatarBtnStyle(avatar: Avatars) {
        if (avatar === this.selectedAvatar) {
            return { class: 'selected' };
        } else {
            return { class: 'unselected' };
        }
    }

    handleAvatarSelection(avatar: Avatars) {
        this.selectedAvatar = avatar;
    }

    needsWarning(formField: string) {
        const nameErrorMessage = 'Le nom doit contenir entre 3 et 15 caractères';
        const avatarErrorMessage = 'Veuillez choisir un avatar';

        if (formField === 'name') {
            if (!this.nameForm.valid && this.isStartClicked()) {
                if (!this.messages.some((message) => message.message === nameErrorMessage)) {
                    this.messages.push({ message: nameErrorMessage, isConfirmation: false });
                }
                return true;
            } else {
                this.messages = this.messages.filter((message) => message.message !== nameErrorMessage);
                return false;
            }
        } else if (formField === 'avatar') {
            if (!this.isValidAvatarChoice() && this.isStartClicked()) {
                if (!this.messages.some((message) => message.message === avatarErrorMessage)) {
                    this.messages.push({ message: avatarErrorMessage, isConfirmation: false });
                }
                return true;
            } else {
                this.messages = this.messages.filter((message) => message.message !== avatarErrorMessage);
                return false;
            }
        }
        return false;
    }

    removeMessage(index: number, confirmed: boolean) {
        const message = this.messages[index];

        if (message.isConfirmation && confirmed && message.action) {
            message.action();
        }

        this.messages.splice(index, 1);
    }

    goToLobby() {
        this.isStartClicked.set(true);
        this.needsWarning('name');
        this.needsWarning('avatar');
        if (this.isFormValid()) {
            this.router.navigate(['/lobby']);
        }
    }

    goToCreatPage() {
        this.router.navigate(['/create']);
    }

    isFormValid() {
        return this.nameForm.valid && this.isValidAvatarChoice();
    }

    private isValidAvatarChoice() {
        return this.selectedAvatar !== Avatars.Default;
    }
}
