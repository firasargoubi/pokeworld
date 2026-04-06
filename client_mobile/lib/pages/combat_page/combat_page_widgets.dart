import 'dart:async';
import 'dart:math';

import 'package:client_mobile/consts/battle_platfrom.dart';
import 'package:client_mobile/consts/elemental_type_const.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/models/player_data.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/utils/profile_image_provider.dart';
import 'package:client_mobile/widgets/pressable_background/pressable_background.dart';
import 'package:flutter/material.dart';

import 'combat_page_const.dart';

class SpriteAnimator {
  Offset offset = Offset.zero;
  Duration duration = const Duration(milliseconds: 0);
  ColorFilter? filter;

  int _moveToken = 0;
  int _filterToken = 0;

  void translate({required double dx, required double dy, required Duration duration, required VoidCallback onChanged}) {
    final token = ++_moveToken;

    offset += Offset(dx, dy);
    this.duration = duration;
    onChanged();

    Future.delayed(duration, () {
      if (token != _moveToken) return;
      offset = Offset.zero;
      this.duration = duration;
      onChanged();
    });
  }

  void setFilter({
    required Color? color,
    required Duration resetAfter,
    BlendMode blendMode = BlendMode.modulate,
    double opacity = 1.0,
    required VoidCallback onChanged,
  }) {
    final token = ++_filterToken;

    filter = (color == null) ? null : ColorFilter.mode(color.withValues(alpha: opacity.clamp(0.0, 1.0)), blendMode);
    onChanged();

    if (color == null) return;
    if (resetAfter <= Duration.zero) return;

    Future.delayed(resetAfter, () {
      if (token != _filterToken) return;
      filter = null;
      onChanged();
    });
  }
}

TextStyle pixelStyle(double fontSize) => TextStyle(fontFamily: PIXEL_FONT, color: PIXEL_TEXT_COLOR, fontSize: fontSize, height: 1.0);

TextStyle footerStyle(double fontSize) => TextStyle(fontFamily: PIXEL_FONT, color: FOOTER_TEXT_COLOR, fontSize: fontSize, height: 1.0);
TextStyle footerSubStyle(double fontSize) => TextStyle(fontFamily: PIXEL_FONT, color: FOOTER_SUB_TEXT_COLOR, fontSize: fontSize, height: 1.0);

Size computeArenaSize(double availableWidth, double availableHeight) {
  late final double arenaWidth;
  late final double arenaHeight;

  if (availableWidth / availableHeight > DESIGN_ASPECT_RATIO) {
    arenaHeight = availableHeight;
    arenaWidth = arenaHeight * DESIGN_ASPECT_RATIO;
  } else {
    arenaWidth = availableWidth;
    arenaHeight = arenaWidth / DESIGN_ASPECT_RATIO;
  }

  return Size(arenaWidth, arenaHeight);
}

class StatRow extends StatelessWidget {
  const StatRow({
    super.key,
    required this.label,
    required this.value,
    required this.style,
    required this.fontSize,
    this.valueSuffix = '',
    this.valueColor,
  });

  final String label;
  final String value;
  final String valueSuffix;
  final Color? valueColor;
  final TextStyle Function(double fontSize) style;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    final baseTextStyle = style(fontSize);

