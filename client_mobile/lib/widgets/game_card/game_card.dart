import 'dart:convert';
import 'dart:typed_data';

import 'package:client_mobile/consts/game_card.dart';
import 'package:client_mobile/consts/player_data_const.dart';
import 'package:client_mobile/models/game_card_config.dart';
import 'package:client_mobile/models/game_data.dart';
import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/widgets/pressable_background/pressable_background.dart';
import 'package:flutter/material.dart';

import 'game_card_const.dart';

class GameCard extends StatelessWidget {
  const GameCard({super.key, required this.isCreateCard, required this.game, required this.onTap, this.matchData});

  final bool isCreateCard;
  final GameData game;
  final VoidCallback onTap;
  final MatchData? matchData;

  static List<Shadow> pixelShadow(double cardWidth, double factor) => [
    Shadow(offset: Offset(cardWidth * factor, 0), color: GAME_CARD_SHADOW_COLOR, blurRadius: 0),
  ];

  static TextStyle cornerLabelStyle(double cardWidth) => TextStyle(
    fontFamily: GAME_CARD_PIXEL_FONT,
    color: Colors.white,
    fontSize: cardWidth * 0.13,
    height: 0.8,
    shadows: pixelShadow(cardWidth, 0.012),
  );

  static TextStyle infoStyle(double cardWidth, double cardHeight) => TextStyle(
    fontFamily: GAME_CARD_PIXEL_FONT,
    color: Colors.white,
    fontSize: cardWidth * 0.07,
    height: cardHeight * 0.003,
    shadows: pixelShadow(cardWidth, 0.007),
  );

  static TextStyle buttonTextStyle(double cardWidth) => TextStyle(
    fontFamily: GAME_CARD_PIXEL_FONT,
    color: Colors.white,
    fontSize: cardWidth * 0.09,
    height: 0.9,
    shadows: pixelShadow(cardWidth, 0.008),
  );

  static TextStyle subtitleStyle(double cardWidth) => TextStyle(
    fontFamily: GAME_CARD_PIXEL_FONT,
    color: Colors.white,
    fontSize: cardWidth * 0.08,
    height: 0.8,
    shadows: pixelShadow(cardWidth, 0.012),
  );

  static TextStyle ownerStyle(double cardWidth) => TextStyle(
    fontFamily: GAME_CARD_PIXEL_FONT,
    color: const Color.fromARGB(255, 80, 78, 78),
    fontSize: cardWidth * 0.08,
    height: 0.8,
    shadows: [Shadow(offset: Offset(cardWidth * 0.01, 0), color: const Color.fromARGB(255, 221, 221, 221), blurRadius: 0)],
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

  Uint8List decodeThumbnail(String thumb) {
    final base64Part = thumb.contains(',') ? thumb.split(',').last : thumb;
    return base64Decode(base64Part);
  }

  @override
  Widget build(BuildContext context) {
    final config = game.mapData.size == MapSize.Small
        ? GAME_CARD_CONFIGS[GameCardColor.Blue]!
        : game.mapData.size == MapSize.Medium
        ? GAME_CARD_CONFIGS[GameCardColor.Green]!
        : GAME_CARD_CONFIGS[GameCardColor.Pink]!;

    final i18n = I18nService();
    final buttonKey = isCreateCard ? GAME_CARD_CREATE_BUTTON_KEY : GAME_CARD_JOIN_BUTTON_KEY;
    final cardButtonText = i18n.translate(buttonKey);

    final nameText = game.name;
    final sizeText = '${game.mapData.size.value}x${game.mapData.size.value}';

    final bytes = decodeThumbnail(game.thumbnail);

    final isFFA = game.mapData.gameMode == GameMode.FFA;

    final activePlayerCount = matchData?.players.where((player) => player.isConnected).length ?? 0;
    final maxPlayers = MAX_PLAYERS[game.mapData.size] ?? 0;
    final code = matchData?.code ?? '';
    final isWaiting = (matchData?.state ?? MatchState.Lobby) == MatchState.Lobby;

    final infoText = isCreateCard
        ? formatDate(game.lastEdited)
        : '$activePlayerCount/$maxPlayers ${i18n.translate(GAME_CARD_PLAYERS_LABEL_KEY)}  ${i18n.translate(GAME_CARD_CODE_LABEL_KEY)}: $code';

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
                      errorBuilder: (_, _, _) => const Center(child: Icon(Icons.broken_image)),
                    ),
                  ),
                  Positioned(
                    left: cardWidth * 0.02,
                    top: cardWidth * 0.02,
                    width: cardWidth * 0.9,
                    child: Text(nameText, style: cornerLabelStyle(cardWidth), softWrap: true),
                  ),
                  Positioned(
                    left: cardWidth * 0.02,
                    top: cardWidth * 0.15,
                    width: cardWidth * 0.9,
                    child: Text(
                      game.owner != null ? '${i18n.translate(GAME_CARD_OWNER_LABEL_KEY)} ${game.owner!.userName}' : '',
                      style: ownerStyle(cardWidth * 0.8),
                      softWrap: true,
                      overflow: TextOverflow.ellipsis,
                    ),
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
                        isWaiting ? GAME_CARD_WAIT_ICON_ASSET : GAME_CARD_LIVE_ICON_ASSET,
                        fit: BoxFit.contain,
                        filterQuality: FilterQuality.none,
                        alignment: Alignment.bottomLeft,
                      ),
                    ),
                ],
              ),
            ),
            Image.asset(config.backgroundImage, fit: BoxFit.fill, filterQuality: FilterQuality.none),
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
                                  isFFA ? GAME_CARD_FFA_ICON_ASSET : GAME_CARD_CTF_ICON_ASSET,
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
                            padding: EdgeInsets.symmetric(horizontal: cardWidth * 0.03),
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
                        child: SizedBox(
                          width: cardWidth * 0.39,
                          height: cardHeight * 0.12,
                          child: PressableBackground(
                            backgroundAsset: config.buttonImage,
                            activeBackgroundAsset: config.buttonImageActive,
                            onTap: onTap,
                            text: cardButtonText,
                            textStyle: buttonTextStyle(cardWidth),
                            activeTextStyle: buttonTextStyle(cardWidth),
                          ),
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
