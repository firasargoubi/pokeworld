import 'dart:async';
import 'dart:math';

import 'package:client_mobile/consts/avatar_data_const.dart';
import 'package:client_mobile/controllers/character_controller.dart';
import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/models/avatar_data.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/models/popup_message.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/services/popup_service/popup_service.dart';
import 'package:client_mobile/widgets/chat/chat.dart';
import 'package:client_mobile/widgets/header/header.dart';
import 'package:client_mobile/widgets/pressable_background/pressable_background.dart';
import 'package:client_mobile/widgets/stripe_painter/stripe_painter.dart';
import 'package:flutter/material.dart';

import 'character_page_const.dart';
import 'character_page_widgets.dart';

class CharacterPage extends StatefulWidget {
  const CharacterPage({super.key});

  @override
  State<CharacterPage> createState() => _CharacterPageState();
}

class _CharacterPageState extends State<CharacterPage> {
  Avatar? selectedAvatar;
  List<Avatar> lockedAvatars = [];
  final MatchService _matchService = MatchService();
  final PopupService _popupService = PopupService();
  final CharacterController _controller = CharacterController();
  StreamSubscription<MatchData>? _matchUpdateSubscription;

  bool isHpBonusActive = true;
  bool isAttD6Active = true;

  @override
  void initState() {
    super.initState();
    _updateAvatarList();
    _matchUpdateSubscription = _matchService.matchUpdates.listen(_onMatchUpdate);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      AudioService().playBackgroundMusic(BackgroundMusic.Menu.path);
    });
  }

  @override
  void dispose() {
    _matchUpdateSubscription?.cancel();
    super.dispose();
  }

  void _onMatchUpdate(MatchData matchData) {
    _updateAvatarList();
  }

  void _updateAvatarList() {
    final matchData = _matchService.matchData;
    if (matchData == null) return;

    final selfPlayer = _matchService.selfPlayer;
    if (selfPlayer == null) return;

    setState(() {
      selectedAvatar = selfPlayer.avatar;

      // Lock avatars selected by other players
      lockedAvatars = matchData.players.where((p) => p.id != selfPlayer.id).map((p) => p.avatar).toList();
    });
  }

  bool isAvatarLocked(Avatar avatar) => lockedAvatars.contains(avatar);

  void selectAvatar(Avatar avatar) {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    if (isAvatarLocked(avatar)) return;
    if (selectedAvatar == avatar) return;

    _controller.changeAvatar(avatar);
    setState(() => selectedAvatar = avatar);
  }

  void toggleHpVitBonus() {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    setState(() => isHpBonusActive = !isHpBonusActive);
  }

  void toggleAttackDefenseDie() {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    setState(() => isAttD6Active = !isAttD6Active);
  }

  void joinLobby() {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    _controller.joinLobby(
      isHpBonusActive: isHpBonusActive,
      isAttD6Active: isAttD6Active,
      selectedAvatar: selectedAvatar,
      onWarnings: (warnings) {
        _popupService.showPopup(PopupMessage(message: warnings.join('\n'), hasCloseButton: true, isConfirmation: false));
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final mediaSize = MediaQuery.of(context).size;
    final screenWidth = mediaSize.width;
    final screenHeight = mediaSize.height;

    late final double baseWidth;
    late final double baseHeight;

    if (screenWidth / screenHeight > DESIGN_ASPECT_RATIO) {
      baseHeight = screenHeight;
      baseWidth = baseHeight * DESIGN_ASPECT_RATIO;
    } else {
      baseWidth = screenWidth;
      baseHeight = baseWidth / DESIGN_ASPECT_RATIO;
    }

    final baseSize = min(baseWidth, baseHeight);

    final outerBorderWidth = baseSize * 0.015;
    final innerBorderWidth = baseSize * 0.015;

    final avatarDatas = AVATAR_DATA.values.toList();

    final hpOpacity = isHpBonusActive ? 1.0 : INACTIVE_STAT_OPACITY;
    final vitOpacity = isHpBonusActive ? INACTIVE_STAT_OPACITY : 1.0;

    final hpBottomText = isHpBonusActive ? STAT_HP_BOTTOM_BOOSTED_TEXT : STAT_HP_BOTTOM_BASE_TEXT;
    final vitBottomText = isHpBonusActive ? STAT_VIT_BOTTOM_BASE_TEXT : STAT_VIT_BOTTOM_BOOSTED_TEXT;

    final selectedAvatarData = selectedAvatar == null ? null : AVATAR_DATA[selectedAvatar!];

    final attackIconAsset = isAttD6Active ? D6_ICON_ASSET : D4_ICON_ASSET;
    final defenseIconAsset = isAttD6Active ? D4_ICON_ASSET : D6_ICON_ASSET;

    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          Column(
            children: [
              SizedBox(
                height: baseSize * 0.1,
                width: double.infinity,
                child: AppHeader(
                  index: 1,
                  text: HEADER_TEXT,
                  onTap: () {
                    _popupService.showPopup(
                      PopupMessage(message: PopupMessages.Quit.message, isConfirmation: true, action: () => MatchService().leaveMatch()),
                    );
                  },
                ),
              ),
              Expanded(
                child: SizedBox(
                  width: double.infinity,
                  child: Row(
                    children: [
                      // ================= LEFT SIDE =================
                      Expanded(
                        child: Column(
                          children: [
                            // Top left panel (avatar + username)
                            SizedBox(
                              height: baseSize * 0.2,
                              width: double.infinity,
                              child: BorderedBox(
                                outerWidth: outerBorderWidth,
                                innerWidth: innerBorderWidth,
                                outerBorderColor: OUTER_BORDER_COLOR,
                                innerBorderColor: INNER_BORDER_COLOR,
                                child: LayoutBuilder(
                                  builder: (context, constraints) {
                                    final height = constraints.maxHeight;

                                    final gap = height * 0.12;
                                    final fontSize = height * 0.4;

                                    final style = pixelTextStyle(
                                      fontFamily: PIXEL_FONT,
                                      shadowColor: SHADOW_COLOR,
                                      fontSize: fontSize,
                                      height: 0.9,
                                      letterSpacing: fontSize * 0.15,
                                      shadowOffsetX: fontSize * 0.10,
                                    );

                                    return Container(
                                      color: PSEUDO_PANEL_COLOR,
                                      child: Row(
                                        crossAxisAlignment: CrossAxisAlignment.center,
                                        children: [
                                          SizedBox(
                                            width: height,
                                            height: height,
                                            child: Container(
                                              color: PSEUDO_AVATAR_PLACEHOLDER_COLOR,
                                              child: selectedAvatarData == null
                                                  ? null
                                                  : Padding(
                                                      padding: EdgeInsets.all(height * 0.08),
                                                      child: Image.asset(
                                                        selectedAvatarData.image,
                                                        fit: BoxFit.contain,
                                                        filterQuality: FilterQuality.none,
                                                      ),
                                                    ),
                                            ),
                                          ),
                                          SizedBox(width: gap),
                                          Expanded(
                                            child: Align(
                                              alignment: Alignment.centerLeft,
                                              child: Padding(
                                                padding: EdgeInsets.only(left: gap),
                                                child: Stack(
                                                  clipBehavior: Clip.none,
                                                  children: [
                                                    Text(
                                                      '_' * _controller.getUsername().length,
                                                      style: style.copyWith(height: 3),
                                                      maxLines: 1,
                                                      softWrap: false,
                                                      overflow: TextOverflow.clip,
                                                    ),
                                                    Text(
                                                      _controller.getUsername(),
                                                      style: style.copyWith(height: 2.5),
                                                      maxLines: 1,
                                                      overflow: TextOverflow.ellipsis,
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  },
                                ),
                              ),
                            ),

                            // Bottom left panel (stats)
                            Expanded(
                              child: SizedBox(
                                width: double.infinity,
                                child: BorderedBox(
                                  outerWidth: outerBorderWidth,
                                  innerWidth: innerBorderWidth,
                                  outerBorderColor: OUTER_BORDER_COLOR,
                                  innerBorderColor: INNER_BORDER_COLOR,
                                  showOuterTop: false,
                                  child: CustomPaint(
                                    painter: StripePainter(stripeSize: baseSize * 0.02, color1: LEFT_STRIPE_COLOR_1, color2: LEFT_STRIPE_COLOR_2),
                                    child: CharacterStatsPanel(
                                      baseSize: baseSize,
                                      hpOpacity: hpOpacity,
                                      vitOpacity: vitOpacity,
                                      hpBottomText: hpBottomText,
                                      vitBottomText: vitBottomText,
                                      attackIconAsset: attackIconAsset,
                                      defenseIconAsset: defenseIconAsset,
                                      onToggleHpVit: toggleHpVitBonus,
                                      onToggleAtkDef: toggleAttackDefenseDie,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // ================= RIGHT SIDE =================
                      SizedBox(
                        width: baseSize * 0.5,
                        child: BorderedBox(
                          outerWidth: outerBorderWidth,
                          innerWidth: innerBorderWidth,
                          outerBorderColor: OUTER_BORDER_COLOR,
                          innerBorderColor: INNER_BORDER_COLOR,
                          showOuterLeft: false,
                          child: CustomPaint(
                            painter: StripePainter(stripeSize: baseSize * 0.02, color1: RIGHT_STRIPE_COLOR_1, color2: RIGHT_STRIPE_COLOR_2),
                            child: CharacterAvatarGrid(
                              baseSize: baseSize,
                              avatarDatas: avatarDatas,
                              selectedAvatar: selectedAvatar,
                              isAvatarLocked: isAvatarLocked,
                              onSelectAvatar: selectAvatar,
                              selectFrameAsset: SELECT_FRAME_ASSET,
                              disabledAvatarOpacity: DISABLED_AVATAR_OPACITY,
                              grayScaleFilter: grayScaleColorFilter(),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // ================= BOTTOM BUTTON =================
              SizedBox(
                height: baseSize * 0.15,
                width: double.infinity,
                child: Container(
                  color: OUTER_BORDER_COLOR,
                  alignment: Alignment.center,
                  child: SizedBox(
                    width: baseSize * 0.3,
                    height: baseSize * 0.1,
                    child: PressableBackground(
                      backgroundAsset: START_GAME_BUTTON_ASSET,
                      activeBackgroundAsset: START_GAME_BUTTON_ACTIVE_ASSET,
                      onTap: joinLobby,
                      text: START_GAME_TEXT,
                      textStyle: pixelTextStyle(
                        fontFamily: PIXEL_FONT,
                        shadowColor: SHADOW_COLOR,
                        fontSize: baseSize * 0.04,
                        height: 1.0,
                        letterSpacing: baseSize * 0.003,
                        shadowOffsetX: baseSize * 0.004,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          _buildBottomLeftChat(baseWidth, baseSize),
        ],
      ),
    );
  }

  Widget _buildBottomLeftChat(double baseWidth, double baseSize) {
    final keyboardHeight = MediaQuery.of(context).viewInsets.bottom * 0.97;

    return Positioned(
      bottom: baseWidth * 0.015 + keyboardHeight,
      left: baseWidth * 0.035,
      child: Container(
        alignment: Alignment.bottomLeft,
        width: baseSize * 0.8,
        height: baseSize * 0.5,
        child: Chat(baseSize: baseSize * 0.1),
      ),
    );
  }
}
