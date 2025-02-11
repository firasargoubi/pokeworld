import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY_IMAGE, ITEM_IMAGES } from '@app/consts/images.const';
import { ITEM_DESCRIPTION, MAX_ITEM_COUNT } from '@app/consts/items.const';
import { EditorData, EditorItem } from '@app/interfaces/editor-data';
import { EventProperty } from '@app/interfaces/event-property';
import { BridgeValidationError, ValidationResult, ValidationStatus } from '@app/interfaces/game-validation-result';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { GameValidationService } from '@app/services/game-validation/game-validation.service';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';
import { DEFAULT_EDITOR_TILES, EDITOR_ERASE_TILE, ITEM_POOL_HIGHEST_ITEM, SHARED_ITEM_POOL } from './editor.service.const';

interface PopupMessage {
    message: string;
    isConfirmation: boolean;
    action?: () => void;
}

@Injectable({
    providedIn: 'root',
})
export class EditorService {
    messages: PopupMessage[] = [];
    router: Router = inject(Router);
    gameDataService: GameDataService = inject(GameDataService);
    editorData: EditorData = this.getEditorData();
    private gameValidationService: GameValidationService = inject(GameValidationService);
    private gameSaveService: GameSaveService = inject(GameSaveService);

    addMessage(message: string, isConfirmation: boolean, action?: () => void) {
        this.messages.push({ message, isConfirmation, action });
    }

    removeMessage(index: number, confirmed: boolean) {
        const message = this.messages[index];
        if (message.isConfirmation && confirmed && message.action) {
            message.action();
        }
        this.messages.splice(index, 1);
    }

    redirectToAdminPage(): void {
        this.router.navigate(['/admin']);
    }

    saveButton(): void {
        const validationResult = this.gameValidationService.validateGame(this.gameDataService.gameData);

        if (validationResult) {
            const errorMessage = this.getValidationErrorMessage(validationResult);
            this.addMessage(errorMessage, false);
            return;
        }

        this.gameSaveService.isNameUnique(this.gameDataService.gameData.name, this.gameDataService.gameData._id).subscribe((isUnique) => {
            if (!isUnique) {
                this.addMessage('Le nom est déjà utilisé. Veuillez en choisir un autre.', false);
                return;
            }
            this.gameDataService.gameData.isVisible = false;
            this.gameDataService.gameData.lastEdited = new Date();
            this.saveGame();
            this.redirectToAdminPage();
        });
    }

    resetButton(): void {
        return;
    }

    onMouseDown(event: MouseEvent): void {
        const isLeftClick = event.button === 0;
        this.onClick(event, isLeftClick);
    }

    onRightClick(event: MouseEvent): void {
        const eventProperty = this.getEventProperty(event);

        if (eventProperty.tilePosition) {
            event.preventDefault();
        }
    }

    onMouseUp(event: MouseEvent): void {
        this.editorData.activeTile = null;
        this.editorData.activeTilePosition = { x: -1, y: -1 };

        if (this.editorData.activeItem) {
            const eventProperty = this.getEventProperty(event);
            this.dropItem(eventProperty);
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.editorData.activeItem) {
            const position: Position = { x: event.clientX, y: event.clientY };

            if (position.x !== this.editorData.activeItemPosition.x) {
                this.editorData.activeItemPosition.x = position.x;
            }

            if (position.y !== this.editorData.activeItemPosition.y) {
                this.editorData.activeItemPosition.y = position.y;
            }
        }
    }

