import { ErrorCode } from '@app/interfaces/error-code.enum';
import { Position } from '@common/position';

export interface ValidationResult {
    name: ValidationStatus;
    description: ValidationStatus;
    terrainCoverage: { isValid: boolean; coveragePercentage: number };
    tilesAccessibility: { isValid: boolean; nonAccessibleTileCount: number };
    items: { isValid: boolean; misplacedItems: Position[] };
    bridge: { isValid: boolean; errors: BridgeValidationError[] };
    spawnPoint: ValidationStatus;
    mode: ValidationStatus;
}

export interface BridgeValidationError {
    x: number;
    y: number;
    errorCode: ErrorCode;
}

export interface ValidationStatus {
    isValid: boolean;
    errorCode: ErrorCode | null;
}
