enum ChatEvent {
  Message('message'),
  GeneralMessage('generalMessage');

  const ChatEvent(this.value);
  final String value;
}

enum UserEvent {
  Associate('associate');

  const UserEvent(this.value);
  final String value;
}

enum MatchEvent {
  CreateMatch('createMatch'),
  JoinMatch('joinMatch'),
  LeaveMatch('leaveMatch'),
  Update('update'),
  Message('message'),
  Popup('popup'),
  RemovedFromMatch('removedFromMatch'),
  Disconnect('disconnect');

  const MatchEvent(this.value);
  final String value;
}

enum LobbyEvent {
  ChangeAvatar('changeAvatar'),
  JoinLobby('joinLobby'),
  ChangeLockStatus('changeLockStatus'),
  StartMatch('startMatch'),
  AddBot('addBot'),
  KickPlayer('kickPlayer'),
  ChangeMatchSettings('changeMatchSettings');

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

enum JoinPageEvent {
  JoinRoom('joinJoinPageRoom'),
  LeaveRoom('leaveJoinPageRoom'),
  UpdateMatchList('updateMatchList'),
  Room('joinPageRoom');

  const JoinPageEvent(this.value);
  final String value;
}
