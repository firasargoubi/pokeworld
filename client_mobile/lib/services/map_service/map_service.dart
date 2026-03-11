import 'dart:async';

import 'package:client_mobile/consts/avatar_data_const.dart';
import 'package:client_mobile/models/item_type.dart';
import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/map_visual_data.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/models/tile_type.dart';
import 'package:client_mobile/services/map_service/map_service_const.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:flutter/foundation.dart';

class MapService extends ChangeNotifier {
  static final MapService _instance = MapService._internal();
  factory MapService() => _instance;

  MapService._internal() {
    MatchService().matchUpdates.listen((matchData) {
      onMatchUpdate(matchData);
    });
  }

  MapVisualData? _visualMapData;
  MapVisualData? get visualMapData => _visualMapData;

  List<dynamic> _players = const [];
  int _mapSizeValue = 0;

  OverlayTiles overlayTiles = GET_DEFAULT_OVERLAY_TILES();
  final Map<String, Position> _movementOverrides = <String, Position>{};

  MapVisualData toVisualData(MatchData matchData) {
    _players = List<dynamic>.from(matchData.players);
    _updateAllTiles(matchData.gameData.mapData);
    return _visualMapData!;
  }

  void onMatchUpdate(MatchData matchData) {
    _updateAllTiles(matchData.gameData.mapData);
  }

  void setHoverMoves(List<Position> hoverMoves) {
    overlayTiles.hoverMoves = hoverMoves;
    _updateAllTiles(MatchService().matchData!.gameData.mapData);
  }

  void resetOverlayTiles() {
    overlayTiles = GET_DEFAULT_OVERLAY_TILES();
    _updateAllTiles(MatchService().matchData!.gameData.mapData);
  }

  void setPossibleMoves(List<Position> possibleMoves) {
    overlayTiles.possibleMoves = possibleMoves;
    _updateAllTiles(MatchService().matchData!.gameData.mapData);
  }

  void setActions(List<Position> actionPositions) {
    overlayTiles.actions = actionPositions;
    _updateAllTiles(MatchService().matchData!.gameData.mapData);
  }

  void setPlayers(List<dynamic> players) {
    _players = List<dynamic>.from(players);
    _updateAllTiles(MatchService().matchData!.gameData.mapData);
  }

  Future<void> movePlayer(int playerIndex, List<Position> path, {Duration stepDelay = const Duration(milliseconds: 150)}) async {
    if (playerIndex < 0 || playerIndex >= _players.length) return;
    if (path.isEmpty) return;

    final dynamic player = _players[playerIndex];
    if (player == null) return;

    final String playerId = player.id as String;

    for (final pos in path) {
      _movementOverrides[playerId] = pos;
      _updateAllTiles(MatchService().matchData!.gameData.mapData); // notifyListeners() déjà dedans
      await Future.delayed(stepDelay);
    }

    _movementOverrides.remove(playerId);
    _updateAllTiles(MatchService().matchData!.gameData.mapData);
  }

  void _updateAllTiles(MapData mapData) {
    final int mapSize = mapData.size.value;
    _mapSizeValue = mapSize;

    final tiles = List.generate(
      mapSize,
      (_) => List.generate(
        mapSize,
        (_) => TileVisualData(tile: '${tileImagesPrefix[TileType.Grass]!}0$imageSuffix', underlay: null, item: null, player: null, overlay: null),
      ),
    );

    _visualMapData = MapVisualData(tiles: tiles, size: mapData.size);

    for (int x = 0; x < mapSize; x++) {
      for (int y = 0; y < mapSize; y++) {
        _updateTile(mapData, Position(x: x, y: y));
      }
    }

    notifyListeners();
  }

  void _updateTile(MapData mapData, Position position) {
    if (_isOutOfBound(mapData.tiles, position)) return;

    final TileVisualData newData = _getTileVisualData(mapData, position);
    final TileVisualData oldData = _visualMapData!.tiles[position.x][position.y];

    _updateTileData(oldData, newData, position);
  }

  TileVisualData _getTileVisualData(MapData mapData, Position position) {
    return TileVisualData(
      tile: getTileImage(mapData.tiles, position),
      underlay: getUnderlayImage(mapData.tiles, position),
      item: getItem(mapData.items, position),
      player: getPlayerAvatar(position),
      overlay: getOverlay(position),
    );
  }

  void _updateTileData(TileVisualData oldData, TileVisualData newData, Position position) {
    final hasChange =
        oldData.tile != newData.tile ||
        oldData.underlay != newData.underlay ||
        oldData.item != newData.item ||
        oldData.player != newData.player ||
        oldData.overlay != newData.overlay;

    if (!hasChange) return;

    _visualMapData!.tiles[position.x][position.y] = newData;
  }

  String getTileImage(List<List<TileType>> tiles, Position position) {
    final TileType tile = _getTile(tiles, position);
    final String tileVariant = _getTileVariant(tile, tiles, position);

    final String? imagePrefix = tileImagesPrefix[tile];
    if (imagePrefix == null) {
      return '${tileImagesPrefix[TileType.Grass]!}0$imageSuffix';
    }

    return '$imagePrefix$tileVariant$imageSuffix';
  }

