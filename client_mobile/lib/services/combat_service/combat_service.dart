import 'package:client_mobile/models/socket_event.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/services/socket_service/socket_service.dart';

class CombatService {
  static final CombatService _instance = CombatService._internal();
  factory CombatService() => _instance;

  CombatService._internal() {
    initMatchUpdateListener();
  }

  final SocketService _socketService = SocketService();

  void initMatchUpdateListener() {
    MatchService().matchUpdates.listen((newMatchData) {});
  }

  void attack() {
    _socketService.emit(CombatEvent.Attack.value);
  }

  void escape() {
    _socketService.emit(CombatEvent.Escape.value);
  }
}
