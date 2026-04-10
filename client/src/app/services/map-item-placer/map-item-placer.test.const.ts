import { Structure } from '@app/interfaces/map-structures';
import { ItemType } from '@common/interfaces/item-type.enum';
import { GameMode, MapSize } from '@common/interfaces/map-data';
import { Position } from '@common/interfaces/position';
import { TileType } from '@common/interfaces/tile-type.enum';

const GRID_SIZE = 10;
const MIDDLE_COORD = 5;
const COORD_ZERO = 0;
const COORD_ONE = 1;
const COORD_BOUNDARY = 9;

const SMALL_MAP_SPAWNS = 2;
const MEDIUM_MAP_SPAWNS = 4;
const LARGE_MAP_SPAWNS = 6;

const CTF_ITEM_COUNT = 8;
const ITEM_AVAILABLE = 1;
const NO_ITEMS_AVAILABLE = 0;
const MIN_SPAWN_COUNT = 1;

const SPAWN_BOUNDS_MIN = 1;
const SPAWN_BOUNDS_MAX_SMALL = 9;
const SPAWN_BOUNDS_MAX_MEDIUM = 14;
const SPAWN_BOUNDS_MAX_LARGE = 19;

const VALID_POSITION: Position = { x: 5, y: 5 };
const CORNER_POSITION: Position = { x: 0, y: 0 };
const TOP_LEFT_POSITION: Position = { x: 1, y: 1 };
const BOTTOM_RIGHT_POSITION: Position = { x: 9, y: 9 };
const EDGE_POSITION: Position = { x: 0, y: 5 };
const WATER_POSITION: Position = { x: 3, y: 3 };
const GRASS_POSITION: Position = { x: 4, y: 4 };

const TEST_STRUCTURE_SINGLE_INTERIOR: Structure = {
    interior: [{ x: 5, y: 5 }],
    border: [
        { x: 4, y: 4 },
        { x: 4, y: 5 },
        { x: 4, y: 6 },
        { x: 5, y: 4 },
        { x: 5, y: 6 },
        { x: 6, y: 4 },
        { x: 6, y: 5 },
        { x: 6, y: 6 },
    ],
};

const TEST_STRUCTURE_MULTI_INTERIOR: Structure = {
    interior: [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
    ],
    border: [
        { x: 4, y: 4 },
        { x: 4, y: 5 },
        { x: 4, y: 6 },
        { x: 4, y: 7 },
        { x: 5, y: 4 },
        { x: 5, y: 7 },
        { x: 6, y: 4 },
        { x: 6, y: 5 },
        { x: 6, y: 6 },
        { x: 6, y: 7 },
    ],
};

const SPAWN_POSITION_1: Position = { x: 2, y: 2 };
const SPAWN_POSITION_2: Position = { x: 2, y: 8 };
const SPAWN_POSITION_3: Position = { x: 8, y: 2 };
const SPAWN_POSITION_4: Position = { x: 8, y: 8 };

const TEST_GAME_MODE_FFA = GameMode.FFA;
const TEST_GAME_MODE_CTF = GameMode.CTF;
const TEST_MAP_SIZE_SMALL = MapSize.Small;
const TEST_MAP_SIZE_MEDIUM = MapSize.Medium;
const TEST_MAP_SIZE_LARGE = MapSize.Large;

const VALID_ITEM_TILES = [TileType.Grass, TileType.Path, TileType.Bush, TileType.Bridge];
const INVALID_ITEM_TILES = [TileType.Water, TileType.BrokenBridge, TileType.None];

const AVAILABLE_ITEM_TYPES_NON_CTF = [ItemType.Item1, ItemType.Item2, ItemType.Item3, ItemType.Item4, ItemType.Item5, ItemType.Item6];
const AVAILABLE_ITEM_TYPES_CTF = [ItemType.Item1, ItemType.Item2, ItemType.Item3, ItemType.Item4, ItemType.Item5, ItemType.Item6, ItemType.Flag];

export {
    AVAILABLE_ITEM_TYPES_CTF,
    AVAILABLE_ITEM_TYPES_NON_CTF,
    BOTTOM_RIGHT_POSITION,
    COORD_BOUNDARY,
    COORD_ONE,
    COORD_ZERO,
    CORNER_POSITION,
    CTF_ITEM_COUNT,
    EDGE_POSITION,
    GRASS_POSITION,
    GRID_SIZE,
    INVALID_ITEM_TILES,
    ITEM_AVAILABLE,
    LARGE_MAP_SPAWNS,
    MEDIUM_MAP_SPAWNS,
    MIDDLE_COORD,
    MIN_SPAWN_COUNT,
    NO_ITEMS_AVAILABLE,
    SMALL_MAP_SPAWNS,
    SPAWN_BOUNDS_MAX_LARGE,
    SPAWN_BOUNDS_MAX_MEDIUM,
    SPAWN_BOUNDS_MAX_SMALL,
    SPAWN_BOUNDS_MIN,
    SPAWN_POSITION_1,
    SPAWN_POSITION_2,
    SPAWN_POSITION_3,
    SPAWN_POSITION_4,
    TEST_GAME_MODE_CTF,
    TEST_GAME_MODE_FFA,
    TEST_MAP_SIZE_LARGE,
    TEST_MAP_SIZE_MEDIUM,
    TEST_MAP_SIZE_SMALL,
    TEST_STRUCTURE_MULTI_INTERIOR,
    TEST_STRUCTURE_SINGLE_INTERIOR,
    TOP_LEFT_POSITION,
    VALID_ITEM_TILES,
    VALID_POSITION,
    WATER_POSITION,
};
