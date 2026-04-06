enum Message {
  AdminQuit('server.messages.adminQuit'),
  Kick('server.messages.kick'),
  RoomFull('server.messages.roomFull'),
  AlreadyInMatch('server.messages.alreadyInMatch'),
  InvalidMatchCode('server.messages.invalidMatchCode'),
  RoomLocked('server.messages.roomLocked'),
  LockedFromLobby('server.messages.lockedFromLobby'),
  LastPlayerRemaining('server.messages.lastPlayerRemaining'),
  DebugModeOn('server.messages.debugModeOn'),
  DebugModeOff('server.messages.debugModeOff'),
  NotEnoughPlayers('server.messages.notEnoughPlayers'),
  NotLocked('server.messages.notLocked'),
  NotEvenPlayers('server.messages.notEvenPlayers'),
  DeleteGame('server.messages.deletedGame'),
  InvisibleGame('server.messages.invisibleGame'),
  BlockedByPlayer('server.messages.blockedByPlayer'),
  BlockedPlayerInLobby('server.messages.blockedPlayerInLobby');

  const Message(this.message);

  final String message;
}
