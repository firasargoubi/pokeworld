export enum CombatEvent {
    EscapeAttempt = 'escapeAttempt',
    AttackAttempt = 'attackAttempt',
    
    CombatTurnStarted = 'combatTurnStarted',
    CombatTurnStopped = 'combatTurnStopped',
    StartTimer = 'startTimer',
    EscapedResult = 'escapedResult',
    AttackResult = 'attackResult',
    UpdatePlayers = 'updatePlayers',
    EndCombat = 'endCombat',
}
