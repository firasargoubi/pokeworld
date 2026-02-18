import 'dart:math';

import 'package:client_mobile/models/game_data.dart';
import 'package:client_mobile/services/game_save.dart';
import 'package:client_mobile/widgets/game_cards_shell.dart';
import 'package:client_mobile/widgets/header.dart';
import 'package:client_mobile/widgets/stripe_painter.dart';
import 'package:flutter/material.dart';

class CreatePage extends StatefulWidget {
  const CreatePage({super.key});

  @override
  State<CreatePage> createState() => _CreatePageState();
}

class _CreatePageState extends State<CreatePage> {
  static const double designAspectRatio = 2000 / 1400;

  static const String headerText = 'Créer Partie';

  static const Color outerBorderColor = Color(0xFF636776);
  static const Color innerBorderColor = Color(0xFFe9f6f7);

  static const Color stripeColor1 = Color(0xFFeee7ab);
  static const Color stripeColor2 = Color(0xFFe6da9b);

  late final Future<List<GameData>> gamesFuture = GameSaveService.getAllGames();

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
      body: Column(
        children: [
          SizedBox(
            height: baseSize * 0.1,
            width: double.infinity,
            child: AppHeader(
              index: 1,
              text: headerText,
              onTap: () => Navigator.pop(context),
            ),
          ),
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                border: Border.all(
                  color: outerBorderColor,
                  width: outerBorderWidth,
                ),
              ),
              child: Container(
                decoration: BoxDecoration(
                  border: Border.all(
                    color: innerBorderColor,
                    width: innerBorderWidth,
                  ),
                ),
                child: CustomPaint(
                  painter: StripePainter(
                    stripeSize: baseSize * 0.02,
                    color1: stripeColor1,
                    color2: stripeColor2,
                  ),
                  child: ClipRect(
                    child: FutureBuilder<List<GameData>>(
                      future: gamesFuture,
                      builder: (context, snapshot) {
                        final games = snapshot.data ?? const <GameData>[];
                        return GameCardsPageShell(
                          games: games,
                          isCreateCard: true,
                        );
                      },
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
