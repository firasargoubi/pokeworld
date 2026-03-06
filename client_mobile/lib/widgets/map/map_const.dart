import 'package:flutter/material.dart';

const double MAP_GRID_PADDING = 0.009;

const double OVERLAY_ACTION_ALPHA = 0.5;
const double OVERLAY_HOVER_MOVE_ALPHA = 0.5;
const double OVERLAY_POSSIBLE_MOVE_ALPHA = 0.3;

const double TILE_GRID_BORDER_ALPHA = 0.15;
const double TILE_GRID_BORDER_WIDTH = 0.001;

const String MAP_OVERLAY_ASSET = 'assets/images/menu/containers/play/overlay.png';

const ColorFilter INVERT_COLOR_FILTER = ColorFilter.matrix([0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0]);

const ColorFilter DEFAULT_ITEM_COLOR_FILTER = ColorFilter.mode(Colors.transparent, BlendMode.dst);
