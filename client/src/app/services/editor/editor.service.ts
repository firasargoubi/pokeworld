import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EditorData } from '@app/interfaces/editor/editor-data';
import { EditorItem } from '@app/interfaces/editor/editor-item';
import { EditorTile } from '@app/interfaces/editor/editor-tile';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { GameValidationService } from '@app/services/game-validation/game-validation.service';
import { ImageService } from '@app/services/image/image.service';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapSize } from '@common/map-size.enum';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';

@Injectable({
    providedIn: 'root',
})
export class EditorService {
    imageService: ImageService = inject(ImageService);
    gameDataService: GameDataService = inject(GameDataService);
    editorData: EditorData = this.getEditorData();
    private selectedTile: TileType | null = null;
    private activeTile: TileType | null = null;
    private activeItem: ItemType | null = null;
    private lastPosition: Position = { x: -1, y: -1 };
    private router: Router = inject(Router);
    private gameValidationService: GameValidationService = inject(GameValidationService);
    private gameSaveService: GameSaveService = inject(GameSaveService);

    redirectToAdminPage(): void {
        this.router.navigate(['/admin']);
    }

    saveButton(): void {
        const validationResult = this.gameValidationService.validateGame(this.gameDataService.gameData);

        if (validationResult !== null) {
            window.console.log('Erreur de validation du jeu:', validationResult);
            return;
        }

        this.gameSaveService.isNameUnique(this.gameDataService.gameData.name, this.gameDataService.gameData._id).subscribe(
            (response) => {
                if (!response.isUnique) {
                    window.console.log('Le nom est déjà utilisé. Veuillez en choisir un autre.');
                    return;
                }
                this.gameSaveService.saveGame(this.gameDataService.gameData).subscribe({
                    next: () => {
                        window.console.log(`Le jeu "${this.gameDataService.gameData.name}" a été sauvegardé avec succès.`);
                        this.redirectToAdminPage();
                    },
                    error: (error) => {
                        window.console.error('Erreur lors de la sauvegarde du jeu:', error);
                    },
                });
            },
            (error) => {
                window.console.error('Erreur lors de la vérification du nom du jeu:', error);
            },
        );
    }

    resetButton(): void {
        return;
    }

    onMouseDown(event: MouseEvent): void {
        const isLeftClick = event.button === 0;
        this.onClick(event, isLeftClick);
    }

    onRightClick(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        const xPos = target.getAttribute('x');
        const yPos = target.getAttribute('y');

        if (xPos !== null && yPos !== null) {
            event.preventDefault();
        }
    }

    onMouseUp(event: MouseEvent): void {
        this.activeTile = null;
        this.lastPosition = { x: -1, y: -1 };

        if (this.activeItem !== null) {
            this.dropItem(event.target as HTMLElement);
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.activeItem !== null) {
            this.moveItem(event.clientX, event.clientY);
        }
    }

    onMouseOver(event: Event): void {
        if (this.activeTile === null) {
            return;
        }

        const target = event.target as HTMLElement;
        const xPos = target.getAttribute('x');
        const yPos = target.getAttribute('y');

        if (xPos === null || yPos === null) {
            return;
        }

        const position = { x: Number(xPos), y: Number(yPos) };
        this.paintTile(position);
    }

    // TODO
    private moveItem(xPos: number, yPos: number): void {
        window.console.log(`moveItem(${xPos}, ${yPos})`);
    }

    private dropItem(target: HTMLElement): void {
        const newItem = this.activeItem as ItemType;
        const xPos = target.getAttribute('x');
        const yPos = target.getAttribute('y');

        if (xPos !== null && yPos !== null) {
            const position = { x: Number(xPos), y: Number(yPos) };
            const oldItem = this.gameDataService.getItem(position);

            this.gameDataService.addItem(newItem, position);

            if (oldItem !== null) {
                this.updateEditorItem(oldItem);
            }
        }

        this.activeItem = null;
        this.updateEditorItem(newItem);
    }

    private onClick(event: MouseEvent, isLeftClick: boolean): void {
        const target = event.target as HTMLElement;
        const xPos = target.getAttribute('x');
        const yPos = target.getAttribute('y');
        const tile = target.getAttribute('tile');
        const item = target.getAttribute('item');

        if (xPos !== null && yPos !== null) {
            const position = { x: Number(xPos), y: Number(yPos) };
            this.clickOnBoard(position, isLeftClick);
            return event.preventDefault();
        }

        if (tile !== null && isLeftClick) {
            this.clickOnTile(tile as TileType);
            return event.preventDefault();
        }

        if (item !== null && isLeftClick) {
            this.clickOnItem(item as ItemType);
            return event.preventDefault();
        }
    }

