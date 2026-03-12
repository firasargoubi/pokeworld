import 'dart:async';

import 'package:client_mobile/models/server_message.dart';
import 'package:client_mobile/pages/join_page/join_page.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../consts/match_data_const.dart';
import '../../consts/message_enum.dart';
import '../../consts/player_data_const.dart';
import '../../models/game_data.dart';
import '../../models/match_data.dart';
import '../../models/message_from_server.dart';
import '../../models/player_data.dart';
import '../../models/popup_message.dart';
import '../../models/socket_event.dart';
import '../../pages/character_page/character_page.dart';
import '../../pages/home_page/home_page.dart';
import '../navigation_service/navigation_service.dart';
import '../popup_service/popup_service.dart';
import '../socket_service/socket_service.dart';

class MatchService {
  static final MatchService _instance = MatchService._internal();
  factory MatchService() => _instance;
  MatchService._internal() {
    _socketService = SocketService();
    initListeners();
  }

  late final SocketService _socketService;
  final PopupService _popupService = PopupService();
  bool _listenersInitialized = false;
  MatchData? _matchData = GET_DEFAULT_MATCH_DATA();
  PlayerData? _selfPlayer = DEFAULT_PLAYER_DATA;
  int? _selfIndex = DEFAULT_SELF_INDEX;
  final StreamController<MatchData> _matchUpdateController = StreamController<MatchData>.broadcast();

  MatchData? get matchData => _matchData;
  Stream<MatchData> get matchUpdates => _matchUpdateController.stream;

  String? get selfId => _socketService.socket.id;
  PlayerData? get selfPlayer => _selfPlayer;
  int? get selfIndex => _selfIndex;

  String? get hostPlayerId {
    final matchData = _matchData;
    if (matchData == null) return null;

    final hostIndex = matchData.lobbyData.hostPlayerIndex;
    if (hostIndex < 0 || hostIndex >= matchData.players.length) return null;

    return matchData.players[hostIndex].id;
  }

  bool isPlayerHost(String? playerId) {
    if (playerId == null || playerId.isEmpty) return false;
    return hostPlayerId == playerId;
  }

  void initListeners() {
    if (_listenersInitialized) return;
    _listenersInitialized = true;

    _socketService.socket.on(MatchEvent.Message.value, (payload) {
      final message = MessageFromServer(
        message: (payload as Map)['message'] as String,
        hasCloseButton: ((payload)['hasCloseButton'] as bool?) ?? false,
      );

      onMessage(message);
    });

    _socketService.socket.on(MatchEvent.Update.value, (payload) {
      final matchData = MatchData.fromJson((payload as Map).cast<String, dynamic>());
      onUpdate(matchData);
    });

    _socketService.socket.on(MatchEvent.Disconnect.value, (payload) {
      onDisconnect();
    });

    _socketService.socket.on(MatchEvent.RemovedFromMatch.value, (payload) {
      final reason = payload as String;
      onRemovedFromMatch(reason);
    });
  }

  void joinMatch(String matchCode) {
    _socketService.emit(MatchEvent.JoinMatch.value, matchCode, (payload) {
      onMatchJoin(payload);
    });
  }

  void createMatch(GameData gameData) {
    _socketService.emit(MatchEvent.CreateMatch.value, gameData, (payload) {
      onMatchJoin(payload);
    });
  }

  void onMatchJoin(dynamic payload) {
    final matchData = MatchData.fromJson((payload as Map).cast<String, dynamic>());
    onUpdate(matchData);

    NavigationService.navigatorKey.currentState?.push(MaterialPageRoute(builder: (_) => const CharacterPage()));
  }

  void onDisconnect() {
    if (isInMatch()) {
      _popupService.keepMessages();
      _popupService.showPopup(PopupMessage(message: PopupMessages.ConnectionError.message, hasCloseButton: true, isConfirmation: false));
      resetMatchData();
      NavigationService.navigatorKey.currentState?.push(MaterialPageRoute(builder: (_) => const HomePage()));
    }
  }

  void onMessage(MessageFromServer message) {
    _popupService.showPopup(
      PopupMessage(
        message: message.message,
        hasCloseButton: message.hasCloseButton,
        isConfirmation: false,
        popupColor: WARNING_MESSAGES.contains(message.message) ? PopupColor.Orange : PopupColor.Blue,
      ),
    );
  }

  void onRemovedFromMatch(String reason) {
    if (isInMatch()) {
      _popupService.keepMessages();
      if (reason == Message.LockedFromLobby.message) {
        NavigationService.navigatorKey.currentState?.push(MaterialPageRoute(builder: (_) => const JoinPage()));
        PopupMessage(
          message: reason,
          hasCloseButton: true,
          isConfirmation: true,
          action: () {
            NavigationService.navigatorKey.currentState?.push(MaterialPageRoute(builder: (_) => const HomePage()));
          },
        );
      } else {
        NavigationService.navigatorKey.currentState?.push(MaterialPageRoute(builder: (_) => const HomePage()));
        _popupService.showPopup(PopupMessage(message: reason, hasCloseButton: false, isConfirmation: false));
      }
      resetMatchData();
    }
  }

  void onUpdate(MatchData matchData) {
    _matchData = matchData;
    final id = selfId;
    if (id == null) {
      _selfPlayer = DEFAULT_PLAYER_DATA;
      _selfIndex = DEFAULT_SELF_INDEX;
    } else {
      final index = matchData.players.indexWhere((p) => p.id == id);
      if (index >= 0) {
        _selfIndex = index;
        _selfPlayer = matchData.players[index];
      } else {
        _selfIndex = DEFAULT_SELF_INDEX;
        _selfPlayer = DEFAULT_PLAYER_DATA;
      }
    }
    if (kDebugMode) {
      print('MatchData: $matchData');
    }
    _matchUpdateController.add(matchData);
  }

  void leaveMatch() {
    if (isInMatch()) {
      _socketService.emit(MatchEvent.LeaveMatch.value);
      resetMatchData();
    }

    NavigationService.navigatorKey.currentState?.pushAndRemoveUntil(MaterialPageRoute(builder: (_) => const HomePage()), (route) => false);
  }

  bool isInMatch() {
    return (_selfIndex ?? DEFAULT_SELF_INDEX) >= 0;
  }

  bool isActivePlayer() {
    return _selfIndex == _matchData?.playData.activePlayerIndex;
  }

  bool isHost() {
    final selfIndex = _selfIndex;
    final matchData = _matchData;
    if (selfIndex == null || matchData == null) return false;
    return selfIndex == matchData.lobbyData.hostPlayerIndex;
  }

  void resetMatchData() {
    _selfIndex = DEFAULT_SELF_INDEX;
    _matchData = GET_DEFAULT_MATCH_DATA();
    _selfPlayer = DEFAULT_PLAYER_DATA;
    _matchUpdateController.add(_matchData!);
  }

  bool isState(MatchState state) {
    return _matchData?.state == state;
  }

  PlayerData? playerById(String id) {
    final players = _matchData?.players;
    if (players == null) return null;
    for (final p in players) {
      if (p.id == id) return p;
    }
    return null;
  }
}
