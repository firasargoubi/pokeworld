export enum LobbyEvent {
    DebugMessage = 'debugMessage',

    CreateMatch = 'createMatch',
    JoinMatch = 'joinMatch',
    LeaveMatch = 'leaveMatch',
    UpdatePlayer = 'updatePlayer',
    KickPlayer = 'kickPlayer',
    ToggleLockRoom = 'toggleLockRoom',
    StartMatch = 'startMatch',

    UpdatePlayerList = 'UpdatePlayerList',
    RoomLockChanged = 'roomLockChanged',
    MatchStarted = 'matchStarted',
}