    private clickOnItem(item: ItemType) {
        if (this.getRemainingItemCount(item) === 0) {
            return;
        }

        this.activeItem = item;
        this.updateEditorItem(item);
    }

    private clickOnBoard(pos: Position, isLeftClick: boolean): void {
        const hasActiveItem = this.activeItem !== null;
        const tileHasItem = this.gameDataService.getItem(pos) !== null;

        if (!hasActiveItem && tileHasItem && isLeftClick) {
            return this.pickItem(pos);
        }

        if (!hasActiveItem) {
            if (isLeftClick) {
                this.activeTile = this.selectedTile;
            } else {
                // TODO add to const file
                this.activeTile = TileType.Grass;
            }

            return this.paintTile(pos);
        }
    }

    private clickOnTile(tile: TileType): void {
        this.selectedTile = tile;

        for (const tileData of this.editorData.tiles) {
            if (tileData.tile === tile) {
                tileData.isActive = true;
            } else if (tileData.isActive) {
                tileData.isActive = false;
            }
        }
    }

    private paintTile(pos: Position): void {
        if (this.activeTile === null) {
            return;
        }

        if (this.lastPosition.x === pos.x && this.lastPosition.y === pos.y) {
            return;
        }

        let newTile = this.activeTile as TileType;
        const oldTile = this.gameDataService.getTile(pos);

        if (newTile === TileType.Bridge && oldTile === TileType.Bridge) {
            newTile = TileType.BrokenBridge;
        }

        if (newTile === oldTile) {
            return;
        }

        this.lastPosition = pos;
        this.gameDataService.editTile(newTile, pos);
    }

    private pickItem(pos: Position): void {
        const item = this.gameDataService.getItem(pos) as ItemType;
        this.gameDataService.removeItem(pos);
        this.activeItem = item;
        this.updateEditorItem(item);
    }

    private getEditorData(): EditorData {
        return {
            tiles: this.getEditorTiles(),
            items: this.getEditorItems(),
            errorMessage: this.getErrorMessage(),
        };
    }

    // TODO
    private getErrorMessage(): string {
        return 'Sample error message';
    }

    // TODO add to const file
    private getEditorTiles(): EditorTile[] {
        const tiles = [TileType.Path, TileType.Bush, TileType.Water, TileType.Bridge];
        return tiles.map(this.getEditorTile.bind(this));
    }

    private getEditorTile(tile: TileType): EditorTile {
        return {
            tile,
            image: this.imageService.getTile(tile),
            isActive: tile === this.selectedTile,
        };
    }

    private updateEditorItem(item: ItemType): void {
        for (let i = 0; i < this.editorData.items.length; i++) {
            if (this.editorData.items[i].item === item) {
                this.editorData.items[i] = this.getEditorItem(item);
                return;
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
            image: this.imageService.getItem(item),
            count: this.getRemainingItemCount(item),
        };
    }

    private getRemainingItemCount(item: ItemType): number {
        let currentItemCount = this.gameDataService.getItemCount(item);
        const maxItemCount = this.getMaxItemCount(item);

        if (this.activeItem === item) {
            currentItemCount++;
        }

        if (maxItemCount === 1 && currentItemCount === 0) {
            return -1;
        }

        return maxItemCount - currentItemCount;
    }

    private getMaxItemCount(item: ItemType): number {
        switch (item) {
            case ItemType.Flag: {
                if (this.gameDataService.getGameMode() === GameMode.CTF) {
                    return 1;
                }
                return 0;
            }
            case ItemType.Random:
            case ItemType.Spawn: {
                const mapSize = this.gameDataService.getMapSize();
                return this.getMaxPlayer(mapSize);
            }
            default: {
                return 1;
            }
        }
    }

    // TODO add to const file
    private getMaxPlayer(mapSize: MapSize): number {
        switch (mapSize) {
            case MapSize.Small:
                return 2;

            case MapSize.Medium:
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                return 4;

            case MapSize.Large:
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                return 6;
        }
    }
}
