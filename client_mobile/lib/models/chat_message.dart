enum ChatChannel { General, Match, Channels }

class Channel {
  final String name;
  final List<String> membersUsernames;

  Channel({required this.name, required this.membersUsernames});

  factory Channel.fromJson(Map<String, dynamic> json) {
    final membersRaw = json['membersUsernames'] as List<dynamic>? ?? [];
    return Channel(name: (json['name'] ?? '').toString(), membersUsernames: membersRaw.map((e) => e.toString()).toList());
  }
}

class ChannelMessage {
  final String channelName;
  final ChatMessage message;

  ChannelMessage({required this.channelName, required this.message});

  factory ChannelMessage.fromJson(Map<String, dynamic> json) {
    return ChannelMessage(
      channelName: (json['channelName'] ?? '').toString(),
      message: ChatMessage.fromJson(Map<String, dynamic>.from(json['message'] as Map)),
    );
  }
}

class ChannelUser {
  final String channelName;
  final bool isDedicatedChannel;

  ChannelUser({required this.channelName, this.isDedicatedChannel = false});

  Map<String, dynamic> toJson() {
    return {'channelName': channelName, if (isDedicatedChannel) 'isDedicatedChannel': isDedicatedChannel};
  }
}

class ChatMessage {
  final String? sender;
  final String? senderId;
  final String? profilePicture;
  final String content;
  final DateTime timestamp;

  ChatMessage({this.sender, this.senderId, this.profilePicture, required this.content, required this.timestamp});

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      sender: json['sender']?.toString(),
      senderId: json['senderId']?.toString(),
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

  ChatLog({
    super.sender,
    super.senderId,
    super.profilePicture,
    required super.content,
    required super.timestamp,
    required this.concernedPlayersNamesList,
  });

  factory ChatLog.fromJson(Map<String, dynamic> json) {
    final base = ChatMessage.fromJson(json);
    final listRaw = json['concernedPlayersNamesList'] as List<dynamic>? ?? [];
    final list = listRaw.map((e) => e.toString()).toList();
    return ChatLog(
      sender: base.sender,
      senderId: base.senderId,
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
