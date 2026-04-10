import 'dart:async';

import 'package:client_mobile/models/item_type.dart';
import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/models/socket_event.dart';
import 'package:client_mobile/pages/combat_page/combat_page.dart';
import 'package:client_mobile/pages/play_page/play_page.dart';
import 'package:client_mobile/pages/stat_page/stat_page.dart';
import 'package:client_mobile/services/map_service/map_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/services/motion_detection_service/motion_detection_service.dart';
import 'package:client_mobile/services/movement/movement_service.dart';
import 'package:client_mobile/services/navigation_service/navigation_service.dart';
import 'package:client_mobile/services/socket_service/socket_service.dart';
import 'package:flutter/material.dart';

class PlayService {
  static final PlayService _instance = PlayService._internal();
  factory PlayService() => _instance;

  PlayService._internal() {
    initMatchUpdateListener();
  }

  final SocketService _socketService = SocketService();

  MatchData? _previousMatchData;
  StreamSubscription<ShakeEvent>? _motionSubscription;
  int _motionListenerCount = 0;

  bool isPerformingAction = false;
  Position? _lastMovementPathPosition;

  void initMatchUpdateListener() {
    MatchService().matchUpdates.listen((newMatchData) {
      final oldMatchData = _previousMatchData;

      if (oldMatchData != null) {
        onMatchUpdate(oldMatchData, newMatchData);
      }
      _previousMatchData = newMatchData;
    });
  }

  bool canAct() {
    return MatchService().isActivePlayer() && MatchService().isState(MatchState.TurnWait) && MatchService().matchData!.playData.actionsLeft > 0;
  }

  bool canEndTurn() {
    return MatchService().isActivePlayer() && MatchService().isState(MatchState.TurnWait);
  }

  bool hasItem(String id, ItemType item) {
    final player = MatchService().playerById(id);
    if (player == null) return false;
    return player.items.contains(item);
  }

  ItemType? getItem(String id, int index) {
    final player = MatchService().playerById(id);
    if (player == null || index >= player.items.length) return null;
    return player.items[index];
  }

  void endTurn() {
    _socketService.emit(PlayEvent.EndTurn.value, null);
  }

  void startListeningToMotion() {
    _motionListenerCount++;
    if (_motionListenerCount > 1) return;

    final motionDetectionService = MotionDetectionService();
    motionDetectionService.startListening();
    _motionSubscription = motionDetectionService.onShake.listen((shakeEvent) {
      if (shakeEvent.direction == ShakeDirection.horizontal) {
        changeDebugMode();
      }
    });
  }

  void stopListeningToMotion() {
    if (_motionListenerCount > 0) _motionListenerCount--;
    if (_motionListenerCount > 0) return;

    _motionSubscription?.cancel();
    _motionSubscription = null;
    MotionDetectionService().stopListening();
  }

  void changeDebugMode() {
    if (!MatchService().isHost()) return;

    final isDebugMode = MatchService().matchData?.playData.isDebugMode ?? false;
    _socketService.emit(PlayEvent.ChangeDebugMode.value, !isDebugMode);
  }

  void moveTo(Position targetPosition) {
    _socketService.emit(PlayEvent.Move.value, targetPosition.toJson());
  }

  bool performDebugMove(Position targetPosition) {
    final matchData = MatchService().matchData;
    if (matchData == null) return false;

    final canDebugMove = matchData.playData.isDebugMode && MatchService().isActivePlayer() && MatchService().isState(MatchState.TurnWait);
    if (!canDebugMove) return false;

    _socketService.emit(PlayEvent.DebugMove.value, targetPosition.toJson());
    MapService().setHoverMoves([]);
    _lastMovementPathPosition = null;
    isPerformingAction = false;
    return true;
  }

  bool performAction(Position targetPosition) {
    final possibleActions = MovementService().getActions(MatchService().matchData!);
    final canAct =
        isPerformingAction && MatchService().isActivePlayer() && possibleActions.any((pos) => pos.x == targetPosition.x && pos.y == targetPosition.y);

    if (!canAct) return false;
    _socketService.emit(PlayEvent.Action.value, targetPosition.toJson());
    return true;
  }

  void dropItem(ItemType itemType) {
    _socketService.emit(PlayEvent.DropItem.value, itemType.name);
  }

  void updateOverlays() {
    if (MatchService().isActivePlayer() && (MatchService().isState(MatchState.TurnWait) || MatchService().isState(MatchState.TurnStart))) {
      displayPossibleMoves();
    } else {
      MapService().resetOverlayTiles();
    }
  }

