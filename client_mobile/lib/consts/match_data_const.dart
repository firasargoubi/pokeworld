import 'package:client_mobile/consts/game_data_const.dart';
import 'package:client_mobile/models/match_data.dart';

const int defaultSelfIndex = -1;
const int turnWaitDuration = 30000;

MatchData buildDefaultMatchData() {
  return MatchData(
    code: '',
    state: MatchState.lobby,
    gameData: buildDefaultGameData(),
    lobbyData: LobbyData(isLocked: false, hostPlayerIndex: 0),
    playData: PlayData(timeLeft: turnWaitDuration, activePlayerIndex: 0, isDebugMode: false, hasAction: false, movementLeft: 0),
    combatData: CombatData(
      lastCombatAction: CombatAction.none,
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