    onMouseOver(event: Event): void {
        if (!this.editorData.activeTile) {
            return;
        }

        const eventProperty = this.getEventProperty(event);

        if (!eventProperty.tilePosition) {
            return;
        }

        this.paintTile(eventProperty.tilePosition);
    }
    private getValidationErrorMessage(validationResult: ValidationResult): string {
        const errors: string[] = [];

        // Parcourir chaque propriété de validationResult
        for (const [key, value] of Object.entries(validationResult)) {
            if (key === 'terrainCoverage' && !value.isValid) {
                errors.push(`  - Couverture du terrain insuffisante (${value.coveragePercentage}%)`);
            } else if (key === 'tilesAccessibility' && !value.isValid) {
                errors.push(`  - ${value.nonAccessibleTileCount} tuiles inaccessibles`);
            } else if (key === 'items' && !value.isValid) {
                errors.push(`  - ${value.misplacedItems.length} objets mal placés`);
            } else if (key === 'bridge' && !value.isValid) {
                value.errors.forEach((error: BridgeValidationError) => {
                    errors.push(`  - Problème de pont en [${error.x},${error.y}]: ${error.errorCode}`);
                });
            } else if (typeof value === 'object' && value !== null && 'isValid' in value && !value.isValid) {
                const errorMessage: ValidationStatus = value;
                errors.push(`  - ${key}: ${errorMessage.errorCode}`);
            }
        }

        return errors.length > 0 ? 'Erreurs de validation :\n' + errors.join('\n') : 'Aucune erreur de validation';
    }
    private getEventProperty(event: Event): EventProperty {
        const target = event.target as HTMLElement;
        const tileXString = target.getAttribute('x');
        const tileYString = target.getAttribute('y');
        const tileString = target.getAttribute('tile');
        const itemString = target.getAttribute('item');

        const tileX = tileXString ? Number(tileXString) : null;
        const tileY = tileYString ? Number(tileYString) : null;
        const tilePosition = tileX !== null && tileY !== null ? { x: tileX, y: tileY } : null;

        const mouseX = (event as MouseEvent).clientX as number | undefined;
        const mouseY = (event as MouseEvent).clientY as number | undefined;
        const mousePosition = mouseX && mouseY ? { x: mouseX, y: mouseY } : null;

        return {
            tilePosition,
            mousePosition,
            tile: tileString ? (tileString as TileType) : null,
            item: itemString ? (itemString as ItemType) : null,
        };
    }

    private saveGame(): void {
        this.gameSaveService.saveGame(this.gameDataService.gameData).subscribe({
            error: (error) => {
                this.addMessage('Erreur lors de la sauvegarde du jeu: ' + error, false);
            },
        });
    }

    private dropItem(eventProperty: EventProperty): void {
        const newItem = this.editorData.activeItem as ItemType;

        this.setActiveItem(null, eventProperty);

        if (eventProperty.tilePosition) {
            const tile = this.gameDataService.getTileFromPosition(eventProperty.tilePosition);

            const canPlaceItem = ![TileType.Water, TileType.Bridge, TileType.BrokenBridge].includes(tile);
            if (canPlaceItem) {
                return this.gameDataService.addItem(newItem, eventProperty.tilePosition);
            }
        }

        this.updateItem(newItem);
    }

    private setActiveItem(item: ItemType | null, eventProperty: EventProperty) {
        this.editorData.activeItem = item;

        if (item) {
            this.editorData.activeItemImage = ITEM_IMAGES.get(item) as string;
        } else {
            this.editorData.activeItemImage = EMPTY_IMAGE;
        }

        if (eventProperty.mousePosition) {
            this.editorData.activeItemPosition = eventProperty.mousePosition;
        }
    }

    private onClick(event: MouseEvent, isLeftClick: boolean): void {
        const eventProperty = this.getEventProperty(event);

        if (eventProperty.tilePosition) {
            this.clickOnMap(eventProperty, isLeftClick);
            return event.preventDefault();
        }

        if (eventProperty.tile && isLeftClick) {
            this.clickOnTile(eventProperty.tile as TileType);
            return event.preventDefault();
        }

        if (eventProperty.item && isLeftClick) {
            this.clickOnItem(eventProperty);
            return event.preventDefault();
        }
    }

    private clickOnItem(eventProperty: EventProperty): void {
        if (this.getRemainingItemCount(eventProperty.item as ItemType) === 0) {
            return;
        }

        this.setActiveItem(eventProperty.item, eventProperty);
        this.updateItem(eventProperty.item as ItemType);
    }

    private clickOnMap(eventProperty: EventProperty, isLeftClick: boolean): void {
        const tileHasItem = Boolean(this.gameDataService.getItem(eventProperty.tilePosition as Position));

        if (!this.editorData.activeItem && tileHasItem) {
            if (isLeftClick) {
                return this.pickItem(eventProperty);
            } else {
                return this.gameDataService.removeItem(eventProperty.tilePosition as Position);
            }
        }

        if (!this.editorData.activeItem) {
            if (isLeftClick) {
                this.editorData.activeTile = this.editorData.selectedTile;
            } else {
                this.editorData.activeTile = EDITOR_ERASE_TILE;
            }

            return this.paintTile(eventProperty.tilePosition as Position);
        }
    }

    private clickOnTile(tile: TileType): void {
        this.editorData.selectedTile = tile;

        for (const tileData of this.editorData.tiles) {
            if (tileData.tile === tile) {
                tileData.isActive = true;
            } else if (tileData.isActive) {
                tileData.isActive = false;
            }
        }
    }