  void displayPossibleMoves() {
    final possibleMoves = MovementService().getPossibleMoves(MatchService().matchData!);
    MapService().setPossibleMoves(possibleMoves);
  }

  void handleClick(Position targetPosition) {
    MapService().setActions([]);
    if (performAction(targetPosition)) return;
    performMovementPath(targetPosition);
  }

  void handleLongPress(Position targetPosition) {
    MapService().setActions([]);
    performDebugMove(targetPosition);
  }

  void displayActions() {
    MapService().resetOverlayTiles();
    if (isPerformingAction) {
      isPerformingAction = false;
      displayPossibleMoves();
      return;
    }
    isPerformingAction = true;
    final possibleActions = MovementService().getActions(MatchService().matchData!);
    if (possibleActions.isEmpty) {
      isPerformingAction = false;
      displayPossibleMoves();
    }
    MapService().setActions(possibleActions);
  }

  void performMovementPath(Position targetPosition) {
    final possibleMoves = MovementService().getPossibleMoves(MatchService().matchData!);

    if (MatchService().isActivePlayer() && possibleMoves.any((pos) => pos.x == targetPosition.x && pos.y == targetPosition.y)) {
      displayPossibleMoves();

      final shortestPath = MovementService().getShortestPath(MatchService().matchData!, targetPosition);
      MapService().setHoverMoves(shortestPath.path);

      if (_lastMovementPathPosition != null && _lastMovementPathPosition!.x == targetPosition.x && _lastMovementPathPosition!.y == targetPosition.y) {
        moveTo(targetPosition);
        _lastMovementPathPosition = null;
        MapService().resetOverlayTiles();
      } else {
        _lastMovementPathPosition = targetPosition;
      }
    } else {
      MapService().setHoverMoves([]);
      _lastMovementPathPosition = null;
    }
  }

  void updateMovement(MatchData oldMatchData, MatchData newMatchData) {
    if (MatchService().isState(MatchState.MovementAnimation)) {
      final int activeIndex = newMatchData.playData.activePlayerIndex;

      final Position oldPos = oldMatchData.players[activeIndex].position;
      final Position newPos = newMatchData.players[activeIndex].position;

      final bool moved = oldPos.x != newPos.x || oldPos.y != newPos.y;

      if (!moved) {
        MapService().setPlayers(newMatchData.players);
        return;
      }
      final shortestPath = MovementService().getShortestPath(oldMatchData, newPos);

      MapService().setPlayers(oldMatchData.players);
      MapService().movePlayer(activeIndex, shortestPath.path).then((_) {
        MapService().setPlayers(newMatchData.players);
      });
    }
  }

  void checkForRedirection(MatchData oldMatchData, MatchData newMatchData) {
    final wasInCombatState =
        oldMatchData.state == MatchState.CombatWait || oldMatchData.state == MatchState.CombatAnimation || oldMatchData.state == MatchState.CombatEnd;

    final isMatchInCombatState =
        newMatchData.state == MatchState.CombatWait || newMatchData.state == MatchState.CombatAnimation || newMatchData.state == MatchState.CombatEnd;

    if (isMatchInCombatState && !wasInCombatState) {
      _navigateAndReplace((_) => const CombatPage());
    } else if (wasInCombatState && (newMatchData.state == MatchState.TurnWait || newMatchData.state == MatchState.TurnStart)) {
      _navigateAndReplace((_) => const PlayPage());
    } else if (newMatchData.state == MatchState.MatchEnd && wasInCombatState) {
      _navigateAndReplace((_) => const PlayPage());
    } else if (newMatchData.state == MatchState.Statistics && oldMatchData.state != MatchState.Statistics) {
      _navigateAndReplace((_) => const StatPage());
    }
  }

  void _navigateAndReplace(WidgetBuilder builder) {
    final nav = NavigationService.navigatorKey.currentState;
    if (nav == null) return;
    final route = MaterialPageRoute(builder: builder);
    nav.pushAndRemoveUntil(route, (r) => false);
  }

  Future<void> onMatchUpdate(MatchData oldMatchData, MatchData newMatchData) async {
    _lastMovementPathPosition = null;
    isPerformingAction = false;
    updateOverlays();
    updateMovement(oldMatchData, newMatchData);
    checkForRedirection(oldMatchData, newMatchData);
  }
}
