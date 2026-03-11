import 'dart:math';

import 'package:client_mobile/models/game_data.dart';
import 'package:client_mobile/services/game_save/game_save.dart';
import 'package:client_mobile/widgets/chat/chat.dart';
import 'package:client_mobile/widgets/game_cards_shell/game_cards_shell.dart';
import 'package:client_mobile/widgets/header/header.dart';
import 'package:client_mobile/widgets/stripe_painter/stripe_painter.dart';
import 'package:flutter/material.dart';

import 'create_page_const.dart';

class CreatePage extends StatefulWidget {
  const CreatePage({super.key});

  @override
  State<CreatePage> createState() => _CreatePageState();
}

class _CreatePageState extends State<CreatePage> {
  late final Future<List<GameData>> gamesFuture = GameSaveService.getAllGames();

  @override
  Widget build(BuildContext context) {
    final mediaSize = MediaQuery.of(context).size;
    final screenWidth = mediaSize.width;
    final screenHeight = mediaSize.height;

    late final double baseWidth;
    late final double baseHeight;

    if (screenWidth / screenHeight > CREATE_PAGE_DESIGN_ASPECT_RATIO) {
      baseHeight = screenHeight;
      baseWidth = baseHeight * CREATE_PAGE_DESIGN_ASPECT_RATIO;
    } else {
      baseWidth = screenWidth;
      baseHeight = baseWidth / CREATE_PAGE_DESIGN_ASPECT_RATIO;
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
                child: AppHeader(index: 1, text: CREATE_PAGE_HEADER_TEXT, onTap: () => Navigator.pop(context)),
              ),
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: CREATE_PAGE_OUTER_BORDER_COLOR, width: outerBorderWidth),
                  ),
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: CREATE_PAGE_INNER_BORDER_COLOR, width: innerBorderWidth),
                    ),
                    child: CustomPaint(
                      painter: StripePainter(stripeSize: baseSize * 0.02, color1: CREATE_PAGE_STRIPE_COLOR_1, color2: CREATE_PAGE_STRIPE_COLOR_2),
                      child: ClipRect(
                        child: FutureBuilder<List<GameData>>(
                          future: gamesFuture,
                          builder: (context, snapshot) {
                            final games = snapshot.data ?? const <GameData>[];
                            return GestureDetector(child: GameCardsPageShell(games: games, isCreateCard: true));
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
