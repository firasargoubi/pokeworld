import 'package:client_mobile/consts/game_data_const.dart';
import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/match_data.dart';

const int DEFAULT_SELF_INDEX = -1;
const int TURN_WAIT_DURATION = 30000;

// ignore: non_constant_identifier_names
MatchData GET_DEFAULT_MATCH_DATA() {
  return MatchData(
    code: '',
    state: MatchState.Lobby,
    gameData: GET_DEFAULT_GAME_DATA(),
    lobbyData: LobbyData(isLocked: false, hostPlayerIndex: 0, isDropInEnabled: false, isRapidElimination: false, entryFee: 0, isFriendOnly: false),
    playData: PlayData(
      timeLeft: TURN_WAIT_DURATION,
      activePlayerIndex: 0,
      isDebugMode: false,
      actionsLeft: 0,
      movementLeft: 0,
      isElementalMode: false,
    ),
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
    chatData: [],
    logData: [],
  );
}

const Map<MapSize, int> MAP_SIZE_PLAYER_COUNT = {MapSize.Small: 2, MapSize.Medium: 4, MapSize.Large: 6};