  String? getUnderlayImage(List<List<TileType>> tiles, Position position) {
    switch (_getTile(tiles, position)) {
      case TileType.Water:
      case TileType.BrokenBridge:
        return '$underlayImagesPrefix${_getUnderlayVariant(position)}$imageSuffix';
      case TileType.Bridge:
        return '$underlayImagesPrefix'
            '0'
            '$imageSuffix';
      default:
        return null;
    }
  }

  String _getTileVariant(TileType tile, List<List<TileType>> tiles, Position position) {
    switch (tile) {
      case TileType.Water:
        return _getWaterVariant(tiles, position);
      case TileType.Path:
        return _getPathVariant(tiles, position);
      case TileType.Bridge:
      case TileType.BrokenBridge:
        return _getBridgeVariant(tiles, position);
      case TileType.Grass:
        return _getGrassVariant(position);
      default:
        return '0';
    }
  }

  String _getWaterVariant(List<List<TileType>> tiles, Position position) {
    return _getSimilarTiles(tiles: tiles, position: position, deltaPositions: surroundingPositionsDonut, tileTypes: waterSimilarTiles);
  }

  String _getPathVariant(List<List<TileType>> tiles, Position position) {
    return _getSimilarTiles(tiles: tiles, position: position, deltaPositions: surroundingPositionsDonut, tileTypes: pathSimilarTiles);
  }

  String _getBridgeVariant(List<List<TileType>> tiles, Position position) {
    final similarTiles = _getSimilarTiles(tiles: tiles, position: position, deltaPositions: surroundingPositionsPlus, tileTypes: bridgeSimilarTiles);

    return bridgeVariants[similarTiles] ?? '0';
  }

  String _getGrassVariant(Position position) {
    return _getRandomString(position, maxGrassVariant);
  }

  String _getUnderlayVariant(Position position) {
    return _getRandomString(position, maxUnderlayVariant);
  }

  String _getRandomString(Position position, int max) {
    final int randomNumber = randomNumberBase + (position.x + position.y * _mapSizeValue) * randomNumberMultiplier;
    return (randomNumber % (max + 1)).toString();
  }

  ItemType? getItem(Map<ItemType, List<Position>> items, Position position) {
    for (final itemType in ItemType.values) {
      final itemPositions = items[itemType] ?? [];

      final isItemInTile = itemPositions.any((p) => p.x == position.x && p.y == position.y);
      if (isItemInTile) return itemType;
    }
    return null;
  }

  PlayerTileVisual? getPlayerAvatar(Position position) {
    final player = _players.firstWhere((p) {
      if (p == null) return false;
      final dynamic dp = p as dynamic;
      final String id = dp.id as String;

      final Position effectivePos = _movementOverrides[id] ?? (dp.position as Position);

      return effectivePos.x == position.x && effectivePos.y == position.y;
    }, orElse: () => null);

    if (player == null) return null;

    return PlayerTileVisual(imageFace: AVATAR_DATA[player.avatar]!.imageFace, id: player.id);
  }

  String _getSimilarTiles({
    required List<List<TileType>> tiles,
    required Position position,
    required List<Position> deltaPositions,
    required List<TileType> tileTypes,
  }) {
    final similarTiles = _compareTiles(tiles: tiles, position: position, deltaPositions: deltaPositions, tileTypes: tileTypes);

    return similarTiles.map((b) => (b ? '0' : '1')).join();
  }

  List<bool> _compareTiles({
    required List<List<TileType>> tiles,
    required Position position,
    required List<Position> deltaPositions,
    required List<TileType> tileTypes,
  }) {
    return deltaPositions.map((deltaPos) {
      final newPosition = Position(x: position.x + deltaPos.x, y: position.y + deltaPos.y);
      return _compareTile(tiles, newPosition, tileTypes);
    }).toList();
  }

  bool _compareTile(List<List<TileType>> tiles, Position position, List<TileType> tileTypes) {
    final tile = _getTile(tiles, position);
    return tileTypes.contains(tile);
  }

  bool _isOutOfBound(List<List<TileType>> tiles, Position position) {
    final x = position.x;
    final y = position.y;

    if (x < 0 || y < 0) return true;
    if (x >= tiles.length) return true;
    if (y >= tiles[x].length) return true;
    return false;
  }

  TileType _getTile(List<List<TileType>> tiles, Position position) {
    if (_isOutOfBound(tiles, position)) return TileType.None;
    return tiles[position.x][position.y];
  }

  OverlayType? getOverlay(Position position) {
    if (overlayTiles.actions.any((p) => p.x == position.x && p.y == position.y)) {
      return OverlayType.Action;
    }
    if (overlayTiles.hoverMoves.any((p) => p.x == position.x && p.y == position.y)) {
      return OverlayType.HoverMove;
    }
    if (overlayTiles.possibleMoves.any((p) => p.x == position.x && p.y == position.y)) {
      return OverlayType.PossibleMove;
    }
    return null;
  }
}
