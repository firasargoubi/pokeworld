import { TurnData } from '@app/interfaces/turn-data';

export const DEFAULT_TURN_DATA: TurnData = {
    lastPhaseStartTime: new Date(),
    phaseTimeout: null,
};
