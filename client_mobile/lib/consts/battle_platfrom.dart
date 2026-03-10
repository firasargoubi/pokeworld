import 'package:client_mobile/models/tile_type.dart';

const Map<TileType, BattlePlatform> TILE_TYPE_TO_ASSET_PATH = {
  TileType.Grass: BattlePlatform(
    selfPlatform: 'assets/images/game/battle-platforms/self-grass.png',
    enemyPlatform: 'assets/images/game/battle-platforms/enemy-grass.png',
  ),
  TileType.Path: BattlePlatform(
    selfPlatform: 'assets/images/game/battle-platforms/self-path.png',
    enemyPlatform: 'assets/images/game/battle-platforms/enemy-path.png',
  ),
  TileType.Bush: BattlePlatform(
    selfPlatform: 'assets/images/game/battle-platforms/self-bush.png',
    enemyPlatform: 'assets/images/game/battle-platforms/enemy-bush.png',
  ),
  TileType.Water: BattlePlatform(
    selfPlatform: 'assets/images/game/battle-platforms/self-water.png',
    enemyPlatform: 'assets/images/game/battle-platforms/enemy-water.png',
  ),
  TileType.Bridge: BattlePlatform(
    selfPlatform: 'assets/images/game/battle-platforms/self-bridge.png',
    enemyPlatform: 'assets/images/game/battle-platforms/enemy-bridge.png',
  ),
  TileType.BrokenBridge: BattlePlatform(
    selfPlatform: 'assets/images/game/battle-platforms/self-bridge.png',
    enemyPlatform: 'assets/images/game/battle-platforms/enemy-bridge.png',
  ),
  TileType.None: BattlePlatform(
    selfPlatform: 'assets/images/game/battle-platforms/self-grass.png',
    enemyPlatform: 'assets/images/game/battle-platforms/enemy-grass.png',
  ),
};
