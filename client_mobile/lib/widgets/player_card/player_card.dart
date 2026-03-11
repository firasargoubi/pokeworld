import 'dart:math';

import 'package:client_mobile/consts/avatar_data_const.dart';
import 'package:client_mobile/models/player_data.dart';
import 'package:client_mobile/services/lobby_service/lobby_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:flutter/material.dart';

import 'player_card_const.dart';
import 'player_card_widgets.dart';

class PlayerCard extends StatefulWidget {
  const PlayerCard({super.key, this.child, this.playerData, this.onActionTap});

  final Widget? child;
  final PlayerData? playerData;
  final VoidCallback? onActionTap;

  @override
  State<PlayerCard> createState() => _PlayerCardState();
}

class _PlayerCardState extends State<PlayerCard> {
  late String username;
  late String hpValue;
  late String avatarIconAsset;
  late String userProfilePictureAsset;
  late bool isBot;
  late bool isAggressiveBot;
  late bool isSelf;
  late bool isAdmin;
  late bool isViewerHost;
  late bool isInactive;
  late String inactiveLabel;

  bool _isInactivePressed = false;
  bool _isActionPressed = false;

  void _setActionPressed(bool pressed) {
    if (_isActionPressed == pressed) return;
    setState(() => _isActionPressed = pressed);
  }

  void _setInactivePressed(bool pressed) {
    if (_isInactivePressed == pressed || !isViewerHost) return;
    setState(() => _isInactivePressed = pressed);
    if (!pressed) {
      widget.onActionTap?.call();
    }
  }

  @override
  void initState() {
    super.initState();
    _initFromPlayerData();
  }

