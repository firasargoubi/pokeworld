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
        service.gameData.mapData.tiles[1][1] = TileType.Grass;
        const position: Position = { x: 1, y: 1 };
        service.editTile(TileType.Water, position);
        expect(service.gameData.mapData.tiles[1][1]).toBe(service.getTile(position));
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
});
