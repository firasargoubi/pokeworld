import 'package:client_mobile/consts/avatar_data_const.dart';
import 'package:client_mobile/consts/battle_platfrom.dart';
import 'package:client_mobile/models/avatar_data.dart';
import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/models/stat_data.dart';
import 'package:client_mobile/models/tile_type.dart';
import 'package:client_mobile/services/match_service/match_service.dart';

class StatService {
  static final StatService _instance = StatService._internal();
  factory StatService() => _instance;
  StatService._internal();

  late final MatchService _matchService = MatchService();
  WinnerVisualData? winnerData;
  late GlobalStatData globalStats;
  late List<StatData> playerStats;

  late TrackingData _trackingData;
  late TotalTiles _mapTotalTiles;

  void initializeData() {
    final matchData = _matchService.matchData;
    if (matchData == null) return;

    _trackingData = matchData.trackingData;
    _mapTotalTiles = _getTotalTiles(matchData);
    winnerData = _getWinnerAssets();
    globalStats = _getGlobalStats();
    playerStats = _getPlayerStats(matchData);
  }

  void sortPlayerStatsBy(PlayerStatType statType, SortOrder order) {
    playerStats.sort((playerX, playerY) {
      final xValue = _getPlayerStatValue(playerX, statType);
      final yValue = _getPlayerStatValue(playerY, statType);

      return order == SortOrder.ascending ? yValue.compareTo(xValue) : xValue.compareTo(yValue);
    });
  }

  num _getPlayerStatValue(StatData player, PlayerStatType statType) {
    switch (statType) {
      case PlayerStatType.discoveredItemsCount:
        return player.discoveredItemsCount;
      case PlayerStatType.visitedTilesRatio:
        return player.visitedTilesRatio;
      case PlayerStatType.combats:
        return player.combats;
      case PlayerStatType.victories:
        return player.victories;
      case PlayerStatType.defeats:
        return player.defeats;
      case PlayerStatType.escapes:
        return player.escapes;
      case PlayerStatType.hpInflicted:
        return player.hpInflicted;
      case PlayerStatType.hpLost:
        return player.hpLost;
    }
  }

  GlobalStatData _getGlobalStats() {
    return GlobalStatData(
      gameDuration: _getGameDuration(),
      toggledBridgesRatio: _getBridgeRatio(),
      visitedTilesRatio: _getTileRatio(_trackingData.coveredGroundTiles),
      rounds: _trackingData.rounds,
      flagHoldersCount: _trackingData.flagHoldersCount,
    );
  }

  List<StatData> _getPlayerStats(MatchData matchData) {
    return _trackingData.players.map((player) {
      return StatData(
        id: player.id,
        name: player.name,
        team: player.team,
        discoveredItemsCount: player.pickedUpItems.length,
        visitedTilesRatio: _getTileRatio(player.coveredGroundTiles),
        combats: player.combats,
        victories: player.victories,
        defeats: player.defeats,
        escapes: player.escapes,
        hpInflicted: player.hpInflicted,
        hpLost: player.hpLost,
        balanceGain: player.balanceGain,
        currentBalance: player.currentBalance,
      );
    }).toList();
  }

  int _getGameDuration() {
    return _trackingData.endTime - _trackingData.startTime;
  }

  WinnerVisualData _getWinnerAssets() {
    final winner = _trackingData.matchWinner as Map<String, dynamic>?;
    if (winner == null) return WinnerVisualData(name: '', avatarImage: '', tileImage: '');

    final name = winner['name'] as String? ?? '';
    final avatar = Avatar.fromValue(winner['avatar'] as String? ?? '');
    final tile = TileType.values.firstWhere((e) => e.name == (winner['tile'] as String? ?? ''), orElse: () => TileType.Grass);

    return WinnerVisualData(
      name: name,
      avatarImage: AVATAR_DATA[avatar]?.frontGif ?? AVATAR_DATA[Avatar.DefaultAvatar]!.frontGif,
      tileImage: TILE_TYPE_TO_ASSET_PATH[tile]?.enemyPlatform ?? TILE_TYPE_TO_ASSET_PATH[TileType.Grass]!.enemyPlatform,
    );
  }

  double _getBridgeRatio() {
    if (_mapTotalTiles.bridge > 0) {
      final nToggledBridges = _trackingData.coveredBridges.length;
      final nBridges = _mapTotalTiles.bridge;
      return _getRatio(nToggledBridges, nBridges);
    }
    return 0;
  }

  double _getTileRatio(List<Position> coveredTiles) {
    final nCoveredTiles = coveredTiles.length;
    return _getRatio(nCoveredTiles, _mapTotalTiles.ground);
  }

  double _getRatio(int currentElements, int totalElements) {
    const percentageFactor = 100;
    const decimalFactor = 100;
    return (currentElements / totalElements * percentageFactor * decimalFactor).round() / decimalFactor;
  }

  TotalTiles _getTotalTiles(MatchData matchData) {
    final mapTotalTiles = TotalTiles();
    final mapData = matchData.gameData.mapData;

    for (final tileRow in mapData.tiles) {
      for (final tile in tileRow) {
        if ([TileType.Path, TileType.Grass, TileType.Bush].contains(tile)) {
          mapTotalTiles.ground++;
        } else if ([TileType.Bridge, TileType.BrokenBridge].contains(tile)) {
          mapTotalTiles.bridge++;
        }
      }
    }

    return mapTotalTiles;
  }
}
