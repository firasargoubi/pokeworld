import 'package:client_mobile/models/avatar_data.dart';
import 'package:client_mobile/models/game_data.dart';
import 'package:client_mobile/models/item_type.dart';
import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/models/player_data.dart';
import 'package:client_mobile/models/tile_type.dart';

// 3x3 grid: all Grass except (0,0)=Path and (1,1)=Water
List<List<TileType>> buildTiles({int size = 3, TileType fill = TileType.Grass}) => List.generate(size, (_) => List.generate(size, (_) => fill));

MapData buildMapData({
  List<List<TileType>>? tiles,
  Map<ItemType, List<Position>>? items,
  MapSize size = MapSize.Small,
  GameMode gameMode = GameMode.FFA,
}) {
  final s = size.value;
  return MapData(
    tiles: tiles ?? List.generate(s, (_) => List.generate(s, (_) => TileType.Grass)),
    items: items ?? {},
    size: size,
    gameMode: gameMode,
  );
}

PlayerData buildPlayer({Position position = const Position(x: 0, y: 0), Team team = Team.None}) => PlayerData(
  id: 'p1',
  isConnected: true,
  name: 'Player',
  avatar: Avatar.DefaultAvatar,
  items: const [],
  health: 10,
  speed: 3,
  attackDice: DiceType.D4,
  defenseDice: DiceType.D4,
  spawnPoint: const Position(x: 0, y: 0),
  position: position,
  combatsWon: 0,
  type: PlayerType.Player,
  team: team,
);

CombatData emptyCombatData() => CombatData(
  lastCombatAction: CombatAction.None,
  turnDuration: 0,
  isSecondPlayerTurn: false,
  playersCombatData: [],
  lastRolledAttack: 0,
  lastRolledDefense: 0,
);

TrackingData emptyTrackingData() => TrackingData(
  startTime: 0,
  endTime: 0,
  coveredBridges: [],
  coveredGroundTiles: [],
  rounds: 0,
  flagHoldersCount: 0,
  matchWinner: null,
  players: [],
);

GameData buildGameData(MapData mapData) =>
    GameData(id: 'g1', name: 'Game', description: '', lastEdited: DateTime(2024), mapData: mapData, thumbnail: '');

MatchData buildMatchData({
  required MapData mapData,
  required List<PlayerData> players,
  int movementLeft = 3,
  int activePlayerIndex = 0,
  int actionsLeft = 1,
}) => MatchData(
  code: 'TEST',
  state: MatchState.TurnStart,
  gameData: buildGameData(mapData),
  lobbyData: LobbyData(isLocked: false, hostPlayerIndex: 0, isDropInEnabled: false, isRapidElimination: false, entryFee: 0, isFriendOnly: false),
  playData: PlayData(
    timeLeft: 60,
    isDebugMode: false,
    activePlayerIndex: activePlayerIndex,
    actionsLeft: actionsLeft,
    movementLeft: movementLeft,
    isElementalMode: false,
  ),
  combatData: emptyCombatData(),
  trackingData: emptyTrackingData(),
  players: players,
  chatData: [],
  logData: [],
);
