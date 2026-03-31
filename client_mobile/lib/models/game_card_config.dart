import 'dart:ui';

import 'package:client_mobile/models/ui.dart';

enum GameCardColor { Blue, Green, Pink }

class GameCardConfig {
  final DefaultContainerConfig containerConfig;
  final Color buttonLightColor;
  final Color buttonMainColor;
  final Color buttonDarkColor;

  const GameCardConfig({required this.containerConfig, required this.buttonLightColor, required this.buttonMainColor, required this.buttonDarkColor});
}
