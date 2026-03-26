import 'dart:ui';

enum ElementalType {
  Grass('grass'),
  Water('water'),
  Fire('fire'),
  Electric('electric'),
  Normal('normal'),
  Fairy('fairy'),
  Ground('ground'),
  Dragon('dragon'),
  Psychic('psychic');

  final dynamic value;
  const ElementalType(this.value);
}

class ElementalTypeLabelConfig {
  const ElementalTypeLabelConfig({required this.mainColor, required this.lightColor, required this.darkColor, required this.textKey});

  final Color mainColor;
  final Color lightColor;
  final Color darkColor;
  final String textKey;
}