    return Row(
      children: [
        Expanded(child: Text(label, style: baseTextStyle)),
        Align(
          alignment: Alignment.centerRight,
          child: RichText(
            text: TextSpan(
              children: [
                TextSpan(
                  text: value,
                  style: baseTextStyle.copyWith(color: valueColor),
                ),
                TextSpan(text: valueSuffix, style: baseTextStyle),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class BattlePlatform extends StatelessWidget {
  const BattlePlatform({
    super.key,
    required this.baseSize,
    required this.containerWidth,
    required this.containerHeight,
    required this.platformAsset,
    required this.spriteAsset,
    required this.spriteWidth,
    required this.spriteHeight,
    required this.spriteBottom,
    required this.spriteOffset,
    required this.spriteMoveDuration,
    required this.spriteFilter,
    this.containerLeft,
    this.containerRight,
    this.containerTop,
    this.containerBottom,
  });

  final double baseSize;

  final double containerWidth;
  final double containerHeight;

  final double? containerLeft;
  final double? containerRight;
  final double? containerTop;
  final double? containerBottom;

  final String platformAsset;
  final String spriteAsset;

  final double spriteWidth;
  final double spriteHeight;
  final double spriteBottom;

  final Offset spriteOffset;
  final Duration spriteMoveDuration;
  final ColorFilter? spriteFilter;

  @override
  Widget build(BuildContext context) {
    final spriteImage = Image.asset(spriteAsset, fit: BoxFit.contain, filterQuality: FilterQuality.none, alignment: Alignment.bottomCenter);

    final spriteChild = (spriteFilter == null) ? spriteImage : ColorFiltered(colorFilter: spriteFilter!, child: spriteImage);

    return Positioned(
      left: containerLeft,
      right: containerRight,
      top: containerTop,
      bottom: containerBottom,
      width: containerWidth,
      height: containerHeight,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned.fill(
            child: Image.asset(platformAsset, fit: BoxFit.fitWidth, alignment: Alignment.bottomCenter, filterQuality: FilterQuality.none),
          ),
          AnimatedPositioned(
            duration: spriteMoveDuration,
            curve: Curves.easeInOut,
            left: (containerWidth - spriteWidth) / 2 + spriteOffset.dx,
            bottom: spriteBottom + spriteOffset.dy,
            width: spriteWidth,
            height: spriteHeight,
            child: spriteChild,
          ),
        ],
      ),
    );
  }
}

class BattleHudCard extends StatelessWidget {
  const BattleHudCard({
    super.key,
    required this.baseSize,
    required this.mirrored,
    required this.player,
    required this.opponent,
    required this.currentHp,
    required this.maxHp,
    required this.attackText,
    required this.style,
    required this.hudAsset,
    required this.hpBarFrameAsset,
  });

  final double baseSize;
  final bool mirrored;

  final PlayerData player;
  final PlayerData opponent;
  final int currentHp;
  final int maxHp;
  final String attackText;

  final TextStyle Function(double fontSize) style;

  final String hudAsset;
  final String hpBarFrameAsset;

  @override
  Widget build(BuildContext context) {
    final nameFont = baseSize * 0.035;
    final infoFont = baseSize * 0.03;

    final nameTop = baseSize * 0.02;
    final contentBottom = baseSize * 0.03;

    final nameLeft = baseSize * 0.045 * (mirrored ? 1.0 : 1.7);
    final hpRight = baseSize * 0.08 * (mirrored ? 1.0 : (1 / 1.7));
    final attackLeft = baseSize * 0.045 * (mirrored ? 1.0 : 1.7);

    final hpBarLeft = baseSize * 0.15 * (mirrored ? 1.0 : 1.2);
    final hpBarBottom = baseSize * 0.065;

    final hpBarWidth = baseSize * 0.27;
    final hpBarHeight = baseSize * 0.025;

    final isElementalMode = MatchService().matchData?.playData.isElementalMode ?? false;

    final playerElement = AVATAR_ELEMENT_TYPE_MAP[player.avatar];
    final opponentElement = AVATAR_ELEMENT_TYPE_MAP[opponent.avatar];

    final playerElementIcon = playerElement == null ? null : ELEMENTAL_TYPE_ICONS[playerElement];

    final hasAdvantage =
        playerElement != null && opponentElement != null && (ELEMENT_TYPE_ADVANTAGES[playerElement]?.contains(opponentElement) ?? false);

    return Stack(
      children: [
        Positioned.fill(
          child: Transform(
            alignment: Alignment.center,
            transform: Matrix4.rotationY(mirrored ? pi : 0),
            child: DecoratedBox(
              decoration: BoxDecoration(
                image: DecorationImage(
                  image: AssetImage(hudAsset),
                  fit: BoxFit.fill,
                  filterQuality: FilterQuality.none,
                  alignment: Alignment.bottomCenter,
                ),
              ),
            ),
          ),
        ),
        Positioned(
          top: nameTop,
          left: nameLeft,
          child: Row(
            spacing: baseSize * 0.01,
            children: [
              Text(player.name, style: style(nameFont)),
              if (isElementalMode && playerElementIcon != null)
                Image.asset(playerElementIcon, height: baseSize * 0.025, fit: BoxFit.fill, filterQuality: FilterQuality.none),
              if (isElementalMode && hasAdvantage)
                Image.asset(
                  'assets/images/menu/icons/combat/advantage-arrow.png',
                  height: baseSize * 0.025,
                  fit: BoxFit.fill,
                  filterQuality: FilterQuality.none,
                ),
            ],
          ),
        ),
        Positioned(
          bottom: contentBottom,
          right: hpRight,
          child: Text('$currentHp/$maxHp', style: style(nameFont)),
        ),
        Positioned(
          bottom: contentBottom,
          left: attackLeft,
          child: Text(attackText, style: style(infoFont)),
        ),
        Positioned(
          left: hpBarLeft,
          bottom: hpBarBottom,
          width: hpBarWidth,
          height: hpBarHeight,
          child: HpBar(baseSize: baseSize, currentHp: currentHp, maxHp: maxHp, frameAsset: hpBarFrameAsset),
        ),
      ],
    );
  }
}

class HpBar extends StatelessWidget {
  const HpBar({super.key, required this.baseSize, required this.currentHp, required this.maxHp, required this.frameAsset});

  final double baseSize;
  final int currentHp;
  final int maxHp;
  final String frameAsset;

  @override
  Widget build(BuildContext context) {
    final ratio = maxHp <= 0 ? 0.0 : (currentHp / maxHp).clamp(0.0, 1.0);

    final innerLeft = baseSize * 0.06;
    final innerWidth = baseSize * 0.205;

    final filledColor = (ratio > 0.75)
        ? HP_FULL_COLOR
        : (ratio > 0.4)
        ? HP_MID_COLOR
        : HP_LOW_COLOR;

    return Stack(
      children: [
        Positioned(
          left: innerLeft,
          top: 0,
          bottom: 0,
          width: innerWidth,
          child: ColoredBox(
            color: HP_EMPTY_COLOR,
            child: Align(
              alignment: Alignment.centerLeft,
              child: FractionallySizedBox(
                widthFactor: ratio,
                heightFactor: 1.0,
                child: ColoredBox(color: filledColor),
              ),
            ),
          ),
        ),
        Positioned.fill(
          child: Image.asset(frameAsset, fit: BoxFit.fill, filterQuality: FilterQuality.none),
        ),
      ],
    );
  }
}

class CombatFooterSection extends StatelessWidget {
  const CombatFooterSection({super.key, this.child});

  final Widget? child;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AspectRatio(
          aspectRatio: FOOTER_BORDER_ASPECT_RATIO,
          child: Image.asset(FOOTER_LEFT_BORDER_ASSET, fit: BoxFit.fill, filterQuality: FilterQuality.none),
        ),
        Expanded(
          child: DecoratedBox(
            decoration: const BoxDecoration(
              image: DecorationImage(image: AssetImage(FOOTER_BODY_ASSET), fit: BoxFit.fill, filterQuality: FilterQuality.none),
            ),
            child: child ?? const SizedBox.expand(),
          ),
        ),
        AspectRatio(
          aspectRatio: FOOTER_BORDER_ASPECT_RATIO,
          child: Transform.flip(
            flipX: true,
            child: Image.asset(FOOTER_LEFT_BORDER_ASSET, fit: BoxFit.fill, filterQuality: FilterQuality.none),
          ),
        ),
      ],
    );
  }
}

class CombatButtons extends StatelessWidget {
  const CombatButtons({
    super.key,
    required this.baseSize,
    required this.onAttack,
    required this.onRun,
    required this.runText,
    required this.attackTextStyle,
    required this.isSelfTurn,
    required this.currentEscapes,
  });

  final double baseSize;
  final VoidCallback onAttack;
  final VoidCallback onRun;
  final String runText;
  final TextStyle attackTextStyle;
  final bool isSelfTurn;
  final int currentEscapes;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Opacity(
          opacity: isSelfTurn ? 1.0 : 0.5,
          child: SizedBox(
            width: baseSize * 0.3,
            height: baseSize * 0.1,
            child: PressableBackground(
              backgroundAsset: BUTTON_ASSET,
              activeBackgroundAsset: BUTTON_ACTIVE_ASSET,
              onTap: isSelfTurn ? onAttack : () {},
              text: I18nService().translate(FOOTER_ATTACK_KEY),
              textStyle: attackTextStyle,
              activeTextStyle: attackTextStyle,
            ),
          ),
        ),
        SizedBox(width: baseSize * 0.03),
        Opacity(
          opacity: (isSelfTurn && currentEscapes > 0) ? 1.0 : 0.5,
          child: SizedBox(
            width: baseSize * 0.3,
            height: baseSize * 0.1,
            child: PressableBackground(
              backgroundAsset: BUTTON_ASSET,
              activeBackgroundAsset: BUTTON_ACTIVE_ASSET,
              onTap: (isSelfTurn && currentEscapes > 0) ? onRun : () {},
              text: runText,
              textStyle: attackTextStyle,
              activeTextStyle: attackTextStyle,
            ),
          ),
        ),
      ],
    );
  }
}

