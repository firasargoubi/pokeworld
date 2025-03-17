import { ErrorMessage } from '@app/interfaces/error-message.enum';
import { MapData } from '@common/map-data';
import { Position } from '@common/position';
import { TilesCount } from './tiles-count';

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
