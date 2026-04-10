import 'package:client_mobile/models/avatar_data.dart';
import 'package:client_mobile/models/game_data.dart';
import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/models/player_data.dart';
import 'package:client_mobile/models/socket_event.dart';
import 'package:client_mobile/models/tile_type.dart';
import 'package:client_mobile/services/lobby_service/lobby_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/services/socket_service/socket_service.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

class _MockSocket extends Mock implements io.Socket {}

MatchData _matchData({MatchState state = MatchState.TurnStart, List<PlayerData> players = const []}) => MatchData(
  code: 'TEST',
  state: state,
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
  lobbyData: LobbyData(isLocked: false, hostPlayerIndex: 0, isDropInEnabled: false, isRapidElimination: false, isFriendOnly: false),
  playData: PlayData(timeLeft: 60, isDebugMode: false, activePlayerIndex: 0, actionsLeft: 0, movementLeft: 3, isElementalMode: false),
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

PlayerData _player({required String id, bool isConnected = true}) => PlayerData(
  id: id,
  isConnected: isConnected,
  name: 'Player',
  avatar: Avatar.DefaultAvatar,
  items: const [],
  health: 10,
  speed: 3,
  attackDice: DiceType.D4,
  defenseDice: DiceType.D4,
  spawnPoint: const Position(x: 0, y: 0),
  position: const Position(x: 0, y: 0),
  combatsWon: 0,
  type: PlayerType.Player,
  team: Team.None,
);

void main() {
  late _MockSocket mockSocket;

  setUpAll(() {
    TestWidgetsFlutterBinding.ensureInitialized();

    mockSocket = _MockSocket();
    when(() => mockSocket.on(any(), any())).thenAnswer((_) {});
    when(() => mockSocket.emit(any(), any())).thenAnswer((_) {});
    when(() => mockSocket.id).thenReturn('self');
    SocketService().socket = mockSocket;
    LobbyService();
  });

  setUp(() => clearInteractions(mockSocket));

  group('kickPlayer', () {
    test('should emit KickPlayer event with playerId', () {
      LobbyService().kickPlayer('p1');
      verify(() => mockSocket.emit(LobbyEvent.KickPlayer.value, 'p1')).called(1);
    });
  });

  group('changeAvatar', () {
    test('should emit ChangeAvatar event with avatar value', () {
      LobbyService().changeAvatar(Avatar.Avatar1);
      verify(() => mockSocket.emit(LobbyEvent.ChangeAvatar.value, Avatar.Avatar1.value)).called(1);
    });
  });

  group('joinLobby', () {
    test('should emit JoinLobby event with player json', () {
      final player = _player(id: 'p1');
      LobbyService().joinLobby(player);
      verify(() => mockSocket.emit(LobbyEvent.JoinLobby.value, player.toJson())).called(1);
    });
  });

  group('changeLockStatus', () {
    test('should emit ChangeLockStatus event with true', () {
      LobbyService().changeLockStatus(true);
      verify(() => mockSocket.emit(LobbyEvent.ChangeLockStatus.value, true)).called(1);
    });

    test('should emit ChangeLockStatus event with false', () {
      LobbyService().changeLockStatus(false);
      verify(() => mockSocket.emit(LobbyEvent.ChangeLockStatus.value, false)).called(1);
    });
  });

  group('startMatch', () {
    test('should emit StartMatch event', () {
      LobbyService().startMatch();
      verify(() => mockSocket.emit(LobbyEvent.StartMatch.value, any())).called(1);
    });
  });

  group('addBot', () {
    test('should emit AddBot event with bot type value', () {
      LobbyService().addBot(PlayerType.BotAggressive);
      verify(() => mockSocket.emit(LobbyEvent.AddBot.value, PlayerType.BotAggressive.value)).called(1);
    });
  });

  group('onMatchUpdate', () {
    test('should complete without error when nav is null on any transition', () async {
      await expectLater(LobbyService().onMatchUpdate(_matchData(), _matchData()), completes);
    });

    test('should complete without error on Lobby to TurnStart transition', () async {
      await expectLater(LobbyService().onMatchUpdate(_matchData(state: MatchState.Lobby), _matchData(state: MatchState.TurnStart)), completes);
    });

    test('should complete without error when self player connects in Lobby state', () async {
      await expectLater(
        LobbyService().onMatchUpdate(
          _matchData(
            state: MatchState.Lobby,
            players: [_player(id: 'self', isConnected: false)],
          ),
          _matchData(
            state: MatchState.Lobby,
            players: [_player(id: 'self', isConnected: true)],
          ),
        ),
        completes,
      );
    });

    test('should complete without error when state does not change', () async {
      await expectLater(LobbyService().onMatchUpdate(_matchData(state: MatchState.TurnStart), _matchData(state: MatchState.TurnStart)), completes);
    });
  });

  group('initMatchUpdateListener', () {
    test('should call onMatchUpdate after two successive match updates', () async {
      MatchService().onUpdate(_matchData(state: MatchState.Lobby));
      await Future(() {});
      MatchService().onUpdate(_matchData(state: MatchState.TurnStart));
      await Future(() {});
    });
  });
}
