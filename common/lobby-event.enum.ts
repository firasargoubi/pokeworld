export enum LobbyEvent {
    CreateMatch = 'createMatch',
    JoinMatch = 'joinMatch',
    LeaveMatch = 'leaveMatch',
    UpdatePlayer = 'updatePlayer',
    KickPlayer = 'kickPlayer',
    ChangeLockStatus = 'shangeLockStatus',
    StartMatch = 'startMatch',
    EmitGameData = 'emitGameData',

    PlayerLeft = 'playerLeft',
    UpdatePlayerList = 'updatePlayerList',
    LockStatusChanged = 'lockStatusChanged',
    MatchStarted = 'matchStarted',

    Warning = 'warning',
}
