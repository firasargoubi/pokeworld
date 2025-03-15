import { inject, Injectable } from '@angular/core';
import { AVATAR_DATA } from '@app/consts/avatars.const';
import { IMAGE_SUFIX, TILE_IMAGES_PREFIX, UNDERLAY_IMAGES_PREFIX } from '@app/consts/images.const';
import { MapVisualData, TileVisualData } from '@app/interfaces/map-visual-data';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { ItemType } from '@common/item-type.enum';
import { MapData } from '@common/map-data';
import { Player } from '@common/player';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';
import {
    BRIDGE_SIMILAR_TILES,
    BRIDGE_VARIANTS,
    DEFAULT_MAP_VISUAL_DATA,
    DEFAULT_TILE_VISUAL,
    MAX_GRASS_VARIANT,
    MAX_UNDERLAY_VARIANT,
    PATH_SIMILAR_TILES,
    RANDOM_NUMBER_BASE,
    RANDOM_NUMBER_MULTIPLIER,
    SURROUNDING_POSITIONS_DONUT,
    SURROUNDING_POSITIONS_PLUS,
    SURROUNDING_POSITIONS_SQUARE,
    WATER_SIMILAR_TILES,
} from './map.service.const';

@Injectable({
    providedIn: 'root',
})
export class MapService {
    visualMapData: MapVisualData = DEFAULT_MAP_VISUAL_DATA;
    gameDataService: GameDataService = inject(GameDataService);
    private players: Player[] = [];

    constructor() {
        this.updateAllTiles();
        this.gameDataService.mapUpdate.subscribe((x) => this.onMapUpdate(x));
    }

    setPlayers(players: Player[]) {
        this.players = players;
        players.forEach((p) => this.updateTile(p.currentStats.position));
    }

    getTileImage(tiles: TileType[][], position: Position): string {
        const tile = this.gameDataService.getTile(tiles, position);
        const tileVariant = this.getTileVariant(tile, tiles, position);
        const imagePrefix = TILE_IMAGES_PREFIX.get(tile);

        return `${imagePrefix}${tileVariant}${IMAGE_SUFIX}`;
    }

    private getTileVisualData(mapData: MapData, position: Position): TileVisualData {
        return {
            tile: this.getTileImage(mapData.tiles, position),
            underlay: this.getUnderlayImage(mapData.tiles, position),
            item: this.getItem(mapData.items, position),
            player: this.getPlayerAvatar(position),
        };
    }

    private getPlayerAvatar(position: Position): string | null {
        let playerAvatar: string | null = null;

        this.players.forEach((player) => {
            if (player.currentStats.position.x === position.x && player.currentStats.position.y === position.y) {
                playerAvatar = AVATAR_DATA[player.avatar].imageFace;
            }
        });

        return playerAvatar;
    }

    private getTileVariant(tile: TileType, tiles: TileType[][], position: Position): string {
        switch (tile) {
            case TileType.Water:
                return this.getWaterVariant(tiles, position);
            case TileType.Path:
                return this.getPathVariant(tiles, position);
            case TileType.Bridge:
            case TileType.BrokenBridge:
                return this.getBridgeVariant(tiles, position);
            case TileType.Grass:
                return this.getGrassVariant(position);
            default:
                return '0';
        }
    }

    private onMapUpdate(position: Position | null): void {
        if (!position) {
            this.updateAllTiles();
        } else {
            this.updateSuroundingTiles(position);
        }
    }

    private updateSuroundingTiles(position: Position): void {
        SURROUNDING_POSITIONS_SQUARE.forEach((deltaPosition) => {
            this.updateTile({ x: position.x + deltaPosition.x, y: position.y + deltaPosition.y });
        });
    }

    private updateAllTiles(): void {
        const mapSize = this.gameDataService.gameData.mapData.size;

        this.visualMapData = {
            tiles: Array.from({ length: mapSize }, () => Array.from({ length: mapSize }, () => ({ ...DEFAULT_TILE_VISUAL }))),
            size: mapSize,
        };

        for (let x = 0; x < mapSize; x++) {
            for (let y = 0; y < mapSize; y++) {
                this.updateTile({ x, y });
            }
        }
    }

