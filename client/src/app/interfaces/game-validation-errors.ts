import { ErrorCode } from '@app/interfaces/error-code.enum';
import { Position } from '@common/position';

export interface ValidationErrors {
    name: {
        isValid: boolean;
        errorCode: ErrorCode | null;
    };
    description: {
        isValid: boolean;
        errorCode: ErrorCode | null;
    };
    terrainCoverage: {
        isValid: boolean;
        coveragePercentage: number;
    };
    bridge: {
        isValid: boolean;
        errors: BridgeError[];
    };
    spawnPoint: {
        isValid: boolean;
        errorCode: ErrorCode | null;
    };
    tilesAccessibility: {
        isValid: boolean;
        nonAccessibleTileCount: number;
    };
    mode: {
        isValid: boolean;
        errorCode: ErrorCode | null;
    };
    items: {
        isValid: boolean;
        misplacedItems: Position[];
    };
}

export interface BridgeError {
    x: number;
    y: number;
    errorCode: ErrorCode;
}
