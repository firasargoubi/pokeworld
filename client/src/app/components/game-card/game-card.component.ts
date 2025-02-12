import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { ThumbnailService } from '@app/services/thumbnail/thumbnail.service';
import { GameData } from '@common/game-data';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
    imports: [FormsModule, CommonModule],
    standalone: true,
})
export class GameCardComponent implements OnInit {
    @Input() game: GameData;
    @Input() isAdminView: boolean = false;
    @Input() cardColor: string = 'blue-card';
    @Output() edit = new EventEmitter<string>();
    @Output() delete = new EventEmitter<string>();
    @Output() toggleVisibility = new EventEmitter<{ id: string; isVisible: boolean }>();
    @Output() join = new EventEmitter<string>();

    thumbnailService: ThumbnailService = inject(ThumbnailService);
    isHovered: boolean = false;
    thumbnailUrl: string;
    gameDataService: GameDataService = inject(GameDataService);

    onEdit() {
        this.gameDataService.setGameData(this.game);
        this.edit.emit(this.game._id);
    }

    ngOnInit() {
        this.thumbnailService.getThumbnail(this.game.mapData).then((url) => {
            this.thumbnailUrl = url;
        });
    }

    onDelete() {
        this.delete.emit(this.game._id);
    }

    onToggleVisibility() {
        this.toggleVisibility.emit({ id: this.game._id, isVisible: this.game.isVisible });
        this.game.isVisible = !this.game.isVisible;
    }

    onJoin() {
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
}
