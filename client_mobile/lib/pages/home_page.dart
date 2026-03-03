import 'dart:math';
import 'dart:ui';

import 'package:client_mobile/consts/menu_card_data.dart';
import 'package:client_mobile/consts/ui.dart';
import 'package:client_mobile/models/menu_config.dart';
import 'package:client_mobile/pages/join_page.dart';
import 'package:client_mobile/services/chat_service.dart';
import 'package:client_mobile/services/user_service.dart';
import 'package:client_mobile/widgets/chat.dart';
import 'package:client_mobile/widgets/login_popup.dart';
import 'package:client_mobile/widgets/menu_card.dart';
import 'package:client_mobile/widgets/user_popup.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import './create_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  bool _didShowLoginPopup = false;
  bool _isSettingsPressed = false;

  static const String _bgAsset = 'assets/images/menu/backgrounds/main-menu.png';
  static const String _logoAsset = 'assets/images/menu/logos/main-logo.png';
  static const String _settingsIconAsset = 'assets/images/menu/icons/settings/settings.svg';
  static const String _settingsBtnAsset = 'assets/images/menu/buttons/setting/grayButton.png';
  static const String _settingsBtnActiveAsset = 'assets/images/menu/buttons/setting/grayButtonActive.png';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _maybeShowLoginPopup());
  }

  void _maybeShowLoginPopup() {
    if (!mounted) return;
    final isLoggedIn = UserService().currentUser.value != null;
    if (!isLoggedIn && !_didShowLoginPopup) {
      _didShowLoginPopup = true;
      _showLoginPopup();
    }
  }

  void _showLoginPopup() {
    if (!mounted) return;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return PopScope(canPop: false, onPopInvokedWithResult: (didPop, result) {}, child: const LoginPopup());
      },
    );
  }

  void _showUserPopup() {
    if (!mounted) return;
    showDialog(context: context, barrierDismissible: true, builder: (context) => const UserPopup());
  }

  void _setSettingsPressed(bool pressed) {
    setState(() => _isSettingsPressed = pressed);
  }

  Future<void> _push(Widget page) async {
    ChatService().stopListeningToMotion();
    await Navigator.of(context).push(MaterialPageRoute(builder: (_) => page));
    if (!mounted) return;
    ChatService().startListeningToMotion();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          _buildBlurredBackground(),
          LayoutBuilder(
            builder: (context, constraints) {
              final screenWidth = constraints.maxWidth;
              final screenHeight = constraints.maxHeight;

              late final double designAspectRatio = HOME_PAGE_ASPECT_RATIO;
              late final double baseWidth;
              late final double baseHeight;

              if (screenWidth / screenHeight > designAspectRatio) {
                baseHeight = screenHeight;
                baseWidth = baseHeight * designAspectRatio;
              } else {
                baseWidth = screenWidth;
                baseHeight = baseWidth / designAspectRatio;
              }

              final baseSize = min(baseWidth, baseHeight);

              return Center(
                child: SizedBox(
                  width: baseWidth,
                  height: baseHeight,
                  child: Stack(
                    children: [
                      Column(children: [_buildTopSection(baseSize), _buildMiddleSection(baseSize)]),
                      _buildBottomLeftChat(baseWidth, baseSize),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildBlurredBackground() {
    return Positioned.fill(
      child: ImageFiltered(
        imageFilter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
        child: Image.asset(_bgAsset, fit: BoxFit.cover, filterQuality: FilterQuality.none),
      ),
    );
  }

  Widget _buildTopSection(double baseSize) {
    return Expanded(
      flex: 2,
      child: SizedBox(
        width: double.infinity,
        child: Row(children: [_buildSettingsButton(baseSize), _buildLogoAndTeam(baseSize), _buildMembersList(baseSize)]),
      ),
    );
  }

  Widget _buildSettingsButton(double baseSize) {
    return Expanded(
      flex: 10,
      child: SizedBox(
        height: double.infinity,
        child: Align(
          alignment: Alignment.topCenter,
          child: Padding(
            padding: EdgeInsets.only(top: baseSize * 0.05, left: baseSize * 0.02),
            child: GestureDetector(
              onTap: _showUserPopup,
              onTapDown: (_) => _setSettingsPressed(true),
              onTapUp: (_) => _setSettingsPressed(false),
              onTapCancel: () => _setSettingsPressed(false),
              child: Container(
                width: baseSize * 0.12,
                height: baseSize * 0.12,
                decoration: BoxDecoration(
                  image: DecorationImage(
                    image: AssetImage(_isSettingsPressed ? _settingsBtnActiveAsset : _settingsBtnAsset),
                    fit: BoxFit.cover,
                    filterQuality: FilterQuality.none,
                    alignment: Alignment.center,
                  ),
                ),
                child: Center(
                  child: SvgPicture.asset(
                    _settingsIconAsset,
                    width: baseSize * 0.06,
                    height: baseSize * 0.06,
                    colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLogoAndTeam(double baseSize) {
    return Expanded(
      flex: 60,
      child: SizedBox(
        height: double.infinity,
        child: Stack(
          children: [
            Positioned(
              top: baseSize * 0.07,
              left: baseSize * 0.05,
              child: Transform.rotate(
                angle: -0.1,
                child: Image.asset(_logoAsset, filterQuality: FilterQuality.high, fit: BoxFit.contain, width: baseSize * 0.7),
              ),
            ),
            Positioned(
              top: baseSize * 0.16,
              right: baseSize * 0.12,
              child: Transform.rotate(
                angle: -0.3,
                child: Text(
                  'Equipe #110',
                  style: TextStyle(
                    fontFamily: 'Pixel',
                    color: Colors.white,
                    fontSize: baseSize * 0.06,
                    shadows: [Shadow(offset: Offset(baseSize * 0.005, 0), color: const Color(0xFF787878), blurRadius: 0)],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMembersList(double baseSize) {
    return Expanded(
      flex: 35,
      child: SizedBox(
        height: double.infinity,
        child: Padding(
          padding: EdgeInsets.all(baseSize * 0.02),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(MEMBERS_NAMES.length, (index) => _buildMemberRow(baseSize, index)),
          ),
        ),
      ),
    );
  }

  Widget _buildMemberRow(double baseSize, int index) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Flexible(
          child: Text(
            MEMBERS_NAMES[index],
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontFamily: 'Pixel',
              color: Colors.white,
              fontSize: baseSize * 0.04,
              height: 0.8,
              shadows: [Shadow(offset: Offset(baseSize * 0.003, 0), color: const Color(0xFF787878), blurRadius: 0)],
            ),
          ),
        ),
        SizedBox(width: baseSize * 0.01),
        Container(
          width: baseSize * 0.04,
          height: baseSize * 0.04,
          decoration: BoxDecoration(
            image: DecorationImage(
              image: AssetImage('assets/images/menu/pokemons/chibi/${MEMBERS_CHIBIS[index]}.png'),
              fit: BoxFit.contain,
              filterQuality: FilterQuality.none,
              alignment: Alignment.center,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMiddleSection(double baseSize) {
    return Expanded(
      flex: 3,
      child: SizedBox(
        width: double.infinity,
        child: Builder(
          builder: (context) {
            final gap = baseSize * 0.055;
            final size = baseSize * 0.6 * 0.9;

            return Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                MenuCard(size: size, color: MenuCardColor.blue, title: 'Rejoindre \nPartie', onTap: () => _push(const JoinPage())),
                SizedBox(width: gap),
                MenuCard(size: size, color: MenuCardColor.orange, title: 'Créer \nPartie', onTap: () => _push(const CreatePage())),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildBottomLeftChat(double baseWidth, double baseSize) {
    return Positioned(
      bottom: baseWidth * 0.01,
      left: baseWidth * 0.01,
      child: Container(
        alignment: Alignment.bottomLeft,
        width: baseSize * 0.8,
        height: baseSize * 0.6,
        child: Chat(baseSize: baseSize * 0.15),
      ),
    );
  }
}
