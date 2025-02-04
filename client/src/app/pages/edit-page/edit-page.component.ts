import { Component } from '@angular/core';
import { BoardComponent } from '@app/components/board/board.component';
import { ConfigPanelComponent } from '@app/components/config-panel/config-panel.component';
import { ToolBoxComponent } from '@app/components/tool-box/tool-box.component';
import { multiItemCount } from '@app/interfaces/item-metadata';
import { ToolBoxSet } from '@app/interfaces/tool-box-element';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { GameData } from '@common/game-data';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapData } from '@common/map-data';
import { MapSize } from '@common/map-size.enum';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';

@Component({
    selector: 'app-edit-page',
    templateUrl: './edit-page.component.html',
    styleUrls: ['./edit-page.component.scss'],
    imports: [BoardComponent, ToolBoxComponent, ConfigPanelComponent],
})
export class EditPageComponent {
    gameData: GameData = this.gameDataService.gameData;
    itemCount: { [key in ItemType]: number } = {} as { [key in ItemType]: number };
    activeToolSet: ToolBoxSet;

    constructor(private gameDataService: GameDataService) {
        this.activeToolSet = { tileType: null, itemType: null };
        this.initializeGameData();
        this.initializeItemCount();
    }

    initializeGameData() {
        const gameId: string | null = sessionStorage.getItem('_id');
        const isExistingGame: boolean = gameId !== null;
        if (isExistingGame) {
            // call to Data Base
        } else {
            this.setNewGameData();
        }
    }

    initializeItemCount() {
        const itemTypeList = Object.keys(this.gameData.mapData.items) as ItemType[];
        for (const itemType of itemTypeList) {
            const isMultiItem = [ItemType.Random, ItemType.Spawn].includes(itemType);
            let maxItemCount = 1;
            if (isMultiItem) {
                const mapSize = this.gameData.mapData.size as MapSize;
                maxItemCount = multiItemCount[mapSize];
            }
            const currentItem = this.gameData.mapData.items[itemType];
            const mapItemCount: number = currentItem ? currentItem.length : 0;
            const currentItemCount = maxItemCount - mapItemCount;
            const NULL_ITEM_COUNT = 0;
            this.itemCount[itemType] = currentItemCount >= 0 ? currentItemCount : NULL_ITEM_COUNT;
        }
    }

    setNewGameData() {
        // get map size and game mode from session storage
        this.addModeSize(MapSize.Large, GameMode.CTF); // temporary
        const temp = sessionStorage.getItem('mapSize') ?? MapSize.Small; // temporary
        const mapSize = +temp as MapSize;
        const gameMode: GameMode = sessionStorage.getItem('gameMode') as GameMode;

        // generate default map data
        const defaultMap: TileType[][] = new Array(mapSize).fill(new Array(mapSize).fill(TileType.Grass));
        const defaultItems = Object.values(ItemType).reduce(
            (acc, itemType: ItemType) => {
                const isItemPresent = gameMode === GameMode.CTF || itemType !== ItemType.Flag;
                if (isItemPresent) {
                    acc[itemType] = [];
                }
                return acc;
            },
            {} as { [key in ItemType]: Position[] },
        );

        const mapData: MapData = {
            tiles: defaultMap,
            items: defaultItems,
            size: mapSize,
            gameMode,
        };

        this.gameData = {
            _id: '',
            name: '',
            description: '',
            lastEdited: new Date(),
            isVisible: false,
            mapData,
            thumbnail: 'default-thumbnail.jpg', // unexistent image for the moment
        };
    }

    /**
     * Temporary function, waiting for its implementation in administration view
     * @param mapSize
     * @param gameMode
     */
    addModeSize(mapSize: MapSize, gameMode: GameMode) {
        sessionStorage.setItem('mapSize', mapSize.toString());
        sessionStorage.setItem('gameMode', gameMode);
    }

    handleItemDrop(event: MouseEvent) {
        const activeItem = this.activeToolSet.itemType;
        const cellPosition = this.getBoardCellPosition(event);
        const isValidDrop = activeItem && cellPosition;
        if (isValidDrop) {
            this.gameDataService.removeItem(cellPosition);
            this.gameDataService.addItem(activeItem, cellPosition);
            this.decrementItemCount(activeItem);
        }
        this.activeToolSet.itemType = null;
    }

    allowDrop(event: MouseEvent) {
        event.preventDefault();
    }

    handleTileDrop(event: MouseEvent) {
        event.preventDefault();
        const cellPosition = this.getBoardCellPosition(event);
        const activeTile = this.activeToolSet.tileType;
        const isValidTileDrop = cellPosition && activeTile;
        if (isValidTileDrop) {
            this.gameDataService.editTile(activeTile, cellPosition);
        }
    }

    removeTile(event: MouseEvent) {
        event.preventDefault();
        const cellPosition = this.getBoardCellPosition(event);
        if (cellPosition) {
            this.gameDataService.editTile(TileType.Grass, cellPosition);
        }
    }

    // Verify if an item can be dropped in a specific cell
    private getBoardCellPosition(event: MouseEvent): Position | null {
        const target = event.target as HTMLElement;
        const boardCell = target.parentElement;
        if (boardCell) {
            const posX = boardCell.getAttribute('x');
            const posY = boardCell.getAttribute('y');
            if (posX && posY) {
                return { x: +posX, y: +posY };
            }
        }
        return null;
    }

    // private incrementItemCount(itemType: ItemType) {
    //     const OFFSET_1 = 1;
    //     this.changeItemCount(OFFSET_1, itemType);
    // }

    private decrementItemCount(itemType: ItemType) {
        const OFFSET_1 = -1;
        this.changeItemCount(OFFSET_1, itemType);
    }

    private changeItemCount(offset: number, itemType: ItemType) {
        this.itemCount[itemType] += offset;
    }
}
