export enum PlayEvent {
    EndTurn = 'endTurn',
    StartCombat = 'startCombat',
    GetPossibleMoves = 'getPossibleMoves',
    GetHoverMoves = 'getHoverMoves',
    Move = 'move',
    ChangeDebugMode = 'changeDebugMode',
    GetActionMoves = 'getActionMoves',

    DebugModeChanged = 'debugModeChanged',
    TurnStarted = 'turnStarted',
    PreTurnStarted = 'preTurnStarted',
    CombatStarted = 'combatStarted',
    MatchStarted = 'matchStarted',
    PlayerMoved = 'playerMoved',
}
