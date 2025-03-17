export enum PlayEvent {
    EndTurn = 'endTurn',
    StartCombat = 'startCombat',
    GetPossibleMoves = 'getPossibleMoves',
    GetHoverMoves = 'getHoverMoves',
    Move = 'move',
    ChangeDebugMode = 'changeDebugMode',
    GetActions = 'getActions',
    Action = 'action',

    CombatBroadcast = 'combatBroadcast',
    BridgeChanged = 'bridgeChanged',
    DebugModeChanged = 'debugModeChanged',
    TurnStarted = 'turnStarted',
    PreTurnStarted = 'preTurnStarted',
    CombatStarted = 'combatStarted',
    MatchStarted = 'matchStarted',
    PlayerMoved = 'playerMoved',
}
