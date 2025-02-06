import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { GameData } from '@common/game-data';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
    imports: [FormsModule, CommonModule],
    standalone: true,
})
export class GameCardComponent {
    @Input() game!: GameData;
    @Input() isAdminView: boolean = false;
    @Input() cardColor: string = 'blue-card';
    @Output() edit = new EventEmitter<string>();
    @Output() delete = new EventEmitter<string>();
    @Output() toggleVisibility = new EventEmitter<{ id: string; isVisible: boolean }>();
    @Output() join = new EventEmitter<string>();

    isHovered: boolean = false;

    constructor(private gameDataService: GameDataService) {}

    onEdit() {
        this.gameDataService.setGameData(this.game);
        this.edit.emit(this.game._id);
    }

    onDelete() {
        const confirmation = window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?');

        if (confirmation) {
            this.delete.emit(this.game._id);
        }
    }

    onToggleVisibility() {
        this.toggleVisibility.emit({ id: this.game._id, isVisible: this.game.isVisible });
        this.game.isVisible = !this.game.isVisible; // CHECK if needed
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
