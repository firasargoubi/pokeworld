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
  message('message'),
  leaveMatch('leaveMatch'),
  update('update');

  const MatchEvent(this.value);
  final String value;
}

enum LobbyEvent {
  changeAvatar('changeAvatar'),
  joinLobby('joinLobby');

  const LobbyEvent(this.value);
  final String value;
}
