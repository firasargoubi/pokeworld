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
