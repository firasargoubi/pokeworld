import 'package:client_mobile/models/chat_message.dart';
import 'package:client_mobile/models/game_data.dart';
import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/player_data.dart';
import 'package:client_mobile/models/tile_type.dart';

class MatchData {
  final String code;
  final MatchState state;
  final GameData gameData;
  final LobbyData lobbyData;
  final PlayData playData;
  final CombatData combatData;
  final TrackingData trackingData;
  final List<PlayerData> players;
  final List<ChatMessage> chatData;
  final List<ChatLog> logData;

  MatchData({
    required this.code,
    required this.state,
    required this.gameData,
    required this.lobbyData,
    required this.playData,
    required this.combatData,
    required this.trackingData,
    required this.players,
    required this.chatData,
    required this.logData,
  });

  factory MatchData.fromJson(Map<String, dynamic> json) {
    return MatchData(
      code: json['code'] as String,
      state: MatchState.fromValue(json['state'] as String),
      gameData: GameData.fromJson((json['gameData'] as Map).cast<String, dynamic>()),
      lobbyData: LobbyData.fromJson((json['lobbyData'] as Map).cast<String, dynamic>()),
      playData: PlayData.fromJson((json['playData'] as Map).cast<String, dynamic>()),
      combatData: CombatData.fromJson((json['combatData'] as Map).cast<String, dynamic>()),
      trackingData: TrackingData.fromJson((json['trackingData'] as Map).cast<String, dynamic>()),
      players: ((json['players'] as List?) ?? const []).cast<Map>().map((e) => PlayerData.fromJson(e.cast<String, dynamic>())).toList(),
      chatData: ((json['chatData'] as List?) ?? const []).cast<Map>().map((e) => ChatMessage.fromJson(e.cast<String, dynamic>())).toList(),
      logData: ((json['logData'] as List?) ?? const []).cast<Map>().map((e) => ChatLog.fromJson(e.cast<String, dynamic>())).toList(),
    );
  }

  @override
  String toString() => 'MatchData(code: $code, state: ${state.value}, players: ${players.length})';
}

class LobbyData {
  final bool isLocked;
  final int hostPlayerIndex;

  LobbyData({required this.isLocked, required this.hostPlayerIndex});

  factory LobbyData.fromJson(Map<String, dynamic> json) {
    return LobbyData(isLocked: json['isLocked'] as bool, hostPlayerIndex: (json['hostPlayerIndex'] as num).toInt());
  }
}

class PlayData {
  final int timeLeft;
  final bool isDebugMode;
  final int activePlayerIndex;
  final bool hasAction;
  final int movementLeft;

  PlayData({required this.timeLeft, required this.isDebugMode, required this.activePlayerIndex, required this.hasAction, required this.movementLeft});

  factory PlayData.fromJson(Map<String, dynamic> json) {
    return PlayData(
      timeLeft: (json['timeLeft'] as num).toInt(),
      isDebugMode: json['isDebugMode'] as bool,
      activePlayerIndex: (json['activePlayerIndex'] as num).toInt(),
      hasAction: json['hasAction'] as bool,
      movementLeft: (json['movementLeft'] as num).toInt(),
    );
  }
}

class CombatData {
  final CombatAction lastCombatAction;
  final int turnDuration;
  final bool isSecondPlayerTurn;
  final List<PlayerCombatData> playersCombatData;
  final int lastRolledAttack;
  final int lastRolledDefense;

  CombatData({
    required this.lastCombatAction,
    required this.turnDuration,
    required this.isSecondPlayerTurn,
    required this.playersCombatData,
    required this.lastRolledAttack,
    required this.lastRolledDefense,
  });

