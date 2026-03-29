import 'package:client_mobile/models/chat_message.dart';
import 'package:client_mobile/models/game_data.dart';
import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/models/tile_type.dart';
import 'package:client_mobile/models/user_info.dart';
import 'package:client_mobile/models/user_preferences.dart';

Map<String, dynamic> buildMessageJson({String sender = 'Alice', String content = 'Hello'}) => {
  'sender': sender,
  'content': content,
  'timestamp': '2024-01-01T00:00:00.000',
};

ChatMessage buildChatMessage({String content = 'Hello'}) => ChatMessage(content: content, timestamp: DateTime(2024));

ChatLog buildChatLog() => ChatLog(content: 'Player joined', timestamp: DateTime(2024), concernedPlayersNamesList: ['Alice']);

UserInfo buildUserInfo() => UserInfo(
  username: 'testuser',
  userId: 'u1',
  email: 'test@test.com',
  profilePicture: '',
  fullProfilePicture: '',
  balance: 0,
  createdAt: null,
  preferences: UserPreferences.defaults,
  inventory: []
);

MatchData buildMatchData({List<ChatMessage> messages = const [], List<ChatLog> logs = const []}) => MatchData(
  code: 'TEST',
  state: MatchState.TurnStart,
  gameData: GameData(
    id: 'g1',
    name: 'Game',
    description: '',
    lastEdited: DateTime(2024),
    mapData: MapData(
      tiles: List.generate(10, (_) => List.generate(10, (_) => TileType.Grass)),
      items: {},
      size: MapSize.Small,
      gameMode: GameMode.FFA,
    ),
    thumbnail: '',
  ),
  lobbyData: LobbyData(isLocked: false, hostPlayerIndex: 0, isDropInEnabled: false, isRapidElimination: false),
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
  players: [],
  chatData: messages,
  logData: logs,
);
