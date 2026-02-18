import '../consts/socket_event.dart';
import '../models/message_from_server.dart';
import 'socket_service.dart';

class MatchService {
  static final MatchService _instance = MatchService._internal();
  factory MatchService() => _instance;
  MatchService._internal() {
    _socketService = SocketService();
    initListeners();
  }

  late final SocketService _socketService;
  bool _listenersInitialized = false;

  void initListeners() {
    if (_listenersInitialized) return;

    try {
      _socketService.socket.on(MatchEvent.message.value, (payload) {
        final _ = MessageFromServer(
          message: (payload as Map)['message'] as String,
          hasCloseButton: ((payload)['hasCloseButton'] as bool?) ?? false,
        );
      });

      _listenersInitialized = true;
    } catch (e) {
      _listenersInitialized = false;
    }
  }

  void joinMatch(String matchCode) {
    _socketService.emit(MatchEvent.joinMatch.value, matchCode);
  }
}
