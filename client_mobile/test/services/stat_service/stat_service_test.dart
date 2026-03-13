import 'package:client_mobile/models/avatar_data.dart';
import 'package:client_mobile/models/game_data.dart';
import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/models/player_data.dart';
import 'package:client_mobile/models/stat_data.dart';
import 'package:client_mobile/models/tile_type.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/services/socket_service/socket_service.dart';
import 'package:client_mobile/services/stat_service/stat_service.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

class _MockSocket extends Mock implements io.Socket {}

List<List<TileType>> _buildTiles({int size = 5, TileType fill = TileType.Grass}) => List.generate(size, (_) => List.generate(size, (_) => fill));

MapData _buildMapData({List<List<TileType>>? tiles}) =>
    MapData(tiles: tiles ?? _buildTiles(), items: {}, size: MapSize.Small, gameMode: GameMode.FFA);

GameData _buildGameData(MapData mapData) =>
    GameData(id: 'g1', name: 'Game', description: '', lastEdited: DateTime(2024), mapData: mapData, thumbnail: '');

CombatData _emptyCombatData() => CombatData(
  lastCombatAction: CombatAction.None,
  turnDuration: 0,
  isSecondPlayerTurn: false,
  playersCombatData: [],
  lastRolledAttack: 0,
  lastRolledDefense: 0,
);

TrackingPlayerData _buildTrackingPlayer({
  String id = 'p1',
  String name = 'Alice',
  Team? team,
  List<Position> coveredGroundTiles = const [],
  List<dynamic> pickedUpItems = const [],
  int combats = 0,
  int victories = 0,
  int defeats = 0,
  int escapes = 0,
  int hpInflicted = 0,
  int hpLost = 0,
}) => TrackingPlayerData(
  id: id,
  name: name,
  team: team,
  coveredGroundTiles: coveredGroundTiles,
  pickedUpItems: pickedUpItems,
  combats: combats,
  victories: victories,
  defeats: defeats,
  escapes: escapes,
  hpInflicted: hpInflicted,
  hpLost: hpLost,
);

TrackingData _buildTrackingData({
  int startTime = 0,
  int endTime = 0,
  List<Position> coveredBridges = const [],
  List<Position> coveredGroundTiles = const [],
  int rounds = 0,
  int flagHoldersCount = 0,
  dynamic matchWinner,
  List<TrackingPlayerData> players = const [],
}) => TrackingData(
  startTime: startTime,
  endTime: endTime,
  coveredBridges: coveredBridges,
  coveredGroundTiles: coveredGroundTiles,
  rounds: rounds,
  flagHoldersCount: flagHoldersCount,
  matchWinner: matchWinner,
  players: players,
);

MatchData _buildMatchData({MapData? mapData, TrackingData? trackingData}) {
  final md = mapData ?? _buildMapData();
  return MatchData(
    code: 'TEST',
    state: MatchState.Statistics,
    gameData: _buildGameData(md),
    lobbyData: LobbyData(isLocked: false, hostPlayerIndex: 0),
    playData: PlayData(timeLeft: 60, isDebugMode: false, activePlayerIndex: 0, hasAction: false, movementLeft: 0),
    combatData: _emptyCombatData(),
    trackingData: trackingData ?? _buildTrackingData(),
    players: [],
    chatData: [],
    logData: [],
  );
}

void _loadMatch(MatchData matchData) => MatchService().onUpdate(matchData);