class CombatPlatformsLayer extends StatelessWidget {
  const CombatPlatformsLayer({
    super.key,
    required this.baseSize,
    required this.selfPlayer,
    required this.selfCombatData,
    required this.enemyPlayer,
    required this.enemyCombatData,
    required this.selfSprite,
    required this.enemySprite,
    required this.selfSpriteAsset,
    required this.enemySpriteAsset,
  });

  final double baseSize;
  final PlayerData selfPlayer;
  final PlayerCombatData selfCombatData;
  final PlayerData enemyPlayer;
  final PlayerCombatData enemyCombatData;

  final SpriteAnimator selfSprite;
  final SpriteAnimator enemySprite;

  final String selfSpriteAsset;
  final String enemySpriteAsset;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        BattlePlatform(
          baseSize: baseSize,
          containerLeft: baseSize * 0.07,
          containerBottom: 0,
          containerWidth: baseSize * 0.63,
          containerHeight: baseSize * 0.4,
          platformAsset: TILE_TYPE_TO_ASSET_PATH[selfCombatData.standingTile]!.selfPlatform,
          spriteAsset: selfSpriteAsset,
          spriteWidth: baseSize * 0.7,
          spriteHeight: baseSize * 0.7,
          spriteBottom: baseSize * -0.075,
          spriteOffset: selfSprite.offset,
          spriteMoveDuration: selfSprite.duration,
          spriteFilter: selfSprite.filter,
        ),
        BattlePlatform(
          baseSize: baseSize,
          containerRight: baseSize * 0.07,
          containerTop: baseSize * 0.05,
          containerWidth: baseSize * 0.63,
          containerHeight: baseSize * 0.4,
          platformAsset: TILE_TYPE_TO_ASSET_PATH[enemyCombatData.standingTile]!.enemyPlatform,
          spriteAsset: enemySpriteAsset,
          spriteWidth: baseSize * 0.45,
          spriteHeight: baseSize * 0.45,
          spriteBottom: baseSize * 0.06,
          spriteOffset: enemySprite.offset,
          spriteMoveDuration: enemySprite.duration,
          spriteFilter: enemySprite.filter,
        ),
      ],
    );
  }
}

