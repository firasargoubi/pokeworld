import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../consts/match_data_const.dart';
import '../consts/player_data_const.dart';
import '../consts/socket_event.dart';
import '../models/game_data.dart';
import '../models/match_data.dart';
import '../models/message_from_server.dart';
import '../models/player_data.dart';
import '../pages/character_page/character_page.dart';
import '../pages/home_page.dart';
import 'navigation_service.dart';
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
  MatchData? _matchData = buildDefaultMatchData();
  PlayerData? _selfPlayer = defaultPlayerData;
  int? _selfIndex = defaultSelfIndex;
  final StreamController<MatchData> _matchUpdateController = StreamController<MatchData>.broadcast();

  MatchData? get matchData => _matchData;
  Stream<MatchData> get matchUpdates => _matchUpdateController.stream;
  String? get selfId => _socketService.socket.id;
  PlayerData? get selfPlayer => _selfPlayer;
  int? get selfIndex => _selfIndex;

  void initListeners() {
    if (_listenersInitialized) return;
    _listenersInitialized = true;

    _socketService.socket.on(MatchEvent.message.value, (payload) {
      final message = MessageFromServer(
        message: (payload as Map)['message'] as String,
        hasCloseButton: ((payload)['hasCloseButton'] as bool?) ?? false,
      );
      if (kDebugMode) {
        print('Match message: ${message.message}');
        print('Has close button: ${message.hasCloseButton}');
      }
    });

    _socketService.socket.on(MatchEvent.update.value, (payload) {
      if (kDebugMode) {
        print('Received update event from server');
      }
      final matchData = MatchData.fromJson((payload as Map).cast<String, dynamic>());
      onUpdate(matchData);
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

    // Navigate to character page after successful join/create
    NavigationService.navigatorKey.currentState?.push(MaterialPageRoute(builder: (_) => const CharacterPage()));
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
      _socketService.emit(MatchEvent.leaveMatch.value, null);
      resetMatchData();
    }

    NavigationService.navigatorKey.currentState?.pushAndRemoveUntil(MaterialPageRoute(builder: (_) => const HomePage()), (route) => false);
  }

  bool isInMatch() {
    return (_selfIndex ?? defaultSelfIndex) >= 0;
  }

  void resetMatchData() {
    _selfIndex = defaultSelfIndex;
    _matchData = buildDefaultMatchData();
    _selfPlayer = defaultPlayerData;
    _matchUpdateController.add(_matchData!);
  }
}
