import { MapData } from '@common/interfaces/map-data';
import { Position } from '@common/interfaces/position';

export enum ErrorMessage {
    Empty = 'validation.errors.empty',
    TooLong = 'validation.errors.tooLong',
    Bridge = 'validation.errors.bridge',
    BridgeAtEdge = 'validation.errors.bridgeAtEdge',
    BridgeNotBetweenWalls = 'validation.errors.bridgeNotBetweenWalls',
    MissingRequiredItems = 'validation.errors.missingRequiredItems',
    TooManyItems = 'validation.errors.tooManyItems',
    DuplicatedName = 'validation.errors.duplicatedName',
    TerrainCoverage = 'validation.errors.terrainCoverage',
    TilesAccessibility = 'validation.errors.tilesAccessibility',
    Items = 'validation.errors.items',
    Mode = 'validation.errors.mode',
}

export interface TilesCount {
    nbWater: number;
    nbBridge: number;
    nbTerrain: number;
    nbTilesTotal: number;
}

export interface ValidationResult {
    name: ValidationStatus;
    description: ValidationStatus;
    terrainCoverage: TerrainCoverageValidation;
    tilesAccessibility: TilesAccessibilityValidation;
    items: ItemsValidation;
    bridge: BridgeValidation;
    spawnPoint: ValidationStatus;
    mode: ValidationStatus;
}

export interface ValidationStatus {
    isValid: boolean;
    errorMessage: ErrorMessage | null;
}

export interface TerrainCoverageValidation {
    isValid: boolean;
    coveragePercentage: number;
}

export interface TilesAccessibilityValidation {
    isValid: boolean;
    nonAccessibleTileCount: number;
}

export interface ItemsValidation {
    isValid: boolean;
    misplacedItems: Position[];
}

export interface BridgeValidation {
    isValid: boolean;
    errors: BridgeValidationError[];
}

export interface BridgeValidationError {
    x: number;
    y: number;
    errorMessage: ErrorMessage;
}

export interface TileHandler {
    position: Position;
    map: MapData;
    tilesCount: TilesCount;
    bridgeStatus: BridgeValidation;
}
