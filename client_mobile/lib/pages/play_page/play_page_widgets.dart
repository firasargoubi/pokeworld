import 'dart:convert';
import 'dart:math';
import 'dart:typed_data';

import 'package:client_mobile/consts/avatar_data_const.dart';
import 'package:client_mobile/consts/match_data_const.dart';
import 'package:client_mobile/consts/ui.dart';
import 'package:client_mobile/models/challenge_data.dart';
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

String formatThousands(int value) {
  final isNegative = value < 0;
  final raw = value.abs().toString();
  final buffer = StringBuffer();

  for (int index = 0; index < raw.length; index++) {
    final remaining = raw.length - index;
    buffer.write(raw[index]);
    if (remaining > 1 && remaining % 3 == 1) {
      buffer.write(',');
    }
  }

  return isNegative ? '-${buffer.toString()}' : buffer.toString();
}

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
    required this.selfChallenge,
    required this.isSelfTurn,
    required this.hasAction,
    required this.canEndTurn,
    required this.onSurrender,
  });

  final double baseBodySize;
  final double panelGapY;

  final GameData gameData;
  final PlayerData selfPlayer;
  final PlayerChallengeData? selfChallenge;

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
            aspectRatio: 380 / 175,
            child: InfoPanel(baseBodySize: baseBodySize, gameData: gameData, onSurrender: onSurrender),
          ),
          SizedBox(height: panelGapY),
          AspectRatio(
            aspectRatio: 380 / 280,
            child: SelfPanel(baseBodySize: baseBodySize, selfPlayer: selfPlayer, isSelfTurn: isSelfTurn),
          ),
          if (selfChallenge != null) ...[
            SizedBox(height: panelGapY),
            AspectRatio(
              aspectRatio: 380 / 155,
              child: ChallengePanel(baseBodySize: baseBodySize, challenge: selfChallenge!),
            ),
          ],
          SizedBox(height: panelGapY),
          Expanded(
            child: BottomButtons(baseBodySize: baseBodySize, isSelfTurn: isSelfTurn, hasAction: hasAction, canEndTurn: canEndTurn),
          ),
        ],
      ),
    );
  }
}

class ChallengePanel extends StatelessWidget {
  const ChallengePanel({super.key, required this.baseBodySize, required this.challenge});

  final double baseBodySize;
  final PlayerChallengeData challenge;

  @override
  Widget build(BuildContext context) {
    final titleSize = baseBodySize * 0.027;
    final nameSize = baseBodySize * 0.025;
    final descSize = baseBodySize * 0.022;
    final progressSize = baseBodySize * 0.020;
    final challengeGrayColor = const Color(0xFF585851);
    final challengeGreenColor = const Color(0xFF1E8A4C);
    final rewardText = formatThousands(challenge.cashGain);

    final maxTarget = max(1, challenge.target);
    final rawProgress = max(0, challenge.progress);
    final progressRatio = (rawProgress / maxTarget).clamp(0.0, 1.0);

    final i18n = I18nService();

    return Container(
      decoration: BoxDecoration(
        image: DecorationImage(
          image: AssetImage(challenge.isCompleted ? CHALLENGE_GREEN_CONTAINER_ASSET : CHALLENGE_CONTAINER_ASSET),
          fit: BoxFit.fill,
          filterQuality: FilterQuality.none,
        ),
      ),
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: baseBodySize * 0.035, vertical: baseBodySize * 0.02),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(i18n.translate(CHALLENGE_TITLE_KEY), style: pixelLineStyle(titleSize).copyWith(color: challengeGrayColor)),
                SizedBox(width: baseBodySize * 0.006),
                SizedBox(
                  child: Text(
                    i18n.translate('challenges.names.${challenge.type.value}'),
                    style: pixelLineStyle(nameSize),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const Spacer(),
                Text('+$rewardText${String.fromCharCode(36)}', style: pixelLineStyle(nameSize).copyWith(color: challengeGreenColor)),
              ],
            ),
            SizedBox(height: baseBodySize * 0.006),
            SizedBox(height: baseBodySize * 0.004),
            Text(
              i18n.translate('challenges.descriptions.${challenge.type.value}', params: {'target': challenge.target}),
              style: pixelLineStyle(descSize).copyWith(color: challengeGrayColor),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const Spacer(),
            Row(
              children: [
                Expanded(
                  child: SizedBox(
                    width: baseBodySize * 0.4,
                    child: AspectRatio(
                      aspectRatio: 97 / 9,
                      child: ChallengeProgressBar(progressRatio: progressRatio, isCompleted: challenge.isCompleted),
                    ),
                  ),
                ),
                SizedBox(width: baseBodySize * 0.01),
                Text('$rawProgress/$maxTarget', style: pixelLineStyle(progressSize).copyWith(color: challengeGrayColor)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class ChallengeProgressBar extends StatelessWidget {
  const ChallengeProgressBar({super.key, required this.progressRatio, required this.isCompleted});

  final double progressRatio;
  final bool isCompleted;

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        Container(color: Colors.grey),
        FractionallySizedBox(
          alignment: Alignment.centerLeft,
          widthFactor: progressRatio,
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: isCompleted
                  ? const LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Color(0xFF2D9D48), Color(0xFF2D9D48), Color(0xFF269440), Color(0xFF269440), Color(0xFF1E7A35), Color(0xFF1E7A35)],
                      stops: [0.0, 0.35, 0.35, 0.65, 0.65, 1.0],
                    )
                  : const LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Color(0xFF3E73F9), Color(0xFF3E73F9), Color(0xFF3064EF), Color(0xFF3064EF), Color(0xFF2957C9), Color(0xFF2957C9)],
                      stops: [0.0, 0.35, 0.35, 0.65, 0.65, 1.0],
                    ),
            ),
          ),
        ),
        Image.asset(MOVEMENT_BAR_ASSET, fit: BoxFit.fill, filterQuality: FilterQuality.none),
      ],
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
            padding: EdgeInsets.symmetric(horizontal: panelWidth * 0.08, vertical: panelHeight * 0.1),
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
                  '${I18nService().translate(PLAYER_COUNT_LABEL_KEY)}${MatchService().matchData!.players.where((p) => p.isConnected).length} / ${MAP_SIZE_PLAYER_COUNT[gameData.mapData.size]}',
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

