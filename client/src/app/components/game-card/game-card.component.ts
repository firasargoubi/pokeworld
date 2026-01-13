import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GAME_CARD_ROW_LENGTHS, TABLET_BREAKPOINT } from '@app/consts/ui.const';
import { SoundEffect } from '@app/interfaces/sound-service';
import { VisibilityEvent } from '@app/interfaces/visibility-event';
import { AudioService } from '@app/services/audio/audio.service';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { ThumbnailService } from '@app/services/thumbnail/thumbnail.service';
import { GameData } from '@common/interfaces/game-data';
import { MapSize } from '@common/interfaces/map-data';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
    imports: [FormsModule, CommonModule],
    standalone: true,
})
export class GameCardComponent implements OnInit, AfterViewInit {
    @Input() game: GameData;
    @Input() isAdminView: boolean = false;
    @Input() index: number = 0;
    @Output() edit = new EventEmitter<string>();
    @Output() delete = new EventEmitter<string>();
    @Output() toggleVisibility = new EventEmitter<VisibilityEvent>();
    @Output() join = new EventEmitter<string>();

    isHovered: boolean = false;
    thumbnailUrl: string = '';
    cardColor: string = 'blue-card';
    private audioService: AudioService = inject(AudioService);
    private thumbnailService: ThumbnailService = inject(ThumbnailService);
    private gameDataService: GameDataService = inject(GameDataService);

    ngOnInit() {
        this.cardColor = this.getCardColor();
    }

    ngAfterViewInit() {
        setTimeout(this.generateThumbnail.bind(this), 1);
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

    onToggleVisibility() {
        this.audioService.playEffect(SoundEffect.Click);
        this.toggleVisibility.emit({ id: this.game._id, isVisible: this.game.isVisible });
        this.game.isVisible = !this.game.isVisible;
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
        const classes = ['blue-card', 'green-card', 'pink-card'];
        if (this.game.mapData.size === MapSize.Small) return classes[0];
        else if (this.game.mapData.size === MapSize.Medium) return classes[1];
        else return classes[2];
    }

    isAtRowEnd(): boolean {
        const viewportWidth = window.innerWidth;
        const rowLength = viewportWidth < TABLET_BREAKPOINT ? GAME_CARD_ROW_LENGTHS.tablet : GAME_CARD_ROW_LENGTHS.desktop;
        return (this.index + 1) % rowLength === 0;
    }

    private async generateThumbnail() {
        this.thumbnailUrl = await this.thumbnailService.getThumbnail(this.game.mapData, true);
    }
}
