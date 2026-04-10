import 'package:client_mobile/models/player_data.dart';

class StatData {
  final String id;
  final String name;
  final Team? team;
  final int discoveredItemsCount;
  final double visitedTilesRatio;
  final int combats;
  final int victories;
  final int defeats;
  final int escapes;
  final int hpInflicted;
  final int hpLost;
  final int balanceGain;
  final int currentBalance;

  StatData({
    required this.id,
    required this.name,
    this.team,
    required this.discoveredItemsCount,
    required this.visitedTilesRatio,
    required this.combats,
    required this.victories,
    required this.defeats,
    required this.escapes,
    required this.hpInflicted,
    required this.hpLost,
    required this.balanceGain,
    required this.currentBalance,
  });
}

class GlobalStatData {
  final int gameDuration;
  final double toggledBridgesRatio;
  final double visitedTilesRatio;
  final int rounds;
  final int flagHoldersCount;

  GlobalStatData({
    required this.gameDuration,
    required this.toggledBridgesRatio,
    required this.visitedTilesRatio,
    required this.rounds,
    required this.flagHoldersCount,
  });
}

class WinnerVisualData {
  final String name;
  final String avatarImage;
  final String tileImage;

  WinnerVisualData({required this.name, required this.avatarImage, required this.tileImage});
}

class TotalTiles {
  int ground = 0;
  int bridge = 0;
}

enum PlayerStatType { balanceGain, discoveredItemsCount, visitedTilesRatio, combats, victories, defeats, escapes, hpInflicted, hpLost }

enum SortOrder { ascending, descending }
