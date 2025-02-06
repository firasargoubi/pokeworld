import { ErrorCode } from '@app/interfaces/error-code.enum';
import { Position } from '@common/position';

export interface ValidationResult {
    name: ValidationStatus;
    description: ValidationStatus;
    terrainCoverage: { isValid: boolean; coveragePercentage: number };
    bridge: { isValid: boolean; errors: BridgeValidationError[] };
    spawnPoint: ValidationStatus;
    tilesAccessibility: { isValid: boolean; nonAccessibleTileCount: number };
    mode: ValidationStatus;
    items: { isValid: boolean; misplacedItems: Position[] };
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
