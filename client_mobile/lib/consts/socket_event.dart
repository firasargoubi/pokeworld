enum ChatEvent {
  generalMessage('generalMessage');

  const ChatEvent(this.value);
  final String value;
}

enum UserEvent {
  associate('associate');

  const UserEvent(this.value);
  final String value;
}

enum MatchEvent {
  createMatch('createMatch'),
  joinMatch('joinMatch'),
  leaveMatch('leaveMatch'),
  update('update'),
  message('message'),
  popup('popup'),
  removedFromMatch('removedFromMatch'),
  disconnect('disconnect');

  const MatchEvent(this.value);
  final String value;
}

enum LobbyEvent {
  changeAvatar('changeAvatar'),
  joinLobby('joinLobby'),
  changeLockStatus('changeLockStatus'),
  startMatch('startMatch'),
  addBot('addBot'),
  kickPlayer('kickPlayer');

  const LobbyEvent(this.value);
  final String value;
}

enum PlayEvent {
  EndTurn('endTurn'),
  Move('move'),
  Action('action'),
  DebugMove('debugMove'),
  ChangeDebugMode('changeDebugMode'),
  DropItem('dropItem');

  const PlayEvent(this.value);
  final String value;
}

enum CombatEvent {
  Attack('attack'),
  Escape('escape');

  const CombatEvent(this.value);
  final String value;
}
