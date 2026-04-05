import 'dart:async';

import 'package:client_mobile/models/chat_message.dart';
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

  String? get _currentUserName => UserService().currentUser.value?.username;

  final _generalMessagesController = StreamController<List<ChatMessage>>.broadcast();
  Stream<List<ChatMessage>> get generalMessagesStream => _generalMessagesController.stream;

  final _channelMessagesController = StreamController<Map<String, List<ChatMessage>>>.broadcast();
  Stream<Map<String, List<ChatMessage>>> get channelMessagesStream => _channelMessagesController.stream;

  final _channelsController = StreamController<List<Channel>>.broadcast();
  Stream<List<Channel>> get channelsStream => _channelsController.stream;

  final _matchMessagesController = StreamController<List<ChatMessage>>.broadcast();
  Stream<List<ChatMessage>> get matchMessagesStream => _matchMessagesController.stream;

  final List<ChatMessage> _generalMessages = [];
  List<ChatMessage> get allMessages => List.unmodifiable(_generalMessages);

  final Map<String, List<ChatMessage>> _channelMessages = {};
  Map<String, List<ChatMessage>> get channelMessages => Map.unmodifiable(_channelMessages);

  List<Channel> _channels = [];
  List<Channel> get channels => List.unmodifiable(_channels);

  String? _activeMatchCode;
  String? get activeMatchCode => _activeMatchCode;

  ChatChannel _activeTab = ChatChannel.General;
  ChatChannel get activeTab => _activeTab;

  List<ChatMessage> get activeMatchMessages {
    if (_activeMatchCode == null) return [];
    return List.unmodifiable(_channelMessages[_activeMatchCode] ?? []);
  }

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

    _socketService.socket.on(ChatEvent.ChannelUpdate.value, (data) {
      if (data is List) {
        _channels = data.map((e) => Channel.fromJson(Map<String, dynamic>.from(e as Map))).toList();
        _channelsController.add(List.unmodifiable(_channels));
      }
    });

    _socketService.socket.on(ChatEvent.ChannelMessage.value, (data) {
      if (data is Map) {
        final channelMsg = ChannelMessage.fromJson(Map<String, dynamic>.from(data));
        _channelMessages.putIfAbsent(channelMsg.channelName, () => []);
        _channelMessages[channelMsg.channelName]!.add(channelMsg.message);
        _channelMessagesController.add(Map.unmodifiable(_channelMessages));

        if (channelMsg.channelName == _activeMatchCode) {
          _matchMessagesController.add(activeMatchMessages);
        }
      }
    });
  }

  void setActiveMatchCode(String? matchCode) {
    _activeMatchCode = matchCode;
    _matchMessagesController.add(activeMatchMessages);
  }

  void switchTab(ChatChannel tab) {
    _activeTab = tab;
  }

  void createChannel(String channelName, {bool isDedicatedChannel = false}) {
    final userName = _currentUserName;
    if (userName == null) return;
    final channelUser = ChannelUser(userName: userName, channelName: channelName, isDedicatedChannel: isDedicatedChannel);
    _socketService.emit(ChatEvent.CreateChannel.value, channelUser.toJson());
  }

  void joinChannel(String channelName) {
    if (_currentUserName == null) return;
    _socketService.emit(ChatEvent.JoinChannel.value, {'channelName': channelName, 'userName': _currentUserName});
  }

  void leaveChannel(String channelName) {
    if (_currentUserName == null) return;
    _channelMessages.remove(channelName);
    _channelMessagesController.add(Map.unmodifiable(_channelMessages));
    _socketService.emit(ChatEvent.LeaveChannel.value, {'channelName': channelName, 'userName': _currentUserName});
  }

  void deleteChannel(String channelName) {
    if (_currentUserName == null) return;
    _socketService.emit(ChatEvent.DeleteChannel.value, {'channelName': channelName, 'userName': _currentUserName});
  }

  bool isInChannel(String channelName) {
    final username = _currentUserName;
    if (username == null) return false;
    final channel = _channels.where((c) => c.name == channelName).firstOrNull;
    return channel != null && channel.membersUsernames.contains(username);
  }

  void sendGeneralMessage(String message) {
    final username = _currentUserName;
    if (username == null) return;
    ChatMessage chatMessage = ChatMessage(
      sender: username,
      content: message,
      timestamp: DateTime.now(),
      profilePicture: UserService().currentUser.value?.profilePicture,
    );
    _socketService.emit(ChatEvent.GeneralMessage.value, chatMessage.toJson());
  }

  void sendChannelMessage(String channelName, String message) {
    if (_currentUserName == null) return;
    ChatMessage chatMessage = ChatMessage(
      sender: _currentUserName,
      content: message,
      timestamp: DateTime.now(),
      profilePicture: UserService().currentUser.value?.profilePicture,
    );
    _socketService.emit(ChatEvent.ChannelMessage.value, {'channelName': channelName, 'message': chatMessage.toJson()});
  }

  void sendMatchMessage(String message) {
    if (_activeMatchCode == null || _activeMatchCode!.isEmpty) return;
    sendChannelMessage(_activeMatchCode!, message);
  }

  void clearChatHistory() {
    _generalMessages.clear();
    _channelMessages.clear();
    _generalMessagesController.add(List.unmodifiable(_generalMessages));
    _channelMessagesController.add(Map.unmodifiable(_channelMessages));
    _matchMessagesController.add([]);
  }

  void dispose() {
    _generalMessagesController.close();
    _channelMessagesController.close();
    _channelsController.close();
    _matchMessagesController.close();
  }
}