void main() {
  late StatService service;

  setUpAll(() {
    final mockSocket = _MockSocket();
    when(() => mockSocket.on(any(), any())).thenAnswer((_) {});
    when(() => mockSocket.emit(any(), any())).thenAnswer((_) {});
    when(() => mockSocket.id).thenReturn(null);
    SocketService().socket = mockSocket;
  });

  setUp(() {
    service = StatService();
  });

  group('initializeData', () {
    test('should do nothing when matchData is null', () {
      _loadMatch(_buildMatchData());
      expect(() => service.initializeData(), returnsNormally);
    });

    test('should populate globalStats, playerStats and winnerData after init', () {
      _loadMatch(_buildMatchData(trackingData: _buildTrackingData(players: [_buildTrackingPlayer()])));
      service.initializeData();

      expect(service.globalStats, isNotNull);
      expect(service.playerStats, isNotNull);
      expect(service.winnerData, isNotNull);
    });
  });

  group('globalStats — gameDuration', () {
    test('should compute duration as endTime minus startTime', () {
      _loadMatch(_buildMatchData(trackingData: _buildTrackingData(startTime: 1000, endTime: 6000)));
      service.initializeData();

      expect(service.globalStats.gameDuration, equals(5000));
    });

    test('should be zero when startTime equals endTime', () {
      _loadMatch(_buildMatchData(trackingData: _buildTrackingData(startTime: 42, endTime: 42)));
      service.initializeData();

      expect(service.globalStats.gameDuration, equals(0));
    });
  });

  group('globalStats — rounds and flagHoldersCount', () {
    test('should reflect rounds from tracking data', () {
      _loadMatch(_buildMatchData(trackingData: _buildTrackingData(rounds: 7)));
      service.initializeData();

      expect(service.globalStats.rounds, equals(7));
    });

    test('should reflect flagHoldersCount from tracking data', () {
      _loadMatch(_buildMatchData(trackingData: _buildTrackingData(flagHoldersCount: 3)));
      service.initializeData();

      expect(service.globalStats.flagHoldersCount, equals(3));
    });
  });

  group('globalStats — visitedTilesRatio', () {
    test('should be 100 when all ground tiles are covered', () {
      final tiles = _buildTiles(size: 5);
      final covered = [
        for (int x = 0; x < 5; x++)
          for (int y = 0; y < 5; y++) Position(x: x, y: y),
      ];
      _loadMatch(
        _buildMatchData(
          mapData: _buildMapData(tiles: tiles),
          trackingData: _buildTrackingData(coveredGroundTiles: covered),
        ),
      );
      service.initializeData();

      expect(service.globalStats.visitedTilesRatio, equals(100.0));
    });

    test('should be 0 when no ground tiles are covered', () {
      _loadMatch(_buildMatchData(trackingData: _buildTrackingData(coveredGroundTiles: [])));
      service.initializeData();

      expect(service.globalStats.visitedTilesRatio, equals(0.0));
    });

    test('should compute partial ratio correctly', () {
      final tiles = [
        [TileType.Grass, TileType.Grass, TileType.Grass, TileType.Grass],
      ];
      _loadMatch(
        _buildMatchData(
          mapData: _buildMapData(tiles: tiles),
          trackingData: _buildTrackingData(coveredGroundTiles: [const Position(x: 0, y: 0)]),
        ),
      );
      service.initializeData();

      expect(service.globalStats.visitedTilesRatio, equals(25.0));
    });
  });

  group('globalStats — toggledBridgesRatio', () {
    test('should be 0 when there are no bridge tiles', () {
      _loadMatch(
        _buildMatchData(
          mapData: _buildMapData(tiles: _buildTiles()),
          trackingData: _buildTrackingData(coveredBridges: []),
        ),
      );
      service.initializeData();

      expect(service.globalStats.toggledBridgesRatio, equals(0.0));
    });

    test('should be 100 when all bridge tiles are toggled', () {
      final tiles = _buildTiles();
      tiles[0][0] = TileType.Bridge;
      tiles[0][1] = TileType.Bridge;
      _loadMatch(
        _buildMatchData(
          mapData: _buildMapData(tiles: tiles),
          trackingData: _buildTrackingData(coveredBridges: [const Position(x: 0, y: 0), const Position(x: 0, y: 1)]),
        ),
      );
      service.initializeData();

      expect(service.globalStats.toggledBridgesRatio, equals(100.0));
    });

    test('should compute partial bridge ratio correctly', () {
      final tiles = _buildTiles();
      tiles[0][0] = TileType.Bridge;
      tiles[0][1] = TileType.Bridge;
      tiles[0][2] = TileType.Bridge;
      tiles[0][3] = TileType.Bridge;
      _loadMatch(
        _buildMatchData(
          mapData: _buildMapData(tiles: tiles),
          trackingData: _buildTrackingData(coveredBridges: [const Position(x: 0, y: 0)]),
        ),
      );
      service.initializeData();

      expect(service.globalStats.toggledBridgesRatio, equals(25.0));
    });

    test('should count BrokenBridge tiles as bridge tiles', () {
      final tiles = _buildTiles();
      tiles[0][0] = TileType.BrokenBridge;
      _loadMatch(
        _buildMatchData(
          mapData: _buildMapData(tiles: tiles),
          trackingData: _buildTrackingData(coveredBridges: [const Position(x: 0, y: 0)]),
        ),
      );
      service.initializeData();

      expect(service.globalStats.toggledBridgesRatio, equals(100.0));
    });
  });

  group('playerStats', () {
    test('should map each tracking player to a StatData entry', () {
      _loadMatch(
        _buildMatchData(
          trackingData: _buildTrackingData(
            players: [
              _buildTrackingPlayer(id: 'p1', name: 'Alice'),
              _buildTrackingPlayer(id: 'p2', name: 'Bob'),
            ],
          ),
        ),
      );
      service.initializeData();

      expect(service.playerStats.length, equals(2));
      expect(service.playerStats.map((p) => p.name), containsAll(['Alice', 'Bob']));
    });

    test('should correctly count discoveredItemsCount from pickedUpItems', () {
      _loadMatch(
        _buildMatchData(
          trackingData: _buildTrackingData(
            players: [
              _buildTrackingPlayer(pickedUpItems: ['item1', 'item2', 'item3']),
            ],
          ),
        ),
      );
      service.initializeData();

      expect(service.playerStats.first.discoveredItemsCount, equals(3));
    });

    test('should copy combat stats correctly', () {
      _loadMatch(
        _buildMatchData(
          trackingData: _buildTrackingData(
            players: [_buildTrackingPlayer(combats: 5, victories: 3, defeats: 1, escapes: 1, hpInflicted: 20, hpLost: 10)],
          ),
        ),
      );
      service.initializeData();

      final p = service.playerStats.first;
      expect(p.combats, equals(5));
      expect(p.victories, equals(3));
      expect(p.defeats, equals(1));
      expect(p.escapes, equals(1));
      expect(p.hpInflicted, equals(20));
      expect(p.hpLost, equals(10));
    });

    test('should compute visitedTilesRatio per player', () {
      final tiles = [
        [TileType.Grass, TileType.Grass, TileType.Grass, TileType.Grass],
      ];
      _loadMatch(
        _buildMatchData(
          mapData: _buildMapData(tiles: tiles),
          trackingData: _buildTrackingData(
            players: [
              _buildTrackingPlayer(coveredGroundTiles: [const Position(x: 0, y: 0), const Position(x: 0, y: 1)]),
            ],
          ),
        ),
      );
      service.initializeData();

      expect(service.playerStats.first.visitedTilesRatio, equals(50.0));
    });

    test('should preserve team information', () {
      _loadMatch(
        _buildMatchData(
          trackingData: _buildTrackingData(players: [_buildTrackingPlayer(team: Team.Red)]),
        ),
      );
      service.initializeData();

      expect(service.playerStats.first.team, equals(Team.Red));
    });
  });

  group('winnerData', () {
    test('should return empty strings when matchWinner is null', () {
      _loadMatch(_buildMatchData(trackingData: _buildTrackingData(matchWinner: null)));
      service.initializeData();

      expect(service.winnerData!.name, isEmpty);
      expect(service.winnerData!.avatarImage, isEmpty);
      expect(service.winnerData!.tileImage, isEmpty);
    });

    test('should return winner name when matchWinner is provided', () {
      _loadMatch(
        _buildMatchData(
          trackingData: _buildTrackingData(matchWinner: {'name': 'Alice', 'avatar': Avatar.DefaultAvatar.value, 'tile': TileType.Grass.name}),
        ),
      );
      service.initializeData();

      expect(service.winnerData!.name, equals('Alice'));
    });

    test('should return non-empty asset paths when matchWinner is provided', () {
      _loadMatch(
        _buildMatchData(
          trackingData: _buildTrackingData(matchWinner: {'name': 'Alice', 'avatar': Avatar.DefaultAvatar.value, 'tile': TileType.Grass.name}),
        ),
      );
      service.initializeData();

      expect(service.winnerData!.avatarImage, isNotEmpty);
      expect(service.winnerData!.tileImage, isNotEmpty);
    });

    test('should fall back to Grass tile for unknown tile value', () {
      _loadMatch(
        _buildMatchData(
          trackingData: _buildTrackingData(matchWinner: {'name': 'Bob', 'avatar': Avatar.DefaultAvatar.value, 'tile': 'UnknownTileXYZ'}),
        ),
      );
      service.initializeData();

      expect(service.winnerData!.tileImage, isNotEmpty);
    });
  });

  group('sortPlayerStatsBy', () {
    late List<TrackingPlayerData> threePlayers;

    setUp(() {
      threePlayers = [
        _buildTrackingPlayer(id: 'p1', name: 'Alice', combats: 1, victories: 3),
        _buildTrackingPlayer(id: 'p2', name: 'Bob', combats: 3, victories: 1),
        _buildTrackingPlayer(id: 'p3', name: 'Charlie', combats: 2, victories: 2),
      ];
      _loadMatch(_buildMatchData(trackingData: _buildTrackingData(players: threePlayers)));
      service.initializeData();
    });

    test('ascending order should sort highest value first', () {
      service.sortPlayerStatsBy(PlayerStatType.combats, SortOrder.ascending);
      expect(service.playerStats.map((p) => p.combats).toList(), equals([3, 2, 1]));
    });

    test('descending order should sort lowest value first', () {
      service.sortPlayerStatsBy(PlayerStatType.combats, SortOrder.descending);
      expect(service.playerStats.map((p) => p.combats).toList(), equals([1, 2, 3]));
    });

    test('should sort by victories correctly', () {
      service.sortPlayerStatsBy(PlayerStatType.victories, SortOrder.ascending);
      expect(service.playerStats.map((p) => p.victories).toList(), equals([3, 2, 1]));
    });

    test('should support all PlayerStatType values without throwing', () {
      for (final statType in PlayerStatType.values) {
        expect(() => service.sortPlayerStatsBy(statType, SortOrder.ascending), returnsNormally);
      }
    });
  });

  group('_getTotalTiles — tile type counting', () {
    test('should count Path, Grass, and Bush as ground tiles', () {
      final tiles = [
        [TileType.Path, TileType.Grass, TileType.Bush],
      ];
      _loadMatch(
        _buildMatchData(
          mapData: _buildMapData(tiles: tiles),
          trackingData: _buildTrackingData(coveredGroundTiles: [const Position(x: 0, y: 0), const Position(x: 0, y: 1), const Position(x: 0, y: 2)]),
        ),
      );
      service.initializeData();

      expect(service.globalStats.visitedTilesRatio, equals(100.0));
    });

    test('should not count Water tiles as ground', () {
      final tiles = [
        [TileType.Grass, TileType.Water],
      ];
      _loadMatch(
        _buildMatchData(
          mapData: _buildMapData(tiles: tiles),
          trackingData: _buildTrackingData(coveredGroundTiles: [const Position(x: 0, y: 0)]),
        ),
      );
      service.initializeData();

      expect(service.globalStats.visitedTilesRatio, equals(100.0));
    });
  });
}