class CombatHudLayer extends StatelessWidget {
  const CombatHudLayer({
    super.key,
    required this.baseSize,
    required this.selfPlayer,
    required this.selfCombatData,
    required this.enemyPlayer,
    required this.enemyCombatData,
    required this.selfRolledDiceText,
    required this.enemyRolledDiceText,
    required this.style,
  });

  final double baseSize;
  final PlayerData selfPlayer;
  final PlayerCombatData selfCombatData;
  final PlayerData enemyPlayer;
  final PlayerCombatData enemyCombatData;
  final String selfRolledDiceText;
  final String enemyRolledDiceText;

  final TextStyle Function(double fontSize) style;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned(
          top: baseSize * 0.1,
          left: baseSize * 0.17,
          width: baseSize * 0.50,
          height: baseSize * 0.15,
          child: BattleHudCard(
            baseSize: baseSize,
            mirrored: true,
            player: enemyPlayer,
            opponent: selfPlayer,
            currentHp: enemyCombatData.currentHealth,
            maxHp: enemyPlayer.health,
            attackText: enemyRolledDiceText,
            style: style,
            hudAsset: HUD_CONTAINER_ASSET,
            hpBarFrameAsset: HUD_HP_BAR_FRAME_ASSET,
          ),
        ),
        Positioned(
          bottom: 0,
          right: baseSize * 0.07,
          width: baseSize * 0.50,
          height: baseSize * 0.15,
          child: BattleHudCard(
            baseSize: baseSize,
            mirrored: false,
            player: selfPlayer,
            opponent: enemyPlayer,
            currentHp: selfCombatData.currentHealth,
            maxHp: selfPlayer.health,
            attackText: selfRolledDiceText,
            style: style,
            hudAsset: HUD_CONTAINER_ASSET,
            hpBarFrameAsset: HUD_HP_BAR_FRAME_ASSET,
          ),
        ),
      ],
    );
  }
}

