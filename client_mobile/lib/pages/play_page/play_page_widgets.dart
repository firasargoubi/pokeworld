import 'dart:convert';
import 'dart:math';
import 'dart:typed_data';

import 'package:client_mobile/consts/avatar_data_const.dart';
import 'package:client_mobile/consts/match_data_const.dart';
import 'package:client_mobile/consts/ui.dart';
import 'package:client_mobile/models/game_data.dart';
import 'package:client_mobile/models/item_type.dart';
import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/models/player_data.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/services/play_service/play_service.dart';
import 'package:client_mobile/utils/profile_image_provider.dart';
import 'package:client_mobile/widgets/chat/chat.dart';
import 'package:client_mobile/widgets/map/map.dart';
import 'package:client_mobile/widgets/pressable_background/pressable_background.dart';
import 'package:client_mobile/widgets/user_profile_image/user_profile_image.dart';
import 'package:flutter/material.dart';

import 'play_page_const.dart';

Uint8List decodeThumbnail(String thumb) {
  final base64Part = thumb.contains(',') ? thumb.split(',').last : thumb;
  return base64Decode(base64Part);
}

DecorationImage? backgroundFromThumbnail(String thumbnail) {
  if (thumbnail.isEmpty) return null;
  return DecorationImage(image: MemoryImage(decodeThumbnail(thumbnail)), fit: BoxFit.cover, filterQuality: FilterQuality.none);
}

TextStyle pixelLineStyle(double fontSize) => TextStyle(
  fontFamily: PIXEL_FONT,
  color: Colors.black,
  fontSize: fontSize,
  height: 1.1,
  shadows: [Shadow(offset: Offset(fontSize * 0.05, 0), color: PIXEL_SHADOW_COLOR, blurRadius: 0)],
);

class LeftPanel extends StatelessWidget {
  const LeftPanel({super.key, required this.baseBodySize, required this.players, required this.activePlayerIndex});

  final double baseBodySize;
  final List<PlayerData> players;
  final int activePlayerIndex;

