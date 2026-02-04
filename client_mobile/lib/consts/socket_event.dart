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