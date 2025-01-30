import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameData } from '@common/game-data';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
    imports: [FormsModule, CommonModule],
})
export class GameCardComponent {
    @Input() game!: GameData;
    @Input() isAdminView: boolean = false;
    @Input() cardIndex: string;
    @Output() edit = new EventEmitter<string>();
    @Output() delete = new EventEmitter<string>();
    @Output() toggleVisibility = new EventEmitter<{ id: string; isVisible: boolean }>();
    @Output() join = new EventEmitter<string>();
    @Output() thumbnailHover = new EventEmitter<boolean>();

    onEdit() {
        this.edit.emit(this.game._id);
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
        this.thumbnailHover.emit(true);
    }

    onMouseLeave() {
        this.thumbnailHover.emit(false);
    }

    formatDate(dateString: string | Date): string {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}
