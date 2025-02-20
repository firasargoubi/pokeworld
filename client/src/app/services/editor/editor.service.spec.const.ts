import { ErrorCode } from '@app/interfaces/error-code.enum';
import { EventProperty } from '@app/interfaces/event-property';
import { ValidationResult } from '@app/interfaces/game-validation-result';

export const MOCK_EVENT_PROPERTY: EventProperty = {
    tilePosition: null,
    mousePosition: null,
    tile: null,
    item: null,
};

export const MOCK_VALIDATION_RESULTS: ValidationResult[] = [
    {
        name: { isValid: true, errorCode: null },
        description: { isValid: true, errorCode: null },
        terrainCoverage: { isValid: true, coveragePercentage: 100 },
        tilesAccessibility: { isValid: true, nonAccessibleTileCount: 0 },
        items: { isValid: true, misplacedItems: [] },
        bridge: { isValid: true, errors: [] },
        spawnPoint: { isValid: true, errorCode: null },
        mode: { isValid: true, errorCode: null },
    },
    {
        name: { isValid: false, errorCode: ErrorCode.TooLong },
        description: { isValid: true, errorCode: null },
        terrainCoverage: { isValid: false, coveragePercentage: 20 },
        tilesAccessibility: { isValid: false, nonAccessibleTileCount: 5 },
        items: { isValid: false, misplacedItems: [{ x: 1, y: 1 }] },
        bridge: { isValid: false, errors: [{ x: 2, y: 2, errorCode: ErrorCode.BridgeAtEdge }] },
        spawnPoint: { isValid: true, errorCode: null },
        mode: { isValid: true, errorCode: null },
    },
];

export const MOCK_MOUSE_EVENT = {
    target: {
        getAttribute: (x: string) => {
            return new Map([
                ['x', '10'],
                ['y', '20'],
                ['tile', 'Path'],
                ['item', 'Item1'],
            ]).get(x);
        },
    },
    clientX: 100,
    clientY: 200,
} as unknown as MouseEvent;

export const MOCK_BAD_MOUSE_EVENT = {
    target: {
        getAttribute: () => {
            return undefined;
        },
    },
} as unknown as MouseEvent;
