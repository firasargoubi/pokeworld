class MessageFromServer {
  final String message;
  final bool hasCloseButton;
  final Map<String, Object?> messageParams;

  const MessageFromServer({
    required this.message,
    required this.hasCloseButton,
    this.messageParams = const {},
  });
}
