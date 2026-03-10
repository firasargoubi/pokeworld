enum TileType { Grass, Path, Bush, Water, Bridge, BrokenBridge, None }

class BattlePlatform {
  final String selfPlatform;
  final String enemyPlatform;

  const BattlePlatform({required this.selfPlatform, required this.enemyPlatform});
}
