import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ItemComponent } from '@app/components/item/item.component';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { PlayService } from '@app/services/play/play.service';
import { ItemType } from '@common/interfaces/item-type.enum';

@Component({
    selector: 'app-item-drop-popup',
    templateUrl: './item-drop-popup.component.html',
    styleUrls: ['./item-drop-popup.component.scss'],
    imports: [ItemComponent, PokeballButtonComponent, CommonModule],
})
export class ItemDropPopupComponent implements OnInit, OnDestroy {
    @Input() inventoryItems: ItemType[] = [];
    selectedItem: number = 2;
    private playService: PlayService = inject(PlayService);
    private timerRef: ReturnType<typeof setTimeout> | null = null;

    ngOnInit(): void {
        const selectionDuration = 10000;
        this.timerRef = setTimeout(() => {
            this.validateChoise();
        }, selectionDuration);
    }

    ngOnDestroy(): void {
        if (this.timerRef) {
            clearTimeout(this.timerRef);
            this.timerRef = null;
        }
    }

    validateChoise() {
        this.playService.dropItem(this.inventoryItems[this.selectedItem]);
    }
}
