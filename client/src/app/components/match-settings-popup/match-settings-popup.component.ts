import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { MatchService } from '@app/services/match/match.service';
import { MatchSettings } from '@common/interfaces/match-data';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-match-settings-popup',
    templateUrl: './match-settings-popup.component.html',
    styleUrls: ['./match-settings-popup.component.scss'],
    imports: [PokeballButtonComponent, NgClass, TranslateModule],
    standalone: true,
})
export class MatchSettingsPopupComponent implements OnChanges {
    @Input() isVisible: boolean = false;
    @Output() settingsSelected = new EventEmitter<MatchSettings>();

    matchSettings: MatchSettings = {
        isElementalMode: false,
        isDropInEnabled: false,
        isRapidElimination: false,
        isFriendOnly: false,
    };

    private readonly matchService: MatchService = inject(MatchService);
    private readonly audioService: AudioService = inject(AudioService);

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isVisible']?.currentValue) {
            this.synchronizeSettings();
        }
    }

    synchronizeSettings() {
        this.matchSettings.isElementalMode = this.matchService.data.playData.isElementalMode;
        this.matchSettings.isDropInEnabled = this.matchService.data.lobbyData.isDropInEnabled;
        this.matchSettings.isRapidElimination = this.matchService.data.lobbyData.isRapidElimination;
    }

    toggleElementalMode() {
        this.audioService.playEffect(SoundEffect.Click);
        this.matchSettings.isElementalMode = !this.matchSettings.isElementalMode;
    }

    toggleDropInDropOut() {
        this.audioService.playEffect(SoundEffect.Click);
        this.matchSettings.isDropInEnabled = !this.matchSettings.isDropInEnabled;
    }

    toggleRapidElimination() {
        this.audioService.playEffect(SoundEffect.Click);
        this.matchSettings.isRapidElimination = !this.matchSettings.isRapidElimination;
    }

    onValidateSelection() {
        this.audioService.playEffect(SoundEffect.Click);
        this.settingsSelected.emit(this.matchSettings);
    }
}
