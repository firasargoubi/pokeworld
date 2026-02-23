import 'package:client_mobile/consts/socket_event.dart';
import 'package:client_mobile/models/avatar_data.dart';
import 'package:client_mobile/models/player_data.dart';
import 'package:client_mobile/services/socket_service.dart';

class LobbyService {
  static final LobbyService _instance = LobbyService._internal();
  factory LobbyService() => _instance;
  LobbyService._internal();

  final SocketService _socketService = SocketService();

  void changeAvatar(Avatar avatar) {
    _socketService.emit(LobbyEvent.changeAvatar.value, _avatarToServer(avatar));
  }

  void joinLobby(PlayerData playerData) {
    _socketService.emit(LobbyEvent.joinLobby.value, playerData.toJson());
  }

  String _avatarToServer(Avatar avatar) {
    final name = avatar.name;
    if (name == 'defaultAvatar') return 'default';
    return name.replaceAll('Evolved', '-evolved').replaceAll('Shiny', '-shiny');
  }
}
