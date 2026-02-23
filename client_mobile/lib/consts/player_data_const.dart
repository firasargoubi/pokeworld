import 'package:client_mobile/models/avatar_data.dart';
import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/player_data.dart';

const int defaultStat = 4;
const int bonusStat = 6;
const int maxItems = 2;

const PlayerData defaultPlayerData = PlayerData(
  id: '',
  isConnected: false,
  name: '',
  avatar: Avatar.defaultAvatar,
  items: [],
  health: 6,
  speed: 4,
  attackDice: DiceType.d6,
  defenseDice: DiceType.d4,
  spawnPoint: Position(x: -1, y: -1),
  position: Position(x: -1, y: -1),
  combatsWon: 0,
  type: PlayerType.player,
  team: Team.none,
);
