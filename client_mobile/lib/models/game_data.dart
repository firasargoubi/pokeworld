import 'package:client_mobile/models/map_data.dart';

class GameData {
  GameData({
    required this.id,
    required this.name,
    required this.description,
    required this.lastEdited,
    required this.mapData,
    required this.thumbnail,
  });

  final String id;
  final String name;
  final String description;
  final DateTime lastEdited;
  final MapData mapData;
  final String thumbnail;

  factory GameData.fromJson(Map<String, dynamic> json) {
    return GameData(
      id: json['_id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      lastEdited: DateTime.parse(json['lastEdited'] as String),
      mapData: MapData.fromJson((json['mapData'] as Map).cast<String, dynamic>()),
      thumbnail: json['thumbnail'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'description': description,
      'lastEdited': lastEdited.toIso8601String(),
      'mapData': mapData.toJson(),
      'thumbnail': thumbnail,
    };
  }
}
