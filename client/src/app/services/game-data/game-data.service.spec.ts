import { TestBed } from '@angular/core/testing';
import { DEFAULT_GAME } from '@app/consts/default-game';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapSize } from '@common/map-size.enum';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';
import { GameDataService } from './game-data.service';

describe('GameDataService', () => {
    let service: GameDataService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = new GameDataService();

        service.gameData.mapData.tiles = Array.from({ length: service.gameData.mapData.size }, () =>
            Array(service.gameData.mapData.size).fill(TileType.Water),
        );

        service.gameData.mapData.items = Object.keys(ItemType).reduce(
            (acc, key) => {
                acc[key as ItemType] = [{ x: 0, y: 0 }];
                return acc;
            },
            {} as Record<ItemType, Position[]>,
        );
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should reset the map correctly', () => {
        service.resetMap();
        expect(service.gameData.mapData.tiles.length).toBe(service.gameData.mapData.size);
        expect(service.gameData.mapData.tiles.every((row) => row.every((tile) => tile === TileType.Grass))).toBeTrue();
    });

    it('should create game data with correct size and mode', () => {
        service.createGameData(MapSize.Large, GameMode.CTF);
        expect(service.gameData.mapData.size).toBe(MapSize.Large);
        expect(service.gameData.mapData.gameMode).toBe(GameMode.CTF);
    });

    it('should get and edit a tile correctly', () => {
        const position: Position = { x: 1, y: 1 };

        service.editTile(TileType.Grass, position);
        expect(service.gameData.mapData.tiles[1][1]).toBe(TileType.Grass);

        const tile = service.getTile(position);
        expect(tile).toBe(TileType.Grass);
    });

    it('should add and remove items correctly', () => {
        const position: Position = { x: 2, y: 2 };
        service.addItem(ItemType.Item1, position);
        expect(service.getItem(position)).toBe(ItemType.Item1);
        service.removeItem(position);
        expect(service.getItem(position)).toBeNull();
    });

    it('should return the correct game properties', () => {
        expect(service.getName()).toBe(DEFAULT_GAME.name);
        expect(service.getDescription()).toBe(DEFAULT_GAME.description);
        expect(service.getMapSize()).toBe(DEFAULT_GAME.mapData.size);
        expect(service.getGameMode()).toBe(DEFAULT_GAME.mapData.gameMode);
    });

    it('should clean the map correctly using cleanMap', () => {
        const mapUpdateSpy = spyOn(service.mapUpdate, 'next');

        service.cleanMap();

        expect(service.gameData.mapData.tiles.length).toBe(service.gameData.mapData.size);
        expect(service.gameData.mapData.tiles.every((row) => row.every((tile) => tile === TileType.Grass))).toBeTrue();

        Object.keys(ItemType).forEach((key) => {
            expect(service.gameData.mapData.items[key as ItemType]).toEqual([]);
        });

        expect(mapUpdateSpy).toHaveBeenCalledWith(null);
    });

    it('should return the correct map size string', () => {
        service.gameData.mapData.size = MapSize.Small;
        expect(service.getMapSizeString()).toBe('10 x 10');
    });

    it('should return the correct game mode string', () => {
        service.gameData.mapData.gameMode = GameMode.CTF;
        expect(service.getGameModeString()).toBe(GameMode.CTF);
    });

    it('should return the correct item count', () => {
        service.gameData.mapData.items[ItemType.Item1] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        expect(service.getItemCount(ItemType.Item1)).toBe(2);

        service.gameData.mapData.items[ItemType.Item1] = [];
        expect(service.getItemCount(ItemType.Item1)).toBe(0);
    });
});
