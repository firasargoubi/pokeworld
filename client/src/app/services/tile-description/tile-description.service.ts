import { Injectable, inject } from '@angular/core';
import { AVATAR_DATA } from '@app/consts/avatar-data.const';
import { DEFAULT_TILE_DESCRIPTION } from '@app/consts/default-tile-description.const';
import { TILE_EFFECT } from '@app/consts/tile-effect.const';
import { TileDescriptionInfo } from '@app/interfaces/tile-description';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { MatchDataService } from '@app/services/match-data/match-data.service';
import { Player } from '@common/interfaces/player';
import { Position } from '@common/interfaces/position';
import { TILE_COST } from '@common/interfaces/tile-type.enum';

@Injectable({
    providedIn: 'root',
})
export class TileDescriptionService {
    showTileDescription: boolean = false;
    tileDescription: TileDescriptionInfo = DEFAULT_TILE_DESCRIPTION;
    tileDescriptionPos: Position = { x: 0, y: 0 };
    isPlayerDescription: boolean = false;

    private gameDataService = inject(GameDataService);
    private matchDataService = inject(MatchDataService);

    displayTileDescription(event: MouseEvent): void {
        event.preventDefault();

        const mapContainer = event.currentTarget as HTMLElement;
        const mapRect = mapContainer.getBoundingClientRect();
        const mapSize: number = this.gameDataService.gameData.mapData.size;

        const tileCoords = this.calculateTileCoordinates(event, mapRect, mapSize);

        if (this.isTileInBounds(tileCoords, mapSize)) {
            this.tileDescriptionPos = this.calculateDescriptionPosition(tileCoords, mapRect, mapSize);
            this.isPlayerDescription = this.updateDescription(tileCoords);
            this.showTileDescription = true;
        }
    }
    hideTileDescription(): void {
        this.showTileDescription = false;
    }
    private calculateTileCoordinates(event: MouseEvent, mapRect: DOMRect, mapSize: number): Position {
        const relativeX = event.clientX - mapRect.left;
        const relativeY = event.clientY - mapRect.top;

        const tileWidth = mapRect.width / mapSize;
        const tileHeight = mapRect.height / mapSize;

        return {
            x: Math.floor(relativeY / tileHeight),
            y: Math.floor(relativeX / tileWidth),
        };
    }

    private isTileInBounds(position: Position, mapSize: number): boolean {
        return position.x >= 0 && position.x < mapSize && position.y >= 0 && position.y < mapSize;
    }

    private calculateDescriptionPosition(position: Position, mapRect: DOMRect, mapSize: number): Position {
        const tileWidth = mapRect.width / mapSize;
        const tileHeight = mapRect.height / mapSize;

        const tileTopRightX = mapRect.left + (position.y + 1) * tileWidth;
        const tileTopRightY = mapRect.top + position.x * tileHeight;

        const offset = 5;

        return {
            x: tileTopRightX + offset,
            y: tileTopRightY + offset,
        };
    }

    private updateDescription(position: Position): boolean {
        const playerOnTile = this.findPlayerAtPosition(position);

        if (playerOnTile) {
            this.tileDescription.playerName = playerOnTile.name;
            this.tileDescription.avatar = AVATAR_DATA[playerOnTile.avatar].imageCentered;
            return true;
        } else {
            const tileType = this.gameDataService.getTileFromPosition(position);
            this.tileDescription.cost = TILE_COST[tileType];
            this.tileDescription.effect = TILE_EFFECT[tileType];
            return false;
        }
    }

    private findPlayerAtPosition(position: Position): Player | null {
        const players = this.matchDataService.matchData.players;

        for (const player of players) {
            if (player.currentStats.position.x === position.x && player.currentStats.position.y === position.y) {
                return player;
            }
        }

        return null;
    }
}
