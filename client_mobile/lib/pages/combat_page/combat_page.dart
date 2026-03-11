import 'dart:async';
import 'dart:math';

import 'package:client_mobile/consts/avatar_data_const.dart';
import 'package:client_mobile/models/avatar_data.dart';
import 'package:client_mobile/models/item_type.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/models/player_data.dart';
import 'package:client_mobile/services/combat_service/combat_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/widgets/chat/chat.dart';
import 'package:client_mobile/widgets/stripe_painter/stripe_painter.dart';
import 'package:flutter/material.dart';

import 'combat_page_const.dart';
import 'combat_page_widgets.dart';

class CombatPage extends StatefulWidget {
  const CombatPage({super.key});

  @override
  State<CombatPage> createState() => _CombatPageState();
}

class _CombatPageState extends State<CombatPage> {
  final SpriteAnimator selfSprite = SpriteAnimator();
  final SpriteAnimator enemySprite = SpriteAnimator();

  late PlayerData selfPlayer;
  late PlayerCombatData selfCombatData;
  late PlayerData enemyPlayer;
  late PlayerCombatData enemyCombatData;

  String selfRolledDiceText = '';
  String enemyRolledDiceText = '';
  late bool isSelfTurn;

  late int maxTime;
  late String _timerKey;

  bool? _lastAnimatedTurnFlag;
  bool _readyForAnimations = false;

  double _baseSize = 100.0;
  StreamSubscription? _matchSubscription;

