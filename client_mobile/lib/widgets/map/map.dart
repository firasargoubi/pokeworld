import 'package:client_mobile/models/item_type.dart';
import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/map_visual_data.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/services/map_service/map_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/services/play_service/play_service.dart';
import 'package:client_mobile/widgets/map/map_const.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

class MapWidget extends StatefulWidget {
  const MapWidget({super.key, required this.matchData, required this.baseSize});

  final MatchData matchData;
  final double baseSize;

  @override
  State<MapWidget> createState() => _MapWidgetState();
}

class _MapWidgetState extends State<MapWidget> {
  final MapService _mapService = MapService();

  @override
  void initState() {
    super.initState();
    _mapService.toVisualData(widget.matchData);
  }

  @override
  void didUpdateWidget(covariant MapWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!identical(oldWidget.matchData, widget.matchData)) {
      _mapService.toVisualData(widget.matchData);
    }
  }

  Color _overlayColor(OverlayType? overlay) {
    switch (overlay) {
      case OverlayType.action:
        return Colors.red.withValues(alpha: OVERLAY_ACTION_ALPHA);
      case OverlayType.hoverMove:
        return Colors.blue.withValues(alpha: OVERLAY_HOVER_MOVE_ALPHA);
      case OverlayType.possibleMove:
        return Colors.white.withValues(alpha: OVERLAY_POSSIBLE_MOVE_ALPHA);
      default:
        return Colors.transparent;
    }
  }

  ColorFilter _itemColorFilter(int x, int y) {
    final selfPlayer = MatchService().selfPlayer!;
    final isSelfSpawnPoint = selfPlayer.spawnPoint.x == x && selfPlayer.spawnPoint.y == y;
    return isSelfSpawnPoint ? INVERT_COLOR_FILTER : DEFAULT_ITEM_COLOR_FILTER;
  }

  double _playerOpacity(PlayerTileVisual player) {
    if (PlayService().hasItem(player.id, ItemType.Item6)) {
      if (MatchService().selfId == player.id) {
        return 0.5;
      }
      return 0;
    }
    return 1.0;
  }

  void _handleTileTap(int x, int y) {
    if (kDebugMode) {
      print('Tile tapped at position: ($y, $x)');
    }
    PlayService().handleClick(Position(x: x, y: y));
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _mapService,
      builder: (context, _) {
        final MapVisualData? visualMap = _mapService.visualMapData;
        if (visualMap == null) return const SizedBox.shrink();

        final int gridSize = visualMap.size.value;
        if (gridSize == 0) return const SizedBox.shrink();

        return SizedBox.expand(
          child: AspectRatio(
            aspectRatio: 1,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Padding(
                  padding: EdgeInsets.all(widget.baseSize * MAP_GRID_PADDING),
                  child: GridView.builder(
                    physics: const NeverScrollableScrollPhysics(),
                    padding: EdgeInsets.zero,
                    itemCount: gridSize * gridSize,
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: gridSize),
                    itemBuilder: (context, index) {
                      final int x = index % gridSize;
                      final int y = index ~/ gridSize;

                      final tile = visualMap.tiles[y][x];

                      return GestureDetector(
                        onTap: () => _handleTileTap(y, x),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            if (tile.underlay != null) Image.asset(tile.underlay!, fit: BoxFit.cover, filterQuality: FilterQuality.none),
                            Image.asset(tile.tile, fit: BoxFit.cover, filterQuality: FilterQuality.none),
                            if (tile.item != null)
                              Center(
                                child: ColorFiltered(
                                  colorFilter: _itemColorFilter(y, x),
                                  child: Image.asset(
                                    tile.item!.assetPath,
                                    width: double.infinity,
                                    height: double.infinity,
                                    fit: BoxFit.contain,
                                    filterQuality: FilterQuality.none,
                                  ),
                                ),
                              ),
                            if (tile.player != null)
                              Center(
                                child: Opacity(
                                  opacity: _playerOpacity(tile.player!),
                                  child: Image.asset(
                                    tile.player!.imageFace,
                                    width: double.infinity,
                                    height: double.infinity,
                                    fit: BoxFit.contain,
                                    filterQuality: FilterQuality.none,
                                  ),
                                ),
                              ),
                            if (tile.overlay != null) Container(color: _overlayColor(tile.overlay)),
                            IgnorePointer(
                              child: DecoratedBox(
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: Colors.white.withValues(alpha: TILE_GRID_BORDER_ALPHA),
                                    width: widget.baseSize * TILE_GRID_BORDER_WIDTH,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                IgnorePointer(
                  child: Image.asset(MAP_OVERLAY_ASSET, fit: BoxFit.cover, filterQuality: FilterQuality.none),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
