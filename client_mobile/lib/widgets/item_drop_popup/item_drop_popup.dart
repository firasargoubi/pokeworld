import 'dart:math';
import 'dart:ui';

import 'package:client_mobile/models/item_type.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/services/play_service/play_service.dart';
import 'package:client_mobile/widgets/poke_button/poke_button.dart';
import 'package:flutter/material.dart';

import 'item_drop_popup_const.dart';

class ItemDropPopup extends StatefulWidget {
  const ItemDropPopup({super.key, required this.controller, required this.onClose, this.initialIsAggressive = true});

  final TextEditingController controller;
  final VoidCallback onClose;
  final bool initialIsAggressive;

  @override
  State<ItemDropPopup> createState() => _ItemDropPopupState();
}

class _ItemDropPopupState extends State<ItemDropPopup> {
  List<ItemType> get items => MatchService().selfPlayer!.items;
  int selectedIndex = 2;

  TextStyle _pixelTextStyle(double fontSize) => TextStyle(
    fontFamily: FONT_FAMILY,
    color: Colors.white,
    fontSize: fontSize,
    decoration: TextDecoration.none,
    height: 0.9,
    shadows: [Shadow(offset: Offset(fontSize * 0.10, 0), blurRadius: 0, color: SHADOW_COLOR)],
  );

  double _computeBaseSize(Size screenSize) {
    final screenWidth = screenSize.width;
    final screenHeight = screenSize.height;

    late final double baseWidth;
    late final double baseHeight;

    if (screenWidth / screenHeight > DESIGN_ASPECT_RATIO) {
      baseHeight = screenHeight;
      baseWidth = baseHeight * DESIGN_ASPECT_RATIO;
    } else {
      baseWidth = screenWidth;
      baseHeight = baseWidth / DESIGN_ASPECT_RATIO;
    }

    return min(baseWidth, baseHeight);
  }

  void _select(int index) {
    if (selectedIndex == index) return;
    setState(() => selectedIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final baseSize = _computeBaseSize(MediaQuery.of(context).size);

    final dialogHeight = baseSize * 0.55;
    final dialogWidth = dialogHeight * 172 / 84;
    final contentPadding = baseSize * 0.055;

    final titleStyle = _pixelTextStyle(baseSize * 0.05);

    return Stack(
      children: [
        Positioned.fill(
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: BLUR_SIGMA, sigmaY: BLUR_SIGMA),
              child: Container(color: Colors.black.withValues(alpha: OVERLAY_ALPHA)),
            ),
          ),
        ),
        Center(
          child: Listener(
            behavior: HitTestBehavior.opaque,
            onPointerDown: (_) {},
            child: SizedBox(
              height: dialogHeight,
              width: dialogWidth,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Image.asset(CONTAINER_ASSET, fit: BoxFit.fill, filterQuality: FilterQuality.none),
                  Padding(
                    padding: EdgeInsets.all(contentPadding),
                    child: Column(
                      children: [
                        Expanded(
                          flex: 2,
                          child: Center(child: Text(TITLE_TEXT, style: titleStyle)),
                        ),
                        Expanded(
                          flex: 4,
                          child: LayoutBuilder(
                            builder: (context, constraints) {
                              final double squareSize = constraints.maxHeight * 0.9;
                              return Center(
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: List.generate(
                                    3,
                                    (index) => GestureDetector(
                                      behavior: HitTestBehavior.opaque,
                                      onTap: () => _select(index),
                                      child: Container(
                                        width: squareSize,
                                        height: squareSize,
                                        margin: EdgeInsets.symmetric(horizontal: squareSize * 0.3),
                                        child: Stack(
                                          alignment: Alignment.center,
                                          children: [
                                            if (index == selectedIndex)
                                              Image.asset(
                                                SELECTION_ASSET,
                                                width: squareSize,
                                                height: squareSize,
                                                fit: BoxFit.contain,
                                                filterQuality: FilterQuality.none,
                                              ),
                                            Image.asset(
                                              items[index].assetPath,
                                              width: squareSize * 0.8,
                                              height: squareSize * 0.8,
                                              fit: BoxFit.contain,
                                              filterQuality: FilterQuality.none,
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                        Expanded(
                          flex: 3,
                          child: Center(
                            child: SizedBox(
                              width: baseSize * 0.4,
                              height: baseSize * 0.20,
                              child: PokeButton(text: ADD_BUTTON_TEXT, onTap: () => PlayService().dropItem(items[selectedIndex])),
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
        ),
      ],
    );
  }
}
