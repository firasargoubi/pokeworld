import 'dart:math';

import 'package:client_mobile/consts/avatar_data_const.dart';
import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/models/player_data.dart';
import 'package:client_mobile/models/ui.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/lobby_service/lobby_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/services/preferences_service/preferences_service.dart';
import 'package:flutter/foundation.dart';
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
  late final PreferencesService _preferencesService;

  bool _isInactivePressed = false;
  bool _isActionPressed = false;

  void _setActionPressed(bool pressed) {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    if (_isActionPressed == pressed) return;
    setState(() => _isActionPressed = pressed);
  }

  void _setInactivePressed(bool pressed) {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    if (_isInactivePressed == pressed || !isViewerHost) return;
    setState(() => _isInactivePressed = pressed);
    if (!pressed) {
      widget.onActionTap?.call();
    }
  }

  @override
  void initState() {
    super.initState();
    _preferencesService = PreferencesService();
    _preferencesService.equippedButtonNotifier.addListener(_handleEquippedButtonChange);
    _initFromPlayerData();
  }

  @override
  void dispose() {
    _preferencesService.equippedButtonNotifier.removeListener(_handleEquippedButtonChange);
    super.dispose();
  }

  void _handleEquippedButtonChange() {
    if (!mounted) return;
    setState(() {});
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

    userProfilePictureAsset = player?.profilePicture ?? "";
    if (kDebugMode) {
      print('PlayerCard: userProfilePictureAsset set to ${player?.userId}');
    }

    final playerType = player?.type;
    isBot = playerType != null && playerType != PlayerType.Player;
    isAggressiveBot = playerType == PlayerType.BotAggressive;

    isSelf = MatchService().selfId == player?.id;
    isAdmin = MatchService().isPlayerHost(player?.id);

    isViewerHost = matchData?.lobbyData.hostPlayerIndex == MatchService().selfIndex;

    isInactive = !(player?.isConnected ?? false);
    inactiveLabel = isViewerHost ? I18nService().translate(INACTIVE_LABEL_KEY) : '';
  }

  static ColorFilter brightnessFilter(double brightness) {
    return ColorFilter.matrix(<double>[brightness, 0, 0, 0, 0, 0, brightness, 0, 0, 0, 0, 0, brightness, 0, 0, 0, 0, 0, 1, 0]);
  }

  static DefaultContainerConfig resolveCardAssets({
    required bool isInactive,
    required bool isSelf,
    required bool isBot,
    required bool isAggressiveBot,
    required bool isAdmin,
  }) {
    if (isInactive) {
      return BLUE_CONTAINER_CONFIG;
    }

    return isSelf
        ? PINK_CONTAINER_CONFIG
        : isBot
        ? GRAY_CONTAINER_CONFIG
        : BLUE_CONTAINER_CONFIG;
  }

  static String resolveCardIcon({
    required bool isInactive,
    required bool isSelf,
    required bool isBot,
    required bool isAggressiveBot,
    required bool isAdmin,
  }) {
    if (isInactive) {
      return '';
    }
    return isAdmin
        ? CROWN_ASSET
        : isBot
        ? (isAggressiveBot ? AGGRESSIVE_BOT_ASSET : DEFENSIVE_BOT_ASSET)
        : '';
  }

  @override
  Widget build(BuildContext context) {
    final config = resolveCardAssets(isInactive: isInactive, isSelf: isSelf, isBot: isBot, isAggressiveBot: isAggressiveBot, isAdmin: isAdmin);
    final assets = resolveCardIcon(isInactive: isInactive, isSelf: isSelf, isBot: isBot, isAggressiveBot: isAggressiveBot, isAdmin: isAdmin);

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

        final String pokeBallAsset = _preferencesService.getEquippedBallAsset(active: false);

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
                usernameIcon: assets,
                userProfilePicture: userProfilePictureAsset,
                containerConfig: config,
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
                          ? Transform.scale(
                              scale: 1.1,
                              child: Image.asset(pokeBallAsset, fit: BoxFit.fitWidth, filterQuality: FilterQuality.none),
                            )
                          : ColorFiltered(
                              colorFilter: pokeBallFilter,
                              child: Transform.scale(
                                scale: 1.1,
                                child: Image.asset(pokeBallAsset, fit: BoxFit.fitWidth, filterQuality: FilterQuality.none),
                              ),
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
