export interface TurnData {
    lastPhaseStartTime: Date;
    phaseTimeout: NodeJS.Timeout | null;
}
