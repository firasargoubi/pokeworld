enum ItemType {
  Item1('assets/images/game/items/item1.png'),
  Item2('assets/images/game/items/item2.png'),
  Item3('assets/images/game/items/item3.png'),
  Item4('assets/images/game/items/item4.png'),
  Item5('assets/images/game/items/item5.png'),
  Item6('assets/images/game/items/item6.png'),
  Random('assets/images/game/items/random.png'),
  Spawn('assets/images/game/items/spawn.png'),
  Flag('assets/images/game/items/flag.png');

  final String assetPath;
  const ItemType(this.assetPath);
}
