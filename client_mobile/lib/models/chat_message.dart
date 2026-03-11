enum ChatChannel { General, Match }

class ChatMessage {
  final String? sender;
  final String? profilePicture;
  final String content;
  final DateTime timestamp;

  ChatMessage({this.sender, this.profilePicture, required this.content, required this.timestamp});

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      sender: json['sender']?.toString(),
      profilePicture: json.containsKey('profilePicture') ? (json['profilePicture'] as String?) : null,
      content: (json['content'] ?? '').toString(),
      timestamp: DateTime.tryParse((json['timestamp'] ?? '').toString()) ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (sender != null) 'sender': sender,
      if (profilePicture != null) 'profilePicture': profilePicture,
      'content': content,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

class ChatLog extends ChatMessage {
  final List<String> concernedPlayersNamesList;

  ChatLog({super.sender, super.profilePicture, required super.content, required super.timestamp, required this.concernedPlayersNamesList});

  factory ChatLog.fromJson(Map<String, dynamic> json) {
    final base = ChatMessage.fromJson(json);
    final listRaw = json['concernedPlayersNamesList'] as List<dynamic>? ?? [];
    final list = listRaw.map((e) => e.toString()).toList();
    return ChatLog(
      sender: base.sender,
      profilePicture: base.profilePicture,
      content: base.content,
      timestamp: base.timestamp,
      concernedPlayersNamesList: list,
    );
  }

  @override
  Map<String, dynamic> toJson() {
    final m = super.toJson();
    m['concernedPlayersNamesList'] = concernedPlayersNamesList;
    return m;
  }
}
