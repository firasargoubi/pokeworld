import 'package:client_mobile/models/game_data.dart';
import 'package:client_mobile/models/item_type.dart';
import 'package:client_mobile/models/map_data.dart';

// ignore: non_constant_identifier_names
GameData GET_DEFAULT_GAME_DATA() {
  return GameData(
    id: '',
    name: '',
    description: '',
    lastEdited: DateTime.fromMillisecondsSinceEpoch(0),
    mapData: MapData(
      items: {
        ItemType.Item1: [],
        ItemType.Item2: [],
        ItemType.Item3: [],
        ItemType.Item4: [],
        ItemType.Item5: [],
        ItemType.Item6: [],
        ItemType.Random: [],
        ItemType.Spawn: [],
        ItemType.Flag: [],
      },
      tiles: [],
      size: MapSize.Small,
      gameMode: GameMode.FFA,
    ),
    thumbnail: '',
  );
}
