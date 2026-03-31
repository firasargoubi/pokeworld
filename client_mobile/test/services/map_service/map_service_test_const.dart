import 'package:client_mobile/models/avatar_data.dart';
import 'package:client_mobile/models/game_data.dart';
import 'package:client_mobile/models/item_type.dart';
import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/models/player_data.dart';
import 'package:client_mobile/models/tile_type.dart';

MapData buildMapData({List<List<TileType>>? tiles, Map<ItemType, List<Position>>? items}) => MapData(
  tiles: tiles ?? List.generate(10, (_) => List.generate(10, (_) => TileType.Grass)),
  items: items ?? {},
  size: MapSize.Small,
  gameMode: GameMode.FFA,
);

List<List<TileType>> buildTiles({int size = 3, TileType fill = TileType.Grass}) => List.generate(size, (_) => List.generate(size, (_) => fill));

MatchData buildMatchData({MapData? mapData, List<PlayerData> players = const []}) => MatchData(
  code: 'TEST',
  state: MatchState.TurnStart,
  gameData: GameData(id: 'g1', name: 'Game', description: '', lastEdited: DateTime(2024), mapData: mapData ?? buildMapData(), thumbnail: ''),
  lobbyData: LobbyData(isLocked: false, hostPlayerIndex: 0, isDropInEnabled: false, isRapidElimination: false, isFriendOnly: false),
  playData: PlayData(timeLeft: 60, isDebugMode: false, activePlayerIndex: 0, hasAction: false, movementLeft: 3, isElementalMode: false),
  combatData: CombatData(
    lastCombatAction: CombatAction.None,
    turnDuration: 0,
    isSecondPlayerTurn: false,
    playersCombatData: [],
    lastRolledAttack: 0,
    lastRolledDefense: 0,
  ),
  trackingData: TrackingData(
    startTime: 0,
    endTime: 0,
    coveredBridges: [],
    coveredGroundTiles: [],
    rounds: 0,
    flagHoldersCount: 0,
    matchWinner: null,
    players: [],
  ),
  players: players,
  chatData: [],
  logData: [],
);

PlayerData buildPlayer({String id = 'p1', Position position = const Position(x: 0, y: 0)}) => PlayerData(
  id: id,
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
  team: Team.None,
);
