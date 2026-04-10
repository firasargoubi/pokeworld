import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/models/movement.dart';
import 'package:client_mobile/models/tile_type.dart';
import 'package:client_mobile/services/movement/movement_service_const.dart';

class MovementService {
  List<Position> getPossibleMoves(MatchData matchData) {
    final activePlayer = matchData.players[matchData.playData.activePlayerIndex];
    final currentPos = activePlayer.position;
    final movementRange = matchData.playData.movementLeft;
    return _getPossibleMovesStandard(matchData, currentPos, movementRange);
  }

  ShortestPath getShortestPath(MatchData matchData, Position target) {
    var shortestPath = const ShortestPath(moveCost: double.infinity, path: <Position>[]);
    if (!_isOutOfBounds(matchData, target)) {
      final activePlayer = matchData.players[matchData.playData.activePlayerIndex];
      final startPos = activePlayer.position;
      final result = _calculateDistancesAndPredecessors(matchData, startPos, double.infinity);
      final path = _reconstructPath(target, result.predecessors);
      if (path != null) {
        shortestPath = ShortestPath(moveCost: result.distances[target.x][target.y], path: path);
      }
    }
    return shortestPath;
  }

  List<Position> getActions(MatchData matchData) {
    if (matchData.playData.actionsLeft <= 0) {
      return [];
    }
    final playerPosition = matchData.players[matchData.playData.activePlayerIndex].position;
    return SURROUNDING_POSITIONS_PLUS.map((delta) => Position(x: playerPosition.x + delta.x, y: playerPosition.y + delta.y)).where((position) {
      final hasEnemyPlayer = _hasEnemyPlayer(matchData, position);
      final hasActionableBridge = _hasActionableBridge(matchData, position);
      return hasEnemyPlayer || hasActionableBridge;
    }).toList();
  }

  bool _hasEnemyPlayer(MatchData matchData, Position position) {
    bool hasEnemyPlayer = false;
    final player = matchData.players.cast<dynamic>().where((p) => p.position.x == position.x && p.position.y == position.y).toList();
    if (player.isNotEmpty) {
      final found = player.first;
      if (matchData.gameData.mapData.gameMode == GameMode.CTF) {
        final activePlayer = matchData.players[matchData.playData.activePlayerIndex];
        hasEnemyPlayer = found.team != activePlayer.team;
      } else {
        hasEnemyPlayer = true;
      }
    }
    return hasEnemyPlayer;
  }

  bool _hasItem(MatchData matchData, Position position) {
    final items = matchData.gameData.mapData.items;
    return items.values.any((positions) => positions.any((pos) => pos.x == position.x && pos.y == position.y));
  }

  bool _hasActionableBridge(MatchData matchData, Position position) {
    bool isBridge = false;
    if (!_isOutOfBounds(matchData, position) && !_hasItem(matchData, position)) {
      final tile = matchData.gameData.mapData.tiles[position.x][position.y];
      isBridge = tile == TileType.Bridge || tile == TileType.BrokenBridge;
    }
    return isBridge;
  }

  List<Position> _getPossibleMovesStandard(MatchData matchData, Position currentPos, num movementRange) {
    final tiles = <Position>[];
    if (!_isOutOfBounds(matchData, currentPos)) {
      final result = _calculateDistancesAndPredecessors(matchData, currentPos, movementRange.toDouble());
      final int size = matchData.gameData.mapData.size.value;
      for (int x = 0; x < size; x++) {
        for (int y = 0; y < size; y++) {
          final isDifferentPosition = x != currentPos.x || y != currentPos.y;
          if (result.distances[x][y] <= movementRange && isDifferentPosition) {
            tiles.add(Position(x: x, y: y));
          }
        }
      }
    }
    return tiles;
  }

  void _processNeighbor(NeighborContext context) {
    final neighbor = Position(x: context.pos.x + context.offset.x, y: context.pos.y + context.offset.y);

    if (_isOutOfBounds(context.matchData, neighbor) || _isTileOccupiedByPlayer(context.matchData, neighbor)) {
      return;
    }

    final moveCost = _getMovementCost(context.matchData, neighbor);
    final newCost = context.cost + moveCost;

    if (newCost <= context.maxCost && newCost < context.distances[neighbor.x][neighbor.y]) {
      context.distances[neighbor.x][neighbor.y] = newCost;
      context.predecessors[neighbor] = context.pos;
      context.queue.add(QueueNode(pos: neighbor, cost: newCost));
    }
  }

  DistancesAndPredecessors _calculateDistancesAndPredecessors(MatchData matchData, Position startPos, double maxCost) {
    final int size = matchData.gameData.mapData.size.value;
    final distances = List.generate(size, (_) => List<double>.filled(size, double.infinity));
    final predecessors = <Position, Position>{};
    final queue = <QueueNode>[QueueNode(pos: startPos, cost: 0)];
    distances[startPos.x][startPos.y] = 0;

    while (queue.isNotEmpty) {
      final node = queue.removeAt(0);
      for (final offset in SURROUNDING_POSITIONS_PLUS) {
        _processNeighbor(
          NeighborContext(
            pos: node.pos,
            cost: node.cost,
            offset: offset,
            maxCost: maxCost,
            size: size,
            matchData: matchData,
            distances: distances,
            predecessors: predecessors,
            queue: queue,
          ),
        );
      }
    }

    return DistancesAndPredecessors(distances: distances, predecessors: predecessors);
  }

  List<Position>? _reconstructPath(Position target, Map<Position, Position> predecessors) {
    final stringPredecessor = <String, String>{};

    for (final entry in predecessors.entries) {
      stringPredecessor[_posToKey(entry.key)] = _posToKey(entry.value);
    }

    final path = <Position>[];
    var currentKey = _posToKey(target);

    while (stringPredecessor.containsKey(currentKey)) {
      path.insert(0, _keyToPos(currentKey));
      currentKey = stringPredecessor[currentKey]!;
    }
    path.insert(0, _keyToPos(currentKey));

    return path.length > 1 ? path : null;
  }

  bool _isTileOccupiedByPlayer(MatchData matchData, Position position) {
    return matchData.players.any((p) => p.position.x == position.x && p.position.y == position.y);
  }

  bool _isOutOfBounds(MatchData matchData, Position position) {
    final size = matchData.gameData.mapData.size.value;
    final isXOutOfBounds = position.x < 0 || position.x >= size;
    final isYOutOfBounds = position.y < 0 || position.y >= size;
    return isXOutOfBounds || isYOutOfBounds;
  }

  double _getMovementCost(MatchData matchData, Position position) {
    final tile = matchData.gameData.mapData.tiles[position.x][position.y];
    return TILE_COST[tile] ?? double.infinity;
  }

  String _posToKey(Position p) => '${p.x}-${p.y}';

  Position _keyToPos(String key) {
    final parts = key.split('-');
    final x = int.parse(parts[0]);
    final y = int.parse(parts[1]);
    return Position(x: x, y: y);
  }
}
