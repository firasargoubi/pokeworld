enum ChallengeType {
  Explorer('explorer'),
  Invincible('invincible'),
  Collector('collector'),
  BridgeWalker('bridgeWalker'),
  Duelist('duelist');

  final String value;
  const ChallengeType(this.value);

  static ChallengeType fromValue(String value) {
    return ChallengeType.values.firstWhere((type) => type.value == value, orElse: () => ChallengeType.Explorer);
  }
}

class PlayerChallengeData {
  const PlayerChallengeData({required this.type, required this.isCompleted, required this.progress, required this.target, required this.cashGain});

  final ChallengeType type;
  final bool isCompleted;
  final int progress;
  final int target;
  final int cashGain;

  factory PlayerChallengeData.fromJson(Map<String, dynamic> json) {
    return PlayerChallengeData(
      type: ChallengeType.fromValue((json['type'] ?? '').toString()),
      isCompleted: (json['isCompleted'] as bool?) ?? false,
      progress: (json['progress'] as num?)?.toInt() ?? 0,
      target: (json['target'] as num?)?.toInt() ?? 0,
      cashGain: (json['cashGain'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {'type': type.value, 'isCompleted': isCompleted, 'progress': progress, 'target': target, 'cashGain': cashGain};
  }
}

class UserChallengeData {
  const UserChallengeData({required this.challenge, required this.completed});

  final String challenge;
  final int completed;

  factory UserChallengeData.fromJson(Map<String, dynamic> json) {
    return UserChallengeData(challenge: (json['challenge'] ?? '').toString(), completed: (json['completed'] as num?)?.toInt() ?? 0);
  }

  Map<String, dynamic> toJson() {
    return {'challenge': challenge, 'completed': completed};
  }
}
