export enum MatchEvent {
    CreateMatch = 'createMatch',
    JoinMatch = 'joinMatch',
    LeaveMatch = 'leaveMatch',

    Update = 'update',
    Message = 'message',
    RemovedFromMatch = 'removedFromMatch',
}

export enum LobbyEvent {
    KickPlayer = 'kickPlayer',
    ChangeAvatar = 'changeAvatar',
    JoinLobby = 'joinLobby',
    ChangeLockStatus = 'changeLockStatus',
    StartMatch = 'startMatch',
}

export enum PlayEvent {
    EndTurn = 'endTurn',
    Move = 'move',
    Action = 'action',
    DebugMove = 'debugMove',
    ChangeDebugMode = 'changeDebugMode',
}

export enum CombatEvent {
    Attack = 'attack',
    Escape = 'escape',
}
