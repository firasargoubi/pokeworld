import 'dart:async';

import 'package:client_mobile/models/chat_message.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/services/user_service/user_service.dart';

import '../../models/socket_event.dart';
import '../socket_service/socket_service.dart';

class ChatService {
  static final ChatService _instance = ChatService._internal();
  factory ChatService() => _instance;
  ChatService._internal() {
    _socketService = SocketService();
  }

  late final SocketService _socketService;
  bool _listenersInitialized = false;

  final _generalMessagesController = StreamController<List<ChatMessage>>.broadcast();
  Stream<List<ChatMessage>> get generalMessagesStream => _generalMessagesController.stream;

  final _matchMessagesController = StreamController<List<ChatMessage>>.broadcast();
  Stream<List<ChatMessage>> get matchMessagesStream => _matchMessagesController.stream;

  final _matchLogsController = StreamController<List<ChatLog>>.broadcast();
  Stream<List<ChatLog>> get matchLogsStream => _matchLogsController.stream;

  final List<ChatMessage> _generalMessages = [];
  List<ChatMessage> get allMessages => List.unmodifiable(_generalMessages);

  final List<ChatMessage> _matchMessages = [];
  List<ChatMessage> get matchMessages => List.unmodifiable(_matchMessages);

  final List<ChatLog> _matchLogs = [];
  List<ChatLog> get matchLogs => List.unmodifiable(_matchLogs);

  void initListeners() {
    if (_listenersInitialized) return;
    _listenersInitialized = true;

    _socketService.socket.on(ChatEvent.GeneralMessage.value, (data) {
      if (data is Map<String, dynamic>) {
        final chatMsg = ChatMessage.fromJson(Map<String, dynamic>.from(data));
        _generalMessages.add(chatMsg);
        _generalMessagesController.add(List.unmodifiable(_generalMessages));
      }
    });

    MatchService().matchUpdates.listen((matchData) {
      _matchMessages.clear();
      _matchMessages.addAll(matchData.chatData);
      _matchMessagesController.add(List.unmodifiable(_matchMessages));

      _matchLogs.clear();
      _matchLogs.addAll(matchData.logData);
      _matchLogsController.add(List.unmodifiable(_matchLogs));
    });
  }

  void sendGeneralMessage(String message) {
    final timestamp = DateTime.now();
    final username = UserService().currentUser.value?.username;
    if (username == null) return;
    ChatMessage chatMessage = ChatMessage(
      sender: username,
      content: message,
      timestamp: timestamp,
      profilePicture: UserService().currentUser.value?.profilePicture,
    );
    _socketService.emit(ChatEvent.GeneralMessage.value, chatMessage);
  }

  void sendMatchMessage(String message) {
    _socketService.emit(ChatEvent.Message.value, message);
  }

  void clearChatHistory() {
    _generalMessages.clear();
    _matchMessages.clear();
    _matchLogs.clear();
    _generalMessagesController.add(List.unmodifiable(_generalMessages));
    _matchMessagesController.add(List.unmodifiable(_matchMessages));
    _matchLogsController.add(List.unmodifiable(_matchLogs));
  }

  void dispose() {
    _generalMessagesController.close();
    _matchMessagesController.close();
    _matchLogsController.close();
  }
}