class CombatTimer extends StatefulWidget {
  final double baseSize;
  final int maxTime;

  const CombatTimer({super.key, required this.baseSize, required this.maxTime});

  @override
  State<CombatTimer> createState() => _CombatTimerState();
}

class _CombatTimerState extends State<CombatTimer> with WidgetsBindingObserver {
  late int currentTime;
  Timer? _timer;
  DateTime? _countdownEndsAt;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    currentTime = widget.maxTime;
    _countdownEndsAt = DateTime.now().add(Duration(seconds: widget.maxTime));
    _startTimer();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _syncTimeWithWallClock();
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      _syncTimeWithWallClock();
    });

    _syncTimeWithWallClock();
  }

  void _syncTimeWithWallClock() {
    final countdownEndsAt = _countdownEndsAt;
    if (countdownEndsAt == null) return;

    final remaining = countdownEndsAt.difference(DateTime.now());
    final nextTime = remaining.isNegative ? 0 : ((remaining.inMilliseconds + 999) ~/ 1000);

    if (nextTime != currentTime) {
      setState(() {
        currentTime = nextTime;
      });
    }

    if (nextTime <= 0) {
      _timer?.cancel();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: widget.baseSize * 0.05,
      right: widget.baseSize * 0.05,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: widget.baseSize * 0.02, vertical: widget.baseSize * 0.01),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              MatchService().matchData!.playData.isDebugMode ? '${I18nService().translate(DEBUG_MODE_LABEL_KEY)} ' : '',
              style: pixelStyle(widget.baseSize * 0.05),
            ),
            Text('$currentTime/${widget.maxTime}', style: pixelStyle(widget.baseSize * 0.05)),
            SizedBox(width: widget.baseSize * 0.02),
            Image.asset(TIMER_ASSET, width: widget.baseSize * 0.05, height: widget.baseSize * 0.05, fit: BoxFit.contain),
          ],
        ),
      ),
    );
  }
}

class CombatSpectatorContent extends StatelessWidget {
  const CombatSpectatorContent({super.key, required this.baseSize, required this.player, required this.combatData});

  final double baseSize;
  final PlayerData player;
  final PlayerCombatData combatData;

  @override
  Widget build(BuildContext context) {
    final i18n = I18nService();
    final fontSize = baseSize * 0.03;

    combatStatColor(int statValue, {int threshold = 4}) {
      if (statValue > threshold) return Colors.green;
      if (statValue < threshold) return Colors.red;
      return FOOTER_TEXT_COLOR;
    }

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: baseSize * 0.015, vertical: baseSize * 0.01),
      child: Row(
        children: [
          SizedBox(
            height: baseSize * 0.15,
            width: baseSize * 0.15,
            child: DecoratedBox(
              decoration: BoxDecoration(
                image: DecorationImage(image: AssetImage(FOOTER_SPECTATE_ASSET), fit: BoxFit.fill, filterQuality: FilterQuality.none),
              ),
              child: Padding(
                padding: EdgeInsets.all(baseSize * 0.008),
                child: Image(image: profilePictureImageProvider(player.fullProfilePicture), fit: BoxFit.contain, filterQuality: FilterQuality.none),
              ),
            ),
          ),
          SizedBox(width: baseSize * 0.015),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(player.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: footerStyle(fontSize)),
                SizedBox(height: baseSize * 0.006),
                StatRow(
                  label: '${i18n.translate(FOOTER_ATTACK_STAT_LABEL_KEY)} (${player.attackDice.displayName()})',
                  value: '${combatData.attack}',
                  valueSuffix: '/4',
                  valueColor: combatStatColor(combatData.attack),
                  style: footerStyle,
                  fontSize: fontSize,
                ),
                SizedBox(height: baseSize * 0.006),
                StatRow(
                  label: '${i18n.translate(FOOTER_DEFENSE_STAT_LABEL_KEY)} (${player.defenseDice.displayName()})',
                  value: '${combatData.defense}',
                  valueSuffix: '/4',
                  valueColor: combatStatColor(combatData.defense),
                  style: footerStyle,
                  fontSize: fontSize,
                ),
                SizedBox(height: baseSize * 0.006),
                StatRow(
                  label: i18n.translate(FOOTER_SPEED_STAT_LABEL_KEY),
                  value: '${player.speed}/${player.speed}',
                  style: footerStyle,
                  fontSize: fontSize,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
