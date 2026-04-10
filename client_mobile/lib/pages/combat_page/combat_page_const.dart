import 'package:flutter/material.dart';

const double DESIGN_ASPECT_RATIO = 100 / 70;

const String BUTTON_ASSET = 'assets/images/menu/containers/combat/button-container.png';
const String BUTTON_ACTIVE_ASSET = 'assets/images/menu/containers/combat/button-container-active.png';

const String HUD_CONTAINER_ASSET = 'assets/images/menu/containers/combat/battle-player.png';
const String HUD_HP_BAR_FRAME_ASSET = 'assets/images/menu/containers/combat/hp-bar.png';

const String TIMER_ASSET = 'assets/images/menu/icons/combat/timer.gif';

const Color PIXEL_TEXT_COLOR = Color(0xFF585851);
const Color FOOTER_TEXT_COLOR = Color(0xFF464641);
const Color FOOTER_SUB_TEXT_COLOR = Color(0xFFf9f9f9);
const String PIXEL_FONT = 'Pixel';

const Color FOOTER_COLOR = Color(0xFF283030);

const String FOOTER_ATTACK_KEY = 'pages.combat.attack';
const String FOOTER_RUN_KEY = 'pages.combat.escape';

const String FOOTER_ATTACK_STAT_LABEL_KEY = 'pages.combat.attackStat';
const String FOOTER_DEFENSE_STAT_LABEL_KEY = 'pages.combat.defenseStat';
const String FOOTER_SPEED_STAT_LABEL_KEY = 'pages.combat.speed';

const String COMBAT_ATTACK_ROLL_LABEL_KEY = 'pages.combat.diceAttack';
const String COMBAT_DEFENSE_ROLL_LABEL_KEY = 'pages.combat.diceDefense';

const String DEBUG_MODE_LABEL_KEY = 'DEBUG';

const Duration ATTACK_ANIMATION_DURATION = Duration(milliseconds: 180);
const Duration DEATH_ANIMATION_DURATION = Duration(milliseconds: 4000);
const Duration ESCAPE_ANIMATION_DURATION = Duration(milliseconds: 2000);

const double SELF_ATTACK_FACTOR_X = 0.04;
const double SELF_ATTACK_FACTOR_Y = 0.04;
const double ENEMY_ATTACK_FACTOR_X = -0.04;
const double ENEMY_ATTACK_FACTOR_Y = -0.03;

const double SELF_HIT_FACTOR_X = -0.02;
const double SELF_HIT_FACTOR_Y = -0.02;
const double ENEMY_HIT_FACTOR_X = 0.02;
const double ENEMY_HIT_FACTOR_Y = 0.015;

const double DEATH_FACTOR_Y = -2;

const double SELF_ESCAPE_FACTOR_X = -1.5;
const double ENEMY_ESCAPE_FACTOR_X = 1.5;

const Color HIT_COLOR = Color(0xFFEC7067);
const Color DEATH_TINT_COLOR = Color(0xFF000000);
const Color ESCAPE_TINT_COLOR = Color(0xFF000000);

const String FOOTER_LEFT_BORDER_ASSET = 'assets/images/menu/containers/combat/combat-container-left-border.png';
const String FOOTER_BODY_ASSET = 'assets/images/menu/containers/combat/combat-container-body.png';
const String FOOTER_SPECTATE_ASSET = 'assets/images/menu/containers/combat/spectate-container.png';
const String QUIT_BUTTON_LEFT_EDGE_ASSET = 'assets/images/menu/containers/user-card/button-delete-edge-1.png';
const String QUIT_BUTTON_RIGHT_EDGE_ASSET = 'assets/images/menu/containers/user-card/button-delete-edge-2.png';
const String QUIT_BUTTON_BODY_ASSET = 'assets/images/menu/containers/user-card/button-delete-body.png';
const String QUIT_BUTTON_ICON_ASSET = 'assets/images/menu/icons/user-card/logout.png';
const double FOOTER_BORDER_ASPECT_RATIO = 10 / 88;

const Color HP_EMPTY_COLOR = Color(0xFF727272);
const Color HP_FULL_COLOR = Color(0xFF50d16c);
const Color HP_MID_COLOR = Color.fromARGB(255, 236, 174, 40);
const Color HP_LOW_COLOR = Color(0xFFEC7067);
