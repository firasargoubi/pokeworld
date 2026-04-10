import 'package:client_mobile/models/item_type.dart';
import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/player_data.dart';
import 'package:client_mobile/models/tile_type.dart';
import 'package:client_mobile/services/movement/movement_service.dart';
import 'package:flutter_test/flutter_test.dart';

import 'movement_service_test_const.dart';

void main() {
  late MovementService service;

  setUp(() => service = MovementService());

  group('getPossibleMoves', () {
    test('should return reachable tiles within movement range', () {
      final match = buildMatchData(
        mapData: buildMapData(),
        players: [buildPlayer(position: const Position(x: 0, y: 0))],
        movementLeft: 2,
      );
      final moves = service.getPossibleMoves(match);
      expect(moves, isNotEmpty);
      expect(moves.any((p) => p.x == 0 && p.y == 0), isFalse);
    });

    test('should not return tiles beyond movement range', () {
      final match = buildMatchData(
        mapData: buildMapData(),
        players: [buildPlayer(position: const Position(x: 0, y: 0))],
        movementLeft: 1,
      );
      final moves = service.getPossibleMoves(match);
      for (final pos in moves) {
        expect(pos.x.abs() + pos.y.abs(), lessThanOrEqualTo(1));
      }
    });

    test('should not include tiles blocked by Water (infinite cost)', () {
      final tiles = buildTiles(size: 10);
      tiles[1][0] = TileType.Water;
      tiles[0][1] = TileType.Water;
      final match = buildMatchData(
        mapData: buildMapData(tiles: tiles),
        players: [buildPlayer(position: const Position(x: 0, y: 0))],
        movementLeft: 5,
      );
      expect(service.getPossibleMoves(match), isEmpty);
    });

    test('should not include tiles occupied by other players', () {
      final match = buildMatchData(
        mapData: buildMapData(),
        players: [
          buildPlayer(position: const Position(x: 0, y: 0)),
          buildPlayer(position: const Position(x: 1, y: 0)),
        ],
        movementLeft: 3,
      );
      final moves = service.getPossibleMoves(match);
      expect(moves.any((p) => p.x == 1 && p.y == 0), isFalse);
    });
  });

  group('getShortestPath', () {
    test('should return a valid path to a reachable tile', () {
      final match = buildMatchData(
        mapData: buildMapData(),
        players: [buildPlayer(position: const Position(x: 0, y: 0))],
        movementLeft: 5,
      );
      final result = service.getShortestPath(match, const Position(x: 0, y: 2));
      expect(result.path, isNotEmpty);
      expect(result.moveCost, isNot(equals(double.infinity)));
    });

    test('should return infinite cost for out-of-bounds target', () {
      final match = buildMatchData(
        mapData: buildMapData(),
        players: [buildPlayer(position: const Position(x: 0, y: 0))],
      );
      final result = service.getShortestPath(
        match,
        const Position(x: -1, y: -1),
      );
      expect(result.moveCost, equals(double.infinity));
      expect(result.path, isEmpty);
    });

    test('should return infinite cost when target is unreachable (Water)', () {
      final tiles = buildTiles(size: 10);
      tiles[1][0] = TileType.Water;
      tiles[2][1] = TileType.Water;
      tiles[3][0] = TileType.Water;
      final match = buildMatchData(
        mapData: buildMapData(tiles: tiles),
        players: [buildPlayer(position: const Position(x: 0, y: 0))],
      );
      final result = service.getShortestPath(match, const Position(x: 2, y: 0));
      expect(result.moveCost, equals(double.infinity));
    });

    test('should return path starting at start and ending at target', () {
      final match = buildMatchData(
        mapData: buildMapData(),
        players: [buildPlayer(position: const Position(x: 0, y: 0))],
      );
      final result = service.getShortestPath(match, const Position(x: 0, y: 3));
      expect(result.path.first.x, equals(0));
      expect(result.path.first.y, equals(0));
      expect(result.path.last.x, equals(0));
      expect(result.path.last.y, equals(3));
    });
  });

  group('getActions', () {
    test('should return empty list when hasAction is false', () {
      final match = buildMatchData(
        mapData: buildMapData(),
        players: [buildPlayer()],
        actionsLeft: 0,
      );
      expect(service.getActions(match), isEmpty);
    });

    test('should return adjacent position with enemy player in FFA', () {
      final match = buildMatchData(
        mapData: buildMapData(),
        players: [
          buildPlayer(position: const Position(x: 0, y: 0)),
          buildPlayer(position: const Position(x: 1, y: 0)),
        ],
        actionsLeft: 1,
      );
      final actions = service.getActions(match);
      expect(actions.any((p) => p.x == 1 && p.y == 0), isTrue);
    });

    test('should not return ally position in CTF', () {
      final match = buildMatchData(
        mapData: buildMapData(
          tiles: buildTiles(size: 10),
          gameMode: GameMode.CTF,
        ),
        players: [
          buildPlayer(position: const Position(x: 0, y: 0), team: Team.Red),
          buildPlayer(position: const Position(x: 1, y: 0), team: Team.Red),
        ],
        actionsLeft: 1,
      );
      final actions = service.getActions(match);
      expect(actions.any((p) => p.x == 1 && p.y == 0), isFalse);
    });

    test('should return adjacent enemy position in CTF', () {
      final match = buildMatchData(
        mapData: buildMapData(
          tiles: buildTiles(size: 10),
          gameMode: GameMode.CTF,
        ),
        players: [
          buildPlayer(position: const Position(x: 0, y: 0), team: Team.Red),
          buildPlayer(position: const Position(x: 1, y: 0), team: Team.Blue),
        ],
        actionsLeft: 1,
      );
      final actions = service.getActions(match);
      expect(actions.any((p) => p.x == 1 && p.y == 0), isTrue);
    });

    test('should include adjacent Bridge tile as actionable', () {
      final tiles = buildTiles(size: 10);
      tiles[0][1] = TileType.Bridge;
      final match = buildMatchData(
        mapData: buildMapData(tiles: tiles),
        players: [buildPlayer(position: const Position(x: 0, y: 0))],
        actionsLeft: 1,
      );
      final actions = service.getActions(match);
      expect(actions.any((p) => p.x == 0 && p.y == 1), isTrue);
    });

    test('should include adjacent BrokenBridge tile as actionable', () {
      final tiles = buildTiles(size: 10);
      tiles[1][0] = TileType.BrokenBridge;
      final match = buildMatchData(
        mapData: buildMapData(tiles: tiles),
        players: [buildPlayer(position: const Position(x: 0, y: 0))],
        actionsLeft: 1,
      );
      final actions = service.getActions(match);
      expect(actions.any((p) => p.x == 1 && p.y == 0), isTrue);
    });

    test('should not include Bridge with item on it as actionable', () {
      final tiles = buildTiles(size: 10);
      tiles[0][1] = TileType.Bridge;
      final match = buildMatchData(
        mapData: buildMapData(
          tiles: tiles,
          items: {
            ItemType.Item1: [const Position(x: 0, y: 1)],
          },
        ),
        players: [buildPlayer(position: const Position(x: 0, y: 0))],
        actionsLeft: 1,
      );
      final actions = service.getActions(match);
      expect(actions.any((p) => p.x == 0 && p.y == 1), isFalse);
    });
  });
}
