import 'dart:async';

import 'package:client_mobile/pages/join_page.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../consts/match_data_const.dart';
import '../../consts/player_data_const.dart';
import '../../consts/popup_message_const.dart';
import '../../consts/message_enum.dart';
import '../../consts/socket_event.dart';
import '../../models/game_data.dart';
import '../../models/match_data.dart';
import '../../models/message_from_server.dart';
import '../../models/player_data.dart';
import '../../models/popup_message.dart';
import '../../pages/character_page/character_page.dart';
import '../../pages/home_page.dart';
import '../navigation_service.dart';
import '../popup_service.dart';
import '../socket_service.dart';

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
  MatchData? _matchData = buildDefaultMatchData();
  PlayerData? _selfPlayer = defaultPlayerData;
  int? _selfIndex = defaultSelfIndex;
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

    _socketService.socket.on(MatchEvent.message.value, (payload) {
      final message = MessageFromServer(
        message: (payload as Map)['message'] as String,
        hasCloseButton: ((payload)['hasCloseButton'] as bool?) ?? false,
      );

      onMessage(message);
    });

    _socketService.socket.on(MatchEvent.update.value, (payload) {
      final matchData = MatchData.fromJson((payload as Map).cast<String, dynamic>());
      onUpdate(matchData);
    });

    _socketService.socket.on(MatchEvent.disconnect.value, (payload) {
      onDisconnect();
    });

    _socketService.socket.on(MatchEvent.removedFromMatch.value, (payload) {
      final reason = payload as String;
      onRemovedFromMatch(reason);
    });
  }

  void joinMatch(String matchCode) {
    _socketService.emit(MatchEvent.joinMatch.value, matchCode, (payload) {
      onMatchJoin(payload);
    });
  }

  void createMatch(GameData gameData) {
    _socketService.emit(MatchEvent.createMatch.value, gameData, (payload) {
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
      _popupService.showPopup(
        PopupMessage(message: PopupMessageConst.connectionError.message, hasCloseButton: true, isConfirmation: false),
      );
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
        popupColor: warningMessages.contains(message.message) ? PopupColor.orange : PopupColor.blue,
      ),
    );
  }

  void onRemovedFromMatch(String reason) {
    if(isInMatch()){
      _popupService.keepMessages();
      if(reason == Message.lockedFromLobby.message){
        NavigationService.navigatorKey.currentState?.push(MaterialPageRoute(builder: (_) => const JoinPage()));
        _popupService.showPopup(
          PopupMessage(message: reason, hasCloseButton: true, isConfirmation: true, action: () {
            NavigationService.navigatorKey.currentState?.push(MaterialPageRoute(builder: (_) => const HomePage()));
          }),
        );
      } else {
        NavigationService.navigatorKey.currentState?.push(MaterialPageRoute(builder: (_) => const HomePage()));
        _popupService.showPopup(
          PopupMessage(message: reason, hasCloseButton: false, isConfirmation: false),
        );
      }
      resetMatchData();
    }
  }

  void onUpdate(MatchData matchData) {
    _matchData = matchData;
    final id = selfId;
    if (id == null) {
      _selfPlayer = defaultPlayerData;
      _selfIndex = defaultSelfIndex;
    } else {
      final index = matchData.players.indexWhere((p) => p.id == id);
      if (index >= 0) {
        _selfIndex = index;
        _selfPlayer = matchData.players[index];
      } else {
        _selfIndex = defaultSelfIndex;
        _selfPlayer = defaultPlayerData;
      }
    }
    if (kDebugMode) {
      print('MatchData: $matchData');
    }
    _matchUpdateController.add(matchData);
  }

  void leaveMatch() {
    if (isInMatch()) {
      _socketService.emit(MatchEvent.leaveMatch.value);
      resetMatchData();
    }

    NavigationService.navigatorKey.currentState?.pushAndRemoveUntil(MaterialPageRoute(builder: (_) => const HomePage()), (route) => false);
  }

  bool isInMatch() {
    return (_selfIndex ?? defaultSelfIndex) >= 0;
  }

  bool isActivePlayer() {
    return _selfIndex == _matchData?.playData.activePlayerIndex;
  }

  void resetMatchData() {
    _selfIndex = defaultSelfIndex;
    _matchData = buildDefaultMatchData();
    _selfPlayer = defaultPlayerData;
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
