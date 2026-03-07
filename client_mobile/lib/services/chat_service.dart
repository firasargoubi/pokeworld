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
  final String profilePicture;

  ChatMessage({required this.sender, required this.content, required this.timestamp, required this.profilePicture});

  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
    sender: (json['sender'] ?? '').toString(),
    content: (json['content'] ?? '').toString(),
    timestamp: DateTime.tryParse((json['timestamp'] ?? '').toString()) ?? DateTime.now(),
    profilePicture: (json['profilePicture'] ?? '').toString(),
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
  StreamSubscription<ShakeEvent>? _motionSubscription;

  final _generalMessagesController = StreamController<List<ChatMessage>>.broadcast();
  Stream<List<ChatMessage>> get generalMessagesStream => _generalMessagesController.stream;

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
  }

  void startListeningToMotion() {
    if (_motionSubscription != null) {
      return;
    }
    _motionDetectionService.startListening();
    _motionSubscription = _motionDetectionService.onShake.listen((shakeEvent) {
      if (shakeEvent.direction == ShakeDirection.horizontal) {
        resendLastMessage();
      } else if (shakeEvent.direction == ShakeDirection.vertical) {
        sendSelectedEmoji();
      }
    });
  }

  void sendGeneralMessage(String message) {
    final timestamp = DateTime.now();
    final currentUser = UserService().currentUser.value;
    final username = currentUser?.username;
    if (username == null) return;
    var chatMessage = {
      'sender': username,
      'content': message,
      'timestamp': timestamp.toIso8601String(),
      'profilePicture': currentUser?.profilePicture ?? '',
    };
    _socketService.emit(ChatEvent.generalMessage.value, chatMessage);

    final newMessage = ChatMessage(sender: username, content: message, timestamp: timestamp, profilePicture: currentUser?.profilePicture ?? '');
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

  void clearChatHistory() {
    _storedMessages.clear();
    _lastSentMessage = null;
    _generalMessagesController.add(List.unmodifiable(_storedMessages));
    _selectedEmojiIndex = 0;
    _selectedEmojiController.add(_selectedEmojiIndex);
  }

  void stopListeningToMotion() {
    _motionSubscription?.cancel();
    _motionSubscription = null;
    _motionDetectionService.stopListening();
  }

  void dispose() {
    stopListeningToMotion();
    _generalMessagesController.close();
    _selectedEmojiController.close();
  }
}
