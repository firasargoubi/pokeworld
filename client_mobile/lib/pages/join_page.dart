import 'dart:math';

import 'package:client_mobile/consts/ui.dart';
import 'package:client_mobile/models/game_data.dart';
import 'package:client_mobile/services/game_save.dart';
import 'package:client_mobile/widgets/chat/chat.dart';
import 'package:client_mobile/widgets/game_cards_shell.dart';
import 'package:client_mobile/widgets/header.dart';
import 'package:client_mobile/widgets/join_code_popup.dart';
import 'package:client_mobile/widgets/poke_button.dart';
import 'package:client_mobile/widgets/stripe_painter.dart';
import 'package:flutter/material.dart';

class JoinPage extends StatefulWidget {
  const JoinPage({super.key});

  @override
  State<JoinPage> createState() => _JoinPageState();
}

class _JoinPageState extends State<JoinPage> {
  static const double designAspectRatio = JOIN_CREATE_PAGE_ASPECT_RATIO;

  static const String headerText = 'Joindre Partie';
  static const String floatingButtonText = 'REJOINDRE';

  static const Color outerBorderColor = Color(0xFF636776);
  static const Color innerBorderColor = Color(0xFFe9f6f7);

  static const Color stripeColor1 = Color(0xFF93d7eb);
  static const Color stripeColor2 = Color(0xFFace6f6);

  late final Future<List<GameData>> gamesFuture = GameSaveService.getAllGames();

  final TextEditingController codeController = TextEditingController();
  bool showOverlay = false;

  void _openOverlay() => setState(() => showOverlay = true);
  void _closeOverlay() => setState(() => showOverlay = false);

  @override
  void dispose() {
    codeController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final mediaSize = MediaQuery.of(context).size;
    final screenWidth = mediaSize.width;
    final screenHeight = mediaSize.height;

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
                child: AppHeader(index: 1, text: headerText, onTap: () => Navigator.pop(context)),
              ),
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: outerBorderColor, width: outerBorderWidth),
                  ),
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: innerBorderColor, width: innerBorderWidth),
                    ),
                    child: CustomPaint(
                      painter: StripePainter(stripeSize: baseSize * 0.02, color1: stripeColor1, color2: stripeColor2),
                      child: ClipRect(
                        child: FutureBuilder<List<GameData>>(
                          future: gamesFuture,
                          builder: (context, snapshot) {
                            final games = snapshot.data ?? const <GameData>[];
                            return GameCardsPageShell(games: games, isCreateCard: false);
                          },
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
            child: PokeButton(text: floatingButtonText, onTap: _openOverlay),
          ),
          if (showOverlay)
            Positioned.fill(
              child: JoinCodePopup(baseSize: baseSize, controller: codeController, onClose: _closeOverlay),
            ),
          _buildBottomLeftChat(baseWidth, baseSize),
        ],
      ),
    );
  }

  Widget _buildBottomLeftChat(double baseWidth, double baseSize) {
    final keyboardHeight = MediaQuery.of(context).viewInsets.bottom * 0.95;

    return Positioned(
      bottom: baseWidth * 0.035 + keyboardHeight,
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
