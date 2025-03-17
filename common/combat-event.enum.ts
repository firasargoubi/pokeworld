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
