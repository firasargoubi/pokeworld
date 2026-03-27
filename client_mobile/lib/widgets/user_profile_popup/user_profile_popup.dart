import 'dart:math' as math;

import 'package:client_mobile/consts/login_const.dart';
import 'package:client_mobile/models/menu_config.dart';
import 'package:client_mobile/models/social.dart';
import 'package:client_mobile/models/ui.dart';
import 'package:client_mobile/models/user_info.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/user_service/user_service.dart';
import 'package:client_mobile/utils/profile_image_provider.dart';
import 'package:client_mobile/widgets/cut_corner_container/cut_corner_container.dart';
import 'package:client_mobile/widgets/edge_body_button/edge_body_button.dart';
import 'package:client_mobile/widgets/stat_container/stat_container.dart';
import 'package:client_mobile/widgets/user_profile_popup/user_profile_popup_friends_card/user_profile_popup_friends_controller.dart';
import 'package:client_mobile/widgets/user_profile_popup/user_profile_popup_profile_card/user_profile_popup_profile_controller.dart';
import 'package:client_mobile/widgets/user_profile_popup/user_profile_popup_settings_card/user_profile_popup_settings_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';

part 'user_profile_popup_const.dart';
part 'user_profile_popup_friends_card/user_profile_popup_friends_card.dart';
part 'user_profile_popup_friends_card/user_profile_popup_friends_card_widgets.dart';
part 'user_profile_popup_inventory_card/user_profile_popup_inventory_card.dart';
part 'user_profile_popup_profile_card/user_profile_popup_profile_card.dart';
part 'user_profile_popup_settings_card/user_profile_popup_settings_card.dart';
part 'user_profile_popup_widgets.dart';

Future<void> showUserCardPopup(BuildContext context) {
  return showDialog(
    context: context,
    barrierDismissible: true,
    barrierColor: Colors.black54,
    builder: (_) => const Material(
      type: MaterialType.transparency,
      child: Center(child: UserCard()),
    ),
  );
}

class UserCard extends StatefulWidget {
  const UserCard({super.key});

  @override
  State<UserCard> createState() => _UserCardState();
}

