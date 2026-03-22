import 'package:client_mobile/models/avatar_data.dart';
import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/player_data.dart';

const int DEFAULT_STAT = 4;
const int BONUS_STAT = 6;
const int MAX_ITEMS = 2;
const Map<MapSize, int> MAX_PLAYERS = {MapSize.Small: 2, MapSize.Medium: 4, MapSize.Large: 6};

const PlayerData DEFAULT_PLAYER_DATA = PlayerData(
  id: '',
  isConnected: false,
  name: '',
  avatar: Avatar.DefaultAvatar,
  items: [],
  health: BONUS_STAT,
  speed: DEFAULT_STAT,
  attackDice: DiceType.D6,
  defenseDice: DiceType.D4,
  spawnPoint: Position(x: -1, y: -1),
  position: Position(x: -1, y: -1),
  combatsWon: 0,
  type: PlayerType.Player,
  team: Team.None,
);
