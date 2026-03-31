import 'package:client_mobile/models/ui.dart';
import 'package:flutter/material.dart';

const String GAME_CARD_PIXEL_FONT = 'Pixel';

const Color GAME_CARD_SHADOW_COLOR = Color(0xFF787878);

const String GAME_CARD_WAIT_ICON_ASSET = 'assets/images/menu/containers/game/wait-icon.png';
const String GAME_CARD_LIVE_ICON_ASSET = 'assets/images/menu/containers/game/icon-live.png';
const String GAME_CARD_FFA_ICON_ASSET = 'assets/images/menu/containers/game/FFA-icon.png';
const String GAME_CARD_CTF_ICON_ASSET = 'assets/images/menu/containers/game/CTF-icon.png';

const String GAME_CARD_JOIN_BUTTON_KEY = 'components.gameCard.join';
const String GAME_CARD_CREATE_BUTTON_KEY = 'components.gameCard.play';
const String GAME_CARD_PLAYERS_LABEL_KEY = 'components.gameCard.players';
const String GAME_CARD_CODE_LABEL_KEY = 'components.gameCard.code';
const String GAME_CARD_OWNER_LABEL_KEY = 'components.gameCard.owner';

const CONTAINER_CONFIG = DefaultContainerConfig(
  borderWidthFactor: 0.05,
  innerBorderWidthFactor: 0.04,
  separatorHeightFactor: 0.04,
  backgroundRatio: 0.67,
  borderColor: Color(0xFFf87030),
  innerBorderBottomRightColor: Color(0xFF616161),
  innerBorderTopLeftColor: Color(0xFFacacac),
  backgroundTopColor: Color(0xFF888888),
  backgroundBottomColor: Color(0xFFacacac),
);
