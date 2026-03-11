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
      avatar: Avatar.fromValue(json['avatar'] as String),
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
      'avatar': avatar.value,
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
  D4(4),
  D6(6);

  final int value;
  const DiceType(this.value);

  static DiceType fromValue(int v) {
    return DiceType.values.firstWhere((e) => e.value == v, orElse: () => DiceType.D4);
  }

  String displayName() {
    switch (this) {
      case DiceType.D4:
        return 'D4';
      case DiceType.D6:
        return 'D6';
    }
  }
}

enum PlayerType {
  Player('player'),
  BotAggressive('botAggressive'),
  BotDefensive('botDefensive');

  final String value;
  const PlayerType(this.value);

  static PlayerType fromValue(String v) {
    return PlayerType.values.firstWhere((e) => e.value == v, orElse: () => PlayerType.Player);
  }
}

enum Team {
  Red('rouge'),
  Blue('bleu'),
  None('none');

  final String value;
  const Team(this.value);

  static Team fromValue(String v) {
    return Team.values.firstWhere((e) => e.value == v, orElse: () => Team.None);
  }
}
