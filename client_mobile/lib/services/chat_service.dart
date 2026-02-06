import 'dart:async';

import '../consts/emoji_options.dart';
import '../consts/socket_event.dart';
import 'motion_detection_service.dart';
import 'socket_service.dart';
import 'user_service.dart';

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
    _motionDetectionService = MotionDetectionService();
  }

  late final SocketService _socketService;
  late final MotionDetectionService _motionDetectionService;
  bool _listenersInitialized = false;

  final _generalMessagesController =
      StreamController<List<ChatMessage>>.broadcast();
  Stream<List<ChatMessage>> get generalMessagesStream =>
      _generalMessagesController.stream;

  final List<ChatMessage> _storedMessages = [];
  List<ChatMessage> get allMessages => List.unmodifiable(_storedMessages);

  ChatMessage? _lastSentMessage;
  ChatMessage? get lastSentMessage => _lastSentMessage;

  final List<String> _emojis = emojiOptions;
  int _selectedEmojiIndex = 0;

  final _selectedEmojiController = StreamController<int>.broadcast();
  Stream<int> get selectedEmojiStream => _selectedEmojiController.stream;

  List<String> get emojis => List.unmodifiable(_emojis);
  int get selectedEmojiIndex => _selectedEmojiIndex;
  String get selectedEmoji => _emojis[_selectedEmojiIndex];

  void initListeners() {
    if (_listenersInitialized) return;
    _listenersInitialized = true;

    _socketService.socket.on(ChatEvent.generalMessage.value, (data) {
      if (data is Map<String, dynamic>) {
        final chatMsg = ChatMessage.fromJson(Map<String, dynamic>.from(data));
        _storedMessages.add(chatMsg);
        _generalMessagesController.add(List.unmodifiable(_storedMessages));
      }
    });

    _motionDetectionService.startListening();
    _motionDetectionService.onShake.listen((shakeEvent) {
      if (shakeEvent.direction == ShakeDirection.horizontal) {
        resendLastMessage();
      } else if (shakeEvent.direction == ShakeDirection.vertical) {
        sendSelectedEmoji();
      }
    });
  }

  void sendGeneralMessage(String message) {
    final timestamp = DateTime.now();
    final username = UserService().currentUser.value?.username ?? 'Unknown';
    var chatMessage = {
      'sender': username,
      'content': message,
      'timestamp': timestamp.toIso8601String(),
    };
    _socketService.emit(ChatEvent.generalMessage.value, chatMessage);

    final newMessage = ChatMessage(
      sender: username,
      content: message,
      timestamp: timestamp,
    );
    _lastSentMessage = newMessage;
  }

  void resendLastMessage() {
    if (_lastSentMessage == null) {
      return;
    }

    sendGeneralMessage(_lastSentMessage!.content);
  }

  void sendSelectedEmoji() {
    sendGeneralMessage(selectedEmoji);
  }

  void selectEmoji(int index) {
    if (index >= 0 && index < _emojis.length) {
      _selectedEmojiIndex = index;
      _selectedEmojiController.add(_selectedEmojiIndex);
    }
  }

  void dispose() {
    _motionDetectionService.stopListening();
    _generalMessagesController.close();
    _selectedEmojiController.close();
  }
}
