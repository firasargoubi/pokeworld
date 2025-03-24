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
    StartCombat = 'startCombat',
    GetPossibleMoves = 'getPossibleMoves',
    GetHoverMoves = 'getHoverMoves',
    Move = 'move',
    DebugMove = 'debugMove',
    ChangeDebugMode = 'changeDebugMode',
    GetActions = 'getActions',
    Action = 'action',

    MatchEnded = 'matchEnded',
    CombatDataBroadcast = 'combatDataBroadcast',
    CombatResultBroadcast = 'combatResultBroadcast',
    BridgeChanged = 'bridgeChanged',
    DebugModeChanged = 'debugModeChanged',
    TurnStarted = 'turnStarted',
    PreTurnStarted = 'preTurnStarted',
    CombatStarted = 'combatStarted',
    MatchStarted = 'matchStarted',
    PlayerMoved = 'playerMoved',
}

export enum CombatEvent {
    CombatStarted = 'combatStarted',
    CombatTurnStarted = 'combatTurnStarted',
    CombatTurnStopped = 'combatTurnStopped',
    StartTimer = 'startTimer',
    EscapeAttempt = 'escapeAttempt',
    EscapedResult = 'escapedResult',
    AttackAttempt = 'attackAttempt',
    AttackResult = 'attackResult',
    UpdatePlayers = 'updatePlayers',
    EndCombat = 'endCombat',
}