  @override
  void initState() {
    super.initState();
    _syncFromService();

    _lastAnimatedTurnFlag = MatchService().matchData!.combatData.isSecondPlayerTurn;
    _timerKey = UniqueKey().toString();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _readyForAnimations = true;
    });

    _matchSubscription = MatchService().matchUpdates.listen((_) {
      if (!mounted) return;

      final rawCombat = MatchService().matchData!.combatData;
      final newMatchState = MatchService().matchData!.state;

      final prevSelfHealth = selfCombatData.currentHealth;
      final prevEnemyHealth = enemyCombatData.currentHealth;

      final attackerPlayerIndex = rawCombat.playersCombatData[rawCombat.isSecondPlayerTurn ? 0 : 1].playerIndex;
      final selfWasAttacker = attackerPlayerIndex == MatchService().selfIndex;

      setState(() {
        _syncFromService();
        _updateDiceText(selfWasAttacker, rawCombat);
        _updateAnimations(
          newMatchState: newMatchState,
          prevSelfHealth: prevSelfHealth,
          prevEnemyHealth: prevEnemyHealth,
          selfWasAttacker: selfWasAttacker,
          action: rawCombat.lastCombatAction,
          turnFlag: rawCombat.isSecondPlayerTurn,
        );
      });
    });
  }

  @override
  void dispose() {
    _matchSubscription?.cancel();
    super.dispose();
  }

  void _syncFromService() {
    final matchData = MatchService().matchData!;
    final combatData = matchData.combatData;
    selfPlayer = MatchService().selfPlayer!;
    maxTime = combatData.turnDuration;

    final first = combatData.playersCombatData[0];
    final second = combatData.playersCombatData[1];

    if (first.playerIndex == MatchService().selfIndex) {
      selfCombatData = first;
      enemyCombatData = second;
      enemyPlayer = matchData.players[second.playerIndex];
      isSelfTurn = !combatData.isSecondPlayerTurn;
    } else {
      selfCombatData = second;
      enemyCombatData = first;
      enemyPlayer = matchData.players[first.playerIndex];
      isSelfTurn = combatData.isSecondPlayerTurn;
    }
  }

  String computeGif(bool isSelf, Avatar avatar) {
    if (isSelf) {
      if (selfPlayer.items.contains(ItemType.Item6)) {
        return AVATAR_DATA[Avatar.MissingNo]!.backGif;
      }
      return AVATAR_DATA[avatar]!.backGif;
    } else {
      if (enemyPlayer.items.contains(ItemType.Item6)) {
        return AVATAR_DATA[Avatar.MissingNo]!.frontGif;
      }
      return AVATAR_DATA[avatar]!.frontGif;
    }
  }

  void _updateDiceText(bool selfWasAttacker, CombatData rawCombat) {
    final action = rawCombat.lastCombatAction;
    if (action != CombatAction.SuccessAttack && action != CombatAction.FailAttack) return;

    final attackRoll = rawCombat.lastRolledAttack;
    final defenseRoll = rawCombat.lastRolledDefense;

    if (selfWasAttacker) {
      selfRolledDiceText = 'Dé attaque: +$attackRoll';
      enemyRolledDiceText = 'Dé défense: +$defenseRoll';
    } else {
      selfRolledDiceText = 'Dé défense: +$defenseRoll';
      enemyRolledDiceText = 'Dé attaque: +$attackRoll';
    }
  }

  void _updateAnimations({
    required MatchState newMatchState,
    required int prevSelfHealth,
    required int prevEnemyHealth,
    required bool selfWasAttacker,
    required CombatAction action,
    required bool turnFlag,
  }) {
    if (!_readyForAnimations) return;

    setState(() {
      _timerKey = UniqueKey().toString();
    });

    if (newMatchState == MatchState.CombatAnimation && _lastAnimatedTurnFlag != turnFlag) {
      _lastAnimatedTurnFlag = turnFlag;

      if (action == CombatAction.SuccessAttack || action == CombatAction.FailAttack) {
        final attacker = selfWasAttacker ? selfSprite : enemySprite;
        final defender = selfWasAttacker ? enemySprite : selfSprite;

        if (action == CombatAction.SuccessAttack) {
          _playAttack(attacker);
          _playHit(defender);
        } else {
          _playAttack(attacker);
        }
      } else if (action == CombatAction.SuccessEscape) {
        final escaper = selfWasAttacker ? selfSprite : enemySprite;
        _playEscape(escaper);
      }
    }

    if (prevSelfHealth > 0 && selfCombatData.currentHealth <= 0) {
      _playDeath(selfSprite);
    }
    if (prevEnemyHealth > 0 && enemyCombatData.currentHealth <= 0) {
      _playDeath(enemySprite);
    }
  }

  void _rebuild() {
    if (mounted) setState(() {});
  }

  void _playAttack(SpriteAnimator sprite) {
    final isSelf = sprite == selfSprite;
    sprite.translate(
      dx: (isSelf ? SELF_ATTACK_FACTOR_X : ENEMY_ATTACK_FACTOR_X) * _baseSize,
      dy: (isSelf ? SELF_ATTACK_FACTOR_Y : ENEMY_ATTACK_FACTOR_Y) * _baseSize,
      duration: ATTACK_ANIMATION_DURATION,
      onChanged: _rebuild,
    );
  }

  void _playHit(SpriteAnimator sprite) {
    final isSelf = sprite == selfSprite;
    sprite.translate(
      dx: (isSelf ? SELF_HIT_FACTOR_X : ENEMY_HIT_FACTOR_X) * _baseSize,
      dy: (isSelf ? SELF_HIT_FACTOR_Y : ENEMY_HIT_FACTOR_Y) * _baseSize,
      duration: ATTACK_ANIMATION_DURATION,
      onChanged: _rebuild,
    );
    sprite.setFilter(color: HIT_COLOR, resetAfter: ATTACK_ANIMATION_DURATION, opacity: 1.0, onChanged: _rebuild);
  }

  void _playDeath(SpriteAnimator sprite) {
    sprite.translate(dx: 0, dy: DEATH_FACTOR_Y * _baseSize, duration: DEATH_ANIMATION_DURATION, onChanged: _rebuild);
    sprite.setFilter(color: DEATH_TINT_COLOR, resetAfter: DEATH_ANIMATION_DURATION, opacity: 0.1, onChanged: _rebuild);
  }

  void _playEscape(SpriteAnimator sprite) {
    final isSelf = sprite == selfSprite;
    sprite.translate(
      dx: (isSelf ? SELF_ESCAPE_FACTOR_X : ENEMY_ESCAPE_FACTOR_X) * _baseSize,
      dy: 0,
      duration: ESCAPE_ANIMATION_DURATION,
      onChanged: _rebuild,
    );
    sprite.setFilter(color: ESCAPE_TINT_COLOR, resetAfter: ESCAPE_ANIMATION_DURATION, opacity: 0.1, onChanged: _rebuild);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: LayoutBuilder(
        builder: (context, constraints) {
          final arenaSize = computeArenaSize(constraints.maxWidth, constraints.maxHeight);
          final baseSize = min(arenaSize.width, arenaSize.height);
          _baseSize = baseSize;

          final footerHeight = baseSize * 0.25;
          final footerPadding = baseSize * 0.01;
          final footerGap = baseSize * 0.02;
          final footerStatFont = baseSize * 0.035;
          final bottomBgHeight = ((constraints.maxHeight - arenaSize.height) / 2) + footerHeight;

          return Stack(
            children: [
              Positioned.fill(
                child: Column(
                  children: [
                    Expanded(
                      child: CustomPaint(
                        painter: StripePainter(
                          stripeSize: baseSize * 0.05,
                          stripeSize2: baseSize * 0.01,
                          color1: const Color(0xFFddf3de),
                          color2: const Color(0xFFe0f6e1),
                        ),
                        child: const SizedBox.expand(),
                      ),
                    ),
                    SizedBox(
                      height: bottomBgHeight,
                      width: double.infinity,
                      child: const ColoredBox(color: FOOTER_COLOR),
                    ),
                  ],
                ),
              ),
              Center(
                child: SizedBox(
                  width: arenaSize.width,
                  height: arenaSize.height,
                  child: Column(
                    children: [
                      Expanded(
                        child: Stack(
                          children: [
                            CombatPlatformsLayer(
                              baseSize: baseSize,
                              selfPlayer: selfPlayer,
                              selfCombatData: selfCombatData,
                              enemyPlayer: enemyPlayer,
                              enemyCombatData: enemyCombatData,
                              selfSprite: selfSprite,
                              enemySprite: enemySprite,
                              selfSpriteAsset: computeGif(true, selfPlayer.avatar),
                              enemySpriteAsset: computeGif(false, enemyPlayer.avatar),
                            ),
                            CombatHudLayer(
                              baseSize: baseSize,
                              selfPlayer: selfPlayer,
                              selfCombatData: selfCombatData,
                              enemyPlayer: enemyPlayer,
                              enemyCombatData: enemyCombatData,
                              selfRolledDiceText: selfRolledDiceText,
                              enemyRolledDiceText: enemyRolledDiceText,
                              style: pixelStyle,
                            ),
                            CombatTimer(key: ValueKey(_timerKey), baseSize: baseSize, maxTime: (maxTime / 1000).toInt()),
                          ],
                        ),
                      ),
                      Container(
                        height: footerHeight,
                        width: double.infinity,
                        color: FOOTER_COLOR,
                        padding: EdgeInsets.all(footerPadding),
                        child: Row(
                          children: [
                            Expanded(
                              flex: 4,
                              child: CombatFooterSection(
                                child: CombatButtons(
                                  baseSize: baseSize,
                                  onAttack: CombatService().attack,
                                  onRun: CombatService().escape,
                                  runText: '$FOOTER_RUN_TEXT ${selfCombatData.currentEscapes}/${selfCombatData.maxEscapes}',
                                  attackTextStyle: pixelStyle(baseSize * 0.05),
                                  isSelfTurn: isSelfTurn,
                                  currentEscapes: selfCombatData.currentEscapes,
                                ),
                              ),
                            ),
                            SizedBox(width: footerGap),
                            Expanded(
                              flex: 3,
                              child: CombatFooterSection(
                                child: Padding(
                                  padding: EdgeInsets.symmetric(horizontal: baseSize * 0.01, vertical: baseSize * 0.01),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      StatRow(
                                        label: '$FOOTER_ATTACK_STAT_LABEL (${selfPlayer.attackDice.displayName()})',
                                        value: '${selfCombatData.attack}/4',
                                        style: footerStyle,
                                        fontSize: footerStatFont,
                                      ),
                                      SizedBox(height: baseSize * 0.01),
                                      StatRow(
                                        label: '$FOOTER_DEFENSE_STAT_LABEL (${selfPlayer.defenseDice.displayName()})',
                                        value: '${selfCombatData.defense}/4',
                                        style: footerStyle,
                                        fontSize: footerStatFont,
                                      ),
                                      SizedBox(height: baseSize * 0.01),
                                      StatRow(
                                        label: FOOTER_SPEED_STAT_LABEL,
                                        value: '${selfPlayer.speed}/${selfPlayer.speed}',
                                        style: footerStyle,
                                        fontSize: footerStatFont,
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
                  ),
                ),
              ),
              Builder(
                builder: (context) {
                  final keyboardHeight = MediaQuery.of(context).viewInsets.bottom + baseSize * 0.02;
                  final naturalBottom = ((constraints.maxHeight - arenaSize.height) / 2) + footerHeight + baseSize * 0.02;

                  return Positioned(
                    bottom: max(naturalBottom, keyboardHeight),
                    left: (constraints.maxWidth - arenaSize.width) / 2,
                    width: arenaSize.width * 0.45,
                    height: baseSize * 0.4,
                    child: Opacity(opacity: 0.95, child: Chat(baseSize: baseSize * 0.1, showMatchChannel: true)),
                  );
                },
              ),
            ],
          );
        },
      ),
    );
  }
}
