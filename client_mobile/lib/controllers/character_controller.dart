import 'package:client_mobile/consts/player_data_const.dart';
import 'package:client_mobile/models/avatar_data.dart';
import 'package:client_mobile/models/player_data.dart';
import 'package:client_mobile/services/lobby_service/lobby_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/services/user_service/user_service.dart';

class CharacterController {
  final MatchService _matchService = MatchService();
  final LobbyService _lobbyService = LobbyService();
  final UserService _userService = UserService();

  void changeAvatar(Avatar avatar) {
    _lobbyService.changeAvatar(avatar);
  }

  void joinLobby({
    required bool isHpBonusActive,
    required bool isAttD6Active,
    required Avatar? selectedAvatar,
    required Function(List<String>) onWarnings,
  }) {
    final warnings = _getWarnings(selectedAvatar);
    if (warnings.isNotEmpty) {
      onWarnings(warnings);
      return;
    }

    final playerData = _getPlayerData(isHpBonusActive: isHpBonusActive, isAttD6Active: isAttD6Active);
    _lobbyService.joinLobby(playerData);
  }

  PlayerData _getPlayerData({required bool isHpBonusActive, required bool isAttD6Active}) {
    final selfPlayer = _matchService.selfPlayer!;
    final username = _userService.currentUser.value?.username ?? '';

    return PlayerData(
      id: selfPlayer.id,
      isConnected: selfPlayer.isConnected,
      name: username.toUpperCase().trim(),
      avatar: selfPlayer.avatar,
      items: selfPlayer.items,
      health: isHpBonusActive ? BONUS_STAT : DEFAULT_STAT,
      speed: isHpBonusActive ? DEFAULT_STAT : BONUS_STAT,
      attackDice: isAttD6Active ? DiceType.D6 : DiceType.D4,
      defenseDice: isAttD6Active ? DiceType.D4 : DiceType.D6,
      spawnPoint: selfPlayer.spawnPoint,
      position: selfPlayer.position,
      combatsWon: selfPlayer.combatsWon,
      type: selfPlayer.type,
      team: selfPlayer.team,
    );
  }

  List<String> _getWarnings(Avatar? selectedAvatar) {
    final warnings = <String>[];

    if (selectedAvatar == null || selectedAvatar == Avatar.DefaultAvatar) {
      warnings.add('Veuillez choisir un avatar');
    }

    return warnings;
  }

  String getUsername() {
    return _userService.currentUser.value?.username.toUpperCase() ?? '';
  }
}