class ItemsSection extends StatefulWidget {
  const ItemsSection({super.key, required this.baseBodySize});

  final double baseBodySize;

  @override
  State<ItemsSection> createState() => _ItemsSectionState();
}

class _ItemsSectionState extends State<ItemsSection> {
  static const _slotCount = 2;

  final List<OverlayPortalController> _controllers = List.generate(_slotCount, (_) => OverlayPortalController());
  final List<LayerLink> _links = List.generate(_slotCount, (_) => LayerLink());
  final List<Object> _groupIds = List.generate(_slotCount, (_) => Object());

  void _toggleTooltip(int index) {
    for (var i = 0; i < _controllers.length; i++) {
      if (i == index) continue;
      if (_controllers[i].isShowing) _controllers[i].hide();
    }
    if (_controllers[index].isShowing) {
      _controllers[index].hide();
    } else {
      _controllers[index].show();
    }
  }

  void _hideTooltip(int index) {
    if (_controllers[index].isShowing) _controllers[index].hide();
  }

  @override
  Widget build(BuildContext context) {
    final gap = widget.baseBodySize * 0.02;
    final iconSize = widget.baseBodySize * 0.12;

    Widget itemSlot(int index, ItemType? item) {
      final slot = AspectRatio(
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

      final target = CompositedTransformTarget(link: _links[index], child: slot);

      if (item == null) return target;

      return OverlayPortal(
        controller: _controllers[index],
        overlayChildBuilder: (context) {
          return Positioned(
            left: 0,
            top: 0,
            child: CompositedTransformFollower(
              link: _links[index],
              targetAnchor: Alignment.topCenter,
              followerAnchor: Alignment.bottomCenter,
              offset: Offset(0, -widget.baseBodySize * 0.01),
              child: TapRegion(
                groupId: _groupIds[index],
                onTapOutside: (_) => _hideTooltip(index),
                child: ItemDescriptionTooltip(baseBodySize: widget.baseBodySize, item: item),
              ),
            ),
          );
        },
        child: TapRegion(
          groupId: _groupIds[index],
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () => _toggleTooltip(index),
            child: target,
          ),
        ),
      );
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        itemSlot(0, PlayService().getItem(MatchService().selfPlayer!.id, 0)),
        SizedBox(width: gap),
        itemSlot(1, PlayService().getItem(MatchService().selfPlayer!.id, 1)),
      ],
    );
  }
}

class ItemDescriptionTooltip extends StatelessWidget {
  const ItemDescriptionTooltip({super.key, required this.baseBodySize, required this.item});

  final double baseBodySize;
  final ItemType item;

  @override
  Widget build(BuildContext context) {
    final fontSize = baseBodySize * 0.022;
    final width = baseBodySize * 0.45;

    return Material(
      type: MaterialType.transparency,
      child: SizedBox(
        width: width,
        child: DecoratedBox(
          decoration: const BoxDecoration(
            image: DecorationImage(image: AssetImage(INFO_CONTAINER_ASSET), fit: BoxFit.fill, filterQuality: FilterQuality.none),
          ),
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: baseBodySize * 0.03, vertical: baseBodySize * 0.025),
            child: RichText(
              textAlign: TextAlign.center,
              text: _buildItemDescriptionSpan(
                item: item,
                baseStyle: pixelLineStyle(fontSize),
                boldStyle: pixelLineStyle(fontSize).copyWith(fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

TextSpan _buildItemDescriptionSpan({required ItemType item, required TextStyle baseStyle, required TextStyle boldStyle}) {
  final key = 'items.rightClick.${item.name.toLowerCase()}';
  final raw = I18nService().translate(key);
  final normalized = raw.replaceAll('<br/>', '\n').replaceAll('<br>', '\n');

  final spans = <TextSpan>[];
  final boldRegex = RegExp(r'<b>(.*?)</b>');
  int cursor = 0;
  for (final match in boldRegex.allMatches(normalized)) {
    if (match.start > cursor) {
      spans.add(TextSpan(text: normalized.substring(cursor, match.start), style: baseStyle));
    }
    spans.add(TextSpan(text: match.group(1), style: boldStyle));
    cursor = match.end;
  }
  if (cursor < normalized.length) {
    spans.add(TextSpan(text: normalized.substring(cursor), style: baseStyle));
  }

  return TextSpan(children: spans);
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

    final gap = baseBodySize * 0.01;

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
          text:
              '${I18nService().translate(ACTION_KEY)} ${MatchService().matchData!.playData.actionsLeft}/${MatchService().matchData!.gameData.mapData.maxActions}',
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
