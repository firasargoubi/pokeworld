import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CARD_SIZE_TO_COLOR, GAME_CARD_ROW_LENGTHS, TABLET_BREAKPOINT } from '@app/consts/ui.const';
import { SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { MAX_PLAYERS } from '@common/consts/player-data.const';
import { GameData } from '@common/interfaces/game-data';
import { MatchData, MatchState } from '@common/interfaces/match-data';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
    imports: [FormsModule, CommonModule, TranslateModule],
    standalone: true,
})
export class GameCardComponent {
    @Input() game: GameData;
    @Input() matchData?: MatchData;
    @Input() isAdminView: boolean = false;
    @Input() index: number = 0;
    @Output() edit = new EventEmitter<string>();
    @Output() delete = new EventEmitter<string>();
    @Output() join = new EventEmitter<string>();

    isHovered: boolean = false;
    thumbnailUrl: string = '';
    cardColor: string = 'blue-card';
    private audioService: AudioService = inject(AudioService);
    private gameDataService: GameDataService = inject(GameDataService);
    private translate: TranslateService = inject(TranslateService);

    get matchStateIconClass(): string {
        let className = 'state-icon ';
        if (this.matchData?.state === MatchState.Lobby) {
            className += 'lobby';
        } else {
            className += 'in-game';
        }
        return className;
    }

    get gameMatchInfo(): string {
        if (this.matchData) {
            const maxPlayers = MAX_PLAYERS[this.game.mapData.size];
            const nbPlayers = this.matchData.players.filter((player) => player.isConnected).length;
            const lines = [
                `${nbPlayers}/${maxPlayers} ${this.translate.instant('components.gameCard.players')}`,
                `${this.translate.instant('components.gameCard.code')}: ${this.matchData.code}`,
            ];
            const formattedMatchInfo = lines.join('\n');
            return formattedMatchInfo;
        }
        return this.formatDate(this.game.lastEdited);
    }

    onEdit() {
        this.audioService.playEffect(SoundEffect.Click);
        this.gameDataService.setGameData(this.game);
        this.edit.emit(this.game._id);
    }
    onDelete() {
        this.audioService.playEffect(SoundEffect.Click);
        this.delete.emit(this.game._id);
    }

    onJoin() {
        this.audioService.playEffect(SoundEffect.Click);
        this.join.emit(this.game._id);
    }

    onMouseEnter() {
        this.isHovered = true;
    }

    onMouseLeave() {
        this.isHovered = false;
    }

    formatDate(dateString: string | Date): string {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    getCardColor(): string {
        return CARD_SIZE_TO_COLOR[this.game.mapData.size];
    }

    isAtRowEnd(): boolean {
        const viewportWidth = window.innerWidth;
        const rowLength = viewportWidth < TABLET_BREAKPOINT ? GAME_CARD_ROW_LENGTHS.tablet : GAME_CARD_ROW_LENGTHS.desktop;
        return (this.index + 1) % rowLength === 0;
    }
}
