import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { MatchService } from '@app/services/match/match.service';
import { UserService } from '@app/services/user/user.service';
import { FEE_ENTRY_STEP } from '@common/consts/match-data.const';
import { MatchSettings } from '@common/interfaces/match-data';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-pre-match-settings-popup',
    templateUrl: './pre-match-settings-popup.component.html',
    styleUrls: ['./pre-match-settings-popup.component.scss'],
    imports: [PokeballButtonComponent, NgClass, TranslateModule, FormsModule],
    standalone: true,
})
export class PreMatchSettingsPopupComponent implements OnChanges {
    @Input() isVisible: boolean = false;
    @Output() settingsSelected = new EventEmitter<MatchSettings>();

    matchSettings: MatchSettings = {
        isElementalMode: false,
        isDropInEnabled: false,
        isRapidElimination: false,
        isFriendOnly: false,
        entryFee: 0,
    };

    private readonly matchService: MatchService = inject(MatchService);
    private readonly audioService: AudioService = inject(AudioService);
    private readonly userService: UserService = inject(UserService);

    get maxEntryFee(): number {
        return Math.max(0, this.userService.currentUser?.balance ?? 0);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isVisible']?.currentValue) {
            this.synchronizeSettings();
        }
    }

    synchronizeSettings() {
        this.matchSettings.isFriendOnly = this.matchService.data.lobbyData.isFriendOnly;
        this.matchSettings.entryFee = this.setMaxFee(this.matchService.data.lobbyData.entryFee);
    }

    setFriendOnly(isFriendOnly: boolean) {
        this.audioService.playEffect(SoundEffect.Click);
        this.matchSettings.isFriendOnly = isFriendOnly;
    }

    setEntryFee(value: number) {
        const parsedValue = Number(value) || 0;
        this.matchSettings.entryFee = this.setMaxFee(parsedValue);
    }

    incrementEntryFee() {
        this.audioService.playEffect(SoundEffect.Click);
        this.matchSettings.entryFee = this.setMaxFee(this.matchSettings.entryFee + FEE_ENTRY_STEP);
    }

    decrementEntryFee() {
        this.audioService.playEffect(SoundEffect.Click);
        this.matchSettings.entryFee = this.setMaxFee(this.matchSettings.entryFee - FEE_ENTRY_STEP);
    }

    onValidateSelection() {
        this.audioService.playEffect(SoundEffect.Click);
        this.settingsSelected.emit(this.matchSettings);
    }

    private setMaxFee(value: number): number {
        return Math.min(this.maxEntryFee, Math.max(0, value ?? 0));
    }
}
