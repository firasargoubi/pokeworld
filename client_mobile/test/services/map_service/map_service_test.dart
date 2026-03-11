import 'package:client_mobile/models/item_type.dart';
import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/map_visual_data.dart';
import 'package:client_mobile/models/tile_type.dart';
import 'package:client_mobile/services/map_service/map_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/services/socket_service/socket_service.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import 'map_service_test_const.dart';

class _MockSocket extends Mock implements io.Socket {}

void main() {
  setUpAll(() {
    final mockSocket = _MockSocket();
    when(() => mockSocket.on(any(), any())).thenAnswer((_) {});
    when(() => mockSocket.emit(any(), any())).thenAnswer((_) {});
    when(() => mockSocket.id).thenReturn(null);
    SocketService().socket = mockSocket;
    MapService();
  });

  setUp(() {
    MapService().resetOverlayTiles();
    MatchService().onUpdate(buildMatchData());
  });

  group('toVisualData', () {
    test('should return MapVisualData with correct size', () {
      final result = MapService().toVisualData(buildMatchData());
      expect(result.tiles.length, equals(MapSize.Small.value));
      expect(result.tiles[0].length, equals(MapSize.Small.value));
    });

    test('should populate tile images for all positions', () {
      final result = MapService().toVisualData(buildMatchData());
      for (final row in result.tiles) {
        for (final tile in row) {
          expect(tile.tile, isNotEmpty);
        }
      }
    });
  });

  group('onMatchUpdate', () {
    test('should update visualMapData when match updates via MatchService', () async {
      MatchService().onUpdate(buildMatchData());
      await Future(() {});
      expect(MapService().visualMapData, isNotNull);
    });

    test('should notify listeners on match update', () async {
      var notified = false;
      void listener() => notified = true;
      MapService().addListener(listener);
      MatchService().onUpdate(buildMatchData());
      await Future(() {});
      expect(notified, isTrue);
      MapService().removeListener(listener);
    });
  });

  group('getTileImage', () {
    test('should return grass image for Grass tile', () {
      expect(MapService().getTileImage(buildTiles(), const Position(x: 1, y: 1)), contains('grass'));
    });

    test('should return path image for Path tile', () {
      expect(MapService().getTileImage(buildTiles(fill: TileType.Path), const Position(x: 1, y: 1)), contains('path'));
    });

    test('should return water image for Water tile', () {
      expect(MapService().getTileImage(buildTiles(fill: TileType.Water), const Position(x: 1, y: 1)), contains('water'));
    });

    test('should return bridge image for Bridge tile', () {
      final tiles = buildTiles(fill: TileType.Water);
      tiles[1][1] = TileType.Bridge;
      expect(MapService().getTileImage(tiles, const Position(x: 1, y: 1)), contains('bridge'));
    });

    test('should return grass fallback image for None tile', () {
      expect(MapService().getTileImage(buildTiles(fill: TileType.None), const Position(x: 1, y: 1)), contains('grass'));
    });
  });

  group('getUnderlayImage', () {
    test('should return underlay for Water tile', () {
      expect(MapService().getUnderlayImage(buildTiles(fill: TileType.Water), const Position(x: 1, y: 1)), contains('underlay'));
    });

    test('should return underlay for BrokenBridge tile', () {
      final tiles = buildTiles();
      tiles[1][1] = TileType.BrokenBridge;
      expect(MapService().getUnderlayImage(tiles, const Position(x: 1, y: 1)), contains('underlay'));
    });

    test('should return underlay for Bridge tile', () {
      final tiles = buildTiles(fill: TileType.Water);
      tiles[1][1] = TileType.Bridge;
      expect(MapService().getUnderlayImage(tiles, const Position(x: 1, y: 1)), contains('underlay'));
    });

    test('should return null for Grass tile', () {
      expect(MapService().getUnderlayImage(buildTiles(), const Position(x: 1, y: 1)), isNull);
    });
  });

  group('getItem', () {
    test('should return ItemType when item is at position', () {
      final items = {ItemType.Item1: [const Position(x: 2, y: 3)]};
      expect(MapService().getItem(items, const Position(x: 2, y: 3)), equals(ItemType.Item1));
    });

    test('should return null when no item at position', () {
      final items = {ItemType.Item1: [const Position(x: 2, y: 3)]};
      expect(MapService().getItem(items, const Position(x: 0, y: 0)), isNull);
    });

    test('should return null when items map is empty', () {
      expect(MapService().getItem({}, const Position(x: 0, y: 0)), isNull);
    });
  });

  group('getPlayerAvatar', () {
    test('should return PlayerTileVisual when player is at position', () {
      MapService().toVisualData(buildMatchData(players: [buildPlayer(position: const Position(x: 1, y: 1))]));
      final result = MapService().getPlayerAvatar(const Position(x: 1, y: 1));
      expect(result, isNotNull);
      expect(result!.id, equals('p1'));
    });

    test('should return null when no player at position', () {
      MapService().toVisualData(buildMatchData(players: [buildPlayer(position: const Position(x: 2, y: 2))]));
      expect(MapService().getPlayerAvatar(const Position(x: 0, y: 0)), isNull);
    });

    test('should return null when no players', () {
      MapService().toVisualData(buildMatchData());
      expect(MapService().getPlayerAvatar(const Position(x: 0, y: 0)), isNull);
    });
  });

  group('getOverlay', () {
    test('should return Action overlay when position is in actions', () {
      MapService().setActions([const Position(x: 1, y: 1)]);
      expect(MapService().getOverlay(const Position(x: 1, y: 1)), equals(OverlayType.Action));
    });

    test('should return HoverMove overlay when position is in hoverMoves', () {
      MapService().setHoverMoves([const Position(x: 1, y: 1)]);
      expect(MapService().getOverlay(const Position(x: 1, y: 1)), equals(OverlayType.HoverMove));
    });

    test('should return PossibleMove overlay when position is in possibleMoves', () {
      MapService().setPossibleMoves([const Position(x: 1, y: 1)]);
      expect(MapService().getOverlay(const Position(x: 1, y: 1)), equals(OverlayType.PossibleMove));
    });

    test('should return null when position has no overlay', () {
      expect(MapService().getOverlay(const Position(x: 5, y: 5)), isNull);
    });

    test('should prioritize Action over HoverMove and PossibleMove', () {
      MapService().setActions([const Position(x: 1, y: 1)]);
      MapService().setHoverMoves([const Position(x: 1, y: 1)]);
      MapService().setPossibleMoves([const Position(x: 1, y: 1)]);
      expect(MapService().getOverlay(const Position(x: 1, y: 1)), equals(OverlayType.Action));
    });
  });

  group('setPlayers', () {
    test('should update player positions when setPlayers is called', () {
      MapService().toVisualData(buildMatchData());
      MapService().setPlayers([buildPlayer(position: const Position(x: 3, y: 3))]);
      expect(MapService().getPlayerAvatar(const Position(x: 3, y: 3)), isNotNull);
    });
  });

  group('movePlayer', () {
    test('should complete without error for a valid path', () async {
      final player = buildPlayer(position: const Position(x: 0, y: 0));
      MapService().toVisualData(buildMatchData(players: [player]));
      MatchService().onUpdate(buildMatchData(players: [player]));
      await expectLater(
        MapService().movePlayer(0, [const Position(x: 0, y: 1), const Position(x: 0, y: 2)], stepDelay: Duration.zero),
        completes,
      );
    });

    test('should complete without error for empty path', () async {
      final player = buildPlayer();
      MapService().toVisualData(buildMatchData(players: [player]));
      MatchService().onUpdate(buildMatchData(players: [player]));
      await expectLater(MapService().movePlayer(0, [], stepDelay: Duration.zero), completes);
    });

    test('should complete without error for out-of-bounds player index', () async {
      await expectLater(MapService().movePlayer(99, [const Position(x: 0, y: 0)], stepDelay: Duration.zero), completes);
    });
  });

  group('resetOverlayTiles', () {
    test('should clear all overlay lists', () {
      MapService().setActions([const Position(x: 0, y: 0)]);
      MapService().setPossibleMoves([const Position(x: 1, y: 1)]);
      MapService().resetOverlayTiles();
      expect(MapService().overlayTiles.actions, isEmpty);
      expect(MapService().overlayTiles.possibleMoves, isEmpty);
      expect(MapService().overlayTiles.hoverMoves, isEmpty);
    });
  });
}