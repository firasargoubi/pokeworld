export enum ChallengeType {
    Explorer = 'explorer',
    Invincible = 'invincible',
    Collector = 'collector',
    BridgeWalker = 'bridgeWalker',
    Duelist = 'duelist',
}

export interface PlayerChallengeData {
    type: ChallengeType;
    isCompleted: boolean;
    progress: number;
    target: number;
    cashGain: number;
}
export interface UserChallengeData {
    challenge: string;
    completed: number;
}
