import 'package:client_mobile/models/item_type.dart';
import 'package:client_mobile/models/map_data.dart';

class TileVisualData {
  String tile;
  String? underlay;
  ItemType? item;
  PlayerTileVisual? player;
  OverlayType? overlay;

  TileVisualData({required this.tile, this.underlay, this.item, this.player, this.overlay});
}

class PlayerTileVisual {
  String imageFace;
  String id;

  PlayerTileVisual({required this.imageFace, required this.id});
}

class MapVisualData {
  List<List<TileVisualData>> tiles;
  MapSize size;

  MapVisualData({required this.tiles, required this.size});
}

class OverlayTiles {
  List<Position> possibleMoves;
  List<Position> hoverMoves;
  List<Position> actions;
  Position playerPosition;

  OverlayTiles({required this.possibleMoves, required this.hoverMoves, required this.actions, required this.playerPosition});
}

enum OverlayType { PossibleMove, HoverMove, Action }
