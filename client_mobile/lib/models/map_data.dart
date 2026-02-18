import 'package:client_mobile/models/item_type.dart';
import 'package:client_mobile/models/tile_type.dart';

class MapData {
  MapData({
    required this.tiles,
    required this.items,
    required this.size,
    required this.gameMode,
  });

  final List<List<TileType>> tiles;
  final Map<ItemType, List<Position>> items;
  final MapSize size;
  final GameMode gameMode;

  factory MapData.fromJson(Map<String, dynamic> json) {
    return MapData(
      tiles: _parseTiles(json['tiles']),
      items: _parseItems(json['items']),
      size: MapSize.values.firstWhere(
        (e) => e.value == (json['size'] as num).toInt(),
        orElse: () => MapSize.small,
      ),
      gameMode: GameMode.values.firstWhere(
        (e) => e.value == json['gameMode'] as String,
        orElse: () => GameMode.ffa,
      ),
    );
  }

  static List<List<TileType>> _parseTiles(dynamic raw) {
    final rows = (raw as List).cast<List>();
    return rows
        .map(
          (row) => row
              .cast<String>()
              .map((name) => TileType.values.byName(name))
              .toList(),
        )
        .toList();
  }

  static Map<ItemType, List<Position>> _parseItems(dynamic raw) {
    final map = (raw as Map).cast<String, dynamic>();
    return map.map((typeName, positionsRaw) {
      final type = ItemType.values.byName(typeName);
      final positions = (positionsRaw as List)
          .cast<Map>()
          .map((e) => Position.fromJson(e.cast<String, dynamic>()))
          .toList();
      return MapEntry(type, positions);
    });
  }
}

enum MapSize {
  small(10),
  medium(15),
  large(20);

  final int value;
  const MapSize(this.value);
}

enum GameMode {
  ffa('FFA'),
  ctf('CTF');

  final String value;
  const GameMode(this.value);
}

class Position {
  const Position({required this.x, required this.y});

  final int x;
  final int y;

  factory Position.fromJson(Map<String, dynamic> json) {
    return Position(
      x: (json['x'] as num).toInt(),
      y: (json['y'] as num).toInt(),
    );
  }

  Map<String, dynamic> toJson() => {'x': x, 'y': y};
}
