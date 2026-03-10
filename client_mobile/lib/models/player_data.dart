import 'package:client_mobile/models/avatar_data.dart';
import 'package:client_mobile/models/item_type.dart';
import 'package:client_mobile/models/map_data.dart';

class PlayerData {
  const PlayerData({
    required this.id,
    required this.isConnected,
    required this.name,
    required this.avatar,
    required this.items,
    required this.health,
    required this.speed,
    required this.attackDice,
    required this.defenseDice,
    required this.spawnPoint,
    required this.position,
    required this.combatsWon,
    required this.type,
    required this.team,
  });

  final String id;
  final bool isConnected;
  final String name;
  final Avatar avatar;
  final List<ItemType> items;
  final int health;
  final int speed;
  final DiceType attackDice;
  final DiceType defenseDice;
  final Position spawnPoint;
  final Position position;
  final int combatsWon;
  final PlayerType type;
  final Team team;

  factory PlayerData.fromJson(Map<String, dynamic> json) {
    return PlayerData(
      id: json['id'] as String,
      isConnected: json['isConnected'] as bool,
      name: json['name'] as String,
      avatar: _avatarFromServer(json['avatar'] as String),
      items: ((json['items'] as List?) ?? const []).cast<String>().map((e) => ItemType.values.byName(e)).toList(),
      health: (json['health'] as num).toInt(),
      speed: (json['speed'] as num).toInt(),
      attackDice: DiceType.fromValue((json['attackDice'] as num).toInt()),
      defenseDice: DiceType.fromValue((json['defenseDice'] as num).toInt()),
      spawnPoint: Position.fromJson((json['spawnPoint'] as Map).cast<String, dynamic>()),
      position: Position.fromJson((json['position'] as Map).cast<String, dynamic>()),
      combatsWon: (json['combatsWon'] as num).toInt(),
      type: PlayerType.fromValue(json['type'] as String),
      team: Team.fromValue(json['team'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'isConnected': isConnected,
      'name': name,
      'avatar': _avatarToServer(avatar),
      'items': items.map((e) => e.name).toList(),
      'health': health,
      'speed': speed,
      'attackDice': attackDice.value,
      'defenseDice': defenseDice.value,
      'spawnPoint': spawnPoint.toJson(),
      'position': position.toJson(),
      'combatsWon': combatsWon,
      'type': type.value,
      'team': team.value,
    };
  }
}

enum DiceType {
  d4(4),
  d6(6);

  final int value;
  const DiceType(this.value);

  static DiceType fromValue(int v) {
    return DiceType.values.firstWhere((e) => e.value == v, orElse: () => DiceType.d4);
  }

  String displayName() {
    switch (this) {
      case DiceType.d4:
        return 'D4';
      case DiceType.d6:
        return 'D6';
    }
  }
}

enum PlayerType {
  player('player'),
  botAggressive('botAggressive'),
  botDefensive('botDefensive');

  final String value;
  const PlayerType(this.value);

  static PlayerType fromValue(String v) {
    return PlayerType.values.firstWhere((e) => e.value == v, orElse: () => PlayerType.player);
  }
}

enum Team {
  red('rouge'),
  blue('bleu'),
  none('none');

  final String value;
  const Team(this.value);

  static Team fromValue(String v) {
    return Team.values.firstWhere((e) => e.value == v, orElse: () => Team.none);
  }
}

Avatar _avatarFromServer(String raw) {
  if (raw == 'default') return Avatar.defaultAvatar;
  var name = raw.replaceAll('-evolved', 'Evolved').replaceAll('-shiny', 'Shiny').replaceAll('-', '');
  return Avatar.values.firstWhere((e) => e.name == name, orElse: () => Avatar.defaultAvatar);
}

String _avatarToServer(Avatar avatar) {
  final name = avatar.name;
  if (name == 'defaultAvatar') return 'default';
  return name.replaceAll('Evolved', '-evolved').replaceAll('Shiny', '-shiny');
}
