import 'dart:async';

import '../interfaces/socket_event_enums.dart';
import 'socket_service.dart';

class ChatMessage {
  final String sender;
  final String content;
  final DateTime timestamp;

  ChatMessage({
    required this.sender,
    required this.content,
    required this.timestamp,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
    sender: (json['sender'] ?? '').toString(),
    content: (json['content'] ?? '').toString(),
    timestamp:
        DateTime.tryParse((json['timestamp'] ?? '').toString()) ??
        DateTime.now(),
  );
}

class ChatService {
  static final ChatService _instance = ChatService._internal();
  factory ChatService() => _instance;
  ChatService._internal() {
    _socketService = SocketService();
  }

  late final SocketService _socketService;
  bool _listenersInitialized = false;

  final _generalMessagesController =
      StreamController<List<ChatMessage>>.broadcast();
  Stream<List<ChatMessage>> get generalMessagesStream =>
      _generalMessagesController.stream;

  final List<ChatMessage> _storedMessages = [];
  List<ChatMessage> get allMessages => List.unmodifiable(_storedMessages);

  void initListeners() {
    if (_listenersInitialized) return;
    _listenersInitialized = true;

    _socketService.socket.on(ChatEvent.generalMessage.value, (data) {
      if (data is Map<String, dynamic>) {
        final chatMsg = ChatMessage.fromJson(Map<String, dynamic>.from(data));
        if (chatMsg.sender != _socketService.socket.id) {
          _storedMessages.add(chatMsg);
          _generalMessagesController.add(List.unmodifiable(_storedMessages));
        }
      }
    });
  }

  void sendGeneralMessage(String message) {
    final timestamp = DateTime.now();
    var chatMessage = {
      'sender': _socketService.socket.id,
      'content': message,
      'timestamp': timestamp.toIso8601String(),
    };
    _socketService.socket.emit(ChatEvent.generalMessage.value, chatMessage);

    _storedMessages.add(
      ChatMessage(sender: 'Me', content: message, timestamp: timestamp),
    );
  }

  void dispose() {
    _generalMessagesController.close();
  }
}