class _UserCardState extends State<UserCard> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late Animation<double> _rotateXAnimation;
  late Animation<double> _rotateYAnimation;

  UserCardView _currentView = UserCardView.front;
  UserCardView _targetView = UserCardView.front;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(vsync: this, duration: CARD_ANIMATION_DURATION);
    _configureAnimations(fromX: 0, toX: 0, fromY: 0, toY: 0);
    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        setState(() {
          _currentView = _targetView;
        });
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _configureAnimations({required double fromX, required double toX, required double fromY, required double toY}) {
    final Animation<double> curvedAnimation = CurvedAnimation(parent: _controller, curve: CARD_ANIMATION_CURVE);
    _rotateXAnimation = Tween<double>(begin: fromX, end: toX).animate(curvedAnimation);
    _rotateYAnimation = Tween<double>(begin: fromY, end: toY).animate(curvedAnimation);
  }

  double _rotationYFor(UserCardView view) {
    switch (view) {
      case UserCardView.front:
        return 0;
      case UserCardView.settings:
        return math.pi;
      case UserCardView.friends:
        return -math.pi;
      case UserCardView.inventory:
        return -math.pi;
    }
  }

  double _rotationXFor(UserCardView view) {
    if (view == UserCardView.front) return 0;
    return CARD_TILT_ANGLE;
  }

  UserCardView get _visibleBackView {
    if (_targetView == UserCardView.front) return _currentView;
    return _targetView;
  }

  void _animateTo(UserCardView view) {
    final double fromX = _rotateXAnimation.value;
    final double fromY = _rotateYAnimation.value;
    final double toX = _rotationXFor(view);
    final double toY = _rotationYFor(view);

    setState(() {
      _targetView = view;
      _configureAnimations(fromX: fromX, toX: toX, fromY: fromY, toY: toY);
      _controller
        ..stop()
        ..reset();
    });

    _controller.forward();
  }

  void _showFront() => _animateTo(UserCardView.front);
  void _showSettings() => _animateTo(UserCardView.settings);
  void _showFriends() => _animateTo(UserCardView.friends);
  void _showInventory() => _animateTo(UserCardView.inventory);

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final double keyboardHeight = MediaQuery.of(context).viewInsets.bottom;
        final double screenWidth = constraints.maxWidth;
        final double screenHeight = constraints.maxHeight - keyboardHeight;

        late final double baseWidth;
        late final double baseHeight;

        if (screenWidth / screenHeight > ASPECT_RATIO) {
          baseHeight = screenHeight;
          baseWidth = baseHeight * ASPECT_RATIO;
        } else {
          baseWidth = screenWidth;
          baseHeight = baseWidth / ASPECT_RATIO;
        }

        final double baseSize = math.min(baseWidth, baseHeight);
        final double cardWidth = baseSize * 1.1;
        final double cardHeight = baseSize * 0.9;
        final double verticalBleed = baseSize * 0.03;
        final double perspective = 1 / (cardWidth * 6);

        return Padding(
          padding: EdgeInsets.only(bottom: keyboardHeight),
          child: SizedBox(
            width: cardWidth,
            height: cardHeight + (verticalBleed * 2),
            child: Padding(
              padding: EdgeInsets.symmetric(vertical: verticalBleed),
              child: AnimatedBuilder(
                animation: _controller,
                builder: (BuildContext context, Widget? child) {
                  final double rotationY = _rotateYAnimation.value;
                  final bool showFrontFace = rotationY.abs() < (math.pi / 2);

                  return Transform(
                    alignment: Alignment.center,
                    transform: Matrix4.identity()
                      ..setEntry(3, 2, perspective)
                      ..rotateX(_rotateXAnimation.value)
                      ..rotateY(rotationY),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        IgnorePointer(
                          ignoring: !showFrontFace,
                          child: Opacity(
                            opacity: showFrontFace ? 1 : 0,
                            child: _FrontCardFace(
                              baseSize: baseSize,
                              onShowSettings: _showSettings,
                              onShowFriends: _showFriends,
                              onShowInventory: _showInventory,
                            ),
                          ),
                        ),
                        IgnorePointer(
                          ignoring: showFrontFace,
                          child: Opacity(
                            opacity: showFrontFace ? 0 : 1,
                            child: Transform(
                              alignment: Alignment.center,
                              transform: Matrix4.identity()..rotateY(math.pi),
                              child: _BackCardFace(
                                baseSize: baseSize,
                                view: _visibleBackView,
                                onBackToFront: _showFront,
                                settingsCard: _SettingsCardFace(baseSize: baseSize, onBackToFront: _showFront),
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
        );
      },
    );
  }
}

class _FrontCardFace extends StatelessWidget {
  const _FrontCardFace({required this.baseSize, required this.onShowSettings, required this.onShowFriends, required this.onShowInventory});

  final double baseSize;
  final VoidCallback onShowSettings;
  final VoidCallback onShowFriends;
  final VoidCallback onShowInventory;

  @override
  Widget build(BuildContext context) {
    return FramedContainer(
      style: USER_CARD_STYLE,
      baseSize: baseSize * 0.09,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(
            top: -baseSize * 0.022,
            left: -baseSize * 0.019,
            child: Image.asset(ASSET_CARD_ICON_BG, height: baseSize * 0.6, fit: BoxFit.contain, filterQuality: FilterQuality.none),
          ),
          _ProfileCardFace(baseSize: baseSize, onShowSettings: onShowSettings, onShowFriends: onShowFriends, onShowInventory: onShowInventory),
        ],
      ),
    );
  }
}

class _BackCardFace extends StatelessWidget {
  const _BackCardFace({required this.baseSize, required this.view, required this.onBackToFront, required this.settingsCard});

  final double baseSize;
  final UserCardView view;
  final VoidCallback onBackToFront;
  final Widget settingsCard;

  @override
  Widget build(BuildContext context) {
    return FramedContainer(
      style: USER_CARD_STYLE,
      baseSize: baseSize * 0.09,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(
            top: -baseSize * 0.022,
            left: -baseSize * 0.019,
            child: Image.asset(ASSET_CARD_ICON_BG, height: baseSize * 0.6, fit: BoxFit.contain, filterQuality: FilterQuality.none),
          ),
          Center(
            child: switch (view) {
              UserCardView.settings => settingsCard,
              UserCardView.friends => _FriendsCardFace(baseSize: baseSize, onBackToFront: onBackToFront),
              UserCardView.inventory => _InventoryCardFace(baseSize: baseSize, onBackToFront: onBackToFront),
              UserCardView.front => Container(),
            },
          ),
        ],
      ),
    );
  }
}