  @override
  Widget build(BuildContext context) {
    final leftWidth = baseBodySize * 0.04;
    final gapY = baseBodySize * 0.01;
    final textSize = baseBodySize * 0.025;
    final iconSize = baseBodySize * 0.04;

    return LayoutBuilder(
      builder: (context, constraints) {
        final panelWidth = constraints.maxWidth;
        final rightWidth = max(0.0, panelWidth - leftWidth);

        final itemHeight = rightWidth <= 0 ? 0.0 : rightWidth / PLAYER_ITEM_ASPECT_RATIO;
        final totalHeight = players.isEmpty ? 0.0 : players.length * itemHeight + (players.length - 1) * gapY;

        final indicatorSize = min(leftWidth, itemHeight);
        final safeIndex = players.isEmpty ? 0 : activePlayerIndex.clamp(0, players.length - 1);

        final rawTop = safeIndex * (itemHeight + gapY) + (itemHeight - indicatorSize) / 2;
        final top = totalHeight <= indicatorSize ? 0.0 : rawTop.clamp(0.0, totalHeight - indicatorSize);

        return Align(
          alignment: Alignment.topLeft,
          child: SizedBox(
            width: double.infinity,
            height: constraints.maxHeight,
            child: Stack(
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      width: leftWidth,
                      height: totalHeight,
                      child: Stack(
                        children: [
                          Positioned(
                            top: top,
                            left: (leftWidth - indicatorSize) / 2,
                            child: SizedBox(
                              width: indicatorSize,
                              height: indicatorSize,
                              child: Image.asset(SELECTION_ICON_ASSET, fit: BoxFit.contain, filterQuality: FilterQuality.none),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Column(
                        children: [
                          ...List.generate(players.length, (index) {
                            final player = players[index];

                            final avatarAsset = AVATAR_DATA[player.avatar]!.image;

                            final playerIcon = player.type == PlayerType.BotAggressive
                                ? AGGRESSIVE_BOT_ICON_ASSET
                                : player.type == PlayerType.BotDefensive
                                ? DEFENSIVE_BOT_ICON_ASSET
                                : MatchService().isPlayerHost(player.id)
                                ? CROWN_ICON_ASSET
                                : '';

                            final containerAsset = player.team == Team.Red
                                ? RED_CONTAINER_ASSET
                                : player.team == Team.Blue
                                ? BLUE_CONTAINER_ASSET
                                : GRAY_CONTAINER_ASSET;

                            final isConnected = player.isConnected;
                            final opacity = isConnected ? 1.0 : 0.6;

                            final nameStyle = pixelLineStyle(
                              textSize,
                            ).copyWith(decoration: isConnected ? TextDecoration.none : TextDecoration.lineThrough);

                            final isFFA = MatchService().matchData?.gameData.mapData.gameMode == GameMode.FFA;
                            final isRapidElimination = MatchService().matchData?.lobbyData.isRapidElimination ?? false;

                            return Opacity(
                              opacity: opacity,
                              child: Padding(
                                padding: EdgeInsets.only(bottom: index == players.length - 1 ? 0 : gapY),
                                child: SizedBox(
                                  width: double.infinity,
                                  child: AspectRatio(
                                    aspectRatio: PLAYER_ITEM_ASPECT_RATIO,
                                    child: DecoratedBox(
                                      decoration: BoxDecoration(
                                        image: DecorationImage(
                                          image: AssetImage(containerAsset),
                                          fit: BoxFit.fill,
                                          filterQuality: FilterQuality.none,
                                        ),
                                      ),
                                      child: Padding(
                                        padding: EdgeInsets.symmetric(horizontal: baseBodySize * 0.02),
                                        child: Row(
                                          crossAxisAlignment: CrossAxisAlignment.center,
                                          children: [
                                            SizedBox(
                                              width: iconSize,
                                              height: iconSize,
                                              child: DecoratedBox(
                                                decoration: BoxDecoration(image: DecorationImage(image: AssetImage(avatarAsset))),
                                              ),
                                            ),
                                            SizedBox(width: baseBodySize * 0.01),
                                            Text(player.name, style: nameStyle),
                                            SizedBox(width: baseBodySize * 0.01),
                                            SizedBox(
                                              width: textSize,
                                              height: textSize,
                                              child: LayeredProfileImage(foregroundImage: profilePictureImageProvider(player.profilePicture)),
                                            ),
                                            SizedBox(width: baseBodySize * 0.006),
                                            if (playerIcon.isNotEmpty)
                                              SizedBox(
                                                width: textSize,
                                                height: textSize,
                                                child: DecoratedBox(
                                                  decoration: BoxDecoration(image: DecorationImage(image: AssetImage(playerIcon))),
                                                ),
                                              ),
                                            const Spacer(),
                                            SizedBox(
                                              width: iconSize,
                                              height: iconSize,
                                              child: DecoratedBox(
                                                decoration: BoxDecoration(
                                                  image: DecorationImage(
                                                    image: AssetImage(
                                                      PlayService().hasItem(player.id, ItemType.Flag) ? ItemType.Flag.assetPath : DEFAULT_IMAGE_ASSET,
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ),
                                            SizedBox(width: baseBodySize * 0.005),
                                            if (player.isObserver)
                                              SizedBox(
                                                width: iconSize,
                                                height: iconSize,
                                                child: ColorFiltered(
                                                  colorFilter: const ColorFilter.mode(Color(0xFFD32F2F), BlendMode.srcIn),
                                                  child: DecoratedBox(
                                                    decoration: BoxDecoration(image: DecorationImage(image: AssetImage(SKULL_ICON_ASSET))),
                                                  ),
                                                ),
                                              ),
                                            if (player.isObserver) SizedBox(width: baseBodySize * 0.005),
                                            SizedBox(
                                              width: iconSize,
                                              height: iconSize,
                                              child: DecoratedBox(
                                                decoration: BoxDecoration(image: DecorationImage(image: AssetImage(SWORD_ICON_ASSET))),
                                              ),
                                            ),
                                            SizedBox(width: baseBodySize * 0.005),
                                            Text('${player.combatsWon}${isFFA && !isRapidElimination ? "/3" : ""}', style: pixelLineStyle(textSize)),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            );
                          }),
                        ],
                      ),
                    ),
                  ],
                ),
                Builder(
                  builder: (context) {
                    final keyboardHeight = MediaQuery.of(context).viewInsets.bottom + baseBodySize * 0.18;
                    final screenHeight = MediaQuery.of(context).size.height;
                    final panelBottomFromScreen = max(0.0, screenHeight - constraints.maxHeight);
                    final keyboardIntrusion = max(0.0, keyboardHeight - panelBottomFromScreen);

                    final minChatHeight = baseBodySize * 0.18;
                    final naturalHeight = (constraints.maxHeight - totalHeight - gapY).clamp(minChatHeight, constraints.maxHeight);
                    final chatHeight = (constraints.maxHeight - keyboardIntrusion).clamp(minChatHeight, naturalHeight);

                    return Positioned(
                      bottom: keyboardIntrusion,
                      left: leftWidth,
                      right: 0.0,
                      height: chatHeight,
                      child: Chat(baseSize: baseBodySize * 0.1, showMatchChannel: true),
                    );
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class MapPanel extends StatelessWidget {
  const MapPanel({super.key, required this.matchData, required this.baseSize});

  final MatchData matchData;
  final double baseSize;

  @override
  Widget build(BuildContext context) {
    return Container(
      alignment: Alignment.center,
      child: MapWidget(matchData: matchData, baseSize: baseSize),
    );
  }
}

class RightPanel extends StatelessWidget {
  const RightPanel({
    super.key,
    required this.baseBodySize,
    required this.panelGapY,
    required this.gameData,
    required this.selfPlayer,
    required this.isSelfTurn,
    required this.hasAction,
    required this.canEndTurn,
    required this.onSurrender,
  });

  final double baseBodySize;
  final double panelGapY;

  final GameData gameData;
  final PlayerData selfPlayer;

  final bool isSelfTurn;
  final bool hasAction;
  final bool canEndTurn;

  final VoidCallback onSurrender;

  @override
  Widget build(BuildContext context) {
    return ClipRect(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AspectRatio(
            aspectRatio: 380 / 230,
            child: InfoPanel(baseBodySize: baseBodySize, gameData: gameData, onSurrender: onSurrender),
          ),
          SizedBox(height: panelGapY),
          AspectRatio(
            aspectRatio: 380 / 350,
            child: SelfPanel(baseBodySize: baseBodySize, selfPlayer: selfPlayer, isSelfTurn: isSelfTurn),
          ),
          SizedBox(height: panelGapY),
          Expanded(
            child: BottomButtons(baseBodySize: baseBodySize, isSelfTurn: isSelfTurn, hasAction: hasAction, canEndTurn: canEndTurn),
          ),
        ],
      ),
    );
  }
}

class InfoPanel extends StatelessWidget {
  const InfoPanel({super.key, required this.baseBodySize, required this.gameData, required this.onSurrender});

  final double baseBodySize;
  final GameData gameData;
  final VoidCallback onSurrender;

  @override
  Widget build(BuildContext context) {
    final lineFontSize = baseBodySize * 0.03;
    final buttonFontSize = baseBodySize * 0.035;

    return DecoratedBox(
      decoration: const BoxDecoration(
        image: DecorationImage(image: AssetImage(INFO_CONTAINER_ASSET), fit: BoxFit.fill, filterQuality: FilterQuality.none),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final panelWidth = constraints.maxWidth;
          final panelHeight = constraints.maxHeight;

          final surrenderButtonHeight = baseBodySize * 0.065;

          return Padding(
            padding: EdgeInsets.symmetric(horizontal: panelWidth * 0.08, vertical: panelHeight * 0.12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${I18nService().translate(MAP_SIZE_LABEL_KEY)}${gameData.mapData.size.value}x${gameData.mapData.size.value}',
                  style: pixelLineStyle(lineFontSize),
                ),
                Text(
                  '${I18nService().translate(GAME_MODE_LABEL_KEY)}${gameData.mapData.gameMode.value}${MatchService().matchData!.playData.isDebugMode ? ' (DEBUG)' : ''}',
                  style: pixelLineStyle(lineFontSize),
                ),
                Text(
                  '${I18nService().translate(PLAYER_COUNT_LABEL_KEY)}${MatchService().matchData!.players.length} / ${MAP_SIZE_PLAYER_COUNT[gameData.mapData.size]}',
                  style: pixelLineStyle(lineFontSize),
                ),
                const Spacer(),
                Align(
                  alignment: Alignment.center,
                  child: SizedBox(
                    height: surrenderButtonHeight,
                    child: AspectRatio(
                      aspectRatio: SURRENDER_BUTTON_ASPECT_RATIO,
                      child: PressableBackground(
                        backgroundAsset: SURRENDER_BUTTON_ASSET,
                        activeBackgroundAsset: SURRENDER_BUTTON_ACTIVE_ASSET,
                        onTap: onSurrender,
                        text: I18nService().translate(SURRENDER_KEY),
                        textStyle: pixelLineStyle(buttonFontSize),
                        activeTextStyle: pixelLineStyle(buttonFontSize).copyWith(color: Colors.white),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class SelfPanel extends StatelessWidget {
  const SelfPanel({super.key, required this.baseBodySize, required this.selfPlayer, required this.isSelfTurn});

  final double baseBodySize;
  final PlayerData selfPlayer;
  final bool isSelfTurn;

  @override
  Widget build(BuildContext context) {
    final titleFontSize = baseBodySize * 0.035;

    return DecoratedBox(
      decoration: const BoxDecoration(
        image: DecorationImage(image: AssetImage(SELF_CONTAINER_ASSET), fit: BoxFit.fill, filterQuality: FilterQuality.none),
      ),
      child: Padding(
        padding: EdgeInsets.all(baseBodySize * 0.02),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              flex: 2,
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final headerHeight = constraints.maxHeight;
                  final sideGap = headerHeight * 0.2;
                  final avatarBoxWidth = headerHeight * 0.7;
                  final smallIconSize = headerHeight * 0.4;

                  final avatarAsset = AVATAR_DATA[selfPlayer.avatar]!.image;

                  return Row(
                    children: [
                      SizedBox(width: sideGap),
                      SizedBox(
                        width: avatarBoxWidth,
                        child: AspectRatio(
                          aspectRatio: 1,
                          child: Image.asset(avatarAsset, fit: BoxFit.contain, filterQuality: FilterQuality.none),
                        ),
                      ),
                      SizedBox(width: sideGap),
                      Text(selfPlayer.name, style: pixelLineStyle(titleFontSize)),
                      SizedBox(width: sideGap),
                      SizedBox(
                        width: smallIconSize,
                        height: smallIconSize,
                        child: LayeredProfileImage(foregroundImage: profilePictureImageProvider(selfPlayer.profilePicture)),
                      ),
                    ],
                  );
                },
              ),
            ),
            Expanded(
              flex: 3,
              child: MovementSection(baseBodySize: baseBodySize, isSelfTurn: isSelfTurn, maxSpeed: selfPlayer.speed),
            ),
            Expanded(flex: 4, child: ItemsSection(baseBodySize: baseBodySize)),
          ],
        ),
      ),
    );
  }
}

class MovementSection extends StatelessWidget {
  const MovementSection({super.key, required this.baseBodySize, required this.isSelfTurn, required this.maxSpeed});

  final double baseBodySize;
  final bool isSelfTurn;
  final int maxSpeed;

  int get movementLeft => isSelfTurn ? MatchService().matchData!.playData.movementLeft : 0;

  @override
  Widget build(BuildContext context) {
    final labelFontSize = baseBodySize * 0.035;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: baseBodySize * 0.02),
            child: Row(
              children: [
                Text(I18nService().translate(MOVEMENT_LABEL_KEY), style: pixelLineStyle(labelFontSize)),
                const Spacer(),
                Text('$movementLeft/$maxSpeed', style: pixelLineStyle(labelFontSize)),
              ],
            ),
          ),
        ),
        Expanded(
          child: Center(
            child: SizedBox(
              width: baseBodySize * 0.4,
              child: AspectRatio(
                aspectRatio: 97 / 9,
                child: MovementBar(isSelfTurn: isSelfTurn, maxSpeed: maxSpeed),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class MovementBar extends StatelessWidget {
  const MovementBar({super.key, required this.isSelfTurn, required this.maxSpeed});

  final bool isSelfTurn;
  final int maxSpeed;

  int get movementLeft => isSelfTurn ? MatchService().matchData!.playData.movementLeft : 0;

  @override
  Widget build(BuildContext context) {
    final maxSpeedDouble = maxSpeed.toDouble();
    final ratio = maxSpeedDouble <= 0 ? 0.0 : (movementLeft.toDouble() / maxSpeedDouble).clamp(0.0, 1.0);

    return Stack(
      fit: StackFit.expand,
      children: [
        Container(color: Colors.grey),
        FractionallySizedBox(
          alignment: Alignment.centerLeft,
          widthFactor: ratio,
          child: Container(color: Colors.blue),
        ),
        Image.asset(MOVEMENT_BAR_ASSET, fit: BoxFit.fill, filterQuality: FilterQuality.none),
      ],
    );
  }
}

class ItemsSection extends StatelessWidget {
  const ItemsSection({super.key, required this.baseBodySize});

  final double baseBodySize;

  @override
  Widget build(BuildContext context) {
    final gap = baseBodySize * 0.02;
    final iconSize = baseBodySize * 0.12;

    Widget itemSlot(ItemType? item) {
      return AspectRatio(
        aspectRatio: 1,
        child: DecoratedBox(
          decoration: const BoxDecoration(
            image: DecorationImage(image: AssetImage(ITEM_CONTAINER_ASSET), fit: BoxFit.fill, filterQuality: FilterQuality.none),
          ),
          child: Center(
            child: SizedBox(
              width: iconSize,
              height: iconSize,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  image: DecorationImage(
                    image: AssetImage(item?.assetPath ?? DEFAULT_IMAGE_ASSET),
                    fit: BoxFit.fill,
                    filterQuality: FilterQuality.none,
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        itemSlot(PlayService().getItem(MatchService().selfPlayer!.id, 0)),
        SizedBox(width: gap),
        itemSlot(PlayService().getItem(MatchService().selfPlayer!.id, 1)),
      ],
    );
  }
}

class BottomButtons extends StatelessWidget {
  const BottomButtons({super.key, required this.baseBodySize, required this.isSelfTurn, required this.hasAction, required this.canEndTurn});

  final double baseBodySize;
  final bool isSelfTurn;
  final bool hasAction;
  final bool canEndTurn;

  @override
  Widget build(BuildContext context) {
    final textStyle = TextStyle(color: Colors.white, fontFamily: PIXEL_FONT, fontSize: baseBodySize * 0.045, height: 1.0);
    final activeTextStyle = textStyle.copyWith(color: Colors.white);

    Widget imageButton({required String asset, required String activeAsset, required String text, required VoidCallback onTap}) {
      return AspectRatio(
        aspectRatio: BOTTOM_BUTTON_ASPECT_RATIO,
        child: PressableBackground(
          backgroundAsset: asset,
          activeBackgroundAsset: activeAsset,
          onTap: onTap,
          text: text,
          textStyle: textStyle,
          activeTextStyle: activeTextStyle,
        ),
      );
    }

    final gap = baseBodySize * 0.02;

    final actionAsset = hasAction ? ACTION_BUTTON_ASSET : DISABLED_BUTTON_ASSET;
    final actionActiveAsset = hasAction ? ACTION_BUTTON_ACTIVE_ASSET : DISABLED_BUTTON_ASSET;

    final endTurnAsset = canEndTurn ? END_TURN_BUTTON_ASSET : DISABLED_BUTTON_ASSET;
    final endTurnActiveAsset = canEndTurn ? END_TURN_BUTTON_ACTIVE_ASSET : DISABLED_BUTTON_ASSET;

    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        imageButton(
          asset: actionAsset,
          activeAsset: actionActiveAsset,
          text: I18nService().translate(ACTION_KEY),
          onTap: () {
            if (isSelfTurn && hasAction) {
              PlayService().displayActions();
            }
          },
        ),
        SizedBox(height: gap),
        imageButton(
          asset: endTurnAsset,
          activeAsset: endTurnActiveAsset,
          text: I18nService().translate(END_TURN_KEY),
          onTap: () {
            if (isSelfTurn) {
              PlayService().endTurn();
            }
          },
        ),
      ],
    );
  }
}
