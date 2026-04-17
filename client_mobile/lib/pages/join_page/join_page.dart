import 'dart:math';

import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/models/socket_event.dart';
import 'package:client_mobile/pages/home_page/home_page.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/navigation_service/navigation_service.dart';
import 'package:client_mobile/services/preferences_service/preferences_service.dart';
import 'package:client_mobile/services/socket_service/socket_service.dart';
import 'package:client_mobile/services/user_service/user_service.dart';
import 'package:client_mobile/widgets/chat/chat.dart';
import 'package:client_mobile/widgets/game_cards_shell/game_cards_shell.dart';
import 'package:client_mobile/widgets/header/header.dart';
import 'package:client_mobile/widgets/join_code_popup/join_code_popup.dart';
import 'package:client_mobile/widgets/poke_button/poke_button.dart';
import 'package:client_mobile/widgets/stripe_painter/stripe_painter.dart';
import 'package:flutter/material.dart';

import 'join_page_const.dart';

class JoinPage extends StatefulWidget {
  const JoinPage({super.key});

  @override
  State<JoinPage> createState() => _JoinPageState();
}

class _JoinPageState extends State<JoinPage> {
  final SocketService socketService = SocketService();

  final TextEditingController codeController = TextEditingController();

  static List<MatchData> _cachedMatches = const [];

  String matchCode = '';
  bool isCodeInputDisplayed = false;
  List<MatchData> availableMatches = _cachedMatches;

  void _openOverlay() => setState(() => isCodeInputDisplayed = true);

  void _closeOverlay() => setState(() => isCodeInputDisplayed = false);

  @override
  void initState() {
    super.initState();

    socketService.emit(JoinPageEvent.JoinRoom.value);
    socketService.socket.on(JoinPageEvent.UpdateMatchList.value, (payload) {
      final matches = ((payload as List?) ?? const []).cast<Map>().map((e) => MatchData.fromJson(e.cast<String, dynamic>())).toList();
      _cachedMatches = matches;
      if (!mounted) {
        return;
      }
      setState(() {
        availableMatches = matches;
      });
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (UserService().currentUser.value != null) {
        AudioService().playBackgroundMusic(PreferencesService().getEquippedMenuMusicPath());
      }
    });
  }

  @override
  void dispose() {
    socketService.emit(JoinPageEvent.LeaveRoom.value);
    socketService.socket.off(JoinPageEvent.UpdateMatchList.value);
    codeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final i18n = I18nService();
    final mediaSize = MediaQuery.of(context).size;
    final screenWidth = mediaSize.width;
    final screenHeight = mediaSize.height;

    late final double baseWidth;
    late final double baseHeight;

    if (screenWidth / screenHeight > JOIN_PAGE_DESIGN_ASPECT_RATIO) {
      baseHeight = screenHeight;
      baseWidth = baseHeight * JOIN_PAGE_DESIGN_ASPECT_RATIO;
    } else {
      baseWidth = screenWidth;
      baseHeight = baseWidth / JOIN_PAGE_DESIGN_ASPECT_RATIO;
    }

    final baseSize = min(baseWidth, baseHeight);
    final outerBorderWidth = baseSize * 0.02;
    final innerBorderWidth = baseSize * 0.02;

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
                  text: i18n.translate(JOIN_PAGE_HEADER_TEXT),
                  onTap: () => NavigationService().navigateAndReplace((_) => const HomePage()),
                ),
              ),
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: JOIN_PAGE_OUTER_BORDER_COLOR, width: outerBorderWidth),
                  ),
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: JOIN_PAGE_INNER_BORDER_COLOR, width: innerBorderWidth),
                    ),
                    child: CustomPaint(
                      painter: StripePainter(stripeSize: baseSize * 0.02, color1: JOIN_PAGE_STRIPE_COLOR_1, color2: JOIN_PAGE_STRIPE_COLOR_2),
                      child: ClipRect(
                        child: GameCardsPageShell(
                          games: availableMatches.map((match) => match.gameData).toList(),
                          isCreateCard: false,
                          matches: availableMatches,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          Positioned(
            right: baseSize * 0.06,
            bottom: baseSize * 0.06,
            width: baseSize * 0.42,
            height: baseSize * 0.15,
            child: PokeButton(text: i18n.translate(JOIN_PAGE_FLOATING_BUTTON_TEXT), onTap: _openOverlay),
          ),
          if (isCodeInputDisplayed)
            Positioned.fill(
              child: JoinCodePopup(baseSize: baseSize, controller: codeController, onClose: _closeOverlay),
            ),
          Positioned(
            bottom: baseWidth * 0.035 + MediaQuery.of(context).viewInsets.bottom * 0.95,
            left: baseWidth * 0.035,
            child: Container(
              alignment: Alignment.bottomLeft,
              width: baseSize * 0.8,
              height: baseSize * 0.5,
              child: Chat(baseSize: baseSize * 0.1),
            ),
          ),
        ],
      ),
    );
  }
}
