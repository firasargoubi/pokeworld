import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/map_visual_data.dart';
import 'package:client_mobile/models/tile_type.dart';

const String imageSuffix = '.png';

const Map<TileType, String> tileImagesPrefix = {
  TileType.Grass: 'assets/images/game/tiles/grass/grass-',
  TileType.Path: 'assets/images/game/tiles/path/path-',
  TileType.Bush: 'assets/images/game/tiles/bush/bush-',
  TileType.Water: 'assets/images/game/tiles/water/water-',
  TileType.Bridge: 'assets/images/game/tiles/bridge/bridge-',
  TileType.BrokenBridge: 'assets/images/game/tiles/broken-bridge/broken-bridge-',
};

const String underlayImagesPrefix = 'assets/images/game/tiles/underlay/underlay-';

final List<TileType> pathSimilarTiles = [TileType.Path, TileType.None, TileType.Bridge, TileType.BrokenBridge];

final List<TileType> waterSimilarTiles = [TileType.Water, TileType.None, TileType.Bridge, TileType.BrokenBridge];

final List<TileType> bridgeSimilarTiles = [TileType.Water, TileType.Bridge, TileType.BrokenBridge];

const int maxGrassVariant = 37;
const int maxUnderlayVariant = 47;

const int randomNumberBase = 5;
const int randomNumberMultiplier = 31;

final Map<String, String> bridgeVariants = {'1001': '1', '0110': '2'};

const List<Position> surroundingPositionsPlus = [Position(x: -1, y: 0), Position(x: 0, y: -1), Position(x: 0, y: 1), Position(x: 1, y: 0)];

const List<Position> surroundingPositionsDonut = [
  Position(x: -1, y: -1),
  Position(x: -1, y: 0),
  Position(x: -1, y: 1),
  Position(x: 0, y: -1),
  Position(x: 0, y: 1),
  Position(x: 1, y: -1),
  Position(x: 1, y: 0),
  Position(x: 1, y: 1),
];

// ignore: non_constant_identifier_names
OverlayTiles GET_DEFAULT_OVERLAY_TILES() {
  return OverlayTiles(possibleMoves: [], hoverMoves: [], actions: [], playerPosition: Position(x: -1, y: -1));
}
