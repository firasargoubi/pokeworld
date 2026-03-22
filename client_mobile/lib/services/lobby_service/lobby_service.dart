import 'package:client_mobile/models/avatar_data.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/models/player_data.dart';
import 'package:client_mobile/models/socket_event.dart';
import 'package:client_mobile/pages/lobby_page/lobby_page.dart';
import 'package:client_mobile/pages/play_page/play_page.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/services/navigation_service/navigation_service.dart';
import 'package:client_mobile/services/play_service/play_service.dart';
import 'package:client_mobile/services/socket_service/socket_service.dart';
import 'package:flutter/material.dart';

class LobbyService {
  static final LobbyService _instance = LobbyService._internal();
  factory LobbyService() => _instance;

  LobbyService._internal() {
    initMatchUpdateListener();
  }

  final SocketService _socketService = SocketService();

  MatchData? _previousMatchData;

  void initMatchUpdateListener() {
    MatchService().matchUpdates.listen((newMatchData) {
      final oldMatchData = _previousMatchData;

      if (oldMatchData != null) {
        onMatchUpdate(oldMatchData, newMatchData);
      }
      _previousMatchData = newMatchData;
    });
  }

  void kickPlayer(String playerId) {
    _socketService.emit(LobbyEvent.KickPlayer.value, playerId);
  }

  void changeAvatar(Avatar avatar) {
    _socketService.emit(LobbyEvent.ChangeAvatar.value, avatar.value);
  }

  void joinLobby(PlayerData playerData) {
    
    _socketService.emit(LobbyEvent.JoinLobby.value, playerData.toJson());
  }

  void changeLockStatus(bool lockStatus) {
    _socketService.emit(LobbyEvent.ChangeLockStatus.value, lockStatus);
  }

  void changeMatchSettings(MatchSettings matchSettings) {
    _socketService.emit(LobbyEvent.ChangeMatchSettings.value, matchSettings);
  }

  void startMatch() {
    _socketService.emit(LobbyEvent.StartMatch.value);
  }

  void addBot(PlayerType botType) {
    _socketService.emit(LobbyEvent.AddBot.value, botType.value);
  }

  Future<void> onMatchUpdate(MatchData oldMatchData, MatchData newMatchData) async {
    final selfId = MatchService().selfId;

    final oldSelf = oldMatchData.players.where((p) => p.id == selfId).toList(growable: false);
    final newSelf = newMatchData.players.where((p) => p.id == selfId).toList(growable: false);

    final oldIsConnected = oldSelf.isNotEmpty && oldSelf.first.isConnected;
    final newIsConnected = newSelf.isNotEmpty && newSelf.first.isConnected;
    final justConnected = !oldIsConnected && newIsConnected;

    final nav = NavigationService.navigatorKey.currentState;
    if (nav == null) return;

    if (justConnected && newMatchData.state == MatchState.Lobby) {
      final route = MaterialPageRoute(builder: (_) => const LobbyPage());
      nav.pushAndRemoveUntil(route, (r) => false);
      return;
    }
    if (justConnected &&
        (newMatchData.state == MatchState.TurnStart ||
            newMatchData.state == MatchState.TurnWait ||
            newMatchData.state == MatchState.MovementAnimation)) {
      PlayService().onMatchUpdate(oldMatchData, newMatchData);
      final route = MaterialPageRoute(builder: (_) => const PlayPage());
      nav.pushAndRemoveUntil(route, (r) => false);
      return;
    }

    if (oldMatchData.state == MatchState.Lobby && newMatchData.state == MatchState.TurnStart && oldIsConnected && newIsConnected) {
      PlayService().onMatchUpdate(oldMatchData, newMatchData);
      final route = MaterialPageRoute(builder: (_) => const PlayPage());
      nav.pushAndRemoveUntil(route, (r) => false);
    }
  }
}
