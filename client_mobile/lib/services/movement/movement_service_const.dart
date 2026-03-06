import 'package:client_mobile/models/item_type.dart';
import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/tile_type.dart';

const OUTSIDE_OF_MAP = Position(x: -2, y: -2);

const SURROUNDING_POSITIONS_PLUS = <Position>[Position(x: -1, y: 0), Position(x: 0, y: -1), Position(x: 0, y: 1), Position(x: 1, y: 0)];

const SURROUNDING_POSITIONS_SQUARE = <Position>[
  Position(x: -1, y: -1),
  Position(x: -1, y: 0),
  Position(x: -1, y: 1),
  Position(x: 0, y: -1),
  Position(x: 0, y: 0),
  Position(x: 0, y: 1),
  Position(x: 1, y: -1),
  Position(x: 1, y: 0),
  Position(x: 1, y: 1),
];

const SURROUNDING_POSITIONS_DONUT = <Position>[
  Position(x: -1, y: -1),
  Position(x: -1, y: 0),
  Position(x: -1, y: 1),
  Position(x: 0, y: -1),
  Position(x: 0, y: 1),
  Position(x: 1, y: -1),
  Position(x: 1, y: 0),
  Position(x: 1, y: 1),
];

const REGULAR_ITEMS = <ItemType>[ItemType.Item1, ItemType.Item2, ItemType.Item3, ItemType.Item4, ItemType.Item5, ItemType.Item6];

const Map<TileType, double> TILE_COST = {
  TileType.Path: 0,
  TileType.Grass: 1,
  TileType.Bush: 2,
  TileType.Water: double.infinity,
  TileType.Bridge: 1,
  TileType.BrokenBridge: double.infinity,
  TileType.None: double.infinity,
};