    private updateTile(position: Position): void {
        const mapData = this.gameDataService.gameData.mapData;

        if (this.gameDataService.isOutOfBound(mapData.tiles, position)) {
            return;
        }

        const newData = this.getTileVisualData(mapData, position);
        const oldData = this.visualMapData.tiles[position.x][position.y];

        if (oldData.tile !== newData.tile) {
            this.visualMapData.tiles[position.x][position.y].tile = newData.tile;
        }

        if (oldData.underlay !== newData.underlay) {
            this.visualMapData.tiles[position.x][position.y].underlay = newData.underlay;
        }

        if (oldData.item !== newData.item) {
            this.visualMapData.tiles[position.x][position.y].item = newData.item;
        }

        if (oldData.item !== newData.player) {
            this.visualMapData.tiles[position.x][position.y].player = newData.player;
        }
    }

    private getItem(items: Record<ItemType, Position[]>, position: Position): ItemType | null {
        for (const itemType of Object.values(ItemType)) {
            const itemPositions: Position[] = items[itemType];

            const isItemInTile = itemPositions.some((itemPos) => {
                return itemPos.x === position.x && itemPos.y === position.y;
            });

            if (isItemInTile) {
                return itemType;
            }
        }

        return null;
    }

    private getUnderlayImage(tiles: TileType[][], position: Position): string | null {
        switch (this.gameDataService.getTile(tiles, position)) {
            case TileType.Water:
            case TileType.BrokenBridge:
                return `${UNDERLAY_IMAGES_PREFIX}${this.getUnderlayVariant(position)}${IMAGE_SUFIX}`;
            case TileType.Bridge:
                return `${UNDERLAY_IMAGES_PREFIX}0${IMAGE_SUFIX}`;
            default:
                return null;
        }
    }

    private getWaterVariant(tiles: TileType[][], position: Position): string {
        return this.getSimilarTiles(tiles, position, SURROUNDING_POSITIONS_DONUT, WATER_SIMILAR_TILES);
    }

    private getPathVariant(tiles: TileType[][], position: Position): string {
        return this.getSimilarTiles(tiles, position, SURROUNDING_POSITIONS_DONUT, PATH_SIMILAR_TILES);
    }

    private getBridgeVariant(tiles: TileType[][], position: Position): string {
        const similarTiles = this.getSimilarTiles(tiles, position, SURROUNDING_POSITIONS_PLUS, BRIDGE_SIMILAR_TILES);
        return BRIDGE_VARIANTS.get(similarTiles) || '0';
    }

    private getGrassVariant(position: Position): string {
        return this.getRandomString(position, MAX_GRASS_VARIANT);
    }

    private getUnderlayVariant(position: Position): string {
        return this.getRandomString(position, MAX_UNDERLAY_VARIANT);
    }

    private getRandomString(position: Position, max: number): string {
        const randomNumber = RANDOM_NUMBER_BASE + (position.x + position.y * this.visualMapData.size) * RANDOM_NUMBER_MULTIPLIER;
        return (randomNumber % (max + 1)).toString();
    }

    private getSimilarTiles(tiles: TileType[][], position: Position, deltaPositions: Position[], tileTypes: TileType[]): string {
        const similarTiles = this.compareTiles(tiles, position, deltaPositions, tileTypes);
        return similarTiles.map((b) => (b ? '0' : '1')).join('');
    }

    private compareTiles(tiles: TileType[][], position: Position, deltaPositions: Position[], tileTypes: TileType[]): boolean[] {
        return deltaPositions.map((deltaPos) => {
            const newPosition = { x: position.x + deltaPos.x, y: position.y + deltaPos.y };
            return this.compareTile(tiles, newPosition, tileTypes);
        });
    }

    private compareTile(tiles: TileType[][], position: Position, tileTypes: TileType[]): boolean {
        const tile = this.gameDataService.getTile(tiles, position);
        return tileTypes.includes(tile);
    }
}
