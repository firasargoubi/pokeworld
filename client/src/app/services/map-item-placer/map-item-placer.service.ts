import { Injectable, inject } from '@angular/core';
import { Structure } from '@app/interfaces/map-structures';
import { EditorService } from '@app/services/editor/editor.service';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { ItemType } from '@common/interfaces/item-type.enum';
import { GameMode, MapSize } from '@common/interfaces/map-data';
import { Position } from '@common/interfaces/position';
import { TileType } from '@common/interfaces/tile-type.enum';
import { MapPositionUtilsService } from '@app/services/map-placement/map-position-utils.service';
import { MAX_ITEM_COUNT } from '@common/consts/item-data.const';
import { MIN_SPAWN_DISTANCE } from './map-item-placer.const';

@Injectable({
    providedIn: 'root',
})
export class MapItemPlacerService {
    private editorService: EditorService = inject(EditorService);
    private gameDataService: GameDataService = inject(GameDataService);
    private positionUtils: MapPositionUtilsService = inject(MapPositionUtilsService);

    placeItems(tiles: TileType[][], size: MapSize, gameMode: GameMode, structures: Structure[] = []): void {
        const gridSize = size as number;
        const placedPositions = new Set<string>();

        this.clearAllItems();
        this.placeItemsInStructures(structures, placedPositions);
        this.placeSpawnItems(tiles, size, structures, placedPositions);
        this.placeRemainingItems(tiles, gridSize, placedPositions, structures);

        this.gameDataService.mapUpdate.next(null);
        this.gameDataService.itemUpdate.next(null);
    }

    private clearAllItems(): void {
        for (const itemType of Object.values(ItemType)) {
            this.gameDataService.gameData.mapData.items[itemType] = [];
        }
        this.editorService.resetLastPicked();
    }

    private placeItemsInStructures(structures: Structure[], placedPositions: Set<string>): void {
        for (const structure of structures) {
            const interiorPos = this.findRandomUnplacedPosition(structure.interior, placedPositions);
            if (interiorPos) {
                const itemTypes = this.getAvailableItemTypes();
                const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
                if (itemType) {
                    this.editorService.placeItem(itemType, interiorPos);
                    placedPositions.add(this.positionUtils.positionToKey(interiorPos));
                }
            }
        }
    }

    private placeSpawnItems(tiles: TileType[][], size: MapSize, structures: Structure[], placedPositions: Set<string>): void {
        const generatedSpawns = this.generateSpawnPositions(tiles, size, structures, placedPositions);
        for (const spawnPos of generatedSpawns) {
            this.editorService.placeItem(ItemType.Spawn, spawnPos);
            placedPositions.add(this.positionUtils.positionToKey(spawnPos));
        }
    }

    private placeRemainingItems(tiles: TileType[][], gridSize: number, placedPositions: Set<string>, structures: Structure[]): void {
        let itemTypes = this.getAvailableItemTypes();
        while (itemTypes.length > 0) {
            const x = Math.floor(Math.random() * gridSize);
            const y = Math.floor(Math.random() * gridSize);
            const key = this.positionUtils.positionToKey({ x, y });
            const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            if (
                !placedPositions.has(key) &&
                this.isValidItemPosition(tiles, x, y, structures) &&
                !this.isPositionInStructureInterior(x, y, structures)
            ) {
                this.editorService.placeItem(itemType, { x, y });
                placedPositions.add(key);
            }
            itemTypes = this.getAvailableItemTypes();
        }
    }

    private generateSpawnPositions(tiles: TileType[][], size: MapSize, structures: Structure[], placedPositions: Set<string>): Position[] {
        const spawnPositions: Position[] = [];
        const gridSize = size as number;
        const numSpawns = this.getNumSpawnsForMapSize(size);

        while (spawnPositions.length < numSpawns) {
            const x = Math.floor(Math.random() * gridSize);
            const y = Math.floor(Math.random() * gridSize);
            const pos: Position = { x, y };

            if (this.isValidSpawnPosition(pos, spawnPositions, tiles, structures, placedPositions)) {
                spawnPositions.push(pos);
            }
        }

        return spawnPositions;
    }

    private getNumSpawnsForMapSize(size: MapSize): number {
        return MAX_ITEM_COUNT[size][ItemType.Spawn];
    }

    private isValidSpawnPosition(
        pos: Position,
        existingSpawns: Position[],
        tiles: TileType[][],
        structures: Structure[],
        placedPositions: Set<string>,
    ): boolean {
        const gridSize = tiles.length;

        if (!this.isWithinSpawnBounds(pos, gridSize)) {
            return false;
        }

        if (!this.isValidItemPosition(tiles, pos.x, pos.y, structures)) {
            return false;
        }

        if (placedPositions.has(this.positionUtils.positionToKey(pos))) {
            return false;
        }

        if (!this.positionUtils.hasMinimumDistance(pos, existingSpawns, MIN_SPAWN_DISTANCE)) {
            return false;
        }

        if (this.isPositionInStructureInterior(pos.x, pos.y, structures)) {
            return false;
        }

        return true;
    }

    private isWithinSpawnBounds(pos: Position, gridSize: number): boolean {
        return pos.x >= 1 && pos.x < gridSize - 1 && pos.y >= 1 && pos.y < gridSize - 1;
    }

    private findRandomUnplacedPosition(positions: Position[], placedPositions: Set<string>): Position | null {
        return this.positionUtils.findRandomUnplacedPosition(positions, placedPositions);
    }

    private isValidItemPosition(tiles: TileType[][], x: number, y: number, structures: Structure[] = []): boolean {
        return this.positionUtils.isValidTerrainTile(tiles, x, y, structures);
    }

    private isPositionInStructureInterior(x: number, y: number, structures: Structure[]): boolean {
        return this.positionUtils.isPositionInStructureInterior(x, y, structures);
    }

    private getAvailableItemTypes(): ItemType[] {
        let itemTypes = Object.values(ItemType);
        itemTypes = itemTypes.filter((itemType) => itemType !== ItemType.Spawn && this.editorService.getRemainingItemCount(itemType, null) > 0);
        if (this.gameDataService.getGameMode() !== GameMode.CTF) {
            itemTypes = itemTypes.filter((itemType) => itemType !== ItemType.Flag);
        }
        return itemTypes;
    }
}