  @override
  void didUpdateWidget(covariant PlayerCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!mounted) return;
    setState(_initFromPlayerData);
  }

  void _initFromPlayerData() {
    final matchData = MatchService().matchData;

    final player = widget.playerData;

    username = player?.name ?? '';

    final health = player?.health ?? 0;
    hpValue = '$health/$health';

    avatarIconAsset = player != null ? (AVATAR_DATA[player.avatar]?.image ?? FALLBACK_AVATAR_ASSET) : FALLBACK_AVATAR_ASSET;

    userProfilePictureAsset = FALLBACK_AVATAR_ASSET;

    final playerType = player?.type;
    isBot = playerType != null && playerType != PlayerType.Player;
    isAggressiveBot = playerType == PlayerType.BotAggressive;

    isSelf = MatchService().selfId == player?.id;
    isAdmin = MatchService().isPlayerHost(player?.id);

    isViewerHost = matchData?.lobbyData.hostPlayerIndex == MatchService().selfIndex;

    isInactive = !(player?.isConnected ?? false);
    inactiveLabel = isViewerHost ? INACTIVE_LABEL_TEXT : '';
  }

  static ColorFilter brightnessFilter(double brightness) {
    return ColorFilter.matrix(<double>[brightness, 0, 0, 0, 0, 0, brightness, 0, 0, 0, 0, 0, brightness, 0, 0, 0, 0, 0, 1, 0]);
  }

  static ({String left, String mid, String right, String overlayIcon}) resolveCardAssets({
    required bool isInactive,
    required bool isSelf,
    required bool isBot,
    required bool isAggressiveBot,
    required bool isAdmin,
  }) {
    if (isInactive) {
      return (left: PLAYER_LEFT_ASSET, mid: PLAYER_MID_ASSET, right: PLAYER_RIGHT_ASSET, overlayIcon: '');
    }

    final (left, mid, right) = isSelf
        ? (SELF_LEFT_ASSET, SELF_MID_ASSET, SELF_RIGHT_ASSET)
        : isBot
        ? (BOT_LEFT_ASSET, BOT_MID_ASSET, BOT_RIGHT_ASSET)
        : (PLAYER_LEFT_ASSET, PLAYER_MID_ASSET, PLAYER_RIGHT_ASSET);

    final overlayIcon = isAdmin
        ? CROWN_ASSET
        : isBot
        ? (isAggressiveBot ? AGGRESSIVE_BOT_ASSET : DEFENSIVE_BOT_ASSET)
        : '';

    return (left: left, mid: mid, right: right, overlayIcon: overlayIcon);
  }

  @override
  Widget build(BuildContext context) {
    final assets = resolveCardAssets(isInactive: isInactive, isSelf: isSelf, isBot: isBot, isAggressiveBot: isAggressiveBot, isAdmin: isAdmin);

    return LayoutBuilder(
      builder: (context, constraints) {
        final cardWidth = constraints.maxWidth;
        final cardHeight = constraints.maxHeight;

        final leftMargin = cardHeight * LEFT_MARGIN_FACTOR;
        final rightMargin = cardHeight * RIGHT_MARGIN_FACTOR;

        final shouldShowKickButton = isViewerHost && !isSelf && !isInactive;

        final actionButtonWidth = shouldShowKickButton ? cardHeight * ACTION_BUTTON_WIDTH_TO_HEIGHT_RATIO : 0.0;

        final trailingRightMargin = shouldShowKickButton ? rightMargin : 0.0;

        final bodyWidth = max(0.0, cardWidth - leftMargin - rightMargin - actionButtonWidth - trailingRightMargin);

        final contentRow = Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SizedBox(width: leftMargin),
            SizedBox(
              width: bodyWidth,
              child: PlayerCardBody(
                isInactive: isInactive,
                inactiveLabel: inactiveLabel,
                username: username,
                hpValue: hpValue,
                usernameIcon: assets.overlayIcon,
                userProfilePicture: userProfilePictureAsset,
                leftAsset: assets.left,
                midAsset: assets.mid,
                rightAsset: assets.right,
                inactiveBodyFilter: isInactive ? brightnessFilter(INACTIVE_IMAGE_BRIGHTNESS) : null,
                child: isInactive ? null : widget.child,
              ),
            ),
            SizedBox(width: rightMargin),
            if (shouldShowKickButton) ...[
              SizedBox(
                width: actionButtonWidth,
                child: ActionButton(
                  isPressed: _isActionPressed,
                  onPressedChanged: _setActionPressed,
                  onTap: () => LobbyService().kickPlayer(widget.playerData?.id ?? ''),
                ),
              ),
              SizedBox(width: rightMargin),
            ],
          ],
        );

        final baseShiftX = isInactive ? cardHeight * INACTIVE_SHIFT_FACTOR : 0.0;
        final pressNudgeX = (isInactive && _isInactivePressed) ? -cardHeight * INACTIVE_PRESS_NUDGE_FACTOR : 0.0;
        final translateX = baseShiftX + pressNudgeX;

        final ColorFilter? pokeBallFilter = isInactive ? brightnessFilter(INACTIVE_IMAGE_BRIGHTNESS) : null;

        Widget card = SizedBox(
          width: cardWidth,
          height: cardHeight,
          child: Stack(
            clipBehavior: Clip.hardEdge,
            children: [
              Positioned.fill(child: contentRow),
              Positioned(
                left: 0,
                top: 0,
                width: cardHeight,
                height: cardHeight,
                child: Stack(
                  clipBehavior: Clip.hardEdge,
                  children: [
                    Positioned.fill(
                      child: pokeBallFilter == null
                          ? Image.asset(POKE_BALL_ASSET, fit: BoxFit.contain, filterQuality: FilterQuality.none)
                          : ColorFiltered(
                              colorFilter: pokeBallFilter,
                              child: Image.asset(POKE_BALL_ASSET, fit: BoxFit.contain, filterQuality: FilterQuality.none),
                            ),
                    ),

                    if (!isInactive)
                      Positioned.fill(
                        child: Image.asset(avatarIconAsset, fit: BoxFit.contain, filterQuality: FilterQuality.none),
                      ),
                  ],
                ),
              ),
            ],
          ),
        );

        card = GestureDetector(
          behavior: HitTestBehavior.translucent,
          onTapDown: isInactive ? (_) => _setInactivePressed(true) : null,
          onTapUp: isInactive ? (_) => _setInactivePressed(false) : null,
          onTapCancel: isInactive ? () => _setInactivePressed(false) : null,
          child: card,
        );

        return ClipRect(
          clipBehavior: Clip.hardEdge,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 130),
            curve: Curves.easeOut,
            transform: Matrix4.translationValues(translateX, 0, 0),
            child: card,
          ),
        );
      },
    );
  }
}
