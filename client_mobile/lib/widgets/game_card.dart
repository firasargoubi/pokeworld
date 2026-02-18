import 'dart:convert';
import 'dart:typed_data';

import 'package:client_mobile/consts/game_card.dart';
import 'package:client_mobile/models/game_card_config.dart';
import 'package:client_mobile/models/game_data.dart';
import 'package:client_mobile/models/map_data.dart';
import 'package:flutter/material.dart';

class GameCard extends StatelessWidget {
  const GameCard({super.key, required this.isCreateCard, required this.game});

  final bool isCreateCard;
  final GameData game;

  static const String pixelFont = 'Pixel';
  static const Color shadowColor = Color(0xFF787878);

  static const String waitIconAsset =
      'assets/images/menu/containers/game/wait-icon.png';
  static const String liveIconAsset =
      'assets/images/menu/containers/game/icon-live.png';
  static const String ffaIconAsset =
      'assets/images/menu/containers/game/FFA-icon.png';
  static const String ctfIconAsset =
      'assets/images/menu/containers/game/CTF-icon.png';

  static const String joinButtonText = 'JOINDRE';
  static const String createButtonText = 'CRÉER';

  static const bool defaultIsWaiting = true;
  static const String defaultCountPlayers = '1/4';
  static const String defaultCode = '6969';

  static List<Shadow> pixelShadow(double cardWidth, double factor) => [
    Shadow(
      offset: Offset(cardWidth * factor, 0),
      color: shadowColor,
      blurRadius: 0,
    ),
  ];

  static TextStyle cornerLabelStyle(double cardWidth) => TextStyle(
    fontFamily: pixelFont,
    color: Colors.white,
    fontSize: cardWidth * 0.13,
    height: 0.8,
    shadows: pixelShadow(cardWidth, 0.012),
  );

  static TextStyle infoStyle(double cardWidth, double cardHeight) => TextStyle(
    fontFamily: pixelFont,
    color: Colors.white,
    fontSize: cardWidth * 0.07,
    height: cardHeight * 0.003,
    shadows: pixelShadow(cardWidth, 0.007),
  );

  static TextStyle buttonTextStyle(double cardWidth) => TextStyle(
    fontFamily: pixelFont,
    color: Colors.white,
    fontSize: cardWidth * 0.09,
    height: 0.9,
    shadows: pixelShadow(cardWidth, 0.008),
  );

  String formatDate(DateTime dt) {
    final local = dt.toLocal();
    final dd = local.day.toString().padLeft(2, '0');
    final mm = local.month.toString().padLeft(2, '0');
    final yyyy = local.year.toString();
    final hh = local.hour.toString().padLeft(2, '0');
    final min = local.minute.toString().padLeft(2, '0');
    return '$dd/$mm/$yyyy $hh:$min';
  }

  Uint8List _decodeThumbnail(String thumb) {
    final base64Part = thumb.contains(',') ? thumb.split(',').last : thumb;
    return base64Decode(base64Part);
  }

  @override
  Widget build(BuildContext context) {
    final config = game.mapData.size == MapSize.small
        ? GAME_CARD_CONFIGS[GameCardColor.blue]!
        : game.mapData.size == MapSize.medium
        ? GAME_CARD_CONFIGS[GameCardColor.green]!
        : GAME_CARD_CONFIGS[GameCardColor.pink]!;

    final cardButtonText = isCreateCard ? createButtonText : joinButtonText;

    final nameText = game.name;
    final sizeText = '${game.mapData.size.value}x${game.mapData.size.value}';

    final bytes = _decodeThumbnail(game.thumbnail);

    final isFFA = game.mapData.gameMode == GameMode.ffa;

    final isWaiting = defaultIsWaiting;
    final countPlayers = defaultCountPlayers;
    final code = defaultCode;

    final infoText = isCreateCard
        ? formatDate(game.lastEdited)
        : '$countPlayers Joueurs  Code: $code';

    return LayoutBuilder(
      builder: (context, constraints) {
        final cardWidth = constraints.maxWidth;
        final cardHeight = constraints.maxHeight;

        return Stack(
          fit: StackFit.expand,
          clipBehavior: Clip.none,
          children: [
            Positioned(
              left: cardWidth * 0.089,
              top: cardHeight * 0.073,
              width: cardWidth * 0.823,
              height: cardWidth * 0.685,
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  Positioned.fill(
                    child: Image.memory(
                      bytes,
                      gaplessPlayback: true,
                      fit: BoxFit.fitWidth,
                      filterQuality: FilterQuality.none,
                      alignment: Alignment.center,
                      errorBuilder: (_, _, _) =>
                          const Center(child: Icon(Icons.broken_image)),
                    ),
                  ),

                  Positioned(
                    left: cardWidth * 0.02,
                    top: cardWidth * 0.02,
                    child: Text(nameText, style: cornerLabelStyle(cardWidth)),
                  ),
                  Positioned(
                    right: cardWidth * 0.02,
                    bottom: cardWidth * 0.02,
                    child: Text(sizeText, style: cornerLabelStyle(cardWidth)),
                  ),
                  if (!isCreateCard)
                    Positioned(
                      left: cardWidth * 0.02,
                      bottom: cardWidth * 0.02,
                      width: cardWidth * 0.13,
                      height: cardWidth * 0.10,
                      child: Image.asset(
                        isWaiting ? waitIconAsset : liveIconAsset,
                        fit: BoxFit.contain,
                        filterQuality: FilterQuality.none,
                        alignment: Alignment.bottomLeft,
                      ),
                    ),
                ],
              ),
            ),

            Image.asset(
              config.backgroundImage,
              fit: BoxFit.fill,
              filterQuality: FilterQuality.none,
            ),

            Positioned(
              left: cardWidth * 0.089,
              bottom: cardHeight * 0.073,
              width: cardWidth * 0.823,
              height: cardHeight * 0.25,
              child: Column(
                children: [
                  Expanded(
                    flex: 1,
                    child: Row(
                      children: [
                        Expanded(
                          flex: 2,
                          child: Align(
                            alignment: Alignment.centerLeft,
                            child: Padding(
                              padding: EdgeInsets.only(left: cardWidth * 0.03),
                              child: SizedBox(
                                width: cardWidth * 0.23,
                                child: Image.asset(
                                  isFFA ? ffaIconAsset : ctfIconAsset,
                                  fit: BoxFit.cover,
                                  filterQuality: FilterQuality.none,
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          flex: 3,
                          child: Container(
                            alignment: Alignment.centerLeft,
                            padding: EdgeInsets.symmetric(
                              horizontal: cardWidth * 0.03,
                            ),
                            child: Text(
                              infoText,
                              style: infoStyle(cardWidth, cardHeight),
                              softWrap: true,
                              overflow: TextOverflow.visible,
                              textAlign: TextAlign.right,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    flex: 1,
                    child: Align(
                      alignment: Alignment.topCenter,
                      child: Padding(
                        padding: EdgeInsets.only(left: cardWidth * 0.03),
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            SizedBox(
                              width: cardWidth * 0.35,
                              child: Image.asset(
                                config.buttonImage,
                                fit: BoxFit.contain,
                                filterQuality: FilterQuality.none,
                              ),
                            ),
                            Text(
                              cardButtonText,
                              style: buttonTextStyle(cardWidth),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}
