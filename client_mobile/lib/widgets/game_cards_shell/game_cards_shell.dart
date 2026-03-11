import 'dart:math';

import 'package:client_mobile/models/game_data.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/widgets/game_card/game_card.dart';
import 'package:flutter/material.dart';

import 'game_cards_shell_const.dart';

class GameCardsPageShell extends StatefulWidget {
  const GameCardsPageShell({super.key, required this.games, required this.isCreateCard});

  final List<GameData> games;
  final bool isCreateCard;

  @override
  State<GameCardsPageShell> createState() => _GameCardsPageShellState();
}

class _GameCardsPageShellState extends State<GameCardsPageShell> {
  int? openIndex;
  late List<LayerLink> links = _makeLinks(widget.games.length);
  late final MatchService matchService = MatchService();

  static List<LayerLink> _makeLinks(int length) {
    return List.generate(length, (_) => LayerLink());
  }

  @override
  void didUpdateWidget(covariant GameCardsPageShell oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (oldWidget.games.length != widget.games.length) {
      links = _makeLinks(widget.games.length);
      if (openIndex != null && openIndex! >= widget.games.length) {
        openIndex = null;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final availableWidth = constraints.maxWidth;
        final availableHeight = constraints.maxHeight;

        final baseSize = min(availableWidth, availableHeight);
        final gap = baseSize * GAME_CARDS_SHELL_GAP_FACTOR;
        final desiredCardWidth = baseSize * GAME_CARDS_SHELL_CARD_WIDTH_FACTOR;

        final maxCardWidth = (availableWidth - (GAME_CARDS_SHELL_COLUMNS - 1) * gap) / GAME_CARDS_SHELL_COLUMNS;
        final cardWidth = min(desiredCardWidth, maxCardWidth);

        final cardHeight = cardWidth * (96 / 79);
        final descriptionPanelWidth = cardWidth * 0.55;

        final rows = (widget.games.length / GAME_CARDS_SHELL_COLUMNS).ceil();
        final totalGridHeight = rows * cardHeight + (rows - 1) * gap;

        final horizontalPadding = max(0, (availableWidth - (GAME_CARDS_SHELL_COLUMNS * cardWidth) - (GAME_CARDS_SHELL_COLUMNS - 1) * gap) / 2);

        final fitsVertically = totalGridHeight <= availableHeight;

        final gridPadding = widget.isCreateCard
            ? EdgeInsets.symmetric(horizontal: horizontalPadding.toDouble(), vertical: fitsVertically ? 0 : gap)
            : EdgeInsets.fromLTRB(horizontalPadding.toDouble(), gap * 2, horizontalPadding.toDouble(), gap * 6);

        return GestureDetector(
          behavior: HitTestBehavior.translucent,
          onTap: () {
            if (openIndex != null) {
              setState(() => openIndex = null);
            }
          },
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              GridView.builder(
                itemCount: widget.games.length,
                clipBehavior: Clip.none,
                shrinkWrap: fitsVertically,
                physics: fitsVertically ? const NeverScrollableScrollPhysics() : const BouncingScrollPhysics(),
                padding: gridPadding,
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: GAME_CARDS_SHELL_COLUMNS,
                  crossAxisSpacing: gap,
                  mainAxisSpacing: gap,
                  childAspectRatio: 79 / 96,
                ),
                itemBuilder: (context, index) {
                  final game = widget.games[index];

                  return CompositedTransformTarget(
                    link: links[index],
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        GameCard(
                          key: ValueKey(game.id),
                          isCreateCard: widget.isCreateCard,
                          game: game,
                          onTap: () {
                            matchService.createMatch(game);
                          },
                        ),
                        Align(
                          alignment: Alignment.topCenter,
                          child: FractionallySizedBox(
                            widthFactor: 1.0,
                            heightFactor: 0.65,
                            child: GestureDetector(
                              behavior: HitTestBehavior.opaque,
                              onTap: () {
                                setState(() {
                                  openIndex = openIndex == index ? null : index;
                                });
                              },
                              child: Container(),
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
              Positioned.fill(
                child: IgnorePointer(
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: List.generate(widget.games.length, (index) {
                      final isOpen = openIndex == index;

                      return CompositedTransformFollower(
                        link: links[index],
                        showWhenUnlinked: false,
                        offset: Offset.zero,
                        child: SizedBox(
                          width: cardWidth + descriptionPanelWidth,
                          height: cardHeight,
                          child: ClipRect(
                            clipper: RightOnlyClipper(cardWidth: cardWidth, panelWidth: descriptionPanelWidth),
                            child: Stack(
                              clipBehavior: Clip.none,
                              children: [
                                AnimatedPositioned(
                                  duration: const Duration(milliseconds: GAME_CARDS_SHELL_DESCRIPTION_ANIMATION_DURATION_MS),
                                  curve: Curves.easeOut,
                                  left: isOpen ? cardWidth : cardWidth - descriptionPanelWidth,
                                  bottom: 0,
                                  width: descriptionPanelWidth,
                                  height: cardHeight * 0.978,
                                  child: Stack(
                                    clipBehavior: Clip.none,
                                    children: [
                                      Positioned.fill(
                                        child: Image.asset(GAME_CARDS_SHELL_DESCRIPTION_ASSET, fit: BoxFit.fill, filterQuality: FilterQuality.none),
                                      ),
                                      Positioned(
                                        left: descriptionPanelWidth * 0.25,
                                        top: cardHeight * 0.17,
                                        width: descriptionPanelWidth * 0.63,
                                        height: cardHeight * 0.68,
                                        child: Align(
                                          alignment: Alignment.topLeft,
                                          child: Text(
                                            widget.games[index].description,
                                            style: TextStyle(
                                              color: Colors.black,
                                              fontSize: descriptionPanelWidth * 0.12,
                                              fontFamily: GAME_CARDS_SHELL_PIXEL_FONT,
                                              height: descriptionPanelWidth * 0.005,
                                            ),
                                            textAlign: TextAlign.left,
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
                      );
                    }),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class RightOnlyClipper extends CustomClipper<Rect> {
  const RightOnlyClipper({required this.cardWidth, required this.panelWidth});

  final double cardWidth;
  final double panelWidth;

  @override
  Rect getClip(Size size) {
    return Rect.fromLTWH(cardWidth, 0, panelWidth, size.height);
  }

  @override
  bool shouldReclip(covariant RightOnlyClipper oldClipper) {
    return oldClipper.cardWidth != cardWidth || oldClipper.panelWidth != panelWidth;
  }
}
