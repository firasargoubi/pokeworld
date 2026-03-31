import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { MatchService } from '@app/services/match/match.service';
import { MatchSettings } from '@common/interfaces/match-data';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-pre-match-settings-popup',
    templateUrl: './pre-match-settings-popup.component.html',
    styleUrls: ['./pre-match-settings-popup.component.scss'],
    imports: [PokeballButtonComponent, NgClass, TranslateModule],
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
    };

    private readonly matchService: MatchService = inject(MatchService);
    private readonly audioService: AudioService = inject(AudioService);

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isVisible']?.currentValue) {
            this.synchronizeSettings();
        }
    }

    synchronizeSettings() {
        this.matchSettings.isFriendOnly = this.matchService.data.lobbyData.isFriendOnly;
    }

    setFriendOnly(isFriendOnly: boolean) {
        this.audioService.playEffect(SoundEffect.Click);
        this.matchSettings.isFriendOnly = isFriendOnly;
    }

    onValidateSelection() {
        this.audioService.playEffect(SoundEffect.Click);
        this.settingsSelected.emit(this.matchSettings);
    }
}
