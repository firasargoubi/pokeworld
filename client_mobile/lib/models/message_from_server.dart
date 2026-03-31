class MessageFromServer {
  final String message;
  final bool hasCloseButton;
  final Map<String, dynamic> messageParams;

  const MessageFromServer({required this.message, required this.hasCloseButton, this.messageParams = const {}});

  factory MessageFromServer.fromJson(Map<String, dynamic> json) {
    return MessageFromServer(
      message: json['message'] as String,
      hasCloseButton: json['hasCloseButton'] as bool? ?? false,
      messageParams: (json['messageParams'] as Map?)?.cast<String, dynamic>() ?? const {},
    );
  }
}