  factory CombatData.fromJson(Map<String, dynamic> json) {
    return CombatData(
      lastCombatAction: CombatAction.fromValue(json['lastCombatAction'] as String),
      turnDuration: (json['turnDuration'] as num).toInt(),
      isSecondPlayerTurn: json['isSecondPlayerTurn'] as bool,
      playersCombatData: ((json['playersCombatData'] as List?) ?? const [])
          .cast<Map>()
          .map((e) => PlayerCombatData.fromJson(e.cast<String, dynamic>()))
          .toList(),
      lastRolledAttack: (json['lastRolledAttack'] as num).toInt(),
      lastRolledDefense: (json['lastRolledDefense'] as num).toInt(),
    );
  }
}

class PlayerCombatData {
  final int playerIndex;
  final int currentHealth;
  final int currentEscapes;
  final int maxEscapes;
  final int escapeChances;
  final int attack;
  final int defense;
  final TileType standingTile;

  PlayerCombatData({
    required this.playerIndex,
    required this.currentHealth,
    required this.currentEscapes,
    required this.maxEscapes,
    required this.escapeChances,
    required this.attack,
    required this.defense,
    required this.standingTile,
  });

  factory PlayerCombatData.fromJson(Map<String, dynamic> json) {
    return PlayerCombatData(
      playerIndex: (json['playerIndex'] as num).toInt(),
      currentHealth: (json['currentHealth'] as num).toInt(),
      currentEscapes: (json['currentEscapes'] as num).toInt(),
      maxEscapes: (json['maxEscapes'] as num).toInt(),
      escapeChances: (json['escapeChances'] as num).toInt(),
      attack: (json['attack'] as num).toInt(),
      defense: (json['defense'] as num).toInt(),
      standingTile: TileType.values.byName(json['standingTile'] as String),
    );
  }
}

class TrackingData {
  final int startTime;
  final int endTime;
  final List<Position> coveredBridges;
  final List<Position> coveredGroundTiles;
  final int rounds;
  final int flagHoldersCount;
  final dynamic matchWinner; // WinnerData (not modeled)
  final List<dynamic> players; // TrackingPlayerData (not modeled)

  TrackingData({
    required this.startTime,
    required this.endTime,
    required this.coveredBridges,
    required this.coveredGroundTiles,
    required this.rounds,
    required this.flagHoldersCount,
    required this.matchWinner,
    required this.players,
  });

  factory TrackingData.fromJson(Map<String, dynamic> json) {
    List<Position> parsePositions(dynamic raw) {
      return ((raw as List?) ?? const []).cast<Map>().map((e) => Position.fromJson(e.cast<String, dynamic>())).toList();
    }

    return TrackingData(
      startTime: (json['startTime'] as num).toInt(),
      endTime: (json['endTime'] as num).toInt(),
      coveredBridges: parsePositions(json['coveredBridges']),
      coveredGroundTiles: parsePositions(json['coveredGroundTiles']),
      rounds: (json['rounds'] as num).toInt(),
      flagHoldersCount: (json['flagHoldersCount'] as num).toInt(),
      matchWinner: json['matchWinner'],
      players: ((json['players'] as List?) ?? const []).cast<dynamic>(),
    );
  }
}

enum CombatAction {
  none('none'),
  successAttack('successAttack'),
  failAttack('failAttack'),
  successEscape('successEscape'),
  failEscape('failEscape');

  final String value;
  const CombatAction(this.value);

  static CombatAction fromValue(String v) {
    return CombatAction.values.firstWhere((e) => e.value == v, orElse: () => CombatAction.none);
  }
}

enum MatchState {
  lobby('lobby'),
  turnStart('turnStart'),
  turnWait('turnWait'),
  movementAnimation('movementAnimation'),
  itemDropSelection('itemDropSelection'),
  combatWait('combatWait'),
  combatAnimation('combatAnimation'),
  combatEnd('combatEnd'),
  matchEnd('matchEnd'),
  statistics('statistics');

  final String value;
  const MatchState(this.value);

  static MatchState fromValue(String v) {
    return MatchState.values.firstWhere((e) => e.value == v, orElse: () => MatchState.lobby);
  }
}