    private paintTile(position: Position): void {
        if (!this.editorData.activeTile) {
            return;
        }

        if (this.editorData.activeTilePosition.x === position.x && this.editorData.activeTilePosition.y === position.y) {
            return;
        }

        let newTile = this.editorData.activeTile as TileType;
        const oldTile = this.gameDataService.getTileFromPosition(position);

        if (newTile === TileType.BrokenBridge && oldTile === TileType.BrokenBridge) {
            newTile = TileType.Bridge;
        }

        if (newTile === oldTile) {
            return;
        }

        this.editorData.activeTilePosition = position;
        this.gameDataService.editTile(newTile, position);

        const tileCannotHaveItem = [TileType.Water, TileType.Bridge, TileType.BrokenBridge].includes(newTile);
        if (tileCannotHaveItem) {
            this.gameDataService.removeItem(position);
        }
    }

    private pickItem(eventProperty: EventProperty): void {
        const item = this.gameDataService.getItem(eventProperty.tilePosition as Position) as ItemType;
        this.setActiveItem(item, eventProperty);
        this.gameDataService.removeItem(eventProperty.tilePosition as Position);
    }

    private getEditorData(): EditorData {
        this.verifyMapData();
        this.gameDataService.itemUpdate.subscribe((x) => this.onItemUpdate(x));

        return {
            tiles: DEFAULT_EDITOR_TILES,
            items: this.getEditorItems(),
            selectedTile: null,
            activeTile: null,
            activeTilePosition: { x: -1, y: -1 },
            activeItem: null,
            activeItemImage: EMPTY_IMAGE,
            activeItemPosition: { x: -1, y: -1 },
        };
    }

    private onItemUpdate(item: ItemType | null): void {
        if (!item) {
            this.updateAllItems();
        } else {
            this.updateItem(item);
        }
    }

    private updateAllItems(): void {
        this.editorData.items = this.getEditorItems();
    }

    private verifyMapData(): void {
        if (!this.gameDataService.isMapValid()) {
            this.router.navigate(['/admin']);
        }
    }

    private updateItem(item: ItemType): void {
        let itemsToUpdate = [item];

        if (SHARED_ITEM_POOL.includes(item)) {
            itemsToUpdate = SHARED_ITEM_POOL;
        }

        for (let i = 0; i < this.editorData.items.length; i++) {
            if (itemsToUpdate.includes(this.editorData.items[i].item)) {
                const editorItem = this.getEditorItem(this.editorData.items[i].item);

                if (editorItem.count !== this.editorData.items[i].count) {
                    this.editorData.items[i] = editorItem;
                }
            }
        }
    }

    private getEditorItems(): EditorItem[] {
        const items = Object.values(ItemType);
        return items.map(this.getEditorItem.bind(this));
    }

    private getEditorItem(item: ItemType): EditorItem {
        return {
            item,
            image: ITEM_IMAGES.get(item) as string,
            description: ITEM_DESCRIPTION.get(item) as string,
            count: this.getRemainingItemCount(item),
        };
    }

    private getMaxItemCount(item: ItemType): number {
        if (item === ItemType.Flag) {
            if (this.gameDataService.getGameMode() === GameMode.CTF) {
                return 1;
            } else {
                return 0;
            }
        }

        let maxItemCount = MAX_ITEM_COUNT.get(this.gameDataService.getMapSize())?.get(item) as number;

        if (SHARED_ITEM_POOL.includes(item)) {
            const maxSharedItemCount = this.getMaxSharedItemCount(item);
            maxItemCount = Math.min(maxItemCount, maxSharedItemCount);
        }

        return maxItemCount;
    }

    private getRemainingItemCount(item: ItemType): number {
        const currentItemCount = this.getCurrentItemCount(item);
        const maxItemCount = this.getMaxItemCount(item);

        if (maxItemCount === 1 && currentItemCount === 0) {
            return -1;
        }

        return maxItemCount - currentItemCount;
    }

    private getCurrentItemCount(item: ItemType): number {
        let currentItemCount = this.gameDataService.getItemCount(item);

        if (this.editorData?.activeItem === item) {
            currentItemCount++;
        }

        return currentItemCount;
    }

    private getMaxSharedItemCount(item: ItemType): number {
        let sharedCount = 0;

        SHARED_ITEM_POOL.forEach((sharedItem) => {
            if (sharedItem !== item) {
                sharedCount += this.getCurrentItemCount(sharedItem);
            }
        });

        const highestMaxItemCount = MAX_ITEM_COUNT.get(this.gameDataService.getMapSize())?.get(ITEM_POOL_HIGHEST_ITEM) as number;

        return highestMaxItemCount - sharedCount;
    }
}
